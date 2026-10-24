// Core constants, view state and the practice exercise catalog
const W=18,H=14,cv=document.getElementById('cv'),cx=cv.getContext('2d'),$=id=>document.getElementById(id);

// ---- toolbars: each control is declared once in CTRL; a toolbar is only a list of groups
const HOME={z:1,x0:0,y0:H/2},view={...HOME},tol=v=>v/view.z,FAR=2000,clx=v=>Math.max(-500,Math.min(W+500,v)); // FAR: how far rays/lines are drawn; clx: how far elements and objects may be placed; view: zoom factor + world coords of the visible top-left corner; tol(): pick radius in world units that stays constant on screen
// ---- practice exercises: one declarative catalog. el = [type, x, f] (L lens / M mirror; f<0 means diverging / convex), then either obj = [x, y] or ray = [height at the element, y at x=0]
const EX=[
 {id:'conv-far',task:'image',title:'Converging lens: object beyond 2F',el:['L',9,3],obj:[1,2]},
 {id:'conv-mid',task:'image',title:'Converging lens: object between F and 2F',el:['L',7,3],obj:[2.5,2]},
 {id:'conv-near',task:'image',title:'Converging lens: object inside F',el:['L',9,3],obj:[7,2]},
 {id:'diverging',task:'image',title:'Diverging lens',el:['L',9,-3],obj:[3,3]},
 {id:'conc-far',task:'image',title:'Concave mirror: object beyond C',el:['M',10,3],obj:[1,2]},
 {id:'conc-mid',task:'image',title:'Concave mirror: object between C and F',el:['M',10,3],obj:[5.5,2]},
 {id:'conc-near',task:'image',title:'Concave mirror: object inside F',el:['M',10,3],obj:[8.5,2]},
 {id:'convex',task:'image',title:'Convex mirror',el:['M',10,-3],obj:[3,3]},
 {id:'ray-conv',task:'ray',title:'Converging lens: oblique ray',el:['L',9,3],ray:[2,-1]},
 {id:'ray-conv-par',task:'ray',title:'Converging lens: ray parallel to the axis',el:['L',9,3],ray:[2,2]},
 {id:'ray-div',task:'ray',title:'Diverging lens: oblique ray',el:['L',9,-3],ray:[2,0]},
 {id:'ray-conc',task:'ray',title:'Concave mirror: oblique ray',el:['M',10,3],ray:[3,1]},
 {id:'ray-convex',task:'ray',title:'Convex mirror: oblique ray',el:['M',10,-3],ray:[2,-1]},
 // optical systems (several elements, in light order from the left). Extended object AB: A on the axis, B the tip.
 {id:'sys-a',grp:'sys-image',task:'image',title:'a) Two converging lenses',els:[['L',4,3],['L',14,3]],obj:[1,3],ext:true},
 {id:'sys-b',grp:'sys-image',task:'image',title:'b) Two converging lenses, object near F1',els:[['L',5,4],['L',11,4]],obj:[2,3],ext:true},
 {id:'sys-c',grp:'sys-image',task:'image',title:'c) Converging then diverging lens',els:[['L',6,4],['L',12,-4]],obj:[3,3],ext:true},
 {id:'sys-d',grp:'sys-image',task:'image',title:'d) Two diverging lenses',els:[['L',8,-7],['L',13,-6]],obj:[2,3],ext:true},
 {id:'sys-e',grp:'sys-image',task:'image',title:'e) Converging lens and concave mirror',els:[['L',6,6],['M',17,4]],obj:[15,3],ext:true},
 {id:'sys-f',grp:'sys-image',task:'image',title:'f) Converging lens and convex mirror',els:[['L',9,5],['M',12,-3]],obj:[1,3],ext:true,view:{z:.65,x0:-9,y0:10.77}},
 {id:'sys-ray-a',grp:'sys-ray',task:'ray',title:'Two converging lenses: oblique ray',els:[['L',5,3],['L',13,3]],ray:[2,-1]},
 {id:'sys-ray-b',grp:'sys-ray',task:'ray',title:'Converging then diverging lens: oblique ray',els:[['L',5,3],['L',12,-3]],ray:[2,-1]},
 {id:'sys-ray-c',grp:'sys-ray',task:'ray',title:'Converging lens and concave mirror: ray from the left',els:[['L',5,3],['M',15,4]],ray:[2,0]}];
const EXGROUPS=[['image','Find the image'],['ray','Find the emerging ray'],['sys-image','Systems: find the image of AB'],['sys-ray','Systems: find the emerging ray']];
const EXOPTS=EXGROUPS.map(([k,label])=>({label,items:[...EX.filter(e=>(e.grp||e.task)==k).map(e=>[e.id,e.title]),...(k=='image'||k=='ray'?[['rand-'+k,'Random exercise']]:[])]}));
const exTitle=id=>(EX.find(e=>e.id==id)||{title:'Random exercise'}).title;
function randomDef(task){const K=[['L',1],['L',-1],['M',1],['M',-1]],[t,sg]=K[Math.floor(Math.random()*4)],f=sg*(3+Math.floor(Math.random()*3)),ex=8+Math.floor(Math.random()*3),d={task,rand:true,el:[t,ex,f]};
 if(task=='image'){let x,y,n=0;do{x=1+Math.floor(Math.random()*(ex-3));y=1+Math.floor(Math.random()*4);n++}while(n<30&&(Math.abs(x-(ex-f))<.9||Math.abs(x-(ex-2*f))<.9));d.obj=[x,y]}
 else d.ray=[1+Math.floor(Math.random()*4),Math.floor(Math.random()*7)-1];return d}
const exerciseDef=id=>EX.find(e=>e.id==id)||randomDef(id=='rand-ray'?'ray':'image');
