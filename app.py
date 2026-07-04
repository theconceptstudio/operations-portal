#!/usr/bin/env python3
"""
Operations Portal — app operatori/manutentori (Flask).
Accesso senza password via link /o/<token>. Legge il mirror Supabase (op_*),
scrive su Notion solo le conferme (staff propone, ufficio dispone).
"""
import os, datetime
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
    rows = sb_get('op_operatori', {'token': f'eq.{token}', 'select': '*', 'limit': '1'})
    return rows[0] if rows else None

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
    pulizie = sb_get('op_pulizie', {'operatore_notion_id': f'eq.{oid}', 'select': '*', 'order': 'data.asc'})
    issues  = sb_get('op_issues',  {'operatore_notion_id': f'eq.{oid}', 'select': '*', 'order': 'data_intervento.asc'})
    tasks   = sb_get('op_tasks',   {'operatore_notion_id': f'eq.{oid}', 'select': '*', 'order': 'due_date.asc'})
    # arricchisci con nome + indirizzo appartamento
    apt = {a['notion_id']: a for a in sb_get('op_appartamenti', {'select': 'notion_id,nome,indirizzo'})}
    for x in pulizie + issues + tasks:
        a = apt.get(x.get('appartamento_notion_id'))
        x['appartamento'] = (a or {}).get('nome') or '—'
        x['indirizzo'] = (a or {}).get('indirizzo') or ''
    return jsonify({'operatore': op.get('nome'), 'oggi': datetime.date.today().isoformat(),
                    'pulizie': pulizie, 'issues': issues, 'tasks': tasks})

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
    oggi = datetime.date.today().isoformat()
    try:
        n_patch(item_id, {'Confermato dal manutentore': {'checkbox': True},
                          'Confermato il': {'date': {'start': oggi}}})
        _session.patch(f'{SUPABASE_URL}/rest/v1/{table}',
                       headers=_sb_headers({'Prefer': 'return=minimal'}),
                       params={'notion_id': f'eq.{item_id}'},
                       json={'confermato_manutentore': True, 'confermato_il': oggi}, timeout=20)
    except requests.HTTPError as e:
        return jsonify({'ok': False, 'error': str(e)}), 500
    return jsonify({'ok': True})

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
        page = n_get(item_id)
        rt = (page.get('properties', {}).get('Note operatore', {}) or {}).get('rich_text', []) or []
        existing = ''.join(t.get('plain_text', '') for t in rt)
        stamp = datetime.date.today().strftime('%d/%m')
        nuovo = (existing + '\n' if existing else '') + f'[{stamp}] {testo}'
        nuovo = nuovo[-1990:]  # limite rich_text Notion
        n_patch(item_id, {'Note operatore': {'rich_text': [{'text': {'content': nuovo}}]}})
        _session.patch(f'{SUPABASE_URL}/rest/v1/{table}',
                       headers=_sb_headers({'Prefer': 'return=minimal'}),
                       params={'notion_id': f'eq.{item_id}'},
                       json={'note_operatore': nuovo}, timeout=20)
    except requests.HTTPError as e:
        return jsonify({'ok': False, 'error': str(e)}), 500
    return jsonify({'ok': True, 'note_operatore': nuovo})

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
