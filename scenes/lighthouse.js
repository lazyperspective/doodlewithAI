/* Lighthouse in a Gale — heavy black ink and white gouache on kraft, gold for the light.
   Left: the tower on its rock, a breaker bursting on the windward side, the beam cutting the rain.
   Right: a pinned-on sheet with the lamp room in section (cupola, Fresnel lens, mantle, clockwork, watch room). */
(window.SCENES = window.SCENES || []).push({
  name: 'Lighthouse', seed: 31, ink: '#16140f', theme: 'kraft',
  note: 'A lighthouse on a rock in a gale, in ink on kraft paper, with the lamp room drawn in section.',
  build(P, n, total) {
    const S = Sketch, TAU = S.TAU, lerp = S.lerp, pip = S.pip;
    const INK = '#16140f', HI = '#fbf3dc', GOLD = '#f5c24a', AMBER = '#e89a2c', PAPER = '#b68b56';
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const FX0 = 40, FY0 = 40, FX1 = 1560, FY1 = 960, HZ = 590;
    const PX0 = 1062, PY0 = 64, PX1 = 1540, PY1 = 842;            // the pinned-on section sheet
    const SX1 = PX0 + 14;                                          // the storm only needs to run under the sheet's edge
    const CX = 580, LY = 256;                                      // tower axis, lamp height
    const TT = 310, TB = 650, hw = y => lerp(44, 68, (y - TT) / (TB - TT));
    const rectP = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const blob = (cx, cy, rx, ry, k = 14, j = 0.18) => P.sample(Array.from({ length: k }, (_, i) => { const a = i * TAU / k; return [cx + Math.cos(a) * rx * P.r(1 - j, 1 + j), cy + Math.sin(a) * ry * P.r(1 - j, 1 + j)]; }), true, 4);
    const fillUnder = (i0, poly, col, a) => { P.wash(poly, col, a, { edge: 0, jit: 0.5, steps: 2 }); const w = P.ops.pop(); P.ops.splice(i0, 0, { k: 'e', poly }, w); };
    const ink = (poly, a = 0.96) => P.wash(poly, INK, a, { edge: 0, jit: 0.3, steps: 2 });
    const white = (poly, a = 0.8) => P.wash(poly, HI, a, { edge: 0, jit: 0.4, steps: 2 });

    /* ---------------------------------------------------------------- shapes we need for masking */
    const tower = [[CX - hw(TT), TT], [CX + hw(TT), TT], [CX + hw(TB), TB], [CX - hw(TB), TB]];
    const domeSil = []; for (let k = 0; k <= 20; k++) { const a = Math.PI + k * Math.PI / 20; domeSil.push([CX + Math.cos(a) * 46, 229 + Math.sin(a) * 40]); }
    const sil = [tower, [[CX - 78, 299], [CX + 78, 299], [CX + 78, 308], [CX + 50, 325], [CX - 50, 325], [CX - 78, 308]], rectP(CX - 39, 222, 78, 80), domeSil, rectP(CX - 9, 176, 18, 20)];
    const lightSil = { inside: (x, y) => sil.some(q => pip(q, x, y)) };
    const rock = [[300, 790], [328, 756], [362, 726], [398, 700], [430, 672], [470, 660], [520, 652], [700, 650], [748, 662], [788, 684], [826, 712], [866, 740], [902, 770], [930, 800], [300, 800]];
    const plume = [[770, 760], [762, 690], [752, 620], [726, 560], [700, 500], [716, 462], [770, 450], [830, 470], [880, 520], [920, 600], [950, 680], [960, 760]];
    const beamL = [[CX, LY - 6], [FX0, 148], [FX0, 336], [CX, LY + 6]];
    const beamR = [[CX, LY - 5], [SX1, 214], [SX1, 292], [CX, LY + 5]];
    const inBeam = (x, y) => pip(beamL, x, y) || pip(beamR, x, y);
    const breaker = [[620, 962], [668, 912], [708, 862], [712, 830], [740, 796], [790, 776], [880, 766], [960, 790], [SX1, 812], [SX1, 962]];

    /* ---------------------------------------------------------------- 1. construction */
    P.guide(FX0, HZ, SX1, HZ, { a: 0.35 });
    P.guide(CX, 120, CX, 700, { a: 0.3 });
    P.guide(CX, LY, FX0 + 30, 150, { a: 0.25 }); P.guide(CX, LY, FX0 + 30, 334, { a: 0.25 });
    P.guide(300, TB, 900, TB, { a: 0.25 });

    /* ---------------------------------------------------------------- 2. storm sky */
    // the bolt is struck first so the sky tone can leave a glow around it
    const bolt = [[1000, 150], [988, 214], [1012, 256], [982, 330], [1004, 372], [974, 452], [990, 498], [968, HZ - 4]];
    const nearBolt = (x, y) => { let m = 1e9; for (let i = 0; i + 1 < bolt.length; i++) { const [ax, ay] = bolt[i], [bx, by] = bolt[i + 1], dx = bx - ax, dy = by - ay, t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy), 0, 1); m = Math.min(m, Math.hypot(x - ax - dx * t, y - ay - dy * t)); } return m; };
    const skyD = (x, y) => {
      if (y > HZ - 2 || lightSil.inside(x, y) || pip(plume, x, y)) return 0;
      let d = clamp(0.62 + 0.5 * (HZ - y) / 520 + 0.3 * P.nz(x / 90 + y / 70 + 3), 0, 1);
      if (inBeam(x, y)) d *= 0.1 + 0.5 * clamp(Math.abs(x - CX) / 560, 0, 1);
      d *= clamp(nearBolt(x, y) / 60, 0.15, 1);
      return d;
    };
    const skyP = [[FX0, FY0], [SX1, FY0], [SX1, HZ], [FX0, HZ]];
    P.wash(skyP, '#20170e', 0.32, { edge: 0, jit: 0.5, grad: { x0: 0, y0: FY0, x1: 0, y1: HZ, c0: '#20170e', a0: 0.5, c1: '#20170e', a1: 0.08 } });
    P.hatch(skyP, { ang: -64, gap: 3.4, a: 0.85, w: 0.66, c: INK, fade: skyD, piece: 46, jit: 0.3 });
    P.hatch([[FX0, FY0], [SX1, FY0], [SX1, 420], [FX0, 420]], { ang: 22, gap: 6, a: 0.6, w: 0.55, c: INK, fade: (x, y) => skyD(x, y) * clamp((440 - y) / 300, 0, 1), piece: 40, jit: 0.4 });

    // storm clouds: long torn rolls, darker bellies, white rims where the moon catches the upper left
    const clouds = [[580, 100, 440, 90], [930, 128, 280, 96], [260, 206, 300, 70], [770, 256, 250, 58], [190, 430, 230, 46], [430, 486, 190, 34]];
    clouds.forEach(([cx, cy, w, h], i) => {
      const i0 = P.ops.length;
      const out = P.cloud(cx, cy, w, h, { c: INK, w: 1.2, a: 0.9, lobes: 14, inner: i < 2 ? 3 : 1, gap: 2.2, shade: false });
      fillUnder(i0, out, '#3b2a18', 0.55);
      P.hatch(out, { ang: 28, gap: 2.6, a: 0.75, w: 0.5, c: INK, fade: (x, y) => clamp((y - cy) / (h * 0.5) * 0.8 + 0.25, 0, 1), piece: 12, inset: 3 });
      // silver lining on the top-left of the outline
      let run = [];
      const flush = () => { if (run.length > 4) P.path(run, { w: 1.3, c: HI, a: 0.85, rough: 0.3 }); run = []; };
      out.forEach(([x, y]) => { const lit = -(x - cx) / w * 0.6 - (y - cy) / h; if (lit > 0.18) run.push([x + 1.5, y + 2]); else flush(); }); flush();
      for (let k = 0; k < 5; k++) { const x0 = cx + P.r(-0.3, 0.3) * w, y0 = cy + h * P.r(0.3, 0.6), L = Math.min(P.r(80, 140), x0 - FX0 - 6); P.curve([[x0, y0], [x0 - L * 0.45, y0 + P.r(6, 20)], [x0 - L, y0 + P.r(16, 40)]], { w: 0.7, a: 0.7, rough: 0.6 }); } // torn trailing scud
    });

    // lightning far out to the right, behind the rain
    P.pl(bolt, { w: 6, c: INK, a: 0.85, rough: 0.3, over: 0, passes: 1 });
    P.pl(bolt, { w: 2.4, c: HI, a: 1, rough: 0.2, over: 0, passes: 1 });
    P.pl([[988, 214], [962, 246], [966, 290]], { w: 1.2, c: HI, a: 0.9, rough: 0.2, over: 0, passes: 1 });
    P.pl([[982, 330], [1020, 352], [1030, 396]], { w: 1, c: HI, a: 0.85, rough: 0.2, over: 0, passes: 1 });

    /* ---------------------------------------------------------------- 3. the beams */
    P.wash(beamL, GOLD, 0.6, { edge: 0, jit: 0.3, grad: { x0: CX, y0: LY, x1: FX0, y1: 242, c0: GOLD, a0: 0.8, c1: GOLD, a1: 0.04 } });
    P.wash(beamR, GOLD, 0.6, { edge: 0, jit: 0.3, grad: { x0: CX, y0: LY, x1: SX1, y1: 252, c0: GOLD, a0: 0.75, c1: GOLD, a1: 0.1 } });
    for (const [x1, y1, a] of [[FX0, 150, 0.7], [FX0, 334, 0.6], [SX1, 216, 0.6], [SX1, 290, 0.5]]) P.line(CX, LY, x1, y1, { w: 0.8, c: HI, a, rough: 0.4, passes: 1, over: 0 });
    for (let k = 0; k < 14; k++) { const t = P.r(0.15, 0.85), y1 = lerp(150, 334, t); P.line(lerp(CX, FX0, 0.12), lerp(LY, y1, 0.12), lerp(CX, FX0, P.r(0.5, 0.95)), lerp(LY, y1, P.r(0.5, 0.95)), { w: P.r(0.4, 0.9), c: HI, a: P.r(0.2, 0.45), rough: 0.3, passes: 1, over: 0 }); }

    /* ---------------------------------------------------------------- 4. the sea */
    const seaMask = (x, y) => pip(rock, x, y) || pip(plume, x, y) || pip(breaker, x, y);
    const seaD = (x, y) => {
      if (seaMask(x, y)) return 0;
      const t = (y - HZ) / (FY1 - HZ);
      return clamp(0.62 + 0.4 * P.nz(x / (30 + 160 * t) + y / 14) + 0.15 * (1 - t), 0, 1);
    };
    P.wash([[FX0, HZ], [SX1, HZ], [SX1, FY1], [FX0, FY1]], '#20170e', 0.3, { edge: 0, jit: 0.5 });
    P.hatch([[FX0, HZ], [SX1, HZ], [SX1, FY1], [FX0, FY1]], { ang: -4, gap: 3, a: 0.8, w: 0.58, c: INK, fade: seaD, piece: 26, jit: 0.35 });
    P.line(FX0, HZ, SX1, HZ, { w: 1.2, a: 0.85, rough: 0.6 });
    // a choppy sea: rows of broken, peaked crests, small and close at the horizon, big in front.
    // The waves run before an east wind (to the left), so each crest has a steep left face, darkened, and
    // spindrift torn off its top and blown left.
    for (let j = 0; j < 30; j++) {
      const t = (j + 0.5) / 30, y0 = HZ + 4 + (FY1 - HZ) * Math.pow(t, 1.5), lam = 18 + 170 * t, A = 1.2 + 24 * t;
      for (let x = FX0 - P.r(0, lam); x < SX1; x += lam * P.r(0.55, 1.25)) {
        const wv = lam * P.r(0.7, 1.3), a = A * P.r(0.5, 1.4), yy = y0 + P.r(-0.3, 0.3) * lam * 0.25;
        const pk = [x + wv * 0.38, yy - a];
        if (seaMask(x, yy) || seaMask(pk[0], pk[1]) || seaMask(x + wv, yy)) continue;
        const crest = [[x, yy + a * 0.05], [x + wv * 0.22, yy - a * 0.55], pk, [x + wv * 0.62, yy - a * 0.45], [x + wv, yy + a * 0.1]];
        P.curve(crest, { w: 0.5 + 1.6 * t, a: 0.92, rough: 0.35 });
        if (t > 0.18) P.hatch([[x, yy + a * 0.05], [x + wv * 0.22, yy - a * 0.55], pk, [x + wv * 0.3, yy + a * 0.4]], { ang: 80, gap: 1.6 + 1.6 * t, a: 0.85, w: 0.5, c: INK, inset: 0.3 });
        if (P.R() < 0.75) {                                         // white cap and spindrift
          const fl = 3 + 26 * t;
          P.curve([[pk[0] + wv * 0.18, pk[1] + a * 0.25], [pk[0] + wv * 0.05, pk[1] - 0.5], [pk[0] - fl * 0.4, pk[1] - 1]], { w: 0.6 + 1.6 * t, c: HI, a: 0.9, rough: 0.3 });
          for (let s = 0; s < 1 + 4 * t; s++) P.line(pk[0] - P.r(0, fl * 0.3), pk[1] - P.r(0, 3 + 6 * t), pk[0] - fl * P.r(0.6, 1.2), pk[1] - P.r(0, 5 + 10 * t), { w: 0.4 + 0.6 * t, c: HI, a: 0.7, passes: 1, over: 0, rough: 0.3 });
        }
      }
    }

    /* ---------------------------------------------------------------- 5. the rock */
    P.erase(rock);
    P.wash(rock, '#3a2c1c', 0.35, { edge: 0, jit: 0.6, steps: 2 });
    const rockD = (x, y) => clamp(0.2 + (x - 400) / 480 + (y - 660) / 200, 0.05, 1);
    P.hatch(rock, { ang: 58, gap: 2.6, a: 0.8, w: 0.55, c: INK, fade: rockD, piece: 14 });
    P.hatch(rock, { ang: -30, gap: 3.2, a: 0.7, w: 0.5, c: INK, fade: (x, y) => clamp(rockD(x, y) - 0.35, 0, 1), piece: 12 });
    // wet, weedy foot of the rock: a ragged top edge, not a ruled one
    const wet = []; for (let x = 318; x <= 922; x += 8) wet.push([x, 744 + 10 * P.nz(x / 22) + (x < 360 ? (360 - x) * 0.6 : 0) + (x > 860 ? (x - 860) * 0.5 : 0) + P.r(-3, 3)]);
    ink(wet.concat([[930, 800], [310, 800]]), 0.9);
    for (let k = 0; k < 50; k++) { const x = P.r(330, 900), y = 750 + P.r(-6, 8); P.line(x, y, x + P.r(-3, 3), y + P.r(8, 22), { w: P.r(0.8, 1.6), c: INK, a: 0.9, passes: 1, over: 0, rough: 0.4 }); }
    for (let k = 0; k < 26; k++) { const x = P.r(340, 880), y = 760 + P.r(0, 20); P.line(x, y, x + P.r(8, 20), y + P.r(-2, 2), { w: 0.6, c: HI, a: 0.5, passes: 1, over: 0, rough: 0.3 }); }
    // strata and cracks
    for (const c of [[[400, 700], [450, 690], [520, 694], [580, 700]], [[470, 664], [520, 680], [560, 676]], [[690, 664], [730, 690], [760, 720], [790, 740]], [[600, 690], [650, 712], [700, 718], [760, 742]], [[420, 724], [470, 716], [540, 726]]]) P.curve(c, { w: 0.9, a: 0.85, rough: 0.6 });
    // lit edges
    for (const c of [[[332, 754], [364, 724], [398, 700], [430, 674]], [[434, 670], [470, 660], [520, 653]], [[402, 702], [450, 692], [500, 695]]]) P.curve(c, { w: 1.4, c: HI, a: 0.8, rough: 0.4 });
    P.pl(rock.slice(0, 14), { w: 2.4, a: 0.95, rough: 0.6 });

    /* ---------------------------------------------------------------- 6. the keeper's cottage, smoke flattened by the wind */
    const cot = [[446, 664], [446, 626], [520, 626], [520, 656]];
    P.erase([[440, 664], [440, 622], [483, 596], [526, 622], [526, 656]]);
    white(cot, 0.55);
    P.hatch([[490, 626], [520, 626], [520, 656], [490, 660]], { ang: 75, gap: 2.4, a: 0.75, w: 0.5, c: INK });
    P.poly(cot, { w: 1.8, a: 0.95, rough: 0.5 });
    const roof = [[438, 628], [483, 596], [528, 628]];
    ink([[438, 628], [483, 596], [528, 628], [522, 630], [483, 603], [444, 630]], 0.95);
    P.pl(roof, { w: 2, rough: 0.4 });
    ink(rectP(458, 596, 8, 18), 0.95); // chimney
    for (let k = 0; k < 7; k++) { const x = 454 - k * 22 - k * k * 1.5, y = 588 - k * 2 + P.r(-2, 2), i1 = P.ops.length, o = P.cloud(x, y, 12 + k * 5, 7 + k * 2, { c: INK, w: 0.6, a: 0.55, lobes: 7, inner: 0, shade: false, r: 3 }); fillUnder(i1, o, HI, 0.5 - k * 0.05); }
    ink(rectP(458, 636, 12, 12), 0.95); P.dot(461, 639, 1.6, { c: GOLD, a: 0.9 });
    ink(rectP(494, 634, 14, 22), 0.95);

    /* ---------------------------------------------------------------- 7. the tower */
    sil.forEach(q => P.erase(q));
    const bands = [[360, 418], [478, 536]];
    // white tower: gouache on the lit side, hatch on the side away from the light
    white(tower, 0.62);
    P.hatch(tower, { ang: 82, gap: 2.2, a: 0.8, w: 0.5, c: INK, fade: (x, y) => clamp((x - CX) / hw(y) * 1.4 + 0.1, 0, 1) });
    P.hatch(tower, { ang: 8, gap: 3, a: 0.55, w: 0.45, c: INK, fade: (x, y) => clamp((x - CX) / hw(y) * 1.6 - 0.7, 0, 1) });
    for (const [y0, y1] of bands) {
      const b = [[CX - hw(y0), y0], [CX + hw(y0), y0], [CX + hw(y1), y1], [CX - hw(y1), y1]];
      ink(b, 0.95);
      for (let k = 0; k < 3; k++) { const u = -0.78 + k * 0.1; P.line(CX + u * hw(y0), y0 + 3, CX + u * hw(y1), y1 - 3, { w: 0.7, c: HI, a: 0.5 - k * 0.12, rough: 0.3, passes: 1, over: 0 }); }
      P.line(CX - hw(y0), y0, CX + hw(y0), y0, { w: 1.2, rough: 0.4 }); P.line(CX - hw(y1), y1, CX + hw(y1), y1, { w: 1.2, rough: 0.4 });
    }
    // windows and the door
    for (const [wx, wy] of [[CX - 10, 330], [CX + 8, 446], [CX - 8, 566]]) {
      const w = rectP(wx - 6, wy, 12, 20); ink(w, 0.95);
      P.line(wx - 8, wy + 21, wx + 8, wy + 21, { w: 1.1, c: HI, a: 0.9, passes: 1, over: 0, rough: 0.2 });
      P.dot(wx - 2, wy + 7, 1.4, { c: GOLD, a: 0.9 });
    }
    const door = [[CX - 12, TB], [CX - 12, 622], [CX - 6, 614], [CX + 6, 614], [CX + 12, 622], [CX + 12, TB]];
    ink(door, 0.95); P.line(CX - 20, TB - 1, CX + 20, TB - 1, { w: 1.2, c: HI, a: 0.8, passes: 1, rough: 0.3 });
    P.pl([[CX - hw(TT), TT], [CX - hw(TB), TB]], { w: 2.4 }); P.pl([[CX + hw(TT), TT], [CX + hw(TB), TB]], { w: 2.6 });
    // cornice and gallery
    const corn = [[CX - 78, 300], [CX + 78, 300], [CX + 78, 308], [CX + 50, 324], [CX - 50, 324], [CX - 78, 308]];
    ink(corn, 0.95);
    for (let x = CX - 66; x <= CX + 66; x += 11) P.line(x, 309, x * 0.8 + CX * 0.2, 321, { w: 0.6, c: HI, a: 0.55, passes: 1, over: 0, rough: 0.2 });
    P.line(CX - 78, 300, CX + 78, 300, { w: 1, c: HI, a: 0.85, passes: 1, rough: 0.3 });
    // lantern: glazing lit from inside (the cutaway window onto the lens)
    const glz = rectP(CX - 36, 228, 72, 56);
    P.wash(glz, GOLD, 0.9, { edge: 0, jit: 0, grad: { x0: CX, y0: LY, r0: 2, r1: 46, x1: CX, y1: LY, c0: '#fff6d0', a0: 1, c1: AMBER, a1: 0.85 } });
    for (let k = 0; k < 9; k++) { const y = 234 + k * 5.6, rx = 20 * Math.sin(Math.PI * (k + 0.5) / 9) + 4; P.arc(CX, y, rx, 2.2, 0, Math.PI, { w: 0.5, a: 0.55, passes: 1, rough: 0.1 }); }
    P.dot(CX, LY, 4.5, { c: '#ffffff', a: 1 });
    for (let k = 0; k < 16; k++) { const a = k * TAU / 16; P.line(CX + Math.cos(a) * 6, LY + Math.sin(a) * 6, CX + Math.cos(a) * 15, LY + Math.sin(a) * 15, { w: 0.5, c: '#ffffff', a: 0.9, passes: 1, over: 0, rough: 0.1 }); }
    for (const x of [CX - 36, CX - 18, CX, CX + 18, CX + 36]) P.line(x, 228, x, 284, { w: x === CX - 36 || x === CX + 36 ? 1.8 : 1.1, a: 0.9, passes: 1, over: 0, rough: 0.2 });
    for (let k = -3; k <= 3; k++) { P.line(CX + k * 18 - 14, 284, CX + k * 18 + 14, 228, { w: 0.6, a: 0.45, passes: 1, over: 0, rough: 0.2 }); }
    P.line(CX - 38, 228, CX + 38, 228, { w: 1.6 }); P.line(CX - 38, 284, CX + 38, 284, { w: 1.6 });
    const para = rectP(CX - 38, 284, 76, 16); ink(para, 0.95); P.line(CX - 36, 286, CX + 36, 286, { w: 0.6, c: HI, a: 0.6, passes: 1 });
    // cupola, ventilator, rod
    const dome = []; for (let k = 0; k <= 20; k++) { const a = Math.PI + k * Math.PI / 20; dome.push([CX + Math.cos(a) * 42, 228 + Math.sin(a) * 36]); }
    ink(dome, 0.96);
    P.arc(CX, 228, 34, 28, Math.PI * 1.1, Math.PI * 1.45, { w: 1.4, c: HI, a: 0.9, passes: 1, rough: 0.2 });
    for (const u of [-0.55, 0, 0.55]) P.curve([[CX + u * 42, 228], [CX + u * 30, 208], [CX + u * 8, 194]], { w: 0.6, c: HI, a: 0.4, rough: 0.2 });
    P.ellipse(CX, 226, 46, 4, { w: 1.6, passes: 1 });
    P.circle(CX, 186, 7, { w: 1.3, passes: 1 }); ink(blob(CX, 186, 7, 7, 10, 0.02), 0.95); P.dot(CX - 2.4, 183.6, 1.6, { c: HI, a: 0.9 });
    P.line(CX, 179, CX, 146, { w: 1.2, passes: 1 }); P.pl([[CX, 152], [CX + 14, 156], [CX, 160]], { w: 0.8, passes: 1, over: 0 });
    // railing in front of the lantern
    P.line(CX - 76, 274, CX + 76, 274, { w: 1.3, rough: 0.3 }); P.line(CX - 76, 287, CX + 76, 287, { w: 0.8, rough: 0.3 });
    for (let x = CX - 74; x <= CX + 74; x += 9.25) P.line(x, 274, x, 300, { w: 0.8, a: 0.9, passes: 1, over: 0, rough: 0.2 });
    P.line(CX - 76, 273, CX - 10, 273, { w: 0.6, c: HI, a: 0.7, passes: 1, over: 0, rough: 0.2 });

    /* ---------------------------------------------------------------- 8. the breaker on the windward side */
    {
      const i0 = P.ops.length;
      P.wash(blob(830, 610, 200, 220, 14, 0.1), HI, 0.3, { edge: 0, grad: { x0: 830, y0: 630, r0: 20, r1: 150, x1: 840, y1: 640, c0: HI, a0: 0.45, c1: HI, a1: 0 } });
      const lumps = [[860, 716, 130, 70], [812, 668, 100, 80], [880, 640, 90, 80], [800, 590, 90, 70], [850, 560, 80, 70], [770, 520, 76, 56], [820, 500, 60, 50], [736, 480, 54, 38], [912, 700, 70, 60], [700, 470, 40, 26]];
      lumps.forEach(([cx, cy, w, h], i) => { const i1 = P.ops.length; const out = P.cloud(cx, cy, w, h, { c: INK, w: 0.9, a: 0.6, lobes: 10, inner: 1, gap: 3.4, r: 7 }); fillUnder(i1, out, HI, 0.62 + 0.2 * (i % 2)); });
      const spray = []; for (let k = 0; k < 900; k++) { const a = P.r(0, TAU), d = Math.sqrt(P.r(0, 1)); const x = 800 + Math.cos(a) * 150 * d - 60 * (1 - d), y = 580 + Math.sin(a) * 170 * d; if (lightSil.inside(x, y)) continue; spray.push([x, y, P.r(0.4, 1.7)]); }
      P.dots(spray, HI, 0.9);
      for (let k = 0; k < 40; k++) { const x = P.r(700, 940), y = P.r(440, 640); if (lightSil.inside(x, y)) continue; P.line(x, y, x - P.r(14, 40), y + P.r(4, 14), { w: P.r(0.5, 1.1), c: HI, a: 0.7, passes: 1, over: 0, rough: 0.3 }); }
    }
    // surf boiling round the foot of the rock
    for (let x = 316; x < 920; x += P.r(14, 46)) {
      const big = P.R() < 0.3, y = 784 + P.r(-10, 10) - (big ? 10 : 0), i1 = P.ops.length;
      const o = P.cloud(x, y, big ? P.r(60, 90) : P.r(20, 44), big ? P.r(26, 40) : P.r(10, 20), { c: INK, w: 0.7, a: 0.5, lobes: 9, inner: big ? 1 : 0, shade: false, r: big ? 7 : 4 });
      fillUnder(i1, o, HI, 0.82);
    }
    P.dots(Array.from({ length: 500 }, () => [P.r(310, 930), 780 + P.r(-26, 26) * Math.pow(P.R(), 0.5), P.r(0.4, 1.4)]), HI, 0.85);

    // the big foreground breaker: a dark wall of water whose lip is pitching over to the left
    {
      const lipY = x => lerp(790, 822, clamp((x - 790) / (SX1 - 790), 0, 1)) - 14 * Math.sin(clamp((x - 790) / 140, 0, 1) * Math.PI);
      const body = [[612, 962], [676, 936], [722, 900], [752, 860], [768, 822], [790, 790]];
      for (let x = 800; x <= SX1; x += 12) body.push([x, lipY(x)]);
      body.push([SX1, 962]);
      P.erase(body);
      P.wash(body, '#100c08', 0.88, { edge: 0, jit: 0.4, grad: { x0: 0, y0: 790, x1: 0, y1: 962, c0: '#100c08', a0: 0.7, c1: '#100c08', a1: 0.95 } });
      // the face: foam streaks drawn down and across it, following its curve
      for (let k = 0; k < 46; k++) {
        const x0 = P.r(770, SX1 - 10), y0 = lipY(x0) + P.r(8, 30), dl = P.r(60, 170);
        P.curve([[x0, y0], [x0 - dl * 0.25, y0 + dl * 0.45], [x0 - dl * 0.6, y0 + dl * 0.9]], { w: P.r(0.5, 1.3), c: HI, a: P.r(0.35, 0.8), rough: 0.6 });
      }
      for (let k = 0; k < 18; k++) { const x0 = P.r(820, SX1 - 30), y0 = P.r(880, 950); P.curve([[x0, y0], [x0 + 18, y0 + P.r(-5, 5)], [x0 + 40, y0 + P.r(-4, 6)]], { w: 0.9, c: HI, a: 0.6, rough: 0.6 }); }
      P.wash(body, HI, 0.3, { edge: 0, jit: 0.4, grad: { x0: 0, y0: 800, x1: 0, y1: 880, c0: HI, a0: 0.22, c1: HI, a1: 0 } });
      for (let k = 0; k < 26; k++) { const x0 = P.r(800, SX1), y0 = lipY(x0) + P.r(20, 60), L = P.r(80, 200); P.curve([[x0, y0], [x0 - L * 0.4, y0 + L * 0.35], [x0 - L * 0.7, y0 + L * 0.8]], { w: 0.6, c: INK, a: 0.9, rough: 0.5 }); }
      P.curve(body.slice(0, 6), { w: 2.2, a: 0.95, rough: 0.4 });
      // the tube under the pitching lip
      const tube = [[790, 792], [760, 800], [730, 818], [716, 846], [726, 870], [752, 872], [770, 846], [784, 816]];
      ink(tube, 1);
      P.curve([[784, 818], [770, 846], [752, 870]], { w: 1, c: HI, a: 0.7, rough: 0.3 });
      // the lip itself: a thick white curl, outlined in ink, foam lumps along the crest behind it
      const lip = [[880, 772], [830, 772], [784, 780], [744, 798], [718, 826], [712, 852], [724, 866]];
      { const i1 = P.ops.length; P.cloudTube(lip, 11, 5, { c: INK, a: 0.75, w: 0.9, shade: false, rib: 1000 }); const sp = P.sample(lip, false, 6), band = [];
        sp.forEach((p, i) => { const q = sp[Math.min(sp.length - 1, i + 1)], o2 = sp[Math.max(0, i - 1)], tx = q[0] - o2[0], ty = q[1] - o2[1], l = Math.hypot(tx, ty) || 1, r = lerp(13, 7, i / (sp.length - 1)); band.push([p[0] - ty / l * r, p[1] + tx / l * r]); });
        sp.slice().reverse().forEach((p, j) => { const i = sp.length - 1 - j, q = sp[Math.min(sp.length - 1, i + 1)], o2 = sp[Math.max(0, i - 1)], tx = q[0] - o2[0], ty = q[1] - o2[1], l = Math.hypot(tx, ty) || 1, r = lerp(13, 7, i / (sp.length - 1)); band.push([p[0] + ty / l * r, p[1] - tx / l * r]); });
        fillUnder(i1, band, HI, 0.9); }
      for (let k = 0; k < 10; k++) { const t = P.r(0.3, 1), p = P.sample(lip, false, 6), q = p[Math.floor(t * (p.length - 1))]; P.curve([[q[0], q[1] + 6], [q[0] + P.r(-6, 6), q[1] + P.r(20, 40)], [q[0] + P.r(-10, 4), q[1] + P.r(40, 70)]], { w: P.r(0.8, 2), c: HI, a: 0.8, rough: 0.5 }); }
      for (let x = 800; x < SX1 + 10; x += P.r(22, 34)) { const i1 = P.ops.length, o = P.cloud(x, lipY(x) - 8, P.r(30, 50), P.r(14, 24), { c: INK, w: 0.9, a: 0.8, lobes: 9, inner: 1, shade: false, r: 5 }); fillUnder(i1, o, HI, 0.88); }
      // spray torn off the lip by the wind, flying left
      const fd = []; for (let k = 0; k < 900; k++) { const u = P.R(), x = lerp(SX1, 700, u) - P.r(0, 90) * u, y = lipY(Math.max(790, x)) - P.r(0, 50) * Math.pow(P.R(), 1.6) - 6; fd.push([x, y, P.r(0.4, 1.6)]); }
      P.dots(fd, HI, 0.9);
      for (let k = 0; k < 30; k++) { const x = P.r(700, SX1), y = lipY(Math.max(790, x)) - P.r(6, 40); P.line(x, y, x - P.r(16, 40), y - P.r(0, 8), { w: P.r(0.5, 1.1), c: HI, a: 0.75, passes: 1, over: 0, rough: 0.3 }); }
    }

    /* ---------------------------------------------------------------- 9. rain and gulls, over everything in the picture */
    for (let k = 0; k < 420; k++) {
      const x = P.r(FX0 + 10, SX1), y = P.r(FY0 + 10, FY1 - 40), L = P.r(26, 60);
      const lit = inBeam(x, y);
      P.line(x, y, x - L * 0.36, y + L, { w: lit ? 0.9 : 0.55, c: lit || P.R() < 0.45 ? HI : INK, a: lit ? 0.75 : 0.35, rough: 0.2, passes: 1, over: 0 });
    }
    const gull = (x, y, s, ang = 0) => { const c = Math.cos(ang), si = Math.sin(ang), T = (u, v) => [x + (u * c - v * si) * s, y + (u * si + v * c) * s];
      P.curve([T(-10, 1), T(-5, -5), T(0, 0)], { w: 1.4, c: INK, a: 0.95, rough: 0.2 }); P.curve([T(0, 0), T(5, -6), T(11, 2)], { w: 1.4, c: INK, a: 0.95, rough: 0.2 });
      P.curve([T(-9, 0), T(-5, -4), T(-1, -1)], { w: 0.6, c: HI, a: 0.9, rough: 0.1 }); };
    gull(300, 250, 1.6, -0.2); gull(360, 220, 1.1, 0.15); gull(230, 300, 0.9, 0.3);

    /* ---------------------------------------------------------------- 10. the magnifier: lamp room → section sheet */
    P.circle(CX, 250, 70, { w: 1.1, c: HI, a: 0.85, passes: 1, rough: 0.2 });
    P.dashed(CX + 30, 186, PX0, PY0 + 30, [10, 6], { w: 0.8, c: HI, a: 0.7 });
    P.dashed(CX + 40, 307, PX0, PY1 - 30, [10, 6], { w: 0.8, c: HI, a: 0.7 });
    P.text('A', CX - 92, 214, { size: 20, c: HI, a: 0.95 });
    P.circle(CX - 87, 207, 13, { w: 0.9, c: HI, a: 0.9, passes: 1, rough: 0.2 });

    // trim everything that ran past the picture's edges, then rule the edge the sheet does not cover
    for (const q of [rectP(0, 0, 1600, FY0), rectP(0, 0, FX0, 1000), rectP(0, FY1, 1600, 40), rectP(PX0, 0, 600, 1000)]) P.erase(q);
    P.line(PX0, PY1 + 10, PX0, FY1, { w: 1.4, rough: 0.3, passes: 1 });

    /* ---------------------------------------------------------------- 11. the pinned-on section sheet */
    const panel = rectP(PX0, PY0, PX1 - PX0, PY1 - PY0);
    P.wash(rectP(PX0 + 7, PY0 + 8, PX1 - PX0, PY1 - PY0), INK, 0.45, { edge: 0, jit: 0.8 });
    P.erase(panel);
    P.wash(panel, '#ead6ad', 0.28, { edge: 0, jit: 0.5 });
    P.rect(PX0, PY0, PX1 - PX0, PY1 - PY0, { w: 1.6, a: 0.95, rough: 0.35, over: 2 });
    P.rect(PX0 + 8, PY0 + 8, PX1 - PX0 - 16, PY1 - PY0 - 16, { w: 0.6, a: 0.6, rough: 0.3, passes: 1 });
    for (const [tx, ty, a] of [[PX0 + 30, PY0 - 6, -0.35], [PX1 - 30, PY0 - 6, 0.35]]) { const c = Math.cos(a), s = Math.sin(a), q = [[-34, -10], [34, -10], [34, 10], [-34, 10]].map(([u, v]) => [tx + u * c - v * s, ty + u * s + v * c]); P.wash(q, HI, 0.45, { edge: 0, jit: 1.2 }); }

    const SX = 1300;
    P.text('SECTION A–A', SX, 104, { size: 24, align: 'center' });
    P.label('the lamp room, looking north', SX, 126, { size: 14, align: 'center', a: 0.75 });
    P.guide(SX, 136, SX, 780, { a: 0.35 });

    // glow of the lamp, kept inside the lantern; the far glazing's diagonal astragals seen through it
    const lant = rectP(SX - 81, 254, 162, 146);
    P.wash(lant, GOLD, 0.9, { edge: 0, jit: 0, grad: { x0: SX, y0: 330, r0: 4, r1: 104, x1: SX, y1: 330, c0: '#fff4c8', a0: 0.95, c1: GOLD, a1: 0.12 } });
    P.hatch(lant, { ang: 62, gap: 24, jit: 0, ragged: 0, inset: 0, w: 0.5, a: 0.4, c: INK });
    P.hatch(lant, { ang: -62, gap: 24, jit: 0, ragged: 0, inset: 0, w: 0.5, a: 0.3, c: INK });

    // cupola in section: the cut skin is solid black, the inside of the far half is hatched
    const arcPts = (rx, ry, cy, n = 28) => Array.from({ length: n + 1 }, (_, k) => { const a = Math.PI + k * Math.PI / n; return [SX + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
    const outer = arcPts(90, 74, 250), inner = arcPts(80, 64, 250);
    P.hatch(inner.concat([[SX + 80, 250], [SX - 80, 250]]), { ang: 0, gap: 3, a: 0.5, w: 0.45, c: INK, fade: (x, y) => clamp(0.3 + (250 - y) / 80 - 0.4 * Math.exp(-Math.pow((x - SX) / 50, 2)), 0, 1) });
    ink(outer.concat(inner.slice().reverse()), 0.97);
    P.path(outer, { w: 1.6, rough: 0.2 });
    ink(rectP(SX - 98, 246, 196, 8), 0.97);
    // ventilator ball and rod
    P.line(SX, 140, SX, 176, { w: 1.6, passes: 1 }); P.pl([[SX, 146], [SX + 18, 151], [SX, 156]], { w: 0.9, passes: 1, over: 0 });
    const vb = blob(SX, 184, 13, 12, 14, 0.02); ink(vb, 0.97); P.arc(SX, 184, 9, 8, 3.6, 4.8, { w: 1, c: HI, a: 0.9, passes: 1 });
    ink(rectP(SX - 8, 194, 16, 6), 0.97);
    // lantern glazing, cut: thin glass between black astragal sections
    for (const s of [-1, 1]) {
      const x = SX + s * 82;
      P.line(x, 254, x, 402, { w: 0.7, a: 0.85, passes: 1, over: 0, rough: 0.1 });
      P.line(x + s * 3, 254, x + s * 3, 402, { w: 0.5, a: 0.6, passes: 1, over: 0, rough: 0.1 });
      for (const y of [254, 302, 352, 398]) ink(rectP(x - 2 + s * 1.5, y - 2, 5, 6), 0.97);
      // parapet (cut, stone)
      const pq = s < 0 ? rectP(x - 12, 402, 14, 30) : rectP(x - 2, 402, 14, 30);
      ink(pq, 0.97);
    }
    // the Fresnel lens: refracting belt in the middle, catadioptric prism rings above and below
    const LC = 330;
    const lensR = y => 52 * Math.sqrt(Math.max(0, 1 - Math.pow((y - LC) / 78, 2)));
    for (let k = 0; k < 9; k++) { const y = 268 + k * 5.5, r = lensR(y); P.arc(SX, y, r, 4.5, 0.05, Math.PI - 0.05, { w: 0.9, a: 0.85, passes: 1, rough: 0.1 }); P.line(SX - r, y, SX - r + 3, y + 3, { w: 0.5, a: 0.6, passes: 1, over: 0 }); }
    for (let k = 0; k < 9; k++) { const y = 348 + k * 5.5, r = lensR(y); P.arc(SX, y, r, 4.5, 0.05, Math.PI - 0.05, { w: 0.9, a: 0.85, passes: 1, rough: 0.1 }); }
    P.rect(SX - 52, 318, 104, 26, { w: 1.2, a: 0.9, passes: 1, over: 0, rough: 0.1 });
    for (let k = 1; k < 8; k++) P.line(SX - 52 + k * 13, 318, SX - 52 + k * 13, 344, { w: 0.5, a: 0.6, passes: 1, over: 0, rough: 0.1 });
    for (const s of [-1, 1]) P.curve([[SX + s * 22, 266], [SX + s * 46, 300], [SX + s * 52, 330], [SX + s * 46, 360], [SX + s * 22, 394]], { w: 1.3, a: 0.9, rough: 0.15 });
    // the mantle and its light
    P.dot(SX, LC, 6, { c: '#ffffff', a: 1 });
    for (let k = 0; k < 24; k++) { const a = k * TAU / 24, r1 = k % 2 ? 22 : 34; P.line(SX + Math.cos(a) * 9, LC + Math.sin(a) * 9, SX + Math.cos(a) * r1, LC + Math.sin(a) * r1, { w: 0.6, c: '#ffffff', a: 0.9, passes: 1, over: 0, rough: 0.1 }); }
    P.line(SX, LC + 8, SX, 396, { w: 1.4, passes: 1, over: 0, rough: 0.1 });  // burner stem
    // pedestal
    const ped = [[SX - 26, 396], [SX + 26, 396], [SX + 34, 432], [SX - 34, 432]];
    P.poly(ped, { w: 1.3, passes: 1 }); P.hatch(ped, { ang: 80, gap: 2, a: 0.7, w: 0.45, c: INK, fade: x => clamp((x - SX + 10) / 40, 0, 1) });
    // gallery deck (cut) and the railing outside
    ink(rectP(SX - 128, 432, 256, 11), 0.97);
    for (const s of [-1, 1]) { for (let k = 0; k < 4; k++) { const x = SX + s * (100 + k * 8); P.line(x, 400, x, 432, { w: 0.8, passes: 1, over: 0, rough: 0.1 }); } P.line(SX + s * 98, 400, SX + s * 126, 400, { w: 1.4, passes: 1, over: 0 }); P.line(SX + s * 98, 416, SX + s * 126, 416, { w: 0.7, passes: 1, over: 0 }); }
    for (const s of [-1, 1]) { const q = s < 0 ? [[SX - 128, 443], [SX - 100, 443], [SX - 100, 462]] : [[SX + 128, 443], [SX + 100, 443], [SX + 100, 462]]; ink(q, 0.97); }

    // watch room below: thick cut walls, floor, ladder, clockwork, the keeper
    const WT = 443, WB = 642;
    P.hatch(rectP(SX - 86, WT, 172, WB - WT), { ang: 90, gap: 3.4, a: 0.35, w: 0.45, c: INK, fade: x => clamp(0.3 + (x - SX) / 120, 0, 1) });
    for (const s of [-1, 1]) {
      const wall = s < 0 ? [[SX - 102, WT], [SX - 86, WT], [SX - 84, 760], [SX - 104, 760]] : [[SX + 86, WT], [SX + 102, WT], [SX + 104, 760], [SX + 84, 760]];
      ink(wall, 0.97);
    }
    // window through the left wall, rain outside
    P.erase([[SX - 106, 500], [SX - 82, 500], [SX - 82, 548], [SX - 106, 548]]); P.wash([[SX - 106, 500], [SX - 82, 500], [SX - 82, 548], [SX - 106, 548]], '#ead6ad', 0.28, { edge: 0 });
    P.line(SX - 94, 500, SX - 94, 548, { w: 0.7, passes: 1, over: 0 }); P.line(SX - 106, 524, SX - 82, 524, { w: 0.5, passes: 1, over: 0 });
    ink(rectP(SX - 86, WB, 172, 9), 0.97);                                  // floor of the watch room
    // ladder up through the trap
    for (const x of [SX - 70, SX - 54]) P.line(x, WT + 2, x, WB, { w: 1.1, passes: 1, over: 0, rough: 0.2 });
    for (let y = WT + 14; y < WB; y += 16) P.line(SX - 70, y, SX - 54, y, { w: 0.8, passes: 1, over: 0, rough: 0.1 });
    // clockwork: drive box, two gears, the weight on its cable
    const box = rectP(SX - 26, WT + 8, 52, 42);
    P.poly(box, { w: 1.3, passes: 1 }); P.hatch(box, { ang: -40, gap: 2.4, a: 0.55, w: 0.45, c: INK, fade: x => clamp((x - SX) / 30 + 0.4, 0, 1) });
    for (const [gx, gy, r, t] of [[SX - 10, WT + 28, 12, 14], [SX + 12, WT + 22, 8, 10]]) { P.circle(gx, gy, r, { w: 0.9, passes: 1 }); for (let k = 0; k < t; k++) { const a = k * TAU / t; P.line(gx + Math.cos(a) * r, gy + Math.sin(a) * r, gx + Math.cos(a) * (r + 2.6), gy + Math.sin(a) * (r + 2.6), { w: 0.8, passes: 1, over: 0, rough: 0.1 }); } P.dot(gx, gy, 1.6); }
    P.line(SX, WT + 50, SX, 600, { w: 0.6, passes: 1, over: 0, rough: 0.1 });
    const wt = rectP(SX - 8, 600, 16, 26); ink(wt, 0.95); P.line(SX - 5, 603, SX - 5, 622, { w: 0.6, c: HI, a: 0.7, passes: 1, over: 0 });
    P.dashed(SX, WB + 10, SX, 750, [6, 5], { w: 0.6, a: 0.6 });
    // the keeper with a kettle, 2 a.m.
    const kx = SX + 48, ky = WB;
    P.circle(kx, ky - 40, 5, { w: 1, passes: 1 });
    ink([[kx - 6, ky - 34], [kx + 6, ky - 34], [kx + 8, ky - 14], [kx - 8, ky - 14]], 0.9);
    P.line(kx - 3, ky - 14, kx - 4, ky, { w: 1.4, passes: 1, over: 0 }); P.line(kx + 3, ky - 14, kx + 5, ky, { w: 1.4, passes: 1, over: 0 });
    P.line(kx - 6, ky - 30, kx - 14, ky - 20, { w: 1.1, passes: 1, over: 0 }); P.ellipse(kx - 17, ky - 16, 5, 4, { w: 0.8, passes: 1 });
    P.curve([[kx - 18, ky - 22], [kx - 22, ky - 30], [kx - 18, ky - 38]], { w: 0.5, a: 0.6 });
    // a small plan of the lens: two bull's-eye panels, hence the two beams in the picture
    {
      const qx = 1134, qy = 712, r = 34;
      P.circle(qx, qy, r + 8, { w: 0.6, a: 0.6, passes: 1 });
      const oct = Array.from({ length: 8 }, (_, k) => [qx + Math.cos(k * TAU / 8 + TAU / 16) * r, qy + Math.sin(k * TAU / 8 + TAU / 16) * r]);
      P.poly(oct, { w: 1.1, passes: 1, over: 0 });
      P.wash(blob(qx, qy, 10, 10, 10, 0.02), GOLD, 0.9, { edge: 0 }); P.dot(qx, qy, 2.4, { c: '#ffffff', a: 1 });
      for (const s of [-1, 1]) {
        P.arc(qx + s * r * 0.92, qy, 4, 9, s < 0 ? Math.PI / 2 : -Math.PI / 2, s < 0 ? Math.PI * 1.5 : Math.PI / 2, { w: 1, passes: 1 });
        P.line(qx + s * (r + 10), qy, qx + s * (r + 26), qy, { w: 1.1, passes: 1, over: 0 });
        P.pl([[qx + s * (r + 20), qy - 4], [qx + s * (r + 26), qy], [qx + s * (r + 20), qy + 4]], { w: 1, passes: 1, over: 0 });
      }
      P.text('PLAN', qx, qy + r + 26, { size: 13, align: 'center' });
      P.label('two panels, two beams', qx, qy + r + 42, { size: 11, align: 'center', a: 0.7 });
    }
    // wall continues down; break line
    P.pl([[SX - 112, 760], [SX - 60, 760], [SX - 50, 750], [SX - 40, 770], [SX - 30, 760], [SX + 112, 760]], { w: 0.9, passes: 1 });

    // notes on the section
    const nt = (s, x, y, tx, ty, o = {}) => P.note(s, x, y, tx, ty, Object.assign({ size: 12 }, o));
    nt('LIGHTNING ROD', 1412, 150, SX + 2, 150, { align: 'left' });
    nt('VENTILATOR', 1080, 178, SX - 14, 184, { from: 'end' });
    nt('COPPER CUPOLA', 1080, 222, SX - 74, 214, { from: 'end' });
    nt('STORM PANES', 1080, 290, SX - 82, 300, { from: 'end' });
    nt('FRESNEL LENS', 1412, 270, SX + 42, 286);
    P.label('1st order, 920 mm', 1412, 286, { size: 11, a: 0.7 });
    nt('MANTLE', 1430, 334, SX + 10, LC);
    P.label('paraffin vapour', 1430, 350, { size: 11, a: 0.7 });
    nt('PEDESTAL', 1430, 420, SX + 30, 416);
    nt('GALLERY', 1080, 420, SX - 112, 430, { from: 'end' });
    nt('CLOCKWORK', 1424, 470, SX + 26, WT + 26);
    P.label('1 turn in 30 s', 1424, 486, { size: 11, a: 0.7 });
    nt('WEIGHT', 1430, 560, SX + 8, 612);
    nt('KEEPER, 2 A.M.', 1416, 640, kx + 6, ky - 30);
    nt('LADDER', 1080, 600, SX - 70, 590, { from: 'end' });
    nt('WATCH ROOM', 1080, 470, SX - 80, 480, { from: 'end' });
    P.dim(SX - 82, 252, SX - 82, 402, '12 ft', 54, { size: 12 });
    P.label('the light: white flash every 30 s, seen 18 miles', SX, 806, { size: 13, align: 'center', a: 0.8 });

    /* ---------------------------------------------------------------- 12. title and notes on the picture */
    // white-pen lettering over dark ink: the same strokes twice (same hand: the RNG is re-seeded), dark and wide under, white on top
    const twice = (k, fn) => { const keep = P.R; P.R = S.rng(k); fn(INK, 3.2, 0.8); P.R = S.rng(k); fn(HI, 1.25, 1); P.R = keep; };
    const wnote = (k, str, x, y, tx, ty, o = {}) => twice(k, (c, wk, a) => {
      const size = o.size ?? 14, al = o.align || 'left', w = P.measure(str, size);
      P.text(str, x, y, { size, align: al, c, a, lw: Math.max(0.85, size * 0.052) * wk });
      const x0 = al === 'right' ? x - w : x, x1 = x0 + w, sx = clamp(tx, x0 + 10, x1 - 10), sy = ty > y ? y + 7 : y - size * 0.62 - 7;
      P.curve([[sx, sy], [lerp(sx, tx, 0.5) + 8, lerp(sy, ty, 0.5) - 10], [tx, ty]], { w: 0.8 * wk, c, a: a * 0.85, rough: 0.4 });
      const an = Math.atan2(ty - lerp(sy, ty, 0.5) + 10, tx - lerp(sx, tx, 0.5) - 8);
      for (const s2 of [-1, 1]) P.line(tx, ty, tx - Math.cos(an + s2 * 0.4) * 8, ty - Math.sin(an + s2 * 0.4) * 8, { w: 0.9 * wk, c, a, passes: 1, over: 0, rough: 0.2 });
    });
    twice(901, (c, wk, a) => { P.text('THE LIGHT ON THE ROCK', 70, 96, { size: 32, c, a, lw: 1.8 * wk }); P.label('a gale from the east, high water, the lamp lit', 72, 124, { size: 16, c, a: a * 0.9, lw: 1 * wk }); });
    wnote(902, 'KEEPER’S COTTAGE', 150, 556, 446, 612, { size: 16 });
    wnote(903, 'SEA BREAKING ON THE WEATHER SIDE', 958, 392, 846, 486, { align: 'right', size: 16 });
    wnote(904, 'THE BEAM, CUT BY RAIN', 110, 372, 190, 304, { size: 16 });
    P.frame('Lighthouse in a Gale', 'lamp room in section', n, total, { note: 'ink & white gouache on kraft', scale: 'SCALE  n.t.s.' });
  }
});
