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
  pin:'<path d="M20 10c0 5.5-8 11-8 11s-8-5.5-8-11a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.6"/>',
  wrench:'<path d="M15 6a4 4 0 0 0 5.2 5.2L14 17.4a2.3 2.3 0 0 1-3.3-3.3L16.8 8A4 4 0 0 0 15 6l-3 3-2-2 3-3Z"/>',
  sparkles:'<path d="M12 4l1.6 4.9L18.5 10.5 13.6 12.1 12 17l-1.6-4.9L5.5 10.5l4.9-1.6z"/><path d="M18 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  clipboard:'<rect x="8" y="3" width="8" height="4" rx="1"/><path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/><path d="m9.5 14 2 2 3.5-3.5"/>',
  broom:'<path d="M4 20l7-7"/><path d="M13 11l4-4a2.8 2.8 0 0 1 4 4l-4 4"/><path d="M11 13l3 3-4 4H6l-2-2 4-4z"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
};
function ic(name, cls){ return `<svg class="ic${cls?' '+cls:''}" viewBox="0 0 24 24">${ICN[name]||''}</svg>`; }

let DATA=null, TAB='dafare', FILTER='tutti', SORT='urg', SEL=todayISO(), WEEK0=mondayOf(todayISO());
let NOTE_OPEN=null, SELMODE=false, SELECTED=new Set();
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

async function load(){
  try{
    const r=await fetch(`${API}/data`,{cache:'no-store'}); DATA=await r.json();
    if(DATA.error){ document.getElementById('app').innerHTML='<div class="content"><div class="empty-state">Sessione non valida.</div></div>'; return; }
    render();
    setupAutoRefresh();
  }catch(e){ document.getElementById('app').innerHTML='<div class="content"><div class="empty-state">Connessione non riuscita. Riprova.</div></div>'; }
}

/* Auto-refresh: riallinea al mirror quando la pagina torna in primo piano e ogni 45s.
   Silenzioso (niente "Carico…"), preserva tab/filtro/giorno; salta se c'è un annullo in corso. */
let _refreshing=false;
async function silentRefresh(){
  if(_refreshing || PENDING || NOTE_OPEN || SELMODE || document.hidden) return;
  _refreshing=true;
  try{
    const r=await fetch(`${API}/data`,{cache:'no-store'}); const fresh=await r.json();
    if(!fresh.error){ DATA=fresh; render(); }
  }catch(_){}
  _refreshing=false;
}
let _autoOn=false;
function setupAutoRefresh(){
  if(_autoOn) return; _autoOn=true;
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden) silentRefresh(); });
  window.addEventListener('focus', silentRefresh);
  setInterval(silentRefresh, 45000);
}

function counts(){
  return {p:(DATA.pulizie||[]).filter(x=>x.stato!=='Completata').length,
          m:(DATA.issues||[]).length, t:(DATA.tasks||[]).length};
}

function render(){
  const c=counts();
  document.getElementById('app').innerHTML=
    `<div class="tabs"><div class="wrap">
      <button class="tab ${TAB==='dafare'?'on':''}" onclick="setTab('dafare')">${ic('clipboard')}Da fare <span class="n">${c.m+c.t}</span></button>
      <button class="tab ${TAB==='pulizie'?'on':''}" onclick="setTab('pulizie')">${ic('broom')}Pulizie</button>
    </div></div>
    <div class="content">${TAB==='dafare'?viewDaFare():viewPulizie()}</div>`;
}
function setTab(t){ TAB=t; render(); }
function setFilter(f){ FILTER=f; render(); }
function setSort(s){ SORT=s; render(); }
function goOggi(){ WEEK0=mondayOf(todayISO()); SEL=todayISO(); render(); }

/* Conferma multipla */
function toggleSelMode(){ SELMODE=!SELMODE; SELECTED.clear(); render(); }
function toggleSel(kind,id){ const k=kind+':'+id; if(SELECTED.has(k)) SELECTED.delete(k); else SELECTED.add(k); render(); }
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
    <div class="days">${days}</div>
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

  if(!items.length){
    return chips+ctrl+`<div class="empty-state">${ic('check')}<div class="t">Tutto in ordine</div>Nessun intervento aperto al momento.</div>`;
  }
  const selbar = SELMODE ? `<div class="selbar"><span>${SELECTED.size} selezionat${SELECTED.size===1?'a':'e'}</span>
    <button class="selconf" ${SELECTED.size?'':'disabled'} onclick="confermaMulti()">${ic('check')}Conferma fatte</button></div>` : '';

  const overdue=items.filter(isLate).sort(byPrio);
  const onTime=items.filter(x=>!isLate(x));
  const lateSec = overdue.length ? sectionHTML('In ritardo', overdue, 'hot', ic('info')) : '';

  let body;
  if(SORT==='apt'){
    body=renderByApt(items);
  }else if(SORT==='data'){
    const byDay={}, undated=[];
    onTime.forEach(x=>{ const d=dateOf(x); if(d)(byDay[d]=byDay[d]||[]).push(x); else undated.push(x); });
    const list=(byDay[SEL]||[]).slice().sort(byPrio);
    let day=`<div class="daylbl">${dLong(SEL)}<span class="cnt">${list.length} da fare</span></div>`;
    day += list.length
      ? `<div class="grid">${list.map(x=>iCard(x,x._kind)).join('')}</div>`
      : `<div class="empty-state">${ic('check')}<div class="t">Niente in questo giorno</div></div>`;
    if(undated.length) day += sectionHTML('Senza data', undated.sort(byPrio), '', ic('info'));
    body = lateSec + weekStrip(byDay) + day;
  }else{ // urgenza
    body = lateSec + `<div class="grid">${onTime.slice().sort(byPrio).map(x=>iCard(x,x._kind)).join('')}</div>`;
  }
  return chips+ctrl+body+selbar;
}

/* Per appartamento: raggruppa per casa, urgenza dentro */
function renderByApt(items){
  const byApt={};
  items.forEach(x=>{ const k=x.appartamento||'—'; (byApt[k]=byApt[k]||[]).push(x); });
  return Object.keys(byApt).sort().map(apt=>{
    const lst=byApt[apt].sort((a,b)=>{
      if(isLate(a)!==isLate(b)) return isLate(a)?-1:1;
      return byPrio(a,b);
    });
    const via=lst[0].indirizzo||apt;
    return `<div class="section"><div class="sechead">${ic('pin')}${esc(via)} <span class="num">${lst.length}</span></div>
      <div class="grid">${lst.map(x=>iCard(x,x._kind)).join('')}</div></div>`;
  }).join('');
}

/* ── PULIZIE ───────────────────────────────────────────────────────── */
function viewPulizie(){
  const puliz=(DATA.pulizie||[]).filter(x=>x.stato!=='Annullata');
  const byDay={}; puliz.forEach(p=>{ if(p.data) (byDay[p.data]=byDay[p.data]||[]).push(p); });
  const list=(byDay[SEL]||[]).slice().sort((a,b)=>(a.inizio||'').localeCompare(b.inizio||''));
  let body;
  if(!list.length){
    body=`<div class="empty-state">${ic('sparkles')}<div class="t">Giornata libera</div>Nessuna pulizia ${SEL===todayISO()?'oggi':'in questo giorno'}.</div>`;
  }else{
    body=`<div class="grid">${list.map(pCard).join('')}</div>`;
  }
  return weekStrip(byDay)+`<div class="daylbl">${dLong(SEL)}<span class="cnt">${list.length} pulizi${list.length===1?'a':'e'}</span></div>`+body;
}

function pCard(p){
  const cls=p.tipo==='Proprietario'?'owner':p.tipo==='Intermedia'?'mid':'';
  const chip=p.tipo==='Proprietario'?`<span class="chip owner"><span class="d"></span>Proprietario</span>`
      :p.tipo==='Intermedia'?`<span class="chip mid"><span class="d"></span>Intermedia</span>`
      :`<span class="chip std"><span class="d"></span>Standard</span>`;
  const svc=[];
  if(p.late_checkout) svc.push(`<span class="svc">${ic('clock')}Late checkout</span>`);
  if(p.early_checkin) svc.push(`<span class="svc">${ic('key')}Early check-in</span>`);
  if(p.deposito) svc.push(`<span class="svc">${ic('luggage')}Deposito: ${esc(p.deposito)}</span>`);
  const ora=p.inizio?`${esc(p.inizio)}${p.fine?'–'+esc(p.fine):''}`:'Orario da definire';
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
  // Messaggio WhatsApp precompilato con tutti i dettagli
  const waLines=[`${tipoLbl}: ${titolo}`, via?`Dove: ${via}`:'',
    x.appartamento&&x.appartamento!==via?`Appartamento: ${x.appartamento}`:'',
    plbl?`Priorità: ${plbl}`:'', dataLbl?`Quando: ${dataLbl}${late?' (in ritardo di '+ritardo+'g)':''}`:'',
    x.stato?`Stato: ${x.stato}`:''].filter(Boolean);
  const waTarget=OFFICE_WA?`https://wa.me/${OFFICE_WA}`:'https://wa.me/';
  const wa=`${waTarget}?text=${encodeURIComponent(waLines.join('\n'))}`;
  const istr=(x.istruzioni||'').trim();
  const tbadge=kind==='issue'
    ? `<span class="tbadge">${ic('wrench')}Manutenzione</span>`
    : `<span class="tbadge">${ic('clipboard')}Task</span>`;
  const key=kind+':'+id;
  const sel=SELMODE && SELECTED.has(key);
  return `<div class="icard ${late?'late':''} ${SELMODE?'selectable':''} ${sel?'sel':''}" ${SELMODE?`onclick="toggleSel('${kind}','${id}')"`:''}>
    <div class="prio-row">
      ${SELMODE?`<span class="selbox">${sel?ic('check'):''}</span>`:''}
      ${plbl?`<span class="prio" style="color:${pc}"><span class="d" style="background:${pc}"></span>${esc(plbl)}</span>`:'<span></span>'}
      ${tbadge}
    </div>
    <div class="titolo">${esc(titolo)}</div>
    <div class="dove">
      <div class="lbl">Dove intervenire</div>
      <div class="via">${esc(via||'—')}</div>
      ${x.appartamento && x.appartamento!==via?`<div class="apt">${esc(x.appartamento)}</div>`:''}
    </div>
    ${dataLbl?`<div class="meta ${late?'overdue':''}">${ic('calendar')}${late?`In ritardo di ${ritardo} giorn${ritardo===1?'o':'i'} · `:''}${esc(dataLbl)}</div>`:''}
    ${x.stato?`<div class="meta">${ic('info')}Stato: <b>${esc(x.stato)}</b></div>`:''}
    ${istr?`<div class="istr"><span class="lbl">${ic('info')}Istruzioni operatore</span>${esc(istr)}</div>`:''}
    ${(x.note_operatore||'').trim()?`<div class="mynote"><span class="lbl">${ic('info')}Le tue note</span>${esc(x.note_operatore.trim())}</div>`:''}
    ${SELMODE?'':`<div class="actions">
      <button class="btn ok ${conf?'done':''}" ${conf?'disabled':''} onclick="conferma('${kind}','${id}')">
        ${ic('check')}${conf?'Confermato':'Confermo fatto'}</button>
      <button class="btn foto" onclick="pickFoto('${kind}','${id}')">${ic('camera')}Foto/Video</button>
      ${wa?`<a class="btn wa" href="${wa}" target="_blank" rel="noopener">${ic('message')}WhatsApp</a>`:''}
    </div>
    ${NOTE_OPEN===key
      ? `<div class="notebox"><textarea id="nota-${id}" rows="2" placeholder="Scrivi una nota per l'ufficio, es. in attesa della lavanderia"></textarea>
          <div class="noteact"><button class="btn ok" onclick="sendNota('${kind}','${id}')">${ic('check')}Invia nota</button>
          <button class="btn foto" onclick="closeNota()">Annulla</button></div></div>`
      : `<button class="notebtn" onclick="openNota('${key}')">${ic('info')}Aggiungi nota per l'ufficio</button>`}`}
  </div>`;
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
    .then(r=>r.json()).then(j=>{ if(!j.ok) throw 0; })
    .catch(()=>{ p.it.confermato_manutentore=false; render(); toast('Conferma non riuscita, riprova.'); });
}
function undoConferma(){
  if(!PENDING) return;
  const p=PENDING; PENDING=null; clearInterval(p.iv);
  p.it.confermato_manutentore=false; render();
  const t=document.getElementById('toast'); t.classList.remove('show','undo');
  toast('Annullato');
}

/* Nota operatore ↔ ufficio */
function openNota(key){ NOTE_OPEN=key; render();
  const id=key.split(':')[1]; const t=document.getElementById('nota-'+id); if(t) t.focus(); }
function closeNota(){ NOTE_OPEN=null; render(); }
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
  toast(files.length>1?`Carico ${files.length} file…`:'Carico il file…');
  let ok=0;
  for(const f of files){
    const fd=new FormData(); fd.append('issue_id',FOTO_ID); fd.append('kind',FOTO_KIND||'issue'); fd.append('file',f);
    try{ const r=await fetch(`${API}/foto`,{method:'POST',body:fd}); const j=await r.json(); if(j.ok) ok++; }catch(_){}
  }
  toast(ok===files.length?(ok>1?`${ok} file caricati`:'File caricato'):`${ok}/${files.length} caricati`);
}

function toast(msg){ const t=document.getElementById('toast');
  t.innerHTML=ICN.check?`<svg class="ic" viewBox="0 0 24 24">${ICN.check}</svg>`+esc(msg):esc(msg);
  t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2600); }

load();
