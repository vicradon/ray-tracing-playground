// Side panels (elements, objects, rays) and adding things
// ---- panels: the scene list, the selection inspector and the practice card (built in ui.js)
function panel(){pracUI();renderScene();renderInsp()}
// where a palette button (no drop point) puts a new item: the middle of the current view, moved sideways until it does not sit on top of an existing one
function freeSpot(t){const el=t[0]=='L'||t[0]=='M',c=atHome()?{x:9,y:3}:{x:view.x0+W/2/view.z,y:view.y0-H/2/view.z},
  taken=x=>el?S.els.some(e=>Math.abs(e.x-x)<.75):S.objs.some(o=>Math.abs(o.x-x)<.75);
 for(let k=0;k<40;k++){const x=c.x+(k%2?1:-1)*Math.ceil(k/2)*2;if(!taken(sn(x)))return{x,y:c.y}}return c}
function add(t,p){if(practice){toast('Adding elements is disabled in practice mode');return}
 p=p||freeSpot(t);const x=clx(sn(p.x));
 if(t[0]=='L'||t[0]=='M')S.els.push({id:uid++,t:t[0],x,f:t[1]=='-'?-pref.f:pref.f});
 else S.objs.push({x,y:t=='A'?(Math.abs(p.y)<.3?3:sn(p.y)):sn(p.y),ext:t=='A'});
 closeSheet();sel={...(t[0]=='L'||t[0]=='M'?{k:'el',id:S.els[S.els.length-1].id}:{k:'obj',i:S.objs.length-1}),m:mode};panel();draw()}
document.querySelectorAll('[data-add]').forEach(b=>{b.onclick=()=>{if(palDrag.used){palDrag.used=false;return}add(b.dataset.add)};b.ondragstart=e=>e.dataTransfer.setData('text/plain',b.dataset.add)});
// touch has no HTML drag and drop: drag a palette button down (sideways still scrolls the toolbar) and drop it on the canvas
const palDrag={b:null,x:0,y:0,g:null,used:false};
document.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('pointerdown',ev=>{if(ev.pointerType=='mouse')return;Object.assign(palDrag,{b,id:ev.pointerId,x:ev.clientX,y:ev.clientY,g:null,used:false})}));
const GY=38,gpt=ev=>({clientX:ev.clientX,clientY:ev.clientY-GY}), // the ghost floats above the finger so it stays visible; it drops where the ghost is
 overCv=ev=>{const r=cv.getBoundingClientRect(),q=gpt(ev);return q.clientX>=r.left&&q.clientX<=r.right&&q.clientY>=r.top&&q.clientY<=r.bottom};
addEventListener('pointermove',ev=>{const d=palDrag;if(!d.b||ev.pointerId!=d.id)return;
 if(!d.g){const dx=ev.clientX-d.x,dy=ev.clientY-d.y;if(Math.hypot(dx,dy)<10)return;if(!d.b.closest('#addSheet')&&Math.abs(dy)<Math.abs(dx)){d.b=null;return} // in a scrolling strip, sideways moves scroll it
  try{d.b.releasePointerCapture(ev.pointerId)}catch(e){}d.g=mk('div','palghost',d.b.querySelector('svg').outerHTML);document.body.appendChild(d.g);closeSheet(true)} // hide the sheet so the canvas is free to drop on
 ev.preventDefault();d.g.style.left=ev.clientX+'px';d.g.style.top=ev.clientY+'px';d.g.classList.toggle('ok',overCv(ev))},{passive:false});
const palEnd=ev=>{const d=palDrag;if(!d.b||ev.pointerId!=d.id)return;if(d.g){d.g.remove();d.used=true;setTimeout(()=>d.used=false,400);if(ev.type=='pointerup'&&overCv(ev))add(d.b.dataset.add,wp(gpt(ev)))}d.b=null;d.g=null};
addEventListener('pointerup',palEnd);addEventListener('pointercancel',palEnd);
cv.ondragover=e=>e.preventDefault();cv.ondrop=e=>{e.preventDefault();const t=e.dataTransfer.getData('text/plain');if(t)add(t,wp(e))};
