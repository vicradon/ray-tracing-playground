// Pointer interaction, zoom and pan
// ---- interaction
let drag=null;
function wp(ev){const r=cv.getBoundingClientRect(),k=W/view.z/r.width;return{x:view.x0+(ev.clientX-r.left)*k,y:view.y0-(ev.clientY-r.top)*k}}
const sn=v=>$('snap').checked?Math.round(v/pref.step)*pref.step:v;
let tool='move',TR=null,par=null,dragN=0,LP=null;
function setTool(t){if(practice&&t=='trace'){toast('Trace is disabled in practice mode: use the line tools');t='line'}if(t=='mark'&&!(practice&&practice.task=='image')){toast('The Mark tool is for the "find the image" practice task');t='move'}
 tool=t;par=null;LP=null;S.pl=null;S.snapPt=null;S.snapLbl='';document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('on',b.dataset.tool==t));cv.style.cursor=t=='move'?'default':'crosshair';S.prev=null;draw()}
function parPt(p){S.snapLbl='';let best=null,bd=tol(.6);S.els.forEach(e=>(e.t=='L'?['O','F','Fp']:['O','F','C']).forEach(k=>{const T=ptOf(e,k),d=Math.hypot(T.x-p.x,T.y-p.y);if(d<bd){bd=d;best=T}}));if(best){S.snapPt=best;return best}return{x:sn(p.x),y:sn(p.y)}}
function startPar(r){par=r.id;S.prev=null;S.snapPt=null}
function aimFrom(p,src){S.snapLbl='';const e0=srt()[0];if(!e0)return null;const Q=src>=0?S.objs[src]:null;let best=null,bd=tol(.6);
 S.els.forEach(e=>(e.t=='L'?['O','F','Fp']:['O','F','C']).forEach(k=>{const T=ptOf(e,k),d=Math.hypot(T.x-p.x,T.y-p.y);if(d<bd){bd=d;best={k:'pt',el:e.id,p:k,T}}}));
 if(best){S.snapPt=best.T;const{T,...a}=best;return a}
 if(Q&&p.x>Q.x&&Math.abs(p.y-Q.y)<tol(.3))return{k:'par'};
 if(Math.abs(p.x-e0.x)<tol(.8))return{k:'hit',h:sn(p.y)};
 return{k:'at',x:sn(p.x),y:sn(p.y)}}
// ---- zoom & pan: an infinite canvas; the view is a window of size W/z x H/z whose top-left corner is (view.x0, view.y0)
const ZLEV=[.02,.05,.1,.15,.25,.33,.5,.75,1,1.25,1.5,2,3,4,6,8],ZMIN=.02,ZMAX=8,PAN=300; // the view centre may roam PAN units from the scene centre
const clampTo=(v,a,b)=>Math.max(a,Math.min(b,v)),atHome=()=>Math.abs(view.z-1)<1e-6&&Math.abs(view.x0)<1e-6&&Math.abs(view.y0-H/2)<1e-6;
function clampView(){const z=view.z,mx=clampTo(view.x0+W/2/z,W/2-PAN,W/2+PAN),my=clampTo(view.y0-H/2/z,-PAN,PAN);view.x0=mx-W/2/z;view.y0=my+H/2/z}
function setView(z,fx,fy,wx,wy){z=Math.max(ZMIN,Math.min(ZMAX,z));view.z=z;view.x0=wx-fx*W/z;view.y0=wy+fy*H/z;clampView();draw()} // keep world point (wx,wy) at canvas fraction (fx,fy)
const fracOf=(x,y)=>{const r=cv.getBoundingClientRect();return[(x-r.left)/r.width,(y-r.top)/(r.width*H/W)]}; // same uniform px-to-world scale as wp() and draw()
function zoomAbout(z,fx,fy){setView(z,fx,fy,view.x0+fx*W/view.z,view.y0-fy*H/view.z)}
function zoomStep(d){const z=view.z,n=d>0?ZLEV.find(l=>l>z+1e-6):[...ZLEV].reverse().find(l=>l<z-1e-6);if(n==null)return;
 zoomAbout(n,...(lastP?[(lastP.x-view.x0)*view.z/W,(view.y0-lastP.y)*view.z/H]:[.5,.5]))}
function zoomReset(){Object.assign(view,HOME);draw()}
function panPx(dx,dy){const r=cv.getBoundingClientRect(),k=W/view.z/r.width;view.x0+=dx*k;view.y0-=dy*k;clampView();draw()}
function zoomKey(k){if(k=='+'||k=='=')zoomStep(1);else if(k=='-'||k=='_')zoomStep(-1);else if(k=='0')zoomReset();else return false;return true}
function updZoom(){const pc=Math.round(view.z*100)+'%';document.querySelectorAll('[data-act=zoomlvl] .t').forEach(e=>e.textContent=pc);
 document.querySelectorAll('[data-act=zoomout]').forEach(b=>b.disabled=view.z<=ZMIN+1e-6);document.querySelectorAll('[data-act=zoomin]').forEach(b=>b.disabled=view.z>=ZMAX-1e-6)}
// trackpad pinch arrives as a wheel event with ctrlKey set (Chrome, Edge, Firefox); two-finger scroll pans once the view is zoomed or moved (at the default view it scrolls the page)
cv.addEventListener('wheel',ev=>{const m=ev.deltaMode==1?16:1;
 if(ev.ctrlKey||ev.metaKey){ev.preventDefault();zoomAbout(view.z*Math.exp(-Math.max(-50,Math.min(50,ev.deltaY*m))*.012),...fracOf(ev.clientX,ev.clientY))}
 else if(!atHome()){ev.preventDefault();panPx(ev.deltaX*m,ev.deltaY*m)}},{passive:false});
// Safari reports trackpad pinch as gesture events
let gz=1;cv.addEventListener('gesturestart',ev=>{ev.preventDefault();gz=view.z});cv.addEventListener('gesturechange',ev=>{ev.preventDefault();zoomAbout(gz*ev.scale,...fracOf(ev.clientX,ev.clientY))});cv.addEventListener('gestureend',ev=>ev.preventDefault());
// touch pinch (two pointers), middle-button drag and Space + drag pan. Registered before the tool handlers so they can claim the event.
const tps=new Map();let pinch=null,panD=null,spaceDown=false;
const curs=()=>{cv.style.cursor=panD?'grabbing':spaceDown?'grab':tool=='move'?'default':'crosshair'};
const pinchMid=()=>{const[a,b]=[...tps.values()];return{x:(a.x+b.x)/2,y:(a.y+b.y)/2,d:Math.hypot(a.x-b.x,a.y-b.y)||1}};
// touch: a long press (finger held still) opens the context menu, the touch equivalent of a right-click
let lpT=null,lpS=null,lpAt=0;const lpCancel=()=>{clearTimeout(lpT);lpT=null};
function cancelGesture(){lpCancel();drag=null;panD=null;TR=null;S.prev=null;S.snapPt=null;S.snapLbl='';S.pl=null;draw()} // drop whatever the finger was doing
cv.addEventListener('pointerdown',ev=>{
 if(ev.pointerType=='touch'){tps.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
  if(tps.size==1){lpCancel();lpS={x:ev.clientX,y:ev.clientY};lpT=setTimeout(()=>{lpT=null;if(tps.size==1)cv.oncontextmenu({clientX:lpS.x,clientY:lpS.y,touch:true,preventDefault(){}})},500)}
  if(tps.size==2){lpCancel();drag=null;panD=null;S.prev=null;S.snapPt=null;S.pl=null;const m=pinchMid(),[fx,fy]=fracOf(m.x,m.y);pinch={z0:view.z,d0:m.d,wx:view.x0+fx*W/view.z,wy:view.y0-fy*H/view.z};draw();ev.stopImmediatePropagation();return}
  if(tps.size>2){ev.stopImmediatePropagation();return}}
 if(ev.button==1||(ev.button==0&&spaceDown)){ev.preventDefault();panD={x:ev.clientX,y:ev.clientY};cv.setPointerCapture(ev.pointerId);curs();ev.stopImmediatePropagation()}});
cv.addEventListener('pointermove',ev=>{if(tps.has(ev.pointerId))tps.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
 if(lpT&&Math.hypot(ev.clientX-lpS.x,ev.clientY-lpS.y)>10)lpCancel();
 if(pinch&&tps.size>=2){const m=pinchMid(),[fx,fy]=fracOf(m.x,m.y);setView(pinch.z0*m.d/pinch.d0,fx,fy,pinch.wx,pinch.wy);ev.stopImmediatePropagation();return}
 if(panD){panPx(panD.x-ev.clientX,panD.y-ev.clientY);panD={x:ev.clientX,y:ev.clientY};ev.stopImmediatePropagation()}});
const endPtr=ev=>{lpCancel();tps.delete(ev.pointerId);if(tps.size<2)pinch=null;if(panD){panD=null;curs();ev.stopImmediatePropagation()}};
cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',endPtr);
addEventListener('keydown',e=>{if(e.code=='Space'&&!/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName)&&$('mdl').style.display!='flex'){spaceDown=true;curs();e.preventDefault()}});
addEventListener('keyup',e=>{if(e.code=='Space'){spaceDown=false;curs()}});addEventListener('blur',()=>{spaceDown=false;curs()});
const ptTool=()=>(tool=='line'||tool=='cons'||(tool=='mark'&&practice&&practice.task=='image'))&&!par;
function placePt(q){ // q is an already snapped point: start/finish a line, or place the answer marker
 if(tool=='mark'){practice.ans=q;S.pl=null}
 else{if(!LP)LP=q;else{if(Math.hypot(q.x-LP.x,q.y-LP.y)>1e-6)S.lines.push({id:uid++,a:LP,b:q,vis:true,k:tool=='cons'?'cons':'bold'});LP=null}S.pl=q}
 panel();draw()}
cv.onpointerdown=ev=>{if(ev.button!==0)return;const p=wp(ev);let best=null,bd=1e9;
 // touch: the finger hides the point, so press, slide to the snap you want (shown live) and place it on release
 if(ev.pointerType=='touch'&&ptTool()){drag={k:'tp'};cv.setPointerCapture(ev.pointerId);S.pl=snapAt(p,tool=='mark'?null:LP);draw();return}
 if((tool=='line'||tool=='cons')&&!par){placePt(snapAt(p,LP));return}
 if(tool=='mark'){if(ptTool())placePt(snapAt(p));return}
 if(par){const q=parPt(p);addRay(-1,{k:'dir',ref:par,x:q.x,y:q.y});par=null;S.prev=null;S.snapPt=null;panel();draw();return}
 if(tool=='trace'){let src=-1;S.objs.forEach((q,i)=>{const d=Math.hypot(q.x-p.x,q.y-p.y);if(d<bd){bd=d;src=i}});TR={src,y0:sn(p.y),p0:p};drag={k:'T'};cv.setPointerCapture(ev.pointerId);return}
 (S.hnd||[]).forEach(h=>{const d=Math.hypot(h.x-p.x,h.y-p.y);if(d<tol(.6)&&d<bd){bd=d;best=h}});
 if(best){drag=best}else if(!practice)S.els.forEach((e,i)=>{if(Math.abs(e.x-e.f-p.x)<tol(.4)&&Math.abs(p.y)<tol(.8)&&!best)best=drag={k:'F',i};else if(Math.abs(e.x-p.x)<tol(.35)&&!best)best=drag={k:'E',i}});
 if(best){drag=best;dragN++;cv.setPointerCapture(ev.pointerId)}
 else if(ev.pointerType=='touch'&&tool=='move'){panD={x:ev.clientX,y:ev.clientY};cv.setPointerCapture(ev.pointerId)}}; // one finger on empty space pans
cv.onpointermove=ev=>{if(drag&&drag.k=='tp'){S.pl=snapAt(wp(ev),tool=='mark'?null:LP);draw();return}
 if(!drag){if((tool=='line'||tool=='cons'||tool=='mark')&&!par){S.snapPt=null;S.snapLbl='';S.pl=snapAt(wp(ev),tool=='mark'?null:LP);draw();return}if(par){S.snapPt=null;const q=parPt(wp(ev));S.prev={id:-1,src:-1,aim:{k:'dir',ref:par,x:q.x,y:q.y},y0:0,vis:true};draw()}return}const p=wp(ev),e=S.els[drag.i],r=S.rays.find(q=>q.id==drag.id);
 if(drag.k=='lp'){const l=S.lines.find(q=>q.id==drag.id);if(l){const q=snapAt(p,drag.end=='a'?l.b:l.a,l.id);l[drag.end]={x:q.x,y:q.y}}draw();return}
 if(drag.k=='ans'){practice.ans=snapAt(p);draw();return}
 if(drag.k=='T'){S.snapPt=null;const aim=aimFrom(p,TR.src);S.prev=aim?{id:-1,src:TR.src,aim,y0:TR.y0,vis:true}:null;draw();return}
 if(drag.k=='ra'&&r){r.aim.x=sn(p.x);r.aim.y=sn(p.y)}
 if(drag.k=='obj'){const o=S.objs[drag.i];o.x=sn(clx(p.x));o.y=sn(Math.max(-6.5,Math.min(6.5,p.y)))}
 else if(drag.k=='E')e.x=sn(clx(p.x));
 else if(drag.k=='F'){const f=e.x-sn(p.x);if(Math.abs(f)>.2)e.f=f}
 else if(drag.k=='rh'&&r)r.aim.h=sn(Math.max(-6.5,Math.min(6.5,p.y)));
 else if(drag.k=='rs'&&r){const E0=srt()[0],h=r.aim.h,sl=(h-p.y)/(E0.x-.25);r.y0=p.y-sl*.25}
 draw()};
cv.onpointerup=ev=>{if(!drag)return;if(drag.k=='tp'){drag=null;const q=S.pl||snapAt(wp(ev),tool=='mark'?null:LP);if(tool!='mark')S.snapPt=null;placePt(q);return}if(drag.k=='T'){const p=wp(ev);if(S.prev&&Math.hypot(p.x-TR.p0.x,p.y-TR.p0.y)>tol(.3)){const r=addRay(S.prev.src,S.prev.aim);r.y0=TR.y0}S.prev=null;S.snapPt=null}drag=null;panel();draw()};
