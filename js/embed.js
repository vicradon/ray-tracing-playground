// Embed mode: ?embed=1&ex=<exercise id> shows one practice exercise and nothing else (no sandbox, menus or
// exercise picker), for a page that hosts the playground in a frame (Margin's Drills). The host drives it with
// messages and hears back:
//   host -> playground  {type:'check'} | {type:'hint'} | {type:'reveal'} | {type:'clear'} | {type:'load', ex}
//   playground -> host  {source:'optics-playground', type:'ready', ex}
//                       {source:'optics-playground', type:'result', ex, ok, fb:[[kind, text]], revealed}
//                       {source:'optics-playground', type:'size', h}   (content height, to size the frame)
// It also works on its own (open the address), with its own Check, Hint and Show solution buttons.
const EMBED = (() => { const q = new URLSearchParams(location.search); return q.get('embed') == '1' ? { ex: q.get('ex') || '', host: q.get('host') || '' } : null; })();
const toHost = (m) => { if (EMBED && parent !== window) parent.postMessage({ source: 'optics-playground', ...m }, '*'); };
function embedResult(r) { if (!EMBED) return; embedFb(); toHost({ type: 'result', ex: practice && practice.ex, ok: !!r.ok, fb: r.fb, revealed: !!(practice && practice.revealed) }); }
function embedFb() { // the hint and the feedback, under the canvas
  const box = $('embedFb'); if (!box || !practice) return; box.innerHTML = '';
  const line = (c, t) => { const d = mk('div', 'efl ' + c); d.textContent = ({ ok: '✓ ', bad: '✗ ', warn: '! ', hint: 'ℹ ' }[c] || '') + t; box.appendChild(d); };
  if (practice.hintTxt) line('hint', practice.hintTxt);
  if (practice.revealed) line('hint', 'Solution shown.');
  if (!document.body.classList.contains('hosted')) (practice.fb || []).forEach(([c, t]) => line(c, t)); // a host shows the result itself
  sendSize();
}
let sizeT = 0; const sendSize = () => { clearTimeout(sizeT); sizeT = setTimeout(() => toHost({ type: 'size', h: Math.ceil(document.querySelector('.app').getBoundingClientRect().height + 16) }), 30); };
if (EMBED) {
  document.body.classList.add('embed'); if (parent !== window) document.body.classList.add('hosted');
  buildToolbar($('embedBar'), [{ items: ['hint', 'show', 'clear'] }]);
  buildToolbar($('tbPrac'), [{ items: ['undo', 'redo'], cls: 'ehist' }]); updBtns(); // the header with undo / redo is hidden here, so they sit at the end of the tools
  if (parent !== window) toast = () => {}; // the host says right or wrong
  const d = EX.find((e) => e.id == EMBED.ex);
  if (d) newExercise(d.id); else { document.body.classList.add('embed-missing'); $('embedFb') && ($('embedFb').textContent = 'Exercise "' + EMBED.ex + '" not found.'); }
  { const pu = pracUI; pracUI = function () { pu(); embedFb(); }; }
  // Next, the sandbox and the exercise picker do not exist here
  ['mSand', 'mPrac'].forEach((id) => { const b = $(id); if (b) b.onclick = null; });
  addEventListener('message', (e) => {
    const m = e.data; if (!m || typeof m != 'object' || e.source !== parent) return;
    if (m.type == 'check') evaluate();
    else if (m.type == 'hint') hintStep();
    else if (m.type == 'reveal') document.querySelector('[data-act=show]').click();
    else if (m.type == 'clear') document.querySelector('[data-act=clear]').click();
    else if (m.type == 'load' && EX.find((x) => x.id == m.ex)) newExercise(m.ex);
  });
  addEventListener('resize', sendSize);
  if (d) heightGrip(d);
  toHost({ type: 'ready', ex: d ? d.id : null }); sendSize();
}
// A grip under the canvas: drag it down for a taller window (more squares above and below the axis), double tap
// for the exercise's own height. Remembered per exercise on this device.
function heightGrip(d) {
  const base = d.h || 14, key = 'optics.embedH.' + d.id, MAX = 40;
  const setH = (h) => { h = Math.max(base, Math.min(MAX, h)); const dh = h - H; if (Math.abs(dh) < 1e-6) return; H = h; view.y0 += dh / 2 / view.z; draw(); sendSize(); };
  try { const v = +localStorage.getItem(key); if (v > base) setH(v); } catch (e) {}
  const save = () => { try { if (H > base + 1e-6) localStorage.setItem(key, String(H)); else localStorage.removeItem(key); } catch (e) {} };
  const g = mk('div', 'hgrip'); g.title = 'Drag to make the canvas taller · double tap to reset'; g.setAttribute('role', 'separator'); g.setAttribute('aria-label', 'Canvas height'); g.innerHTML = '<i></i>';
  document.querySelector('.cvw').after(g);
  let st = null, lastTap = 0;
  g.addEventListener('pointerdown', (e) => { e.preventDefault(); g.setPointerCapture(e.pointerId); st = { y: e.clientY, h: H, moved: false }; g.classList.add('on'); });
  g.addEventListener('pointermove', (e) => { if (!st) return; const dy = e.clientY - st.y; if (Math.abs(dy) > 3) st.moved = true; setH(st.h + dy * W / cv.clientWidth); });
  const end = () => { if (!st) return; const tap = !st.moved; st = null; g.classList.remove('on'); if (tap) { const now = Date.now(); if (now - lastTap < 350) { setH(base); lastTap = 0; } else lastTap = now; } save(); };
  g.addEventListener('pointerup', end); g.addEventListener('pointercancel', end);
}
// ---- Apple Pencil and touch on the canvas (all modes)
// iOS treats a pen on the page as scrolling or as Scribble (handwriting to text) unless the touch events are
// cancelled; strokes then get cut and the page stalls while it decides.
for (const t of ['touchstart', 'touchmove']) cv.addEventListener(t, (e) => { if (e.touches.length < 2 || EMBED) e.preventDefault(); }, { passive: false });
// Palm rejection: once a pen has been used, a finger on the canvas is a palm (pinch-zoom still works without a pen,
// and the zoom buttons always do).
let penSeen = false;
cv.addEventListener('pointerdown', (e) => { if (e.pointerType == 'pen') penSeen = true; else if (e.pointerType == 'touch' && penSeen) { e.stopImmediatePropagation(); e.preventDefault(); } }, { capture: true });
for (const t of ['pointermove', 'pointerup']) cv.addEventListener(t, (e) => { if (e.pointerType == 'touch' && penSeen) e.stopImmediatePropagation(); }, { capture: true });
