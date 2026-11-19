// Optical Engineering (UJM) past exams, Exercise 1 (ray tracing), copied square by square from the exam sheets.
// Units are grid squares (x from the left edge of the exam's frame, y up from the axis). The c and d figures are
// twice as wide, shown at half zoom on a lower canvas (h 7). Margin's Drills plays these through embed mode.
const WIDE = { h: 7, view: { z: .5, x0: 0, y0: 7 } }, NARROW = { view: { z: 1, x0: 0, y0: 7 } };
const S_ONLY = { m: ['O'] };
const OE = (id, title, d) => ({ id, grp: 'oe-exams', title, ...d });
const OE_MIRROR_B = { task: 'ray', els: [['M', 11, 5, S_ONLY]], ray: [3.4, 5.6], given: [[0, -9.33, 11, -2], [11, -2, 1.62, 8]], ...NARROW };
const EXAMS = [
  // 2020-21 exam
  OE('oe20-1a', '2020-21 · a) Image through a mirror, using the guideline ray', { task: 'image', els: [['M', 9, -3, S_ONLY]], obj: [17, 0], given: [[0, -.77, 9, -3], [9, -3, 5, -8]], ...NARROW }),
  OE('oe20-1b', '2020-21 · b) Outgoing ray through a thick lens', { task: 'ray', els: [['T', 11, 9, { xp: 7, surf: [[6, 5], [12, 13]] }]], ray: [3, 5.2], ...NARROW }),
  OE('oe20-1c', '2020-21 · c) Image of AB through two lenses', { task: 'image', els: [['L', 10, -8], ['L', 22, 7]], obj: [16, 3], ext: true, ...WIDE }),
  OE('oe20-1d', '2020-21 · d) Intermediate and exit pupils from the entry pupil', { task: 'pupils', els: [['L', 10, -8], ['L', 22, 7]], pupil: [4, 5, 0], ...WIDE }),
  // 2020-21 second chance
  OE('oe20b-1a', '2020-21 (2nd chance) · a) Image of a virtual object', { task: 'image', els: [['L', 9, -3]], obj: [17, 0], ...NARROW }),
  OE('oe20b-1b', '2020-21 (2nd chance) · b) Outgoing ray from a mirror, using the guideline ray', OE_MIRROR_B),
  OE('oe20b-1c', '2020-21 (2nd chance) · c) Focal point and focal length of the system', { task: 'focal', els: [['L', 14, 12], ['L', 24, -6]], ...WIDE }),
  OE('oe20b-1d', '2020-21 (2nd chance) · d) Intermediate and exit pupils from the entry pupil', { task: 'pupils', els: [['L', 14, 12], ['L', 24, -6]], pupil: [9, 4, 0], ...WIDE }),
  // December 2021
  OE('oe21-1a', 'Dec 2021 · a) Image of a virtual object', { task: 'image', els: [['L', 9, -3]], obj: [17, 0], ...NARROW }),
  OE('oe21-1b', 'Dec 2021 · b) Outgoing ray from a mirror (the guideline ray is reflected onto itself)', { task: 'ray', els: [['M', 9, -4, S_ONLY]], ray: [1.6, 5.2], given: [[0, -4.86, 9, -2.29]], ...NARROW }),
  OE('oe21-1c', 'Dec 2021 · c) Focal point and focal length of the system', { task: 'focal', els: [['L', 13, 12], ['L', 23, -5]], ...WIDE }),
  OE('oe21-1d', 'Dec 2021 · d) Entry and exit pupils from the intermediate pupil', { task: 'pupils', els: [['L', 13, 12], ['L', 23, -5]], pupil: [19, 3, 1], ...WIDE }),
  // December 2021, second chance
  OE('oe21b-1a', 'Dec 2021 (2nd chance) · a) Image of a virtual object', { task: 'image', els: [['L', 9, 4]], obj: [13, 4], ...NARROW }),
  OE('oe21b-1b', 'Dec 2021 (2nd chance) · b) Outgoing ray from a mirror, using the guideline ray', { task: 'ray', els: [['M', 11, 4, S_ONLY]], ray: [4, 4], given: [[0, -5.33, 11, -3], [11, -3, 0, 7.58]], ...NARROW }),
  OE('oe21b-1c', 'Dec 2021 (2nd chance) · c) Focal point and focal length of the system', { task: 'focal', els: [['L', 12, 17], ['L', 25, -9]], ...WIDE }),
  OE('oe21b-1d', 'Dec 2021 (2nd chance) · d) Entry and exit pupils from the intermediate pupil', { task: 'pupils', els: [['L', 12, 17], ['L', 25, -9]], pupil: [21, 3, 1], ...WIDE }),
  // October 2022
  OE('oe22-1a', 'Oct 2022 · a) Image of a virtual object', { task: 'image', els: [['L', 9, 4]], obj: [13, 4], ...NARROW }),
  OE('oe22-1b', 'Oct 2022 · b) Outgoing ray through a lens, using the guideline ray', { task: 'ray', els: [['L', 9, -3, S_ONLY]], ray: [3.4, 5.2], given: [[0, -4.8, 9, -3], [9, -3, 16, -8.6]], ...NARROW }),
  OE('oe22-1c', 'Oct 2022 · c) Focal point and focal length of the system', { task: 'focal', els: [['L', 10, 18], ['L', 24, -10]], ...WIDE }),
  OE('oe22-1d', 'Oct 2022 · d) Entry and exit pupils from the intermediate pupil', { task: 'pupils', els: [['L', 10, 18], ['L', 24, -10]], pupil: [20, 3, 1], ...WIDE }),
  // January 2023, second chance (1 square = 5 mm)
  OE('oe23b-1a', 'Jan 2023 (2nd chance) · a) Image of a virtual object through a mirror', { task: 'image', els: [['M', 9, -4]], obj: [11, 2], ...NARROW }),
  OE('oe23b-1b', 'Jan 2023 (2nd chance) · b) Outgoing ray from a mirror, using the guideline ray', OE_MIRROR_B),
  OE('oe23b-1c', 'Jan 2023 (2nd chance) · c) Focal point and focal length (1 square = 5 mm)', { task: 'focal', mm: 5, els: [['L', 9, 19], ['L', 25, -9]], ...WIDE }),
  OE('oe23b-1d', 'Jan 2023 (2nd chance) · d) Entry and exit pupils from the intermediate pupil', { task: 'pupils', els: [['L', 9, 19], ['L', 25, -9]], pupil: [19, 3, 1], ...WIDE }),
  // 6 December 2024 (1 square = 5 mm)
  OE('oe24-1a', '6 Dec 2024 · a) Image of a virtual object', { task: 'image', els: [['L', 9, -5]], obj: [11, 3], ...NARROW }),
  OE('oe24-1b', '6 Dec 2024 · b) Outgoing ray from a mirror, using the guideline ray', OE_MIRROR_B),
  OE('oe24-1c', '6 Dec 2024 · c) Focal point and focal length (1 square = 5 mm)', { task: 'focal', mm: 5, els: [['L', 15, 13], ['L', 25, -8]], ...WIDE }),
  OE('oe24-1d', '6 Dec 2024 · d) Entry and exit pupils from the intermediate pupil', { task: 'pupils', els: [['L', 15, 13], ['L', 25, -8]], pupil: [21, 4, 1], ...WIDE }),
  // 16 December 2024 (1 square = 5 mm)
  OE('oe24b-1a', '16 Dec 2024 · a) Image through a mirror', { task: 'image', els: [['M', 9, -4]], obj: [5, 4], ...NARROW }),
  OE('oe24b-1b', '16 Dec 2024 · b) Outgoing ray through a lens, using the guideline ray', { task: 'ray', els: [['L', 9, -6, S_ONLY]], ray: [2, 5], given: [[0, -4.8, 9, -3], [9, -3, 18, -5.7]], ...NARROW }),
  OE('oe24b-1c', '16 Dec 2024 · c) Focal point and focal length (1 square = 5 mm)', { task: 'focal', mm: 5, els: [['L', 15, 12], ['L', 25, -7]], ...WIDE }),
  OE('oe24b-1d', '16 Dec 2024 · d) Entry and exit pupils from the intermediate pupil', { task: 'pupils', els: [['L', 15, 12], ['L', 25, -7]], pupil: [22, 3, 1], ...WIDE }),
];
