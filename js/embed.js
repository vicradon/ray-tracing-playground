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
  (practice.fb || []).forEach(([c, t]) => line(c, t));
  sendSize();
}
let sizeT = 0; const sendSize = () => { clearTimeout(sizeT); sizeT = setTimeout(() => toHost({ type: 'size', h: Math.ceil(document.querySelector('.app').getBoundingClientRect().height + 16) }), 30); };
if (EMBED) {
  document.body.classList.add('embed'); if (parent !== window) document.body.classList.add('hosted');
  buildToolbar($('embedBar'), [{ items: ['hint', 'show', 'clear'] }]);
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
  toHost({ type: 'ready', ex: d ? d.id : null }); sendSize();
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
