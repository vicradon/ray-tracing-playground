// Side panels (elements, objects, rays) and adding things
// ---- panels
function panel(){renderLines();pracUI();const els=$('els'),objs=$('objs'),rays=$('rays'),ad=$('addr');els.innerHTML=objs.innerHTML=rays.innerHTML=ad.innerHTML='';
 const row=(p,h)=>{const d=document.createElement('div');d.className='row';d.innerHTML=h;p.appendChild(d);return d};
 if(!S.els.length)row(els,'<span class="muted">none</span>');
 S.els.forEach((e,i)=>{const d=row(els,`<b>#${i+1}</b><select><option value="L">Lens</option><option value="M">Mirror</option></select> x <input type="number" step="0.5" value="${e.x}"> f <input type="number" step="0.5" value="${e.f}"><span class="muted kn">${kindName(e)}</span><button>remove</button>`);
  const[s,x,f,b]=d.querySelectorAll('select,input,button');s.value=e.t;
  s.onchange=()=>{e.t=s.value;panel();draw()};x.oninput=()=>{e.x=+x.value;draw()};f.oninput=()=>{if(+f.value!=0)e.f=+f.value;d.querySelector('.kn').textContent=kindName(e);draw()};
  b.onclick=()=>{S.els.splice(i,1);S.rays=S.rays.filter(r=>!(r.aim.el==e.id));panel();draw()}});
 if(!S.objs.length)row(objs,'<span class="muted">none</span>');
 S.objs.forEach((o,i)=>{const d=row(objs,`<b>${o.ext?'AB':'A'}${onm(i)}</b> x <input type="number" step="0.5" value="${o.x}"> y <input type="number" step="0.5" value="${o.y}"><label><input type="checkbox" ${o.ext?'checked':''}> arrow</label><button>+ principal rays</button><button>remove</button>`);
  const[x,y,c,pb,b]=d.querySelectorAll('input,button');x.oninput=()=>{o.x=+x.value;draw()};y.oninput=()=>{o.y=+y.value;draw()};
  c.onchange=()=>{o.ext=c.checked;if(o.ext&&Math.abs(o.y)<.1)o.y=3;panel();draw()};
  pb.onclick=()=>{principal(i);panel();draw()};
  b.onclick=()=>{S.objs.splice(i,1);S.rays=S.rays.filter(r=>r.src!=i);S.rays.forEach(r=>{if(r.src>i)r.src--});panel();draw()}});
 if(!S.rays.length)row(rays,'<span class="muted">no rays yet</span>');
 S.rays.forEach(r=>{const hasG=S.rays.some(g=>g.aim.k=='guide'&&g.aim.ref==r.id);const d=row(rays,`<label><input type="checkbox" ${r.vis?'checked':''}> <b style="color:${rayCol(r)}">●</b> ${rayDesc(r)}</label>${r.aim.k=='hit'&&r.src<0&&!hasG?'<button>+ guideline</button>':''}<button>remove</button>`);
  const bs=d.querySelectorAll('button'),c=d.querySelector('input');c.onchange=()=>{r.vis=c.checked;draw()};
  if(bs.length>1)bs[0].onclick=()=>{addRay(-1,{k:'guide',ref:r.id});panel();draw()};
  bs[bs.length-1].onclick=()=>{S.rays=S.rays.filter(g=>g!==r&&g.aim.ref!=r.id);panel();draw()}});
 const so=S.objs.map((o,i)=>`<option value="${i}">${o.ext?'AB':'A'}${onm(i)}</option>`).join('')+'<option value="-1">free ray</option>';
 let ao='<option value="par">parallel to axis</option><option value="hit">free aim (draggable)</option>';
 S.els.forEach(e=>(e.t=='L'?['O','F','Fp']:['O','F','C']).forEach(p=>ao+=`<option value="${e.id}:${p}">through ${ptName(e,p)}</option>`));
 ad.innerHTML=`<b>New ray</b> from <select>${so}</select> <select>${ao}</select><button>add ray</button>`;
 const[a,b,btn]=ad.querySelectorAll('select,button');
 btn.onclick=()=>{if(!S.els.length)return;const src=+a.value;let aim;if(src<0||b.value=='hit')aim={k:'hit',h:2};else if(b.value=='par')aim={k:'par'};else{const[id,p]=b.value.split(':');aim={k:'pt',el:+id,p}}
  if(src>=0&&aim.k=='hit'){const o=S.objs[src];aim.h=o.y>0?o.y/2:2}
  addRay(src,aim);panel();draw()}}
// where a palette button (no drop point) puts a new item: the middle of the current view, moved sideways until it does not sit on top of an existing one
function freeSpot(t){const el=t[0]=='L'||t[0]=='M',c=atHome()?{x:9,y:3}:{x:view.x0+W/2/view.z,y:view.y0-H/2/view.z},
  taken=x=>el?S.els.some(e=>Math.abs(e.x-x)<.75):S.objs.some(o=>Math.abs(o.x-x)<.75);
 for(let k=0;k<40;k++){const x=c.x+(k%2?1:-1)*Math.ceil(k/2)*2;if(!taken(sn(x)))return{x,y:c.y}}return c}
function add(t,p){if(practice){toast('Adding elements is disabled in practice mode');return}
 p=p||freeSpot(t);const x=clx(sn(p.x));
 if(t[0]=='L'||t[0]=='M')S.els.push({id:uid++,t:t[0],x,f:t[1]=='-'?-pref.f:pref.f});
 else S.objs.push({x,y:t=='A'?(Math.abs(p.y)<.3?3:sn(p.y)):sn(p.y),ext:t=='A'});panel();draw()}
document.querySelectorAll('[data-add]').forEach(b=>{b.onclick=()=>{if(palDrag.used){palDrag.used=false;return}add(b.dataset.add)};b.ondragstart=e=>e.dataTransfer.setData('text/plain',b.dataset.add)});
// touch has no HTML drag and drop: drag a palette button down (sideways still scrolls the toolbar) and drop it on the canvas
const palDrag={b:null,x:0,y:0,g:null,used:false};
document.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('pointerdown',ev=>{if(ev.pointerType=='mouse')return;Object.assign(palDrag,{b,id:ev.pointerId,x:ev.clientX,y:ev.clientY,g:null,used:false})}));
const GY=38,gpt=ev=>({clientX:ev.clientX,clientY:ev.clientY-GY}), // the ghost floats above the finger so it stays visible; it drops where the ghost is
 overCv=ev=>{const r=cv.getBoundingClientRect(),q=gpt(ev);return q.clientX>=r.left&&q.clientX<=r.right&&q.clientY>=r.top&&q.clientY<=r.bottom};
addEventListener('pointermove',ev=>{const d=palDrag;if(!d.b||ev.pointerId!=d.id)return;
 if(!d.g){const dx=ev.clientX-d.x,dy=ev.clientY-d.y;if(Math.hypot(dx,dy)<10)return;if(Math.abs(dy)<Math.abs(dx)){d.b=null;return} // mostly sideways: leave it to the toolbar scroll
  try{d.b.releasePointerCapture(ev.pointerId)}catch(e){}d.g=mk('div','palghost',d.b.querySelector('svg').outerHTML);document.body.appendChild(d.g)}
 ev.preventDefault();d.g.style.left=ev.clientX+'px';d.g.style.top=ev.clientY+'px';d.g.classList.toggle('ok',overCv(ev))},{passive:false});
const palEnd=ev=>{const d=palDrag;if(!d.b||ev.pointerId!=d.id)return;if(d.g){d.g.remove();d.used=true;setTimeout(()=>d.used=false,400);if(ev.type=='pointerup'&&overCv(ev))add(d.b.dataset.add,wp(gpt(ev)))}d.b=null;d.g=null};
addEventListener('pointerup',palEnd);addEventListener('pointercancel',palEnd);
cv.ondragover=e=>e.preventDefault();cv.ondrop=e=>{e.preventDefault();const t=e.dataTransfer.getData('text/plain');if(t)add(t,wp(e))};
