// Toolbars: each control is declared once in CTRL; a toolbar is only a list of groups. Also the shared scene state.
const mk=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!==undefined)e.innerHTML=html;return e};
const svg=d=>`<svg viewBox="0 0 24 24">${d}</svg>`,setDis=(sel,on)=>document.querySelectorAll(sel).forEach(e=>e.classList.toggle('dis',on));
const CTRL={
 undo:{act:'undo',tip:'Undo (Ctrl+Z)',icon:svg('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>'),run:()=>undo()},
 redo:{act:'redo',tip:'Redo (Ctrl+Y)',icon:svg('<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 000 12h3"/>'),run:()=>redo()},
 move:{tool:'move',label:'Move',tip:'Move / select (M): drag things, tap one to edit it',icon:svg('<path d="M5 3l14 8-6 2-2 6z"/>')},
 trace:{tool:'trace',label:'Ray',tip:'Trace ray (T): drag from an object toward the elements',icon:svg('<circle cx="5" cy="18" r="2.2"/><path d="M7 16.5L20 6M20 6h-5.5M20 6v5.5"/>')},
 line:{tool:'line',label:'Line',tip:'Bold line (L or B): solid segment from a start point to an end point. Snaps to special points, intersections, elements and directions',icon:svg('<circle cx=\"5\" cy=\"19\" r=\"2\"/><circle cx=\"19\" cy=\"5\" r=\"2\"/><path stroke-width=\"3.2\" d=\"M6.5 17.5L17.5 6.5\"/>')},
 cons:{tool:'cons',label:'Construct',tip:'Construction line (C): dotted line through two points, extending across the whole canvas. Same snapping as the bold line',icon:svg('<circle cx=\"5\" cy=\"19\" r=\"2\"/><circle cx=\"19\" cy=\"5\" r=\"2\"/><path stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-dasharray=\"0.1 3.4\" d=\"M1 23L23 1\"/>')},
 mark:{tool:'mark',label:'Mark',tip:'Mark answer (X)',icon:svg('<path d="M12 21s-6-6-6-11a6 6 0 0112 0c0 5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>')},
 'L+':{add:'L+',tip:'Converging lens, f>0 (key 1)',label:'Converging lens',icon:svg('<path d="M12 3v18M8.5 7L12 3l3.5 4M8.5 17L12 21l3.5-4"/>')},
 'L-':{add:'L-',tip:'Diverging lens, f<0 (key 2)',label:'Diverging lens',icon:svg('<path d="M12 7v10M8.5 3.5L12 7l3.5-3.5M8.5 20.5L12 17l3.5 3.5"/>')},
 'M+':{add:'M+',tip:'Concave (converging) mirror (key 3)',label:'Concave mirror',icon:svg('<path d="M9 3l5 5v8l-5 5"/><path d="M14 9.5l3.5-3.5M14 13l3.5-3.5M14 16.5l3.5-3.5"/>')},
 'M-':{add:'M-',tip:'Convex (diverging) mirror (key 4)',label:'Convex mirror',icon:svg('<path d="M15 3l-5 5v8l5 5"/><path d="M10 9.5l3.5-3.5M10 13l3.5-3.5M10 16.5l3.5-3.5"/>')},
 P:{add:'P',tip:'Point object (P)',label:'Point object',icon:svg('<circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3"/>')},
 A:{add:'A',tip:'Arrow object (A)',label:'Arrow object',icon:svg('<path d="M12 20V6M7.5 10.5L12 6l4.5 4.5M8 20h8"/>')},
 preset:{select:'pre'},
 task:{select:'pex',tip:'Choose the exercise',opts:EXOPTS,change:()=>newExercise($('pex').value)},
 hint:{act:'hint',id:'pHint',text:'Hint (0/3)',run:()=>hintStep()},
 show:{act:'show',text:'Show solution',run:()=>{if(practice){if(!practice.revealed){ // the solution rays only exist once revealed
   if(practice.task=='image'){if(!S.rays.length)S.objs.forEach((_,i)=>principal(i))}
   else if(!S.rays.some(q=>q.aim.k=='guide'))addRay(-1,{k:'guide',ref:practice.rid})}
  practice.revealed=true;pracUI();draw()}}},
 clear:{act:'clear',text:'Clear',tip:'Clear my constructions and answer',run:()=>{S.lines=[];if(practice){practice.ans=null;practice.fb=[]}panel();draw()}},
 next:{act:'next',text:'Next',tip:'Next exercise in this group (a random group draws a new one)',run:()=>nextExercise()},
 evaluate:{act:'eval',text:'Check',tip:'Check my construction (E)',cls:'primary',run:()=>evaluate()},
 addb:{act:'addsheet',label:'Add',cls:'addb',tip:'Add a lens, mirror, object or ray',icon:svg('<path d="M12 5v14M5 12h14"/>'),run:()=>openSheet()},
 zoomout:{act:'zoomout',text:'\u2212',tip:'Zoom out (\u2212)',run:()=>zoomStep(-1)},
 zoomlvl:{act:'zoomlvl',text:'100%',tip:'Zoom level: click to reset to 100% (0)',run:()=>zoomReset()},
 zoomin:{act:'zoomin',text:'+',tip:'Zoom in (+)',run:()=>zoomStep(1)}};
const TOOLBARS={
 tbSand:[{items:['move','trace','line','cons']},{items:['addb']}],
 tbPrac:[{items:['move','line','cons','mark']},{items:['evaluate']}],
 hist:[{items:['undo','redo']}],
 chipSand:[{items:['preset']}],
 chipPrac:[{items:['task']}],
 pracBtns:[{items:['hint','show','clear','next']}],
 tiles:[{items:['L+','L-','M+','M-','P','A']}]};
function ctrl(c){
 if(c.select){const e=mk('select');e.id=c.select;const fill=(par,o)=>o.forEach(x=>{if(x.items){const g=mk('optgroup');g.label=x.label;fill(g,x.items);par.appendChild(g)}else par.appendChild(new Option(x[1],x[0]))});fill(e,c.opts||[]);if(c.tip)e.title=c.tip;if(c.change)e.onchange=c.change;return e}
 const b=mk('button',c.cls||'',(c.icon||'')+(c.label?`<small>${c.label}</small>`:'')+(c.text?`<span class="t">${c.text}</span>`:''));b.title=c.tip||c.text||'';if(c.id)b.id=c.id;
 if(c.tool){b.dataset.tool=c.tool;b.onclick=()=>setTool(c.tool)}if(c.act){b.dataset.act=c.act;b.onclick=c.run}if(c.add){b.dataset.add=c.add;b.draggable=true}return b}
function buildToolbar(el,spec){spec.forEach((g,i)=>{
 if(g==='grow'){el.appendChild(mk('span','grow'));return}if(i&&spec[i-1]!=='grow')el.appendChild(mk('i','sep'));
 if(g.badge){el.appendChild(mk('span','badge',g.badge));return}
 const box=mk('div','grp '+(g.cls||''));if(g.label)box.appendChild(mk('span','lbl',g.label));g.items.forEach(n=>box.appendChild(ctrl(CTRL[n])));el.appendChild(box)})}
for(const id in TOOLBARS)buildToolbar($(id),TOOLBARS[id]);
buildToolbar($('zoomUI'),[{items:['zoomout','zoomlvl','zoomin']}]);
let S={els:[],objs:[],rays:[],lines:[]},uid=1,practice=null,mode='sandbox';const WS={sandbox:null,practice:null}; // WS holds the workspace of the mode that is NOT active
const LC='#9b7bff',LINE_COLORS=[[LC,'Purple (default)'],['#2f6fed','Blue'],['#1f9d55','Green'],['#d64545','Red'],['#e08a00','Orange'],['#6b7280','Gray']];let curId=null,curName=null,savedJ=null,forceW=0,exporting=false;
const pref=Object.assign({step:.5,theme:'auto',grid:true,light:true,f:3},(()=>{try{return JSON.parse(localStorage.getItem('raylab.prefs'))||{}}catch(e){return{}}})());
const OC='#4a7dff',COL={dir:'#b58900',at:'#6b7bd6',par:'#4a7dff',O:'#0a8a2a',S:'#0a8a2a',F:'#c04ab0',Fp:'#e08a00',C:'#14a3b8',hit:'#6b7bd6',guide:'#0a8a2a'};
