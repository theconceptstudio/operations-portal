const TOKEN = document.body.dataset.token;
const API = `/api/o/${TOKEN}`;
const DOW = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'];
const MESI = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
const MESI3 = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
const P_COLOR = {'Very High':'#b23b2e','High':'#c8792f','Medium':'#3b6ea5','Low':'#3f8f5e'};
const P_LBL = {'Very High':'Urgente','High':'Alta','Medium':'Media','Low':'Bassa'};

/* Icone Lucide (stroke, no emoji) */
const ICN = {
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  key:'<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.3-9.3"/><path d="m16 5 3 3"/><path d="m13 8 3 3"/>',
  luggage:'<rect x="6" y="7" width="12" height="14" rx="2"/><path d="M9 7V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"/><path d="M9 21v1M15 21v1"/>',
  calendar:'<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M16 3v4M8 3v4M4 10h16"/>',
  camera:'<path d="M14.5 5h-5L8 7.5H5A2 2 0 0 0 3 9.5v8A2 2 0 0 0 5 19.5h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3.2"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  message:'<path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 20.5l1.5-5.5A8.5 8.5 0 1 1 21 11.5Z"/>',
  chevronL:'<path d="m15 6-6 6 6 6"/>',
  chevronR:'<path d="m9 6 6 6-6 6"/>',
  chevronD:'<path d="m6 9 6 6 6-6"/>',
  chevronU:'<path d="m6 15 6-6 6 6"/>',
  pin:'<path d="M20 10c0 5.5-8 11-8 11s-8-5.5-8-11a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.6"/>',
  wrench:'<path d="M15 6a4 4 0 0 0 5.2 5.2L14 17.4a2.3 2.3 0 0 1-3.3-3.3L16.8 8A4 4 0 0 0 15 6l-3 3-2-2 3-3Z"/>',
  sparkles:'<path d="M12 4l1.6 4.9L18.5 10.5 13.6 12.1 12 17l-1.6-4.9L5.5 10.5l4.9-1.6z"/><path d="M18 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  clipboard:'<rect x="8" y="3" width="8" height="4" rx="1"/><path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/><path d="m9.5 14 2 2 3.5-3.5"/>',
  broom:'<path d="M4 20l7-7"/><path d="M13 11l4-4a2.8 2.8 0 0 1 4 4l-4 4"/><path d="M11 13l3 3-4 4H6l-2-2 4-4z"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  film:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4"/>',
  cart:'<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3h2l2.2 12.5a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  box:'<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  arrowUp:'<path d="M12 19V5M6 11l6-6 6 6"/>',
  close:'<path d="M18 6 6 18M6 6l12 12"/>',
  truck:'<path d="M3 16V6h11v10"/><path d="M14 9h4l3 3.5V16h-7"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>',
  play:'<path d="M8 5.5v13l11-6.5z"/>',
  download:'<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19h14"/>',
  bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  history:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 4v4h4"/><path d="M12 8v4l3 2"/>',
  clip:'<path d="M20.5 11.5 12 20a5 5 0 0 1-7-7l8.5-8.5a3.4 3.4 0 0 1 4.8 4.8L9.9 17.7a1.8 1.8 0 0 1-2.6-2.6L15 7.5"/>',
};
function ic(name, cls){ return `<svg class="ic${cls?' '+cls:''}" viewBox="0 0 24 24">${ICN[name]||''}</svg>`; }

let DATA=null, TAB='dafare', SEL=todayISO(), WEEK0=mondayOf(todayISO());
let NOTE_OPEN=null, RESCHED_OPEN=null, SELMODE=false, SELECTED=new Set(), UPLOADS={}, SEL_RESCHED_DATE='';
// OPEN_APTS = gruppi che l'operatore ha aperto a mano; CLOSED_APTS = quelli che ha
// richiuso anche se avevano arretrati (di default li apriamo noi).
let OPEN_APTS=new Set(), CLOSED_APTS=new Set(), OPEN_CARDS=new Set();
let PVIEW='giorno';
function setPView(v){ PVIEW=v; render(); }

/* ── Rifornimenti (carrello) ─────────────────────────────────────────── */
let RIF_APTS=null, RIF_APT=null, RIF_APTVIA='', RIF_CART=new Set(), RIF_CUSTOM=[],
    RIF_URG='2w', RIF_CARTOPEN=false, RIF_URGENT=new Set(),
    RIF_VIEW='storico', RIF_STORICO=null, RIF_DONE=null, RIF_HQ='', RIF_HAPT=null, RIF_APTQ='',
    RIF_HFASE=null, RIF_DSEL=new Set(), RIF_DDATE='', RIF_CURSOR=null, RIF_HASMORE=false;
/* Catalogo prodotti per area (pallino colore). Andres affinerà nel tempo. */
const CATALOG=[
  {cat:'Bagno / Anticalcare', color:'#3b6ea5', items:['Anticalcare bagno forte «Jet»','Gel disincrostante','Strisce WC igiene garanzia']},
  {cat:'Superfici / Cucina', color:'#3f8f5e', items:['Multisuperficie al limone','Antistatico per la polvere','Detergente vetri','Detergente sbiancante (cloro/candeggina)']},
  {cat:'Pavimenti', color:'#8a6d3b', items:['Detersivo pavimenti legno','Detersivo pavimenti marmo','Detersivo pavimenti piastrelle / gres']},
  {cat:'Panni & Spugne', color:'#c8792f', items:['Panni microfibra colorati','Panni microfibra vetri blu','Panni Swiffer','Garze Swiffer polvere','Spugne magiche (togli segni dai muri)','Paglietta metallo abrasiva','Frangia di ricambio mocio (classico)','Panno di ricambio mocio piatto']},
  {cat:'Carta & sacchi', color:'#9A9183', items:['Carta igienica','Sacchi spazzatura grandi (neri)','Sacchi spazzatura medi (ospite)','Sacchi piccoli (cestini bagno)']},
  {cat:'Ambiente', color:'#2aa198', items:['Profumatore d\'ambiente','Disinfettante tessuti / antiodore','Smacchiatore tessuti (spray antimacchia)']},
  {cat:'Manutenzione cucina (staff)', color:'#7A5AA8', items:['Sale lavastoviglie','Brillantante']},
  {cat:'Cortesia & dispensa ospite', color:'#b23b2e', items:['Shampoo','Balsamo','Bagnoschiuma / Gel doccia','Sapone mani','Detersivo piatti','Spugne cucina','Capsule lavastoviglie','Capsule/detersivo lavatrice','Canovacci bianchi (asciugamani cucina)','Panno microfibra bianco (per ospiti)','Caffè','Zucchero','Sale fino','Sale grosso','Pepe nero','Olio EVO','Tè e tisane','Acqua (bottiglie)']},
];
function rifCatOf(name){ const g=CATALOG.find(c=>c.items.includes(name)); return g?g.cat:'Altro'; }
function rifColorOf(name){ const g=CATALOG.find(c=>c.items.includes(name)); return g?g.color:'#9A9183'; }
function rifNorm(s){ return (s||'').toLowerCase().replace(/[«»"']/g,'').replace(/\s+/g,' ').trim(); }
const OFFICE_WA=''; // numero WhatsApp back office (es. '393331234567'); vuoto = l'operatore sceglie il contatto

function todayISO(){ return iso(new Date()); }
function pad(n){ return String(n).padStart(2,'0'); }
function iso(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
function parseISO(s){ const a=s.split('-').map(Number); return new Date(a[0],a[1]-1,a[2]); }
function addDays(s,n){ const d=parseISO(s); d.setDate(d.getDate()+n); return iso(d); }
function mondayOf(s){ const d=parseISO(s); const w=(d.getDay()+6)%7; d.setDate(d.getDate()-w); return iso(d); }
function dLong(s){ const d=parseISO(s); return DOW[d.getDay()]+' '+d.getDate()+' '+MESI[d.getMonth()]; }
function dShort(s){ const d=parseISO(s); return d.getDate()+' '+MESI3[d.getMonth()]; }
function esc(s){ return (s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

const CACHE_KEY='tcs_portal_'+TOKEN;
function saveCache(){ try{ localStorage.setItem(CACHE_KEY, JSON.stringify(DATA)); }catch(_){} }

/* Ricorda dove sei (tab + sezione Ordina/Monitora) tra un refresh e l'altro:
   riaprire l'app o ricaricare la pagina NON ti riporta piu' su "Da fare". */
const UI_KEY='tcs_ui_'+TOKEN;
function saveUI(){ try{ localStorage.setItem(UI_KEY, JSON.stringify({tab:TAB, rifView:RIF_VIEW})); }catch(_){} }
(function restoreUI(){ try{ const s=JSON.parse(localStorage.getItem(UI_KEY)||'{}');
  if(s.tab==='dafare'||s.tab==='pulizie'||s.tab==='rifornimenti') TAB=s.tab;
  if(s.rifView==='catalogo'||s.rifView==='storico') RIF_VIEW=s.rifView;
}catch(_){} })();

async function load(){
  // Se al refresh sei ripartito sulla tab Rifornimenti, carica i suoi dati
  // (altrimenti resteresti su "Carico…" perche' setTab non e' stato chiamato).
  if(TAB==='rifornimenti'){ rifEnsureApts(); rifCacheStorico(); if(RIF_STORICO===null) rifLoadStorico(); }
  // 1. mostra subito l'ultimo stato salvato (apertura istantanea)
  try{ const c=localStorage.getItem(CACHE_KEY); if(c){ DATA=JSON.parse(c); render(); setupAutoRefresh(); } }catch(_){}
  // 2. aggiorna dal server in sottofondo
  try{
    const r=await fetch(`${API}/data`,{cache:'no-store'}); const fresh=await r.json();
    if(fresh.error){ if(!DATA) document.getElementById('app').innerHTML='<div class="content"><div class="empty-state">Sessione non valida.</div></div>'; return; }
    DATA=fresh; saveCache(); render(); setupAutoRefresh();
    triggerSync();  // all'apertura forza un sync Notion→mirror, poi riallinea
  }catch(e){ if(!DATA) document.getElementById('app').innerHTML='<div class="content"><div class="empty-state">Connessione non riuscita. Riprova.</div></div>'; }
}

/* Forza un sync Notion→mirror lato server (con freno), poi riallinea la vista */
let _syncing=false;
async function triggerSync(){
  if(_syncing || PENDING || NOTE_OPEN || RESCHED_OPEN || SELMODE) return;
  _syncing=true;
  try{ await fetch(`${API}/refresh`); }catch(_){}
  _syncing=false;
  silentRefresh();
}

/* Auto-refresh: riallinea al mirror al ritorno in primo piano e ogni 90s.
   Silenzioso, preserva tab/filtro/giorno; salta se c'è un annullo/selezione/nota in corso. */
let _refreshing=false;
async function silentRefresh(){
  if(_refreshing || PENDING || NOTE_OPEN || RESCHED_OPEN || SELMODE || document.hidden) return;
  if(RIF_CARTOPEN || LB.open || RIF_DSEL.size || RIF_NOTA_OPEN) return;  // non ricostruire nel carrello, allegati, selezione consegne o mentre scrivi una nota
  const ae=document.activeElement;  // né mentre sta digitando (ricerca / prodotto custom)
  if(ae && /^(INPUT|TEXTAREA)$/.test(ae.tagName)) return;
  _refreshing=true;
  try{
    const r=await fetch(`${API}/data`,{cache:'no-store'}); const fresh=await r.json();
    if(!fresh.error){ DATA=fresh; saveCache(); render(); }
  }catch(_){}
  // Monitora aperta: riallinea anche gli ordini (solo se non ha caricato pagine vecchie)
  if(TAB==='rifornimenti'&&RIF_VIEW==='storico'&&!RIF_LOADEDMORE&&!RIF_DSEL.size) rifLoadStorico();
  _refreshing=false;
}
let _autoOn=false;
function setupAutoRefresh(){
  if(_autoOn) return; _autoOn=true;
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden) triggerSync(); });
  window.addEventListener('focus', triggerSync);
  setInterval(silentRefresh, 90000);
}

function counts(){
  return {p:(DATA.pulizie||[]).filter(x=>x.stato!=='Completata').length,
          m:(DATA.issues||[]).length, t:(DATA.tasks||[]).length};
}

/* La pagina si ridisegna tutta a ogni tocco. Se non facciamo niente, chiudendo una
   scheda in fondo il documento si accorcia e lo schermo risale da solo: l'operatore
   perde il punto in cui stava e si ritrova in cima. Qui teniamo fermo un elemento
   di riferimento (la riga toccata): dopo il ridisegno lo rimettiamo esattamente
   alla stessa altezza in cui era. */
let ANCORA=null;
function ancoraA(chiave){
  const el=document.querySelector(`[data-k="${chiave}"]`);
  ANCORA = el ? {chiave, top: el.getBoundingClientRect().top} : null;
}
function ripristinaAncora(){
  if(!ANCORA) return false;
  const el=document.querySelector(`[data-k="${ANCORA.chiave}"]`);
  const trovato=!!el;
  if(el){
    const delta=el.getBoundingClientRect().top - ANCORA.top;
    if(delta) window.scrollBy(0, delta);
  }
  ANCORA=null;
  return trovato;
}
/* Da chiamare solo quando si vuole DAVVERO ripartire dall'alto (cambio di tab). */
let VAI_SU=false;
function vaiSu(){ VAI_SU=true; }

function render(){
  const yPrima=window.scrollY;
  const c=counts();
  const nCart=RIF_CART.size+RIF_CUSTOM.length;
  const view = TAB==='dafare'?viewDaFare() : TAB==='pulizie'?viewPulizie() : viewRifornimenti();
  document.getElementById('app').innerHTML=
    sheetFoto()+
    `<div class="tabs"><div class="wrap">
      <button class="tab ${TAB==='dafare'?'on':''}" onclick="setTab('dafare')">${ic('clipboard')}Da fare <span class="n">${c.m+c.t}</span></button>
      <button class="tab ${TAB==='pulizie'?'on':''}" onclick="setTab('pulizie')">${ic('broom')}Pulizie</button>
      <button class="tab ${TAB==='rifornimenti'?'on':''}" onclick="setTab('rifornimenti')">${ic('cart')}Rifornimenti${nCart?` <span class="n">${nCart}</span>`:''}</button>
    </div></div>
    <div class="content">${view}</div>`;
  if(TAB==='rifornimenti' && RIF_VIEW==='catalogo' && RIF_APT && RIF_Q) rifApplyFilter();
  if(TAB==='rifornimenti' && RIF_VIEW==='catalogo' && !RIF_APT && RIF_APTQ) rifAptApplyFilter();
  if(TAB==='rifornimenti' && RIF_VIEW==='storico' && RIF_HQ) histApplyFilter();
  // 1) ancora precisa su un elemento (apri/chiudi una scheda) 2) altrimenti si
  // resta esattamente dove si era 3) solo il cambio tab riparte dall'alto.
  const conAncora=ripristinaAncora();
  if(VAI_SU){ VAI_SU=false; window.scrollTo(0,0); }
  else if(!conAncora) window.scrollTo(0, yPrima);
}
function setTab(t){ TAB=t; OPEN_CARDS.clear(); saveUI(); vaiSu(); if(t==='rifornimenti'){ RIF_VIEW='storico'; rifEnsureApts(); rifCacheStorico(); rifLoadStorico(); } render(); }
function goOggi(){ WEEK0=mondayOf(todayISO()); SEL=todayISO(); render(); }
function toggleApt(k, eraAperto){
  ancoraA('apt:'+k);
  if(eraAperto){ CLOSED_APTS.add(k); OPEN_APTS.delete(k); }
  else { OPEN_APTS.add(k); CLOSED_APTS.delete(k); }
  render();
}
function toggleCard(k){
  ancoraA(k);
  const opening=!OPEN_CARDS.has(k);
  if(opening) OPEN_CARDS.add(k); else OPEN_CARDS.delete(k);
  render();
  if(opening){
    const i=k.indexOf(':'), kind=k.slice(0,i), id=k.slice(i+1);
    fetchAllegati(kind, id);            // allegati freschi (anche dall'ufficio)
    segnaLetta(kind, id);               // spegne "istruzioni aggiornate"
  }
}
/* L'ha letta: il segnale si spegne da solo. Su Notion non cambia niente. */
function segnaLetta(kind,id){
  const arr=kind==='issue'?DATA.issues:DATA.tasks;
  const it=(arr||[]).find(x=>x.notion_id===id);
  if(!it || !istrNuove(it)) return;
  it.istruzioni_viste_il=new Date().toISOString();   // subito, senza aspettare il server
  fetch(`${API}/letta`,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({kind,id})}).catch(()=>{});
}
/* Swipe della settimana col dito */
let _wkX=null;
function wkTouchStart(e){ _wkX=e.changedTouches[0].clientX; }
function wkTouchEnd(e){ if(_wkX==null) return; const dx=e.changedTouches[0].clientX-_wkX; _wkX=null;
  if(Math.abs(dx)>45) shiftWeek(dx<0?1:-1); }

/* Conferma multipla */
function toggleSelMode(){ SELMODE=!SELMODE; SELECTED.clear(); if(SELMODE&&!SEL_RESCHED_DATE) SEL_RESCHED_DATE=addDays(todayISO(),1); render(); }
function pickReschedMulti(){
  if(!SELECTED.size){ toast('Seleziona prima le task'); return; }
  const inp=document.getElementById('selresched'); if(!inp) return;
  inp.value=SEL_RESCHED_DATE||addDays(todayISO(),1);
  if(inp.showPicker){ try{ inp.showPicker(); return; }catch(_){} }
  inp.click();
}
function reschedMultiPicked(dv){ if(!dv) return; SEL_RESCHED_DATE=dv; reschedMulti(); }
async function reschedMulti(){
  const dv=SEL_RESCHED_DATE; if(!dv){ toast('Scegli una data'); return; }
  const keys=[...SELECTED]; if(!keys.length) return;
  SELMODE=false; SELECTED=new Set();
  const testo=`📅 Richiesta ricalendarizzazione al ${dLong(dv)}`;
  render(); toast(`Invio ${keys.length} richiest${keys.length===1?'a':'e'}…`);
  let ok=0;
  for(const k of keys){ const i=k.indexOf(':'), kind=k.slice(0,i), id=k.slice(i+1);
    const arr=kind==='issue'?DATA.issues:DATA.tasks; const it=(arr||[]).find(x=>x.notion_id===id);
    try{ const r=await fetch(`${API}/nota`,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({kind,id,testo})}); const j=await r.json(); if(j.ok){ ok++; if(it) it.note_operatore=j.note_operatore; } }catch(_){}
  }
  render(); toast(ok?`${ok} richieste inviate all'ufficio`:'Non riuscito, riprova');
}
function toggleSel(kind,id){ const k=kind+':'+id; if(SELECTED.has(k)) SELECTED.delete(k); else SELECTED.add(k); render(); }

/* ── Riepilogo su WhatsApp degli interventi selezionati, allegati inclusi ──
   Il link wa.me porta solo testo: per mandare anche le foto usiamo la condivisione
   nativa del telefono (che ha WhatsApp tra le opzioni). Dove non c'è, ripieghiamo
   su testo + download degli allegati, così restano comunque inoltrabili a mano. */
function selItems(){
  return [...SELECTED].map(k=>{ const i=k.indexOf(':'), kind=k.slice(0,i), id=k.slice(i+1);
    const arr=kind==='issue'?DATA.issues:DATA.tasks;
    const it=(arr||[]).find(x=>x.notion_id===id);
    return it?Object.assign({},it,{_kind:kind,_key:k}):null; }).filter(Boolean);
}
/* Testo per WhatsApp: gli asterischi diventano grassetto, così il manutentore
   distingue a colpo d'occhio il titolo e l'indirizzo. Niente nome appartamento:
   in cantiere serve la via, non "The Maison". */
/* Riepilogo INTERVENTI (Da fare). Emoji su mobile; su laptop versione pulita
   in grassetto (le emoji nel compose di WhatsApp Web davano problemi).
   Separatore a linea tra un intervento e l'altro, per leggere a colpo d'occhio. */
const IS_MOBILE=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const WA_SEP='───────────';
function waTestoInterventi(items){
  const E=IS_MOBILE;
  const out=[items.length===1?(E?'*🔧 INTERVENTO DA FARE*':'*Intervento da fare*')
                             :(E?`*🔧 INTERVENTI DA FARE · ${items.length}*`:`*Interventi da fare (${items.length})*`),''];
  items.forEach((x,n)=>{
    const t=x._kind==='issue'?(x.descrizione||'Intervento'):(x.nome||'Task');
    const via=x.indirizzo||x.appartamento||''; const d=dateOf(x);
    out.push(`*${n+1}) ${E?t.toUpperCase():t}*`);
    if(via) out.push(E?`📍 *${via}*`:via);
    if(E){
      if(d) out.push(`📅 ${dLong(d)}`);
      if(x.priorita) out.push(`⚠️ Priorità: ${P_LBL[x.priorita]||x.priorita}`);
    }else{
      const r=[d?dLong(d):null, x.priorita?('Priorità: '+(P_LBL[x.priorita]||x.priorita)):null].filter(Boolean).join(' · ');
      if(r) out.push(r);
    }
    const istr=(x.istruzioni||'').trim(); if(istr) out.push((E?'📝 ':'Istruzioni: ')+istr);
    const na=(ALLEG[x._key]||[]).length; if(na) out.push((E?'📎 ':'Allegati: ')+na+(E?' foto in arrivo':' in arrivo'));
    out.push(WA_SEP);
  });
  return out.join('\n').replace(new RegExp(WA_SEP+'$'),'').trim();
}

function safeName(s){ return (s||'').replace(/[\\/:*?"<>|]/g,'-').replace(/\s+/g,' ').trim().slice(0,60); }
async function raccogliAllegati(items,onProg){
  // 1) leggo le liste allegati degli interventi scelti
  for(const x of items){
    if(ALLEG[x._key]) continue;
    try{ const r=await fetch(`${API}/allegati/${x._kind}/${x.notion_id}`,{cache:'no-store'});
      const j=await r.json(); if(j&&j.ok) ALLEG[x._key]=j.allegati; }catch(_){}
  }
  // 2) elenco piatto, così so quanti file sono e posso mostrare l'avanzamento
  const da=[];
  for(const x of items){
    const list=(ALLEG[x._key]||[]).filter(a=>a&&a.url);
    const t=x._kind==='issue'?(x.descrizione||'Intervento'):(x.nome||'Task');
    const via=x.indirizzo||x.appartamento||'';
    list.forEach((a,i)=>da.push({a,i,n:list.length,t,via}));
  }
  if(onProg) onProg(0,da.length);
  // 3) scarico uno a uno, aggiornando la barra
  const files=[];
  for(let k=0;k<da.length;k++){
    const {a,i,n,t,via}=da[k];
    const est=((allegName(a,i).split('.').pop())||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,4)||'jpg';
    // il file porta il nome dell'intervento: chi lo riceve capisce a cosa si riferisce
    const nome=safeName(`${via} - ${t}`)+(n>1?` (${i+1})`:'')+'.'+est;
    try{
      const r=await fetch(`${API}/file?u=${encodeURIComponent(a.url)}&n=${encodeURIComponent(nome)}`);
      if(r.ok){ const b=await r.blob(); files.push(new File([b],nome,{type:b.type||'application/octet-stream'})); }
    }catch(_){}
    if(onProg) onProg(k+1,da.length);
  }
  return files;
}

/* Barra di avanzamento: scaricare 7 interventi di foto richiede secondi,
   e senza un segnale visibile sembra che non stia succedendo nulla. */
function progOpen(){
  progClose();
  const el=document.createElement('div'); el.id='waprog'; el.className='waprog';
  el.innerHTML=`<div class="wpcard"><div class="wptxt" id="wptxt">Preparo gli allegati…</div>
    <div class="wpbar"><div class="wpfill" id="wpfill"></div></div></div>`;
  document.body.appendChild(el);
}
function progSet(n,m){
  const t=document.getElementById('wptxt'), f=document.getElementById('wpfill');
  if(t) t.textContent = m ? `Scarico gli allegati… ${n} di ${m}` : 'Cerco gli allegati…';
  if(f) f.style.width = (m? Math.round(100*n/m) : 8)+'%';
}
function progClose(){ const el=document.getElementById('waprog'); if(el) el.remove(); }
function scaricaBlobs(files){
  files.forEach((f,i)=>setTimeout(()=>{
    const url=URL.createObjectURL(f), a=document.createElement('a');
    a.href=url; a.download=f.name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),5000);
  }, i*400));
}
/* Solo testo: parte subito, funziona ovunque. Il link di WhatsApp non puo' portare file. */
function inviaWaSelezione(){
  const items=selItems();
  if(!items.length){ toast('Seleziona prima gli interventi'); return; }
  window.open('https://wa.me/?text='+encodeURIComponent(waTestoInterventi(items)),'_blank','noopener');
}

/* Allegati in due tempi: prima li prepariamo, poi l'utente tocca "Condividi".
   Su iPhone la condivisione nativa vale solo se parte NELL'ISTANTE del tocco:
   se la lanciassimo dopo il download, iOS la blocca. Per questo servono due passaggi. */
let WA_FILES=[], _waBusy=false, WA_TESTO='';

/* "Inoltra su WhatsApp" da una scheda. Gli allegati sono di fatto le istruzioni
   dell'intervento (foto del pezzo, del punto da sistemare), quindi devono partire
   insieme al messaggio.
   ⚠️ Il link wa.me porta SOLO testo: per allegare davvero i file serve la
   condivisione nativa del telefono, e su iPhone quella vale solo se parte
   nell'istante del tocco. Per questo, quando ci sono allegati, si passa dal
   foglio: prima li prepariamo, poi l'utente tocca "Inoltra". */
function apriWaTesto(items){
  window.open('https://wa.me/?text='+encodeURIComponent(waTestoInterventi(items)),'_blank','noopener');
}
async function inoltraWa(kind,id){
  if(_waBusy) return;
  const arr=kind==='issue'?DATA.issues:DATA.tasks;
  const it=(arr||[]).find(x=>x.notion_id===id); if(!it) return;
  const x=Object.assign({},it,{_kind:kind,_key:kind+':'+id});
  if(!ALLEG[x._key]){                      // la lista non e' ancora arrivata: la chiedo
    try{ const r=await fetch(`${API}/allegati/${kind}/${id}`,{cache:'no-store'});
      const j=await r.json(); if(j&&j.ok) ALLEG[x._key]=j.allegati; }catch(_){}
  }
  const quanti=(ALLEG[x._key]||[]).filter(a=>a&&a.url).length;
  if(!quanti){ apriWaTesto([x]); return; }  // niente allegati: parte subito, un tocco solo
  _waBusy=true; progOpen(); progSet(0,0);
  let files=[];
  try{ files=await raccogliAllegati([x],progSet); }catch(_){}
  progClose(); _waBusy=false;
  if(!files.length){ apriWaTesto([x]); return; }
  WA_FILES=files; WA_TESTO=waTestoInterventi([x]); WA_SOLOTESTO=[x];
  mostraSheetAllegati();
}
let WA_SOLOTESTO=null;
async function preparaAllegati(){
  if(_waBusy) return;
  const items=selItems();
  if(!items.length){ toast('Seleziona prima gli interventi'); return; }
  _waBusy=true; progOpen(); progSet(0,0);
  let files=[];
  try{ files=await raccogliAllegati(items,progSet); }catch(_){}
  progClose(); _waBusy=false;
  if(!files.length){ toast('Nessun allegato in questi interventi'); return; }
  WA_FILES=files; WA_TESTO=''; WA_SOLOTESTO=null; mostraSheetAllegati();
}
function chiudiSheet(){ const el=document.getElementById('washeet'); if(el) el.remove(); }
function mostraSheetAllegati(){
  chiudiSheet();
  const puo = !!(navigator.canShare && navigator.canShare({files:WA_FILES}));
  const el=document.createElement('div'); el.id='washeet'; el.className='washeet';
  el.innerHTML=`<div class="wsback" onclick="chiudiSheet()"></div>
    <div class="wscard">
      <div class="wstitle">${WA_FILES.length} allegat${WA_FILES.length===1?'o':'i'} pront${WA_FILES.length===1?'o':'i'}</div>
      <div class="wssub">${WA_TESTO?'Partono insieme al messaggio dell\'intervento.':'Ogni file ha il nome dell\'intervento a cui appartiene.'}</div>
      <div class="wslist">${WA_FILES.map(f=>`<div class="wsf">${ic('camera')}<span>${esc(f.name)}</span></div>`).join('')}</div>
      ${puo?`<button class="wsbtn wa" onclick="condividiAllegati()">${ic('message')}${WA_TESTO?'Inoltra su WhatsApp':'Condividi (WhatsApp, Mail…)'}</button>`:''}
      ${WA_SOLOTESTO?`<button class="wsbtn" onclick="chiudiSheet();apriWaTesto(WA_SOLOTESTO)">${ic('message')}Inoltra solo il testo</button>`:''}
      <button class="wsbtn" onclick="scaricaAllegatiPronti()">${ic('download')}Scarica tutti</button>
      <button class="wsbtn ghost" onclick="chiudiSheet()">Annulla</button>
    </div>`;
  document.body.appendChild(el);
}
async function condividiAllegati(){
  // chiamata direttamente dal tocco: cosi' iOS la accetta
  try{ await navigator.share({files:WA_FILES, text: WA_TESTO || waTestoInterventi(selItems())}); chiudiSheet(); }
  catch(e){ if(!(e&&e.name==='AbortError')) toast('Condivisione non riuscita, prova a scaricarli'); }
}
function scaricaAllegatiPronti(){ scaricaBlobs(WA_FILES); chiudiSheet();
  toast(`${WA_FILES.length} allegati scaricati`); }
async function confermaMulti(){
  const keys=[...SELECTED]; if(!keys.length) return;
  SELMODE=false; SELECTED=new Set();
  // ottimistico
  keys.forEach(k=>{ const [kind,id]=k.split(':'); const arr=kind==='issue'?DATA.issues:DATA.tasks;
    const it=(arr||[]).find(x=>x.notion_id===id); if(it) it.confermato_manutentore=true; });
  render(); toast(`Confermo ${keys.length}…`);
  let ok=0;
  for(const k of keys){ const [kind,id]=k.split(':');
    try{ const r=await fetch(`${API}/conferma`,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({kind,id})}); const j=await r.json(); if(j.ok) ok++; }catch(_){}
  }
  toast(ok===keys.length?`${ok} confermate`:`${ok}/${keys.length} confermate`);
}

/* ── Helpers comuni ───────────────────────────────────────────────── */
const RANK={'Very High':0,'High':1,'Medium':2,'Low':3};
function dateOf(x){ return x._kind==='issue'?x.data_intervento:x.due_date; }
function isLate(x){ const d=dateOf(x); return d && !x.confermato_manutentore && d<todayISO(); }
function daysBetween(a,b){ return Math.round((parseISO(b)-parseISO(a))/86400000); }
function byPrio(a,b){ return (RANK[a.priorita]??9)-(RANK[b.priorita]??9); }

/* Striscia settimana cliccabile, condivisa Pulizie/Da fare.
   byDay: mappa dataISO -> array (per i puntini). Oggi evidenziato, tasto "Oggi". */
function weekStrip(byDay, tuttiItems){
  // Quando abbiamo l'elenco completo mostriamo il NUMERO di cose per giorno invece del
  // puntino: "quel venerdì ne scadevano dodici" è un'informazione, un puntino no.
  let conteggio=null;
  if(tuttiItems){ conteggio={};
    tuttiItems.forEach(x=>{ const d=dateOf(x); if(d) conteggio[d]=(conteggio[d]||0)+1; }); }
  let days='';
  for(let i=0;i<7;i++){
    const dISO=addDays(WEEK0,i), d=parseISO(dISO), n=(byDay[dISO]||[]).length;
    const cls=[dISO===SEL?'on':'', dISO===todayISO()?'today':''].join(' ').trim();
    let sotto;
    if(conteggio){
      const tot=conteggio[dISO]||0, scaduto=dISO<todayISO()&&tot;
      sotto=`<div class="cnt2${tot?(scaduto?' late':''):' none'}">${tot||'0'}</div>`;
    }else{
      sotto=n?'<div class="dot"></div>':'<div class="empty"></div>';
    }
    days+=`<div class="day ${cls}" onclick="pick('${dISO}')">
      <div class="dow">${DOW[d.getDay()]}</div><div class="dnum">${d.getDate()}</div>
      ${sotto}</div>`;
  }
  const range=`${dShort(WEEK0)} – ${dShort(addDays(WEEK0,6))}`;
  const oggiBtn = WEEK0!==mondayOf(todayISO())
    ? `<button class="oggi-btn" onclick="goOggi()">${ic('calendar')}Oggi</button>` : '';
  return `<div class="wkhead"><span class="wklbl">${ic('calendar')}Settimana · ${range}</span>${oggiBtn}</div>
    <div class="wk"><button class="nav" onclick="shiftWeek(-1)">${ic('chevronL')}</button>
    <div class="days" ontouchstart="wkTouchStart(event)" ontouchend="wkTouchEnd(event)">${days}</div>
    <button class="nav" onclick="shiftWeek(1)">${ic('chevronR')}</button></div>`;
}

/* ── DA FARE ──────────────────────────────────────────────────────────
   Una lista sola. Niente distinzione Manutenzione/Task: per chi lavora sono
   tutte "cose da fare", l'etichetta diceva solo da quale database di Andres
   arrivava la riga. Niente filtri né ordinamenti: la struttura risponde già.

   Ordine della pagina:
     1. Aspettano solo una foto  → lavoro finito, manca la prova
     2. Da recuperare            → arretrati raggruppati per indirizzo
     3. Settimana + giorno       → il programma, con gli arretrati che RESTANO
                                   nel loro giorno (prima sparivano)
*/

/* L'ufficio scrive due cose diverse nelle istruzioni, e vogliono dire l'opposto:
   "attesa foto"  → il lavoro è già fatto, manca solo la prova  → corsia foto
   "fare/inviare foto" → la foto fa parte del lavoro da fare    → resta in lista
   Regola sul testo, nessun campo nuovo su Notion da compilare. */
const RE_ATTESA = /\b(in\s+)?attes[ao]\b[^.\n]{0,40}?\b(foto|video|immagin|fotograf)/i;
const RE_FOTO   = /\b(fare|far|inviare|invia|mandare|manda|scattare|allegare|allega)\b[^.\n]{0,30}?\b(foto|video|fotograf)|📸|📷|🎥/i;
function vuoleFoto(x){ const s=(x.istruzioni||''); return RE_ATTESA.test(s)||RE_FOTO.test(s); }
function attendeFoto(x){ return RE_ATTESA.test(x.istruzioni||''); }
/* Istruzioni riscritte dall'ufficio dopo l'ultima volta che l'operatore ha aperto */
function istrNuove(x){
  if(!x.istruzioni_agg_il) return false;
  if(!x.istruzioni_viste_il) return true;
  return new Date(x.istruzioni_agg_il) > new Date(x.istruzioni_viste_il);
}
function tuttiItems(){
  return (DATA.issues||[]).map(x=>({...x,_kind:'issue'}))
    .concat((DATA.tasks||[]).map(x=>({...x,_kind:'task'})));
}

function viewDaFare(){
  const items=tuttiItems();
  if(!items.length){
    return `<div class="empty-state">${ic('check')}<div class="t">Tutto in ordine</div>
      Nessun intervento aperto al momento.</div>`;
  }
  const n=SELECTED.size, off=n?'':'disabled';
  const selbar = SELMODE ? `<div class="selbar">
      <div class="selhead"><span class="seln">${n?`${n} selezionat${n===1?'a':'e'}`:'Tocca le cose da confermare'}</span>
        <button class="selx" onclick="toggleSelMode()">${ic('close')}Chiudi</button></div>
      <input type="date" id="selresched" class="rsc-hidden" onchange="reschedMultiPicked(this.value)">
      <div class="selgrid">
        <button class="selwa" ${off} onclick="inviaWaSelezione()">${ic('message')}WhatsApp</button>
        <button class="selconf s2" ${off} onclick="preparaAllegati()">${ic('download')}Allegati</button>
        <button class="selconf s2" ${off} onclick="pickReschedMulti()">${ic('calendar')}Cambio data</button>
      </div>
      <button class="selconf primaria" ${off} onclick="confermaMulti()">${ic('check')}Conferma${n?` ${n}`:''}</button>
    </div>` : '';

  // Il tasto "Seleziona" sta sulla stessa riga della prima intestazione invece che
  // su una fascia tutta sua: in cima allo schermo lo spazio vale, e lì sopra ci deve
  // andare la roba da fare, non un comando secondario.
  const seleziona=`<button class="vbtn selbtn ${SELMODE?'on':''}" onclick="toggleSelMode()">${ic('check')}${SELMODE?'Annulla':'Seleziona'}</button>`;

  // 1. aspettano solo una foto (non confermate: se è confermata è chiusa)
  const attesa = items.filter(x=>!x.confermato_manutentore && attendeFoto(x))
                      .sort((a,b)=>byPrio(a,b)||(dateOf(a)||'9999').localeCompare(dateOf(b)||'9999'));
  const chiaveA = new Set(attesa.map(x=>x._kind+':'+x.notion_id));
  const resto = items.filter(x=>!chiaveA.has(x._kind+':'+x.notion_id));

  // 2. arretrati, raggruppati per indirizzo
  const arretrati = resto.filter(isLate);

  // il pulsante si appoggia alla prima intestazione presente
  const foto=corsiaFoto(attesa, attesa.length?seleziona:'');
  const rec=bloccoRecupero(arretrati, (!attesa.length&&arretrati.length)?seleziona:'');
  const orfano=(!attesa.length&&!arretrati.length)
    ? `<div class="ctrl" style="justify-content:flex-end">${seleziona}</div>` : '';
  return foto + rec + orfano + programmaSettimana(items, resto) + selbar;
}

function corsiaFoto(arr, extra){
  if(!arr.length) return '';
  const righe=arr.map((x,i)=>{
    const key=x._kind+':'+x.notion_id, c=P_COLOR[x.priorita]||'#9A9183';
    const d=dateOf(x), l=isLate(x);
    // In selezione multipla anche queste diventano schede spuntabili: sono interventi
    // veri e vanno confermati come gli altri. Prima restavano righe con il tasto Foto,
    // quindi il blocco usciva mezzo spuntabile e mezzo no.
    if(SELMODE || OPEN_CARDS.has(key)) return iCard(x,x._kind,true,false);
    return `<div class="dfrow${i===0?' first':''}" data-k="${key}">
      <span class="ipdot" style="background:${c}" title="${esc(P_LBL[x.priorita]||'')}"></span>
      <div class="gmain" onclick="toggleCard('${key}')">
        <div class="gtitle">${esc(titoloDi(x))}</div>
        <div class="gmeta"><span class="gtag via">${esc(x.indirizzo||x.appartamento||'—')}</span>
          ${l?`<span class="gtag foto">ferma da ${daysBetween(d,todayISO())}g</span>`:''}
          ${istrNuove(x)?`<span class="gtag nuovo">${ic('info')}istruzioni aggiornate</span>`:''}</div>
      </div>
      <button class="btn foto minif" onclick="pickFoto('${x._kind}','${x.notion_id}')">
        ${ic('camera')}Foto</button></div>`;
  }).join('');
  return `<div class="blockrow"><div class="blockhd foto">${ic('camera')}Aspettano solo una foto
      <span class="num">${arr.length}</span></div>${extra||''}</div>
    <div class="aptgroup fotog">${righe}</div><div class="rule"></div>`;
}

function bloccoRecupero(arr, extra){
  if(!arr.length) return '';
  const byApt={};
  arr.forEach(x=>{ const k=x.appartamento||'—'; (byApt[k]=byApt[k]||[]).push(x); });
  // gli indirizzi con più arretrati vengono prima: è lì che conviene andare
  const ordine=Object.keys(byApt).sort((p,q)=>byApt[q].length-byApt[p].length || p.localeCompare(q));
  const gruppi=ordine.map(k=>gruppoApt(k, byApt[k], true, false)).join('');
  return `<div class="blockrow"><div class="blockhd hot">${ic('bolt')}Da recuperare
      <span class="num">${arr.length}</span></div>${extra||''}</div>
    ${gruppi}<div class="rule"></div>`;
}

/* Un indirizzo con sotto le sue cose. La via è scritta UNA volta qui in testa:
   nelle righe sotto sparisce, così il titolo del lavoro diventa la voce principale. */
function gruppoApt(apt, lst, apriDefault, segnaRitardo){
  lst=lst.slice().sort((a,b)=>{ if(isLate(a)!==isLate(b)) return isLate(a)?-1:1;
    return byPrio(a,b)||(dateOf(a)||'9999').localeCompare(dateOf(b)||'9999'); });
  const via=lst[0].indirizzo||apt;
  const lateN=lst.filter(isLate).length;
  const forzato=OPEN_APTS.has(apt), chiuso=CLOSED_APTS.has(apt);
  const open = chiuso ? false : (forzato || apriDefault);
  const badge=lateN?`<span class="aptlate">${lateN} in ritardo</span>`:'';
  const head=`<button class="apthead ${open?'open':''}" data-k="apt:${esc(apt)}" onclick="toggleApt('${apt.replace(/'/g,"\\'")}',${open})">
      <span class="aptname">${ic('pin')}<b>${esc(via)}</b>
        ${via!==apt?`<span class="aptsub">${esc(apt)}</span>`:''}</span>
      <span class="aptmeta">${badge}<span class="aptn">${lst.length}</span>${ic(open?'chevronU':'chevronD')}</span></button>`;
  return `<div class="aptgroup${lateN?' hot':''}">${head}${open?lst.map((x,i)=>rigaItem(x,i===0,segnaRitardo!==false)).join(''):''}</div>`;
}

/* Riga dentro un gruppo. Se è aperta diventa la scheda completa. */
function rigaItem(x, first, segnaRitardo){
  const key=x._kind+':'+x.notion_id;
  if(OPEN_CARDS.has(key) || SELMODE) return iCard(x,x._kind,true,segnaRitardo);
  const c=P_COLOR[x.priorita]||'#9A9183', d=dateOf(x), l=isLate(x);
  const tags=[
    vuoleFoto(x)?`<span class="gtag foto">${ic('camera')}con foto</span>`:'',
    istrNuove(x)?`<span class="gtag nuovo">${ic('info')}istruzioni aggiornate</span>`:'',
    x.confermato_manutentore?`<span class="gtag ok">${ic('check')}confermato</span>`:'',
  ].filter(Boolean).join('');
  return `<div class="dfrow${first?' first':''}${(l&&segnaRitardo!==false)?' late':''}" data-k="${key}" onclick="toggleCard('${key}')">
    <span class="ipdot" style="background:${c}" title="${esc(P_LBL[x.priorita]||'')}"></span>
    <div class="gmain"><div class="gtitle">${esc(titoloDi(x))}</div>
      ${tags?`<div class="gmeta">${tags}</div>`:''}</div>
    <div class="gright"><span class="gdue${l?' late':''}">${
      d ? (l ? daysBetween(d,todayISO())+'g fa' : dShort(d)) : 'senza data'
    }</span>${ic('chevronD')}</div></div>`;
}
function titoloDi(x){ return x._kind==='issue'?(x.descrizione||'Intervento'):(x.nome||'Task'); }

/* Settimana + giorno scelto. Gli arretrati RESTANO nel loro giorno: prima venivano
   tolti e il giorno risultava vuoto anche se ci scadevano dodici cose. */
function programmaSettimana(tutti, resto){
  const byDay={}, senzaData=[];
  resto.forEach(x=>{ const d=dateOf(x); if(d)(byDay[d]=byDay[d]||[]).push(x); else senzaData.push(x); });
  const lista=(byDay[SEL]||[]).slice().sort((a,b)=>{
    if(isLate(a)!==isLate(b)) return isLate(a)?-1:1; return byPrio(a,b); });
  const byAptGiorno={};
  lista.forEach(x=>{ const k=x.appartamento||'—'; (byAptGiorno[k]=byAptGiorno[k]||[]).push(x); });
  const giorno = lista.length
    ? Object.keys(byAptGiorno).sort().map(k=>gruppoApt(k, byAptGiorno[k], true)).join('')
    : `<div class="empty-state">${ic('check')}<div class="t">Niente in questo giorno</div></div>`;
  const nod = senzaData.length ? `<div class="nodate-sec">
      <div class="nodate-hd">${ic('info')}Senza data <span class="num">${senzaData.length}</span>
        <span class="nodate-sub">da calendarizzare: chiedi la data all'ufficio</span></div>
      ${Object.entries(senzaData.reduce((m,x)=>{const k=x.appartamento||'—';(m[k]=m[k]||[]).push(x);return m;},{}))
        .map(([k,v])=>gruppoApt(k,v,true)).join('')}</div>` : '';
  return weekStrip(byDay, tutti)
    + `<div class="daylbl">${dLong(SEL)}<span class="cnt">${lista.length} da fare</span></div>`
    + giorno + nod;
}

/* ── PULIZIE ───────────────────────────────────────────────────────── */
function viewPulizie(){
  const puliz=(DATA.pulizie||[]).filter(x=>x.stato!=='Annullata');
  const isDesktop = window.matchMedia('(min-width:1024px)').matches;
  const toggle = isDesktop ? `<div class="pv-toggle">
      <button class="pvbtn ${PVIEW==='giorno'?'on':''}" onclick="setPView('giorno')">${ic('calendar')}Giorno</button>
      <button class="pvbtn ${PVIEW==='griglia'?'on':''}" onclick="setPView('griglia')">${ic('clipboard')}Griglia settimana</button>
    </div>` : '';
  if(isDesktop && PVIEW==='griglia') return toggle + pulizieGrid(puliz);
  // Vista giorno (default, sempre su mobile)
  const byDay={}; puliz.forEach(p=>{ if(p.data) (byDay[p.data]=byDay[p.data]||[]).push(p); });
  const list=(byDay[SEL]||[]).slice().sort((a,b)=>(a.inizio||'').localeCompare(b.inizio||''));
  let body;
  if(!list.length){
    body=`<div class="empty-state">${ic('sparkles')}<div class="t">Giornata libera</div>Nessuna pulizia ${SEL===todayISO()?'oggi':'in questo giorno'}.</div>`;
  }else{
    const waRecap=`https://wa.me/?text=${encodeURIComponent(pulizieRecap(list, SEL))}`;
    body=`<a class="btn wa warecap" href="${waRecap}" target="_blank" rel="noopener">${ic('message')}Invia riepilogo giornata</a>
      <div class="grid">${list.map(pCard).join('')}</div>`;
  }
  return toggle+weekStrip(byDay)+`<div class="daylbl">${dLong(SEL)}<span class="cnt">${list.length} pulizi${list.length===1?'a':'e'}</span></div>`+body;
}

/* Messaggio WhatsApp riepilogo pulizie della giornata, con emoji */
function pulizieRecap(list, dISO){
  const out=[`🧹 Pulizie di ${dLong(dISO)}`, ''];
  list.forEach(p=>{
    const via=p.indirizzo||p.appartamento;
    out.push(`📍 ${via}${p.appartamento&&p.appartamento!==via?' — '+p.appartamento:''}`);
    const o=orariPulizia(p);
    const tip=p.tipo==='Proprietario'?' · 👤 proprietario':p.tipo==='Intermedia'?' · 🔄 intermedia':'';
    out.push(`🕐 ${o.i}–${o.f}`+tip);
    const ex=[]; if(p.late_checkout)ex.push('⏰ late checkout'); if(p.early_checkin)ex.push('🔑 early check-in'); if(depOk(p.deposito))ex.push('🧳 deposito: '+p.deposito+' (dalle 12:30)');
    if(ex.length) out.push(ex.join(' · '));
    out.push('');
  });
  return out.join('\n').trim();
}

/* Griglia settimanale stile Operations tracker (solo desktop): appartamenti × giorni */
function tipoColor(t){ return t==='Proprietario'?'#7A5AA8':t==='Intermedia'?'#B9892E':'#9A9183'; }
/* Deposito valido (non "Nessuno") */
function depOk(d){ return !!d && d!=='Nessuno'; }
/* Orari pulizia in base ai servizi (stesse regole del GAS: default 10–15; late 12–15; early fine 14) */
function orariPulizia(p){
  if(p.late_checkout && p.early_checkin) return {i:'12:00', f:'14:00'};
  if(p.late_checkout) return {i:'12:00', f:'15:00'};
  if(p.early_checkin) return {i:'10:00', f:'14:00'};
  return {i: p.inizio || '10:00', f: p.fine || '15:00'};
}
function gChip(p){
  const col=tipoColor(p.tipo);
  const icons=[];
  if(p.late_checkout) icons.push(ic('clock'));
  if(p.early_checkin) icons.push(ic('key'));
  if(depOk(p.deposito)) icons.push(ic('luggage'));
  const done=p.stato==='Completata';
  const o=orariPulizia(p);
  return `<div class="gchip ${done?'done':''}" style="border-left:3px solid ${col}" title="${esc(p.appartamento)} · ${esc(p.tipo||'Standard')}${depOk(p.deposito)?' · deposito: '+esc(p.deposito)+' dalle 12:30':''}${p.late_checkout?' · late checkout':''}${p.early_checkin?' · early check-in':''}">
    <span class="gt">${o.i}–${o.f}</span>${icons.join('')}${done?ic('check'):''}</div>`;
}
function pulizieLegenda(){
  return `<div class="glegend">
    <span><span class="ldot" style="background:#9A9183"></span>Standard</span>
    <span><span class="ldot" style="background:#B9892E"></span>Intermedia</span>
    <span><span class="ldot" style="background:#7A5AA8"></span>Proprietario</span>
    <span class="lsep"></span>
    <span>${ic('clock')}Late checkout (12–15)</span>
    <span>${ic('key')}Early check-in</span>
    <span>${ic('luggage')}Deposito bagagli (dalle 12:30)</span></div>`;
}
function pulizieGrid(puliz){
  const days=[]; for(let i=0;i<7;i++) days.push(addDays(WEEK0,i));
  const end=addDays(WEEK0,6);
  const byApt={};
  puliz.forEach(p=>{ if(!p.data||p.data<WEEK0||p.data>end) return;
    const k=p.appartamento||'—'; (byApt[k]=byApt[k]||{}); (byApt[k][p.data]=byApt[k][p.data]||[]).push(p); });
  const apts=Object.keys(byApt).sort();
  const nav=`<div class="wkhead"><span class="wklbl">${ic('calendar')}Settimana · ${dShort(WEEK0)} – ${dShort(end)}</span>
    <span class="wknav">${WEEK0!==mondayOf(todayISO())?`<button class="oggi-btn" onclick="goOggi()">${ic('calendar')}Oggi</button>`:''}
    <button class="nav" onclick="shiftWeek(-1)">${ic('chevronL')}</button>
    <button class="nav" onclick="shiftWeek(1)">${ic('chevronR')}</button></span></div>`;
  if(!apts.length) return nav+`<div class="empty-state">${ic('sparkles')}<div class="t">Nessuna pulizia questa settimana</div></div>`;
  const head=`<div class="gcell gapt ghapt">Appartamento</div>`+days.map(d=>{const dt=parseISO(d);
    return `<div class="gcell gh ${d===todayISO()?'today':''}"><span class="ghdow">${DOW[dt.getDay()]}</span><span class="ghnum">${dt.getDate()}</span></div>`;}).join('');
  const rows=apts.map(apt=>{
    const firstDay=Object.keys(byApt[apt])[0];
    const via=(byApt[apt][firstDay][0].indirizzo)||apt;
    const cells=days.map(d=>{
      const lst=(byApt[apt][d]||[]).slice().sort((a,b)=>(a.inizio||'').localeCompare(b.inizio||''));
      return `<div class="gcell ${d===todayISO()?'today':''}">${lst.map(gChip).join('')}</div>`;
    }).join('');
    return `<div class="grow"><div class="gcell gapt"><b>${esc(via)}</b><span>${esc(apt)}</span></div>${cells}</div>`;
  }).join('');
  return nav+`<div class="gwrap">
    <div class="gtable"><div class="grow ghead">${head}</div>${rows}</div></div>`+pulizieLegenda();
}

function pCard(p){
  const cls=p.tipo==='Proprietario'?'owner':p.tipo==='Intermedia'?'mid':'';
  const chip=p.tipo==='Proprietario'?`<span class="chip owner"><span class="d"></span>Proprietario</span>`
      :p.tipo==='Intermedia'?`<span class="chip mid"><span class="d"></span>Intermedia</span>`
      :`<span class="chip std"><span class="d"></span>Standard</span>`;
  const svc=[];
  if(p.late_checkout) svc.push(`<span class="svc">${ic('clock')}Late checkout</span>`);
  if(p.early_checkin) svc.push(`<span class="svc">${ic('key')}Early check-in</span>`);
  if(depOk(p.deposito)) svc.push(`<span class="svc">${ic('luggage')}Deposito: ${esc(p.deposito)} · dalle 12:30</span>`);
  const o=orariPulizia(p);
  const ora=`${esc(o.i)}–${esc(o.f)}`;
  const done=p.stato==='Completata';
  return `<div class="pcard ${cls}">
    <div class="r1"><span class="time">${ora}</span>
      ${done?`<span class="done">${ic('check')}completata</span>`:chip}</div>
    <div class="via">${esc(p.indirizzo||p.appartamento)}</div>
    <div class="apt">${ic('pin')}${esc(p.appartamento)}</div>
    ${svc.length?`<div class="svcs">${svc.join('')}</div>`:''}
  </div>`;
}
function pick(d){ SEL=d; render(); }
function shiftWeek(n){ WEEK0=addDays(WEEK0,7*n); render(); }

/* ── RIFORNIMENTI (carrello → ordine su Notion) ─────────────────────── */
async function rifEnsureApts(){
  if(RIF_APTS!==null) return;
  try{
    const r=await fetch(`${API}/rif-appartamenti`,{cache:'no-store'}); const j=await r.json();
    RIF_APTS=(j&&j.ok)?j.appartamenti:[];
    if(RIF_APTS.length===1){ RIF_APT=RIF_APTS[0].id; RIF_APTVIA=RIF_APTS[0].via; }
  }catch(_){ RIF_APTS=[]; }
  if(TAB==='rifornimenti') render();
}
function rifPickApt(id,via){ RIF_APT=id; RIF_APTVIA=via; RIF_APTQ=''; render(); }
function rifAptSearch(){ const el=document.getElementById('rifaptq'); RIF_APTQ=el?el.value:''; rifAptApplyFilter(); }
function rifAptApplyFilter(){ const q=rifNorm(RIF_APTQ||'');
  document.querySelectorAll('#rifapts .rifaptbtn').forEach(b=>{ b.style.display=(!q||(b.dataset.v||'').includes(q))?'':'none'; }); }
function rifChangeApt(){ RIF_APT=null; RIF_APTVIA=''; RIF_CARTOPEN=false; render(); }
function rifInCart(name){ return RIF_CART.has(name)||RIF_CUSTOM.includes(name); }
function rifToggle(name){
  if(RIF_CART.has(name)){ RIF_CART.delete(name); RIF_URGENT.delete(name); }
  else if(RIF_CUSTOM.includes(name)){ RIF_CUSTOM=RIF_CUSTOM.filter(x=>x!==name); RIF_URGENT.delete(name); }
  else RIF_CART.add(name);
  render();
}
/* Re-render preservando lo scroll (pagina + corpo del carrello): evita il salto in alto
   quando si tocca il fulmine o si cambia l'urgenza mentre si è dentro al carrello. */
function rifKeepScroll(mut){
  const body=document.querySelector('.rifdbody');
  const dScroll=body?body.scrollTop:0, wScroll=window.scrollY;
  mut(); render();
  window.scrollTo(0,wScroll);
  const nb=document.querySelector('.rifdbody'); if(nb) nb.scrollTop=dScroll;
}
function rifToggleUrgent(name){ rifKeepScroll(()=>{ if(RIF_URGENT.has(name)) RIF_URGENT.delete(name); else RIF_URGENT.add(name); }); }
let RIF_Q='';
function rifFilter(){ const el=document.getElementById('rifq'); RIF_Q=el?el.value:''; rifApplyFilter(); }
function rifApplyFilter(){
  const q=rifNorm(RIF_Q||'');
  document.querySelectorAll('#rifcat .rifgroup').forEach(g=>{
    let vis=0;
    g.querySelectorAll('.rifrow').forEach(r=>{ const show=!q||(r.dataset.name||'').includes(q);
      r.style.display=show?'':'none'; if(show)vis++; });
    g.style.display=vis?'':'none';
  });
}
function rifScrollTop(){ window.scrollTo({top:0,behavior:'smooth'});
  const el=document.getElementById('rifq'); if(el) setTimeout(()=>el.focus(),350); }
function rifSuggestFor(q){
  const nq=rifNorm(q); if(nq.length<2) return null;
  for(const g of CATALOG) for(const it of g.items){ const ni=rifNorm(it);
    if(ni===nq) return null;
    if(ni.includes(nq)||nq.split(' ').some(w=>w.length>2&&ni.includes(w))) return it; }
  return null;
}
function rifCustomType(){
  const el=document.getElementById('rifcust'); const box=document.getElementById('rifsugg');
  if(!el||!box) return;
  const s=rifSuggestFor(el.value);
  box.innerHTML = s ? `<div class="rifsg">Forse intendi <b>${esc(s)}</b>?
    <button class="rifsgbtn" onclick="rifPickSugg('${s.replace(/'/g,"\\'")}')">${ic('plus')}Aggiungi questo</button></div>` : '';
}
function rifPickSugg(name){ if(!rifInCart(name)) RIF_CART.add(name);
  const el=document.getElementById('rifcust'); if(el) el.value=''; render(); }
function rifCustomAdd(){
  const el=document.getElementById('rifcust'); const v=(el&&el.value||'').trim(); if(!v){ return; }
  // se combacia con un prodotto del catalogo, aggiungi quello (niente doppioni)
  const match=CATALOG.flatMap(g=>g.items).find(it=>rifNorm(it)===rifNorm(v));
  if(match){ if(!rifInCart(match)) RIF_CART.add(match); }
  else if(!RIF_CUSTOM.some(x=>rifNorm(x)===rifNorm(v))) RIF_CUSTOM.push(v);
  render();
}
function rifSetUrg(u){ rifKeepScroll(()=>{ RIF_URG=u; }); }
function toggleRifCart(){ RIF_CARTOPEN=!RIF_CARTOPEN; render(); }
async function rifSend(){
  const map={};
  [...RIF_CART].forEach(n=>{ const c=rifCatOf(n); (map[c]=map[c]||[]).push(n); });
  RIF_CUSTOM.forEach(n=>{ (map['Altro']=map['Altro']||[]).push(n); });
  const gruppi=Object.keys(map).map(cat=>({cat,items:map[cat]}));
  const tot=RIF_CART.size+RIF_CUSTOM.length;
  if(!RIF_APT||!tot){ toast('Aggiungi almeno un prodotto'); return; }
  const urgenti=[...RIF_URGENT].filter(n=>rifInCart(n));
  const nuovi=[...RIF_CUSTOM];
  toast('Invio l\'ordine…');
  try{
    const r=await fetch(`${API}/rifornimento`,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({appartamento_id:RIF_APT,urgenza:RIF_URG,gruppi,urgenti,nuovi})});
    const j=await r.json(); if(!j.ok) throw 0;
    RIF_CART=new Set(); RIF_CUSTOM=[]; RIF_URGENT=new Set(); RIF_CARTOPEN=false; RIF_Q='';
    RIF_STORICO=null;  // la cronologia va ricaricata
    RIF_DONE=tot; render();
  }catch(e){ toast('Ordine non inviato, riprova'); }
}
function rifDoneClose(){ RIF_DONE=null; render(); }
function rifDoneStorico(){ RIF_DONE=null; rifShowStorico(); }

/* Cronologia ordini */
let RIF_LOADEDMORE=false;
/* Ordini con i dettagli aperti (percorso, note, allegati). Di default chiusi:
   in lista conta scorrere in fretta, non leggere tutto di ognuno. */
let RIF_OPEN=new Set();
function rifToggleOrd(k){
  ancoraA(k);
  if(RIF_OPEN.has(k)) RIF_OPEN.delete(k); else RIF_OPEN.add(k);
  render();
}
/* Da quanti giorni l'ordine e' fermo nella fase in cui si trova: e' il numero che
   fa capire cosa sta marcendo (un pacco in area posta da 5 giorni non e' come uno
   arrivato stamattina). */
function rifGiorniInFase(o){
  const d = o.fase==='postale'   ? (o.in_posta_il||o.data_consegna)
          : o.fase==='magazzino' ? (o.arrivo_magazzino||o.data_consegna)
          : o.fase==='ordinato'  ? o.ordinato_il
          : o.fase==='richiesto' ? o.richiesto_il : null;
  if(!d) return null;
  const g=daysBetween(d, todayISO());
  return g<0?null:g;
}
function rifCacheStorico(){
  if(RIF_STORICO!==null) return;
  try{ const c=localStorage.getItem('tcs_rifsto_'+TOKEN);
    if(c){ const j=JSON.parse(c); RIF_STORICO=j.s; RIF_CURSOR=j.c; RIF_HASMORE=j.h; } }catch(_){}
}
function rifShowStorico(){
  RIF_VIEW='storico'; RIF_HQ=''; RIF_HAPT=null; RIF_HFASE=null; RIF_DSEL=new Set(); RIF_LOADEDMORE=false; saveUI();
  // 1. mostra SUBITO l'ultimo stato salvato (apertura istantanea)…
  rifCacheStorico();
  render();
  // 2. …e intanto arriva il dato fresco da Notion (live)
  rifLoadStorico();
}
function histSetFase(f){ RIF_HFASE=f||null; render(); }

/* Step interno operatore: presenza verificata in magazzino (Supabase, non Notion). */
async function rifVerifica(id, val){
  const o=(RIF_STORICO||[]).find(x=>x.id===id); if(o) o.verificato=val;  // ottimistico
  render();
  try{
    const r=await fetch(`${API}/rif-verifica`,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ids:[id], verificato:val})});
    const j=await r.json(); if(!j.ok) throw 0;
    toast(val?'Segnato: verificato in magazzino':'Verifica tolta');
  }catch(e){ if(o) o.verificato=!val; render(); toast('Non riuscito, riprova'); }
}
/* Nota del magazzino su un ordine: va nelle Note dell'Expense Tracker (Notion) timestampata. */
let RIF_NOTA_OPEN=null;
function rifNotaOpen(id){ RIF_NOTA_OPEN = (RIF_NOTA_OPEN===id?null:id); render();
  if(RIF_NOTA_OPEN){ const t=document.getElementById('rifnm-'+id); if(t) t.focus(); } }
async function rifNotaSave(id){
  const t=document.getElementById('rifnm-'+id); const testo=(t&&t.value||'').trim();
  if(!testo){ toast('Scrivi la nota'); return; }
  toast('Salvo la nota…');
  try{
    const r=await fetch(`${API}/rif-nota-magazzino`,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({id, nota:testo})});
    const j=await r.json(); if(!j.ok) throw 0;
    const o=(RIF_STORICO||[]).find(x=>x.id===id);
    if(o){ o.note_magazzino=(o.note_magazzino||[]).concat(j.riga); }
    RIF_NOTA_OPEN=null; render(); toast('Nota salvata');
  }catch(e){ toast('Non riuscito, riprova'); }
}
/* Selezione merce in magazzino -> conferma "portata in appartamento" */
function rifDSel(id){ if(RIF_DSEL.has(id)) RIF_DSEL.delete(id); else RIF_DSEL.add(id); render(); }
function rifDSelClear(){ RIF_DSEL=new Set(); render(); toast('Selezione annullata'); }
async function rifConsegna(){
  const ids=[...RIF_DSEL]; if(!ids.length) return;
  const dv=(document.getElementById('rifddate')||{}).value||todayISO();
  toast('Confermo la consegna…');
  try{
    const r=await fetch(`${API}/rif-consegna`,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ids, data:dv})});
    const j=await r.json(); if(!j.ok) throw 0;
    RIF_DSEL=new Set(); RIF_STORICO=null; render(); rifLoadStorico();
    toast(`${j.confermati} consegn${j.confermati===1?'a':'e'} confermat${j.confermati===1?'a':'e'} in appartamento`);
  }catch(e){ toast('Non riuscito, riprova'); }
}
/* Messaggio pulito per l'operatore di magazzino: ogni pacco -> in che appartamento va */
function rifWaMagazzino(){
  const items=(RIF_STORICO||[]).filter(o=>RIF_DSEL.has(o.id));
  if(!items.length){ toast('Seleziona prima la merce'); return; }
  // Formato CONSEGNE: raggruppato per appartamento (una via, sotto tutta la merce),
  // separatore a linea tra una casa e l'altra. Emoji su mobile, pulito su laptop.
  const E=IS_MOBILE;
  const perVia={};
  items.forEach(o=>{ (perVia[o.via]=perVia[o.via]||[]).push(o); });
  const out=[items.length===1?(E?'*📦 CONSEGNA DA FARE*':'*Consegna da fare*')
                             :(E?`*📦 CONSEGNE DA FARE · ${items.length}*`:`*Consegne da fare (${items.length})*`),''];
  const vie=Object.keys(perVia);
  vie.forEach((via,i)=>{
    out.push(E?`*📍 ${via.toUpperCase()}*`:`*${via}*`);
    perVia[via].forEach(o=>{
      const prod=(o.prodotti||'').replace(/^Prodotti \(\d+\):\s*/,'').trim()||(o.descrizione||'').trim();
      if(prod) out.push(`• ${prod}`);
    });
    out.push(i<vie.length-1?WA_SEP:'');
  });
  window.open('https://wa.me/?text='+encodeURIComponent(out.join('\n').trim()),'_blank','noopener');
}
function rifBackCatalogo(){ RIF_VIEW='catalogo'; saveUI(); render(); }
async function rifLoadStorico(altri){
  try{
    const u=`${API}/rif-storico`+((altri&&RIF_CURSOR)?`?cursor=${encodeURIComponent(RIF_CURSOR)}`:'');
    if(altri) toast('Carico gli ordini più vecchi…');
    const r=await fetch(u,{cache:'no-store'}); const j=await r.json();
    if(j&&j.ok){
      RIF_STORICO=(altri&&RIF_STORICO)?RIF_STORICO.concat(j.storico):j.storico;
      RIF_CURSOR=j.next_cursor||null; RIF_HASMORE=!!j.has_more;
      if(altri) RIF_LOADEDMORE=true;
      else try{ localStorage.setItem('tcs_rifsto_'+TOKEN,
        JSON.stringify({s:j.storico,c:RIF_CURSOR,h:RIF_HASMORE})); }catch(_){}
    } else if(!altri&&RIF_STORICO===null) RIF_STORICO=[];
  }catch(_){ if(!altri) RIF_STORICO=[]; }
  if(TAB==='rifornimenti'&&RIF_VIEW==='storico') render();
}
function histSetApt(via){ RIF_HAPT=via||null; render(); }
function histFilter(){ const el=document.getElementById('rifhq'); RIF_HQ=el?el.value:''; histApplyFilter(); }
function histApplyFilter(){
  const q=rifNorm(RIF_HQ||''); let vis=0;
  document.querySelectorAll('.rifhistlist .rifhist').forEach(c=>{
    const show=!q||(c.dataset.h||'').includes(q);
    c.style.display=show?'':'none'; if(show)vis++;
  });
  // gli indirizzi che restano senza righe spariscono, se no restano intestazioni vuote
  document.querySelectorAll('.rifgrp').forEach(g=>{
    const dentro=[...g.querySelectorAll('.rifhist')].some(c=>c.style.display!=='none');
    g.style.display=dentro?'':'none';
  });
  const em=document.getElementById('rifhempty'); if(em) em.style.display=vis?'none':'';
}

const RIF_URG_OPT=[['1w','~1 settimana','Urgente'],['2w','~2 settimane','Normale'],['4w','~4 sett. o più','Con calma']];
const RIF_STATO_COL={'Da acquistare':'#b23b2e','Da pagare':'#3b6ea5','Acquistato':'#3f8f5e','Reso':'#8a6d3b'};
/* Ciclo di vita di un ordine, come lo vede l'operatore */
const RIF_FASE={
  richiesto:  {lbl:'Richiesto',      col:'#9A9183', bg:'#f2efe9', fg:'#7a7168'},
  ordinato:   {lbl:'In arrivo',      col:'#3b6ea5', bg:'#e9f0f8', fg:'#2f5d8f'},
  postale:    {lbl:'In area posta',  col:'#2a8a80', bg:'#eef6f5', fg:'#1f6f66'},
  magazzino:  {lbl:'In magazzino',   col:'#b5892e', bg:'#f9f0e0', fg:'#8a5a10'},
  consegnato: {lbl:'Consegnato',     col:'#3f8f5e', bg:'#edf4ef', fg:'#33734c'},
};
// L'area posta viene per prima: il pacco sta in uno spazio comune del condominio,
// va recuperato appena si passa. E' il caso che era sfuggito a Torrebianca 18.
const RIF_FASE_ORD={postale:0, magazzino:1, ordinato:2, richiesto:3, consegnato:4};
/* Percorso del pacco: pipeline completa fino alla consegna in appartamento */
// Elenco eventi per esteso (etichetta + data): meno ambiguo dei soli pallini,
// l'operatore vede subito cos'e' successo e quando. Righe strette per risparmiare
// spazio in una lista che si scorre spesso.
function rifTimeline(o){
  const inCasa = o.luogo==='Appartamento';
  const passi = inCasa ? [
    {lbl:'Richiesto',                    d:o.richiesto_il},
    {lbl:'Ordine fatto (in arrivo)',     d:o.ordinato_il},
    // il corriere lascia il pacco all'indirizzo: e' in area posta, non ancora in casa
    {lbl:'Arrivato in area posta',       d:o.in_posta_il||o.data_consegna},
    {lbl:'Portato dentro casa',          d:o.portato_il},
  ] : [
    {lbl:'Richiesto',                  d:o.richiesto_il},
    {lbl:'Ordine fatto (in arrivo)',   d:o.ordinato_il},
    {lbl:'Arrivato in magazzino',      d:o.arrivo_magazzino||o.data_consegna},
    {lbl:'Consegnato in appartamento', d:o.portato_il},
  ];
  return `<div class="rift">${passi.map(p=>{
    const fatto=!!p.d;
    return `<div class="riftp ${fatto?'ok':''}">
      <span class="riftdot"></span>
      <span class="riftlbl">${esc(p.lbl)}</span>
      <span class="riftd">${fatto?esc(dShort(p.d)):'—'}</span></div>`;
  }).join('')}</div>`;
}

function viewRifornimenti(){
  if(RIF_APTS===null) return `<div class="empty-state">${ic('cart')}<div class="t">Carico…</div></div>`;
  if(!RIF_APTS.length) return `<div class="empty-state">${ic('info')}<div class="t">Nessun appartamento assegnato</div>Contatta l'ufficio per essere abilitato agli ordini.</div>`;

  // Due sezioni chiare: ORDINA (carrello) e MONITORA (stato degli ordini),
  // con segmented in alto e swipe orizzontale per passare dall'una all'altra.
  const seg=`<div class="rifseg">
    <button class="rifsegb ${RIF_VIEW==='catalogo'?'on':''}" onclick="rifGo('catalogo')">${ic('cart')}Ordina</button>
    <button class="rifsegb ${RIF_VIEW==='storico'?'on':''}" onclick="rifGo('storico')">${ic('truck')}Monitora</button>
  </div>`;
  const wrap=inner=>`<div ontouchstart="rifSwS(event)" ontouchend="rifSwE(event)">${seg}${inner}</div>`;

  if(RIF_VIEW==='storico') return wrap(viewStorico());

  // Selettore appartamento (se più d'uno e non ancora scelto) — mostriamo la VIA.
  // Con tanti appartamenti (30-40) compare anche una ricerca per via.
  if(!RIF_APT){
    const aptSearch = RIF_APTS.length>6
      ? `<div class="rifsearch">${ic('search')}<input id="rifaptq" placeholder="Cerca la via…" value="${esc(RIF_APTQ)}" oninput="rifAptSearch()"></div>` : '';
    return wrap(`<div class="rifintro">${ic('cart')}<div><b>Cosa manca in casa?</b><span>Scegli l'appartamento, poi aggiungi i prodotti al carrello.</span></div></div>
      <div class="rifbar"><span class="riflbl">Per quale appartamento?</span></div>
      ${aptSearch}
      <div class="rifapts" id="rifapts">${RIF_APTS.map(a=>`<button class="rifaptbtn" data-v="${esc(rifNorm(a.via))}" onclick="rifPickApt('${a.id}','${esc(a.via).replace(/'/g,"\\'")}')">${ic('pin')}${esc(a.via)}</button>`).join('')}</div>`);
  }

  const nCart=RIF_CART.size+RIF_CUSTOM.length;
  const aptCtrl = RIF_APTS.length>1
    ? `<button class="rifaptsel" onclick="rifChangeApt()">${ic('pin')}<b>${esc(RIF_APTVIA)}</b>${ic('chevronD')}<span class="rifaptswap">cambia</span></button>`
    : `<span class="rifha">${ic('pin')}<b>${esc(RIF_APTVIA)}</b></span>`;
  const head=`<div class="rifhead">${aptCtrl}</div>`;
  const searchbar=`<div class="rifsearch">${ic('search')}<input id="rifq" placeholder="Cerca un prodotto…" value="${esc(RIF_Q)}" oninput="rifFilter()"></div>`;

  const cat=`<div id="rifcat">${CATALOG.map(g=>{
    const rows=g.items.map(it=>{ const inC=rifInCart(it);
      return `<button class="rifrow ${inC?'in':''}" data-name="${esc(rifNorm(it))}" onclick="rifToggle('${it.replace(/'/g,"\\'")}')">
        <span class="rifdot" style="background:${g.color}"></span>
        <span class="rifnm">${esc(it)}</span>
        <span class="rifadd">${inC?ic('check'):ic('plus')}</span></button>`; }).join('');
    return `<div class="rifgroup">
      <div class="rifghd"><span class="rifdot" style="background:${g.color}"></span>${esc(g.cat)}</div>
      <div class="rifrows">${rows}</div></div>`;
  }).join('')}</div>`;

  // prodotti custom già aggiunti (fuori catalogo)
  const custom = RIF_CUSTOM.length ? `<div class="rifgroup"><div class="rifghd"><span class="rifdot" style="background:#9A9183"></span>Aggiunti da te</div>
    <div class="rifrows">${RIF_CUSTOM.map(n=>`<button class="rifrow in" onclick="rifToggle('${n.replace(/'/g,"\\'")}')">
      <span class="rifdot" style="background:#9A9183"></span><span class="rifnm">${esc(n)}</span><span class="rifadd">${ic('check')}</span></button>`).join('')}</div></div>` : '';

  const custbox=`<div class="rifcustom">
    <div class="riflbl2">${ic('box')}Non trovi qualcosa?</div>
    <div class="rifcustrow"><input id="rifcust" placeholder="Scrivi il prodotto…" oninput="rifCustomType()">
      <button class="rifaddbtn" onclick="rifCustomAdd()">${ic('plus')}Aggiungi</button></div>
    <div id="rifsugg"></div></div>`;

  const up=`<button class="riftop" onclick="rifScrollTop()" title="Torna su">${ic('arrowUp')}</button>`;
  const fab = nCart ? `<button class="riffab" onclick="toggleRifCart()">${ic('cart')}<span class="riffabn">${nCart}</span>Vedi carrello</button>` : '';
  const drawer = RIF_CARTOPEN ? rifDrawer() : '';
  const done = RIF_DONE!=null ? rifDoneOverlay() : '';

  return wrap(head+searchbar+cat+custom+custbox+`<div class="riffabsp"></div>`)+up+fab+drawer+done;
}

/* Passaggio Ordina <-> Monitora, anche con lo swipe del dito */
function rifGo(v){ if(v==='storico') rifShowStorico(); else rifBackCatalogo(); }
let _rifSwX=null,_rifSwY=null;
function rifSwS(e){
  // Niente cambio sezione se il dito parte da un elemento che scorre in orizzontale
  // (file di filtri, miniature, carrello, campi): scorrere i filtri non deve cambiare pagina.
  if(e.target.closest('.rifhchips,.thumbs,.lbstrip,.rifurgseg,.selbar,.rifdrawer,.rifcustrow,input,select,textarea')){ _rifSwX=null; return; }
  _rifSwX=e.changedTouches[0].clientX; _rifSwY=e.changedTouches[0].clientY;
}
function rifSwE(e){
  if(_rifSwX==null||RIF_CARTOPEN) { _rifSwX=null; return; }
  const dx=e.changedTouches[0].clientX-_rifSwX, dy=e.changedTouches[0].clientY-_rifSwY; _rifSwX=null;
  if(Math.abs(dx)>90 && Math.abs(dx)>Math.abs(dy)*2){
    if(dx<0 && RIF_VIEW==='catalogo') rifGo('storico');
    else if(dx>0 && RIF_VIEW==='storico') rifGo('catalogo');
  }
}

function rifDrawer(){
  const map={};
  [...RIF_CART].forEach(n=>{ const c=rifCatOf(n); (map[c]=map[c]||[]).push(n); });
  RIF_CUSTOM.forEach(n=>{ (map['Altro']=map['Altro']||[]).push(n); });
  const cats=Object.keys(map);
  const tot=RIF_CART.size+RIF_CUSTOM.length;
  const nUrg=[...RIF_URGENT].filter(n=>rifInCart(n)).length;
  const groups=cats.map(c=>`<div class="rifdg"><div class="rifdgc">${esc(c)}</div>${map[c].map(n=>{
    const u=RIF_URGENT.has(n);
    return `<div class="rifditem ${u?'urg':''}"><span class="rifdot" style="background:${rifColorOf(n)}"></span>
      <span class="rifdnm">${esc(n)}</span>
      <button class="rifflag ${u?'on':''}" onclick="rifToggleUrgent('${n.replace(/'/g,"\\'")}')" title="Segna urgente">${ic('bolt')}</button>
      <button class="rifdel" onclick="rifToggle('${n.replace(/'/g,"\\'")}')" title="Rimuovi">${ic('trash')}</button></div>`;}).join('')}</div>`).join('');
  const hint=`<div class="rifhint">${ic('bolt')}Tocca il fulmine accanto a un prodotto per segnarlo <b>urgente</b>.</div>`;
  const urg=`<div class="rifurg"><div class="riflbl2">${ic('clock')}Tra quanto serve (in generale)?</div>
    <div class="rifurgseg">${RIF_URG_OPT.map(([k,a,b])=>`<button class="rifubtn ${RIF_URG===k?'on':''}" onclick="rifSetUrg('${k}')">
      <b>${a}</b><span>${b}</span></button>`).join('')}</div></div>`;
  const urgTxt=nUrg?` · ${nUrg} urgent${nUrg===1?'e':'i'}`:'';
  return `<div class="rifback" onclick="toggleRifCart()"></div>
    <div class="rifdrawer">
      <div class="rifdhd"><span>${ic('cart')}Carrello · ${esc(RIF_APTVIA)}</span>
        <button class="rifdx" onclick="toggleRifCart()">${ic('chevronD')}</button></div>
      <div class="rifdbody">${groups}${hint}${urg}</div>
      <button class="rifsend" onclick="rifSend()">${ic('check')}Invia ordine · ${tot} prodott${tot===1?'o':'i'}${urgTxt}</button>
    </div>`;
}

/* Bella conferma dopo l'invio */
function rifDoneOverlay(){
  const n=RIF_DONE;
  return `<div class="rifdone">
    <div class="rifdonecard">
      <div class="rifdonechk">${ic('check')}</div>
      <div class="rifdonet">Ordine inviato!</div>
      <div class="rifdones">L'ufficio ha ricevuto la tua richiesta di ${n} prodott${n===1?'o':'i'}.<br>Ci pensiamo noi.</div>
      <div class="rifdoneact">
        <button class="rifdoneb2" onclick="rifDoneStorico()">${ic('history')}Vedi cronologia</button>
        <button class="rifdoneb" onclick="rifDoneClose()">${ic('check')}Fatto</button>
      </div>
    </div></div>`;
}

/* MONITORA — stato degli ordini: filtri per fase e appartamento, selezione
   della merce in magazzino e conferma "portata in appartamento". */
function viewStorico(){
  if(RIF_STORICO===null) return `<div class="empty-state">${ic('truck')}<div class="t">Carico gli ordini…</div></div>`;
  if(!RIF_STORICO.length) return `<div class="empty-state">${ic('info')}<div class="t">Nessun ordine ancora</div>Quando invii un ordine comparirà qui.</div>`;

  // ── Filtro via: SOLO gli indirizzi che hanno davvero qualcosa da seguire ───
  // Pensato per crescere: con quattro immobili elencarli tutti va bene, con venti
  // diventerebbe un muro di pastiglie. Mostrando solo quelli che in questo momento
  // hanno roba aperta, la fila resta corta da sola qualunque sia il numero di case
  // (con venti immobili e dodici ordini aperti si vedono cinque vie, non venti).
  // La via selezionata resta sempre in elenco, se no non si potrebbe togliere.
  const vieAttive=[...new Set(RIF_STORICO
    .filter(o=>o.fase!=='consegnato')
    .map(o=>o.via).filter(Boolean))].sort();
  if(RIF_HAPT && !vieAttive.includes(RIF_HAPT)) vieAttive.push(RIF_HAPT);
  const aptChips = vieAttive.length>1 ? `<div class="rifhchips vie">
    <button class="rifhchip ${!RIF_HAPT?'on':''}" onclick="histSetApt('')">Tutte le vie</button>
    ${vieAttive.map(v=>`<button class="rifhchip ${RIF_HAPT===v?'on':''}" onclick="histSetApt('${esc(v).replace(/'/g,"\\'")}')">${ic('pin')}${esc(v)}</button>`).join('')}
  </div>` : '';

  // filtro per fase, con conteggi calcolati sull'appartamento scelto
  let base=RIF_STORICO.slice();
  if(RIF_HAPT) base=base.filter(o=>o.via===RIF_HAPT);
  const cnt=f=>base.filter(o=>o.fase===f).length;
  const aperti=base.filter(o=>o.fase!=='consegnato');
  const FCH=[[null,'Da seguire',null,aperti.length],
             ['richiesto','Richiesti','#9A9183',cnt('richiesto')],
             ['ordinato','In arrivo','#3b6ea5',cnt('ordinato')],
             ['postale','In area posta','#2a8a80',cnt('postale')],
             ['magazzino','In magazzino','#b5892e',cnt('magazzino')],
             ['consegnato','Consegnati','#3f8f5e',null]];
  // Niente numero sui "Consegnati": cresce negli anni e diventerebbe rumore.
  const faseChips=`<div class="rifhchips fasi">${FCH.map(([f,lbl,col,n])=>{
    const num=(n!=null)?` <span class="rifhn">${n}</span>`:'';
    return `<button class="rifhchip ${RIF_HFASE===f?'on':''}" onclick="histSetFase(${f?`'${f}'`:'null'})">
      ${col?`<span class="rifdot" style="background:${col}"></span>`:''}${lbl}${num}</button>`;
  }).join('')}</div>`;

  const search=`<div class="rifsearch">${ic('search')}<input id="rifhq" placeholder="Cerca un prodotto o una via…" value="${esc(RIF_HQ)}" oninput="histFilter()"></div>`;

  // ordina: prima le cose azionabili (magazzino, poi in arrivo, poi richiesti, consegnati in fondo), dentro per data
  let list=base.slice();
  if(RIF_HFASE==='consegnato')      list=list.filter(o=>o.fase==='consegnato');
  else if(RIF_HFASE)                list=list.filter(o=>o.fase===RIF_HFASE);
  // Di default i CONSEGNATI restano fuori: sono la maggioranza delle righe e non
  // chiedono niente. Si ritrovano col chip "Consegnati" e con la ricerca.
  else                              list=aperti.slice();
  list.sort((a,b)=>{
    const fa=RIF_FASE_ORD[a.fase]??9, fb=RIF_FASE_ORD[b.fase]??9;
    if(fa!==fb) return fa-fb;
    return String(b.richiesto_il||b.data||'').localeCompare(String(a.richiesto_il||a.data||''));
  });

  const cards=list.map((o,i)=>{
    o._i=i;
    let f=RIF_FASE[o.fase]||RIF_FASE.richiesto;

    const prod=(o.prodotti||'').replace(/^Prodotti \(\d+\):\s*/,'').trim();
    const detail=prod||(o.descrizione||'').trim();
    const hay=rifNorm(`${o.via} ${detail} ${o.stato||''} ${f.lbl}`);
    const key='ord:'+i;
    const alleg=(o.allegati||[]).filter(a=>a&&a.url);
    if(alleg.length) ALLEG[key]=alleg;
    const thumbs=alleg.length?`<div class="rifhdoc"><div class="rifhdoclbl">${ic('camera')}Ricevuta / foto (${alleg.length})</div>
      <div class="thumbs">${alleg.map((a,j)=>isPdfA(a)
        ? `<button class="thumb doc" onclick="event.stopPropagation();openLB('${key}',${j})" title="${esc(allegName(a,j))}">${ic('clipboard')}<span>PDF</span></button>`
        : a.video
        ? `<button class="thumb vid" onclick="event.stopPropagation();openLB('${key}',${j})" title="${esc(allegName(a,j))}">${ic('play')}</button>`
        : `<button class="thumb" onclick="event.stopPropagation();openLB('${key}',${j})" title="${esc(allegName(a,j))}" style="background-image:url('${esc(a.url)}')"></button>`).join('')}</div></div>`:'';
    // la merce in magazzino si può selezionare per confermare la consegna in casa
    // si seleziona sia la merce in magazzino sia quella ferma in area posta:
    // in entrambi i casi l'operatore la porta dentro e chiude il giro
    const selezionabile=(o.fase==='magazzino'||o.fase==='postale') && o.id;
    const sel=selezionabile && RIF_DSEL.has(o.id);
    // Se la riga non e' selezionabile lo spazio del cerchio resta comunque
    // riservato: se no i nomi e le etichette partono da due punti diversi e la
    // colonna balla.
    const selBtn=selezionabile
      ? `<span class="rifsel ${sel?'on':''}">${sel?ic('check'):''}</span>`
      : `<span class="rifsel vuoto" aria-hidden="true"></span>`;
    // STEP INTERNO (solo operatore): quando la roba è "in magazzino" l'operatore
    // chiama il magazzino e spunta "presenza verificata". Non va su Notion.
    const ver=!!o.verificato;
    // La spunta "presenza verificata" e' un passaggio interno che riguarda SOLO il
    // magazzino (l'operatore chiama e si fa confermare che la merce c'e' davvero).
    // Per un pacco in area posta non ha senso: ci si va e si vede. Li' resta solo
    // la nota, che serve sempre.
    // L'allegato NON sta nella riga compatta: quasi sempre e' un PDF, non si
    // apre quasi mai, e li' rubava spazio alla lettura veloce. Sta dentro, nella
    // riga delle azioni, come tasto vero accanto a Nota.
    const clip = alleg.length
      ? `<button class="rifallg" onclick="event.stopPropagation();openLB('${key}',0)">
           ${ic('clip')}Allegato${alleg.length>1?' ('+alleg.length+')':''}</button>`
      : '';
    const nota=`<button class="rifvnota" onclick="event.stopPropagation();rifNotaOpen('${o.id}')" title="Aggiungi una nota per l'ufficio">${ic('message')}Nota</button>`;
    const verifBox = o.fase==='magazzino'
      ? `<div class="rifverif ${ver?'ok':''}">
          <button class="rifvchk" onclick="event.stopPropagation();rifVerifica('${o.id}',${ver?'false':'true'})">
            <span class="rifvbox ${ver?'on':''}">${ver?ic('check'):''}</span>
            ${ver?'Presenza verificata in magazzino':'Verifica presenza in magazzino'}</button>
          <span class="rifvact">${clip}${nota}</span>
        </div>`
      : `<div class="rifverif solonota"><span class="rifvact">${clip}${nota}</span></div>`;
    // note del magazzino (timestampate, arrivano dal campo Note su Notion)
    const notemag=(o.note_magazzino||[]);
    const noteHtml=notemag.length
      ? `<div class="rifnmlist">${notemag.map(n=>`<div class="rifnmi">${ic('info')}<span>${esc(n)}</span></div>`).join('')}</div>` : '';
    const notaInput = (RIF_NOTA_OPEN===o.id)
      ? `<div class="rifnmform" onclick="event.stopPropagation()">
          <textarea id="rifnm-${o.id}" rows="2" placeholder="Es. chiamato magazzino: non ancora arrivati…"></textarea>
          <div class="rifnmacts">
            <button class="rifnmcancel" onclick="rifNotaOpen('${o.id}')">Annulla</button>
            <button class="rifnmsave" onclick="rifNotaSave('${o.id}')">${ic('check')}Salva nota</button>
          </div></div>` : '';
    // ── Scheda COMPATTA di default ──────────────────────────────────────
    // Prima ogni ordine stampava tutto: percorso a 4 tappe, note, e un riquadro
    // grande "Ricevuta / foto" che per un PDF non mostra nemmeno un'anteprima.
    // Con quaranta ordini si scorreva all'infinito. Ora in lista restano solo le
    // cose che servono a colpo d'occhio (via, cosa, in che fase, da quanto) e il
    // resto si apre a richiesta. L'allegato e' una graffetta che apre il visore.
    const aperta = RIF_OPEN.has(key);
    const giorniFase = rifGiorniInFase(o);
    const meta = giorniFase!=null
      ? `<span class="rifhda${giorniFase>=3?' fermo':''}">${giorniFase===0?'oggi':'da '+giorniFase+(giorniFase===1?' giorno':' giorni')}</span>`
      : '';
    return `<div class="rifhist compatta ${sel?'sel':''} ${selezionabile?'selettabile':''} ${aperta?'aperta':''}"
        data-h="${esc(hay)}" data-k="${key}">
      <div class="rifhrow"${selezionabile?` onclick="rifDSel('${o.id}')"`:''}>
        ${selBtn}
        <div class="rifhmain">
          <div class="rifhcosa">${detail?esc(detail):'<i>senza dettaglio</i>'}</div>
          <div class="rifhmeta">
            <span class="rifhtag" style="background:${f.bg};color:${f.fg}">${esc(f.lbl)}</span>
            ${meta}
          </div>
        </div>
        <button class="rifhexp" title="${aperta?'Chiudi':'Dettagli'}" aria-label="${aperta?'Chiudi':'Dettagli'}"
          onclick="event.stopPropagation();rifToggleOrd('${key}')">${ic(aperta?'chevronU':'chevronD')}</button>
      </div>
      ${aperta?`${rifTimeline(o)}${verifBox}${noteHtml}${notaInput}`:''}
    </div>`;
  });   // ⚠️ resta un ARRAY: serve per distribuire le schede nei gruppi per indirizzo

  // ── Raggruppate per INDIRIZZO ────────────────────────────────────────────
  // Prima "Via dei Fabbri 11" compariva tre volte di fila con tre cose diverse.
  // Raggruppato si legge "3 cose da portare li'": e' un viaggio solo. Stessa resa
  // che ha funzionato in "Da fare".
  const perVia={};
  list.forEach((o,i)=>{ const v=o.via||'—'; (perVia[v]=perVia[v]||[]).push(cards[i]); });
  const vieOrdinate=Object.keys(perVia).sort((a,b)=>
    perVia[b].length-perVia[a].length || a.localeCompare(b));
  const gruppi=vieOrdinate.map(v=>{
    const n=perVia[v].length;
    return `<div class="rifgrp">
      <div class="rifgrph">${ic('pin')}<b>${esc(v)}</b>
        <span class="rifgrpn">${n}</span></div>
      ${perVia[v].join('')}</div>`;
  }).join('');

  const empty=`<div id="rifhempty" class="empty-state" style="display:none">${ic('search')}<div class="t">Nessun risultato</div>Prova con un'altra parola.</div>`;
  const body = list.length ? `<div class="rifhistlist">${gruppi}</div>${empty}`
    : `<div class="empty-state">${ic('check')}<div class="t">Tutto a posto</div>Niente da seguire con questi filtri.</div>`;
  // Il passato completo si carica solo quando serve. Ma sotto un filtro di fase ATTIVA
  // (Richiesti / In arrivo / In magazzino) gli articoli aperti sono gia' tutti caricati
  // (verificato: caricando tutto lo storico il conteggio non cambia), quindi il tasto
  // "piu' vecchi" porterebbe solo consegnati e li' e' fuorviante -> lo mostro solo su
  // "Tutti" e "Consegnati".
  const showMore = RIF_HASMORE && (!RIF_HFASE || RIF_HFASE==='consegnato');
  const more = showMore ? `<button class="rifmore" onclick="rifLoadStorico(true)">${ic('history')}Mostra ordini più vecchi</button>` : '';

  // barra conferma consegna: appare quando c'è merce selezionata
  const dbar = RIF_DSEL.size ? `<div class="selbar"><span class="selinfo">${RIF_DSEL.size} sel.
      <button class="selx" onclick="rifDSelClear()" title="Svuota la selezione e riparti">${ic('close')}Annulla</button></span>
    <div class="selacts">
      <label class="rifddtw"><span>Consegnato il</span>
        <input type="date" id="rifddate" class="rifddt" value="${RIF_DDATE||todayISO()}" onchange="RIF_DDATE=this.value"></label>
      <button class="selwa" onclick="rifWaMagazzino()">${ic('message')}Inoltra al magazzino</button>
      <button class="selconf" onclick="rifConsegna()">${ic('check')}Consegnato in appartamento</button>
    </div></div>` : '';

  return faseChips+aptChips+search+body+more+`<div class="riffabsp"></div>`+dbar;
}

/* ── Card intervento (manutenzione o task) ─────────────────────────── */
function iCard(x,kind,dentro,segnaRitardo){
  const pc=P_COLOR[x.priorita]||'#9A9183';
  const plbl=P_LBL[x.priorita]||x.priorita||'';
  const titolo=kind==='issue'?(x.descrizione||'Intervento'):(x.nome||'Task');
  const dataRaw=kind==='issue'?x.data_intervento:x.due_date;
  const conf=x.confermato_manutentore;
  let late=false, dataLbl='', ritardo=0;
  if(dataRaw){ dataLbl=dLong(dataRaw); if(!conf && dataRaw<todayISO()){ late=true; ritardo=daysBetween(dataRaw,todayISO()); } }
  const via=x.indirizzo||x.appartamento;
  const id=x.notion_id;
  const istr=(x.istruzioni||'').trim();
  const key=kind+':'+id;
  const sel=SELMODE && SELECTED.has(key);
  const open=!SELMODE && OPEN_CARDS.has(key);
  const nuove=istrNuove(x);
  const dueBadge = dataRaw
    ? `<span class="idue ${late?'late':''}">${late?ritardo+'g fa':esc(dShort(dataRaw))}</span>`
    : (conf?'':`<span class="idue nodate">senza data</span>`);
  // In selezione multipla la via serve (si vedono card di case diverse insieme);
  // dentro un gruppo no, sta già scritta nell'intestazione dell'indirizzo.
  const marcaRitardo = late && !conf && segnaRitardo!==false;
  const tags=[
    conf?`<span class="gtag ok">${ic('check')}confermato</span>`:'',
    marcaRitardo?`<span class="gtag late">${ritardo}g in ritardo</span>`:'',
    vuoleFoto(x)?`<span class="gtag foto">${ic('camera')}${attendeFoto(x)?'aspetta la foto':'con foto'}</span>`:'',
    nuove?`<span class="gtag nuovo">${ic('info')}istruzioni aggiornate</span>`:'',
    (SELMODE&&!dentro)?`<span class="gtag via">${esc(via||'—')}</span>`:'',
  ].filter(Boolean).join('');
  // Testata: il LAVORO è la riga grande, non l'indirizzo.
  const head=`<div class="ihead" ${SELMODE?`onclick="toggleSel('${kind}','${id}')"`:`onclick="toggleCard('${key}')"`}>
      ${SELMODE?`<span class="selbox">${sel?ic('check'):''}</span>`:`<span class="ipdot" style="background:${pc}" title="${esc(plbl)}"></span>`}
      <div class="imain">
        <div class="ititolo">${esc(titolo)}</div>
        ${tags?`<div class="gmeta">${tags}</div>`:''}
      </div>
      <div class="iright">${dueBadge}${SELMODE?'':ic(open?'chevronU':'chevronD')}</div>
    </div>`;
  // Dettaglio (solo quando espansa)
  // Le ISTRUZIONI per prime: sono l'unico motivo per cui apre la scheda.
  // Priorità e stato erano tre righe di servizio che le spingevano in basso
  // ("Stato: Calendarizzato" poi non vuol dire niente per chi deve avvitare un gommino).
  const wantFoto=vuoleFoto(x), aspetta=attendeFoto(x);
  const body = open ? `<div class="ibody">
      ${istr?`<div class="istr ${nuove?'nuova':''}"><span class="lbl">${ic('info')}${
        nuove?'Istruzioni aggiornate dall\'ufficio':'Istruzioni operatore'}</span>${esc(istr)}</div>`:''}
      ${(x.note_operatore||'').trim()?`<div class="mynote"><span class="lbl">${ic('info')}Quello che hai scritto tu</span>${esc(x.note_operatore.trim())}</div>`:''}
      ${allegatiBlock(key)}
      <div class="actions">
        ${aspetta&&!conf
          ? `<button class="btn foto grande" onclick="pickFoto('${kind}','${id}')">${ic('camera')}Manda la foto</button>
             <button class="btn" onclick="conferma('${kind}','${id}')">${ic('check')}Confermo fatto</button>`
          : `<button class="btn ok ${conf?'done':''}" onclick="${conf?`riattiva('${kind}','${id}')`:`chiediFoto('${kind}','${id}',${wantFoto})`}" title="${conf?'Clicca per riattivare':''}">
               ${ic('check')}${conf?'Confermato':'Confermo fatto'}</button>
             <button class="btn foto" onclick="pickFoto('${kind}','${id}')">${ic('camera')}Foto / Video</button>`}
        <button class="btn wa" onclick="inoltraWa('${kind}','${id}')">${ic('message')}Inoltra su WhatsApp</button>
      </div>
      ${NOTE_OPEN===key
        ? `<div class="notebox">
            <div class="notelbl">${ic('info')}Nota per l'ufficio</div>
            <textarea id="nota-${id}" rows="3" placeholder="Es. in attesa della lavanderia, torno domani"></textarea>
            <div class="noteact"><button class="btn ghost" onclick="closeNota()">Annulla</button>
            <button class="btn ok" onclick="sendNota('${kind}','${id}')">${ic('check')}Invia all'ufficio</button></div></div>`
        : `<button class="notebtn" onclick="openNota('${key}')">${ic('info')}Aggiungi nota per l'ufficio</button>`}
      ${RESCHED_OPEN===key
        ? `<div class="notebox">
            <div class="notelbl">${ic('calendar')}Chiedi all'ufficio di spostare la data</div>
            <input type="date" id="rsc-${id}" class="rsc-input">
            <div class="noteact"><button class="btn ghost" onclick="closeResched()">Annulla</button>
            <button class="btn ok" onclick="sendResched('${kind}','${id}')">${ic('check')}Invia richiesta</button></div></div>`
        : `<button class="notebtn" onclick="openResched('${key}')">${ic('calendar')}Chiedi di spostare la data</button>`}
    </div>` : '';
  return `<div class="icard compact ${dentro?'dentro':''} ${(late&&segnaRitardo!==false)?'late':''} ${sel?'sel':''} ${open?'open':''}" data-k="${key}">${head}${body}</div>`;
}

function isVideo(u){ return /\.(mp4|mov|webm|m4v|avi)(\?|$)/i.test(u||''); }
function isPdfA(a){ const u=String((a&&a.url)||'').split('?')[0];
  return /\.pdf$/i.test((a&&a.name)||'') || /\.pdf$/i.test(u); }
/* Sezione allegati CONDIVISA: mostra i file caricati dall'operatore E quelli aggiunti dall'ufficio
   su Notion. Si carica dal vivo (URL freschi) quando la card è aperta. */
let ALLEG={};
function normUp(list){ return (list||[]).map(x => typeof x==='string' ? {url:x, video:isVideo(x)} : x); }
/* Nome leggibile dell'allegato: quello di Notion, altrimenti dedotto dall'URL */
/* Chi ha caricato il file e quando. Con foto e video che si accumulano su uno
   stesso intervento, senza questo non si capisce piu' quale sia il "prima" e
   quale il "dopo". I file messi dall'ufficio direttamente su Notion non hanno
   traccia: si dichiarano come tali invece di inventare un autore. */
function allegFirma(a){
  if(!a) return '';
  if(!a.chi) return "aggiunto dall'ufficio";
  let q='';
  if(a.quando){
    const d=new Date(a.quando);
    if(!isNaN(d)){
      const oggi=new Date();
      const stessoGiorno = d.toDateString()===oggi.toDateString();
      const ora=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
      q = stessoGiorno ? ('oggi alle '+ora)
        : (d.getDate()+' '+MESI3[d.getMonth()]+' alle '+ora);
    }
  }
  return 'caricata da '+a.chi+(q?' · '+q:'');
}
function allegName(a,i){
  let n=((a&&a.name)||'').trim();
  if(!n){ try{ n=decodeURIComponent(String((a&&a.url)||'').split('?')[0].split('/').pop()||''); }catch(_){ n=''; } }
  return n || `Allegato ${i+1}`;
}
function allegThumbsHtml(list,key){
  list=(list||[]).filter(a=>a&&a.url);
  if(!list.length) return '';
  const thumbs=list.map((a,i)=>{
    const nome=esc(allegName(a,i));
    return isPdfA(a)
      ? `<button class="thumb doc" onclick="openLB('${key}',${i})" title="${nome}">${ic('clipboard')}<span>PDF</span></button>`
      : a.video
      ? `<button class="thumb vid" onclick="openLB('${key}',${i})" title="${nome}">${ic('play')}</button>`
      : `<button class="thumb" onclick="openLB('${key}',${i})" title="${nome}" style="background-image:url('${esc(a.url)}')"></button>`;
  }).join('');
  return `<div class="lbl">${ic('camera')}Allegati (${list.length}) · condivisi con l'ufficio</div>
    <div class="thumbs">${thumbs}</div>`;
}
function allegatiBlock(key){
  const list = ALLEG[key] || normUp(UPLOADS[key]);
  return `<div class="alleg" id="alleg-${key}">${allegThumbsHtml(list,key)}</div>`;
}
async function fetchAllegati(kind,id){
  const key=kind+':'+id;
  try{
    const r=await fetch(`${API}/allegati/${kind}/${id}`,{cache:'no-store'}); const j=await r.json();
    if(j&&j.ok){ ALLEG[key]=j.allegati; const el=document.getElementById('alleg-'+key); if(el) el.innerHTML=allegThumbsHtml(j.allegati,key);
      if(LB.open&&LB.key===key){ LB.list=lbList(key); paintLB(); } }
  }catch(_){}
}

/* ── Visualizzatore allegati (popup sfogliabile, senza aprire nuove schede) ──
   Vive fuori da #app così i re-render non lo toccano: sfogliare è istantaneo. */
let LB={key:null,list:[],idx:0,open:false};
function lbList(key){ return (ALLEG[key]||normUp(UPLOADS[key])||[]).filter(a=>a&&a.url); }
function openLB(key,idx){
  LB.key=key; LB.list=lbList(key); LB.idx=idx||0;
  if(!LB.list.length) return;
  LB.open=true; document.addEventListener('keydown',lbKeyNav);
  document.body.style.overflow='hidden';
  paintLB();
}
function closeLB(){
  LB.open=false; document.removeEventListener('keydown',lbKeyNav);
  document.body.style.overflow='';
  const el=document.getElementById('lbox'); if(el) el.remove();
}
function lbKeyNav(e){
  if(e.key==='Escape') closeLB();
  else if(e.key==='ArrowRight') lbGo(1);
  else if(e.key==='ArrowLeft') lbGo(-1);
}
function lbGo(d){ const n=LB.list.length; if(!n) return; LB.idx=(LB.idx+d+n)%n; paintLB(); }
function lbSet(i){ LB.idx=i; paintLB(); }
function lbStageClick(e){ if(e.target.classList.contains('lbstage')) closeLB(); }
let _lbX=null;
function lbTS(e){ _lbX=e.changedTouches[0].clientX; }
function lbTE(e){ if(_lbX==null) return; const dx=e.changedTouches[0].clientX-_lbX; _lbX=null;
  if(Math.abs(dx)>45) lbGo(dx<0?1:-1); }
/* precarica il precedente e il successivo: il cambio è immediato */
function lbPreload(){ const n=LB.list.length; if(n<2) return;
  [1,-1].forEach(d=>{ const a=LB.list[(LB.idx+d+n)%n];
    if(a&&!a.video&&!isPdfA(a)){ const im=new Image(); im.src=a.url; } }); }
function paintLB(){
  if(!LB.open) return;
  let el=document.getElementById('lbox');
  if(!el){
    el=document.createElement('div'); el.id='lbox'; el.className='lbox';
    el.addEventListener('touchstart',lbTS,{passive:true});
    el.addEventListener('touchend',lbTE,{passive:true});
    document.body.appendChild(el);
  }
  const a=LB.list[LB.idx]; if(!a){ closeLB(); return; }
  const n=LB.list.length, nome=esc(allegName(a,LB.idx));
  const media = isPdfA(a)
    ? `<iframe class="lbmedia lbdoc" src="${esc(a.url)}" title="${nome}"></iframe>`
    : a.video
    ? `<video class="lbmedia" src="${esc(a.url)}" controls playsinline preload="metadata"></video>`
    : `<img class="lbmedia" src="${esc(a.url)}" alt="${nome}">`;
  const nav = n>1 ? `<button class="lbnav prev" onclick="lbGo(-1)" aria-label="Precedente">${ic('chevronL')}</button>
      <button class="lbnav next" onclick="lbGo(1)" aria-label="Successivo">${ic('chevronR')}</button>` : '';
  const strip = n>1 ? `<div class="lbstrip">${LB.list.map((x,i)=> isPdfA(x)
      ? `<button class="lbth doc ${i===LB.idx?'on':''}" onclick="lbSet(${i})" title="${esc(allegName(x,i))}">${ic('clipboard')}</button>`
      : x.video
      ? `<button class="lbth vid ${i===LB.idx?'on':''}" onclick="lbSet(${i})" title="${esc(allegName(x,i))}">${ic('play')}</button>`
      : `<button class="lbth ${i===LB.idx?'on':''}" onclick="lbSet(${i})" title="${esc(allegName(x,i))}" style="background-image:url('${esc(x.url)}')"></button>`).join('')}</div>` : '';
  el.innerHTML=`<div class="lbtop">
      <div class="lbtitle"><b>${esc(allegFirma(a))}</b>
        <span>${nome}${n>1?` · ${LB.idx+1} di ${n}`:''}</span></div>
      <div class="lbacts">
        <a class="lbbtn" href="${esc(a.url)}" target="_blank" rel="noopener" title="Apri originale">${ic('download')}</a>
        <button class="lbbtn" onclick="closeLB()" aria-label="Chiudi">${ic('close')}</button>
      </div></div>
    <div class="lbstage" onclick="lbStageClick(event)">${media}${nav}</div>${strip}`;
  lbPreload();
}

/* Conferma con finestra di annullamento (5s). Scrive su Notion solo se non annullato. */
let PENDING=null;
/* Promemoria foto: compare SOLO dove la foto serve davvero. Se uscisse ogni volta,
   dopo tre conferme lo chiuderebbe d'istinto e non servirebbe più a niente.
   Si può saltare: se lo salta resta scritto nelle note che ha chiuso senza prova. */
let FOTO_ASK=null;
async function chiediFoto(kind,id,wantFoto){
  if(!wantFoto){ conferma(kind,id); return; }
  // Bug reale (29 ago 2026): il promemoria "Hai la foto?" chiedeva sempre, anche quando
  // l'operatore aveva GIA' caricato la foto un attimo prima con "Foto / Video" — risultato:
  // toccava "Salta" per abitudine e la nota diceva "confermato senza foto" nonostante la foto
  // ci fosse davvero. Ora controlla gli allegati caricati dal portale (campo "chi" valorizzato,
  // diverso da quelli aggiunti dall'ufficio su Notion che hanno chi=null) prima di chiedere.
  const key=kind+':'+id;
  if(!ALLEG[key]){
    try{ const r=await fetch(`${API}/allegati/${kind}/${id}`,{cache:'no-store'});
      const j=await r.json(); if(j&&j.ok) ALLEG[key]=j.allegati; }catch(_){}
  }
  const giaCaricataDaOperatore=(ALLEG[key]||[]).some(a=>a&&a.url&&a.chi);
  if(giaCaricataDaOperatore){ conferma(kind,id); return; }
  FOTO_ASK={kind,id}; render();
}
function chiudiChiediFoto(){ FOTO_ASK=null; render(); }
function fotoDaSheet(){ const a=FOTO_ASK; FOTO_ASK=null; render(); if(a) pickFoto(a.kind,a.id); }
function confermaSenzaFoto(){ const a=FOTO_ASK; FOTO_ASK=null; render(); if(a) conferma(a.kind,a.id,true); }
function sheetFoto(){
  if(!FOTO_ASK) return '';
  const arr=FOTO_ASK.kind==='issue'?DATA.issues:DATA.tasks;
  const it=(arr||[]).find(x=>x.notion_id===FOTO_ASK.id);
  const titolo=it?(it.descrizione||it.nome||'questo intervento'):'questo intervento';
  return `<div class="sheetwrap" onclick="chiudiChiediFoto()">
    <div class="sheet" onclick="event.stopPropagation()">
      <div class="st">Hai la foto?</div>
      <p class="sp">Per «${esc(titolo)}» l'ufficio aspetta una foto. Puoi mandarla adesso oppure saltare.</p>
      <div class="sacts">
        <button class="btn ok" onclick="fotoDaSheet()">${ic('camera')}Scatta o scegli</button>
        <button class="skip" onclick="confermaSenzaFoto()">Salta</button>
      </div></div></div>`;
}

function conferma(kind,id,senzaFoto){
  if(PENDING) commitPending();                 // se c'è già un pending, lo confermo subito
  const arr=kind==='issue'?DATA.issues:DATA.tasks;
  const it=(arr||[]).find(x=>x.notion_id===id); if(!it) return;
  it.confermato_manutentore=true; render();     // ottimistico
  let sec=5;
  const t=document.getElementById('toast');
  const paint=()=>{ t.innerHTML=`<svg class="ic" viewBox="0 0 24 24">${ICN.check}</svg><span>Segnato come fatto</span>`+
    `<button class="undo-btn" onclick="undoConferma()">${ic('chevronL')}Annulla ${sec}</button>`; };
  paint(); t.classList.add('show','undo');
  const iv=setInterval(()=>{ sec--; if(sec<=0){ commitPending(); } else paint(); },1000);
  PENDING={kind,id,it,iv,senzaFoto:!!senzaFoto};
}
function commitPending(){
  if(!PENDING) return;
  const p=PENDING; PENDING=null; clearInterval(p.iv);
  const t=document.getElementById('toast'); t.classList.remove('show','undo');
  fetch(`${API}/conferma`,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({kind:p.kind,id:p.id,senza_foto:p.senzaFoto})})
    .then(r=>r.json()).then(j=>{ if(!j.ok) throw 0; if(j.note_operatore){ p.it.note_operatore=j.note_operatore; render(); } })
    .catch(()=>{ p.it.confermato_manutentore=false; render(); toast('Conferma non riuscita, riprova.'); });
}
function undoConferma(){
  if(!PENDING) return;
  const p=PENDING; PENDING=null; clearInterval(p.iv);
  p.it.confermato_manutentore=false; render();
  const t=document.getElementById('toast'); t.classList.remove('show','undo');
  toast('Annullato');
}

/* Riattiva: ri-clic su "Confermato" torna a "da fare" (per chi conferma per sbaglio). Diretto, no countdown. */
async function riattiva(kind,id){
  const arr=kind==='issue'?DATA.issues:DATA.tasks;
  const it=(arr||[]).find(x=>x.notion_id===id); if(!it) return;
  it.confermato_manutentore=false; render();  // ottimistico
  try{
    const r=await fetch(`${API}/conferma`,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({kind,id,valore:false})});
    const j=await r.json(); if(!j.ok) throw 0;
    if(j.note_operatore) it.note_operatore=j.note_operatore;
    toast('Riattivata'); render();
  }catch(e){ it.confermato_manutentore=true; render(); toast('Non riuscito, riprova.'); }
}

/* Nota operatore ↔ ufficio */
function openNota(key){ NOTE_OPEN=key; RESCHED_OPEN=null; render();
  const id=key.split(':')[1]; const t=document.getElementById('nota-'+id); if(t) t.focus(); }
function closeNota(){ NOTE_OPEN=null; render(); }

/* Richiesta ricalendarizzazione: l'operatore chiede una nuova data, NON la sposta lui.
   Arriva all'ufficio nelle Note operatore. */
function openResched(key){ RESCHED_OPEN=key; NOTE_OPEN=null; render();
  const id=key.split(':')[1]; const el=document.getElementById('rsc-'+id);
  if(el){ el.value=addDays(todayISO(),1); } }
function closeResched(){ RESCHED_OPEN=null; render(); }
async function sendResched(kind,id){
  const el=document.getElementById('rsc-'+id); const dv=el&&el.value;
  if(!dv){ toast('Scegli una data'); return; }
  RESCHED_OPEN=null;
  const testo=`📅 Richiesta ricalendarizzazione al ${dLong(dv)}`;
  const arr=kind==='issue'?DATA.issues:DATA.tasks; const it=(arr||[]).find(x=>x.notion_id===id);
  try{
    const r=await fetch(`${API}/nota`,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({kind,id,testo})});
    const j=await r.json(); if(!j.ok) throw 0;
    if(it) it.note_operatore=j.note_operatore; toast("Richiesta inviata all'ufficio"); render();
  }catch(e){ toast('Non riuscito, riprova'); render(); }
}
async function sendNota(kind,id){
  const t=document.getElementById('nota-'+id); const testo=(t&&t.value||'').trim();
  if(!testo){ toast('Scrivi qualcosa prima di inviare'); return; }
  NOTE_OPEN=null;
  const arr=kind==='issue'?DATA.issues:DATA.tasks;
  const it=(arr||[]).find(x=>x.notion_id===id);
  try{
    const r=await fetch(`${API}/nota`,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({kind,id,testo})});
    const j=await r.json(); if(!j.ok) throw 0;
    if(it) it.note_operatore=j.note_operatore; toast("Nota inviata all'ufficio"); render();
  }catch(e){ toast('Nota non inviata, riprova'); render(); }
}

/* Foto/Video — da fotocamera, file o galleria; anche più di uno. Vale per manutenzioni e task */
let FOTO_KIND=null, FOTO_ID=null;
function pickFoto(kind,id){
  FOTO_KIND=kind; FOTO_ID=id;
  let inp=document.getElementById('fotoInput');
  if(!inp){ inp=document.createElement('input'); inp.type='file'; inp.accept='image/*,video/*';
    inp.multiple=true; inp.id='fotoInput'; inp.style.display='none';
    inp.onchange=uploadFoto; document.body.appendChild(inp); }
  inp.value=''; inp.click();  // niente capture: il telefono chiede Fotocamera / Foto / File
}
/* Rimpicciolisce la foto prima di spedirla: uno scatto di telefono è 3-12 MB e 4000px,
   per documentare una macchia bastano 1920px. Meno dati sulla rete dell'operatore e
   caricamento molto più rapido. Se il browser non riesce a leggerla, si manda l'originale. */
async function comprimi(f){
  if(!/^image\//.test(f.type)) return f;          // i video non si toccano
  if(f.size < 900*1024) return f;                 // già leggera
  try{
    const bmp=await createImageBitmap(f);
    const MAX=1920, s=Math.min(1, MAX/Math.max(bmp.width,bmp.height));
    const w=Math.round(bmp.width*s), h=Math.round(bmp.height*s);
    const c=document.createElement('canvas'); c.width=w; c.height=h;
    c.getContext('2d').drawImage(bmp,0,0,w,h);
    if(bmp.close) bmp.close();
    const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',0.82));
    if(!blob || blob.size>=f.size) return f;
    return new File([blob], f.name.replace(/\.[^.]+$/,'')+'.jpg', {type:'image/jpeg'});
  }catch(_){ return f; }
}

/* Il file va DAL TELEFONO DIRETTO a Supabase Storage.
   Prima passava dal nostro server, ma Vercel blocca tutto quello che supera ~4.5 MB:
   l'operatore vedeva "Caricamento non riuscito" senza capire perché (9 ago 2026). */
async function inviaFile(kind,id,f){
  const ext=((f.name||'').split('.').pop()||'jpg').toLowerCase();
  const s=await fetch(`${API}/foto-firma`,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({issue_id:id, ext})}).then(r=>r.json());
  if(!s.ok || !s.upload){
    // Ripiego sulla vecchia strada: funziona solo per i file piccoli.
    if(f.size > 4*1024*1024) throw new Error('troppo grande');
    const fd=new FormData(); fd.append('issue_id',id); fd.append('kind',kind); fd.append('file',f);
    const j=await fetch(`${API}/foto`,{method:'POST',body:fd}).then(r=>r.json());
    if(!j.ok) throw new Error(j.error||'invio');
    return j.url;
  }
  const up=await fetch(s.upload,{method:'PUT',
    headers:{'Content-Type':f.type||'application/octet-stream'}, body:f});
  if(!up.ok) throw new Error('invio '+up.status);
  const d=await fetch(`${API}/foto-fatta`,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({issue_id:id, url:s.url, ext:s.ext})}).then(r=>r.json());
  if(!d.ok) throw new Error(d.error||'aggancio');
  return s.url;
}

async function uploadFoto(e){
  const files=Array.from(e.target.files||[]); if(!files.length||!FOTO_ID) return;
  const kind=FOTO_KIND||'issue', id=FOTO_ID, key=kind+':'+id;
  UPLOADS[key]=UPLOADS[key]||[];
  const vids=files.filter(f=>/^video/.test(f.type)||isVideo(f.name)).length;
  const phts=files.length-vids;
  let ok=0, errore='';
  for(let i=0;i<files.length;i++){
    toast(files.length>1?`Invio ${i+1} di ${files.length}…`:'Invio in corso…');
    try{
      const url=await inviaFile(kind, id, await comprimi(files[i]));
      ok++; if(url) UPLOADS[key].push(url);
    }catch(err){ errore=errore||String(err.message||err); }
  }
  render();  // mostra subito le anteprime (UPLOADS)
  fetchAllegati(kind, id);  // poi allinea alla lista reale/condivisa su Notion
  // Traccia l'upload nelle note operatore (bullet con emoji), così resta a memoria su Notion
  if(ok>0){
    const bits=[];
    if(phts===1) bits.push('📷 caricata 1 foto'); else if(phts>1) bits.push(`📷 caricate ${phts} foto`);
    if(vids===1) bits.push('🎥 caricato 1 video'); else if(vids>1) bits.push(`🎥 caricati ${vids} video`);
    const testo=bits.join(' · ');
    if(testo){
      try{ const r=await fetch(`${API}/nota`,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({kind,id,testo})}); const j=await r.json();
        if(j.ok){ const arr=kind==='issue'?DATA.issues:DATA.tasks; const it=(arr||[]).find(x=>x.notion_id===id);
          if(it){ it.note_operatore=j.note_operatore; render(); } } }catch(_){}
    }
  }
  if(ok) toast(ok>1?`${ok} file inviati all'ufficio`:"File inviato all'ufficio");
  else toast(errore==='troppo grande'
    ? 'File troppo pesante: prova con un video più corto'
    : 'Invio non riuscito, riprova' + (errore?' ('+errore+')':''));
}

function toast(msg){ const t=document.getElementById('toast');
  t.innerHTML=ICN.check?`<svg class="ic" viewBox="0 0 24 24">${ICN.check}</svg>`+esc(msg):esc(msg);
  t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2600); }

load();
