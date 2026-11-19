// The "focal point of a system" task (exam question c): mark the image focal point F′ of the whole system with the
// Mark tool and give its focal length f′ as read on the grid (in squares, or in mm when the exercise sets a scale:
// d.mm = millimetres per square). Checked: F′ within 0.35 square, f′ within 4% (at least a quarter of a square).
function sysFocal() { // {F: x of F′, Hp: x of H′, f: f′ in squares} or null (afocal)
  const T = prop(1, 0); if (!T || Math.abs(T.fin.dy) < 1e-9) return null;
  const f = T.fin, Fx = f.x + (-f.y / f.dy) * f.dx, P = principalPlanes();
  return P ? { F: Fx, Hp: P.Hp, f: Fx - P.Hp } : null;
}
const exDef = (id) => EX.find((e) => e.id == id) || {};
const fUnit = () => { const d = practice && exDef(practice.ex); return d && d.mm ? 'mm' : 'squares'; };
function evalFocal() {
  const T = sysFocal(), fb = []; if (!T) return { ok: false, fb: [['warn', 'This system is afocal: it has no focal point.']] };
  const d = exDef(practice.ex), k = d.mm || 1, unit = fUnit();
  let posOK = false, fOK = false;
  if (!practice.ans) fb.push(['warn', 'Mark F′ with the Mark tool.']);
  else { const dx = Math.hypot(practice.ans.x - T.F, practice.ans.y); posOK = dx <= .35; fb.push([posOK ? 'ok' : 'bad', posOK ? `F′ is right (off by ${f2(dx)} square).` : `F′ is off by ${f2(dx)} squares.`]); }
  const v = parseFloat(String(practice.fval || '').replace(',', '.'));
  if (!isFinite(v)) fb.push(['warn', `Give f′ (in ${unit}).`]);
  else { const truth = T.f * k, tolV = Math.max(.25 * k, .04 * Math.abs(truth)); fOK = Math.abs(v - truth) <= tolV;
    fb.push([fOK ? 'ok' : 'bad', fOK ? `f′ = ${f2(v)} ${unit} is right.` : `f′ = ${f2(v)} ${unit} is not right${Math.abs(v + truth) <= tolV ? ' (check its sign)' : ''}.`]); }
  const ok = posOK && fOK; fb.unshift([ok ? 'ok' : 'bad', ok ? 'Correct: focal point and focal length.' : 'Not correct yet.']);
  return { ok, fb };
}
const FOCAL_HINTS = [
  'F′ is where a ray that enters parallel to the axis crosses the axis after the last element. Draw one: through the first lens towards its F′, then on through the next lens with a guideline through its centre and its focal plane.',
  'For f′, find H′: extend the ray leaving the system backwards until it meets the line of the incoming parallel ray. H′ is the plane through that point; f′ is the distance from H′ to F′.',
  'Mind the sign: f′ is positive when F′ lies after H′ (to its right).'];
{
  const ev0 = evaluate, hint0 = hintStep, msg0 = practiceMsg, ui0 = pracUI, start0 = startPractice;
  evaluate = function () { if (practice && practice.task == 'focal') { const r = evalFocal(); practice.fb = r.fb; pracUI(); toast(r.ok ? 'Correct!' : 'Not yet, see the feedback'); emitResult(r); return; } ev0(); };
  hintStep = function () { if (practice && practice.task == 'focal') { practice.hint = Math.min(3, practice.hint + 1); practice.hintTxt = FOCAL_HINTS[practice.hint - 1]; pracUI(); draw(); return; } hint0(); };
  practiceMsg = function () { return practice && practice.task == 'focal' ? exTitle(practice.ex) + '\nPractice: locate the image focal point F′ of the system (Mark tool) and give its focal length f′ (' + fUnit() + '), then Check.' : msg0(); };
  startPractice = function (task, ex) { if (task == 'focal') { S.lines = []; practice = { task, ex, rid: null, revealed: false, hint: 0, ans: null, fval: '', fb: [], hintTxt: '' }; $('pp').checked = false; setTool('line'); panel(); draw(); return; } start0(task, ex); };
  pracUI = function () {
    ui0(); const on = practice && practice.task == 'focal';
    if (on) { $('ptask').textContent = 'Locate the image focal point F′ of the system: construct it, mark it with Mark, give f′ below, then Check.'; setDis('[data-tool=mark]', false); }
    let box = $('fbox');
    if (!box) { box = mk('div', 'fbox'); box.id = 'fbox'; box.innerHTML = '<label>f′ = <input id="fval" type="text" inputmode="decimal" autocomplete="off"> <span id="funit"></span></label>'; $('ptask').after(box); $('fval').oninput = (e) => { if (practice) practice.fval = e.target.value; }; }
    box.hidden = !on; if (on) { $('funit').textContent = fUnit(); if (document.activeElement !== $('fval')) $('fval').value = practice.fval || ''; }
    const eb = $('embedBar'); if (eb && on && box.parentNode !== eb && document.body.classList.contains('embed')) eb.prepend(box);
  };
}
