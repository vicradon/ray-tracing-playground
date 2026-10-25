// Presets, scene loading and the paraxial ray tracer
const P={
"Single a) converging lens":{o:[[1,4,0]],e:[['L',9,4]]},
"Single b) diverging lens":{o:[[2,4,0]],e:[['L',9,-4]]},
"Single c) concave mirror":{o:[[4,3,0]],e:[['M',11,4]]},
"Single d) convex mirror":{o:[[2,3,0]],e:[['M',9,-4]]},
"Single e) diverging lens (F' at 6)":{o:[[2,4,0]],e:[['L',9,-3]]},
"Single f) virtual object, diverging lens":{o:[[17,0,0]],e:[['L',9,-4]]},
"Ray a) converging lens":{free:[6.3,5],e:[['L',9,4]]},
"Ray b) diverging lens":{free:[5.2,3.4],e:[['L',9,-4]]},
"Ray c) concave mirror":{free:[5.2,3.4],e:[['M',9,4]]},
"Ray d) convex mirror":{free:[5.2,3.4],e:[['M',9,-4]]},
"Ray e) concave mirror":{free:[0,4.45],e:[['M',9,4]]},
"Ray f) convex mirror":{free:[5.2,1.64],e:[['M',9,-4]]},
"System a) two lenses":{o:[[1,3,1]],e:[['L',4,3],['L',14,3]]},
"System b) two lenses":{o:[[2,3,1]],e:[['L',5,4],['L',11,4]]},
"System c) lens + diverging lens":{o:[[3,3,1]],e:[['L',6,4],['L',12,-4]]},
"System d) two diverging lenses":{o:[[2,3,1]],e:[['L',8,-7],['L',13,-6]]},
"System e) lens + concave mirror":{o:[[15,3,1]],e:[['L',6,6],['M',17,4]]},
"System f) lens + convex mirror":{o:[[1,3,1]],e:[['L',9,5],['M',12,-3]]},
"Empty sandbox":{o:[],e:[]}};
const pre=$('pre');Object.keys(P).forEach(k=>pre.add(new Option(k,k)));
const srt=()=>S.els.slice().sort((a,b)=>a.x-b.x),elById=id=>S.els.find(e=>e.id==id);
function load(k){if(mode!='sandbox')switchMode('sandbox');const p=P[k];Object.assign(view,HOME);LP=null;curId=null;curName=null;savedJ=null;uid=1;S={els:(p.e||[]).map(a=>({id:uid++,t:a[0],x:a[1],f:a[2]})),objs:(p.o||[]).map(a=>({x:a[0],y:a[1],ext:!!a[2]})),rays:[],lines:[]};
 S.objs.forEach((_,i)=>principal(i));
 if(p.free){const r=addRay(-1,{k:'hit',h:p.free[1]});r.y0=p.free[0];addRay(-1,{k:'guide',ref:r.id})}
 $('fp').checked=!!p.free;panel();draw()}
pre.add(new Option('(saved / custom configuration)',''),0);
pre.onchange=()=>{if(P[pre.value])load(pre.value)};
function addRay(src,aim){const r={id:uid++,src,aim,y0:5,vis:true};S.rays.push(r);return r}
function principal(oi){const e=srt()[0],o=S.objs[oi];if(!e)return;
 if(Math.abs(o.y)>1e-6){addRay(oi,{k:'par'});addRay(oi,{k:'pt',el:e.id,p:'O'});addRay(oi,{k:'pt',el:e.id,p:'F'});if(e.t=='M')addRay(oi,{k:'pt',el:e.id,p:'C'})}
 else{addRay(oi,{k:'hit',h:2.5});addRay(oi,{k:'hit',h:-1.5})}}
const ptOf=(e,p)=>({x:p=='F'?e.x-e.f:p=='Fp'?e.x+e.f:p=='C'?e.x-2*e.f:e.x,y:0});
function lineOf(r){const e0=srt()[0];if(!e0)return null;
 if(r.aim.k=='guide'){const g=S.rays.find(q=>q.id==r.aim.ref),L=g&&lineOf(g);return L?{P:{x:e0.x,y:0},s:L.s,guide:1}:null}
 if(r.aim.k=='dir'){const g=S.rays.find(q=>q.id==r.aim.ref),L=g&&lineOf(g);return L?{P:{x:0,y:r.aim.y-L.s*r.aim.x},s:L.s,free:1}:null}
 let Q,s;if(r.src>=0){const o=S.objs[r.src];if(!o)return null;Q={x:o.x,y:o.y}}else Q={x:0,y:r.y0};
 const a=r.aim;if(a.k=='par')s=0;
 else if(a.k=='pt'){const e=elById(a.el);if(!e)return null;const T=ptOf(e,a.p);if(Math.abs(T.x-Q.x)<1e-6)return null;s=(T.y-Q.y)/(T.x-Q.x)}
 else if(a.k=='at'){if(Math.abs(a.x-Q.x)<1e-6)return null;s=(a.y-Q.y)/(a.x-Q.x)}
 else{if(Math.abs(e0.x-Q.x)<1e-6)return null;s=(a.h-Q.y)/(e0.x-Q.x)}
 return{P:Q,s,free:r.src<0}}
function prop(h,q){const E=srt();if(!E.length)return null;let i=0,dir=1,pts=[];
 for(let n=0;n<10;n++){const e=E[i];pts.push({x:e.x,y:h});q-=h/e.f;if(e.t=='M')dir=-dir;
  let nx=null;for(const c of E){if((c.x-e.x)*dir>1e-9&&(dir>0||c.t=='L')&&(nx==null||Math.abs(c.x-e.x)<Math.abs(nx.x-e.x)))nx=c}
  if(!nx)break;h+=q*Math.abs(nx.x-e.x);i=E.indexOf(nx)}
 const l=pts[pts.length-1];return{pts,fin:{x:l.x,y:l.y,dx:dir,dy:q}}}
// Principal planes of the whole system. The tracer is linear in (h, slope), so two traces give everything:
// H′ is where a ray entering parallel to the axis at height 1 reaches height 1 again after the last element;
// H is where the incident ray that leaves parallel to the axis reaches its exit height. Null for an afocal system.
function principalPlanes(){const E=srt();if(!E.length)return null;
 const A=prop(1,0),a=A.fin.dy,c=prop(0,1).fin.dy;if(Math.abs(a)<1e-9)return null;
 const f=A.fin,Hp=f.x+f.dx*(1-f.y)/f.dy,h=c,sl=-a,yo=prop(h,sl).fin.y,H=E[0].x+(yo-h)/sl; // (h, sl) = (c, -a) always leaves parallel, and sl is never 0
 return{H,Hp}}
const ppOn=()=>$('pp').checked&&(!practice||practice.revealed); // hidden during an exercise: finding them can be the task
function trace(r){const L=lineOf(r),e0=srt()[0];if(!L)return null;const h=L.P.y+L.s*(e0.x-L.P.x),T=prop(h,L.s);return T?{L,T,h}:null}
const cr=(a,b,c,d)=>a*d-b*c;
function inter(a,b){const k=cr(a.dx,a.dy,b.dx,b.dy);if(Math.abs(k)<1e-9)return null;const t=cr(b.x-a.x,b.y-a.y,b.dx,b.dy)/k;return{x:a.x+t*a.dx,y:a.y+t*a.dy}}
function imageOf(oi){const R=S.rays.filter(r=>r.src==oi&&r.aim.k!='guide').map(r=>({r,tr:trace(r)})).filter(o=>o.tr);
 for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){const k=inter(R[i].tr.T.fin,R[j].tr.T.fin);if(k)return{pt:k,R}}return{pt:null,R}}
const kindName=e=>e.t=='L'?(e.f>0?'Converging lens':'Diverging lens'):(e.f>0?'Concave mirror':'Convex mirror');
const nm=e=>S.els.length>1?S.els.indexOf(e)+1:'',onm=i=>S.objs.length>1?i+1:'';
function ptName(e,p){const n=nm(e);return p=='O'?(e.t=='L'?'O':'S')+n:p=='F'?'F'+n:p=='Fp'?"F′"+n:'C'+n}
function rayCol(r){return r.aim.k=='pt'?(r.aim.p=='O'?COL.O:COL[r.aim.p]):COL[r.aim.k]}
function rayDesc(r){const a=r.aim,s=r.src>=0?(S.objs[r.src]&&S.objs[r.src].ext?'B':'A')+onm(r.src)+': ':'free ray: ';
 if(a.k=='par')return s+'parallel to axis';if(a.k=='at')return s+'through ('+a.x+', '+a.y+')';if(a.k=='dir')return 'parallel to ray '+(S.rays.findIndex(q=>q.id==a.ref)+1)+', through ('+a.x+', '+a.y+')';if(a.k=='hit')return s+'free aim (drag handle)';
 if(a.k=='guide')return 'guideline through centre, ∥ to its ray';const e=elById(a.el);return s+'through '+(e?ptName(e,a.p):'?')}
