// Canvas drawing
// ---- drawing
let sc=1,dpr=1;const X=x=>(x-view.x0)*sc,Y=y=>(view.y0-y)*sc;
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function clipSeg(x1,y1,x2,y2){const m=20/view.z,xa=view.x0-m,xb=view.x0+W/view.z+m,yb=view.y0+m,ya=view.y0-H/view.z-m,dx=x2-x1,dy=y2-y1;let t0=0,t1=1;
 for(const[p,q]of[[-dx,x1-xa],[dx,xb-x1],[-dy,y1-ya],[dy,yb-y1]]){if(p==0){if(q<0)return null}else{const r=q/p;if(p<0){if(r>t1)return null;if(r>t0)t0=r}else{if(r<t0)return null;if(r<t1)t1=r}}}return[t0,t1]}
function ln(x1,y1,x2,y2,c,w,d){const k=clipSeg(x1,y1,x2,y2);if(!k)return;const dx=x2-x1,dy=y2-y1;cx.beginPath();cx.strokeStyle=c;cx.lineWidth=w*dpr;cx.setLineDash(d?d.map(v=>v*dpr):[]);cx.lineDashOffset=k[0]*Math.hypot(dx,dy)*sc;
 cx.moveTo(X(x1+dx*k[0]),Y(y1+dy*k[0]));cx.lineTo(X(x1+dx*k[1]),Y(y1+dy*k[1]));cx.stroke();cx.setLineDash([]);cx.lineDashOffset=0}
function tx(s,x,y,c,sz){cx.fillStyle=c;cx.font=`${(sz||15)*dpr}px system-ui`;cx.fillText(s,X(x),Y(y))}
function txo(s,x,y,dx,dy,c,sz){tx(s,x+dx/view.z,y+dy/view.z,c,sz)} // label at anchor + offset (offset in zoom-1 world units)
function cross(x,y,c,lab,dx,dy){const a=.25/view.z;ln(x-a,y,x+a,y,c,2);ln(x,y-a,x,y+a,c,2);if(lab)txo(lab,x,y,dx??-.15,dy??-.6,c,17)}
function arrow(x,y1,y2,c,lab,d){ln(x,y1,x,y2,c,2.5,d);const s=y2>=y1?1:-1,z=view.z;ln(x,y2,x-.15/z,y2-s*.3/z,c,2.5);ln(x,y2,x+.15/z,y2-s*.3/z,c,2.5);if(lab)txo(lab,x,y2,-.5,s>0?.3:-.5,c,16)}
function aimTarget(r){const a=r.aim;if(a.k=='pt'){const e=elById(a.el);return e?ptOf(e,a.p):null}return a.k=='at'||a.k=='dir'?{x:a.x,y:a.y}:null}
function incSeg(L,e0,h){const P=L.free?{x:-FAR,y:L.P.y+L.s*(-FAR-L.P.x)}:L.P;return P.x<e0.x?[P.x,P.y,e0.x,h]:[-FAR,h-L.s*(e0.x+FAR),e0.x,h]} // incident part of a ray
function drawTrace(tr,col,dash,img,tgt){const{L,T,h}=tr,e0=srt()[0],p=T.pts,f=T.fin;
 const faint=(x1,y1,x2,y2)=>{cx.globalAlpha=.3;ln(x1,y1,x2,y2,col,1.4,[5,4]);cx.globalAlpha=1};
 const I=incSeg(L,e0,h);
 if(L.free||L.P.x<e0.x)ln(...I,col,1.6,dash);
 else{ln(...I,col,1.6,dash);if(!L.guide){ln(e0.x,h,L.P.x,L.P.y,col,1.4,[2,3]);faint(L.P.x,L.P.y,FAR,L.P.y+L.s*(FAR-L.P.x))}}
 for(let i=0;i<p.length-1;i++)ln(p[i].x,p[i].y,p[i+1].x,p[i+1].y,col,1.6,dash);
 const te=f.dx>0?FAR-f.x:f.x+FAR;ln(f.x,f.y,f.x+f.dx*te,f.y+f.dy*te,col,1.6,dash);
 if(tgt&&!L.guide&&tgt.x>e0.x+1e-6)faint(e0.x,h,tgt.x,h+L.s*(tgt.x-e0.x)); // intended path to the aim point
 // virtual extension: dashed back to the image (or axis crossing), faint beyond it
 const und=p.length==1&&Math.abs(f.dy-L.s)<1e-9&&f.dx>0;
 if(!und&&!L.guide){const tE=f.dx>0?-FAR-f.x:-(FAR-f.x),pt=t=>[f.x+f.dx*t,f.y+f.dy*t];let tm=null;
  if(img&&(img.x-f.x)/f.dx<0)tm=(img.x-f.x)/f.dx;else if(Math.abs(f.dy)>1e-9&&-f.y/f.dy<-1e-9)tm=-f.y/f.dy;
  if(tm!=null){tm=Math.max(tm,tE);const a=pt(tm);ln(f.x,f.y,a[0],a[1],col,1.4,[5,4]);if(tm>tE){const b=pt(tE);faint(a[0],a[1],b[0],b[1])}}}}
function raySegs(tr){const{L,T,h}=tr,e0=srt()[0],p=T.pts,a=[];a.push(incSeg(L,e0,h));
 for(let i=0;i<p.length-1;i++)a.push([p[i].x,p[i].y,p[i+1].x,p[i+1].y]);const f=T.fin,te=f.dx>0?FAR-f.x:f.x+FAR;a.push([f.x,f.y,f.x+f.dx*te,f.y+f.dy*te]);return a}
function dseg(p,s){const dx=s[2]-s[0],dy=s[3]-s[1],l=dx*dx+dy*dy||1e-9;let t=((p.x-s[0])*dx+(p.y-s[1])*dy)/l;t=Math.max(0,Math.min(1,t));return Math.hypot(p.x-s[0]-t*dx,p.y-s[1]-t*dy)}
function draw(){const w=cv.clientWidth;dpr=forceW?forceW/w:(devicePixelRatio||1);cv.width=w*dpr;cv.height=w*dpr*H/W;sc=cv.width/W*view.z;
 const vx0=view.x0,vx1=view.x0+W/view.z,vy1=view.y0,vy0=view.y0-H/view.z; // visible world range
 const fg=css('--fg'),ax=css('--axis'),img=css('--img'),E=srt();
 S.segs=[];cx.clearRect(0,0,cv.width,cv.height);
 if(pref.grid){const gc=css('--grid'),ppu=sc/dpr,base=[1,2,5,10,20,50,100,200,500,1000].find(v=>v*ppu>=22)||1000; // base spacing grows as you zoom out, so lines never crowd
  for(const[st,al,zm]of[[base,1,0],[.5,.6,2.5],[.25,.45,5]]){if(view.z<zm)continue;cx.globalAlpha=al;const minor=v=>st<1&&v%(st*2)===0;
   for(let i=Math.ceil(vx0/st-1e-9);i*st<=vx1+1e-9;i++)if(!minor(i*st))ln(i*st,vy0,i*st,vy1,gc,1);
   for(let j=Math.ceil(vy0/st-1e-9);j*st<=vy1+1e-9;j++)if(!minor(j*st))ln(vx0,j*st,vx1,j*st,gc,1)}cx.globalAlpha=1}
 ln(vx0,0,vx1,0,ax,1.5,[8,6]);
 if($('fp').checked)E.forEach(e=>{ln(e.x-e.f,-6.5,e.x-e.f,6.5,ax,1,[2,4]);if(e.t=='L')ln(e.x+e.f,-6.5,e.x+e.f,6.5,ax,1,[2,4])});
 E.forEach(e=>{const n=nm(e);
  if(e.t=='L'){ln(e.x,-6.5,e.x,6.5,fg,3);const s=e.f>0?1:-1;for(const y of[6.5,-6.5]){const d=y>0?-1:1;ln(e.x,y,e.x-.2,y+d*.45*s,fg,3);ln(e.x,y,e.x+.2,y+d*.45*s,fg,3)}
   cross(e.x,0,fg);txo('O'+n,e.x,0,.2,-.6,fg,17);cross(e.x-e.f,0,fg,'F'+n,-.2,-.6);cross(e.x+e.f,0,fg,"F′"+n,-.2,-.6)}
  else{const b=e.f>0?-1:1;cx.beginPath();cx.strokeStyle=fg;cx.lineWidth=4*dpr;cx.moveTo(X(e.x+b),Y(6.5));cx.lineTo(X(e.x),Y(4.5));cx.lineTo(X(e.x),Y(-4.5));cx.lineTo(X(e.x+b),Y(-6.5));cx.stroke();
   for(let k=0;k<3;k++)ln(e.x,3.6+k*.4,e.x+.45,4.05+k*.4,fg,1.5);
   cross(e.x,0,fg);txo('S'+n,e.x,0,-.7,-.6,fg,17);cross(e.x-e.f,0,fg,'F'+n,-.2,-.6);cross(e.x-2*e.f,0,fg,'C'+n,-.2,-.6)}});
 const imgs=S.objs.map((_,i)=>imageOf(i));
 if($('vall').checked)S.rays.forEach(r=>{if(!r.vis)return;const tr=trace(r);if(!tr)return;if(practice&&!practice.revealed){if(practice.task=='ray'&&r.id==practice.rid){const L=tr.L,e0=srt()[0],a=incSeg(L,e0,tr.h);ln(a[0],a[1],a[2],a[3],OC,2.2);S.segs.push({id:r.id,a:[a]})}return}drawTrace(tr,rayCol(r),r.aim.k=='guide'?[6,4]:null,r.src>=0?imgs[r.src].pt:null,aimTarget(r));S.segs.push({id:r.id,a:raySegs(tr)})});
 let info='';const hnd=[];drawExtras(hnd,E,ax);
 S.objs.forEach((o,i)=>{const n=onm(i);
  if(o.ext){arrow(o.x,0,o.y,OC);txo('A'+n,o.x,0,-.5,-.7,OC,17);txo('B'+n,o.x,o.y,-.5,.3,OC,17)}else cross(o.x,o.y,OC,'A'+n,-.15,-.7);
  if(!practice)hnd.push({k:'obj',i,x:o.x,y:o.y});
  const im=imgs[i];
  if(im.pt&&!(practice&&!practice.revealed)){const p=im.pt,f=im.R[0].tr.T.fin,real=(p.x-f.x)*f.dx>0;
   if($('pl').checked){ln(o.x,-6.5,o.x,6.5,ax,1,[4,4]);txo('P'+n,o.x,-6.2,.1,0,ax,15);ln(p.x,-6.5,p.x,6.5,ax,1,[4,4]);txo("P′"+n,p.x,-6.2,.1,0,ax,15)}
   if(o.ext){arrow(p.x,0,p.y,img,'B′'+n,real?0:[5,4]);txo('A′'+n,p.x,0,-.5,p.y>0?-.7:.3,img,17)}else cross(p.x,p.y,img,'A′'+n,-.15,-.7);
   info+=`Image of ${o.ext?'B':'A'}${n}: x = ${p.x.toFixed(2)}, y = ${p.y.toFixed(2)} (${real?'real':'virtual'})`+(o.ext&&Math.abs(o.y)>1e-6?`, magnification ${(p.y/o.y).toFixed(2)} (${p.y*o.y<0?'inverted':'upright'})`:'')+'\n'}
  else info+=`Object ${o.ext?'AB':'A'}${n}: need at least two non-parallel rays to locate its image.\n`});
 const e0=E[0];
 S.rays.forEach(r=>{if(practice||!r.vis||!e0||r.aim.k=='guide'||!$('vall').checked)return;const L=lineOf(r);if(!L)return;
  if(r.aim.k=='at'||r.aim.k=='dir')hnd.push({k:'ra',id:r.id,x:r.aim.x,y:r.aim.y});
  if(r.aim.k=='hit')hnd.push({k:'rh',id:r.id,x:e0.x,y:L.P.y+L.s*(e0.x-L.P.x)});
  if(r.src<0)hnd.push({k:'rs',id:r.id,x:.25,y:L.P.y+L.s*.25})});
 if(!exporting&&S.prev&&$('vall').checked){const tr=trace(S.prev);if(tr)drawTrace(tr,'#e08a00',[5,3],null,aimTarget(S.prev))}
 if(!exporting&&S.snapPt){cx.beginPath();cx.strokeStyle='#e08a00';cx.lineWidth=2*dpr;cx.arc(X(S.snapPt.x),Y(S.snapPt.y),11*dpr,0,7);cx.stroke();if(S.snapLbl)txo(S.snapLbl,S.snapPt.x,S.snapPt.y,.35,.5,'#e08a00',14);
  if(symG&&S.snapLbl.startsWith('mirror image')){const a0=symG.wx>=0?0:Math.PI,th=Math.atan2(symG.wy,symG.wx),nm=v=>{while(v>Math.PI)v-=2*Math.PI;while(v<=-Math.PI)v+=2*Math.PI;return v};
   cx.save();cx.strokeStyle='#e08a00';cx.lineWidth=1.5*dpr;cx.setLineDash([]);[th,-th].forEach(t=>{const d=nm(t-a0);cx.beginPath();cx.arc(X(symG.x),Y(symG.y),34*dpr,-a0,-(a0+d),d>0);cx.stroke()});
   cx.restore()}}
 S.hnd=hnd;if(!exporting)hnd.forEach(h=>{cx.beginPath();cx.fillStyle=img;cx.globalAlpha=.35;cx.arc(X(h.x),Y(h.y),9*dpr,0,7);cx.fill();cx.globalAlpha=1});
 $('out').style.whiteSpace='pre-line';$('out').textContent=practice&&!practice.revealed?practiceMsg():par?'Parallel-ray mode: move to place the new ray (it keeps the direction of the chosen ray) and click to confirm. It snaps to O, S, F, F′, C and grid points. Esc cancels.':info||(S.rays.length?(S.rays.some(r=>r.aim.k=='guide')?'The emerging ray passes through the point where the guideline (through the centre, parallel to the incident ray) meets the focal plane.':'Rays traced.'):'Empty scene: drag a lens, mirror or object onto the canvas, then use the Trace ray tool.');commit();updTitle();updZoom()}
