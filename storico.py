"""Storico: registro automatico di tutto quello che succede su una manutenzione o task.

Vive nella proprieta' Notion "Storico" (piu' recente in alto, righe 'gg/mm HH:MM · testo').
"Note operatore" resta solo testo umano. Qui dentro solo funzioni pure (niente rete), cosi' si testano.

Righe che vede l'operatore: tutte tranne quelle interne (stato, priorita', assegnatario, chiusura),
riconoscibili dall'emoji iniziale.
"""
import datetime
import re
from zoneinfo import ZoneInfo

ROMA = ZoneInfo('Europe/Rome')
MAX_CARATTERI = 14000            # sopra si tagliano le righe piu' vecchie (spezzate in blocchi da Notion, nessun limite da 2000)
BLOCCO = 1900                    # un blocco rich_text Notion accetta 2000 caratteri
INTERNE = ('📌', '🚩', '👤', '🔒')   # non si mostrano al manutentore
EMOJI_PORTALE = ('✅', '↩︎', '📷', '🎥', '📅')   # testi automatici che scrive il portale quando agisce l'operatore


def ora_roma(now=None):
    now = now or datetime.datetime.now(datetime.timezone.utc)
    return now.astimezone(ROMA)


def stamp(now=None):
    return ora_roma(now).strftime('%d/%m %H:%M')


def fmt_data(iso, now=None):
    """'2026-10-13' -> '13/10' (con l'anno se non e' quello corrente)."""
    if not iso:
        return ''
    try:
        d = datetime.date.fromisoformat(str(iso)[:10])
    except ValueError:
        return str(iso)
    oggi = ora_roma(now).date()
    return d.strftime('%d/%m') if d.year == oggi.year else d.strftime('%d/%m/%y')


def aggiungi(esistente, righe, now=None):
    """Mette le nuove righe IN CIMA (i gruppi piu' recenti per primi); dentro un gruppo restano nell'ordine dato."""
    righe = [r.strip() for r in righe if r and r.strip()]
    if not righe:
        return esistente or ''
    s = stamp(now)
    nuove = [f'{s} · {r}' for r in righe]
    testo = '\n'.join(nuove)              # il gruppo di righe nuove sta in cima, nell'ordine in cui e' stato elencato
    if esistente and esistente.strip():
        testo += '\n' + esistente.strip()
    if len(testo) > MAX_CARATTERI:
        testo = testo[:MAX_CARATTERI].rsplit('\n', 1)[0]
    return testo


def blocchi_rich_text(testo):
    """Spezza il testo in blocchi <= BLOCCO caratteri, a capo riga: Notion non accetta 2000+ in un blocco."""
    out, cur = [], ''
    for riga in (testo or '').split('\n'):
        while len(riga) > BLOCCO:
            if cur:
                out.append(cur); cur = ''
            out.append(riga[:BLOCCO]); riga = riga[BLOCCO:]
        if cur and len(cur) + 1 + len(riga) > BLOCCO:
            out.append(cur); cur = riga
        else:
            cur = (cur + '\n' + riga) if cur else riga
    if cur:
        out.append(cur)
    # i blocchi (tranne l'ultimo) finiscono con a capo, cosi' unendoli si ricostruisce il testo identico
    return [{'text': {'content': b + ('\n' if i < len(out) - 1 else '')}} for i, b in enumerate(out)]


def visibile_operatore(testo, max_righe=40):
    """Toglie le righe interne e limita la lunghezza: e' quello che vede il manutentore."""
    righe = []
    for r in (testo or '').split('\n'):
        corpo = re.sub(r'^\d{2}/\d{2} \d{2}:\d{2} · ', '', r).strip()
        if not corpo or corpo.startswith(INTERNE):
            continue
        righe.append(r)
    return '\n'.join(righe[:max_righe])


def riga_da_azione_portale(testo, senza_foto=False):
    """Traduce il testo scritto dal portale nelle Note operatore in una riga di Storico.
    Le azioni automatiche (✅ ↩︎ 📷 🎥 📅) mantengono il loro testo; una nota libera diventa 💬 con il contenuto."""
    t = (testo or '').strip()
    if t.startswith(EMOJI_PORTALE):
        emoji = t.split(' ', 1)[0]
        resto = t[len(emoji):].strip()
        return f'{emoji} Manutentore: {resto}'
    corto = re.sub(r'\s+', ' ', t)
    if len(corto) > 160:
        corto = corto[:157].rstrip() + '...'
    return f'💬 Manutentore: «{corto}»'


def eventi_da_diff(prev, row, date_key, nomi_op=None, richiesta=None, now=None):
    """Confronta lo stato precedente (mirror) con quello letto ora da Notion e torna le righe di Storico.
    `prev` None = riga mai vista. Torna (righe, data_cambiata, richiesta_esaurita)."""
    nomi_op = nomi_op or {}
    righe, data_cambiata, richiesta_esaurita = [], False, False
    if prev is None:
        return righe, data_cambiata, richiesta_esaurita
    # Stato
    if (prev.get('stato') or '') != (row.get('stato') or ''):
        righe.append(f"📌 Stato: {prev.get('stato') or 'nessuno'} → {row.get('stato') or 'nessuno'}")
    # Data
    vecchia, nuova = prev.get(date_key), row.get(date_key)
    if (vecchia or None) != (nuova or None):
        data_cambiata = True
        if vecchia and nuova:
            t = f'📅 Data spostata dall\'ufficio: {fmt_data(vecchia, now)} → {fmt_data(nuova, now)}'
        elif nuova:
            t = f'📅 Data fissata dall\'ufficio: {fmt_data(nuova, now)}'
        else:
            t = f'📅 Data tolta dall\'ufficio (era {fmt_data(vecchia, now)})'
        if richiesta:
            richiesta_esaurita = True
            if nuova and str(nuova)[:10] == str(richiesta)[:10]:
                t += ' (come richiesto dal manutentore)'
            elif nuova:
                t += f' (il manutentore aveva chiesto il {fmt_data(richiesta, now)})'
            else:
                t += f' (il manutentore aveva chiesto il {fmt_data(richiesta, now)})'
        righe.append(t)
    # Istruzioni
    if prev.get('istruzioni_hash') and prev.get('istruzioni_hash') != row.get('istruzioni_hash'):
        righe.append('📝 Istruzioni aggiornate dall\'ufficio' if row.get('istruzioni_hash') else '📝 Istruzioni cancellate dall\'ufficio')
    # Riaperta dall'ufficio (conferma tolta a mano su Notion)
    if prev.get('confermato_manutentore') and not row.get('confermato_manutentore'):
        righe.append('↩︎ Riaperta dall\'ufficio (conferma tolta)')
    # Assegnatario
    vo, no = prev.get('operatore_notion_id'), row.get('operatore_notion_id')
    if (vo or None) != (no or None):
        nv, nn = nomi_op.get(vo, '?') if vo else None, nomi_op.get(no, '?') if no else None
        if nn and nv:
            righe.append(f'👤 Assegnazione cambiata: {nv} → {nn}')
        elif nn:
            righe.append(f'👤 Assegnata a {nn}')
        else:
            righe.append(f'👤 Non piu\' assegnata (era {nv})')
    # Priorita'
    if (prev.get('priorita') or '') != (row.get('priorita') or ''):
        righe.append(f"🚩 Priorità: {prev.get('priorita') or 'nessuna'} → {row.get('priorita') or 'nessuna'}")
    return righe, data_cambiata, richiesta_esaurita


def evento_riga_nuova(row, kind, nomi_op=None, now=None):
    """Riga mai vista nel mirror (solo se il mirror non e' vuoto: lo garantisce il chiamante)."""
    nomi_op = nomi_op or {}
    op = nomi_op.get(row.get('operatore_notion_id')) if row.get('operatore_notion_id') else None
    creata = row.get('created_time')
    recente = False
    if creata:
        try:
            c = datetime.datetime.fromisoformat(str(creata).replace('Z', '+00:00'))
            recente = (ora_roma(now) - c.astimezone(ROMA)) < datetime.timedelta(days=3)
        except ValueError:
            pass
    stato = row.get('stato') or ''
    if kind == 'task':
        return f'👤 Assegnata a {op}' if op else None
    if recente:
        return f'🆕 Creata ({stato})' + (f' · assegnata a {op}' if op else '')
    return f'🔁 Di nuovo aperta ({stato})'


def ultima_riga_uguale(esistente, righe):
    """True se la riga piu recente dello Storico (senza data e ora) coincide con l'ultima riga che stiamo per scrivere:
    serve a non ripetere lo stesso evento a ogni giro."""
    if not esistente or not righe:
        return False
    prima = (esistente.split('\n')[0] or '').strip()
    corpo = re.sub(r'^\d{2}/\d{2} \d{2}:\d{2} · ', '', prima).strip()
    return corpo == str(righe[-1]).strip()
