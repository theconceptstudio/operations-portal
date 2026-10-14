import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import requests
import app as A


def pagina(note='', storico=None):
    props = {'Note operatore': {'rich_text': [{'plain_text': note}] if note else []}}
    if storico is not None:
        props['Storico'] = {'rich_text': [{'plain_text': storico}] if storico else []}
    return {'properties': props}


class TestRegistra(unittest.TestCase):
    def setUp(self):
        self.patch = []
        A.SUPABASE_URL = A.SUPABASE_KEY = None            # nessuna rete
        A.n_get = lambda pid: self.pagina
        def n_patch(pid, props):
            if self.rifiuta_storico and 'Storico' in props:
                raise requests.HTTPError('400')
            self.patch.append(props)
        A.n_patch = n_patch
        self.rifiuta_storico = False

    def test_scrive_note_e_storico_insieme(self):
        self.pagina = pagina('', '')
        r = A._registra('x', 'op_issues', '✅ Intervento confermato')
        p = self.patch[0]
        self.assertIn('Intervento confermato', p['Note operatore']['rich_text'][0]['text']['content'])
        self.assertIn('✅ Manutentore: Intervento confermato', ''.join(b['text']['content'] for b in p['Storico']['rich_text']))
        self.assertIn('Manutentore', r['storico'])

    def test_la_riga_nuova_va_in_cima(self):
        self.pagina = pagina('', '14/10 10:00 · 📅 Data fissata dall\'ufficio: 20/10')
        r = A._registra('x', 'op_issues', 'arrivo domani')
        righe = r['storico'].split('\n')
        self.assertIn('💬 Manutentore: «arrivo domani»', righe[0])
        self.assertIn('Data fissata', righe[1])

    def test_senza_proprieta_storico_le_note_si_scrivono_lo_stesso(self):
        self.pagina = pagina('', None)
        A._registra('x', 'op_issues', 'ciao')
        self.assertNotIn('Storico', self.patch[0])

    def test_notion_rifiuta_lo_storico_le_note_passano(self):
        self.pagina = pagina('', '')
        self.rifiuta_storico = True
        r = A._registra('x', 'op_issues', 'ciao')
        self.assertEqual(len(self.patch), 1)
        self.assertNotIn('Storico', self.patch[0])
        self.assertIn('ciao', r['note'])

    def test_retry_identico_non_duplica_niente(self):
        self.pagina = pagina('', '')
        r1 = A._registra('x', 'op_issues', 'ciao')
        nota = r1['note']
        self.pagina = pagina(nota, r1['storico'])
        self.patch.clear()
        A._registra('x', 'op_issues', 'ciao')
        self.assertEqual(self.patch, [])


if __name__ == '__main__':
    unittest.main()
