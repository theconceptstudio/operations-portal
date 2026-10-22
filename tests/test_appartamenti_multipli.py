import os, sys, unittest
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import app as A
import sync as S

APT = {'a1': {'nome': 'The Collector', 'indirizzo': 'Torre Bianca 18'}, 'a2': {'nome': 'The Architect', 'indirizzo': 'San Lazzaro 10'},
       'a3': {'nome': 'The Essentialist', 'indirizzo': 'Via dei Fabbri 11'}}


class TestMultipli(unittest.TestCase):
    def test_singolo_come_prima(self):
        self.assertEqual(A.etichetta_appartamenti({'appartamento_notion_id': 'a1'}, APT), ('The Collector', 'Torre Bianca 18', 1))
        self.assertEqual(A.etichetta_appartamenti({'appartamento_notion_id': 'a1', 'appartamenti_notion_ids': ['a1']}, APT), ('The Collector', 'Torre Bianca 18', 1))

    def test_tre_appartamenti_una_riga_sola(self):
        n, v, k = A.etichetta_appartamenti({'appartamento_notion_id': 'a1', 'appartamenti_notion_ids': ['a1', 'a2', 'a3']}, APT)
        self.assertEqual((v, k), ('Torre Bianca 18 · San Lazzaro 10 · Via dei Fabbri 11', 3))
        self.assertEqual(n, 'The Collector · The Architect · The Essentialist')

    def test_doppioni_e_ignoti(self):
        n, v, k = A.etichetta_appartamenti({'appartamenti_notion_ids': ['a1', 'a1', 'zz']}, APT)
        self.assertEqual((v, k), ('Torre Bianca 18', 1))

    def test_senza_appartamento(self):
        self.assertEqual(A.etichetta_appartamenti({}, APT), ('—', '', 1))

    def test_rel_all_nell_ordine_e_senza_trattini(self):
        self.assertEqual(S.rel_all({'relation': [{'id': 'aa-bb'}, {'id': 'cc-dd'}]}), ['aabb', 'ccdd'])
        self.assertEqual(S.rel_all(None), [])
        self.assertEqual(S.rel_first({'relation': [{'id': 'aa-bb'}, {'id': 'cc-dd'}]}), 'aabb')


if __name__ == '__main__':
    unittest.main()
