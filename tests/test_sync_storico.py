import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import sync


def prev(**k):
    d = {'stato': 'Calendarizzato', 'data_intervento': '2026-10-13', 'istruzioni_hash': 'aaa', 'confermato_manutentore': False,
         'operatore_notion_id': 'op1', 'priorita': 'High', 'data_richiesta': None, 'data_agg_il': None, 'data_vista_il': '2026-10-01T00:00:00+00:00'}
    d.update(k)
    return d


def riga(**k):
    d = {'notion_id': 'abc', 'stato': 'Calendarizzato', 'data_intervento': '2026-10-13', 'istruzioni_hash': 'aaa',
         'confermato_manutentore': False, 'operatore_notion_id': 'op1', 'priorita': 'High', 'storico': '', 'created_time': '2026-02-01T00:00:00Z'}
    d.update(k)
    return d


class TestApplica(unittest.TestCase):
    def setUp(self):
        self.scritte = []
        self.esito = 'NUOVO STORICO'
        sync._scrivi_storico = lambda pid, righe: (self.scritte.append((pid, list(righe))) or self.esito)

    def run_(self, rows, prev_, resets=(), chiuse=()):
        sync._applica_storico('op_issues', rows, 'issue', 'data_intervento', prev_, {'op1': 'Juan'}, set(resets), list(chiuse))

    def test_nessun_cambio_non_scrive_e_conserva_i_campi(self):
        r = riga(); self.run_([r], {'abc': prev(data_agg_il='2026-10-05T00:00:00+00:00')})
        self.assertEqual(self.scritte, [])
        self.assertEqual(r['data_agg_il'], '2026-10-05T00:00:00+00:00')
        self.assertEqual(r['data_vista_il'], '2026-10-01T00:00:00+00:00')

    def test_cambio_data_scrive_e_accende_data_cambiata(self):
        r = riga(data_intervento='2026-10-20'); self.run_([r], {'abc': prev()})
        self.assertEqual(len(self.scritte), 1)
        self.assertIn('Data spostata', self.scritte[0][1][0])
        self.assertIsNotNone(r['data_agg_il'])
        self.assertEqual(r['storico'], 'NUOVO STORICO')

    def test_richiesta_manutentore_collegata_e_chiusa(self):
        r = riga(data_intervento='2026-10-20'); self.run_([r], {'abc': prev(data_richiesta='2026-10-20')})
        self.assertIn('come richiesto dal manutentore', self.scritte[0][1][0])
        self.assertIsNone(r['data_richiesta'])

    def test_richiesta_senza_spostamento_resta_in_attesa(self):
        r = riga(); self.run_([r], {'abc': prev(data_richiesta='2026-10-20')})
        self.assertEqual(r['data_richiesta'], '2026-10-20')

    def test_scrittura_fallita_ripristina_i_campi_cosi_la_differenza_ritorna(self):
        self.esito = None
        r = riga(stato='Futuro', data_intervento='2026-10-20'); self.run_([r], {'abc': prev()})
        self.assertEqual(r['stato'], 'Calendarizzato')
        self.assertEqual(r['data_intervento'], '2026-10-13')
        self.assertIsNone(r['data_agg_il'])

    def test_reset_conferma_non_diventa_riapertura(self):
        r = riga(data_intervento='2026-10-20', confermato_manutentore=False)
        self.run_([r], {'abc': prev(confermato_manutentore=True)}, resets={'abc'})
        testo = '\n'.join(self.scritte[0][1])
        self.assertNotIn('Riaperta dall', testo)
        self.assertIn('Conferma tolta: la data è cambiata', testo)

    def test_mirror_vuoto_non_scrive_righe_nuove(self):
        r = riga(); self.run_([r], {})
        self.assertEqual(self.scritte, [])

    def test_riga_nuova_con_mirror_pieno(self):
        r = riga(notion_id='nuova', created_time='2026-10-13T10:00:00Z')
        self.run_([r], {'altra': prev()})
        self.assertIn('Creata', self.scritte[0][1][0])

    def test_tetto_per_giro(self):
        rows = [riga(notion_id=f'n{i}', stato='Futuro') for i in range(40)]
        prev_ = {f'n{i}': prev() for i in range(40)}
        self.run_(rows, prev_)
        self.assertEqual(len(self.scritte), sync.MAX_STORICO_PER_GIRO)
        self.assertEqual(rows[39]['stato'], 'Calendarizzato')        # rimandata al giro dopo

    def test_chiuse(self):
        self.run_([], {'abc': prev()}, chiuse=[('abc', '🔒 Chiusa: Fatto')])
        self.assertEqual(self.scritte, [('abc', ['🔒 Chiusa: Fatto'])])


if __name__ == '__main__':
    unittest.main()
