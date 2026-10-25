// Construction lines and snapping
// ---- construction lines, snapping, practice mode
const delLine=l=>{S.lines=S.lines.filter(q=>q!==l)};
function lineMenu(id){const l=S.lines.find(q=>q.id==id);if(!l)return null;const n=S.lines.indexOf(l)+1;return[{l:(l.k=='bold'?'Bold line ':'Construction line ')+n,h:1},{l:l.k=='bold'?'Make construction (dotted)':'Make bold',f:()=>{l.k=l.k=='bold'?'cons':'bold'}},{l:'Colour',h:1},{sws:LINE_COLORS,cur:l.c||LC,f:c=>{if(c==LC)delete l.c;else l.c=c}},{sep:1},{l:l.vis?'Hide line':'Show line',f:()=>{l.vis=!l.vis}},{l:'Remove line',f:()=>delLine(l)}]}
function sInter(a,b){const r=[a[2]-a[0],a[3]-a[1]],q=[b[2]-b[0],b[3]-b[1]],d=r[0]*q[1]-r[1]*q[0];if(Math.abs(d)<1e-9)return null;const t=((b[0]-a[0])*q[1]-(b[1]-a[1])*q[0])/d,u=((b[0]-a[0])*r[1]-(b[1]-a[1])*r[0])/d;return t>=0&&t<=1&&u>=0&&u<=1?{x:a[0]+t*r[0],y:a[1]+t*r[1]}:null}
const rnd4=v=>Math.round(v*1e4)/1e4;
const rayVis=r=>r.vis&&$('vall').checked&&(!practice||practice.revealed||(practice.task=='ray'&&r.id==practice.rid)); // rays the student can see (in practice: only the given ray until the solution is shown)
function specialPts(skip){const a=[];S.els.forEach(e=>(e.t=='L'?['O','F','Fp']:['O','F','C']).forEach(k=>a.push({...ptOf(e,k),lbl:ptName(e,k)})));
 S.objs.forEach((o,i)=>{a.push({x:o.x,y:o.y,lbl:(o.ext?'B':'A')+onm(i)});if(o.ext)a.push({x:o.x,y:0,lbl:'A'+onm(i)})});
 S.rays.forEach(r=>{if(!rayVis(r))return;const tr=trace(r);if(!tr)return;tr.T.pts.forEach((q,i)=>{if(practice&&!practice.revealed&&i>0)return;const e=S.els.find(c=>Math.abs(c.x-q.x)<1e-6);a.push({x:q.x,y:q.y,lbl:'ray hits '+(e&&e.t=='M'?'mirror':'lens')})})});
 S.lines.forEach(l=>{if(l.id!=skip&&l.vis)a.push({...l.a,lbl:'line end'},{...l.b,lbl:'line end'})});return a}
let symG=null,shiftDown=false;
addEventListener('keydown',e=>{if(e.key=='Shift')shiftDown=true});addEventListener('keyup',e=>{if(e.key=='Shift')shiftDown=false});addEventListener('blur',()=>{shiftDown=false});
// symmetry snap (mirrors only): starting at a mirror vertex, snap to the reflection about the axis of any visible line through that vertex
function symSnap(p,from,skip){symG=null;if(!$('snapSym').checked||shiftDown||Math.abs(from.y)>1e-6||!S.els.some(e=>e.t=='M'&&Math.abs(e.x-from.x)<1e-6))return null;
 let best=null,bd=tol(.25);
 S.lines.forEach((l,i)=>{if(l.id==skip||!l.vis)return;const dx=l.b.x-l.a.x,dy=l.b.y-l.a.y,n=Math.hypot(dx,dy);if(n<1e-6||Math.abs(dy)<1e-6)return;
  if(Math.abs((from.x-l.a.x)*dy-(from.y-l.a.y)*dx)/n>tol(.1))return;if(l.k=='bold'&&dseg(from,[l.a.x,l.a.y,l.b.x,l.b.y])>tol(.15))return;
  const ux=dx/n,uy=-dy/n,vx=p.x-from.x,vy=p.y-from.y,t=vx*ux+vy*uy,d=Math.abs(vx*uy-vy*ux);
  if(d<bd){bd=d;const far=Math.hypot(l.a.x-from.x,l.a.y-from.y)>Math.hypot(l.b.x-from.x,l.b.y-from.y)?l.a:l.b;
   best={x:from.x+t*ux,y:from.y+t*uy,lbl:'mirror image of line '+(i+1),g:{x:from.x,y:from.y,wx:far.x-from.x,wy:far.y-from.y}}}});
 if(best)symG=best.g;return best}
// element-plane snap: an endpoint dragged close to a lens/mirror lands exactly on it, sliding along the line being drawn so its direction is kept.
// Point snaps (F, O, intersections...) keep priority; direction snaps and plain grid snap are completed by it.
function snapAt(p,from,skip){const r=snapBase(p,from,skip),lbl=S.snapLbl;if(lbl&&!/^(parallel|through|mirror image)/.test(lbl))return r;
 let best=null,bd=tol(.3);const PH=H/2+.5;
 S.els.forEach(e=>{const d=Math.abs(r.x-e.x);if(d>=bd)return;if(from&&Math.abs(from.x-e.x)<1e-6)return;
  let y=r.y;if(from){const dx=r.x-from.x;if(Math.abs(dx)<1e-6)return;y=from.y+(r.y-from.y)*(e.x-from.x)/dx}
  if(Math.abs(y)>PH)return;bd=d;best={x:e.x,y:rnd4(y),e}});
 if(!best)return r;
 S.snapPt={x:best.x,y:best.y};S.snapLbl=(lbl?lbl+', ':'')+'on '+(best.e.t=='M'?'mirror':'lens')+(S.els.length>1?' '+(S.els.indexOf(best.e)+1):'');
 return{x:best.x,y:best.y}}
function snapBase(p,from,skip){S.snapPt=null;S.snapLbl='';symG=null;const pts=specialPts(skip),L=S.lines.filter(l=>l.id!=skip&&l.vis).map(l=>{const dx=l.b.x-l.a.x,dy=l.b.y-l.a.y,n=Math.hypot(dx,dy)||1;if(l.k=='bold')return[l.a.x,l.a.y,l.b.x,l.b.y];return[l.a.x-dx/n*FAR,l.a.y-dy/n*FAR,l.b.x+dx/n*FAR,l.b.y+dy/n*FAR]});
 const sg=L.slice();(S.segs||[]).forEach(g=>g.a.forEach(a=>sg.push(a)));const PH=H/2+.5,pl=S.els.map(e=>[e.x,-PH,e.x,PH]);pl.push([-FAR,0,FAR,0]);{const P=ppOn()&&principalPlanes();if(P)pl.push([P.H,-PH,P.H,PH,'principal plane H'],[P.Hp,-PH,P.Hp,PH,'principal plane H\u2032'])}S.els.forEach(e=>{pl.push([e.x-e.f,-PH,e.x-e.f,PH,'focal plane F'+(S.els.length>1?S.els.indexOf(e)+1:'')]);if(e.t=='L')pl.push([e.x+e.f,-PH,e.x+e.f,PH,'focal plane F\u2032'+(S.els.length>1?S.els.indexOf(e)+1:'')])});const cand=pts.slice();
 for(let i=0;i<L.length;i++){for(let j=i+1;j<sg.length;j++){const k=sInter(L[i],sg[j]);if(k)cand.push({...k,lbl:'intersection'})}pl.forEach(q=>{const k=sInter(L[i],q);if(k)cand.push({...k,lbl:q[4]||'intersection'})})}
 let best=null,bd=tol(.5);cand.forEach(c=>{const d=Math.hypot(c.x-p.x,c.y-p.y);if(d<bd){bd=d;best=c}});
 if(best){S.snapPt={x:best.x,y:best.y};S.snapLbl=best.lbl;return{x:rnd4(best.x),y:rnd4(best.y)}}
 if(from){const sy=symSnap(p,from,skip);if(sy){S.snapPt={x:sy.x,y:sy.y};S.snapLbl=sy.lbl;return{x:rnd4(sy.x),y:rnd4(sy.y)}}
  const dirs=[{dx:1,dy:0,lbl:'parallel to axis'}];pts.forEach(q=>{if(Math.hypot(q.x-from.x,q.y-from.y)>1e-6&&q.lbl!='line end')dirs.push({dx:q.x-from.x,dy:q.y-from.y,lbl:'through '+q.lbl})});
  S.lines.forEach((l,i)=>{if(l.id!=skip&&l.vis)dirs.push({dx:l.b.x-l.a.x,dy:l.b.y-l.a.y,lbl:'parallel to line '+(i+1)})});
  S.rays.forEach((r,i)=>{if(!rayVis(r))return;const L=lineOf(r);if(L)dirs.push({dx:1,dy:L.s,lbl:practice&&!practice.revealed?'parallel to incident ray':'parallel to ray '+(i+1)})});
  let bb=null,b2=tol(.25);dirs.forEach(d=>{const n=Math.hypot(d.dx,d.dy);if(n<1e-9)return;const ux=d.dx/n,uy=d.dy/n,vx=p.x-from.x,vy=p.y-from.y,t=vx*ux+vy*uy,dist=Math.abs(vx*uy-vy*ux);if(dist<b2){b2=dist;bb={x:from.x+t*ux,y:from.y+t*uy,lbl:d.lbl}}});
  if(bb){S.snapPt={x:bb.x,y:bb.y};S.snapLbl=bb.lbl;return{x:rnd4(bb.x),y:rnd4(bb.y)}}}
 return{x:sn(p.x),y:sn(p.y)}}
function drawExtras(hnd,E,ax){
 S.lines.forEach((l,i)=>{if(!l.vis)return;const dx=l.b.x-l.a.x,dy=l.b.y-l.a.y,n=Math.hypot(dx,dy)||1,ux=dx/n,uy=dy/n;
  const lc=l.c||LC;
  if(l.k=='bold')ln(l.a.x,l.a.y,l.b.x,l.b.y,lc,3.2);else{cx.globalAlpha=.9;ln(l.a.x-ux*FAR,l.a.y-uy*FAR,l.b.x+ux*FAR,l.b.y+uy*FAR,lc,2.1,[1.6,5]);cx.globalAlpha=1}
  [l.a,l.b].forEach(q=>{cx.beginPath();cx.fillStyle=lc;cx.arc(X(q.x),Y(q.y),3.5*dpr,0,7);cx.fill()});txo(String(i+1),(l.a.x+l.b.x)/2,(l.a.y+l.b.y)/2,.1,.4,lc,13);
  hnd.push({k:'lp',id:l.id,end:'a',x:l.a.x,y:l.a.y},{k:'lp',id:l.id,end:'b',x:l.b.x,y:l.b.y})});
 if(!exporting&&(tool=='line'||tool=='cons')&&LP){if(S.pl){const dx=S.pl.x-LP.x,dy=S.pl.y-LP.y,n=Math.hypot(dx,dy);if(n>1e-6){const ux=dx/n,uy=dy/n;if(tool=='cons'){cx.globalAlpha=.7;ln(LP.x-ux*FAR,LP.y-uy*FAR,S.pl.x+ux*FAR,S.pl.y+uy*FAR,LC,2.1,[1.6,5]);cx.globalAlpha=1}else{cx.globalAlpha=.7;ln(LP.x,LP.y,S.pl.x,S.pl.y,LC,3.2);cx.globalAlpha=1}}}
  cx.beginPath();cx.fillStyle=LC;cx.arc(X(LP.x),Y(LP.y),4.5*dpr,0,7);cx.fill()}
 if(practice&&!practice.revealed&&practice.hint>=2){
  if(practice.task=='image')principalList(0).slice(0,practice.hint>=3?9:1).forEach(r=>{const tr=trace(r);if(tr){cx.globalAlpha=.4;drawTrace(tr,'#e08a00',[5,3],null,aimTarget(r));cx.globalAlpha=1}});
  else{const r=S.rays.find(q=>q.id==practice.rid);if(r&&srt()[0]){cx.globalAlpha=.45;E.forEach(e=>{ln(e.x-e.f,-6.5,e.x-e.f,6.5,ax,1,[2,4]);if(e.t=='L')ln(e.x+e.f,-6.5,e.x+e.f,6.5,ax,1,[2,4])});
   const tg=trace({id:-200,src:-1,aim:{k:'guide',ref:r.id},y0:0});if(tg)drawTrace(tg,COL.guide,[6,4],null);
   if(practice.hint>=3){const tr=trace(r);if(tr){const f=tr.T,p0=f.pts[0],d=f.pts.length>1?{x:f.pts[1].x-p0.x,y:f.pts[1].y-p0.y}:{x:f.fin.dx,y:f.fin.dy},n=Math.hypot(d.x,d.y);ln(p0.x-d.x/n*30,p0.y-d.y/n*30,p0.x+d.x/n*30,p0.y+d.y/n*30,'#e08a00',1.6,[5,3])}}cx.globalAlpha=1}}}
 if(practice&&practice.ans){const a=practice.ans,u=9*dpr;cx.beginPath();cx.strokeStyle='#e08a00';cx.fillStyle='rgba(224,138,0,.25)';cx.lineWidth=2*dpr;cx.moveTo(X(a.x),Y(a.y)-u);cx.lineTo(X(a.x)+u,Y(a.y));cx.lineTo(X(a.x),Y(a.y)+u);cx.lineTo(X(a.x)-u,Y(a.y));cx.closePath();cx.fill();cx.stroke();txo('answer',a.x,a.y,.3,.55,'#e08a00',14);hnd.push({k:'ans',x:a.x,y:a.y})}}
