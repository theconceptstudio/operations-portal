#!/usr/bin/env python3
"""
Operations Portal — app operatori/manutentori (Flask).
Accesso senza password via link /o/<token>. Legge il mirror Supabase (op_*),
scrive su Notion solo le conferme (staff propone, ufficio dispone).
"""
import os, datetime, time
from concurrent.futures import ThreadPoolExecutor
import requests
from flask import Flask, request, jsonify, send_from_directory, redirect

# ── Config ──────────────────────────────────────────────────────────────────
NOTION_TOKEN = os.environ.get('NOTION_TOKEN')
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')
TOKEN_SECRET = os.environ.get('TOKEN_SECRET')
SYNC_SECRET  = os.environ.get('SYNC_SECRET', 'sync')
if not NOTION_TOKEN:
    try:
        import config_local as _c
        NOTION_TOKEN = getattr(_c, 'NOTION_TOKEN', None)
        SUPABASE_URL = SUPABASE_URL or getattr(_c, 'SUPABASE_URL', None)
        SUPABASE_KEY = SUPABASE_KEY or getattr(_c, 'SUPABASE_KEY', None)
        TOKEN_SECRET = TOKEN_SECRET or getattr(_c, 'TOKEN_SECRET', None)
    except Exception:
        pass

app = Flask(__name__, static_folder=None)
PUBLIC = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public')

from requests.adapters import HTTPAdapter
_session = requests.Session()
_session.mount('https://', HTTPAdapter(pool_connections=10, pool_maxsize=10))

N_HEADERS = {'Authorization': f'Bearer {NOTION_TOKEN}', 'Notion-Version': '2022-06-28',
             'Content-Type': 'application/json'}

def _sb_headers(extra=None):
    h = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}',
         'Content-Type': 'application/json'}
    if extra: h.update(extra)
    return h

def sb_get(table, params):
    r = _session.get(f'{SUPABASE_URL}/rest/v1/{table}', headers=_sb_headers(), params=params, timeout=20)
    return r.json() if r.ok else []

def operatore_by_token(token):
    rows = sb_get('op_operatori', {'token': f'eq.{token}', 'select': 'notion_id,nome,token', 'limit': '1'})
    return rows[0] if rows else None

# Cache appartamenti (tabellina, cambia raramente) — TTL 5 min
_apt_cache = {'ts': 0, 'map': {}}
def apt_map():
    now = time.time()
    if now - _apt_cache['ts'] > 300 or not _apt_cache['map']:
        rows = sb_get('op_appartamenti', {'select': 'notion_id,nome,indirizzo'})
        if rows:
            _apt_cache['map'] = {a['notion_id']: a for a in rows}
            _apt_cache['ts'] = now
    return _apt_cache['map']

def n_patch(page_id, props):
    pid = page_id.replace('-', '')
    r = _session.patch(f'https://api.notion.com/v1/pages/{pid}', headers=N_HEADERS,
                       json={'properties': props}, timeout=20)
    r.raise_for_status()
    return r.json()

def n_get(page_id):
    pid = page_id.replace('-', '')
    r = _session.get(f'https://api.notion.com/v1/pages/{pid}', headers=N_HEADERS, timeout=20)
    r.raise_for_status()
    return r.json()

def n_create_page(parent_db, props, children=None):
    body = {'parent': {'database_id': parent_db.replace('-', '')}, 'properties': props}
    if children:
        body['children'] = children
    r = _session.post('https://api.notion.com/v1/pages', headers=N_HEADERS, json=body, timeout=30)
    r.raise_for_status()
    return r.json()

def _dash(u):
    """Formatta un id Notion senza trattini (32 hex) in UUID con trattini (per le relazioni)."""
    u = (u or '').replace('-', '')
    return f'{u[:8]}-{u[8:12]}-{u[12:16]}-{u[16:20]}-{u[20:]}' if len(u) == 32 else u

# Expenses Tracker (destinazione ordini rifornimenti)
DB_EXPENSES = '3079ef82-3d96-8090-b63e-c086d80b3fb5'
RIF_PRIORITY = {'1w': 'Very High', '2w': 'Mid', '4w': 'Low'}
RIF_URG_LBL  = {'1w': 'entro ~1 settimana (urgente)', '2w': 'entro ~2 settimane', '4w': 'entro ~4 settimane o più'}

def _now_rome():
    try:
        from zoneinfo import ZoneInfo
        return datetime.datetime.now(ZoneInfo('Europe/Rome'))
    except Exception:
        return datetime.datetime.utcnow() + datetime.timedelta(hours=2)  # fallback ora legale IT

def _allegati_of(page):
    """Lista file di 'Allegati': [{name, url, video}]. Gestisce sia i file esterni (Supabase,
    caricati dall'operatore) sia quelli caricati su Notion dall'ufficio (url firmato che rinfreschiamo
    ad ogni lettura)."""
    files = (page.get('properties', {}).get('Allegati', {}) or {}).get('files', []) or []
    out = []
    for f in files:
        url = (f.get('external') or f.get('file') or {}).get('url', '')
        if not url:
            continue
        name = f.get('name', '')
        low = (name + url).lower()
        video = any(low.split('?')[0].endswith(e) for e in ('.mp4', '.mov', '.webm', '.m4v', '.avi'))
        out.append({'name': name, 'url': url, 'video': video})
    return out

def _append_nota(item_id, table, testo):
    """Aggiunge una riga (con timestamp gg/mm hh:mm ora italiana) alle Note operatore su Notion + mirror.
    Idempotente: se l'ultima riga ha lo stesso testo, non la ripete (evita duplicati da retry/doppio invio)."""
    page = n_get(item_id)
    rt = (page.get('properties', {}).get('Note operatore', {}) or {}).get('rich_text', []) or []
    existing = ''.join(t.get('plain_text', '') for t in rt)
    testo = (testo or '').strip()
    last = existing.rsplit('\n', 1)[-1] if existing else ''
    last_body = last.split('] ', 1)[1].strip() if last.startswith('[') and '] ' in last else last.strip()
    if last_body and last_body == testo:
        return existing  # gia' presente: niente duplicato
    stamp = _now_rome().strftime('%d/%m %H:%M')
    nuovo = ((existing + '\n') if existing else '') + f'[{stamp}] {testo}'
    nuovo = nuovo[-1990:]
    n_patch(item_id, {'Note operatore': {'rich_text': [{'text': {'content': nuovo}}]}})
    if SUPABASE_URL and SUPABASE_KEY:
        _session.patch(f'{SUPABASE_URL}/rest/v1/{table}',
                       headers=_sb_headers({'Prefer': 'return=minimal'}),
                       params={'notion_id': f'eq.{item_id}'},
                       json={'note_operatore': nuovo}, timeout=20)
    return nuovo

# ── Pagina portale (shell) ───────────────────────────────────────────────────
@app.route('/o/<token>')
def portale(token):
    op = operatore_by_token(token) if (SUPABASE_URL and SUPABASE_KEY) else None
    if not op:
        return ('<!doctype html><meta charset=utf-8><body style="font-family:sans-serif;'
                'background:#f7f5f0;color:#2B160F;text-align:center;padding:60px 24px">'
                '<h2>Link non valido</h2><p>Contatta l\'ufficio The Concept Studio.</p></body>', 404)
    return SHELL.replace('%TOKEN%', token).replace('%NOME%', op.get('nome') or 'Operatore')

@app.route('/api/o/<token>/data')
def op_data(token):
    op = operatore_by_token(token)
    if not op: return jsonify({'error': 'token'}), 404
    oid = op['notion_id']
    today = datetime.date.today()
    start = (today - datetime.timedelta(days=21)).isoformat()   # finestra: pulizie recenti + prossime
    end   = (today + datetime.timedelta(days=60)).isoformat()
    PCOLS = 'notion_id,appartamento_notion_id,data,tipo,stato,inizio,fine,deposito,late_checkout,early_checkin'
    ICOLS = 'notion_id,descrizione,appartamento_notion_id,priorita,stato,data_intervento,istruzioni,note_operatore,confermato_manutentore,created_time'
    TCOLS = 'notion_id,nome,appartamento_notion_id,priorita,stato,due_date,tag,istruzioni,note_operatore,allegati_count,confermato_manutentore,created_time'
    gp = lambda: sb_get('op_pulizie', {'operatore_notion_id': f'eq.{oid}',
        'and': f'(data.gte.{start},data.lte.{end})', 'select': PCOLS, 'order': 'data.asc'})
    gi = lambda: sb_get('op_issues', {'operatore_notion_id': f'eq.{oid}', 'select': ICOLS, 'order': 'data_intervento.asc'})
    gt = lambda: sb_get('op_tasks',  {'operatore_notion_id': f'eq.{oid}', 'select': TCOLS, 'order': 'due_date.asc'})
    # chiamate al DB in parallelo
    with ThreadPoolExecutor(max_workers=3) as ex:
        fp, fi, ft = ex.submit(gp), ex.submit(gi), ex.submit(gt)
        pulizie, issues, tasks = fp.result(), fi.result(), ft.result()
    apt = apt_map()
    for x in pulizie + issues + tasks:
        a = apt.get(x.get('appartamento_notion_id'))
        x['appartamento'] = (a or {}).get('nome') or '—'
        x['indirizzo'] = (a or {}).get('indirizzo') or ''
    resp = jsonify({'operatore': op.get('nome'), 'oggi': today.isoformat(),
                    'pulizie': pulizie, 'issues': issues, 'tasks': tasks})
    resp.headers['Cache-Control'] = 'no-store'
    return resp

@app.route('/api/o/<token>/conferma', methods=['POST'])
def conferma(token):
    op = operatore_by_token(token)
    if not op: return jsonify({'ok': False, 'error': 'token'}), 404
    d = request.get_json(force=True)
    # kind: 'issue' (manutenzione) o 'task'. Retro-compat: issue_id => issue
    kind = d.get('kind') or ('issue' if d.get('issue_id') else 'task')
    item_id = d.get('id') or d.get('issue_id') or d.get('task_id')
    if not item_id: return jsonify({'ok': False, 'error': 'id mancante'}), 400
    table = 'op_tasks' if kind == 'task' else 'op_issues'
    valore = d.get('valore', True)  # True=conferma, False=riattiva (annulla conferma)
    oggi = datetime.date.today().isoformat() if valore else None
    try:
        n_patch(item_id, {'Confermato dal manutentore': {'checkbox': bool(valore)},
                          'Confermato il': {'date': ({'start': oggi} if oggi else None)}})
        _session.patch(f'{SUPABASE_URL}/rest/v1/{table}',
                       headers=_sb_headers({'Prefer': 'return=minimal'}),
                       params={'notion_id': f'eq.{item_id}'},
                       json={'confermato_manutentore': bool(valore), 'confermato_il': oggi}, timeout=20)
        # Traccia conferma/riattivazione anche nelle Note operatore (con data e ora)
        nuova_nota = None
        try:
            nuova_nota = _append_nota(item_id, table, '✅ Intervento confermato' if valore else '↩︎ Riaperta')
        except requests.HTTPError:
            pass
    except requests.HTTPError as e:
        return jsonify({'ok': False, 'error': str(e)}), 500
    return jsonify({'ok': True, 'note_operatore': nuova_nota})

@app.route('/api/o/<token>/nota', methods=['POST'])
def nota(token):
    op = operatore_by_token(token)
    if not op: return jsonify({'ok': False, 'error': 'token'}), 404
    d = request.get_json(force=True)
    kind = d.get('kind') or 'issue'
    item_id = d.get('id')
    testo = (d.get('testo') or '').strip()
    if not (item_id and testo): return jsonify({'ok': False, 'error': 'dati mancanti'}), 400
    table = 'op_tasks' if kind == 'task' else 'op_issues'
    try:
        nuovo = _append_nota(item_id, table, testo)
    except requests.HTTPError as e:
        return jsonify({'ok': False, 'error': str(e)}), 500
    return jsonify({'ok': True, 'note_operatore': nuovo})

@app.route('/api/o/<token>/allegati/<kind>/<item_id>')
def allegati(token, kind, item_id):
    """Sezione allegati CONDIVISA: legge i file di 'Allegati' su Notion (freschi) — sia quelli
    caricati dall'operatore dal portale sia quelli aggiunti dall'ufficio su Notion — e li restituisce."""
    op = operatore_by_token(token)
    if not op: return jsonify({'ok': False, 'error': 'token'}), 404
    try:
        page = n_get(item_id)
    except requests.HTTPError as e:
        return jsonify({'ok': False, 'error': str(e)}), 500
    return jsonify({'ok': True, 'allegati': _allegati_of(page)})

_LAST_SYNC = {'ts': 0.0}
@app.route('/api/o/<token>/refresh')
def refresh(token):
    """Sync on-demand quando l'operatore apre il portale, con freno (min 40s tra un sync e l'altro)
    così i dati Notion arrivano subito senza martellare Notion/Supabase."""
    op = operatore_by_token(token)
    if not op: return jsonify({'ok': False, 'error': 'token'}), 404
    now = time.time()
    if now - _LAST_SYNC['ts'] < 40:
        return jsonify({'ok': True, 'skipped': True})
    _LAST_SYNC['ts'] = now
    try:
        import sync
        sync.main()
        return jsonify({'ok': True, 'synced': True, 'ts': datetime.datetime.utcnow().isoformat()})
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500

@app.route('/api/o/<token>/foto', methods=['POST'])
def foto(token):
    op = operatore_by_token(token)
    if not op: return jsonify({'ok': False, 'error': 'token'}), 404
    issue_id = request.form.get('issue_id')
    f = request.files.get('file')
    if not (issue_id and f): return jsonify({'ok': False, 'error': 'dati mancanti'}), 400
    import uuid as _uuid
    ext = (f.filename.rsplit('.', 1)[-1] if '.' in (f.filename or '') else 'jpg').lower()
    path = f"{issue_id}/{_uuid.uuid4().hex}.{ext}"
    data = f.read()
    up = _session.post(f'{SUPABASE_URL}/storage/v1/object/op-allegati/{path}',
                       headers={'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}',
                                'Content-Type': f.mimetype or 'image/jpeg'},
                       data=data, timeout=60)
    if not up.ok:
        return jsonify({'ok': False, 'error': 'upload: ' + up.text[:200]}), 500
    url = f"{SUPABASE_URL}/storage/v1/object/public/op-allegati/{path}"
    # append a Allegati su Notion (preserva i file esistenti)
    try:
        page = n_get(issue_id)
        cur = (page.get('properties', {}).get('Allegati', {}) or {}).get('files', []) or []
        cur.append({'name': f"foto-{datetime.date.today().isoformat()}.{ext}", 'external': {'url': url}})
        n_patch(issue_id, {'Allegati': {'files': cur}})
    except requests.HTTPError as e:
        return jsonify({'ok': True, 'url': url, 'warn': 'salvata, ma non agganciata a Notion: ' + str(e)})
    return jsonify({'ok': True, 'url': url})

# ── Rifornimenti (carrello → ordine su Expenses Tracker) ─────────────────────
def _op_apt_ids(oid):
    """Id (senza trattini) degli appartamenti dell'operatore: dove è Responsabile Pulizia
    più quelli che compaiono nelle sue pulizie. Solo i suoi, mai quelli altrui."""
    ids = set()
    for a in sb_get('op_appartamenti', {'responsabile_notion_id': f'eq.{oid}', 'select': 'notion_id'}):
        ids.add(a['notion_id'])
    for p in sb_get('op_pulizie', {'operatore_notion_id': f'eq.{oid}', 'select': 'appartamento_notion_id'}):
        if p.get('appartamento_notion_id'): ids.add(p['appartamento_notion_id'])
    return ids

def n_query_db(db_id, body):
    r = _session.post(f'https://api.notion.com/v1/databases/{db_id.replace("-", "")}/query',
                      headers=N_HEADERS, json=body, timeout=30)
    r.raise_for_status()
    return r.json().get('results', [])

@app.route('/api/o/<token>/rif-appartamenti')
def rif_appartamenti(token):
    """Appartamenti per cui l'operatore può ordinare. Mostriamo la VIA (gli operatori
    ragionano per indirizzo, non per nome)."""
    op = operatore_by_token(token)
    if not op: return jsonify({'ok': False, 'error': 'token'}), 404
    apt = apt_map()
    ids = _op_apt_ids(op['notion_id'])
    out = []
    for i in ids:
        a = apt.get(i) or {}
        out.append({'id': i, 'via': a.get('indirizzo') or a.get('nome') or '—', 'nome': a.get('nome') or '—'})
    out.sort(key=lambda x: x['via'].lower())
    resp = jsonify({'ok': True, 'appartamenti': out})
    resp.headers['Cache-Control'] = 'no-store'
    return resp

@app.route('/api/o/<token>/rif-storico')
def rif_storico(token):
    """Cronologia ordini rifornimenti dei SOLI appartamenti dell'operatore, dal più recente.
    Serve per capire se una cosa è già stata ordinata. Prodotti letti dal campo Note (riepilogo)."""
    op = operatore_by_token(token)
    if not op: return jsonify({'ok': False, 'error': 'token'}), 404
    my = _op_apt_ids(op['notion_id'])
    if not my:
        return jsonify({'ok': True, 'storico': []})
    apt = apt_map()
    try:
        results = n_query_db(DB_EXPENSES, {
            'filter': {'property': 'Categoria', 'select': {'equals': 'Rifornimenti Scorte'}},
            'sorts': [{'property': 'Data Acquisto', 'direction': 'descending'}], 'page_size': 40})
    except requests.HTTPError as e:
        return jsonify({'ok': False, 'error': str(e)}), 500
    out = []
    for p in results:
        pr = p.get('properties', {})
        rel = [x['id'].replace('-', '') for x in (pr.get('Appartamento', {}) or {}).get('relation', [])]
        if not (set(rel) & my):
            continue
        a = apt.get(rel[0]) if rel else {}
        a = a or {}
        note = ''.join(t.get('plain_text', '') for t in (pr.get('Note', {}) or {}).get('rich_text', []))
        descr = ''.join(t.get('plain_text', '') for t in (pr.get('Descrizione', {}) or {}).get('title', []))
        out.append({
            'data': ((pr.get('Data Acquisto', {}) or {}).get('date') or {}).get('start'),
            'via': a.get('indirizzo') or a.get('nome') or '—',
            'stato': ((pr.get('Stato', {}) or {}).get('select') or {}).get('name'),
            'priority': ((pr.get('Priority', {}) or {}).get('select') or {}).get('name'),
            'prodotti': note,       # ordini creati dall'app: elenco prodotti
            'descrizione': descr,   # ordini vecchi/manuali: il contenuto è nel titolo
        })
    resp = jsonify({'ok': True, 'storico': out})
    resp.headers['Cache-Control'] = 'no-store'
    return resp

@app.route('/api/o/<token>/rifornimento', methods=['POST'])
def rifornimento(token):
    """Crea un ordine rifornimenti sull'Expenses Tracker di Notion: pagina con Categoria
    'Rifornimenti Scorte', Stato 'Da acquistare', Data Acquisto oggi, Priority dall'urgenza,
    appartamento collegato e i prodotti come checklist (to-do) nel corpo pagina. I prodotti
    urgenti sono marcati 🔴 (e alzano la Priority a Very High); i prodotti nuovi non in lista
    sono marcati 🆕 così l'ufficio può aggiornare le categorie."""
    op = operatore_by_token(token)
    if not op: return jsonify({'ok': False, 'error': 'token'}), 404
    d = request.get_json(force=True)
    apt_id = (d.get('appartamento_id') or '').strip()
    urg = d.get('urgenza') if d.get('urgenza') in RIF_PRIORITY else '2w'
    gruppi = d.get('gruppi') or []   # [{cat, items:[nome,...]}]
    nuovi = set(str(x).strip() for x in (d.get('nuovi') or []))
    urgenti = set(str(x).strip() for x in (d.get('urgenti') or []))
    tot = sum(len(g.get('items') or []) for g in gruppi)
    if not (apt_id and tot):
        return jsonify({'ok': False, 'error': 'appartamento o prodotti mancanti'}), 400

    apt = apt_map().get(apt_id) or {}
    apt_nome = apt.get('nome') or (d.get('appartamento_nome') or 'appartamento')   # nome per Andres nel titolo

    oggi = _now_rome()
    has_urg = bool(urgenti)
    priority = 'Very High' if has_urg else RIF_PRIORITY[urg]

    # riepilogo prodotti nel campo Note → cronologia veloce (senza rileggere i blocchi)
    riepilogo = []
    for g in gruppi:
        for it in (g.get('items') or []):
            it = str(it).strip()
            if not it: continue
            riepilogo.append(('🔴 ' if it in urgenti else '') + it + (' (nuovo)' if it in nuovi else ''))
    nota_sunto = (f'Prodotti ({tot}): ' + ', '.join(riepilogo))[:1990]

    props = {
        'Descrizione': {'title': [{'text': {'content': f'Rifornimenti — {apt_nome} — {oggi.strftime("%d/%m")}'}}]},
        'Categoria': {'select': {'name': 'Rifornimenti Scorte'}},
        'Stato': {'select': {'name': 'Da acquistare'}},
        'Chi paga?': {'select': {'name': 'The Concept w/Charge'}},
        'Priority': {'select': {'name': priority}},
        'Data Acquisto': {'date': {'start': oggi.date().isoformat()}},
        'Note': {'rich_text': [{'text': {'content': nota_sunto}}]},
        'Appartamento': {'relation': [{'id': _dash(apt_id)}]},
    }

    # Corpo pagina: intestazione (callout + bullet leggibili) + checklist prodotti per area
    meta = [f'Da: {op.get("nome") or "operatore"}',
            f'Inviato: {oggi.strftime("%d/%m alle %H:%M")}',
            f'Urgenza generale: {RIF_URG_LBL[urg]}']
    if has_urg: meta.append('⚠️ Contiene prodotti urgenti (segnati 🔴 qui sotto)')
    if nuovi: meta.append('🆕 Contiene prodotti nuovi non in lista (segnati 🆕 qui sotto)')
    children = [{'object': 'block', 'type': 'callout', 'callout': {
        'icon': {'emoji': '🛒'}, 'rich_text': [{'text': {'content': 'Richiesta rifornimenti'}}]}}]
    for m in meta:
        children.append({'object': 'block', 'type': 'bulleted_list_item',
                         'bulleted_list_item': {'rich_text': [{'text': {'content': m}}]}})
    for g in gruppi:
        items = [str(x).strip() for x in (g.get('items') or []) if str(x).strip()]
        if not items: continue
        cat = (g.get('cat') or '').strip()
        if cat:
            children.append({'object': 'block', 'type': 'heading_3',
                             'heading_3': {'rich_text': [{'text': {'content': cat}}]}})
        for nome in items:
            txt = nome
            if nome in nuovi: txt += ' — 🆕 NUOVO (non in lista, valuta di aggiungerlo alle categorie)'
            if nome in urgenti: txt = '🔴 URGENTE — ' + txt
            children.append({'object': 'block', 'type': 'to_do',
                             'to_do': {'rich_text': [{'text': {'content': txt[:200]}}], 'checked': False}})
    # Notion accetta max 100 blocchi alla creazione
    children = children[:100]

    try:
        page = n_create_page(DB_EXPENSES, props, children)
    except requests.HTTPError as e:
        body = getattr(e.response, 'text', '')[:300]
        return jsonify({'ok': False, 'error': f'{e} {body}'}), 500
    return jsonify({'ok': True, 'page_id': page.get('id'), 'prodotti': tot})

# ── Sync (cron) — Notion → Supabase ─────────────────────────────────────────
@app.route('/api/sync')
def run_sync():
    # Autorizzato se: header del cron Vercel (Authorization: Bearer CRON_SECRET) o ?secret=SYNC_SECRET (manuale)
    cron_ok = request.headers.get('Authorization') == f"Bearer {os.environ.get('CRON_SECRET','')}" and os.environ.get('CRON_SECRET')
    if not cron_ok and request.args.get('secret') != SYNC_SECRET:
        return jsonify({'ok': False, 'error': 'non autorizzato'}), 403
    try:
        import sync
        sync.main()
        return jsonify({'ok': True, 'ts': datetime.datetime.utcnow().isoformat()})
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500

# ── Static (locale) / landing ────────────────────────────────────────────────
@app.route('/')
def home():
    return ('<!doctype html><meta charset=utf-8><body style="font-family:sans-serif;'
            'background:#f7f5f0;color:#9A9183;text-align:center;padding:60px">'
            'The Concept Studio — Portale Operatori</body>')

@app.route('/<path:path>')
def static_files(path):
    full = os.path.join(PUBLIC, path)
    if os.path.isfile(full):
        return send_from_directory(PUBLIC, path)
    return ('Not Found', 404)

# ── Shell HTML (portale operatore) ───────────────────────────────────────────
SHELL = r"""<!doctype html><html lang=it><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1,maximum-scale=1">
<title>The Concept · Operazioni</title>
<link rel=stylesheet href="/portal.css">
</head><body data-token="%TOKEN%">
<header class=hdr>
  <div class=wrap>
    <div>
      <div class=tag>The Concept Studio</div>
      <div class=hi>Ciao, %NOME%</div>
    </div>
    <div class=date id=hdrDate></div>
  </div>
</header>
<main id=app><div class=content><div class=loading>Carico…</div></div></main>
<div id=toast class=toast></div>
<script>
(function(){var d=new Date();var G=['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'];
var M=['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
document.getElementById('hdrDate').textContent=G[d.getDay()]+' '+d.getDate()+' '+M[d.getMonth()];})();
</script>
<script src="/portal.js"></script>
</body></html>"""

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3005))
    print(f"Operations Portal su http://localhost:{port}  (Supabase: {'ok' if SUPABASE_URL else 'no'})")
    app.run(host='0.0.0.0', port=port, debug=True)
