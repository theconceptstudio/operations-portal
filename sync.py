#!/usr/bin/env python3
"""
Operations Portal — Sync Notion -> Supabase (mirror).
Legge da Notion (Fornitori&Rubrica, Appartamenti, Database Pulizie, Issues Table)
e fa upsert nelle tabelle op_* di Supabase. Notion resta la fonte di verita'.

Eseguibile a mano (`python3 sync.py`) o da cron Vercel/Supabase.
Segreti via env; fallback config_local.py (gitignored) per il locale.
"""
import os, sys, time, hashlib, datetime
import requests
import storico as storico_mod

# ── Config ────────────────────────────────────────────────────────────────
NOTION_TOKEN = os.environ.get('NOTION_TOKEN')
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')
TOKEN_SECRET = os.environ.get('TOKEN_SECRET')  # per generare i token operatore stabili
if not NOTION_TOKEN:
    try:
        import config_local as _c
        NOTION_TOKEN = getattr(_c, 'NOTION_TOKEN', None)
        SUPABASE_URL = SUPABASE_URL or getattr(_c, 'SUPABASE_URL', None)
        SUPABASE_KEY = SUPABASE_KEY or getattr(_c, 'SUPABASE_KEY', None)
        TOKEN_SECRET = TOKEN_SECRET or getattr(_c, 'TOKEN_SECRET', None)
    except Exception:
        pass
TOKEN_SECRET = TOKEN_SECRET or 'tcs-operations-portal'

# ── Notion DB ids ───────────────────────────────────────────────────────────
DB_FORNITORI    = '3289ef82-3d96-8099-8ece-db7b91f4c51f'
DB_APPARTAMENTI = '3059ef82-3d96-8011-af2f-f61755aebaa2'
DB_PULIZIE      = '31b9ef82-3d96-8016-9f3a-ce9fbc36d24b'
DB_ISSUES       = '3069ef82-3d96-80db-ba50-c1f3d8374fd3'
DB_TASKS        = '32e9ef82-3d96-8045-afb6-f15ee2d76139'

STATI_ISSUE_CHIUSI = {'Fatto', 'Impossibile completare', 'Intervento non piu necessario',
                      'Intervento non più necessario'}

_session = requests.Session()
N_HEADERS = {'Authorization': f'Bearer {NOTION_TOKEN}', 'Notion-Version': '2022-06-28',
             'Content-Type': 'application/json'}

# ── Notion helpers ──────────────────────────────────────────────────────────
def n_query(db_id, filter_body=None):
    out, cursor = [], None
    while True:
        body = {'page_size': 100}
        if filter_body: body['filter'] = filter_body
        if cursor: body['start_cursor'] = cursor
        r = _session.post(f'https://api.notion.com/v1/databases/{db_id}/query',
                          headers=N_HEADERS, json=body, timeout=30)
        r.raise_for_status()
        d = r.json()
        out.extend(d.get('results', []))
        if not d.get('has_more'): break
        cursor = d.get('next_cursor')
    return out

def title_of(prop):
    # Notion spezza il testo in più segmenti (grassetto, link, a capo…): vanno uniti TUTTI,
    # altrimenti si perde tutto quello che viene dopo il primo pezzo.
    return ''.join(x.get('plain_text', '') for x in ((prop or {}).get('title') or []))
def text_of(prop):
    return ''.join(x.get('plain_text', '') for x in ((prop or {}).get('rich_text') or []))
def rel_first(prop):
    a = (prop or {}).get('relation', [])
    return a[0]['id'].replace('-', '') if a else None
def sel_name(prop):
    s = (prop or {}).get('select'); return s['name'] if s else None
def status_name(prop):
    s = (prop or {}).get('status'); return s['name'] if s else None
def date_start(prop):
    d = (prop or {}).get('date'); return d['start'] if d and d.get('start') else None
def num_of(prop):
    return (prop or {}).get('number')
def chk_of(prop):
    return bool((prop or {}).get('checkbox'))
def multi_names(prop):
    return [o['name'] for o in (prop or {}).get('multi_select', [])]
def nid(page_id):
    return page_id.replace('-', '')

def op_token(notion_id):
    return hashlib.sha256((notion_id + TOKEN_SECRET).encode()).hexdigest()[:32]

# ── Supabase upsert ─────────────────────────────────────────────────────────
def sb_upsert(table, rows):
    if not rows: return 0
    if not (SUPABASE_URL and SUPABASE_KEY):
        print(f'  [skip] Supabase non configurato — {table}: {len(rows)} righe pronte (dry)')
        return 0
    # ⚠️ RETE DI SICUREZZA (14 ago 2026): Supabase fa UN SOLO INSERT per l'intero
    # batch e pretende le STESSE colonne su OGNI riga. Se anche solo una riga ha
    # una chiave in meno (es. un campo aggiunto con logica condizionale altrove),
    # rifiuta l'INTERO batch con "PGRST102 All object keys must match" — bloccando
    # il sync dell'intera tabella, non solo di quella riga, finche' nessuno se ne
    # accorge. E' successo davvero il 9-14 ago: una singola manutenzione nuova ha
    # fermato gli aggiornamenti di op_issues per giorni. Qui si pareggiano le
    # chiavi PRIMA di spedire, cosi' un domani un bug simile in un'altra funzione
    # non puo' piu' bloccare tutto in silenzio.
    tutte_le_chiavi = set()
    for row in rows: tutte_le_chiavi.update(row.keys())
    pareggiate = []
    for row in rows:
        r = dict.fromkeys(tutte_le_chiavi, None)
        r.update(row)
        pareggiate.append(r)
    rows = pareggiate
    headers = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}',
               'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates,return=minimal'}
    # batch da 200
    done = 0
    for i in range(0, len(rows), 200):
        chunk = rows[i:i+200]
        r = _session.post(f'{SUPABASE_URL}/rest/v1/{table}', headers=headers, json=chunk, timeout=30)
        if not r.ok:
            print(f'  [ERRORE] {table}: {r.status_code} {r.text[:300]}'); continue
        done += len(chunk)
    return done

def sb_reconcile(table, current_ids, consenti_vuoto=False):
    """Rimuove dal mirror le righe non più presenti su Notion (annullate/chiuse/eliminate).
    Sicuro: senza id correnti non fa niente (evita di svuotare per una fetch fallita), A MENO CHE il chiamante
    sappia che Notion ha risposto davvero (consenti_vuoto): es. l'ultima task aperta e' stata chiusa.
    ⚠️ BUG 16 ott 2026: con zero task aperte il mirror non si svuotava mai, la task chiusa restava visibile
    all'operatore e ogni sync (ogni 15 min) riscriveva "Chiusa: Done" nello Storico."""
    if (not current_ids and not consenti_vuoto) or not (SUPABASE_URL and SUPABASE_KEY):
        return 0
    h = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'}
    r = _session.get(f'{SUPABASE_URL}/rest/v1/{table}', headers=h,
                     params={'select': 'notion_id'}, timeout=30)
    if not r.ok:
        print(f'  [reconcile skip] {table}: {r.status_code}'); return 0
    mirror_ids = {row['notion_id'] for row in r.json()}
    orphans = list(mirror_ids - set(current_ids))
    if not orphans:
        return 0
    hd = dict(h, **{'Prefer': 'return=minimal'})
    removed = 0
    for i in range(0, len(orphans), 100):
        chunk = orphans[i:i+100]
        lst = ','.join(chunk)
        d = _session.delete(f'{SUPABASE_URL}/rest/v1/{table}', headers=hd,
                            params={'notion_id': f'in.({lst})'}, timeout=30)
        if d.ok:
            removed += len(chunk)
        else:
            print(f'  [reconcile del] {table}: {d.status_code} {d.text[:200]}')
    return removed

def sb_map(table, cols):
    if not (SUPABASE_URL and SUPABASE_KEY): return {}
    h = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'}
    r = _session.get(f'{SUPABASE_URL}/rest/v1/{table}', headers=h, params={'select': cols}, timeout=30)
    return {x['notion_id']: x for x in r.json()} if r.ok else {}

def n_patch(page_id, props):
    pid = page_id.replace('-', '')
    _session.patch(f'https://api.notion.com/v1/pages/{pid}', headers=N_HEADERS,
                   json={'properties': props}, timeout=20).raise_for_status()

def _segna_istruzioni_cambiate(table, rows):
    """Confronta il testo delle istruzioni col giro precedente. Se l'ufficio l'ha riscritto,
    segna la data del cambio: il portale mostra 'istruzioni aggiornate' finché l'operatore
    non riapre la scheda. Le righe nuove non sono 'aggiornate': è la prima volta che le vede."""
    prev = sb_map(table, 'notion_id,istruzioni_hash,istruzioni_agg_il,istruzioni_viste_il')
    n = 0
    for row in rows:
        testo = (row.get('istruzioni') or '').strip()
        h = hashlib.sha1(testo.encode('utf-8')).hexdigest() if testo else ''
        p = prev.get(row['notion_id'])
        row['istruzioni_hash'] = h
        # ⚠️ BUG CORRETTO (14 ago 2026): per una riga NUOVA questo "continue" usciva
        # senza mai scrivere istruzioni_agg_il/istruzioni_viste_il, mentre tutte le
        # altre righe del batch le avevano. Supabase fa UN SOLO INSERT per l'intero
        # batch e pretende le STESSE colonne su ogni riga: con chiavi diverse rifiuta
        # tutto con "PGRST102 All object keys must match" — e "tutto" significa
        # l'intera tabella op_issues/op_tasks, non solo la riga nuova. E' bastata UNA
        # manutenzione nuova per bloccare il sync di ENTRAMBE le tabelle da allora:
        # niente più date aggiornate, niente più reset di "Confermato" dopo una
        # ricalendarizzazione, fino a quando qualcuno non lo notava.
        if p is None:
            row['istruzioni_agg_il'] = None
            row['istruzioni_viste_il'] = None
            continue                                   # riga nuova: niente da segnalare
        row['istruzioni_viste_il'] = p.get('istruzioni_viste_il')
        # Senza un'impronta precedente non sappiamo se il testo è cambiato: è la prima
        # volta che lo misuriamo. Registriamo e basta, altrimenti al primo giro
        # risulterebbero "aggiornate" tutte le schede che hanno delle istruzioni.
        if not p.get('istruzioni_hash'):
            row['istruzioni_agg_il'] = p.get('istruzioni_agg_il')
            continue
        if p.get('istruzioni_hash') != h and testo:
            row['istruzioni_agg_il'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            n += 1
        else:
            row['istruzioni_agg_il'] = p.get('istruzioni_agg_il')
    if n: print(f'{table}: {n} istruzioni riscritte dall\'ufficio')
    return n


def _reset_confermato_su_spostamento(table, rows, date_key):
    """Se una task/issue era 'Confermato dal manutentore' e la sua data è stata spostata (dall'ufficio
    su Notion), togli la conferma: torna 'da fare' per l'operatore. Confronta la data col mirror precedente."""
    prev = sb_map(table, f'notion_id,{date_key},confermato_manutentore')
    n, ids = 0, set()
    for row in rows:
        p = prev.get(row['notion_id'])
        if p and p.get('confermato_manutentore') and p.get(date_key) and row.get(date_key) and p[date_key] != row[date_key]:
            try:
                n_patch(row['notion_id'], {'Confermato dal manutentore': {'checkbox': False},
                                           'Confermato il': {'date': None}})
                row['confermato_manutentore'] = False
                row['confermato_il'] = None
                ids.add(row['notion_id'])
                n += 1
            except Exception as e:
                print(f'  [reset-conferma] {row["notion_id"][:8]}: {e}')
    if n: print(f'{table}: {n} conferme rimosse (data spostata)')
    return ids


# ── Storico (registro automatico delle modifiche dell'ufficio) ───────────────
MAX_STORICO_PER_GIRO = 30     # oltre questa soglia qualcosa non torna (o e' il primo giro dopo un guasto): si rimanda

def _n_storico_attuale(page_id):
    """Rilegge lo Storico FRESCO dalla pagina Notion subito prima di scrivere: se nel frattempo il portale
    ha aggiunto una riga (azione dell'operatore), non la sovrascriviamo."""
    pid = page_id.replace('-', '')
    r = _session.get(f'https://api.notion.com/v1/pages/{pid}', headers=N_HEADERS, timeout=20)
    r.raise_for_status()
    prop = (r.json().get('properties') or {}).get('Storico')
    if prop is None:
        return None                                  # la proprieta' non esiste: non scriviamo
    return text_of(prop)

def _scrivi_storico(page_id, righe, evita_duplicati=False):
    """Mette le righe in cima allo Storico della pagina. Torna il nuovo testo o None se non riuscito.
    evita_duplicati: se l'ultima riga dello Storico dice gia la stessa cosa non scrive niente (rete di sicurezza)."""
    try:
        attuale = _n_storico_attuale(page_id)
        if attuale is None:
            return None
        if evita_duplicati and storico_mod.ultima_riga_uguale(attuale, righe):
            return attuale
        nuovo = storico_mod.aggiungi(attuale, righe)
        n_patch(page_id, {'Storico': {'rich_text': storico_mod.blocchi_rich_text(nuovo)}})
        return nuovo
    except Exception as e:
        print(f'  [storico] {page_id[:8]}: {e}')
        return None

_CAMPI_DIFF = ('stato', 'istruzioni_hash', 'confermato_manutentore', 'operatore_notion_id', 'priorita')

def _applica_storico(table, rows, kind, date_key, prev, nomi_op, resets, chiuse):
    """Confronta ogni riga con il mirror, scrive le righe di Storico su Notion e aggiorna i campi
    'data cambiata'. Se la scrittura su Notion non riesce, i campi confrontati tornano al valore del mirror:
    cosi' la differenza si ripresenta al giro dopo invece di perdersi."""
    ora_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    mirror_pieno = bool(prev)                         # mirror vuoto = guasto o primo giro: niente "righe nuove"
    scritte = 0
    for row in rows:
        p = prev.get(row['notion_id'])
        eventi, data_cambiata, richiesta_esaurita = storico_mod.eventi_da_diff(
            p, row, date_key, nomi_op, richiesta=(p or {}).get('data_richiesta'))
        if p is None and mirror_pieno:
            nuova = storico_mod.evento_riga_nuova(row, kind, nomi_op)
            if nuova:
                eventi.append(nuova)
        if row['notion_id'] in resets:
            # la conferma l'ha tolta il sistema perche' la data e' cambiata: non e' una "riapertura" a mano
            eventi = [e for e in eventi if not e.startswith('↩︎ Riaperta dall')]
            eventi.append('↩︎ Conferma tolta: la data è cambiata')
        # valori che restano uguali se non cambia niente (sb_upsert sovrascrive con None quello che manca)
        row['data_vista_il'] = (p or {}).get('data_vista_il')
        row['data_agg_il'] = ora_iso if data_cambiata else (p or {}).get('data_agg_il')
        row['data_richiesta'] = None if richiesta_esaurita else (p or {}).get('data_richiesta')
        if not eventi:
            continue
        if scritte >= MAX_STORICO_PER_GIRO:
            nuovo = None
        else:
            nuovo = _scrivi_storico(row['notion_id'], eventi)
            scritte += 1
        if nuovo is None:
            if p is not None:                         # riprova al prossimo giro
                for k in _CAMPI_DIFF + (date_key, 'data_richiesta'):
                    row[k] = p.get(k)
                row['data_agg_il'] = p.get('data_agg_il')
                if row['notion_id'] in resets:
                    pass                              # la conferma e' gia' stata tolta su Notion: resta cosi'
            continue
        row['storico'] = nuovo
    for pid, testo in chiuse:
        if scritte >= MAX_STORICO_PER_GIRO:
            break
        _scrivi_storico(pid, [testo], evita_duplicati=True); scritte += 1
    if scritte: print(f'{table}: {scritte} pagine con nuove righe di Storico')

# ── Sync ────────────────────────────────────────────────────────────────────
FIELD_ATTIVITA = {'Pulizia', 'Pulizia a Fondo', 'Manutenzioni', 'Tuttofare', 'Lavanderia'}

def _responsabili_ids():
    """Tutti gli id (senza trattini) che risultano Responsabile Pulizia su almeno un appartamento."""
    ids = set()
    for a in n_query(DB_APPARTAMENTI):
        for r in (a['properties'].get('Responsabile Pulizia') or {}).get('relation', []):
            ids.add(r['id'].replace('-', ''))
    return ids

def _qualifica_portale(p, responsabili):
    """Un contatto merita il Link Portale solo se: ruolo di campo (pulizia/manutenzione/ecc),
    Attivo? spuntato, e collegato ad almeno un appartamento (relazione diretta o come responsabile)."""
    pr = p['properties']
    attivita = set(multi_names(pr.get('Attività')))
    if not (attivita & FIELD_ATTIVITA):
        return False
    if not chk_of(pr.get('Attivo?')):
        return False
    has_apt = bool((pr.get('Appartamenti (pulizia)') or {}).get('relation')) or nid(p['id']) in responsabili
    return has_apt

def sync_operatori():
    pages = n_query(DB_FORNITORI)
    responsabili = _responsabili_ids()
    rows = []
    for p in pages:
        if not _qualifica_portale(p, responsabili):
            continue
        pr = p['properties']
        email = (pr.get('Email') or {}).get('email')
        rows.append({
            'notion_id': nid(p['id']),
            'nome': title_of(pr.get('Nome')),
            'email': email,
            'token': op_token(nid(p['id'])),
            'attivo': chk_of(pr.get('Attivo?')),
        })
    n = sb_upsert('op_operatori', rows)
    print(f'operatori: {len(rows)} qualificano (attivo+appartamento), {n} upsert')
    _sync_link_portale(pages, responsabili, rows)
    return rows

def _sync_link_portale(pages, responsabili, righe_qualificate):
    """Scrive Link Portale su Notion solo a chi qualifica; lo rimuove a chi non qualifica piu'
    (es. disattivato o senza appartamento). Si auto-corregge ad ogni sync, nessun intervento manuale."""
    if not (SUPABASE_URL and SUPABASE_KEY):
        return
    qualificati_ids = {r['notion_id'] for r in righe_qualificate}
    base = os.environ.get('PORTAL_BASE_URL', 'https://operations-portale.vercel.app')
    scritti, rimossi = 0, 0
    for p in pages:
        pid = p['id']
        pr = p['properties']
        current = (pr.get('Link Portale') or {}).get('url')
        if nid(pid) in qualificati_ids:
            atteso = f"{base}/o/{op_token(nid(pid))}"
            if current != atteso:
                _session.patch(f'https://api.notion.com/v1/pages/{pid}', headers=N_HEADERS,
                               json={'properties': {'Link Portale': {'url': atteso}}}, timeout=20)
                scritti += 1
        elif current:
            _session.patch(f'https://api.notion.com/v1/pages/{pid}', headers=N_HEADERS,
                           json={'properties': {'Link Portale': {'url': None}}}, timeout=20)
            rimossi += 1
    if scritti or rimossi:
        print(f'Link Portale: {scritti} scritti/aggiornati, {rimossi} rimossi (non qualificano piu\')')

def sync_appartamenti():
    pages = n_query(DB_APPARTAMENTI)
    rows = []
    for p in pages:
        pr = p['properties']
        nome = title_of(pr.get('Name')) or title_of(pr.get('Nome'))
        if not nome: continue
        rows.append({
            'notion_id': nid(p['id']),
            'nome': nome,
            'indirizzo': text_of(pr.get('Indirizzo Text')),
            'responsabile_notion_id': rel_first(pr.get('Responsabile Pulizia')),
            'calendar_id': text_of(pr.get('Calendar ID')),
        })
    n = sb_upsert('op_appartamenti', rows)
    print(f'appartamenti: {len(rows)} righe, {n} upsert')
    return {r['notion_id']: r for r in rows}

def sync_pulizie(apt_map):
    pages = n_query(DB_PULIZIE, {'property': 'Stato', 'select': {'does_not_equal': 'Annullata'}})
    rows = []
    for p in pages:
        pr = p['properties']
        apt = rel_first(pr.get('Appartamento'))
        resp = (apt_map.get(apt) or {}).get('responsabile_notion_id') if apt else None
        rows.append({
            'notion_id': nid(p['id']),
            'appartamento_notion_id': apt,
            'operatore_notion_id': resp,
            'data': date_start(pr.get('Data Pulizia')),
            'tipo': sel_name(pr.get('Tipo')) or 'Standard',
            'stato': sel_name(pr.get('Stato')) or 'Da fare',
            'prezzo': num_of(pr.get('Prezzo')),
            'inizio': text_of(pr.get('Inizio Pulizia')),
            'fine': text_of(pr.get('Fine Pulizia')),
            'deposito': sel_name(pr.get('Deposito Bagagli')),
            'late_checkout': chk_of(pr.get('Late Checkout')),
            'early_checkin': chk_of(pr.get('Early Checkin')),
        })
    n = sb_upsert('op_pulizie', rows)
    rm = sb_reconcile('op_pulizie', [r['notion_id'] for r in rows])
    print(f'pulizie: {len(rows)} attive, {n} upsert, {rm} orfane rimosse')
    return rows

def sync_issues():
    pages = n_query(DB_ISSUES)
    prev = sb_map('op_issues', 'notion_id,stato,data_intervento,istruzioni_hash,confermato_manutentore,operatore_notion_id,priorita,data_richiesta,data_agg_il,data_vista_il')
    nomi_op = {k: v.get('nome') for k, v in sb_map('op_operatori', 'notion_id,nome').items()}
    rows, chiuse = [], []
    for p in pages:
        pr = p['properties']
        stato = status_name(pr.get('Stato'))
        if stato in STATI_ISSUE_CHIUSI:  # solo aperte
            if nid(p['id']) in prev:     # era aperta nel mirror e ora e' chiusa: lo scriviamo nello Storico
                chiuse.append((p['id'], f'🔒 Chiusa: {stato}'))
            continue
        conf_il = date_start(pr.get('Confermato il'))
        rows.append({
            'notion_id': nid(p['id']),
            'descrizione': title_of(pr.get('Descrizione')),
            'appartamento_notion_id': rel_first(pr.get('Apartment')),
            'operatore_notion_id': rel_first(pr.get('Operatore')),
            'priorita': sel_name(pr.get('Priority')),
            'stato': stato,
            'data_intervento': date_start(pr.get('Data Intervento')),
            'istruzioni': text_of(pr.get('Istruzioni operatore')),
            'note_operatore': text_of(pr.get('Note operatore')),
            'storico': text_of(pr.get('Storico')),
            'confermato_manutentore': chk_of(pr.get('Confermato dal manutentore')),
            'confermato_il': conf_il,
            'created_time': (pr.get('Created time') or {}).get('created_time'),
        })
    _segna_istruzioni_cambiate('op_issues', rows)
    # le differenze si calcolano PRIMA del reset della conferma (che modifica la riga)
    resets = _reset_confermato_su_spostamento('op_issues', rows, 'data_intervento')
    _applica_storico('op_issues', rows, 'issue', 'data_intervento', prev, nomi_op, resets, chiuse)
    n = sb_upsert('op_issues', rows)
    rm = sb_reconcile('op_issues', [r['notion_id'] for r in rows], consenti_vuoto=bool(pages))
    print(f'issues: {len(rows)} aperte, {n} upsert, {rm} orfane rimosse')
    return rows

def sync_tasks():
    # solo task con un Operatore assegnato e non ancora Done
    pages = n_query(DB_TASKS)
    prev = sb_map('op_tasks', 'notion_id,stato,due_date,istruzioni_hash,confermato_manutentore,operatore_notion_id,priorita,data_richiesta,data_agg_il,data_vista_il')
    nomi_op = {k: v.get('nome') for k, v in sb_map('op_operatori', 'notion_id,nome').items()}
    rows, chiuse = [], []
    for p in pages:
        pr = p['properties']
        op = rel_first(pr.get('Operatore'))
        stato = status_name(pr.get('Status'))
        if not op:
            if nid(p['id']) in prev:
                chiuse.append((p['id'], '👤 Non più assegnata a un operatore'))
            continue
        if stato == 'Done':
            if nid(p['id']) in prev:
                chiuse.append((p['id'], '🔒 Chiusa: Done'))
            continue
        tag = ', '.join(multi_names(pr.get('Tag')))
        rows.append({
            'notion_id': nid(p['id']),
            'nome': title_of(pr.get('Name')),
            'appartamento_notion_id': rel_first(pr.get('Appartamento')),
            'operatore_notion_id': op,
            'priorita': sel_name(pr.get('Priority')),
            'stato': stato,
            'due_date': date_start(pr.get('Due Date')),
            'tag': tag,
            'istruzioni': text_of(pr.get('Istruzioni operatore')),
            'note_operatore': text_of(pr.get('Note operatore')),
            'storico': text_of(pr.get('Storico')),
            'allegati_count': len((pr.get('Allegati') or {}).get('files', []) or []),
            'confermato_manutentore': chk_of(pr.get('Confermato dal manutentore')),
            'confermato_il': date_start(pr.get('Confermato il')),
            'created_time': (pr.get('Created time') or {}).get('created_time'),
        })
    _segna_istruzioni_cambiate('op_tasks', rows)
    resets = _reset_confermato_su_spostamento('op_tasks', rows, 'due_date')
    _applica_storico('op_tasks', rows, 'task', 'due_date', prev, nomi_op, resets, chiuse)
    n = sb_upsert('op_tasks', rows)
    rm = sb_reconcile('op_tasks', [r['notion_id'] for r in rows], consenti_vuoto=bool(pages))
    print(f'tasks: {len(rows)} aperte, {n} upsert, {rm} orfane rimosse')
    return rows

def main():
    t0 = time.time()
    print(f'== SYNC {datetime.datetime.now().isoformat(timespec="seconds")} ==')
    sync_operatori()
    apt_map = sync_appartamenti()
    sync_pulizie(apt_map)
    sync_issues()
    sync_tasks()
    print(f'== fatto in {time.time()-t0:.1f}s ==')

if __name__ == '__main__':
    main()
