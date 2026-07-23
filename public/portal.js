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
};
function ic(name, cls){ return `<svg class="ic${cls?' '+cls:''}" viewBox="0 0 24 24">${ICN[name]||''}</svg>`; }

let DATA=null, TAB='dafare', FILTER='tutti', SORT='data', SEL=todayISO(), WEEK0=mondayOf(todayISO());
let NOTE_OPEN=null, RESCHED_OPEN=null, SELMODE=false, SELECTED=new Set(), UPLOADS={}, SEL_RESCHED_DATE='';
let OPEN_APTS=new Set(), OVERDUE_OPEN=false, OPEN_CARDS=new Set(), OPEN_URG=new Set();
let PVIEW='giorno', LEG_OPEN=false;
function toggleLeg(){ LEG_OPEN=!LEG_OPEN; render(); }
function setPView(v){ PVIEW=v; render(); }

/* ── Rifornimenti (carrello) ─────────────────────────────────────────── */
let RIF_APTS=null, RIF_APT=null, RIF_APTVIA='', RIF_CART=new Set(), RIF_CUSTOM=[],
    RIF_URG='2w', RIF_CARTOPEN=false, RIF_URGENT=new Set(),
    RIF_VIEW='catalogo', RIF_STORICO=null, RIF_DONE=null, RIF_HQ='', RIF_HAPT=null, RIF_APTQ='',
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

async function load(){
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
  if(RIF_CARTOPEN || LB.open || RIF_DSEL.size) return;  // non ricostruire nel carrello, negli allegati o durante una selezione consegne
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

function render(){
  const c=counts();
  const nCart=RIF_CART.size+RIF_CUSTOM.length;
  const view = TAB==='dafare'?viewDaFare() : TAB==='pulizie'?viewPulizie() : viewRifornimenti();
  document.getElementById('app').innerHTML=
    `<div class="tabs"><div class="wrap">
      <button class="tab ${TAB==='dafare'?'on':''}" onclick="setTab('dafare')">${ic('clipboard')}Da fare <span class="n">${c.m+c.t}</span></button>
      <button class="tab ${TAB==='pulizie'?'on':''}" onclick="setTab('pulizie')">${ic('broom')}Pulizie</button>
      <button class="tab ${TAB==='rifornimenti'?'on':''}" onclick="setTab('rifornimenti')">${ic('cart')}Rifornimenti${nCart?` <span class="n">${nCart}</span>`:''}</button>
    </div></div>
    <div class="content">${view}</div>`;
  if(TAB==='rifornimenti' && RIF_VIEW==='catalogo' && RIF_APT && RIF_Q) rifApplyFilter();
  if(TAB==='rifornimenti' && RIF_VIEW==='catalogo' && !RIF_APT && RIF_APTQ) rifAptApplyFilter();
  if(TAB==='rifornimenti' && RIF_VIEW==='storico' && RIF_HQ) histApplyFilter();
}
function setTab(t){ TAB=t; OPEN_CARDS.clear(); if(t==='rifornimenti'){ rifEnsureApts(); if(RIF_STORICO===null) rifLoadStorico(); } render(); }
function setFilter(f){ FILTER=f; OPEN_CARDS.clear(); render(); }
function setSort(s){ SORT=s; OPEN_CARDS.clear(); render(); }
function goOggi(){ WEEK0=mondayOf(todayISO()); SEL=todayISO(); render(); }
function toggleApt(k){ if(OPEN_APTS.has(k)) OPEN_APTS.delete(k); else OPEN_APTS.add(k); render(); }
function toggleOverdue(){ OVERDUE_OPEN=!OVERDUE_OPEN; render(); }
function toggleCard(k){
  const opening=!OPEN_CARDS.has(k);
  if(opening) OPEN_CARDS.add(k); else OPEN_CARDS.delete(k);
  render();
  if(opening){ const i=k.indexOf(':'); fetchAllegati(k.slice(0,i), k.slice(i+1)); }  // allegati freschi (anche dall'ufficio)
}
function toggleUrg(k){ if(OPEN_URG.has(k)) OPEN_URG.delete(k); else OPEN_URG.add(k); render(); }
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
function waTestoInterventi(items){
  const out=[items.length===1?'*🔧 INTERVENTO DA FARE*':`*🔧 INTERVENTI DA FARE · ${items.length}*`,''];
  items.forEach((x,n)=>{
    const t=x._kind==='issue'?(x.descrizione||'Intervento'):(x.nome||'Task');
    const via=x.indirizzo||x.appartamento||''; const d=dateOf(x);
    out.push(`*${n+1}) ${t.toUpperCase()}*`);
    if(via) out.push(`📍 *${via}*`);
    if(d) out.push(`📅 ${dLong(d)}`);
    if(x.priorita) out.push(`⚠️ Priorità: ${P_LBL[x.priorita]||x.priorita}`);
    const istr=(x.istruzioni||'').trim(); if(istr) out.push(`📝 ${istr}`);
    const na=(ALLEG[x._key]||[]).length; if(na) out.push(`📎 ${na} foto in arrivo`);
    out.push('———————');
  });
  return out.join('\n').replace(/———————$/,'').trim();
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
let WA_FILES=[], _waBusy=false;
async function preparaAllegati(){
  if(_waBusy) return;
  const items=selItems();
  if(!items.length){ toast('Seleziona prima gli interventi'); return; }
  _waBusy=true; progOpen(); progSet(0,0);
  let files=[];
  try{ files=await raccogliAllegati(items,progSet); }catch(_){}
  progClose(); _waBusy=false;
  if(!files.length){ toast('Nessun allegato in questi interventi'); return; }
  WA_FILES=files; mostraSheetAllegati();
}
function chiudiSheet(){ const el=document.getElementById('washeet'); if(el) el.remove(); }
function mostraSheetAllegati(){
  chiudiSheet();
  const puo = !!(navigator.canShare && navigator.canShare({files:WA_FILES}));
  const el=document.createElement('div'); el.id='washeet'; el.className='washeet';
  el.innerHTML=`<div class="wsback" onclick="chiudiSheet()"></div>
    <div class="wscard">
      <div class="wstitle">${WA_FILES.length} allegat${WA_FILES.length===1?'o':'i'} pront${WA_FILES.length===1?'o':'i'}</div>
      <div class="wssub">Ogni file ha il nome dell'intervento a cui appartiene.</div>
      <div class="wslist">${WA_FILES.map(f=>`<div class="wsf">${ic('camera')}<span>${esc(f.name)}</span></div>`).join('')}</div>
      ${puo?`<button class="wsbtn wa" onclick="condividiAllegati()">${ic('message')}Condividi (WhatsApp, Mail…)</button>`:''}
      <button class="wsbtn" onclick="scaricaAllegatiPronti()">${ic('download')}Scarica tutti</button>
      <button class="wsbtn ghost" onclick="chiudiSheet()">Annulla</button>
    </div>`;
  document.body.appendChild(el);
}
async function condividiAllegati(){
  // chiamata direttamente dal tocco: cosi' iOS la accetta
  try{ await navigator.share({files:WA_FILES, text:waTestoInterventi(selItems())}); chiudiSheet(); }
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
function weekStrip(byDay){
  let days='';
  for(let i=0;i<7;i++){
    const dISO=addDays(WEEK0,i), d=parseISO(dISO), n=(byDay[dISO]||[]).length;
    const cls=[dISO===SEL?'on':'', dISO===todayISO()?'today':''].join(' ').trim();
    days+=`<div class="day ${cls}" onclick="pick('${dISO}')">
      <div class="dow">${DOW[d.getDay()]}</div><div class="dnum">${d.getDate()}</div>
      ${n?'<div class="dot"></div>':'<div class="empty"></div>'}</div>`;
  }
  const range=`${dShort(WEEK0)} – ${dShort(addDays(WEEK0,6))}`;
  const oggiBtn = WEEK0!==mondayOf(todayISO())
    ? `<button class="oggi-btn" onclick="goOggi()">${ic('calendar')}Oggi</button>` : '';
  return `<div class="wkhead"><span class="wklbl">${ic('calendar')}Settimana · ${range}</span>${oggiBtn}</div>
    <div class="wk"><button class="nav" onclick="shiftWeek(-1)">${ic('chevronL')}</button>
    <div class="days" ontouchstart="wkTouchStart(event)" ontouchend="wkTouchEnd(event)">${days}</div>
    <button class="nav" onclick="shiftWeek(1)">${ic('chevronR')}</button></div>`;
}
function sectionHTML(title, arr, cls, icon){
  return `<div class="section"><div class="sechead ${cls||''}">${icon||''}${esc(title)} <span class="num">${arr.length}</span></div>
    <div class="grid">${arr.map(x=>iCard(x,x._kind)).join('')}</div></div>`;
}

/* ── DA FARE (manutenzioni + task uniti) ──────────────────────────── */
function viewDaFare(){
  const issues=(DATA.issues||[]).map(x=>({...x, _kind:'issue'}));
  const tasks =(DATA.tasks ||[]).map(x=>({...x, _kind:'task'}));
  let items=issues.concat(tasks);
  if(FILTER==='manut') items=items.filter(x=>x._kind==='issue');
  if(FILTER==='task')  items=items.filter(x=>x._kind==='task');

  const chips=`<div class="filters">
    <button class="fchip ${FILTER==='tutti'?'on':''}" onclick="setFilter('tutti')">Tutti <span class="n">${issues.length+tasks.length}</span></button>
    <button class="fchip ${FILTER==='manut'?'on':''}" onclick="setFilter('manut')">${ic('wrench')}Manutenzioni <span class="n">${issues.length}</span></button>
    <button class="fchip ${FILTER==='task'?'on':''}" onclick="setFilter('task')">${ic('clipboard')}Task <span class="n">${tasks.length}</span></button>
  </div>`;
  const ctrl=`<div class="ctrl"><div class="seg">
      <button class="segbtn ${SORT==='urg'?'on':''}" onclick="setSort('urg')">Urgenza</button>
      <button class="segbtn ${SORT==='data'?'on':''}" onclick="setSort('data')">Data</button>
      <button class="segbtn ${SORT==='apt'?'on':''}" onclick="setSort('apt')">Appartamento</button>
    </div>
    <button class="vbtn ${SELMODE?'on':''}" onclick="toggleSelMode()">${ic('check')}${SELMODE?'Annulla':'Seleziona'}</button></div>`;

  const leg=`<div class="legwrap ${LEG_OPEN?'open':''}">
    <button class="legbtn" onclick="toggleLeg()">${ic('info')}Legenda ${ic(LEG_OPEN?'chevronU':'chevronD')}</button>
    <div class="legitems">
      <span><i class="legdot" style="background:#b23b2e"></i>Urgente</span>
      <span><i class="legdot" style="background:#c8792f"></i>Alta</span>
      <span><i class="legdot" style="background:#3b6ea5"></i>Media</span>
      <span><i class="legdot" style="background:#3f8f5e"></i>Bassa</span>
      <span class="legtag late">in ritardo</span>
      <span class="legtag conf">${ic('check')}confermato</span>
      <span class="legtag nod">senza data</span>
    </div></div>`;
  if(!items.length){
    return chips+ctrl+leg+`<div class="empty-state">${ic('check')}<div class="t">Tutto in ordine</div>Nessun intervento aperto al momento.</div>`;
  }
  const selbar = SELMODE ? `<div class="selbar"><span>${SELECTED.size} sel.</span>
    <div class="selacts">
      <input type="date" id="selresched" class="rsc-hidden" onchange="reschedMultiPicked(this.value)">
      <button class="selwa" ${SELECTED.size?'':'disabled'} onclick="inviaWaSelezione()" title="Manda il riepilogo testuale su WhatsApp">${ic('message')}Invia su WhatsApp</button>
      <button class="selconf s2" ${SELECTED.size?'':'disabled'} onclick="preparaAllegati()" title="Scarica le foto degli interventi selezionati">${ic('download')}Scarica allegati</button>
      <button class="selconf s2" ${SELECTED.size?'':'disabled'} onclick="pickReschedMulti()">${ic('calendar')}Chiedi cambio data</button>
      <button class="selconf" ${SELECTED.size?'':'disabled'} onclick="confermaMulti()">${ic('check')}Conferma</button>
    </div></div>` : '';

  const overdue=items.filter(isLate).sort(byPrio);

  let body;
  if(SORT==='apt'){
    body=renderByApt(items);
  }else if(SORT==='data'){
    body=renderByData(items, overdue);
  }else{
    body=renderByUrgency(items);
  }
  return chips+ctrl+leg+body+selbar;
}

/* DATA: banner ritardi (apri/chiudi) → settimana scorribile → giorno scelto */
function renderByData(items, overdue){
  const onTime=items.filter(x=>!isLate(x));
  const byDay={}, undated=[];
  onTime.forEach(x=>{ const d=dateOf(x); if(d)(byDay[d]=byDay[d]||[]).push(x); else undated.push(x); });
  let banner='';
  if(overdue.length){
    banner=`<button class="latebanner ${OVERDUE_OPEN?'open':''}" onclick="toggleOverdue()">
        <span>${ic('info')}${overdue.length} in ritardo</span>${ic(OVERDUE_OPEN?'chevronU':'chevronD')}</button>`;
    if(OVERDUE_OPEN) banner+=`<div class="grid" style="margin-bottom:22px">${overdue.map(x=>iCard(x,x._kind)).join('')}</div>`;
  }
  const list=(byDay[SEL]||[]).slice().sort(byPrio);
  let day=`<div class="daylbl">${dLong(SEL)}<span class="cnt">${list.length} da fare</span></div>`;
  day += list.length
    ? `<div class="grid">${list.map(x=>iCard(x,x._kind)).join('')}</div>`
    : `<div class="empty-state">${ic('check')}<div class="t">Niente in questo giorno</div></div>`;
  if(undated.length) day += `<div class="nodate-sec">
    <div class="nodate-hd">${ic('info')}Senza data <span class="num">${undated.length}</span>
      <span class="nodate-sub">da calendarizzare: chiedi la data all'ufficio</span></div>
    <div class="grid">${undated.map(x=>iCard(x,x._kind)).join('')}</div></div>`;
  return banner + weekStrip(byDay) + day;
}

/* URGENZA: categorie per priorità (accordion). Tap → esplode. Dentro: ritardi prima, poi data */
function renderByUrgency(items){
  const groups=[['Very High','Urgente'],['High','Alta'],['Medium','Media'],['Low','Bassa'],['_none','Senza priorità']];
  const sortInside=(a,b)=>{ if(isLate(a)!==isLate(b)) return isLate(a)?-1:1;
    return (dateOf(a)||'9999').localeCompare(dateOf(b)||'9999'); };
  return groups.map(([k,lbl])=>{
    const arr=items.filter(x=> k==='_none' ? !P_COLOR[x.priorita] : x.priorita===k).sort(sortInside);
    if(!arr.length) return '';
    const c=k==='_none'?'#9A9183':P_COLOR[k];
    const lateN=arr.filter(isLate).length;
    const open=OPEN_URG.has(k);
    const badge=lateN?`<span class="aptlate">${lateN} in ritardo</span>`:'';
    const head=`<button class="apthead ${open?'open':''}" onclick="toggleUrg('${k}')">
        <span class="aptname"><span class="ipdot" style="background:${c}"></span><b style="font-family:var(--body);font-size:15px;color:${c}">${lbl}</b></span>
        <span class="aptmeta">${badge}<span class="aptn">${arr.length}</span>${ic(open?'chevronU':'chevronD')}</span></button>`;
    return `<div class="aptgroup">${head}${open?`<div class="grid aptbody">${arr.map(x=>iCard(x,x._kind)).join('')}</div>`:''}</div>`;
  }).join('');
}

/* APPARTAMENTO: accordion — lista case con conteggio + ritardi, tap per espandere */
function renderByApt(items){
  const byApt={};
  items.forEach(x=>{ const k=x.appartamento||'—'; (byApt[k]=byApt[k]||[]).push(x); });
  return Object.keys(byApt).sort().map(apt=>{
    const lst=byApt[apt].sort((a,b)=>{ if(isLate(a)!==isLate(b)) return isLate(a)?-1:1; return byPrio(a,b); });
    const via=lst[0].indirizzo||apt;
    const lateN=lst.filter(isLate).length;
    const open=OPEN_APTS.has(apt);
    const badge=lateN?`<span class="aptlate">${lateN} in ritardo</span>`:'';
    const head=`<button class="apthead ${open?'open':''}" onclick="toggleApt('${apt.replace(/'/g,"\\'")}')">
        <span class="aptname">${ic('pin')}<b>${esc(via)}</b>${via!==apt?`<span class="aptsub">${esc(apt)}</span>`:''}</span>
        <span class="aptmeta">${badge}<span class="aptn">${lst.length}</span>${ic(open?'chevronU':'chevronD')}</span></button>`;
    return `<div class="aptgroup">${head}${open?`<div class="grid aptbody">${lst.map(x=>iCard(x,x._kind)).join('')}</div>`:''}</div>`;
  }).join('');
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
    const ex=[]; if(p.late_checkout)ex.push('⏰ late checkout'); if(p.early_checkin)ex.push('🔑 early check-in'); if(depOk(p.deposito))ex.push('🧳 deposito: '+p.deposito);
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
  return `<div class="gchip ${done?'done':''}" style="border-left:3px solid ${col}" title="${esc(p.appartamento)} · ${esc(p.tipo||'Standard')}${depOk(p.deposito)?' · deposito: '+esc(p.deposito):''}${p.late_checkout?' · late checkout':''}${p.early_checkin?' · early check-in':''}">
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
    <span>${ic('luggage')}Deposito bagagli</span></div>`;
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
  if(depOk(p.deposito)) svc.push(`<span class="svc">${ic('luggage')}Deposito: ${esc(p.deposito)}</span>`);
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
function rifShowStorico(){
  RIF_VIEW='storico'; RIF_HQ=''; RIF_HAPT=null; RIF_HFASE=null; RIF_DSEL=new Set(); RIF_LOADEDMORE=false;
  // 1. mostra SUBITO l'ultimo stato salvato (apertura istantanea)…
  if(RIF_STORICO===null){
    try{ const c=localStorage.getItem('tcs_rifsto_'+TOKEN);
      if(c){ const j=JSON.parse(c); RIF_STORICO=j.s; RIF_CURSOR=j.c; RIF_HASMORE=j.h; } }catch(_){}
  }
  render();
  // 2. …e intanto arriva il dato fresco da Notion (live)
  rifLoadStorico();
}
function histSetFase(f){ RIF_HFASE=f||null; render(); }
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
  const out=[`*📦 CONSEGNE DA FARE · ${items.length}*`,''];
  items.forEach((o,n)=>{
    const prod=(o.prodotti||'').replace(/^Prodotti \(\d+\):\s*/,'').trim()||(o.descrizione||'').trim();
    out.push(`*${n+1}) → ${o.via}*`);
    if(prod) out.push(`📦 ${prod}`);
    out.push('');
  });
  window.open('https://wa.me/?text='+encodeURIComponent(out.join('\n').trim()),'_blank','noopener');
}
function rifBackCatalogo(){ RIF_VIEW='catalogo'; render(); }
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
  const em=document.getElementById('rifhempty'); if(em) em.style.display=vis?'none':'';
}

const RIF_URG_OPT=[['1w','~1 settimana','Urgente'],['2w','~2 settimane','Normale'],['4w','~4 sett. o più','Con calma']];
const RIF_STATO_COL={'Da acquistare':'#b23b2e','Da pagare':'#3b6ea5','Acquistato':'#3f8f5e','Reso':'#8a6d3b'};
/* Ciclo di vita di un ordine, come lo vede l'operatore */
const RIF_FASE={
  richiesto:  {lbl:'Richiesto',                col:'#9A9183'},
  ordinato:   {lbl:'Ordine fatto · in arrivo', col:'#3b6ea5'},
  magazzino:  {lbl:'In magazzino',             col:'#b5892e'},
  consegnato: {lbl:'Consegnato',               col:'#3f8f5e'},
};
const RIF_FASE_ORD={magazzino:0, ordinato:1, richiesto:2, consegnato:3};  // prima le cose azionabili
/* Percorso del pacco: pipeline completa fino alla consegna in appartamento */
function rifTimeline(o){
  const inCasa = o.luogo==='Appartamento';
  const passi = inCasa ? [
    {lbl:'Richiesto',                  d:o.richiesto_il},
    {lbl:'Ordine fatto (in arrivo)',   d:o.ordinato_il},
    {lbl:'Consegnato in appartamento', d:o.portato_il||o.data_consegna},
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

  // filtro appartamento (via)
  const aptChips = RIF_APTS && RIF_APTS.length>1 ? `<div class="rifhchips">
    <button class="rifhchip ${!RIF_HAPT?'on':''}" onclick="histSetApt('')">Tutte le vie</button>
    ${RIF_APTS.map(a=>`<button class="rifhchip ${RIF_HAPT===a.via?'on':''}" onclick="histSetApt('${esc(a.via).replace(/'/g,"\\'")}')">${ic('pin')}${esc(a.via)}</button>`).join('')}
  </div>` : '';

  // filtro per fase, con conteggi calcolati sull'appartamento scelto
  let base=RIF_STORICO.slice();
  if(RIF_HAPT) base=base.filter(o=>o.via===RIF_HAPT);
  const cnt=f=>base.filter(o=>o.fase===f).length;
  const FCH=[[null,'Tutti',null],['richiesto','Richiesti','#9A9183'],['ordinato','In arrivo','#3b6ea5'],
             ['magazzino','In magazzino','#b5892e'],['consegnato','Consegnati','#3f8f5e']];
  // Numeri solo sugli stati ATTIVI (pipeline aperta): "Consegnati" cresce negli anni
  // e il suo conteggio diventerebbe rumore. La lista carica comunque solo i piu' recenti.
  const faseChips=`<div class="rifhchips">${FCH.map(([f,lbl,col])=>{
    const attivo=f&&f!=='consegnato';
    const n=attivo?` <span class="rifhn">${cnt(f)}</span>`:'';
    return `<button class="rifhchip ${RIF_HFASE===f?'on':''}" onclick="histSetFase(${f?`'${f}'`:'null'})">
      ${col?`<span class="rifdot" style="background:${col}"></span>`:''}${lbl}${n}</button>`;
  }).join('')}</div>`;

  const search=`<div class="rifsearch">${ic('search')}<input id="rifhq" placeholder="Cerca un prodotto o una via…" value="${esc(RIF_HQ)}" oninput="histFilter()"></div>`;

  // ordina: prima le cose azionabili (magazzino, poi in arrivo, poi richiesti, consegnati in fondo), dentro per data
  let list=base.slice();
  if(RIF_HFASE) list=list.filter(o=>o.fase===RIF_HFASE);
  list.sort((a,b)=>{
    const fa=RIF_FASE_ORD[a.fase]??9, fb=RIF_FASE_ORD[b.fase]??9;
    if(fa!==fb) return fa-fb;
    return String(b.richiesto_il||b.data||'').localeCompare(String(a.richiesto_il||a.data||''));
  });

  const cards=list.map((o,i)=>{
    let f=RIF_FASE[o.fase]||RIF_FASE.richiesto;
    if(o.fase==='consegnato') f={lbl:'Consegnato in appartamento',col:'#3f8f5e'};
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
    const selezionabile=o.fase==='magazzino' && o.id;
    const sel=selezionabile && RIF_DSEL.has(o.id);
    const selBtn=selezionabile
      ? `<span class="rifsel ${sel?'on':''}">${sel?ic('check'):''}</span>`
      : '';
    return `<div class="rifhist ${sel?'sel':''} ${selezionabile?'selettabile':''}" data-h="${esc(hay)}"${selezionabile?` onclick="rifDSel('${o.id}')"`:''}>
      <div class="rifhisth"><span class="rifha">${selBtn}${ic('pin')}<b>${esc(o.via)}</b></span>
        <span class="rifhstato pieno" style="background:${f.col};border-color:${f.col}">${esc(f.lbl)}</span></div>
      ${detail?`<div class="rifhistp nolinea">${esc(detail)}</div>`:''}
      ${rifTimeline(o)}
      ${thumbs}
    </div>`;
  }).join('');

  const empty=`<div id="rifhempty" class="empty-state" style="display:none">${ic('search')}<div class="t">Nessun risultato</div>Prova con un'altra parola.</div>`;
  const body = list.length ? `<div class="rifhistlist">${cards}</div>${empty}`
    : `<div class="empty-state">${ic('check')}<div class="t">Niente qui</div>Nessun ordine con questi filtri.</div>`;
  // il passato completo resta raggiungibile, ma si carica solo quando serve
  const more = RIF_HASMORE ? `<button class="rifmore" onclick="rifLoadStorico(true)">${ic('history')}Mostra ordini più vecchi</button>` : '';

  // barra conferma consegna: appare quando c'è merce selezionata
  const dbar = RIF_DSEL.size ? `<div class="selbar"><span class="selinfo">${RIF_DSEL.size} sel.
      <button class="selx" onclick="rifDSelClear()" title="Svuota la selezione e riparti">${ic('close')}Annulla</button></span>
    <div class="selacts">
      <label class="rifddtw"><span>Consegnato il</span>
        <input type="date" id="rifddate" class="rifddt" value="${RIF_DDATE||todayISO()}" onchange="RIF_DDATE=this.value"></label>
      <button class="selwa" onclick="rifWaMagazzino()">${ic('message')}Inoltra al magazzino</button>
      <button class="selconf" onclick="rifConsegna()">${ic('check')}Consegnato in appartamento</button>
    </div></div>` : '';

  return aptChips+faseChips+search+body+more+`<div class="riffabsp"></div>`+dbar;
}

/* ── Card intervento (manutenzione o task) ─────────────────────────── */
function iCard(x,kind){
  const pc=P_COLOR[x.priorita]||'#9A9183';
  const plbl=P_LBL[x.priorita]||x.priorita||'';
  const titolo=kind==='issue'?(x.descrizione||'Intervento'):(x.nome||'Task');
  const dataRaw=kind==='issue'?x.data_intervento:x.due_date;
  const conf=x.confermato_manutentore;
  let late=false, dataLbl='', ritardo=0;
  if(dataRaw){ dataLbl=dLong(dataRaw); if(!conf && dataRaw<todayISO()){ late=true; ritardo=daysBetween(dataRaw,todayISO()); } }
  const via=x.indirizzo||x.appartamento;
  const id=x.notion_id;
  const tipoLbl=kind==='issue'?'Manutenzione':'Task';
  // Stesso riepilogo della selezione multipla: titolo, via, data, priorità e istruzioni complete
  const waTarget=OFFICE_WA?`https://wa.me/${OFFICE_WA}`:'https://wa.me/';
  const wa=`${waTarget}?text=${encodeURIComponent(waTestoInterventi([Object.assign({},x,{_kind:kind,_key:kind+':'+id})]))}`;
  const istr=(x.istruzioni||'').trim();
  const tbadge=kind==='issue'
    ? `<span class="tbadge">${ic('wrench')}Manutenzione</span>`
    : `<span class="tbadge">${ic('clipboard')}Task</span>`;
  const key=kind+':'+id;
  const sel=SELMODE && SELECTED.has(key);
  const open=!SELMODE && OPEN_CARDS.has(key);
  const dueBadge = dataRaw
    ? `<span class="idue ${late?'late':''}">${ic('calendar')}${esc(dShort(dataRaw))}${late?' · scaduta':''}</span>`
    : (conf?'':`<span class="idue nodate">${ic('calendar')}senza data</span>`);
  const lateChip = late?`<span class="latechip">${ritardo}g in ritardo</span>`:'';
  const statusChip = conf ? `<span class="confchip">${ic('check')}confermato</span>` : lateChip;
  // Testata compatta (sempre): pallino priorità · via · intervento · scadenza
  const head=`<div class="ihead" ${SELMODE?`onclick="toggleSel('${kind}','${id}')"`:`onclick="toggleCard('${key}')"`}>
      ${SELMODE?`<span class="selbox">${sel?ic('check'):''}</span>`:`<span class="ipdot" style="background:${pc}" title="${esc(plbl)}"></span>`}
      <div class="imain">
        <div class="ivia">${esc(via||'—')}</div>
        <div class="isub">${statusChip}${esc(titolo)}</div>
      </div>
      <div class="iright">${dueBadge}${SELMODE?'':ic(open?'chevronU':'chevronD')}</div>
    </div>`;
  // Dettaglio (solo quando espansa)
  const body = open ? `<div class="ibody">
      ${x.appartamento && x.appartamento!==via?`<div class="meta">${ic('pin')}${esc(x.appartamento)}</div>`:''}
      ${plbl?`<div class="meta">${ic('info')}Priorità: <b style="color:${pc}">${esc(plbl)}</b></div>`:''}
      ${x.stato?`<div class="meta">${ic('info')}Stato: <b>${esc(x.stato)}</b></div>`:''}
      ${istr?`<div class="istr"><span class="lbl">${ic('info')}Istruzioni operatore</span>${esc(istr)}</div>`:''}
      ${(x.note_operatore||'').trim()?`<div class="mynote"><span class="lbl">${ic('info')}Le tue note</span>${esc(x.note_operatore.trim())}</div>`:''}
      ${allegatiBlock(key)}
      <div class="actions">
        <button class="btn ok ${conf?'done':''}" onclick="${conf?`riattiva('${kind}','${id}')`:`conferma('${kind}','${id}')`}" title="${conf?'Clicca per riattivare':''}">
          ${ic('check')}${conf?'Confermato':'Confermo fatto'}</button>
        <button class="btn foto" onclick="pickFoto('${kind}','${id}')">${ic('camera')}Foto / Video</button>
        ${wa?`<a class="btn wa" href="${wa}" target="_blank" rel="noopener">${ic('message')}WhatsApp</a>`:''}
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
  return `<div class="icard compact ${late?'late':''} ${sel?'sel':''} ${open?'open':''}">${head}${body}</div>`;
}

function isVideo(u){ return /\.(mp4|mov|webm|m4v|avi)(\?|$)/i.test(u||''); }
function isPdfA(a){ const u=String((a&&a.url)||'').split('?')[0];
  return /\.pdf$/i.test((a&&a.name)||'') || /\.pdf$/i.test(u); }
/* Sezione allegati CONDIVISA: mostra i file caricati dall'operatore E quelli aggiunti dall'ufficio
   su Notion. Si carica dal vivo (URL freschi) quando la card è aperta. */
let ALLEG={};
function normUp(list){ return (list||[]).map(x => typeof x==='string' ? {url:x, video:isVideo(x)} : x); }
/* Nome leggibile dell'allegato: quello di Notion, altrimenti dedotto dall'URL */
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
  return `<div class="lbl">${ic('camera')}Allegati (${list.length}) · condivisi con l'ufficio</div><div class="thumbs">${thumbs}</div>`;
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
      <div class="lbtitle"><b>${nome}</b>${n>1?`<span>${LB.idx+1} di ${n}</span>`:''}</div>
      <div class="lbacts">
        <a class="lbbtn" href="${esc(a.url)}" target="_blank" rel="noopener" title="Apri originale">${ic('download')}</a>
        <button class="lbbtn" onclick="closeLB()" aria-label="Chiudi">${ic('close')}</button>
      </div></div>
    <div class="lbstage" onclick="lbStageClick(event)">${media}${nav}</div>${strip}`;
  lbPreload();
}

/* Conferma con finestra di annullamento (5s). Scrive su Notion solo se non annullato. */
let PENDING=null;
function conferma(kind,id){
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
  PENDING={kind,id,it,iv};
}
function commitPending(){
  if(!PENDING) return;
  const p=PENDING; PENDING=null; clearInterval(p.iv);
  const t=document.getElementById('toast'); t.classList.remove('show','undo');
  fetch(`${API}/conferma`,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({kind:p.kind,id:p.id})})
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
async function uploadFoto(e){
  const files=Array.from(e.target.files||[]); if(!files.length||!FOTO_ID) return;
  const kind=FOTO_KIND||'issue', id=FOTO_ID, key=kind+':'+id;
  UPLOADS[key]=UPLOADS[key]||[];
  const vids=files.filter(f=>/^video/.test(f.type)||isVideo(f.name)).length;
  const phts=files.length-vids;
  toast(files.length>1?`Carico ${files.length} file…`:'Carico il file…');
  let ok=0;
  for(const f of files){
    const fd=new FormData(); fd.append('issue_id',id); fd.append('kind',kind); fd.append('file',f);
    try{ const r=await fetch(`${API}/foto`,{method:'POST',body:fd}); const j=await r.json();
      if(j.ok){ ok++; if(j.url) UPLOADS[key].push(j.url); } }catch(_){}
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
  toast(ok?(ok>1?`${ok} file inviati all'ufficio`:"File inviato all'ufficio"):'Caricamento non riuscito');
}

function toast(msg){ const t=document.getElementById('toast');
  t.innerHTML=ICN.check?`<svg class="ic" viewBox="0 0 24 24">${ICN.check}</svg>`+esc(msg):esc(msg);
  t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2600); }

load();
