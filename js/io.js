// Storage (IndexedDB), export, menu bar and keyboard shortcuts
// ---- storage (IndexedDB), export, menus
const DB={open(){return this._p||(this._p=new Promise((res,rej)=>{const r=indexedDB.open('raylab',1);r.onupgradeneeded=()=>r.result.createObjectStore('configs',{keyPath:'id',autoIncrement:true});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}))},
 async tx(mode,fn){const d=await this.open();return new Promise((res,rej)=>{const t=d.transaction('configs',mode),rq=fn(t.objectStore('configs'));t.oncomplete=()=>res(rq&&rq.result);t.onerror=()=>rej(t.error)})},
 all(){return this.tx('readonly',s=>s.getAll())},put(o){return this.tx('readwrite',s=>s.put(o))},del(id){return this.tx('readwrite',s=>s.delete(id))}};
let toastT;function toast(t){const e=$('toast');e.textContent=t;e.style.display='block';clearTimeout(toastT);toastT=setTimeout(()=>e.style.display='none',2600)}
const btn=(t,f)=>{const b=document.createElement('button');b.textContent=t;b.onclick=f;return b};
function modal(title,node,btns){$('mt').textContent=title;const b=$('mbd');b.innerHTML='';b.appendChild(node);const bt=$('mbt');bt.innerHTML='';
 (btns||[{l:'Close'}]).forEach(x=>{const e=btn(x.l,async()=>{if(x.f){const r=await x.f();if(r===false)return}closeModal()});if(x.p)e.className='on';bt.appendChild(e)});$('mdl').style.display='flex'}
const closeModal=()=>{$('mdl').style.display='none'};
const txt=h=>{const d=document.createElement('div');d.innerHTML=h;return d};
const presetName=()=>{const o=pre.options[pre.selectedIndex];return o?o.text:'optics'};
const sceneName=()=>practice?'Practice exercise':(curName||presetName());
const exportName=()=>sceneName().replace(/[^\w.-]+/g,'_').slice(0,60);
function updTitle(){document.title=(practice?'Practice: '+exTitle(practice.ex):sceneName()+(curId&&ser()!==savedJ?' \u2022 unsaved':''))+' \u2013 Ray tracing playground'}
function thumb(){const vs={...view};Object.assign(view,HOME);draw();const c=document.createElement('canvas');c.width=240;c.height=Math.round(240*H/W);const g=c.getContext('2d');g.fillStyle=css('--card');g.fillRect(0,0,c.width,c.height);g.drawImage(cv,0,0,c.width,c.height);Object.assign(view,vs);draw();return c.toDataURL('image/jpeg',.7)}
async function doSave(name,newRec){try{const rec={name,updated:Date.now(),data:ser(),thumb:thumb()};if(!newRec&&curId)rec.id=curId;const id=await DB.put(rec);curId=id;curName=name;savedJ=rec.data;updTitle();toast('Saved "'+name+'"')}catch(e){toast('Could not save: browser storage is unavailable');return false}}
function saveDlg(asNew){if(!sandboxOnly('Saving'))return;const inp=document.createElement('input');inp.style.width='100%';inp.value=curName||'My configuration';const d=txt('<div class="muted">Name</div>');d.appendChild(inp);
 modal(asNew?'Save as':'Save configuration',d,[{l:'Save',p:1,f:()=>doSave(inp.value.trim()||'Untitled',asNew||!curId)},{l:'Cancel'}]);setTimeout(()=>inp.select(),0)}
const sandboxOnly=w=>mode=='sandbox'||(toast(w+' applies to the sandbox: switch to Sandbox first'),false);
function saveCur(){if(!sandboxOnly('Saving'))return;curId?doSave(curName,false):saveDlg(false)}
function loadJSON(j,id,name){try{const o=JSON.parse(j);if(!Array.isArray(o.els)||!Array.isArray(o.objs)||!Array.isArray(o.rays))throw 0;if(mode!='sandbox')switchMode('sandbox');Object.assign(view,HOME);S.els=o.els;S.objs=o.objs;S.rays=o.rays;S.lines=o.lines||[];uid=o.uid||100}catch(e){toast('Not a valid configuration file');return}
 curId=id||null;curName=name||null;savedJ=id?ser():null;pre.value='';hist.u=[];hist.r=[];hist.cur=null;hist.key=null;S.prev=null;par=null;panel();draw();updBtns()}
function renameDlg(r){const inp=document.createElement('input');inp.style.width='100%';inp.value=r.name;const d=document.createElement('div');d.appendChild(inp);
 modal('Rename',d,[{l:'Rename',p:1,f:async()=>{const n=inp.value.trim();if(!n)return false;await DB.put({...r,name:n});if(curId==r.id)curName=n;updTitle();setTimeout(openDlg,0)}},{l:'Cancel',f:()=>{setTimeout(openDlg,0)}}])}
async function openDlg(){let list;try{list=(await DB.all()).sort((a,b)=>b.updated-a.updated)}catch(e){toast('Browser storage is unavailable');return}
 const d=document.createElement('div');if(!list.length)d.appendChild(txt('<div class="muted">No saved configurations yet. Use File \u2192 Save.</div>'));
 list.forEach(r=>{const row=document.createElement('div');row.className='cfgrow';const im=new Image();im.src=r.thumb;const nm=document.createElement('div');nm.className='nm';
  const b=document.createElement('b');b.textContent=r.name;const dt=document.createElement('div');dt.className='muted';dt.textContent=new Date(r.updated).toLocaleString();nm.append(b,dt);
  const bd=btn('Delete',async()=>{if(bd.dataset.s!='1'){bd.dataset.s='1';bd.textContent='Sure?';return}await DB.del(r.id);if(curId==r.id)curId=null;row.remove();updTitle()});
  row.append(im,nm,btn('Open',()=>{loadJSON(r.data,r.id,r.name);closeModal()}),btn('Rename',()=>renameDlg(r)),bd);d.appendChild(row)});
 modal('Saved configurations',d,[{l:'Close'}])}
async function dl(filename,data){const d=typeof claude!=='undefined'&&claude.use?await claude.use('downloads'):null;
 if(!d){const u=URL.createObjectURL(data instanceof Blob?data:new Blob([data],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),5000);toast('Exported '+filename);return} // plain browser download outside Claude
 try{await d.save({filename,data});toast('Exported '+filename)}catch(e){if(!e||e.code!='declined')toast('Could not export: '+((e&&(e.message||e.code))||'error'))}}
async function renderImage(){const root=document.documentElement,prev=root.dataset.theme;if(pref.light)root.dataset.theme='light';
 forceW=2000;exporting=true;const vs={...view};Object.assign(view,HOME);draw();const o=document.createElement('canvas');o.width=cv.width;o.height=cv.height;const c=o.getContext('2d');c.fillStyle=css('--card');c.fillRect(0,0,o.width,o.height);c.drawImage(cv,0,0);
 forceW=0;exporting=false;Object.assign(view,vs);if(prev)root.dataset.theme=prev;else delete root.dataset.theme;draw();return o}
async function exportImg(t){const o=await renderImage();o.toBlob(b=>dl(exportName()+'.'+t,b),t=='png'?'image/png':'image/jpeg',.92)}
const esc=t=>String(t).replace(/\u2032/g,"'").replace(/\u2225/g,'||').replace(/[^\x20-\x7e]/g,'?').replace(/[()\\]/g,m=>'\\'+m);
const wrap=(t,n)=>{const o=[];t=String(t);while(t.length>n){let i=t.lastIndexOf(' ',n);if(i<8)i=n;o.push(t.slice(0,i));t=' '+t.slice(i).trim()}o.push(t);return o};
function makePDF(jb,iw,ih,title,lines){const enc=new TextEncoder(),parts=[],off=[];let n=0;const P=u=>{parts.push(u);n+=u.length},T=t=>P(enc.encode(t));
 const w=560,h=Math.round(w*ih/iw),y=545-h;let c=`q ${w} 0 0 ${h} 30 ${y} cm /Im0 Do Q\nBT /F1 14 Tf 30 562 Td (${esc(title)}) Tj ET\nBT /F1 9 Tf 12 TL 610 545 Td\n`;lines.forEach(l=>c+=`(${esc(l)}) Tj T*\n`);c+='ET';
 T('%PDF-1.4\n');const O=(i,b)=>{off[i]=n;T(`${i} 0 obj\n${b}\nendobj\n`)};
 O(1,'<< /Type /Catalog /Pages 2 0 R >>');O(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
 O(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /XObject << /Im0 5 0 R >> /Font << /F1 6 0 R >> >> /Contents 4 0 R >>');
 O(4,`<< /Length ${enc.encode(c).length} >>\nstream\n${c}\nendstream`);
 off[5]=n;T(`5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${iw} /Height ${ih} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jb.length} >>\nstream\n`);P(jb);T('\nendstream\nendobj\n');
 O(6,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
 const x=n;T('xref\n0 7\n0000000000 65535 f \n');for(let i=1;i<=6;i++)T(String(off[i]).padStart(10,'0')+' 00000 n \n');T(`trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`);
 return new Blob(parts,{type:'application/pdf'})}
async function exportPDF(){const o=await renderImage(),bin=atob(o.toDataURL('image/jpeg',.92).split(',')[1]),jb=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)jb[i]=bin.charCodeAt(i);
 const L=['ELEMENTS'];S.els.forEach((e,i)=>L.push(...wrap(`${i+1}. ${kindName(e)}: x=${e.x}, f=${e.f}`,44)));
 L.push('','OBJECTS');S.objs.forEach((q,i)=>L.push(...wrap(`${i+1}. ${q.ext?'Arrow':'Point'}: x=${q.x}, y=${q.y}`,44)));
 L.push('','RAYS');S.rays.forEach((r,i)=>L.push(...wrap(`${i+1}. ${rayDesc(r)}${r.vis?'':' (hidden)'}`,44)));
 L.push('','RESULTS');$('out').textContent.split('\n').filter(Boolean).forEach(t=>L.push(...wrap(t,44)));
 dl(exportName()+'.pdf',makePDF(jb,o.width,o.height,sceneName(),L.slice(0,44)))}
function exportJSON(){if(!sandboxOnly('Exporting a configuration'))return;dl(exportName()+'.json',JSON.stringify(JSON.parse(ser()),null,1))}
$('imp').onchange=async e=>{const f=e.target.files[0];if(!f)return;loadJSON(await f.text(),null,f.name.replace(/\.json$/,''));e.target.value=''};
function applyTheme(){if(pref.theme=='auto')delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=pref.theme}
function setPref(o){Object.assign(pref,o);try{localStorage.setItem('raylab.prefs',JSON.stringify(pref))}catch(e){}applyTheme();draw()}
const tgl=id=>{$(id).checked=!$(id).checked};
function fDlg(){const inp=document.createElement('input');inp.type='number';inp.step='0.5';inp.value=pref.f;const d=txt('<div class="muted">Focal length given to new lenses and mirrors (grid units)</div>');d.appendChild(inp);
 modal('Default focal length',d,[{l:'OK',p:1,f:()=>{const v=Math.abs(+inp.value);if(!v)return false;setPref({f:v})}},{l:'Cancel'}])}
function shortcutsDlg(){const rows=[['Tools',[['M','Move'],['T','Trace ray'],['Shift+T','Parallel ray (hover a ray first)'],['L / B','Bold line (solid segment)'],['C','Construction line (dotted, infinite)'],['X','Mark answer (practice)'],['E / Enter','Evaluate (practice)']]],
 ['Add at the cursor',[['1','Converging lens'],['2','Diverging lens'],['3','Concave mirror'],['4','Convex mirror'],['P','Point object'],['A','Arrow object']]],
 ['View',[['+ / \u2212','Zoom in / out'],['0','Reset zoom to 100%'],['Ctrl + scroll, or pinch','Zoom at the pointer'],['Scroll, or Space + drag','Pan once the view is zoomed or moved']]],
 ['Rays and editing',[['R','Principal rays for all objects'],['H','Hide the ray under the cursor'],['Delete','Remove the element, object or ray under the cursor'],['Esc','Cancel / back to Move']]],
 ['View',[['V','Show / hide all rays'],['F','Focal planes'],['I','Object / image planes'],['G','Grid'],['S','Snap to grid']]],
 ['File and history',[['Ctrl+Z / Ctrl+Y','Undo / redo'],['Ctrl+S','Save'],['Ctrl+O','Open saved'],['Ctrl+E','Export PNG'],['Ctrl+Shift+E','Export PDF'],['?','This list']]]];
 const d=document.createElement('div');rows.forEach(([t,L])=>{const h=document.createElement('div');h.innerHTML='<b></b>';h.firstChild.textContent=t;h.style.marginTop='8px';d.appendChild(h);
  L.forEach(([k,v])=>{const r=document.createElement('div');r.className='row';r.style.margin='2px 0';const kb=document.createElement('code');kb.textContent=k;kb.style.cssText='min-width:110px;display:inline-block;background:var(--grid);padding:1px 6px;border-radius:4px';const sp=document.createElement('span');sp.textContent=v;r.append(kb,sp);d.appendChild(r)})});
 const n=document.createElement('div');n.className='muted';n.style.marginTop='8px';n.textContent='Digits use the physical number row, so they work on AZERTY keyboards without Shift. Mouse: drag things with Move; right-click for context menus. Touch: long-press for context menus, drag empty space with Move to pan, pinch to zoom; with the line and Mark tools, press, slide to the snap point and release.';d.appendChild(n);modal('Shortcuts, mouse and touch',d)}
const MENUS={
 file:()=>[{l:'New (empty sandbox)',f:()=>{pre.value='Empty sandbox';load('Empty sandbox')}},{l:'Open saved\u2026',k:'Ctrl+O',f:openDlg},{sep:1},{l:'Save',k:'Ctrl+S',f:saveCur,dis:mode!='sandbox'},{l:'Save as\u2026',f:()=>saveDlg(true),dis:mode!='sandbox'},{sep:1},
  {l:'Export image (PNG)',k:'Ctrl+E',f:()=>exportImg('png')},{l:'Export image (JPEG)',f:()=>exportImg('jpg')},{l:'Export PDF',k:'Ctrl+Shift+E',f:exportPDF},{sep:1},{l:'Export configuration (.json)',f:exportJSON,dis:mode!='sandbox'},{l:'Import configuration (.json)\u2026',f:()=>$('imp').click()}],
 edit:()=>[{l:'Undo',k:'Ctrl+Z',f:undo,dis:!hist.u.length},{l:'Redo',k:'Ctrl+Y',f:redo,dis:!hist.r.length},{sep:1},{l:'Add principal rays for all objects',k:'R',f:()=>S.objs.forEach((_,i)=>principal(i)),dis:!!practice},{l:'Remove all rays',f:()=>{S.rays=[]},dis:!!practice},{l:'Remove all construction lines',f:()=>{S.lines=[]}},{l:'Clear everything',f:()=>{S.els=[];S.objs=[];S.rays=[];S.lines=[]},dis:!!practice}],
 view:()=>[{l:'Rays',k:'V',chk:$('vall').checked,f:()=>tgl('vall')},{l:'Focal planes',k:'F',chk:$('fp').checked,f:()=>tgl('fp')},{l:'Principal planes H, H\u2032',chk:$('pp').checked,f:()=>tgl('pp')},{l:'Object / image planes',k:'I',chk:$('pl').checked,f:()=>tgl('pl')},{l:'Grid',k:'G',chk:pref.grid,f:()=>setPref({grid:!pref.grid})},{l:'Snap to grid',k:'S',chk:$('snap').checked,f:()=>tgl('snap')},{l:'Snap to symmetry (mirrors)',chk:$('snapSym').checked,f:()=>tgl('snapSym')},{sep:1},{l:'Zoom in',k:'+',f:()=>zoomStep(1)},{l:'Zoom out',k:'\u2212',f:()=>zoomStep(-1)},{l:'Reset zoom (100%)',k:'0',f:zoomReset}],
 prefs:()=>[{l:'Snap step 0.25',chk:pref.step==.25,f:()=>setPref({step:.25})},{l:'Snap step 0.5',chk:pref.step==.5,f:()=>setPref({step:.5})},{l:'Snap step 1',chk:pref.step==1,f:()=>setPref({step:1})},{sep:1},
  {l:'Theme: system',chk:pref.theme=='auto',f:()=>setPref({theme:'auto'})},{l:'Theme: light',chk:pref.theme=='light',f:()=>setPref({theme:'light'})},{l:'Theme: dark',chk:pref.theme=='dark',f:()=>setPref({theme:'dark'})},{sep:1},
  {l:'Export with light background',chk:pref.light,f:()=>setPref({light:!pref.light})},{l:'Default focal length ('+pref.f+')\u2026',f:fDlg}],
 help:()=>[{l:'Shortcuts, mouse and touch\u2026',k:'?',f:shortcutsDlg}]};
document.querySelectorAll('[data-m]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();const r=b.getBoundingClientRect();showMenu({clientX:r.left,clientY:r.bottom+2},MENUS[b.dataset.m]())});
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(e.key=='Escape')closeModal();if((e.ctrlKey||e.metaKey)&&k=='s'){e.preventDefault();saveCur()}if((e.ctrlKey||e.metaKey)&&k=='o'){e.preventDefault();openDlg()}if((e.ctrlKey||e.metaKey)&&k=='e'){e.preventDefault();e.shiftKey?exportPDF():exportImg('png')}});
let lastP=null;cv.addEventListener('pointermove',e=>{lastP=wp(e)});cv.addEventListener('pointerleave',()=>{lastP=null});
function hitAt(p){if(!p)return null;
 const ho=(S.hnd||[]).filter(h=>Math.hypot(h.x-p.x,h.y-p.y)<tol(.6)).sort((a,b)=>(a.k=='obj'?0:1)-(b.k=='obj'?0:1))[0];
 if(ho&&ho.k=='obj')return{k:'obj',i:ho.i};if(ho){const r=S.rays.find(q=>q.id==ho.id);if(r)return{k:'ray',r}}
 for(const e of S.els)if(Math.abs(e.x-p.x)<tol(.4)||(Math.abs(e.x-e.f-p.x)<tol(.4)&&Math.abs(p.y)<tol(.8))||(e.t=='L'&&Math.abs(e.x+e.f-p.x)<tol(.4)&&Math.abs(p.y)<tol(.8)))return{k:'el',e};
 let best=null,bd=tol(.25);(S.segs||[]).forEach(g=>g.a.forEach(a=>{const d=dseg(p,a);if(d<bd){bd=d;best=g}}));
 if(best){const r=S.rays.find(q=>q.id==best.id);if(r)return{k:'ray',r}}const hl=S.lines.find(l=>lineHit(l,p,.25));return hl?{k:'line',l:hl}:null}
addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||$('mdl').style.display=='flex')return;
 const k=e.key.toLowerCase(),sh=e.shiftKey,dg={Digit1:'L+',Digit2:'L-',Digit3:'M+',Digit4:'M-',Numpad1:'L+',Numpad2:'L-',Numpad3:'M+',Numpad4:'M-'}[e.code];let ok=true;
 if(zoomKey(k))return;
 if(practice&&!(['l','b','c','x','m','e','enter','escape','delete','backspace','g','s'].includes(k)||e.key=='?'))return;
 if(dg)add(dg,lastP||undefined);
 else if(k=='m')setTool('move');
 else if(k=='l'||k=='b')setTool('line');
 else if(k=='c')setTool('cons');
 else if(k=='x')setTool('mark');
 else if((k=='e'||k=='enter')&&practice)evaluate();
 else if(k=='t'){if(sh){const h=hitAt(lastP);if(h&&h.k=='ray'){startPar(h.r);draw()}else toast('Hover over a ray, then press Shift+T')}else setTool('trace')}
 else if(k=='p')add('P',lastP||undefined);
 else if(k=='a')add('A',lastP||undefined);
 else if(k=='r'){S.objs.forEach((_,i)=>principal(i));panel();draw()}
 else if(k=='h'){const h=hitAt(lastP);if(h&&h.k=='ray'){h.r.vis=false;panel();draw()}else toast('Hover over a ray, then press H')}
 else if(k=='delete'||k=='backspace'){const h=hitAt(lastP);if(h&&practice&&h.k!='line')toast('Only your own lines can be deleted in practice mode');else if(h){if(h.k=='obj')delObj(h.i);else if(h.k=='el')delEl(h.e);else if(h.k=='line')delLine(h.l);else delRay(h.r);panel();draw()}else toast('Hover over an element, object, ray or line, then press Delete')}
 else if(k=='v'){tgl('vall');draw()}else if(k=='f'){tgl('fp');draw()}else if(k=='i'){tgl('pl');draw()}else if(k=='g')setPref({grid:!pref.grid})
 else if(k=='s')tgl('snap')
 else if(k=='escape'){if(LP){LP=null;S.pl=null;draw()}else if(tool!='move')setTool('move')}
 else if(e.key=='?')shortcutsDlg();
 else ok=false;
 if(ok)e.preventDefault()});
applyTheme();
