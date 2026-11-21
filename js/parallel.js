// Parallel: pick a ray, a line or the exam's guideline, choose Parallel, then press a point: a dotted construction
// line through that point, parallel to what was picked, across the whole canvas. While the pointer is down a ghost
// follows it; the line is placed on release. The point snaps to O, F, F′ (C and S on a mirror) and to where a focal
// plane crosses a ray, a line or the guideline. In practice (and the Drills embed) tapping with Move picks the ray
// or line and shows a small bar with a Parallel button; in the sandbox the inspector and the menus offer it.
const PAR_TIP = 'Tap a point. The parallel goes through it.';
const PAR_ICON = '<svg viewBox="0 0 24 24"><path d="M4 17L17 4M7 20L20 7"/></svg>';
let pSel = null, menuP = null; // pSel: what was picked in practice {name, a: [x1, y1, x2, y2], inf}; menuP: where a menu or tap was

function startParallel(d) {
  if (!d || Math.hypot(d.dx, d.dy) < 1e-9) return;
  parL = { dx: d.dx, dy: d.dy }; LP = null; S.pl = null; S.snapPt = null; S.snapLbl = ''; pSel = null; bar(); draw();
}
function startParLine(a, b) { startParallel({ dx: b.x - a.x, dy: b.y - a.y }); }
// a ray's direction where it was picked (its nearest drawn segment), else its incident direction
function rayDir(r, p) {
  if (p) { let best = null, bd = 1e9; (S.segs || []).forEach((g) => { if (g.id !== r.id) return; g.a.forEach((a) => { const d = dseg(p, a); if (d < bd) { bd = d; best = a; } }); }); if (best) return { dx: best[2] - best[0], dy: best[3] - best[1] }; }
  const L = lineOf(r); return L ? { dx: 1, dy: L.s } : null;
}
function startPar(r, p) { startParallel(rayDir(r, p)); }
function endParLine() { parL = null; if (drag && drag.k == 'pq') drag = null; S.pl = null; S.snapPt = null; S.snapLbl = ''; bar(); draw(); }
function placeParLine(q) {
  const d = parL, n = Math.hypot(d.dx, d.dy) || 1;
  S.lines.push({ id: uid++, a: { x: q.x, y: q.y }, b: { x: rnd4(q.x + 10 * d.dx / n), y: rnd4(q.y + 10 * d.dy / n) }, vis: true, k: 'cons' });
  endParLine(); panel(); draw();
}
function parSnap(p) {
  S.snapPt = null; S.snapLbl = ''; const c = [], planes = [], segs = [];
  S.els.forEach((e) => ptsOf(e).forEach((k) => {
    if (k == 'H' || k == 'Hp') return;
    const T = ptOf(e, k); c.push({ x: T.x, y: T.y, lbl: ptName(e, k) });
    if (k == 'F' || k == 'Fp') planes.push({ x: T.x, lbl: 'focal plane ' + ptName(e, k) }); // only shown focal points: an exam that hides F leaves finding it to you
  }));
  (S.segs || []).forEach((g) => g.a.forEach((a) => segs.push(a)));
  S.lines.forEach((l) => { if (!l.vis) return; if (l.k == 'bold') segs.push([l.a.x, l.a.y, l.b.x, l.b.y]); else { const dx = l.b.x - l.a.x, dy = l.b.y - l.a.y, n = Math.hypot(dx, dy) || 1; segs.push([l.a.x - dx / n * FAR, l.a.y - dy / n * FAR, l.b.x + dx / n * FAR, l.b.y + dy / n * FAR]); } });
  planes.forEach((q) => segs.forEach((s) => { const k = sInter(s, [q.x, -FAR, q.x, FAR]); if (k) c.push({ x: k.x, y: k.y, lbl: q.lbl + ' crossing' }); }));
  let best = null, bd = tol(.5); c.forEach((q) => { const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = q; } });
  if (best) { S.snapPt = { x: best.x, y: best.y }; S.snapLbl = best.lbl; return { x: rnd4(best.x), y: rnd4(best.y) }; }
  return { x: sn(p.x), y: sn(p.y) };
}
// practice: a tap with Move picks the nearest ray segment, guideline segment or line
function pickPar(p) {
  menuP = p; let best = null, bd = tol(.3);
  (S.segs || []).forEach((g) => g.a.forEach((a) => { const d = dseg(p, a); if (d < bd) { bd = d; best = { name: g.id == 'given' ? 'Guideline' : practice && practice.task == 'ray' && g.id == practice.rid ? 'Incident ray' : 'Ray', a }; } }));
  S.lines.forEach((l, i) => { if (!l.vis) return; const d = l.k == 'bold' ? dseg(p, [l.a.x, l.a.y, l.b.x, l.b.y]) : dLine(p, l); if (d < bd) { bd = d; best = { name: (l.k == 'bold' ? 'Line ' : 'Construction line ') + (i + 1), a: [l.a.x, l.a.y, l.b.x, l.b.y], inf: l.k != 'bold' }; } });
  pSel = best; bar(); draw();
}
function drawParSel() {
  if (!pSel || exporting) return; const [x1, y1, x2, y2] = pSel.a, n = Math.hypot(x2 - x1, y2 - y1) || 1, ex = pSel.inf ? FAR / n : 0;
  cx.globalAlpha = .25; ln(x1 - (x2 - x1) * ex, y1 - (y2 - y1) * ex, x2 + (x2 - x1) * ex, y2 + (y2 - y1) * ex, '#4a7dff', 9); cx.globalAlpha = 1;
}
function clearPar() { pSel = null; if (parL) endParLine(); else bar(); }
// the bar over the canvas: what was picked with a Parallel button, or what to do while placing
function bar() {
  let t = $('pbar');
  if (!t) { t = document.createElement('div'); t.id = 'pbar'; t.className = 'partip'; cv.parentElement.appendChild(t); }
  clearTimeout(bar.t); t.classList.remove('brief', 'gone');
  if (parL) { t.innerHTML = '<span>' + PAR_TIP + '</span>'; t.classList.add('brief'); bar.t = setTimeout(() => t.classList.add('gone'), 1000); } // a short nudge; Esc or another tool cancels
  else if (pSel && practice) t.innerHTML = '<span>' + pSel.name + '</span><button type="button" class="pri" data-par>' + PAR_ICON + 'Parallel</button><button type="button" data-x aria-label="Deselect" title="Deselect">×</button>';
  else { t.style.display = 'none'; return; }
  t.style.display = 'flex';
  const x = t.querySelector('[data-x]'); if (x) x.onclick = () => { if (parL) endParLine(); else { pSel = null; bar(); draw(); } };
  const pb = t.querySelector('[data-par]'); if (pb) pb.onclick = () => { const a = pSel.a; startParallel({ dx: a[2] - a[0], dy: a[3] - a[1] }); };
}
// dragging an end of a bold line: it only gets longer or shorter, along its own direction (the grid snaps the end)
function extendTo(l, end, p) {
  const o = end == 'a' ? l.b : l.a, q = l[end], dx = q.x - o.x, dy = q.y - o.y, n = Math.hypot(dx, dy); if (n < 1e-9) return q;
  const ux = dx / n, uy = dy / n, st = $('snap').checked ? pref.step : 0;
  let t = (p.x - o.x) * ux + (p.y - o.y) * uy;
  if (st) { if (Math.abs(ux) >= Math.abs(uy)) { const x = Math.round((o.x + t * ux) / st) * st; t = (x - o.x) / ux; } else { const y = Math.round((o.y + t * uy) / st) * st; t = (y - o.y) / uy; } }
  t = Math.max(t, Math.max(st, .25)); // never onto or past the other end
  S.snapPt = null; S.snapLbl = ''; return { x: rnd4(o.x + t * ux), y: rnd4(o.y + t * uy) };
}
