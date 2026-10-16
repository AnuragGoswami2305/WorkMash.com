/* WorkMash – single-file app. Works by double-clicking index.html. */
(function(){
'use strict';
/* ===== CONFIG: fill these in (anon/publishable key ONLY, never service-role) ===== */
// Fill in from Supabase > Project Settings > API. Use the anon/publishable key ONLY. Never put a service-role key here.
const CONFIG = { SUPABASE_URL: 'https://gdabjogydtclgajasadi.supabase.co', SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkYWJqb2d5ZHRjbGdhamFzYWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNDM1NTYsImV4cCI6MjEwNzcxOTU1Nn0.U7Ve-k9LqEF6CK_IVPAgZ7mYlmd4rcNm3HlJ4OwUxNc', SUPPORT_EMAIL: '' };
/* ===== PHOTOS: put files in the images/ folder named <slug>.png  (e.g. images/laundry.png).
   Different file for one service? add it in custom, e.g. custom:{'laundry':'my-laundry.jpg'}.  enabled:false = icons only. ===== */
const IMG={enabled:true,dir:'images/',ext:'png',custom:{}};
const imgSrc=slug=>IMG.dir+(IMG.custom[slug]||slug+'.'+IMG.ext);
const VOICE_LANG='en-IN'; // voice search language (use 'hi-IN' for Hindi)
/* ===== DEMO DATA ===== */
const AREAS=[['110017','Saket & Malviya Nagar'],['110016','Hauz Khas'],['110001','Connaught Place']].map(([pin,locality])=>({pin,locality}));
const CATS=[['cleaning','Home help & cleaning'],['electrical','Electrical'],['plumbing','Plumbing'],['painting','Painting'],['carpentry','Carpentry'],['repairs','Repairs'],['labour','Labour']].map(([slug,name])=>({slug,name}));
const S=(cat,slug,name,price,description,requirements)=>({cat,slug,name,pricing_type:price?'fixed':'quote',price_inr:price||null,description,requirements});
const HELP=[['hourly-booking','Hourly bookings',199],['bathroom-cleaning','Bathroom Cleaning',299],['fridge-cleaning','Fridge Cleaning',349],['packing-unpacking','Packing or Unpacking',0],['utensils','Utensils',149],['kitchen-prep','Kitchen Prep',199],['dusting-wiping','Dusting & Wiping',149],['sweeping-mopping','Sweeping & Mopping',149],['pre-party-clean','Pre-Party Express Clean',0],['wardrobe-cleaning','Complete Wardrobe Cleaning',399],['after-party-clean','After-Party Express Clean',0],['ironing-folding','Ironing & Folding',199],['window-cleaning','Window Cleaning',249],['laundry','Laundry',199],['kitchen-cleaning','Kitchen Cleaning',499],['balcony-cleaning','Balcony Cleaning',299],['fan-cleaning','Fan Cleaning',99],['cabinet-cleaning','Kitchen Cabinet Cleaning',449],['plant-care','Plant Care',199],['car-cleaning','Car Surface Cleaning',299]];
const DEMO_SERVICES=[...HELP.map(([s,n,p])=>S('cleaning',s,n,p,n+' at your home.','Describe the work and any items to be handled.')),
S('cleaning','deep-cleaning','Home deep cleaning',0,'Top-to-bottom cleaning of your home.','Tell us rooms and approximate size.'),
S('cleaning','sofa-cleaning','Sofa cleaning',699,'Dry or wet cleaning for a sofa set.','Up to a 5-seater set.'),
S('electrical','fan-installation','Ceiling fan installation',399,'Fit a ceiling fan you already own.','Fan and regulator provided by you.'),
S('electrical','wiring-repair','Wiring & switch repair',0,'Diagnose and fix faulty switches, sockets or wiring.','Describe the fault; a partner sends an estimate.'),
S('plumbing','tap-leak-repair','Tap & leak repair',299,'Repair a dripping tap or minor pipe leak.','Spare parts billed separately if needed.'),
S('plumbing','bathroom-fitting','Bathroom fitting',0,'Install or replace bathroom fixtures.','Estimate depends on fixtures and access.'),
S('painting','room-painting','Room painting',0,'Interior painting for one or more rooms.','Room sizes and paint preference.'),
S('carpentry','furniture-repair','Furniture repair',0,'Fix doors, hinges, drawers and joints.','Describe the item and damage.'),
S('repairs','door-lock-fix','Door lock repair',349,'Repair or replace a faulty door lock.','New lock cost, if any, is extra.'),
S('labour','helper-half-day','General helper (half day)',599,'Help with lifting, shifting or tidy-up work.','About four hours on site.')];
/* ===== ICONS (own line-art, 48x48) ===== */
const ICONS={home:'<path d="M6 22 24 7l18 15M12 20v20h24V20"/>',
'hourly-booking':'<circle cx="24" cy="24" r="16"/><path d="M24 14v10l7 4"/>',
'bathroom-cleaning':'<path d="M8 24h32v4a8 8 0 0 1-8 8H16a8 8 0 0 1-8-8zM12 24V12a4 4 0 0 1 8 0M14 40l2-4M34 40l-2-4"/>',
'fridge-cleaning':'<rect x="12" y="6" width="24" height="36" rx="3"/><path d="M12 20h24M17 12v4M17 26v8"/>',
'packing-unpacking':'<path d="M8 16 24 8l16 8v18L24 42 8 34zM8 16l16 8 16-8M24 24v18"/>',
utensils:'<path d="M16 6v14a4 4 0 0 0 4 4v18M12 6v10M20 6v10M34 42V6c-5 3-6 9-6 16h6"/>',
'kitchen-prep':'<path d="M14 30V22a7 7 0 1 1 4-12 7 7 0 0 1 12 0 7 7 0 1 1 4 12v8zM14 36h20v4H14z"/>',
'dusting-wiping':'<path d="M24 6v16M18 22h12l-2 10H20zM16 32l-2 10M24 32v10M32 32l2 10"/>',
'sweeping-mopping':'<path d="M32 6 20 28M10 34h22l4 8H6z"/>',
'pre-party-clean':'<path d="M24 6l4 12 12 4-12 4-4 12-4-12-12-4 12-4z"/>',
'after-party-clean':'<path d="M12 8h24l-4 16H16zM24 24v14M16 40h16"/>',
'wardrobe-cleaning':'<rect x="10" y="6" width="28" height="36" rx="2"/><path d="M24 6v36M20 24v4M28 24v4"/>',
'ironing-folding':'<path d="M8 32h32c0-10-6-16-14-16H14a6 6 0 0 0-6 6zM8 38h32M18 24h8"/>',
'window-cleaning':'<rect x="8" y="8" width="32" height="32" rx="2"/><path d="M24 8v32M8 24h32"/>',
laundry:'<rect x="10" y="6" width="28" height="36" rx="3"/><circle cx="24" cy="27" r="9"/><path d="M16 12h4"/>',
'kitchen-cleaning':'<path d="M10 20h28v16a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4zM6 20h36M18 12c0-3 3-3 3-6M28 12c0-3 3-3 3-6"/>',
'balcony-cleaning':'<path d="M6 18h36M6 40h36M10 18v22M18 18v22M26 18v22M34 18v22M42 18v22"/>',
'fan-cleaning':'<circle cx="24" cy="24" r="3"/><path d="M24 21c-2-8-2-12 3-13 5 1 3 7-3 13zM27 24c8-2 12-2 13 3-1 5-7 3-13-3zM24 27c2 8 2 12-3 13-5-1-3-7 3-13zM21 24c-8 2-12 2-13-3 1-5 7-3 13 3z"/>',
'cabinet-cleaning':'<rect x="8" y="8" width="32" height="32" rx="2"/><path d="M24 8v32M20 22v4M28 22v4M8 24h32"/>',
'plant-care':'<path d="M16 28h16l-2 14H18zM24 28V16M24 20c-8 0-10-6-10-10 8 0 10 4 10 10zM24 22c6 0 10-4 10-8-7 0-10 3-10 8z"/>',
'car-cleaning':'<path d="M8 30l4-10h24l4 10v8H8zM8 30h32M14 38v4M34 38v4"/>',
cleaning:'<path d="M24 6l4 12 12 4-12 4-4 12-4-12-12-4 12-4z"/>',
electrical:'<path d="M26 4 12 26h10l-2 18 16-24H26z"/>',
plumbing:'<path d="M24 6c8 10 12 16 12 22a12 12 0 0 1-24 0c0-6 4-12 12-22z"/>',
painting:'<rect x="8" y="8" width="28" height="10" rx="2"/><path d="M36 13h4v10H24v8M22 31h4v10h-4z"/>',
carpentry:'<path d="M14 10h18v8H14zM28 18l-2 26M8 14h6"/>',
repairs:'<path d="M34 8a8 8 0 0 0-8 10L8 36l4 4 18-18a8 8 0 0 0 10-8l-5 5-4-1-1-4z"/>',
labour:'<circle cx="24" cy="12" r="5"/><path d="M14 42V28a10 10 0 0 1 20 0v14M14 32h20"/>'};
const hue=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))%360,7);
const ico=(slug,cat,big)=>`<div class="tp${big?' big':''}" style="--h:${hue(slug)}"><svg class="ic" viewBox="0 0 48 48" aria-hidden="true">${ICONS[slug]||ICONS[cat]||ICONS.home}</svg>${IMG.enabled?`<img src="${imgSrc(slug)}" alt="" loading="lazy" onload="this.parentNode.classList.add('has')" onerror="this.remove()">`:''}</div>`;
/* ===== API ===== */
const api=(()=>{
const live=!/YOUR_/.test(CONFIG.SUPABASE_URL+CONFIG.SUPABASE_ANON_KEY)&&!!CONFIG.SUPABASE_URL;
let sb,user=null;const K='wm_demo_bookings';
const demo=()=>JSON.parse(localStorage.getItem(K)||'[]');
const unwrap=({data,error})=>{if(error)throw new Error(error.message);return data};
async function init(){
 if(!live)return;
  sb=window.supabase.createClient(CONFIG.SUPABASE_URL,CONFIG.SUPABASE_ANON_KEY,{auth:{flowType:'pkce'}});
 user=(await sb.auth.getSession()).data.session?.user||null;
 sb.auth.onAuthStateChange((_e,s)=>{user=s?.user||null;prof=null});
}
const getUser=()=>user;
const categories=async()=>live?unwrap(await sb.from('service_categories').select('slug,name,icon').order('name')):CATS;
const areas=async()=>live?unwrap(await sb.from('service_areas').select('pin,locality').eq('active',true)):AREAS;
const norm=r=>({...r,cat:r.service_categories?.slug||r.cat});
const SEL='slug,name,description,pricing_type,price_inr,requirements,service_categories(slug)';
const services=async()=>live?unwrap(await sb.from('services').select(SEL).eq('active',true).order('name')).map(norm):DEMO_SERVICES;
const service=async slug=>(await services()).find(s=>s.slug===slug);
const signUp=async(email,password,name)=>unwrap(await sb.auth.signUp({email,password,options:{data:{full_name:name}}}));
const signIn=async(email,password)=>unwrap(await sb.auth.signInWithPassword({email,password}));
const signOut=()=>sb.auth.signOut();
const BSEL='id,status,pin,address,description,scheduled_at,pricing_type,price_snapshot,estimate_amount,created_at,services(name,slug)';
async function createBooking(b){
 if(!live){const s=await service(b.slug),id='demo-'+Date.now(),now=new Date().toISOString();
  const row={id,status:'demo_saved',pin:b.pin,address:b.address,description:b.description,scheduled_at:b.when,pricing_type:s.pricing_type,price_snapshot:s.price_inr,created_at:now,services:{name:s.name,slug:s.slug},events:[{status:'demo_saved',note:'Saved in this browser only. No partner was contacted.',created_at:now}]};
  localStorage.setItem(K,JSON.stringify([row,...demo()]));return id}
 return unwrap(await sb.rpc('create_booking',{p_service_slug:b.slug,p_pin:b.pin,p_address:b.address,p_description:b.description,p_scheduled_at:b.when}));
}
const bookings=async()=>live?unwrap(await sb.from('bookings').select(BSEL).order('created_at',{ascending:false})):demo();
async function booking(id){
 if(!live)return demo().find(b=>b.id===id);
 const b=unwrap(await sb.from('bookings').select(BSEL+',reviews(rating,comment)').eq('id',id).maybeSingle());if(!b)return b;
 b.events=unwrap(await sb.from('booking_events').select('status,note,created_at').eq('booking_id',id).order('created_at'));return b;
}
async function act(kind,id,args={}){
 if(!live){const l=demo(),b=l.find(x=>x.id===id);if(kind==='cancel'&&b){b.status='cancelled';b.events.push({status:'cancelled',note:'Cancelled by you.',created_at:new Date().toISOString()});localStorage.setItem(K,JSON.stringify(l))}return}
 const fn={cancel:['cancel_booking',{p_booking:id}],estimate:['respond_estimate',{p_booking:id,p_approve:args.approve}],retry:['retry_assignment',{p_booking:id}],review:['submit_review',{p_booking:id,p_rating:args.rating,p_comment:args.comment}]}[kind];
 unwrap(await sb.rpc(fn[0],fn[1]));
}

let prof=null;
async function getProfile(force){if(!live||!user)return null;if(prof&&!force)return prof;prof=unwrap(await sb.from('profiles').select('full_name,phone,address,pin').eq('id',user.id).maybeSingle())||{};return prof}
async function saveProfile(p){unwrap(await sb.from('profiles').upsert({id:user.id,...p}));prof=null}
async function signInGoogle(){unwrap(await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}}))}
return {get live(){return live},init,getUser,getProfile,saveProfile,signInGoogle,categories,areas,services,service,signUp,signIn,signOut,createBooking,bookings,booking,act};
})();
/* ===== APP ===== */
const $=s=>document.querySelector(s),app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr=n=>'₹'+Number(n).toLocaleString('en-IN');
const ST={searching:'Finding a partner',confirmed:'Confirmed by partner',estimate_sent:'Estimate awaiting your approval',estimate_approved:'Estimate approved',in_progress:'In progress',completed:'Completed',cancelled:'Cancelled',no_partner_available:'No partner available',demo_saved:'Demo request (not sent to anyone)'};
const price=b=>b.pricing_type==='fixed'?`Fixed price: ${inr(b.price_snapshot??b.price_inr)}`:b.estimate_amount?`Estimate: ${inr(b.estimate_amount)}`:'Quotation: a partner will send an estimate';
const go=h=>{location.hash=h};let timer;
const err=e=>`<p class="err" role="alert">${esc(e.message||e)}</p>`;
async function pinSelect(id='pin'){const a=await api.areas(),p=localStorage.wm_pin||'';
 return `<select id="${id}" name="pin" required aria-label="Locality / PIN code"><option value="">Select locality / PIN</option>${a.map(x=>`<option value="${x.pin}" ${x.pin===p?'selected':''}>${esc(x.locality)} – ${x.pin}</option>`).join('')}</select>`}
function needLogin(){if(api.live&&!api.getUser()){sessionStorage.wm_ret=location.hash;go('#/login');return true}}
const card=s=>`<a class="tile" href="#/service/${s.slug}">${ico(s.slug,s.cat)}<div class="tn">${esc(s.name)}</div><div class="tpr">${s.pricing_type==='fixed'?inr(s.price_inr):'Get a quote'}</div></a>`;
const uname=u=>{const m=u.user_metadata||{};return m.full_name||m.name||(u.email||'').split('@')[0]};
const avatar=(u,s=36,n)=>{const m=u.user_metadata||{},src=m.avatar_url||m.picture;return `<span class="av" style="--s:${s}px">${src?`<img src="${esc(src)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">`:''}<b>${esc((n||uname(u)).trim().charAt(0).toUpperCase())}</b></span>`};
const pinCache={};
async function lookupPin(pin){if(pinCache[pin])return pinCache[pin];const sv=(await api.areas().catch(()=>[])).find(x=>x.pin===pin);let det='';
 try{const c=new AbortController();setTimeout(()=>c.abort(),6000);const j=(await(await fetch('https://api.postalpincode.in/pincode/'+pin,{signal:c.signal})).json())[0];if(j.Status==='Success'){const o=j.PostOffice[0];det=o.Name+', '+o.District}}catch(e){}
 const r={pin,locality:sv?sv.locality:(det||'PIN '+pin),detected:det||(sv&&sv.locality)||'',found:!!det,serviceable:!!sv};if(det||sv)pinCache[pin]=r;return r}
function wirePin(sel){const i=$(sel),o=$('#pinInfo');const run=async()=>{const v=i.value=i.value.replace(/\D/g,'');if(v.length<6){o.textContent='';return}o.textContent='Detecting area…';const r=await lookupPin(v);if(i.value!==v)return;
 o.innerHTML=r.found||r.serviceable?`<strong>${esc(r.detected)}</strong> · ${r.serviceable?'<span class="ok">We serve this area</span>':'Service has not started here yet'}`:'Could not find this PIN code.'};i.addEventListener('input',run);if(i.value.length===6)run()}
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function searchBox(sel,o={}){const h=$(sel);
 h.innerHTML=`<form class="sb2" role="search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input type="search" autocomplete="off" placeholder="Search for a service" aria-label="Search services" value="${esc(o.value||'')}"><button type="button" class="x" aria-label="Clear search" hidden>×</button><button type="button" class="mic" aria-label="Search by voice" ${SR?'':'hidden'}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button></form><ul class="sg" role="listbox" hidden></ul>`;
 const f=h.querySelector('form'),i=h.querySelector('input'),x=h.querySelector('.x'),mic=h.querySelector('.mic'),ul=h.querySelector('.sg');let all=[],rec;
 if(o.suggest!==false)api.services().then(s=>all=s).catch(()=>{});
 const upd=()=>{const t=i.value.trim().toLowerCase();x.hidden=!t;o.onInput&&o.onInput(i.value);if(o.suggest===false||!t){ul.hidden=true;return}
  const r=all.filter(s=>(s.name+' '+s.description).toLowerCase().includes(t)).slice(0,6);
  ul.innerHTML=r.map(s=>`<li role="option"><a href="#/service/${s.slug}">${ico(s.slug,s.cat)}<span>${esc(s.name)}</span><em>${s.pricing_type==='fixed'?inr(s.price_inr):'Quote'}</em></a></li>`).join('')+`<li><a class="all" href="#/services?q=${encodeURIComponent(t)}">See all results for “${esc(i.value.trim())}”</a></li>`;ul.hidden=false};
 i.oninput=upd;i.onfocus=()=>{if(i.value.trim())upd()};f.onsubmit=e=>{e.preventDefault();ul.hidden=true;o.onGo&&o.onGo(i.value)};x.onclick=()=>{i.value='';upd();i.focus()};if(i.value)x.hidden=false;
 mic.onclick=()=>{if(rec)return rec.stop();rec=new SR();rec.lang=VOICE_LANG;rec.interimResults=false;
  rec.onstart=()=>{mic.classList.add('on');i.placeholder='Listening…'};rec.onresult=e=>{i.value=e.results[0][0].transcript.replace(/[.।]$/,'');upd()};
  rec.onerror=e=>{i.placeholder=e.error==='not-allowed'?'Microphone blocked – type instead':'Could not hear you, try again'};
  rec.onend=()=>{mic.classList.remove('on');if(i.placeholder==='Listening…')i.placeholder='Search for a service';rec=null};rec.start()}}
const io=window.IntersectionObserver?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -6% 0px'}):null;
function reveal(){if(io)document.querySelectorAll('#app .tile,#app .card,#app .sh,#app .hero>*').forEach((el,i)=>{el.classList.add('rv');el.style.setProperty('--i',i%8);io.observe(el)})}
async function afterLogin(){navAuth();const pf=(await api.getProfile(true).catch(()=>null))||{},r=sessionStorage.wm_ret;sessionStorage.removeItem('wm_ret');
 if(!pf.phone||!pf.address){if(r)sessionStorage.wm_ret=r;go('#/profile')}else go(r||'#/bookings')}
const pages={
async home(){const [c,all]=await Promise.all([api.categories(),api.services()]);
 const help=all.filter(s=>s.cat==='cleaning'),oth=c.filter(x=>x.slug!=='cleaning');
 app.innerHTML=`<div class="herob"><div class="orbs"><div class="orb o1"></div><div class="orb o2"></div></div><div class="wrap"><section class="hero"><h1>Reliable help for every <span class="gt">household task.</span></h1><p>Request cleaning, house help, repairs and installation from partners serving your locality.</p><div class="sbw" id="hs"></div></section></div></div>
 <div class="wrap"><section><div class="sh"><h2>Home help &amp; cleaning</h2><a href="#/services?cat=cleaning">See all</a></div><div class="tiles">${help.map(card).join('')}</div></section>
 <section><div class="sh"><h2>Repairs &amp; installation</h2></div><div class="tiles">${oth.map(x=>`<a class="tile" href="#/services?cat=${x.slug}">${ico(x.slug,x.slug)}<div class="tn">${esc(x.name)}</div></a>`).join('')}</div></section></div>
 <div class="band"><div class="wrap"><section><h2>How it works</h2><div class="grid steps"><div class="card"><h3>Request</h3><p>Pick a service and tell us where and when you need help.</p></div><div class="card"><h3>Partner accepts</h3><p>Your request goes to one available partner at a time. It is confirmed only after a partner accepts.</p></div><div class="card"><h3>Job completed</h3><p>Track status in My Bookings and review once the job is done.</p></div></div></section></div></div>
 <div class="wrap"><section><h2>Trust &amp; safety</h2><div class="grid"><div class="card"><h3>Approved partners only</h3><p>Requests are offered only to partner accounts approved in our system.</p></div><div class="card"><h3>Clear pricing</h3><p>Fixed prices show before you book. Quotes need your approval before work starts.</p></div><div class="card"><h3>Your address</h3><p>Used only to fulfil your own booking requests.</p></div><div class="card"><h3>No online payment</h3><p>This version does not collect payments.</p></div></div></section></div>`;
 searchBox('#hs',{onGo:q=>go('#/services?q='+encodeURIComponent(q.trim()))})},
async services(p){const [c,all]=await Promise.all([api.categories(),api.services()]);let cat=p.get('cat')||'',q=p.get('q')||'';
 app.innerHTML=`<div class="wrap pad"><h1>All services</h1><div class="sbw" id="ss"></div><div class="chips" id="ch"></div><div class="tiles" id="sg" aria-live="polite"></div></div>`;
 const draw=()=>{const t=q.toLowerCase(),r=all.filter(s=>(!cat||s.cat===cat)&&(s.name+s.description).toLowerCase().includes(t));
  $('#ch').innerHTML=[['','All'],...c.map(x=>[x.slug,x.name])].map(([v,n])=>`<button type="button" class="chip" data-c="${v}" aria-pressed="${v===cat}">${esc(n)}</button>`).join('');
  $('#ch').querySelectorAll('button').forEach(b=>b.onclick=()=>{cat=b.dataset.c;draw()});
  $('#sg').innerHTML=r.map(card).join('')||'<p class="muted">No services match your search.</p>'};
 searchBox('#ss',{value:q,suggest:false,onInput:v=>{q=v;draw()},onGo:v=>{q=v;draw()}});draw()},
async service(slug){const s=await api.service(slug);if(!s)return app.innerHTML='<div class="wrap pad"><h1>Service not found</h1><a href="#/services">Browse services</a></div>';
 app.innerHTML=`<div class="wrap pad narrow"><a href="#/services">← All services</a><div style="margin-top:12px">${ico(s.slug,s.cat,1)}</div><h1>${esc(s.name)}</h1><p>${esc(s.description)}</p><p><span class="badge">${s.pricing_type==='fixed'?'Fixed price: '+inr(s.price_inr):'Quotation-based'}</span></p><h2>Booking requirements</h2><p>${esc(s.requirements)}</p><p class="muted">${s.pricing_type==='fixed'?'The price is saved with your booking and will not change later.':'A partner sends an estimate after accepting. Work starts only after you approve it.'}</p><a class="btn" href="#/book/${s.slug}">Request this service</a></div>`},
async book(slug){if(needLogin())return;const s=await api.service(slug);if(!s)return go('#/services');
 const pf=(await api.getProfile())||{};if(api.live&&!pf.phone){sessionStorage.wm_ret=location.hash;return go('#/profile')}
 app.innerHTML=`<div class="wrap pad"><form class="form" id="bf" novalidate><h1>Request: ${esc(s.name)}</h1><p><strong>${s.pricing_type==='fixed'?'Price: '+inr(s.price_inr)+' (fixed)':'Quotation-based: you will approve an estimate before work starts.'}</strong></p>
 <label for="pin">PIN code</label><input id="pin" inputmode="numeric" maxlength="6" required value="${esc(LOC?.pin||pf.pin||'')}"><p id="pinInfo" class="muted" role="status"></p>
 <label for="ad">Address</label><textarea id="ad" rows="2" required minlength="10">${esc(pf.address||'')}</textarea><label for="ds">Describe the work</label><textarea id="ds" rows="3" required minlength="10"></textarea><label for="wh">Preferred date &amp; time</label><input id="wh" type="datetime-local" required><div id="msg"></div><p><button class="btn" id="go">Submit request</button></p></form></div>`;
 wirePin('#pin');
 $('#bf').onsubmit=async e=>{e.preventDefault();const m=$('#msg'),b={slug,pin:$('#pin').value.trim(),address:$('#ad').value.trim(),description:$('#ds').value.trim(),when:$('#wh').value};
  if(!/^\d{6}$/.test(b.pin)||b.address.length<10||b.description.length<10||!b.when||new Date(b.when)<=new Date())return m.innerHTML=err('Enter a 6-digit PIN, an address and description (10+ characters) and a future date/time.');
  $('#go').disabled=true;m.textContent='Checking area…';
  try{const r=await lookupPin(b.pin);if(!r.serviceable){m.innerHTML=err(`We don't serve ${r.detected||'PIN '+b.pin} yet. Try another PIN.`);$('#go').disabled=false;return}
   m.textContent='Submitting…';b.when=new Date(b.when).toISOString();go('#/booking/'+await api.createBooking(b))}catch(x){m.innerHTML=err(x);$('#go').disabled=false}}},
async auth(mode){const su=mode==='signup';
 if(!api.live)return app.innerHTML='<div class="wrap pad narrow"><h1>Accounts unavailable in demo mode</h1><p>Login and signup need a configured Supabase project. See the README.</p></div>';
 app.innerHTML=`<div class="wrap pad"><form class="form" id="af"><h1>${su?'Create account':'Log in'}</h1><button type="button" class="btn gbtn full" id="gg"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>Continue with Google</button><p class="or">or use email</p>${su?'<label for="nm">Full name</label><input id="nm" required autocomplete="name">':''}<label for="em">Email</label><input id="em" type="email" required autocomplete="email"><label for="pw">Password</label><input id="pw" type="password" required minlength="8" autocomplete="${su?'new-password':'current-password'}"><div id="msg" aria-live="polite"></div><p><button class="btn">${su?'Sign up':'Log in'}</button></p><p><a href="#/${su?'login':'signup'}">${su?'Have an account? Log in':'New here? Create an account'}</a></p></form></div>`;
 $('#gg').onclick=async()=>{sessionStorage.wm_oauth='1';try{await api.signInGoogle()}catch(x){$('#msg').innerHTML=err(x)}};
 $('#af').onsubmit=async e=>{e.preventDefault();const m=$('#msg');m.textContent='Please wait…';
  try{if(su){const d=await api.signUp($('#em').value,$('#pw').value,$('#nm').value);if(!d.session)return m.innerHTML='<p class="ok">Account created. Check your email to confirm, then log in.</p>'}else await api.signIn($('#em').value,$('#pw').value);await afterLogin()}catch(x){m.innerHTML=err(x)}}},
async profile(){if(!api.live)return app.innerHTML='<div class="wrap pad narrow"><h1>Profile</h1><p>Profiles need a connected Supabase project.</p></div>';if(needLogin())return;
 const pf=(await api.getProfile(true))||{},u=api.getUser(),m=u.user_metadata||{};
 app.innerHTML=`<div class="wrap pad"><form class="form" id="pf"><div class="who">${avatar(u,64,pf.full_name)}<div><h1>Your profile</h1><p class="muted">${esc(u.email)}</p></div></div>${(!pf.phone||!pf.address)?'<p><span class="badge">Complete your details to book services</span></p>':''}
 <label for="fn">Full name</label><input id="fn" required autocomplete="name" value="${esc(pf.full_name||m.full_name||m.name||'')}">
 <label for="ph">Mobile number</label><input id="ph" inputmode="numeric" maxlength="10" placeholder="10-digit mobile number" autocomplete="tel-national" required value="${esc(pf.phone||'')}">
 <label for="pa">Address</label><textarea id="pa" rows="3" required placeholder="House / flat no., street, landmark">${esc(pf.address||'')}</textarea>
 <label for="pp">PIN code</label><input id="pp" inputmode="numeric" maxlength="6" required value="${esc(pf.pin||LOC?.pin||'')}"><p id="pinInfo" class="muted" role="status"></p><div id="msg" aria-live="polite"></div><p><button class="btn">Save details</button></p></form></div>`;
 wirePin('#pp');
 $('#pf').onsubmit=async e=>{e.preventDefault();const m=$('#msg'),v={full_name:$('#fn').value.trim(),phone:$('#ph').value.trim(),address:$('#pa').value.trim(),pin:$('#pp').value.trim()};
  if(v.full_name.length<2||!/^[6-9]\d{9}$/.test(v.phone)||v.address.length<10||!/^\d{6}$/.test(v.pin))return m.innerHTML=err('Enter your name, a valid 10-digit mobile number, your full address and a 6-digit PIN.');
  m.textContent='Saving…';try{await api.saveProfile(v);const r=await lookupPin(v.pin);if(r.serviceable)setLoc(r);navAuth();const ret=sessionStorage.wm_ret;sessionStorage.removeItem('wm_ret');m.innerHTML='<p class="ok">Details saved.</p>';if(ret)go(ret)}catch(x){m.innerHTML=err(x)}}},
async bookings(){if(needLogin())return;const l=await api.bookings();
 app.innerHTML=`<div class="wrap pad"><h1>My bookings</h1>${l.length?`<div class="grid">${l.map(b=>`<a class="card" href="#/booking/${b.id}"><h3>${esc(b.services?.name)}</h3><span class="badge">${ST[b.status]||b.status}</span><p>${price(b)}</p><p>${new Date(b.scheduled_at).toLocaleString()}</p></a>`).join('')}</div>`:'<p>No bookings yet. <a href="#/services">Browse services</a></p>'}</div>`},
async booking(id){if(needLogin())return;const draw=async()=>{const b=await api.booking(id);if(!b)return app.innerHTML='<div class="wrap pad"><h1>Booking not found</h1><a href="#/bookings">My bookings</a></div>';
  const can=['searching','no_partner_available','confirmed','estimate_sent'].includes(b.status);
  app.innerHTML=`<div class="wrap pad narrow"><a href="#/bookings">← My bookings</a><h1>${esc(b.services?.name)}</h1><p><span class="badge">${ST[b.status]||b.status}</span></p><p><strong>${price(b)}</strong></p><p>${esc(b.address)} (${esc(b.pin)})<br>${esc(b.description)}<br>${new Date(b.scheduled_at).toLocaleString()}</p><div id="msg" aria-live="polite"></div>
  ${b.status==='estimate_sent'?'<p><button class="btn" data-a="approve">Approve estimate</button> <button class="btn alt" data-a="decline">Decline</button></p>':''}${b.status==='no_partner_available'?'<p>No partner is available right now.</p><button class="btn" data-a="retry">Try again</button>':''}${can?' <button class="btn alt" data-a="cancel">Cancel booking</button>':''}
  ${b.status==='completed'&&!b.reviews?.length?'<form id="rv"><h2>Leave a review</h2><label for="rt">Rating</label><select id="rt"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select><label for="rc">Comment</label><textarea id="rc" rows="2"></textarea><p><button class="btn">Submit review</button></p></form>':''}
  <h2>Status history</h2><ul class="tl">${(b.events||[]).map(e=>`<li><strong>${ST[e.status]||e.status}</strong><br><span class="muted">${new Date(e.created_at).toLocaleString()} ${esc(e.note||'')}</span></li>`).join('')}</ul></div>`;
  const run=async(k,a)=>{try{await api.act(k,id,a);draw()}catch(x){$('#msg').innerHTML=err(x)}};
  app.querySelectorAll('[data-a]').forEach(x=>x.onclick=()=>{const a=x.dataset.a;if(a==='cancel'&&!confirm('Cancel this booking?'))return;a==='approve'||a==='decline'?run('estimate',{approve:a==='approve'}):run(a)});
  if($('#rv'))$('#rv').onsubmit=e=>{e.preventDefault();run('review',{rating:+$('#rt').value,comment:$('#rc').value})}};
 await draw();if(api.live)timer=setInterval(()=>draw().catch(()=>{}),20000)},
help(){const m=CONFIG.SUPPORT_EMAIL?`<a href="mailto:${esc(CONFIG.SUPPORT_EMAIL)}">${esc(CONFIG.SUPPORT_EMAIL)}</a>`:'<em>Support email not configured yet (set SUPPORT_EMAIL at the top of app.js).</em>';
 app.innerHTML=`<div class="wrap pad narrow"><h1>Help &amp; support</h1><h3>How are partners assigned?</h3><p>The system offers your request to one eligible, available partner at a time. If one declines or does not respond in time, the next is tried.</p><h3>No partner available?</h3><p>Open the booking and choose “Try again”.</p><h3>Can I cancel?</h3><p>Yes, until work is in progress or completed.</p><h3>Quotation work</h3><p>You approve the estimate before work starts.</p><h3 id="contact">Contact</h3><p>${m}</p></div>`},
about(){app.innerHTML='<div class="wrap pad narrow"><h1>About WorkMash</h1><p>WorkMash helps people request household services from approved local partners in a limited launch area.</p></div>'},
privacy(){app.innerHTML='<div class="wrap pad narrow"><h1>Privacy policy</h1><p class="muted">Starter content – have it reviewed by a legal professional before launch.</p><p>We collect your name, email, address and booking details to provide the service. Your data is stored in Supabase and is visible only to you, and to the partner handling your booking where needed. We do not sell your data.</p></div>'},
terms(){app.innerHTML='<div class="wrap pad narrow"><h1>Terms of use</h1><p class="muted">Starter content – have it reviewed by a legal professional before launch.</p><p>WorkMash connects customers with independent partners. A booking is confirmed only after a partner accepts. Cancellation is allowed until work is in progress. Quoted work starts only after you approve the estimate. No online payments are processed in this version.</p></div>'}};
const R=[[/^$/,'home'],[/^services$/,'services'],[/^service\/([\w-]+)$/,'service'],[/^book\/([\w-]+)$/,'book'],[/^login$/,'auth','login'],[/^signup$/,'auth','signup'],[/^profile$/,'profile'],[/^bookings$/,'bookings'],[/^booking\/([\w-]+)$/,'booking'],[/^(help|contact)$/,'help'],[/^about$/,'about'],[/^privacy$/,'privacy'],[/^terms$/,'terms']];

let LOC=null;try{LOC=JSON.parse(localStorage.wm_loc||'null')}catch(e){}
function updateLoc(){$('#locTxt').textContent=LOC?LOC.locality+' · '+LOC.pin:'Select your location'}
function setLoc(a){LOC={pin:a.pin,locality:a.locality,serviceable:!!a.serviceable};localStorage.wm_loc=JSON.stringify(LOC);localStorage.wm_pin=a.pin;updateLoc();$('#locSheet').close()}
async function openLoc(){const d=$('#locSheet'),a=await api.areas().catch(()=>[]);
 d.innerHTML=`<h2>Choose your location</h2><button type="button" class="btn full" id="gps">Use my current location</button><label for="lp">Or enter your PIN code</label><input id="lp" inputmode="numeric" maxlength="6" placeholder="e.g. 110017" autocomplete="postal-code"><div id="lm" class="lm" role="status" aria-live="polite"></div><h3 style="margin-top:18px">Areas we serve now</h3><div class="chips">${a.map(x=>`<button type="button" class="chip" data-p="${x.pin}">${esc(x.locality)} · ${x.pin}</button>`).join('')||'<span class="muted">None yet</span>'}</div><button type="button" class="btn alt full" id="lc">Close</button>`;
 const out=r=>{$('#lm').innerHTML=`<strong>${esc(r.detected||r.locality)}</strong> · ${r.pin}<br>${r.serviceable?'<span class="ok">We serve this area.</span>':'<span class="muted">Service has not started here yet. You can still browse.</span>'}<br><button type="button" class="btn sm" id="use">${r.serviceable?'Use this location':'Browse anyway'}</button>`;$('#use').onclick=()=>setLoc(r)};
 const check=async p=>{$('#lm').textContent='Detecting area…';const r=await lookupPin(p);r.found||r.serviceable?out(r):$('#lm').textContent=`We couldn't find PIN ${p}. Please check it.`};
 $('#lp').oninput=e=>{const v=e.target.value=e.target.value.replace(/\D/g,'');v.length===6?check(v):$('#lm').textContent=''};
 d.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>lookupPin(b.dataset.p).then(setLoc));$('#lc').onclick=()=>d.close();
 $('#gps').onclick=()=>{const msg=t=>$('#lm').textContent=t;if(!navigator.geolocation)return msg('Location is not supported here. Enter your PIN instead.');msg('Detecting your location…');
  navigator.geolocation.getCurrentPosition(async p=>{try{const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${p.coords.latitude}&lon=${p.coords.longitude}`);const pc=(((await r.json()).address||{}).postcode||'').replace(/\D/g,'');
   if(pc.length!==6)return msg('Could not read your PIN code. Please enter it manually.');$('#lp').value=pc;check(pc)}catch(e){msg('Could not detect your area. Please enter your PIN.')}},
  e=>msg(e.code===1?'Location permission denied. Enter your PIN instead.':'Could not get your location. Enter your PIN instead.'),{timeout:10000})};
 if(!d.open)d.showModal()}
function tabs(path){const b='#/'+path.split('/')[0];document.querySelectorAll('.tabs a').forEach(a=>a.toggleAttribute('aria-current',a.getAttribute('href')===b))}
async function route(){clearInterval(timer);const [path,qs]=(location.hash.slice(2)||'').split('?');app.innerHTML='<div class="wrap pad"><div class="tiles">'+'<div class="sk"></div>'.repeat(6)+'</div></div>';
 for(const [re,fn,fixed] of R){const m=path.match(re);if(!m)continue;
  try{await pages[fn](fixed||(fn==='services'?new URLSearchParams(qs):m[1]),)}catch(e){app.innerHTML=`<div class="wrap pad">${err(e)}</div>`}
  if(fn==='home'||fn==='help')document.title='WorkMash';app.focus();scrollTo(0,0);reveal();tabs(path);if(fn==='home'&&!LOC&&!sessionStorage.wm_asked){sessionStorage.wm_asked=1;openLoc()}return}
 app.innerHTML='<div class="wrap pad"><h1>Page not found</h1><a href="#/">Go home</a></div>'}
function navAuth(){const u=api.getUser(),a=$('#authLink'),um=$('#um');a.hidden=!!u;um.hidden=!u;if(!u)return;
 const paint=n=>$('#umBtn').innerHTML=`${avatar(u,34,n)}<span class="un">${esc(n.split(' ')[0])}</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;
 paint(uname(u));api.getProfile().then(p=>p&&p.full_name&&paint(p.full_name)).catch(()=>{})}
function wireMenu(){const b=$('#umBtn'),m=$('#umMenu'),shut=()=>{m.hidden=true;b.setAttribute('aria-expanded','false')};
 b.onclick=e=>{e.stopPropagation();const o=m.hidden;m.hidden=!o;b.setAttribute('aria-expanded',String(o))};
 document.addEventListener('click',e=>{if(!$('#um').contains(e.target))shut();document.querySelectorAll('.sg').forEach(u=>{if(!u.parentNode.contains(e.target))u.hidden=true})});
 addEventListener('keydown',e=>{if(e.key==='Escape')shut()});m.addEventListener('click',e=>{if(e.target.closest('a'))shut()});
 $('#lo').onclick=async()=>{shut();await api.signOut();navAuth();go('#/')};
 addEventListener('scroll',()=>$('.hdr').classList.toggle('sc',scrollY>6),{passive:true})}
addEventListener('hashchange',route);
(async()=>{try{await api.init()}catch(e){console.error(e)}
 if(!api.live){const b=$('#banner');b.hidden=false;b.textContent='DEMO MODE: Supabase not connected. Sample data, no real assignment.'}
 navAuth();updateLoc();$('#locBtn').onclick=openLoc;wireMenu();
 if(api.getUser()&&sessionStorage.wm_oauth){sessionStorage.removeItem('wm_oauth');await afterLogin()}
 route()})();

})();
