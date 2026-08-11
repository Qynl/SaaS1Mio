const demo=[
 {company:'Northstar Systems',contact:'Maya Chen',value:24000,days:38,stage:'Proposal',score:94,reason:'High value + proposal stage + recent prior engagement',action:'Reopen proposal'},
 {company:'Atlas Advisory',contact:'Jon Bell',value:12000,days:51,stage:'Negotiation',score:88,reason:'Negotiation reached + known timing objection',action:'Check timing'},
 {company:'Lumen Works',contact:'Sara Klein',value:8500,days:29,stage:'Qualified',score:81,reason:'Strong engagement + short inactivity window',action:'Resume conversation'},
 {company:'Cobalt Studio',contact:'Alex Ruiz',value:18000,days:76,stage:'Proposal',score:77,reason:'Large deal + proposal context despite inactivity',action:'Refresh proposal'},
 {company:'Ridge Labs',contact:'Nina Patel',value:6200,days:44,stage:'Discovery',score:69,reason:'Repeated engagement + clear use case',action:'Ask for next step'},
 {company:'Oakline Group',contact:'Leo Martin',value:31000,days:91,stage:'Negotiation',score:73,reason:'Very high value + late-stage history',action:'Review blocker'},
 {company:'Blueframe',contact:'Emma Fox',value:4200,days:22,stage:'Qualified',score:64,reason:'Recent activity + good fit',action:'Send recap'},
 {company:'Vertex North',contact:'Owen Reed',value:9500,days:63,stage:'Proposal',score:71,reason:'Proposal viewed + previous reply',action:'Reopen thread'}
];
let opportunities=JSON.parse(localStorage.getItem('reclaim_demo')||'null')||demo;
const euro=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
function scoreClass(s){return s>=75?'score high':'score'}
function render(){
 const sorted=[...opportunities].sort((a,b)=>b.score-a.score);
 const total=sorted.reduce((x,o)=>x+o.value*(o.score/100)*.32,0);
 document.querySelector('#recoverable').textContent=euro(total);
 document.querySelector('#dormant').textContent=opportunities.length;
 document.querySelector('#priority').textContent=opportunities.filter(o=>o.score>=75).length;
 document.querySelector('#recovered').textContent=euro(Math.min(total*.17,31400));
 document.querySelector('#topRows').innerHTML=sorted.slice(0,5).map(o=>`<tr><td><span class="company">${esc(o.company)}</span><span class="sub">${esc(o.contact)} · ${esc(o.stage)}</span></td><td>${euro(o.value)}</td><td><span class="${scoreClass(o.score)}">${o.score}</span></td><td>${esc(o.reason)}</td><td><span class="statuspill">Ready</span></td></tr>`).join('');
 renderQueue();
}
function renderQueue(){
 const q=document.querySelector('#queueRows');if(!q)return;
 const term=(document.querySelector('#search')?.value||'').toLowerCase();const min=Number(document.querySelector('#minScore')?.value||0);
 const rows=opportunities.filter(o=>(o.company+' '+o.contact).toLowerCase().includes(term)&&o.score>=min).sort((a,b)=>b.score-a.score);
 document.querySelector('#queueCount').textContent=`${rows.length} opportunities`;
 q.innerHTML=rows.map(o=>`<tr><td><span class="company">${esc(o.company)}</span><span class="sub">${esc(o.contact)}</span></td><td>${euro(o.value)}</td><td>${o.days}d</td><td><span class="${scoreClass(o.score)}">${o.score}</span></td><td>${esc(o.reason)}</td><td><button class="tab action" data-company="${esc(o.company)}">${esc(o.action)} →</button></td></tr>`).join('');
 q.querySelectorAll('.action').forEach(b=>b.onclick=()=>toast(`Action prepared for ${b.dataset.company}. No message was sent.`));
}
function esc(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function toast(msg){const t=document.querySelector('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.querySelector('#'+b.dataset.view).classList.add('active');window.scrollTo({top:0,behavior:'smooth'});renderQueue();}));
document.querySelector('#search')?.addEventListener('input',renderQueue);document.querySelector('#minScore')?.addEventListener('change',renderQueue);
document.querySelector('#seedBtn')?.addEventListener('click',()=>{opportunities=demo.map(x=>({...x}));localStorage.setItem('reclaim_demo',JSON.stringify(opportunities));render();toast('Demo recovery dataset refreshed.');});
['aLeads','aDeal','aRate','aClose'].forEach(id=>document.querySelector('#'+id)?.addEventListener('input',calcAudit));
function calcAudit(){const l=Number(aLeads.value)||0,d=Number(aDeal.value)||0,r=(Number(aRate.value)||0)/100,c=(Number(aClose.value)||0)/100;document.querySelector('#auditValue').textContent=euro(l*d*r*c)}
document.querySelector('#downloadSample')?.addEventListener('click',()=>{const csv='company,contact,email,deal_value,stage,last_activity_at,objection\nNorthstar Systems,Maya Chen,maya@example.com,24000,Proposal,2026-07-01,timing\nAtlas Advisory,Jon Bell,jon@example.com,12000,Negotiation,2026-06-18,budget';const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='reclaim-sample.csv';a.click();});
document.querySelector('#csv')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{const lines=String(r.result).trim().split(/\r?\n/);const rows=Math.max(0,lines.length-1);document.querySelector('#importResult').style.display='block';document.querySelector('#importText').textContent=`${rows} data rows detected. Demo mode only: no server upload occurred and no messages were sent.`;toast(`${rows} CSV rows detected.`)};r.readAsText(f)});
render();calcAudit();