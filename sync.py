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
    a = (prop or {}).get('title', [])
    return a[0]['plain_text'] if a else ''
def text_of(prop):
    a = (prop or {}).get('rich_text', [])
    return a[0]['plain_text'] if a else ''
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

def sb_reconcile(table, current_ids):
    """Rimuove dal mirror le righe non più presenti su Notion (annullate/chiuse/eliminate).
    Sicuro: non fa nulla se non abbiamo id correnti (evita di svuotare per una fetch fallita)."""
    if not current_ids or not (SUPABASE_URL and SUPABASE_KEY):
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

# ── Sync ────────────────────────────────────────────────────────────────────
def sync_operatori():
    pages = n_query(DB_FORNITORI)
    rows = []
    for p in pages:
        pr = p['properties']
        attivita = multi_names(pr.get('Attività'))
        # operatori di campo: pulizia o manutenzioni
        if not any(a in attivita for a in ('Pulizia', 'Pulizia a Fondo', 'Manutenzioni', 'Tuttofare', 'Lavanderia')):
            continue
        email = (pr.get('Email') or {}).get('email')
        rows.append({
            'notion_id': nid(p['id']),
            'nome': title_of(pr.get('Nome')),
            'email': email,
            'token': op_token(nid(p['id'])),
            'attivo': chk_of(pr.get('Attivo?')),
        })
    n = sb_upsert('op_operatori', rows)
    print(f'operatori: {len(rows)} candidati, {n} upsert')
    return rows

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
    rows = []
    for p in pages:
        pr = p['properties']
        stato = status_name(pr.get('Stato'))
        if stato in STATI_ISSUE_CHIUSI:  # solo aperte
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
            'confermato_manutentore': chk_of(pr.get('Confermato dal manutentore')),
            'confermato_il': conf_il,
            'created_time': (pr.get('Created time') or {}).get('created_time'),
        })
    n = sb_upsert('op_issues', rows)
    rm = sb_reconcile('op_issues', [r['notion_id'] for r in rows])
    print(f'issues: {len(rows)} aperte, {n} upsert, {rm} orfane rimosse')
    return rows

def sync_tasks():
    # solo task con un Operatore assegnato e non ancora Done
    pages = n_query(DB_TASKS)
    rows = []
    for p in pages:
        pr = p['properties']
        op = rel_first(pr.get('Operatore'))
        if not op:
            continue
        stato = status_name(pr.get('Status'))
        if stato == 'Done':
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
            'confermato_manutentore': chk_of(pr.get('Confermato dal manutentore')),
            'confermato_il': date_start(pr.get('Confermato il')),
            'created_time': (pr.get('Created time') or {}).get('created_time'),
        })
    n = sb_upsert('op_tasks', rows)
    rm = sb_reconcile('op_tasks', [r['notion_id'] for r in rows])
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
