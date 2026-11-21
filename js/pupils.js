// Pupils: an aperture stop (or any given pupil) and its images through the system, the chief and marginal rays,
// and the "locate the pupils" practice task.
//
// The scene holds at most one given pupil, S.pupil = {x, r, sp}: its position, half-height (half the diameter) and
// the space it lives in (0 = object space, before the first element; k = after element k; n = image space).
// Its image in every other space follows from the conjugation formula, element by element: forwards through the
// elements after it, backwards through the elements before it. The image in object space is the entry pupil, the
// one in image space the exit pupil, those in between the intermediate pupils. Lens systems only (mirrors fold the
// light back, which this does not follow).
const PUPC = '#D23B3B', PUPC2 = '#2F6FED';
function pupilSpaces() { // [{x, r, given}] for spaces 0..n, or null
  const E = srt(), p = S.pupil;
  if (!p || !E.length || E.some((e) => e.t == 'M')) return null;
  const n = E.length, sp = Math.max(0, Math.min(n, p.sp | 0)), P = [];
  P[sp] = { x: p.x, r: p.r, given: true };
  for (let j = sp + 1; j <= n; j++) { // forwards through element j-1
    const e = E[j - 1], q = P[j - 1]; if (!q) { P[j] = null; continue; }
    const u = q.x - e.x; if (Math.abs(u) < 1e-9) { P[j] = { x: e.x, r: q.r }; continue; }
    const k = 1 / e.f + 1 / u; if (Math.abs(k) < 1e-9) { P[j] = null; continue; } // at infinity
    const v = 1 / k; P[j] = { x: e.x + v, r: q.r * v / u };
  }
  for (let j = sp - 1; j >= 0; j--) { // backwards through element j
    const e = E[j], q = P[j + 1]; if (!q) { P[j] = null; continue; }
    const v = q.x - e.x; if (Math.abs(v) < 1e-9) { P[j] = { x: e.x, r: q.r }; continue; }
    const k = 1 / v - 1 / e.f; if (Math.abs(k) < 1e-9) { P[j] = null; continue; }
    const u = 1 / k; P[j] = { x: e.x + u, r: q.r * u / v };
  }
  return P;
}
const pupilName = (j, n) => j == 0 ? 'P entry' : j == n ? 'P exit' : n == 2 ? 'P int' : 'P int ' + j;
function pupilSym(x, r, c, lab, w) { // the course symbol: a bar at each edge with a short stub away from the axis
  const a = Math.abs(r), s = .28 / view.z, t = .45 / view.z;
  ln(x - s, a, x + s, a, c, w || 2.2); ln(x, a, x, a + t, c, w || 2.2);
  ln(x - s, -a, x + s, -a, c, w || 2.2); ln(x, -a, x, -a - t, c, w || 2.2);
  if (lab) txo(lab, x, a + t, -.45, .35, c, 15);
}
const pupOn = () => $('pup') && $('pup').checked && (!practice || practice.revealed);
function traceLine(P, s) { const e0 = srt()[0]; if (!e0) return null; const h = P.y + s * (e0.x - P.x), T = prop(h, s); return T ? { L: { P, s }, T, h } : null; }
function drawPupils(hnd, E) {
  const p = S.pupil; if (!p) return;
  const P = pupilSpaces(), n = E.length;
  pupilSym(p.x, p.r, PUPC, P ? pupilName(Math.max(0, Math.min(n, p.sp | 0)), n) : 'P');
  if (!practice) hnd.push({ k: 'pup', x: p.x, y: Math.abs(p.r) });
  if (practice && practice.task == 'pupils') (practice.pups || []).forEach((q, i) => { pupilSym(q.x, q.r, '#E08A00', 'yours ' + (i + 1), 2); hnd.push({ k: 'pp', i, x: q.x, y: Math.abs(q.r) }); });
  if (!P || !pupOn()) return;
  P.forEach((q, j) => { if (q && !q.given) pupilSym(q.x, q.r, PUPC2, pupilName(j, n)); });
  // chief ray (edge of the object to the centre of the entry pupil) and marginal ray (foot of the object to its edge)
  const o = S.objs[0], pe = P[0]; if (!o || !pe || Math.abs(o.x - pe.x) < 1e-6) return;
  const m = traceLine({ x: o.x, y: 0 }, pe.r / (pe.x - o.x)); if (m) drawTrace(m, '#1f9d55', [7, 3], null, null);
  if (Math.abs(o.y) > 1e-6) { const c = traceLine({ x: o.x, y: o.y }, -o.y / (pe.x - o.x)); if (c) drawTrace(c, '#9b4dca', [7, 3], null, null); }
}
// ---- dragging the given pupil (sandbox): its handle sits on its upper edge; x moves it, y sets its size
cv.addEventListener('pointermove', (ev) => {
  if (!drag || !S.pupil) return; const p = wp(ev);
  if (drag.k == 'pup') { S.pupil.x = sn(clx(p.x)); S.pupil.r = Math.max(.25, Math.min(6.5, Math.abs(sn(p.y)))); }
  if (drag.k == 'pp' && practice && practice.pups && practice.pups[drag.i]) { const q = snapAt(p); practice.pups[drag.i] = { x: q.x, r: Math.max(.1, Math.abs(q.y)) }; }
}, true);
// ---- practice: locate the pupils
function evalPupils() {
  const P = pupilSpaces(), n = srt().length, fb = [], mine = (practice.pups || []).slice();
  if (!P) return { ok: false, fb: [['warn', 'This scene has no pupil to find.']] };
  let ok = true;
  P.forEach((q, j) => {
    if (!q || q.given) return;
    const nm = pupilName(j, n).replace('P ', '') + ' pupil';
    if (!mine.length) { ok = false; fb.push(['bad', `${nm[0].toUpperCase() + nm.slice(1)}: not placed yet.`]); return; }
    let bi = 0; mine.forEach((m, i) => { if (Math.abs(m.x - q.x) < Math.abs(mine[bi].x - q.x)) bi = i; });
    const m = mine[bi], dx = Math.abs(m.x - q.x), dr = Math.abs(Math.abs(m.r) - Math.abs(q.r)), tolR = Math.max(.25, .1 * Math.abs(q.r));
    if (dx <= .35 && dr <= tolR) { fb.push(['ok', `${nm[0].toUpperCase() + nm.slice(1)}: right place and size.`]); mine.splice(bi, 1); return; }
    ok = false;
    if (dx <= .35) { fb.push(['bad', `${nm[0].toUpperCase() + nm.slice(1)}: right place, but ${Math.abs(m.r) > Math.abs(q.r) ? 'too big' : 'too small'} (half-height ${f2(Math.abs(m.r))} for ${f2(Math.abs(q.r))}).`]); mine.splice(bi, 1); }
    else fb.push(['bad', `${nm[0].toUpperCase() + nm.slice(1)}: not found (nearest of yours is ${f2(dx)} away).`]);
  });
  if (mine.length) fb.push(['warn', `${mine.length} extra pupil${mine.length > 1 ? 's' : ''} placed.`]);
  fb.unshift([ok ? 'ok' : 'bad', ok ? 'Correct: all the pupils are in place.' : 'Not correct yet.']);
  return { ok, fb };
}
const PUP_HINTS = [
  'Each pupil is the image of the given one through the elements between them. Light goes left to right: to go towards the exit, image the pupil through the next lens; to go towards the entry, find the object whose image through the previous lens is the pupil.',
  'Construct it like any image: from the top of the given pupil, draw a ray parallel to the axis and a ray through the centre O of the lens, continued (or extended backwards) until they meet.',
  'Pupils can be virtual: the entry pupil often lies behind the first lens. Use extended (dotted) construction lines.'];
// hook the pupils task into the practice flow
{
  const ev0 = evaluate, hint0 = hintStep, msg0 = practiceMsg, ui0 = pracUI, start0 = startPractice, build0 = buildExercise;
  evaluate = function () { if (practice && practice.task == 'pupils') { const r = evalPupils(); practice.fb = r.fb; pracUI(); toast(r.ok ? 'Correct!' : 'Not yet, see the feedback'); emitResult(r); return; } ev0(); };
  hintStep = function () { if (practice && practice.task == 'pupils') { practice.hintTxt = nextHint() ? PUP_HINTS[practice.hint - 1] : ''; pracUI(); draw(); return; } hint0(); };
  practiceMsg = function () { return practice && practice.task == 'pupils' ? exTitle(practice.ex) + '\nPractice: locate the other pupils from the given one (red). Place each with the Pupil tool: tap where its upper edge goes (it is drawn symmetric about the axis). Construction lines help. Then Check.' : msg0(); };
  pracUI = function () { ui0(); if (practice && practice.task == 'pupils') $('ptask').textContent = 'Locate the ' + (srt().length > 1 ? 'other ' : '') + 'pupils from the given one: place each with the Pupil tool (tap its upper edge), then Check.'; setDis('[data-tool=pupil]', !(practice && practice.task == 'pupils')); };
  startPractice = function (task, ex) { if (task == 'pupils') { S.lines = []; practice = { task, ex, rid: null, revealed: false, hint: 0, ans: null, pups: [], fb: [], hintTxt: '' }; setTool('pupil'); panel(); draw(); return; } start0(task, ex); };
  buildExercise = function (d) { S.pupil = d.pupil ? { x: d.pupil[0], r: d.pupil[1], sp: d.pupil[2] } : null; if (d.task == 'pupils') { exScene(d); pre.value = ''; panel(); draw(); return; } build0(d); };
}
// the result of a Check, for a page that embeds the playground (see embed.js); a no-op otherwise
function emitResult(r) { if (typeof embedResult == 'function') embedResult(r); }
