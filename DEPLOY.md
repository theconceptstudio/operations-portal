# Deploy — Operations Portal (portale operatori)

App Flask su Vercel + Supabase. Notion resta fonte di verità; il portale legge il mirror Supabase (`op_*`) e scrive su Notion solo le conferme.

## 1. Repo GitHub
Crea repo privato **`operations-portal`** su github.com/new, poi:
```bash
cd ~/Documents/Claude/operations-portal
git push -u origin main
```
(Il remote SSH è già impostato su `git@github.com:theconceptstudio/operations-portal.git`.)

## 2. Vercel — Import + Environment Variables
vercel.com → Add New → Project → importa `operations-portal` → imposta:

| Name | Dove |
|---|---|
| `NOTION_TOKEN` | stesso delle altre app (token integrazione Notion) |
| `SUPABASE_URL` | `https://zswuuoosuzpqylnpsuae.supabase.co` |
| `SUPABASE_KEY` | service_role (Supabase → Settings → API → service_role secret) |
| `TOKEN_SECRET` | stringa fissa (valore esatto fornito in chat / `config_local.py`) — NON cambiarla dopo |
| `SYNC_SECRET` | stringa (valore in chat) — per lanciare il sync a mano |
| `CRON_SECRET` | stringa (valore in chat) — Vercel autorizza il cron di sync |

⚠️ I valori segreti NON vanno messi in file tracciati da git: sono in chat + `config_local.py` (gitignored).

Poi Deploy.

## 3. Primo sync (popola il mirror)
Dopo il deploy, lancia una volta il sync (popola operatori/appartamenti/pulizie/issue su Supabase):
```
https://<app>.vercel.app/api/sync?secret=<SYNC_SECRET>
```
Da lì il cron (`vercel.json`, 1×/giorno alle 05:00) lo rinfresca da solo (e tiene sveglio Supabase).

## 4. Link operatori
Ogni operatore in `op_operatori` ha un `token`. Il suo portale è:
```
https://<app>.vercel.app/o/<token>
```
Il token = hash stabile di (notion_id + TOKEN_SECRET). Per ottenere i link: dopo il sync, leggi `op_operatori` (nome, token) su Supabase, oppure chiedi a Claude di estrarli.

## Note
- Auth = link senza password (token). Password eventuale in futuro.
- Foto → Supabase Storage bucket `op-allegati` (pubblico) → URL agganciato agli Allegati della Issue su Notion.
- Conferma "fatto" → setta su Notion `Confermato dal manutentore` + `Confermato il` (l'ufficio poi chiude la issue).
