// Simplified UI: tap-to-select, the scene list, the selection inspector, the add sheet, the layers popover and the compact menu.
// The inspector is a bottom sheet on phones and a docked panel on wide screens (layout.css decides which).

let sel=null; // what the inspector shows: {k:'el',id} | {k:'obj',i} | {k:'ray',id} | {k:'line',id}, tagged with the mode it belongs to
const narrow=()=>matchMedia('(max-width:899px)').matches;
const f2=v=>+(+v).toFixed(2),plural=(n,w)=>n+' '+w+(n==1?'':'s');
const elKey=e=>e.t+(e.f>0?'+':'-');
function select(s){sel=s?{...s,m:mode}:null;panel();if(sel&&narrow()&&document.scrollingElement.scrollTop>40)scrollTo({top:0,behavior:'smooth'})}

// ---- what is selected, resolved against the current scene (null if it no longer exists)
function selTarget(){if(!sel||sel.m!==mode)return null;
 if(sel.k=='el'){const e=elById(sel.id);return e&&!practice?{k:'el',e}:null}
 if(sel.k=='obj'){const o=S.objs[sel.i];return o&&!practice?{k:'obj',o,i:sel.i}:null}
 if(sel.k=='ray'){const r=S.rays.find(q=>q.id==sel.id);return r&&!practice?{k:'ray',r}:null}
 if(sel.k=='line'){const l=S.lines.find(q=>q.id==sel.id);return l?{k:'line',l}:null}return null}

// ---- tap (or click) with the Move tool selects what is under it; tapping empty space clears the selection.
// Capture-phase listeners so the pinch / pan handlers, which stop propagation, cannot hide the gesture from us.
let tapS=null;
cv.addEventListener('pointerdown',ev=>{tapS=ev.isPrimary&&ev.button==0?{x:ev.clientX,y:ev.clientY,id:ev.pointerId,t:Date.now()}:null},{capture:true});
cv.addEventListener('pointermove',ev=>{if(tapS&&(ev.pointerId!=tapS.id||Math.hypot(ev.clientX-tapS.x,ev.clientY-tapS.y)>8))tapS=null},{capture:true});
cv.addEventListener('pointerup',ev=>{const t=tapS;tapS=null;if(!t||ev.pointerId!=t.id||Date.now()-t.t>600||tool!='move'||par||Date.now()-lpAt<800)return;
 const p=wp(ev);setTimeout(()=>tapSelect(p),0)},{capture:true});
function tapSelect(p){let h=hitAt(p);if(practice&&h&&h.k!='line')h=null;
 select(!h?null:h.k=='obj'?{k:'obj',i:h.i}:h.k=='el'?{k:'el',id:h.e.id}:h.k=='ray'?{k:'ray',id:h.r.id}:{k:'line',id:h.l.id})}

// ---- small builders
const icon=k=>(CTRL[k]&&CTRL[k].icon)||'';
const lineIcon=l=>svg(l.k=='bold'?'<circle cx="5" cy="19" r="2"/><circle cx="19" cy="5" r="2"/><path stroke-width="3" d="M6.5 17.5L17.5 6.5"/>':'<path stroke-width="2.4" stroke-dasharray="0.1 3.4" d="M2 22L22 2"/>');
function B(text,f,cls,label){const b=mk('button',cls||'');b.type='button';if(text.startsWith('<'))b.innerHTML=text;else b.textContent=text;if(label){b.setAttribute('aria-label',label);b.title=label}b.onclick=f;return b}
function segc(label,opts,cur,on){const d=mk('div','segc');d.setAttribute('role','radiogroup');d.setAttribute('aria-label',label);
 opts.forEach(([v,t])=>{const b=B(t,()=>on(v),v==cur?'on':'');b.setAttribute('role','radio');b.setAttribute('aria-checked',v==cur);d.appendChild(b)});return d}
function stepper(label,get,step,set,min){const r=mk('div','st'),l=mk('label'),w=mk('div','stw'),inp=mk('input');
 const id='st'+Math.random().toString(36).slice(2,8);inp.id=id;l.htmlFor=id;l.innerHTML=label;
 inp.type='number';inp.inputMode='decimal';inp.step=step;inp.value=f2(get());
 const apply=v=>{if(!isFinite(v))return;v=+(+v).toFixed(4);if(min!=null)v=Math.max(min,v);set(v);inp.value=f2(get());draw();renderScene()};
 w.append(B('−',()=>apply(get()-step),'sb','Decrease '+l.textContent),inp,B('+',()=>apply(get()+step),'sb','Increase '+l.textContent));
 inp.onchange=()=>apply(+inp.value);inp.onkeydown=e=>{if(e.key=='Enter')inp.blur()};r.append(l,w);return r}
function head(ic,title,col){const d=mk('div','ih');const i=mk('span','ic',ic);if(col)i.style.color=col;const h=mk('h2');h.textContent=title;
 d.append(i,h,B(svg('<path d="M6 6l12 12M18 6L6 18"/>'),()=>select(null),'ib','Close'));return d}
const sec=t=>{const h=mk('h3','ph');h.textContent=t;return h};
const act=(f)=>()=>{f();panel();draw()};

// ---- inspector
function renderInsp(){const box=$('insp'),T=selTarget();box.innerHTML='';box.classList.toggle('open',!!T);document.body.classList.toggle('insp-open',!!T);if(!T){sel=null;return}
 const add=(...n)=>box.append(...n);
 if(T.k=='el'){const e=T.e,M=e.t=='M';
  add(head(icon(elKey(e)),kindName(e)+(S.els.length>1?' '+(S.els.indexOf(e)+1):'')),
   segc('Element type',[['L','Lens'],['M','Mirror']],e.t,v=>{e.t=v;panel();draw()}),
   segc('Kind',M?[['+','Concave'],['-','Convex']]:[['+','Converging'],['-','Diverging']],e.f>0?'+':'-',v=>{e.f=Math.abs(e.f)*(v=='+'?1:-1);panel();draw()}),
   stepper(`Position <i>x</i>`,()=>e.x,pref.step,v=>{e.x=clx(v)}),
   stepper(`Focal length <i>|f|</i>`,()=>Math.abs(e.f),.5,v=>{e.f=Math.sign(e.f)*v},.25),
   mk('p','muted',`Drag the ${M?'mirror':'lens'} on the canvas to move it, or its F to change the focal length.`),
   B('Delete '+(M?'mirror':'lens'),act(()=>{delEl(e);sel=null}),'danger'))}
 else if(T.k=='obj'){const o=T.o,i=T.i,nm=(o.ext?'B':'A')+onm(i);
  add(head(icon(o.ext?'A':'P'),'Object '+(o.ext?'AB':'A')+onm(i),OC),
   segc('Object shape',[['P','Point'],['A','Arrow']],o.ext?'A':'P',v=>{o.ext=v=='A';if(o.ext&&Math.abs(o.y)<.1)o.y=3;panel();draw()}));
  const xy=mk('div','pair');xy.append(stepper('<i>x</i>',()=>o.x,pref.step,v=>{o.x=clx(v)}),stepper('<i>y</i>',()=>o.y,pref.step,v=>{o.y=Math.max(-6.5,Math.min(6.5,v))}));add(xy);
  const R=S.rays.filter(r=>r.src==i);add(sec(R.length?'Rays from '+nm:'No rays from '+nm+' yet'));
  if(R.length){const ul=mk('ul','rays');R.forEach(r=>{const li=mk('li');const dot=mk('span','dot');dot.style.background=rayCol(r);const t=mk('span','rt');t.textContent=rayDesc(r).replace(/^[^:]+: /,'');
    const eye=B(svg(r.vis?'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>':'<path d="M3 3l18 18M10.6 5.1A10 10 0 0112 5c6 0 10 7 10 7a17 17 0 01-3 3.7M6.6 6.6C3.8 8.4 2 12 2 12s4 7 10 7a9.6 9.6 0 004.4-1"/>'),act(()=>{r.vis=!r.vis}),'ib',(r.vis?'Hide':'Show')+' ray');
    eye.setAttribute('aria-pressed',!r.vis);li.append(dot,t,eye,B(svg('<path d="M6 6l12 12M18 6L6 18"/>'),act(()=>delRay(r)),'ib','Remove ray'));ul.appendChild(li)});add(ul)}
  const ch=mk('div','chips');ch.append(mk('span','muted','Add'),B('Principal rays',act(()=>principal(i)),'chipb'),B('∥ axis',act(()=>addRay(i,{k:'par'})),'chipb'));
  srt().forEach(e=>(e.t=='L'?['O','F','Fp']:['O','F','C']).forEach(p=>ch.appendChild(B('through '+ptName(e,p),act(()=>addRay(i,{k:'pt',el:e.id,p})),'chipb'))));
  if(!S.els.length)ch.appendChild(mk('span','muted','(add a lens or mirror to trace rays)'));
  add(ch,B('Delete object',act(()=>{delObj(i);sel=null}),'danger'))}
 else if(T.k=='ray'){const r=T.r,src=r.src>=0?(S.objs[r.src].ext?'B':'A')+onm(r.src):null,g=r.aim.k=='guide';
  add(head(icon('trace'),g?'Guideline':src?'Ray from '+src:'Free ray',rayCol(r)));const p=mk('p');p.textContent=rayDesc(r).replace(/^[^:]+: /,'');add(p);
  const row=mk('div','btns');row.append(B(r.vis?'Hide ray':'Show ray',act(()=>{r.vis=!r.vis})));
  if(!g)row.append(B('Trace parallel ray',()=>{startPar(r);sel=null;panel();draw();toast('Tap where the parallel ray should pass')}));
  if(r.aim.k=='hit'&&r.src<0&&!S.rays.some(q=>q.aim.k=='guide'&&q.aim.ref==r.id))row.append(B('Add guideline',act(()=>addRay(-1,{k:'guide',ref:r.id}))));
  if(r.aim.k=='hit'||r.aim.k=='at'||r.aim.k=='dir'||r.src<0)add(row,mk('p','muted','Drag its round handles on the canvas to aim it.'));else add(row);
  add(B('Delete ray',act(()=>{delRay(r);sel=null}),'danger'))}
 else{const l=T.l,n=S.lines.indexOf(l)+1;
  add(head(lineIcon(l),(l.k=='bold'?'Line ':'Construction line ')+n,l.c||LC),
   segc('Line style',[['bold','Solid segment'],['cons','Construction']],l.k,v=>{l.k=v;panel();draw()}));
  const sw=mk('div','swatches');sw.setAttribute('role','radiogroup');sw.setAttribute('aria-label','Colour');
  LINE_COLORS.forEach(([c,nm])=>{const b=B('',()=>{if(c==LC)delete l.c;else l.c=c;panel();draw()},(l.c||LC)==c?'on':'',nm);b.style.background=c;b.setAttribute('role','radio');b.setAttribute('aria-checked',(l.c||LC)==c);sw.appendChild(b)});
  const p=mk('p','muted');p.textContent=`From (${f2(l.a.x)}, ${f2(l.a.y)}) to (${f2(l.b.x)}, ${f2(l.b.y)}). Drag its end points on the canvas to adjust it.`;
  const row=mk('div','btns');row.append(B(l.vis?'Hide line':'Show line',act(()=>{l.vis=!l.vis})));
  add(sec('Colour'),sw,p,row,B('Delete line',act(()=>{delLine(l);sel=null}),'danger'))}}

// ---- scene list (sandbox): every element, object, free ray and line, one tappable row each
function renderScene(){const box=$('scene');box.innerHTML='';const T=selTarget(),cur=T&&(T.e||T.o||T.r||T.l);
 const h=mk('div','sh');h.append(mk('h2',null,'Scene'),mk('span','muted',S.els.length+S.objs.length+S.lines.length?'Tap to edit':''));box.appendChild(h);
 const row=(ic,col,name,meta,s,on)=>{const b=B('',()=>select(s),'srow'+(on?' on':''));const i=mk('span','ic',ic);if(col)i.style.color=col;
  const n=mk('span','nm');n.textContent=name;const m=mk('span','meta');m.textContent=meta;b.append(i,n,m,mk('span','chev','›'));b.setAttribute('aria-pressed',!!on);box.appendChild(b)};
 srt().forEach(e=>row(icon(elKey(e)),null,kindName(e)+(S.els.length>1?' '+(S.els.indexOf(e)+1):''),`x ${f2(e.x)} · f ${f2(e.f)}`,{k:'el',id:e.id},cur===e));
 S.objs.forEach((o,i)=>row(icon(o.ext?'A':'P'),OC,'Object '+(o.ext?'AB':'A')+onm(i),`(${f2(o.x)}, ${f2(o.y)}) · ${plural(S.rays.filter(r=>r.src==i).length,'ray')}`,{k:'obj',i},cur===o));
 S.rays.filter(r=>r.src<0).forEach(r=>row(icon('trace'),rayCol(r),r.aim.k=='guide'?'Guideline':'Free ray',rayDesc(r).replace(/^[^:]+: /,''),{k:'ray',id:r.id},cur===r));
 S.lines.forEach((l,i)=>row(lineIcon(l),l.c||LC,(l.k=='bold'?'Line ':'Construction line ')+(i+1)+(l.vis?'':' (hidden)'),'',{k:'line',id:l.id},cur===l));
 if(!S.els.length&&!S.objs.length&&!S.rays.length&&!S.lines.length)box.appendChild(mk('p','muted empty','Nothing here yet. Tap + to add a lens, mirror or object, or pick a preset at the top of the canvas.'))}

// ---- result chip on the canvas (draw() passes the text); also keeps the Grid switch in step with the preference
function setRes(t){const e=$('res');e.textContent=t;e.hidden=!t;$('grid').checked=pref.grid}

// ---- add sheet
function openSheet(){if(practice){toast('Adding elements is disabled in practice mode');return}$('addSheet').classList.add('open');document.body.classList.add('sheet-open')}
function closeSheet(){$('addSheet').classList.remove('open');document.body.classList.remove('sheet-open')}
$('addSheet').addEventListener('click',e=>{if(e.target.id=='addSheet'||e.target.closest('[data-close]'))closeSheet()});
$('addFree').onclick=()=>{if(!S.els.length){toast('Add a lens or mirror first');return}const r=addRay(-1,{k:'hit',h:2});closeSheet();select({k:'ray',id:r.id});draw()};

// ---- layers popover
const lay=$('layers'),layB=$('layersBtn');
const setLayers=on=>{lay.classList.toggle('open',on);layB.setAttribute('aria-expanded',on)};
layB.onclick=e=>{e.stopPropagation();setLayers(!lay.classList.contains('open'))};
document.addEventListener('pointerdown',e=>{if(lay.classList.contains('open')&&!lay.contains(e.target)&&!layB.contains(e.target))setLayers(false)});
$('grid').onchange=()=>setPref({grid:$('grid').checked});

// ---- compact menu (phones): one button opening File / Edit / View / Preferences / Help
const MENU_NAMES=[['file','File'],['edit','Edit'],['view','View'],['prefs','Preferences'],['help','Help']];
$('menuBtn').onclick=ev=>{ev.stopPropagation();const r=$('menuBtn').getBoundingClientRect(),pos={clientX:r.left,clientY:r.bottom+4};
 showMenu(pos,MENU_NAMES.map(([k,l])=>({l:l+' ›',f:()=>setTimeout(()=>showMenu(pos,[{l,h:1},...MENUS[k]()]),0)})))};
function raysHelp(){modal('How rays work',txt(`<div class="muted" style="font-size:14px;line-height:1.5">Every ray is traced through the elements in order: lens p′ = p − h/f, mirror the same followed by a reversal of direction. Images are found by intersecting the traced output rays of an object (dashed = virtual). Elements are traced from the leftmost; an object to the right of an element acts as a virtual object for it.<br><br>
 <b>Adding rays.</b> Tap an object and use its Add buttons (principal rays, parallel to the axis, through O, F, F′, S or C), or pick the Ray tool and drag from the object toward the elements; it snaps to those points, to the element at a grid height, or to a grid point. A free ray (from the + sheet) is aimed by dragging its handles.<br><br>
 <b>Editing.</b> With Move, drag lenses, mirrors, objects, F points and handles; tap anything to edit it. Right-click (long-press on touch) for more, such as Trace parallel ray. Pinch or Ctrl+scroll to zoom, drag empty space (touch) or Space+drag to pan.</div>`))}
{const h0=MENUS.help;MENUS.help=()=>[{l:'How rays work…',f:raysHelp},...h0()]}

addEventListener('keydown',e=>{if(e.key!='Escape')return;if($('addSheet').classList.contains('open'))closeSheet();else if(lay.classList.contains('open'))setLayers(false);else if(sel&&!LP&&!par)select(null)});
// mouse drag from the add sheet: let the drag pass through to the canvas underneath
$('tiles').addEventListener('dragstart',()=>setTimeout(()=>$('addSheet').classList.add('dragging'),0));
$('tiles').addEventListener('dragend',()=>{$('addSheet').classList.remove('dragging');closeSheet()});
