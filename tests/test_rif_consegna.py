"""Consegna in appartamento: conferma e annullo ("Non ancora consegnato").

L'annullo deve togliere la spunta su Notion e svuotare la data, solo per voci
"Mostra su app operatore" dei suoi appartamenti (stessa regola della conferma)."""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import app as A


def pagina(mostra=True, apt='aa11'):
    return {'properties': {
        'Mostra su app operatore': {'checkbox': mostra},
        'Appartamento': {'relation': [{'id': apt}] if apt else []},
    }}


class TestRifConsegna(unittest.TestCase):
    def setUp(self):
        self.scritti = []
        self.pagine = {}
        A.operatore_by_token = lambda t: {'notion_id': 'op1'} if t == 'ok' else None
        A._op_apt_ids = lambda oid: {'aa11'}
        A.n_get = lambda pid: self.pagine[pid]
        A.n_patch = lambda pid, props: self.scritti.append((pid, props))
        self.c = A.app.test_client()

    def post(self, ep, body, token='ok'):
        return self.c.post(f'/api/o/{token}/{ep}', json=body)

    def test_conferma_spunta_e_data(self):
        self.pagine['p1'] = pagina()
        r = self.post('rif-consegna', {'ids': ['p1'], 'data': '2026-11-11'}).get_json()
        self.assertEqual((r['confermati'], r['errori']), (1, 0))
        props = self.scritti[0][1]
        self.assertTrue(props['Consegnato in appartamento']['checkbox'])
        self.assertEqual(props['Consegnato in appartamento il']['date']['start'], '2026-11-11')

    def test_annullo_toglie_spunta_e_svuota_la_data(self):
        self.pagine['p1'] = pagina()
        r = self.post('rif-annulla-consegna', {'ids': ['p1']}).get_json()
        self.assertEqual((r['ok'], r['annullati'], r['errori']), (True, 1, 0))
        props = self.scritti[0][1]
        self.assertIs(props['Consegnato in appartamento']['checkbox'], False)
        self.assertIsNone(props['Consegnato in appartamento il']['date'])

    def test_annullo_non_tocca_voci_non_visibili_o_di_altri_appartamenti(self):
        self.pagine['nascosta'] = pagina(mostra=False)
        self.pagine['altrui'] = pagina(apt='bb22')
        r = self.post('rif-annulla-consegna', {'ids': ['nascosta', 'altrui']}).get_json()
        self.assertEqual((r['annullati'], r['errori']), (0, 2))
        self.assertEqual(self.scritti, [])

    def test_annullo_senza_voci_e_token_sbagliato(self):
        self.assertEqual(self.post('rif-annulla-consegna', {'ids': []}).status_code, 400)
        self.assertEqual(self.post('rif-annulla-consegna', {'ids': ['p1']}, token='no').status_code, 404)

    def test_annullo_piu_voci_una_sola_con_errore(self):
        self.pagine['p1'] = pagina()
        self.pagine['p2'] = pagina(mostra=False)
        r = self.post('rif-annulla-consegna', {'ids': ['p1', 'p2']}).get_json()
        self.assertEqual((r['annullati'], r['errori']), (1, 1))


if __name__ == '__main__':
    unittest.main()
