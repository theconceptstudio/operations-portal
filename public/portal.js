const TOKEN = document.body.dataset.token;
const API = `/api/o/${TOKEN}`;
const DOW = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'];
let OGGI = new Date().toISOString().slice(0,10);

function esc(s){ return (s||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function dmy(s){ if(!s) return ''; const p=s.split('-'); return `${p[2]}/${p[1]}`; }
function dow(s){ if(!s) return ''; const d=new Date(s+'T00:00:00'); return DOW[d.getDay()]; }
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2200); }

async function load(){
  let d;
  try{ d=await fetch(`${API}/data`).then(r=>r.json()); }
  catch(e){ document.getElementById('app').innerHTML='<div class="empty">Errore di connessione. Riprova.</div>'; return; }
  if(d.error){ document.getElementById('app').innerHTML='<div class="empty">Link non valido.</div>'; return; }
  OGGI=d.oggi||OGGI;
  render(d);
}

function pulCard(p){
  const cls=p.tipo==='Proprietario'?'owner':(p.tipo==='Intermedia'?'mid':'');
  const done=p.stato==='Completata';
  const svc=[p.late_checkout?'Late checkout':'', p.deposito&&p.deposito!=='Nessuno'?'Deposito':''].filter(Boolean).join(' · ');
  return `<div class="card ${cls} ${done?'done':''}">
    <div class="row1">
      <div><div class="cap">${esc(p.appartamento)}</div>
        <div class="sub">${dow(p.data)} ${dmy(p.data)}${svc?' · '+esc(svc):''}${p.tipo&&p.tipo!=='Standard'?' · '+esc(p.tipo):''}</div></div>
      <span class="pill day">${dmy(p.data)}</span>
    </div></div>`;
}

function issueCard(i){
  const overdue = i.data_intervento && i.data_intervento < OGGI && !i.confermato_manutentore;
  const conf = i.confermato_manutentore;
  const vh = (i.priorita==='Very High'||i.priorita==='High');
  let pill = conf ? '<span class="pill ok">✓ Confermato</span>'
           : overdue ? '<span class="pill red">In ritardo</span>'
           : (i.priorita?`<span class="pill prio ${vh?'vh':''}">${esc(i.priorita)}</span>`:'');
  let acts = conf ? '' : `<div class="acts">
      <button class="btn go" onclick="conferma('${i.notion_id}',this)">✓ Confermo fatto</button>
      <button class="btn gh" onclick="pickFoto('${i.notion_id}')">📷 Foto</button>
    </div>`;
  return `<div class="card ${overdue?'late':''} ${conf?'done':''}">
    <div class="row1">
      <div><div class="cap">${esc(i.descrizione||'Intervento')}</div>
        <div class="sub">${esc(i.appartamento)}${i.data_intervento?' · '+dow(i.data_intervento)+' '+dmy(i.data_intervento):''}${i.stato?' · '+esc(i.stato):''}</div></div>
      ${pill}
    </div>${acts}</div>`;
}

function render(d){
  const fut=[], pas=[];
  (d.pulizie||[]).forEach(p=>{ (p.data>=OGGI?fut:pas).push(p); });
  const issues=(d.issues||[]);
  const openIss=issues.filter(i=>!i.confermato_manutentore);
  const confIss=issues.filter(i=>i.confermato_manutentore);
  let h='';
  // Interventi (priorità: scaduti in alto)
  openIss.sort((a,b)=>{
    const ao=(a.data_intervento&&a.data_intervento<OGGI)?0:1, bo=(b.data_intervento&&b.data_intervento<OGGI)?0:1;
    if(ao!==bo) return ao-bo;
    return (a.data_intervento||'9999')<(b.data_intervento||'9999')?-1:1;
  });
  h+=`<div class="sec"><div class="sec-h"><span class="t">I miei interventi</span><span class="n">${openIss.length} aperti</span></div>`;
  h+= openIss.length?openIss.map(issueCard).join(''):'<div class="empty">Nessun intervento aperto 👍</div>';
  if(confIss.length) h+=confIss.slice(0,5).map(issueCard).join('');
  h+='</div>';
  // Pulizie prossime
  h+=`<div class="sec"><div class="sec-h"><span class="t">Le mie pulizie</span><span class="n">${fut.length} in arrivo</span></div>`;
  h+= fut.length?fut.slice(0,30).map(pulCard).join(''):'<div class="empty">Nessuna pulizia assegnata.</div>';
  h+='</div>';
  document.getElementById('app').innerHTML=h;
}

async function conferma(issueId, btn){
  btn.disabled=true; btn.textContent='…';
  try{
    const r=await fetch(`${API}/conferma`,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({issue_id:issueId})}).then(r=>r.json());
    if(!r.ok) throw 0;
    toast('Confermato ✓'); load();
  }catch(e){ btn.disabled=false; btn.textContent='✓ Confermo fatto'; toast('Errore, riprova'); }
}

let _fotoIssue=null;
function pickFoto(issueId){ _fotoIssue=issueId; document.getElementById('fileinput').click(); }
async function uploadFoto(input){
  const f=input.files[0]; if(!f||!_fotoIssue) return;
  toast('Carico foto…');
  const fd=new FormData(); fd.append('issue_id',_fotoIssue); fd.append('file',f);
  try{
    const r=await fetch(`${API}/foto`,{method:'POST',body:fd}).then(r=>r.json());
    toast(r.ok?'Foto caricata ✓':'Errore foto');
  }catch(e){ toast('Errore foto'); }
  input.value='';
}

// input file nascosto (apre fotocamera/galleria)
const fi=document.createElement('input');
fi.type='file'; fi.accept='image/*'; fi.capture='environment'; fi.id='fileinput';
fi.onchange=()=>uploadFoto(fi); document.body.appendChild(fi);

load();
setInterval(load, 60000); // refresh live ogni minuto
