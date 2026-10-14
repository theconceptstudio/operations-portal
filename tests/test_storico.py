import datetime
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import storico as S

NOW = datetime.datetime(2026, 10, 14, 12, 5, tzinfo=datetime.timezone.utc)   # 14:05 a Roma


def prev(**k):
    d = {'stato': 'Calendarizzato', 'data_intervento': '2026-10-13', 'istruzioni_hash': 'aaa', 'confermato_manutentore': False,
         'operatore_notion_id': 'op1', 'priorita': 'High'}
    d.update(k)
    return d


class TestEventi(unittest.TestCase):
    def ev(self, p, r, **kw):
        return S.eventi_da_diff(p, r, 'data_intervento', {'op1': 'Juan', 'op2': 'Marco'}, now=NOW, **kw)

    def test_nessun_cambio_nessuna_riga(self):
        self.assertEqual(self.ev(prev(), prev()), ([], False, False))

    def test_riga_mai_vista_non_genera_eventi_di_diff(self):
        self.assertEqual(S.eventi_da_diff(None, prev(), 'data_intervento'), ([], False, False))

    def test_caso_stucco_citofono(self):
        r, dc, _ = self.ev(prev(stato='Calendarizzato'), prev(stato='Fase di valutazione', data_intervento=None))
        self.assertEqual(r[0], '📌 Stato: Calendarizzato → Fase di valutazione')
        self.assertIn('Data tolta dall\'ufficio (era 13/10)', r[1])
        self.assertTrue(dc)
        r, dc, _ = self.ev(prev(stato='Fase di valutazione', data_intervento=None), prev(stato='Calendarizzato', data_intervento='2026-10-20'))
        self.assertEqual(r, ['📌 Stato: Fase di valutazione → Calendarizzato', '📅 Data fissata dall\'ufficio: 20/10'])

    def test_data_spostata_e_richiesta_del_manutentore(self):
        r, dc, esaurita = self.ev(prev(), prev(data_intervento='2026-10-20'), richiesta='2026-10-20')
        self.assertEqual(r, ['📅 Data spostata dall\'ufficio: 13/10 → 20/10 (come richiesto dal manutentore)'])
        self.assertTrue(dc and esaurita)
        r, _, esaurita = self.ev(prev(), prev(data_intervento='2026-10-22'), richiesta='2026-10-20')
        self.assertIn('il manutentore aveva chiesto il 20/10', r[0])
        self.assertTrue(esaurita)

    def test_istruzioni_e_riapertura_e_assegnatario_e_priorita(self):
        r, _, _ = self.ev(prev(confermato_manutentore=True), prev(istruzioni_hash='bbb', confermato_manutentore=False,
                                                                  operatore_notion_id='op2', priorita='Low'))
        self.assertEqual(r, ['📝 Istruzioni aggiornate dall\'ufficio', '↩︎ Riaperta dall\'ufficio (conferma tolta)',
                             '👤 Assegnazione cambiata: Juan → Marco', '🚩 Priorità: High → Low'])

    def test_prima_impronta_istruzioni_non_e_un_cambio(self):
        self.assertEqual(self.ev(prev(istruzioni_hash=''), prev(istruzioni_hash='bbb'))[0], [])

    def test_riga_nuova(self):
        row = {'stato': 'Segnalato', 'created_time': '2026-10-13T10:00:00Z', 'operatore_notion_id': 'op1'}
        self.assertEqual(S.evento_riga_nuova(row, 'issue', {'op1': 'Juan'}, NOW), '🆕 Creata (Segnalato) · assegnata a Juan')
        row['created_time'] = '2026-02-01T10:00:00Z'
        self.assertEqual(S.evento_riga_nuova(row, 'issue', {}, NOW), '🔁 Di nuovo aperta (Segnalato)')
        self.assertEqual(S.evento_riga_nuova(row, 'task', {'op1': 'Juan'}, NOW), '👤 Assegnata a Juan')


class TestTesto(unittest.TestCase):
    def test_piu_recente_in_alto_e_ora_di_roma(self):
        t = S.aggiungi('', ['📌 uno', '📅 due'], NOW)
        self.assertEqual(t, '14/10 14:05 · 📌 uno\n14/10 14:05 · 📅 due')
        t2 = S.aggiungi(t, ['📝 tre'], NOW)
        self.assertTrue(t2.startswith('14/10 14:05 · 📝 tre\n14/10 14:05 · 📌 uno'))
        self.assertEqual(S.aggiungi('x', [], NOW), 'x')

    def test_taglio_alle_righe_vecchie(self):
        vecchio = '\n'.join('01/01 10:00 · riga %d %s' % (i, 'x' * 90) for i in range(400))
        t = S.aggiungi(vecchio, ['nuova'], NOW)
        self.assertLessEqual(len(t), S.MAX_CARATTERI)
        self.assertIn('nuova', t.split('\n')[0])
        self.assertTrue(t.split('\n')[-1].startswith('01/01'))        # taglia a riga intera

    def test_blocchi_ricostruiscono_il_testo(self):
        testo = '\n'.join('14/10 14:05 · riga %d %s' % (i, 'y' * 60) for i in range(120))
        bl = S.blocchi_rich_text(testo)
        self.assertTrue(all(len(b['text']['content']) <= 2000 for b in bl))
        self.assertEqual(''.join(b['text']['content'] for b in bl), testo)
        lunga = S.blocchi_rich_text('z' * 5000)                  # riga mostruosa: non succede, ma nessun blocco supera il limite
        self.assertTrue(all(len(b['text']['content']) <= 2000 for b in lunga))

    def test_vista_operatore_nasconde_le_righe_interne(self):
        t = '14/10 14:05 · 📌 Stato: A → B\n14/10 14:04 · 📅 Data fissata dall\'ufficio: 20/10\n14/10 14:03 · 🚩 Priorità: Low → High\n14/10 14:02 · 👤 Assegnata a X\n14/10 14:01 · ✅ Manutentore: Intervento confermato'
        v = S.visibile_operatore(t)
        self.assertEqual(v.count('\n'), 1)
        self.assertNotIn('Stato', v); self.assertNotIn('Priorità', v); self.assertNotIn('Assegnata', v)

    def test_riga_da_azione_portale(self):
        self.assertEqual(S.riga_da_azione_portale('✅ Intervento confermato (senza foto)'), '✅ Manutentore: Intervento confermato (senza foto)')
        self.assertEqual(S.riga_da_azione_portale('↩︎ Riaperta'), '↩︎ Manutentore: Riaperta')
        self.assertEqual(S.riga_da_azione_portale('📅 Richiesta ricalendarizzazione al Gio 13 agosto'), '📅 Manutentore: Richiesta ricalendarizzazione al Gio 13 agosto')
        self.assertEqual(S.riga_da_azione_portale('arrivo domani'), '💬 Manutentore: «arrivo domani»')
        self.assertTrue(S.riga_da_azione_portale('a' * 400).endswith('...»'))


if __name__ == '__main__':
    unittest.main()
