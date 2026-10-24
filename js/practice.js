// Practice mode and sandbox/practice workspaces
// practice
function principalList(oi){const e=srt()[0],o=S.objs[oi],R=[];if(!e||!o)return R;
 if(Math.abs(o.y)>1e-6){R.push({src:oi,aim:{k:'par'}},{src:oi,aim:{k:'pt',el:e.id,p:'O'}},{src:oi,aim:{k:'pt',el:e.id,p:'F'}});if(e.t=='M')R.push({src:oi,aim:{k:'pt',el:e.id,p:'C'}})}
 else R.push({src:oi,aim:{k:'hit',h:2.5}},{src:oi,aim:{k:'hit',h:-1.5}});return R.map((r,i)=>({id:-100-i,y0:0,vis:true,...r}))}
function trueImage(oi){const R=principalList(oi).map(r=>({r,tr:trace(r)})).filter(o=>o.tr);for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){const k=inter(R[i].tr.T.fin,R[j].tr.T.fin);if(k)return{pt:k,R}}return{pt:null,R}}
function buildExercise(d){S.els=(d.els||[d.el]).map((e,i)=>({id:i+1,t:e[0],x:e[1],f:e[2]}));uid=S.els.length+1;S.objs=[];S.rays=[];S.lines=[];if(d.view)Object.assign(view,d.view);
 if(d.obj)S.objs.push({x:d.obj[0],y:d.obj[1],ext:!!d.ext});else{const r=addRay(-1,{k:'hit',h:d.ray[0]});r.y0=d.ray[1]}
 pre.value='';panel();draw()}
function startPractice(task,ex){if(!S.els.length){toast('Add at least one lens or mirror first');return}let rid=null;
 if(task=='image'){if(!S.objs.length){toast('Add an object first');return}}else{const r=S.rays.find(q=>q.src<0&&q.aim.k=='hit');if(!r){toast('Add a free incident ray first (New ray from "free ray"), or use Random exercise');return}rid=r.id}
 S.lines=[];practice={task,ex,rid,revealed:false,hint:0,ans:null,fb:[],hintTxt:''};$('vall').checked=true;setTool('line');panel();draw()}
function practiceMsg(){return exTitle(practice.ex)+'\n'+(practice.task=='image'?'Practice: find the image of '+(S.objs[0]&&S.objs[0].ext?'B':'A')+'. Use the Bold line (L) and Construction line (C) tools: click a start point, then an end point. Points snap to F, O, S, C, intersections and directions (parallel to the axis, through a point). Mark the image with X, then Evaluate (E).':'Practice: construct the emerging ray for the incident ray shown. Use the Bold line (L) and Construction line (C) tools: for example a dotted guideline parallel to the incident ray (through the centre O of a lens, or through C or the vertex S of a mirror), then use the focal plane.'+(S.els.length>1?' With several elements, draw the ray leaving each element in turn.':'')+' Points and directions snap to O, F, the focal planes, the point where the ray hits the element, and the direction of the incident ray. Evaluate with E.')}
const lineHit=(l,p,t)=>(l.k=='bold'?dseg(p,[l.a.x,l.a.y,l.b.x,l.b.y]):dLine(p,l))<tol(t);
const dLine=(q,l)=>{const dx=l.b.x-l.a.x,dy=l.b.y-l.a.y,n=Math.hypot(dx,dy)||1;return Math.abs((q.x-l.a.x)*dy-(q.y-l.a.y)*dx)/n};
const yAt=(l,x)=>Math.abs(l.b.x-l.a.x)<1e-9?null:l.a.y+(l.b.y-l.a.y)*(x-l.a.x)/(l.b.x-l.a.x);
function evalImage(){const o=S.objs[0],e0=srt()[0],im=trueImage(0);if(!im.pt)return{ok:false,fb:[['warn','This scene has no single image (the output rays are parallel).']]};
 const T=im.pt,fb=[];let posOK=false;
 if(!practice.ans)fb.push(['warn','Place your image marker with the Mark tool (X), ideally on an intersection of your lines.']);
 else{const d=Math.hypot(practice.ans.x-T.x,practice.ans.y-T.y);posOK=d<=.35;fb.push([posOK?'ok':'bad',posOK?`Marked image position is correct (off by ${d.toFixed(2)}).`:`Marked image position is off by ${d.toFixed(2)} units.`])}
 const F={x:e0.x-e0.f,y:0},Oc={x:e0.x,y:0},C={x:e0.x-2*e0.f,y:0},multi=S.els.length>1;
 const Ls=S.lines.map((l,i)=>({l,i:i+1,P:dLine(o,l)<.2,T:dLine(T,l)<.2})).filter(q=>q.l.vis);
 if(!Ls.length)fb.push(['warn','No lines yet. Draw at least two rays from the object.']);
 Ls.forEach(q=>{const sl=Math.abs(q.l.b.x-q.l.a.x)<1e-9?1e9:(q.l.b.y-q.l.a.y)/(q.l.b.x-q.l.a.x);let kind='ray through the object';
  if(q.P){if(Math.abs(sl)<.03)kind='ray parallel to the axis';else if(dLine(F,q.l)<.2)kind='ray through F';else if(dLine(Oc,q.l)<.2)kind='ray through the '+(e0.t=='L'?'centre O':'vertex S');else if(e0.t=='M'&&dLine(C,q.l)<.2)kind='ray through C'}
  if(q.P&&q.T)fb.push(['ok',`Line ${q.i}: valid, a ${kind} that continues through the image.`]);
  else if(q.P)fb.push(['ok',`Line ${q.i}: valid incident ${kind}.`]);
  else if(q.T)fb.push(['ok',`Line ${q.i}: valid emerging ray through the image.`]);
  else fb.push(['warn',`Line ${q.i}: not recognised as a ray from the object or towards the image (it may be an intermediate construction).`])});
 let sup=0;
 if(multi)sup=Ls.filter(q=>q.T).length;
 else Ls.filter(q=>q.P).forEach(a=>{const h=yAt(a.l,e0.x);if(a.T||(h!=null&&Ls.some(b=>b.T&&Math.abs((yAt(b.l,e0.x)??1e9)-h)<.3)))sup++;else fb.push(['warn',`Line ${a.i}: this incident ray has no matching refracted ray yet.`])});
 fb.push([sup>=2?'ok':'warn',`${sup} complete ray${sup==1?'':'s'} support the image (at least 2 needed).`]);
 const ok=posOK&&sup>=2;fb.unshift([ok?'ok':posOK?'warn':'bad',ok?'Correct: your construction finds the image.':posOK?'Position correct, but the construction is incomplete.':'Not correct yet.']);return{ok,fb}}
function evalRay(){const r=S.rays.find(q=>q.id==practice.rid),tr=r&&trace(r);if(!tr)return{ok:false,fb:[['warn','The incident ray is not valid.']]};
 const T=tr.T,L=tr.L,P=T.pts,n=P.length,E=srt(),e0=E[0],fb=[],ls=S.lines.filter(l=>l.vis),nrm=v=>{const m=Math.hypot(v.x,v.y)||1;return{x:v.x/m,y:v.y/m}};
 // one stage per element hit: the ray leaving element k must be drawn by the student, starting at the point where it meets that element
 const st=P.map((p,k)=>({p,d:nrm(k<n-1?{x:P[k+1].x-p.x,y:P[k+1].y-p.y}:{x:T.fin.dx,y:T.fin.dy}),prev:k?nrm({x:p.x-P[k-1].x,y:p.y-P[k-1].y}):nrm({x:1,y:L.s})}));
 const dl=(q,p,d)=>Math.abs((q.x-p.x)*d.y-(q.y-p.y)*d.x);
 const stageFound=g=>ls.find(l=>dl(l.a,g.p,g.d)<.25&&dl(l.b,g.p,g.d)<.25&&(Math.abs(g.d.x*g.prev.y-g.d.y*g.prev.x)<.02||!(dl(l.a,g.p,g.prev)<.15&&dl(l.b,g.p,g.prev)<.15)));
 // guideline for the first element: lens -> through O; mirror -> through S, or through C (a ray aimed at C reflects back on itself)
 const gp=[{x:e0.x,y:0}];if(e0.t=='M')gp.push({x:e0.x-2*e0.f,y:0});
 const guide=ls.some(l=>{const dx=l.b.x-l.a.x,dy=l.b.y-l.a.y;return Math.abs(dx)>1e-9&&Math.abs(dy/dx-L.s)<.06&&gp.some(c=>dLine(c,l)<.25)});
 const gtxt=e0.t=='M'?'a line parallel to the incident ray through C (or through the vertex S)':'a line through the centre O parallel to the incident ray';
 fb.push([guide?'ok':'warn',guide?'Guideline found: '+gtxt+'.':'No guideline yet ('+gtxt+').']);
 let ok=true;
 for(let k=0;k<n;k++){const g=st[k],lab=n>1?'After element '+(k+1)+': ':'',found=stageFound(g);
  if(found){fb.unshift(['ok',n>1?lab+'your line is the emerging ray.':'Correct: your line is the emerging ray.']);continue}
  ok=false;const th=ls.find(l=>dLine(g.p,l)<.25&&!(dl(l.a,g.p,g.prev)<.15&&dl(l.b,g.p,g.prev)<.15));
  if(th){const ux=th.b.x-th.a.x,uy=th.b.y-th.a.y,c=Math.abs(ux*g.d.x+uy*g.d.y)/Math.hypot(ux,uy),ang=Math.acos(Math.min(1,c))*180/Math.PI;fb.unshift(['bad',lab+`your line starts at the right point on the element, but its direction is off by about ${ang.toFixed(0)} degrees.`])}
  else fb.unshift(['bad',lab+(k?'draw the ray leaving the previous element, starting where it meets this element.':'not correct yet: draw a line starting where the incident ray meets the element.')]);break}
 if(ok&&n>1)fb.unshift(['ok','Correct: the ray is followed through all '+n+' element hits.']);
 return{ok,fb}}
function evaluate(){if(!practice)return;const r=practice.task=='image'?evalImage():evalRay();practice.fb=r.fb;pracUI();toast(r.ok?'Correct!':'Not yet, see the feedback')}
function hintStep(){if(!practice)return;practice.hint=Math.min(3,practice.hint+1);const h=practice.hint-1;
 const multi=S.els.length>1,mir=S.els[0]&&S.els[0].t=='M';
 practice.hintTxt=practice.task=='image'?[multi?'Work element by element. Draw two principal rays from B through the first element (parallel to the axis, through its centre O or vertex S, or through its F). Then treat each emerging ray as the incident ray of the next element: draw a guideline through that element\u2019s centre parallel to the ray and use its focal plane. The images are where the last emerging rays meet.':'Use two or three principal rays from the object: parallel to the axis, through the centre (O or vertex S), and through F (through C for a mirror). Where their emerging rays meet is the image.','One principal ray is now shown faintly. Draw it yourself with the construction line tool, then continue with another one.','All principal rays are shown faintly. Reproduce at least two with construction lines and mark where they meet.'][h]:[(mir?'Draw a guideline parallel to the incident ray, through C (it reflects back on itself) or through the vertex S (reflect it with the axis as the mirror line). The emerging ray goes through the point where the reflected guideline meets the focal plane F.':'Draw the guideline: a line through the centre O parallel to the incident ray. The emerging ray goes through the point where the guideline meets the focal plane F\u2032.')+(multi?' Repeat for each following element, using your own emerging ray as its incident ray.':''),'The guideline and the focal planes are now shown faintly.','The emerging ray is now shown faintly.'][h];pracUI();draw()}
// ---- workspaces: sandbox and practice each own their scene, history, view, tool and display options
const wsSave=()=>({S,uid,hist:{...hist},view:{...view},tool,practice,curId,curName,savedJ,pre:pre.value,chk:{vall:$('vall').checked,fp:$('fp').checked,pl:$('pl').checked}});
function wsLoad(w){drag=null;S=w.S;uid=w.uid;Object.assign(hist,w.hist);Object.assign(view,w.view);practice=w.practice;curId=w.curId;curName=w.curName;savedJ=w.savedJ;pre.value=w.pre;
 $('vall').checked=w.chk.vall;$('fp').checked=w.chk.fp;$('pl').checked=w.chk.pl;LP=null;par=null;TR=null;S.prev=null;S.snapPt=null;S.pl=null;setTool(w.tool);panel();updBtns()}
function switchMode(m){if(m==mode)return;
 if(m=='practice'&&!WS.practice){newExercise();return}
 WS[mode]=wsSave();mode=m;wsLoad(WS[m]);WS[m]=null}
function newExercise(id){id=id||$('pex').value;const d=exerciseDef(id);if(mode!='practice'){WS[mode]=wsSave();mode='practice'}
 S={els:[],objs:[],rays:[],lines:[]};uid=1;Object.assign(hist,{u:[],r:[],cur:null,key:null,t:0});Object.assign(view,HOME);practice=null;curId=null;curName=null;savedJ=null;drag=null;LP=null;par=null;TR=null;
 $('fp').checked=false;$('pl').checked=false;buildExercise(d);startPractice(d.task,id)}
function nextExercise(){const id=practice?practice.ex:$('pex').value,d=exerciseDef(id);if(d.rand){newExercise(id);return}
 const list=EX.filter(e=>(e.grp||e.task)==(d.grp||d.task));newExercise(list[(list.findIndex(e=>e.id==id)+1)%list.length].id)}
$('mSand').onclick=()=>switchMode('sandbox');$('mPrac').onclick=()=>switchMode('practice');
function pracUI(){const on=!!practice;document.body.classList.toggle('practice',on);
 [['mSand',!on],['mPrac',on]].forEach(([id,v])=>{$(id).classList.toggle('on',v);$(id).setAttribute('aria-selected',v)});
 const img=on&&practice.task=='image';setDis('[data-tool=mark]',!img);document.querySelectorAll('[data-tool=mark]').forEach(b=>b.title=img?'Mark answer (X)':'Mark answer (X): only in the "find the image" exercise');
 if(on)$('pex').value=practice.ex;document.querySelectorAll('[data-act=hint] .t').forEach(e=>e.textContent='Hint ('+(on?practice.hint:0)+'/3)');
 const f=$('pfb');f.innerHTML='';if(!on)return;
 $('ptask').textContent=practice.task=='image'?`Find the image of ${S.objs[0]&&S.objs[0].ext?'B':'A'}: draw at least two rays with Line or Construct, mark where they meet with Mark, then Check.`:'Construct the ray that emerges'+(S.els.length>1?' from each element in turn':'')+', starting where the given ray meets the element, then Check.';const add=(c,t)=>{const d=document.createElement('div');d.style.cssText='margin:3px 0;color:'+({ok:'#2a9d4a',bad:'#e04b4b',warn:'#c98a00',hint:'inherit'}[c]);d.textContent=({ok:'\u2713 ',bad:'\u2717 ',warn:'! ',hint:'\u2139 '}[c])+t;f.appendChild(d)};
 if(practice.revealed)add('hint','Solution shown: the traced rays and the image are now visible.');if(practice.hintTxt)add('hint',practice.hintTxt);(practice.fb||[]).forEach(([c,t])=>add(c,t))}
['vall','fp','pl'].forEach(i=>$(i).onchange=draw);
addEventListener('resize',draw);
