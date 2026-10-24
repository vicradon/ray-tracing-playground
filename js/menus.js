// Context menu and undo/redo history
// ---- right-click menu
const ctx=$('ctx'),done=()=>{panel();draw()};
const delEl=e=>{S.els.splice(S.els.indexOf(e),1);S.rays=S.rays.filter(r=>r.aim.el!=e.id)};
const delObj=i=>{S.objs.splice(i,1);S.rays=S.rays.filter(r=>r.src!=i);S.rays.forEach(r=>{if(r.src>i)r.src--})};
const delRay=r=>{S.rays=S.rays.filter(g=>g!==r&&g.aim.ref!=r.id)};
function showMenu(ev,items){ctx.innerHTML='';items.forEach(it=>{if(it.sep){ctx.appendChild(document.createElement('hr'));return}
 if(it.sws){const r=document.createElement('div');r.className='sws';it.sws.forEach(([c,n])=>{const i=document.createElement('i');i.style.background=c;i.title=n;if(it.cur==c)i.className='on';i.onclick=()=>{ctx.style.display='none';it.f(c);done()};r.appendChild(i)});ctx.appendChild(r);return}
 const d=document.createElement('div');
 d.textContent=(it.chk===undefined?'':(it.chk?'\u2713 ':'\u2003 '))+it.l;if(it.k){const k=document.createElement('span');k.className='k';k.textContent=it.k;d.appendChild(k)}
 if(it.dis)d.className='d';else if(it.h)d.className='h';else d.onclick=()=>{ctx.style.display='none';it.f();done()};ctx.appendChild(d)});
 ctx.style.display='block';ctx.style.left=Math.max(8,Math.min(ev.clientX,innerWidth-ctx.offsetWidth-8))+'px';ctx.style.top=Math.min(ev.clientY,innerHeight-ctx.offsetHeight-8)+'px'}
cv.oncontextmenu=ev=>{ev.preventDefault();
 if(ev.touch||ev.pointerType=='touch'||tps.size){if(Date.now()-lpAt<1000)return;lpAt=Date.now();cancelGesture();if(navigator.vibrate)navigator.vibrate(12)} // long press: our timer or the browser's own, whichever comes first
 const p=wp(ev);let items=null;
 if(practice){const ho=(S.hnd||[]).find(h=>Math.hypot(h.x-p.x,h.y-p.y)<tol(.6)),l=ho&&ho.k=='lp'?S.lines.find(q=>q.id==ho.id):S.lines.find(q=>lineHit(q,p,.3));if(l)showMenu(ev,lineMenu(l.id));else if(ho&&ho.k=='ans')showMenu(ev,[{l:'Answer marker',h:1},{l:'Remove marker',f:()=>{practice.ans=null}}]);return}
 const ho=(S.hnd||[]).filter(h=>Math.hypot(h.x-p.x,h.y-p.y)<tol(.6)).sort((a,b)=>(a.k=='obj'?0:1)-(b.k=='obj'?0:1))[0];
 if(ho&&ho.k=='obj'){const i=ho.i,o=S.objs[i];items=[{l:(o.ext?'Arrow':'Point')+' object',h:1},{l:'Add principal rays',f:()=>principal(i)},{l:o.ext?'Make point object':'Make arrow object',f:()=>{o.ext=!o.ext;if(o.ext&&Math.abs(o.y)<.1)o.y=3}},{l:'Remove object',f:()=>delObj(i)}]}
 else if(ho&&ho.k=='lp'){items=lineMenu(ho.id)}else if(ho){const r=S.rays.find(q=>q.id==ho.id);items=r?rayMenu(r):null}
 if(!items){S.els.forEach((e,i)=>{if(!items&&(Math.abs(e.x-p.x)<tol(.4)||(Math.abs(e.x-e.f-p.x)<tol(.4)&&Math.abs(p.y)<tol(.8))||(e.t=='L'&&Math.abs(e.x+e.f-p.x)<tol(.4)&&Math.abs(p.y)<tol(.8))))
   items=[{l:kindName(e)+' #'+(i+1),h:1},{l:e.t=='L'?'Turn into mirror':'Turn into lens',f:()=>{e.t=e.t=='L'?'M':'L'}},{l:'Flip sign of f ('+(e.f>0?(e.t=='L'?'make diverging':'make convex'):(e.t=='L'?'make converging':'make concave'))+')',f:()=>{e.f=-e.f}},{l:'Remove element',f:()=>delEl(e)}]})}
 if(!items){const l=S.lines.find(l=>lineHit(l,p,.25));if(l)items=lineMenu(l.id)}
 if(!items){let best=null,bd=tol(.25);(S.segs||[]).forEach(g=>g.a.forEach(a=>{const d=dseg(p,a);if(d<bd){bd=d;best=g}}));if(best)items=rayMenu(S.rays.find(q=>q.id==best.id))}
 if(!items){const pos={x:p.x,y:p.y};items=[{l:'Add here',h:1},{l:'Converging lens',f:()=>add('L+',pos)},{l:'Diverging lens',f:()=>add('L-',pos)},{l:'Concave mirror',f:()=>add('M+',pos)},{l:'Convex mirror',f:()=>add('M-',pos)},{l:'Point object',f:()=>add('P',pos)},{l:'Arrow object',f:()=>add('A',pos)}];
  if(S.objs.length)items.push({l:'Add principal rays for all objects',f:()=>S.objs.forEach((_,i)=>principal(i))});if(S.rays.length)items.push({l:'Remove all rays',f:()=>{S.rays=[]}});items.push({l:'Clear everything',f:()=>{S={els:[],objs:[],rays:[],lines:[]}}})}
 showMenu(ev,items)};
function rayMenu(r){const it=[{l:rayDesc(r),h:1},{l:'Trace parallel ray',f:()=>startPar(r)},{l:'Hide ray',f:()=>{r.vis=false}}];
 if(r.aim.k=='hit'&&r.src<0&&!S.rays.some(g=>g.aim.k=='guide'&&g.aim.ref==r.id))it.push({l:'Add guideline',f:()=>addRay(-1,{k:'guide',ref:r.id})});it.push({l:'Remove ray',f:()=>delRay(r)});return it}
document.addEventListener('pointerdown',e=>{if(!ctx.contains(e.target))ctx.style.display='none'});
const hist={u:[],r:[],cur:null,key:null,t:0};
function ser(){return JSON.stringify({els:S.els,objs:S.objs,rays:S.rays,lines:S.lines,uid})}
function updBtns(){document.querySelectorAll('[data-act=undo]').forEach(b=>b.disabled=!hist.u.length);document.querySelectorAll('[data-act=redo]').forEach(b=>b.disabled=!hist.r.length)}
function commit(){const j=ser();if(hist.cur===null){hist.cur=j;updBtns();return}if(j===hist.cur)return;
 const key=drag?'d'+dragN:'i',now=Date.now();
 if(key==hist.key&&(drag||now-hist.t<400))hist.cur=j;else{hist.u.push(hist.cur);if(hist.u.length>200)hist.u.shift();hist.cur=j}
 hist.key=key;hist.t=now;hist.r=[];updBtns()}
function restore(j){const o=JSON.parse(j);S.els=o.els;S.objs=o.objs;S.rays=o.rays;S.lines=o.lines||[];uid=o.uid;S.prev=null;par=null;hist.cur=j;hist.key=null;panel();draw();updBtns()}
function undo(){if(!hist.u.length)return;hist.r.push(hist.cur);restore(hist.u.pop())}
function redo(){if(!hist.r.length)return;hist.u.push(hist.cur);restore(hist.r.pop())}
addEventListener('keydown',e=>{if(e.key=='Escape'){ctx.style.display='none';if(par){par=null;S.prev=null;S.snapPt=null;draw()}}
 const k=e.key.toLowerCase();if((e.ctrlKey||e.metaKey)&&!/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)){if(k=='z'){e.preventDefault();e.shiftKey?redo():undo()}else if(k=='y'){e.preventDefault();redo()}}});
