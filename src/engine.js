/* Hand-sketch engine: every primitive is recorded as an "op" (a wobbly pencil stroke,
   a watercolour wash, a hatch, a bit of handwriting…) and replayed by the Player so the
   drawing is *drawn*, one pen-stroke after another. Pure JavaScript, no libraries. */
(function (g) {
  'use strict';
  const TAU = Math.PI * 2;
  const W = 1600, H = 1000;

  function rng(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgba(h, a) { const c = rgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
  function pip(poly, x, y) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  function catmull(pts, closed, step) {
    const n = pts.length, out = [];
    const get = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      const k = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
      for (let s = 0; s < k; s++) {
        const t = s / k, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(d => 0.5 * ((2 * p1[d]) + (-p0[d] + p2[d]) * t +
          (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)));
      }
    }
    if (!closed) out.push(pts[n - 1].slice(0, 2));
    return out;
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerpP(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; }

  const HAND = '"Architects Daughter","Segoe Print","Bradley Hand","Chalkboard SE","Comic Sans MS",cursive';
  const NOTE = '"Caveat","Segoe Print","Bradley Hand","Chalkboard SE","Comic Sans MS",cursive';


  /* Single-stroke architect's lettering. Each glyph: width + strokes; "~" = smooth curve. y is up, cap height = 1. */
  const G = {};
  (function () {
    const def = (ch, w, ...s) => { G[ch] = { w, s: s.map(str => { const sm = str[0] === '~'; return { sm, p: str.replace('~', '').trim().split(/\s+/).map(q => q.split(',').map(Number)) }; }) }; };
    def('A', .62, '0,0 .31,1 .62,0', '.1,.36 .52,.36');
    def('B', .56, '0,0 0,1', '~0,1 .34,1 .5,.9 .5,.68 .36,.53 0,.53', '~.34,.53 .54,.42 .56,.16 .38,0 0,0');
    def('C', .58, '~.56,.84 .42,1 .24,1 .07,.86 0,.5 .07,.14 .24,0 .42,0 .56,.16');
    def('D', .58, '0,0 0,1', '~0,1 .28,1 .52,.82 .58,.5 .52,.18 .28,0 0,0');
    def('E', .5, '.5,1 0,1 0,0 .5,0', '0,.53 .38,.53');
    def('F', .48, '.5,1 0,1 0,0', '0,.53 .38,.53');
    def('G', .62, '~.58,.84 .44,1 .25,1 .07,.86 0,.5 .07,.14 .25,0 .44,0 .58,.14 .58,.44', '.34,.44 .6,.44');
    def('H', .58, '0,0 0,1', '.58,0 .58,1', '0,.53 .58,.53');
    def('I', .3, '.15,0 .15,1', '0,1 .3,1', '0,0 .3,0');
    def('J', .42, '.42,1 .42,.22 ~.38,.06 .22,0 .06,.08');
    def('K', .56, '0,0 0,1', '.56,1 0,.42', '.18,.58 .58,0');
    def('L', .46, '0,1 0,0 .46,0');
    def('M', .72, '0,0 0,1 .36,.34 .72,1 .72,0');
    def('N', .6, '0,0 0,1 .6,0 .6,1');
    def('O', .62, '~.31,1 .1,.9 0,.5 .1,.1 .31,0 .52,.1 .62,.5 .52,.9 .31,1');
    def('P', .54, '0,0 0,1', '~0,1 .34,1 .52,.9 .54,.7 .4,.53 0,.53');
    def('Q', .62, '~.31,1 .1,.9 0,.5 .1,.1 .31,0 .52,.1 .62,.5 .52,.9 .31,1', '.36,.22 .64,-.1');
    def('R', .56, '0,0 0,1', '~0,1 .34,1 .52,.9 .54,.7 .4,.53 0,.53', '.3,.53 .56,0');
    def('S', .52, '~.5,.88 .36,1 .17,1 .03,.88 .03,.68 .24,.54 .44,.4 .52,.24 .48,.1 .34,0 .14,0 0,.14');
    def('T', .6, '0,1 .6,1', '.3,1 .3,0');
    def('U', .58, '0,1 0,.24 ~.06,.06 .29,0 .5,.06 .58,.24 .58,1');
    def('V', .62, '0,1 .31,0 .62,1');
    def('W', .86, '0,1 .19,0 .43,.72 .67,0 .86,1');
    def('X', .58, '0,0 .58,1', '0,1 .58,0');
    def('Y', .6, '0,1 .3,.5 .6,1', '.3,.5 .3,0');
    def('Z', .56, '0,1 .56,1 0,0 .56,0');
    def('0', .54, '~.27,1 .08,.88 0,.5 .08,.12 .27,0 .46,.12 .54,.5 .46,.88 .27,1', '.12,.2 .42,.8');
    def('1', .34, '0,.76 .2,1 .2,0', '.02,0 .38,0');
    def('2', .54, '~0,.78 .12,.96 .28,1 .46,.92 .52,.72 .38,.5 0,0', '0,0 .54,0');
    def('3', .54, '~.02,.9 .2,1 .4,1 .52,.84 .46,.62 .22,.54 .46,.46 .54,.26 .44,.06 .26,0 .06,.06 0,.16');
    def('4', .58, '.42,0 .42,1 0,.3 .58,.3');
    def('5', .54, '.5,1 .06,1 .02,.54 ~.06,.6 .28,.66 .48,.56 .54,.34 .44,.1 .26,0 .06,.06 0,.16');
    def('6', .54, '~.5,.96 .3,1 .1,.84 0,.5 .06,.14 .26,0 .46,.08 .54,.3 .46,.5 .26,.56 .06,.44');
    def('7', .54, '0,1 .54,1 .2,0');
    def('8', .54, '~.27,.54 .07,.66 .05,.86 .27,1 .49,.86 .47,.66 .27,.54 .03,.4 .01,.14 .27,0 .53,.14 .51,.4 .27,.54');
    def('9', .54, '~.06,.04 .26,0 .46,.16 .54,.5 .48,.86 .28,1 .08,.92 0,.7 .08,.5 .28,.44 .48,.56');
    def('.', .12, '.06,.01 .06,.05');
    def(',', .14, '.08,.08 .03,-.14');
    def(':', .12, '.06,.01 .06,.05', '.06,.5 .06,.54');
    def(';', .14, '.08,.08 .03,-.14', '.08,.5 .08,.54');
    def('-', .38, '0,.46 .38,.46');
    def('–', .5, '0,.46 .5,.46');
    def('/', .4, '0,-.06 .4,1.06');
    def('\\', .4, '0,1.06 .4,-.06');
    def('(', .3, '~.26,1.1 .08,.7 .06,.3 .26,-.12');
    def(')', .3, '~.04,1.1 .22,.7 .24,.3 .04,-.12');
    def("'", .12, '.07,1 .05,.72');
    def('’', .12, '.07,1 .05,.72');
    def('"', .3, '.08,1 .06,.72', '.24,1 .22,.72');
    def('°', .3, '~.15,1 .04,.94 .04,.8 .15,.74 .26,.8 .26,.94 .15,1');
    def('+', .46, '0,.5 .46,.5', '.23,.27 .23,.73');
    def('=', .46, '0,.36 .46,.36', '0,.62 .46,.62');
    def('×', .42, '0,.25 .42,.75', '0,.75 .42,.25');
    def('%', .62, '0,0 .5,1', '~.1,1 .02,.9 .1,.78 .2,.9 .1,1', '~.5,.22 .42,.12 .5,0 .6,.12 .5,.22');
    def('?', .5, '~0,.8 .12,.96 .3,1 .46,.9 .48,.7 .28,.5 .25,.32', '.25,.02 .25,.06');
    def('!', .14, '.07,1 .07,.3', '.07,.01 .07,.05');
    def('&', .6, '~.56,0 .08,.62 .1,.88 .28,1 .44,.9 .42,.7 .02,.24 .1,.05 .3,0 .46,.1 .58,.34');
    def('>', .5, '0,.9 .5,.5 0,.1');
    def('<', .5, '.5,.9 0,.5 .5,.1');
    def('_', .5, '0,-.1 .5,-.1');
    def('|', .1, '.05,1.1 .05,-.1');
    def('#', .6, '.18,0 .28,1', '.4,0 .5,1', '.02,.3 .58,.3', '.02,.7 .58,.7');
    def('*', .4, '.2,.9 .2,.5', '.02,.8 .38,.6', '.02,.6 .38,.8');
    def('=', .46, '0,.36 .46,.36', '0,.62 .46,.62');
    G['?'].fallback = true;
  })();

  class Page {
    constructor(seed, o = {}) {
      this.R = rng(seed);
      this.ops = [];
      this.ink = o.ink || '#2b2b30';
      this.w = 1.3;
      this.a = 0.92;
      this.tab = Array.from({ length: 256 }, () => this.R() * 2 - 1);
      this.W = W; this.H = H;
    }
    r(a = 1, b) { return b === undefined ? this.R() * a : a + this.R() * (b - a); }
    ri(a, b) { return Math.floor(this.r(a, b + 1)); }
    pick(arr) { return arr[Math.floor(this.R() * arr.length)]; }
    nz(t) {
      const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f);
      return this.tab[i & 255] * (1 - u) + this.tab[(i + 1) & 255] * u;
    }
    /* transform stack: everything drawn between xf() and xfEnd() is scaled about (cx,cy) and moved to (tx,ty) */
    xf(sc, cx, cy, tx, ty, wexp = 0.5) { this._xf = { s: sc, cx, cy, tx, ty, ws: Math.pow(sc, wexp) }; return this; }
    xfEnd() { this._xf = null; return this; }
    push(op) {
      const X = this._xf;
      if (X) {
        const mx = x => X.tx + (x - X.cx) * X.s, my = y => X.ty + (y - X.cy) * X.s;
        switch (op.k) {
          case 's': case 'D': op.p = op.p.map(q => [mx(q[0]), my(q[1]), q[2] * X.ws]); break;
          case 'f': case 'e': op.poly = op.poly.map(q => [mx(q[0]), my(q[1])]); if (op.g) op.g = Object.assign({}, op.g, { x0: mx(op.g.x0), y0: my(op.g.y0), x1: mx(op.g.x1), y1: my(op.g.y1) }); break;
          case 'd': op.x = mx(op.x); op.y = my(op.y); op.r *= X.ws; break;
        }
      }
      this.ops.push(op); return this;
    }

    /* ---------- lines ---------- */
    line(x1, y1, x2, y2, o = {}) {
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
      if (len < 0.25) return this;
      const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
      const rough = o.rough ?? 1, w = o.w ?? this.w, c = o.c || this.ink, a = o.a ?? this.a;
      const passes = o.passes ?? (len > 40 ? 2 : 1);
      const ov = o.over ?? 1;
      for (let p = 0; p < passes; p++) {
        const e0 = p ? 0 : this.r(0, Math.min(3.5, len * 0.05)) * ov;
        const e1 = this.r(0, Math.min(3.5, len * 0.05)) * ov;
        const L = len + e0 + e1, n = Math.max(2, Math.ceil(L / (o.step || 10)));
        const amp = rough * (0.3 + Math.min(len, 500) / 600) * (p ? 1.15 : 1);
        const bias = p ? this.r(-0.5, 0.5) * rough * 1.3 : 0;
        const drift = this.r(-0.5, 0.5) * rough * Math.min(2.2, len / 120);
        const oN = this.r(0, 200), fq = 1 / (45 + this.r(0, 40));
        const pts = [];
        for (let k = 0; k <= n; k++) {
          const t = k / n, d = -e0 + L * t;
          const off = amp * this.nz(oN + d * fq) + bias + drift * t;
          pts.push([x1 + ux * d + nx * off, y1 + uy * d + ny * off,
            w * (p ? 0.75 : 1) * (0.72 + 0.4 * Math.sin(Math.PI * Math.min(1, t * 0.98 + 0.01)))]);
        }
        this.push({ k: 's', p: pts, c, a: a * (p ? 0.55 : 1) });
      }
      return this;
    }
    pl(pts, o = {}) {
      const n = pts.length, m = o.closed ? n : n - 1;
      const oo = Object.assign({ over: 0.5 }, o);
      for (let i = 0; i < m; i++) {
        const a = pts[i], b = pts[(i + 1) % n];
        this.line(a[0], a[1], b[0], b[1], oo);
      }
      return this;
    }
    poly(pts, o = {}) { return this.pl(pts, Object.assign({}, o, { closed: true })); }
    rect(x, y, w, h, o = {}) { return this.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], o); }
    rrect(x, y, w, h, r, o = {}) {
      r = Math.min(r, w / 2, h / 2);
      const oo = Object.assign({ over: 0, passes: 1 }, o);
      this.line(x + r, y, x + w - r, y, oo).line(x + w, y + r, x + w, y + h - r, oo)
        .line(x + w - r, y + h, x + r, y + h, oo).line(x, y + h - r, x, y + r, oo);
      const ao = Object.assign({ passes: 1 }, o);
      this.arc(x + r, y + r, r, r, Math.PI, Math.PI * 1.5, ao).arc(x + w - r, y + r, r, r, Math.PI * 1.5, TAU, ao)
        .arc(x + w - r, y + h - r, r, r, 0, Math.PI * 0.5, ao).arc(x + r, y + h - r, r, r, Math.PI * 0.5, Math.PI, ao);
      return this;
    }
    /* freehand stroke through dense samples */
    path(S, o = {}) {
      const rough = o.rough ?? 0.8, w = o.w ?? this.w, c = o.c || this.ink, a = o.a ?? this.a;
      const passes = o.passes ?? 1;
      for (let p = 0; p < passes; p++) {
        const P = S.slice();
        if (o.closed) { const ex = Math.min(4, Math.floor(P.length * 0.08)); for (let i = 0; i <= ex; i++) P.push(S[(i + 1) % S.length]); }
        const n = P.length; if (n < 2) return this;
        const oN = this.r(0, 200), bias = p ? this.r(-0.5, 0.5) * rough * 1.2 : 0;
        const pts = []; let d = 0;
        for (let i = 0; i < n; i++) {
          const a0 = P[Math.max(0, i - 1)], a1 = P[Math.min(n - 1, i + 1)];
          let tx = a1[0] - a0[0], ty = a1[1] - a0[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
          if (i) d += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
          const off = rough * 0.55 * this.nz(oN + d / 50) + bias, t = i / (n - 1);
          pts.push([P[i][0] - ty * off, P[i][1] + tx * off,
            w * (p ? 0.75 : 1) * (o.closed ? 1 : 0.75 + 0.4 * Math.sin(Math.PI * t))]);
        }
        this.push({ k: 's', p: pts, c, a: a * (p ? 0.55 : 1) });
      }
      return this;
    }
    curve(pts, o = {}) { return this.path(catmull(pts, o.closed, 6), o); }
    sample(pts, closed, step = 6) { return catmull(pts, closed, step); }
    ellipse(cx, cy, rx, ry, o = {}) {
      const rot = o.rot || 0, full = o.from === undefined && o.to === undefined;
      const passes = o.passes ?? (rx + ry > 26 ? 2 : 1);
      for (let p = 0; p < passes; p++) {
        const a0 = o.from ?? this.r(TAU), a1 = o.to ?? (a0 + TAU * 1.03);
        const per = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
        const n = Math.max(8, Math.ceil(per * Math.abs(a1 - a0) / TAU / 5));
        const k = p ? this.r(0.98, 1.02) : 1, S = [];
        for (let i = 0; i <= n; i++) {
          const an = a0 + (a1 - a0) * i / n;
          const x = rx * k * Math.cos(an), y = ry * k * Math.sin(an);
          S.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
        }
        this.path(S, Object.assign({}, o, { passes: 1, closed: false, a: (o.a ?? this.a) * (p ? 0.6 : 1) }));
      }
      return this;
    }
    arc(cx, cy, rx, ry, from, to, o = {}) { return this.ellipse(cx, cy, rx, ry, Object.assign({}, o, { from, to })); }
    circle(x, y, r, o = {}) { return this.ellipse(x, y, r, r, o); }
    dot(x, y, r, o = {}) { return this.push({ k: 'd', x, y, r, c: o.c || this.ink, a: o.a ?? 0.85 }); }
    dots(arr, c, a = 0.6) { return this.push({ k: 'D', p: arr, c: c || this.ink, a }); }

    dashed(x1, y1, x2, y2, pat = [8, 5], o = {}) {
      const len = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / len, uy = (y2 - y1) / len;
      let s = 0, i = 0;
      while (s < len) {
        const d = pat[i % pat.length]; const e = Math.min(len, s + d);
        if (i % 2 === 0) this.line(x1 + ux * s, y1 + uy * s, x1 + ux * e, y1 + uy * e, Object.assign({ passes: 1, over: 0, rough: 0.5 }, o));
        s = e; i++;
      }
      return this;
    }
    guide(x1, y1, x2, y2, o = {}) { return this.line(x1, y1, x2, y2, Object.assign({ w: 0.5, a: 0.3, rough: 0.35, over: 4, passes: 1 }, o)); }

    /* ---------- tone ---------- */
    hatch(poly, o = {}) {
      const ang = (o.ang ?? -50) * Math.PI / 180, gap = o.gap ?? 4, ca = Math.cos(ang), sa = Math.sin(ang);
      const q = poly.map(([x, y]) => [x * ca + y * sa, -x * sa + y * ca]);
      let y0 = Infinity, y1 = -Infinity;
      for (const p of q) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
      const jit = o.jit ?? 0.25, inset = o.inset ?? 1, rag = o.ragged ?? 1;
      for (let y = y0 + gap * this.r(); y < y1; y += gap * (1 + jit * (this.r() - 0.5) * 2)) {
        const xs = [];
        for (let i = 0; i < q.length; i++) {
          const a = q[i], b = q[(i + 1) % q.length];
          if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
        }
        xs.sort((m, n) => m - n);
        for (let i = 0; i + 1 < xs.length; i += 2) {
          let xa = xs[i] + inset + this.r(0, gap * 0.8) * rag, xb = xs[i + 1] - inset - this.r(0, gap * 0.8) * rag;
          if (xb - xa < 2) continue;
          const seg = (o.fade || o.piece) ? (o.piece || 16) : xb - xa + 1;
          for (let x = xa; x < xb; x += seg) {
            const e = Math.min(xb, x + seg);
            const px = x * ca - y * sa, py = x * sa + y * ca;
            if (o.fade) { const m = (x + e) / 2; const wx = m * ca - y * sa, wy = m * sa + y * ca; if (this.R() > o.fade(wx, wy)) continue; }
            this.line(px, py, e * ca - y * sa, e * sa + y * ca, { rough: o.rough ?? 0.5, w: o.w ?? 0.55, a: (o.a ?? 0.55) * this.r(0.75, 1), c: o.c, passes: 1, over: o.over ?? 0.4 });
          }
        }
      }
      if (o.cross !== undefined) this.hatch(poly, Object.assign({}, o, { ang: (o.ang ?? -50) + o.cross, cross: undefined }));
      return this;
    }
    stipple(poly, n, o = {}) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const p of poly) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
      const out = []; let tries = 0;
      while (out.length < n && tries++ < n * 30) {
        const x = this.r(x0, x1), y = this.r(y0, y1);
        if (!pip(poly, x, y)) continue;
        if (o.fade && this.R() > o.fade(x, y)) continue;
        out.push([x, y, this.r(0.4, o.r ?? 0.9)]);
      }
      return this.dots(out, o.c, o.a ?? 0.55);
    }
    wash(poly, c, a, o = {}) {
      const jit = o.jit ?? 1.4, P = [];
      for (let i = 0; i < poly.length; i++) {
        const A = poly[i], B = poly[(i + 1) % poly.length];
        const n = Math.max(1, Math.ceil(Math.hypot(B[0] - A[0], B[1] - A[1]) / 14));
        for (let k = 0; k < n; k++) { const t = k / n; P.push([lerp(A[0], B[0], t) + this.r(-jit, jit), lerp(A[1], B[1], t) + this.r(-jit, jit)]); }
      }
      return this.push({ k: 'f', poly: P, c, a, g: o.grad, edge: o.edge ?? 1, steps: o.steps ?? 5 });
    }
    erase(poly) { return this.push({ k: 'e', poly }); }

    /* ---------- lettering ---------- */
    measure(str, size = 18, o = {}) {
      const capH = size * 0.62, ls = (o.ls ?? 0) / capH; let u = 0;
      for (const ch of String(str).toUpperCase()) u += ch === ' ' ? 0.5 : (G[ch] || G['?']).w + 0.26 + ls;
      return Math.max(0, u - 0.26) * capH;
    }
    text(str, x, y, o = {}) {
      const size = o.size ?? 18, capH = size * 0.62, hand = o.font === HAND;
      const slant = o.slant ?? (hand ? 0.03 : 0.17), ls = (o.ls ?? 0) / capH;
      const s = String(str).toUpperCase(), rot = o.rot || 0, cr = Math.cos(rot), sr = Math.sin(rot);
      const tw = this.measure(s, size, o), ax = o.align === 'center' ? -tw / 2 : o.align === 'right' ? -tw : 0;
      const fine = !!o.fine, lw = o.lw ?? (fine ? size * 0.055 : Math.max(0.85, size * (hand ? 0.058 : 0.052))), col = o.c || this.ink, al = o.a ?? 0.88, ro = fine ? 0.02 : 0.3;
      let u = 0;
      for (const ch of s) {
        if (ch === ' ') { u += 0.5; continue; }
        const g = G[ch] || G['?'], sx = this.r(0.95, 1.06), sy = this.r(0.95, 1.05), dy = this.r(-0.045, 0.045) * capH, tilt = this.r(-0.05, 0.05);
        for (const st of g.s) {
          const pts = st.p.map(([gx, gy]) => {
            let lx = ax + (u + gx * sx) * capH, ly = -gy * sy * capH + dy;
            lx += -ly * (slant + tilt);
            if (o.mirror) lx = 2 * ax + tw - lx;
            return [x + lx * cr - ly * sr, y + lx * sr + ly * cr];
          });
          const S = st.sm ? catmull(pts, false, fine ? capH * 0.12 : Math.max(2.4, capH * 0.14)) : pts;
          if (S.length === 2) { const L = Math.hypot(S[1][0] - S[0][0], S[1][1] - S[0][1]); const k = Math.max(1, Math.ceil(L / (fine ? capH * 0.3 : Math.max(3, capH * 0.3)))); const D = []; for (let i = 0; i <= k; i++) D.push(lerpP(S[0], S[1], i / k)); this.path(D, { rough: ro, w: lw, c: col, a: al, passes: 1 }); }
          else this.path(S, { rough: ro, w: lw, c: col, a: al, passes: 1 });
        }
        u += g.w + 0.26 + ls;
      }
      return this;
    }
    label(s, x, y, o = {}) { return this.text(s, x, y, Object.assign({ font: HAND, size: 15 }, o)); }
    /* note with a leader line ending in a small arrow head at (tx,ty) */
    note(s, x, y, tx, ty, o = {}) {
      const size = o.size ?? 19, w = this.measure(s, size), al = o.align || 'left';
      this.text(s, x, y, Object.assign({ size, align: al }, o));
      const ex = al === 'left' ? x - 6 : al === 'right' ? x + 6 : x;
      const sx = o.from === 'end' ? (al === 'left' ? x + w : x) : ex;
      const sy = y - size * 0.3;
      this.curve([[sx, sy], [lerp(sx, tx, 0.5) + this.r(-6, 6), lerp(sy, ty, 0.5) + this.r(-6, 6)], [tx, ty]], { w: 0.7, a: 0.6, rough: 0.6 });
      const an = Math.atan2(ty - sy, tx - sx);
      for (const s2 of [-1, 1]) this.line(tx, ty, tx - Math.cos(an + s2 * 0.4) * 7, ty - Math.sin(an + s2 * 0.4) * 7, { w: 0.8, a: 0.7, passes: 1, over: 0, rough: 0.2 });
      return this;
    }
    /* architectural dimension line, offset `off` px perpendicular to a→b */
    dim(x1, y1, x2, y2, label, off = 20, o = {}) {
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
      const ax = x1 + nx * off, ay = y1 + ny * off, bx = x2 + nx * off, by = y2 + ny * off;
      const ex = Math.sign(off) * 7, oo = { w: 0.7, a: 0.7, rough: 0.3, passes: 1 };
      this.line(ax, ay, bx, by, Object.assign({ over: 6 }, oo));
      this.line(x1 + nx * 4 * Math.sign(off), y1 + ny * 4 * Math.sign(off), ax + nx * ex, ay + ny * ex, oo);
      this.line(x2 + nx * 4 * Math.sign(off), y2 + ny * 4 * Math.sign(off), bx + nx * ex, by + ny * ex, oo);
      for (const [px, py] of [[ax, ay], [bx, by]]) this.line(px - ux * 4 - nx * 4, py - uy * 4 - ny * 4, px + ux * 4 + nx * 4, py + uy * 4 + ny * 4, { w: 1.3, a: 0.85, rough: 0.2, passes: 1, over: 0 });
      let ang = Math.atan2(dy, dx); if (ang > Math.PI / 2 || ang < -Math.PI / 2) ang += Math.PI;
      const mx = (ax + bx) / 2, my = (ay + by) / 2, up = (o.size ?? 15) * 0.55;
      const tx = mx + Math.sin(ang) * up, ty = my - Math.cos(ang) * up;
      return this.text(label, tx, ty, { size: o.size ?? 15, rot: ang, align: 'center', font: HAND, a: 0.85 });
    }

    /* ---------- pen-and-ink toolkit: scalloped clouds, tick scales, trace bundles ---------- */
    /* Bumpy "cumulus" outline along a polyline/polygon. Returns the outline samples. */
    scallop(pts, o = {}) {
      const r = o.r ?? 8, bulge = o.bulge ?? 1, n = pts.length, closed = !!o.closed, out = [];
      let side = o.side ?? 1;
      if (closed) { let A = 0; for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; A += a[0] * b[1] - b[0] * a[1]; } side = A > 0 ? -1 : 1; if (o.side) side = o.side; }
      const m = closed ? n : n - 1;
      for (let i = 0; i < m; i++) {
        const a = pts[i], b = pts[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); if (L < 1) continue;
        const nx = -dy / L * side, ny = dx / L * side, k = Math.max(1, Math.round(L / (2 * r * this.r(0.85, 1.15))));
        for (let j = 0; j < k; j++) {
          const t0 = j / k, t1 = (j + 1) / k, hh = (L / k) * 0.46 * bulge * this.r(0.8, 1.2);
          for (let s2 = 0; s2 <= 5; s2++) { const u = s2 / 5, t = lerp(t0, t1, u), b2 = Math.sin(Math.PI * u) * hh; out.push([a[0] + dx * t + nx * b2, a[1] + dy * t + ny * b2]); }
        }
      }
      if (out.length > 1) this.path(out, { rough: o.rough ?? 0.5, w: o.w ?? this.w, c: o.c, a: o.a, passes: 1, closed: false });
      return out;
    }
    /* Billowing cloud / smoke puff: scalloped outline, inner lobes, hatch shading, optional highlight strokes. */
    cloud(cx, cy, w, h, o = {}) {
      const k = o.lobes ?? 12, pts = [];
      for (let i = 0; i < k; i++) { const a = i * TAU / k + this.r(-0.15, 0.15), rr = this.r(0.8, 1.05); pts.push([cx + Math.cos(a) * w / 2 * rr, cy + Math.sin(a) * h / 2 * rr]); }
      const r = o.r ?? Math.max(4, Math.min(w, h) / 6);
      const out = this.scallop(pts, { closed: true, r, w: o.w, c: o.c, a: o.a });
      for (let i = 0; i < (o.inner ?? 3); i++) {
        const ix = cx + this.r(-0.25, 0.25) * w, iy = cy + this.r(-0.2, 0.2) * h, sc = this.r(0.35, 0.6), q = [];
        for (let j = 0; j < 8; j++) { const a = j * TAU / 8 + this.r(-0.2, 0.2); q.push([ix + Math.cos(a) * w / 2 * sc, iy + Math.sin(a) * h / 2 * sc]); }
        this.scallop(q, { closed: true, r: r * 0.7, w: (o.w ?? this.w) * 0.7, c: o.c, a: (o.a ?? this.a) * 0.75 });
      }
      if (o.shade !== false) this.hatch(out, { ang: o.ang ?? -50, gap: o.gap ?? 2.4, a: 0.55, w: 0.5, c: o.c, fade: (x, y) => Math.max(0, Math.min(1, ((x - cx) / w + (y - cy) / h) * 1.1 + 0.35)), piece: 8, inset: 2 });
      if (o.fill) this.wash(out, o.fill, o.fillA ?? 0.5, { edge: 0, jit: 0.6 });
      if (o.hi) for (let i = 0; i < 3; i++) { const a = this.r(3.4, 5.2), rr = this.r(0.3, 0.42); this.arc(cx + Math.cos(a) * w * 0.3, cy + Math.sin(a) * h * 0.25, w * rr * 0.4, h * rr * 0.3, a - 0.5, a + 0.6, { c: o.hi, w: 1.1, a: 0.9, passes: 1, rough: 0.3 }); }
      return out;
    }
    /* Rope of overlapping cloud-lobes following a path (the "smoke tube" look). r0→r1 = radius at start→end. */
    cloudTube(path, r0, r1, o = {}) {
      const S0 = catmull(path, false, Math.max(3, Math.min(r0, r1) * 0.9)), n = S0.length; if (n < 3) return this;
      const L = [], Rr = [], C = [];
      for (let i = 0; i < n; i++) {
        const a = S0[Math.max(0, i - 1)], b = S0[Math.min(n - 1, i + 1)]; let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
        const rr = lerp(r0, r1, i / (n - 1)) * this.r(0.92, 1.08);
        L.push([S0[i][0] - ty * rr, S0[i][1] + tx * rr]); Rr.push([S0[i][0] + ty * rr, S0[i][1] - tx * rr]); C.push([tx, ty, rr]);
      }
      const bump = (A, B, side) => { const dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l * side, ny = dx / l * side, h = l * 0.55, pp = []; for (let u = 0; u <= 5; u++) { const t = u / 5, bb = Math.sin(Math.PI * t) * h; pp.push([A[0] + dx * t + nx * bb, A[1] + dy * t + ny * bb]); } return pp; };
      let lo = [], ro = [];
      for (let i = 0; i + 1 < n; i++) { lo = lo.concat(bump(L[i], L[i + 1], -1)); ro = ro.concat(bump(Rr[i], Rr[i + 1], 1)); }
      const oo = { rough: 0.45, w: o.w ?? this.w, c: o.c, a: o.a, passes: 1 };
      this.path(lo, oo); this.path(ro, oo);
      for (let i = 1; i + 1 < n; i += (o.rib ?? 1)) { const c = S0[i], t = C[i], rr = C[i][2], m = [c[0] + t[0] * rr * 0.5, c[1] + t[1] * rr * 0.5]; this.curve([L[i], m, Rr[i]], { rough: 0.35, w: (o.w ?? this.w) * 0.7, c: o.c, a: (o.a ?? this.a) * 0.8 }); }
      if (o.shade !== false) { const poly = L.concat(Rr.slice().reverse()); this.hatch(poly, { ang: o.ang ?? -55, gap: o.gap ?? 2.4, a: 0.5, w: 0.45, c: o.c, fade: (x, y) => 0.55, piece: 8, inset: 1 }); }
      return this;
    }
    /* straight ruler scale: ticks every `step`, longer every `major` */
    ruler(x1, y1, x2, y2, step, major = 5, o = {}) {
      const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, nx = -uy * (o.side ?? 1), ny = ux * (o.side ?? 1), tl = o.len ?? 6;
      this.line(x1, y1, x2, y2, { w: o.w ?? 0.7, a: o.a ?? 0.7, rough: 0.3, passes: 1, c: o.c });
      for (let i = 0, d = 0; d <= L + 0.1; i++, d += step) { const l = i % major === 0 ? tl : tl * 0.5; this.line(x1 + ux * d, y1 + uy * d, x1 + ux * d + nx * l, y1 + uy * d + ny * l, { w: 0.6, a: o.a ?? 0.7, passes: 1, over: 0, rough: 0.15, c: o.c }); }
      return this;
    }
    arcTicks(cx, cy, r, a0, a1, step, major = 5, o = {}) {
      const tl = o.len ?? 6, dir = o.side ?? 1;
      this.arc(cx, cy, r, r, a0, a1, { w: o.w ?? 0.7, a: o.a ?? 0.7, passes: 1, rough: 0.4, c: o.c });
      for (let i = 0, a = a0; a <= a1 + 1e-6; i++, a += step) { const l = i % major === 0 ? tl : tl * 0.5; this.line(cx + Math.cos(a) * r, cy + Math.sin(a) * r, cx + Math.cos(a) * (r + dir * l), cy + Math.sin(a) * (r + dir * l), { w: 0.6, a: o.a ?? 0.7, passes: 1, over: 0, rough: 0.15, c: o.c }); }
      return this;
    }
    /* bundle of n parallel traces that follow a polyline with chamfered 45-degree corners (PCB look) */
    bus(pts, n, gap, o = {}) {
      const ch = o.chamfer ?? gap * n * 0.9, P2 = [pts[0]];
      for (let i = 1; i + 1 < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], c = pts[i + 1], l1 = Math.hypot(b[0] - a[0], b[1] - a[1]), l2 = Math.hypot(c[0] - b[0], c[1] - b[1]);
        const d1 = Math.min(ch, l1 / 2), d2 = Math.min(ch, l2 / 2);
        P2.push([b[0] + (a[0] - b[0]) / l1 * d1, b[1] + (a[1] - b[1]) / l1 * d1], [b[0] + (c[0] - b[0]) / l2 * d2, b[1] + (c[1] - b[1]) / l2 * d2]);
      }
      P2.push(pts[pts.length - 1]);
      const m = P2.length, N = [];
      for (let i = 0; i < m; i++) {
        const a = P2[Math.max(0, i - 1)], b = P2[i], c = P2[Math.min(m - 1, i + 1)];
        let t1x = b[0] - a[0], t1y = b[1] - a[1], t2x = c[0] - b[0], t2y = c[1] - b[1]; const l1 = Math.hypot(t1x, t1y) || 1, l2 = Math.hypot(t2x, t2y) || 1; t1x /= l1; t1y /= l1; t2x /= l2; t2y /= l2;
        if (i === 0) { t1x = t2x; t1y = t2y; } if (i === m - 1) { t2x = t1x; t2y = t1y; }
        let nx = -(t1y + t2y), ny = t1x + t2x; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
        const dot = nx * (-t1y) + ny * t1x; N.push([nx / Math.max(0.5, dot), ny / Math.max(0.5, dot)]);
      }
      for (let k = 0; k < n; k++) {
        const off = (k - (n - 1) / 2) * gap, line = P2.map((p, i) => [p[0] + N[i][0] * off, p[1] + N[i][1] * off]);
        const col = o.colors ? o.colors[k % o.colors.length] : o.c;
        this.pl(line, { w: o.w ?? 1.5, c: col, a: o.a ?? 0.95, rough: o.rough ?? 0.35, over: 0, passes: 1 });
        if (o.pads) { this.circle(line[0][0], line[0][1], o.pads, { w: 1, c: col, passes: 1, rough: 0.2 }); this.circle(line[line.length - 1][0], line[line.length - 1][1], o.pads, { w: 1, c: col, passes: 1, rough: 0.2 }); }
      }
      return this;
    }

    /* Engraved "grain lines" that follow a centre path (bark, branches, stems): n curves across the width,
       thick on the shadow side, thin on the light side, broken into runs like a burin lifting off the plate. */
    strands(pts, h0, h1, n, o = {}) {
      const S = catmull(pts, false, o.step || 5), m = S.length; if (m < 3) return this;
      const hw = typeof h0 === 'function' ? h0 : t => lerp(h0, h1, t), edges = o.edges ?? true, sh = o.shadow ?? 1;
      const N = []; for (let i = 0; i < m; i++) { const a = S[Math.max(0, i - 1)], b = S[Math.min(m - 1, i + 1)]; let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; N.push([-ty / l, tx / l]); }
      const side = (a, u, wob) => S.slice(a[0], a[1]).map((p, j) => { const i = a[0] + j, t = i / (m - 1), w = hw(t) * (u + this.nz(wob + i * 0.07) * 0.035); return [p[0] + N[i][0] * w, p[1] + N[i][1] * w]; });
      if (edges) for (const u of [-1, 1]) { this.path(side([0, m], u, this.r(0, 100)), { rough: o.rough ?? 0.5, w: (o.w ?? 1.3) * (u * sh > 0 ? 1.25 : 0.85), c: o.c, a: o.a ?? 0.95, passes: 1 }); }
      for (let k = 0; k < n; k++) {
        const r = (k + 0.5) / n * 2 - 1, u = Math.sign(r) * Math.pow(Math.abs(r), 0.85) * 0.94, wob = this.r(0, 200);
        const lightF = Math.max(0.25, Math.min(1.5, 0.75 + u * sh * 0.65));
        let i = Math.floor(this.r(0, 10));
        while (i < m - 2) {
          const run = Math.max(3, Math.floor(this.r(o.runMin ?? 6, o.runMax ?? 30)));
          const seg = side([i, Math.min(m, i + run)], u, wob);
          if (seg.length > 2) this.path(seg, { rough: 0.3, w: (o.w ?? 1.3) * 0.5 * lightF, c: o.c, a: (o.a ?? 0.95) * this.r(0.55, 0.95) * Math.min(1, 0.55 + lightF * 0.35), passes: 1 });
          i += run + Math.floor(this.r(0, o.gap ?? 6));
        }
      }
      return this;
    }
    /* Botanical leaf: pointed outline, midrib and paired veins. */
    leaf(x, y, ang, len, w, o = {}) {
      const ca = Math.cos(ang), sa = Math.sin(ang), T = (u, v) => [x + ca * u - sa * v, y + sa * u + ca * v];
      const L = [T(0, 0), T(len * 0.25, -w * 0.9), T(len * 0.62, -w * 0.72), T(len, 0)], R = [T(0, 0), T(len * 0.25, w * 0.9), T(len * 0.62, w * 0.72), T(len, 0)];
      const oo = { rough: 0.25, w: o.w ?? 0.8, c: o.c, a: o.a ?? 0.85, passes: 1 };
      this.curve(L, oo); this.curve(R, oo);
      if (!o.simple) {
        const a = T(0, 0), b = T(len * 0.94, 0); this.line(a[0], a[1], b[0], b[1], { w: (o.w ?? 0.8) * 0.8, c: o.c, a: (o.a ?? 0.85) * 0.9, passes: 1, over: 0, rough: 0.15 });
        const nv = o.veins ?? 3;
        for (let i = 1; i <= nv; i++) { const t = i / (nv + 1) * 0.85 + 0.1, p = T(len * t, 0), e1 = T(len * (t + 0.16), -w * 0.6 * (1 - t * 0.5)), e2 = T(len * (t + 0.16), w * 0.6 * (1 - t * 0.5)); this.line(p[0], p[1], e1[0], e1[1], { w: 0.4, c: o.c, a: 0.55, passes: 1, over: 0, rough: 0.1 }); this.line(p[0], p[1], e2[0], e2[1], { w: 0.4, c: o.c, a: 0.55, passes: 1, over: 0, rough: 0.1 }); }
      }
      return this;
    }
    /* opaque patch that hides what is behind it (erase() would show the bare paper on cyanotype) */
    occlude(poly, color) { return this.push({ k: 'f', poly, c: color, a: 1, g: null, edge: 0, steps: 1 }); }

    /* ---------- sheet furniture ---------- */
    frame(title, sub, n, total, o = {}) {
      if (o.style === 'none') return this;
      const R = { rough: 0.35, over: 2, passes: 1 };
      this.rect(26, 26, 1548, 948, Object.assign({ w: 1.7, a: 0.85 }, R));
      this.rect(38, 38, 1524, 924, Object.assign({ w: 0.8, a: 0.7 }, R));
      // centre marks
      for (const [x, y, x2, y2] of [[800, 26, 800, 38], [800, 962, 800, 974], [26, 500, 38, 500], [1562, 500, 1574, 500]]) this.line(x, y, x2, y2, { w: 1.2, rough: 0.2, passes: 1, over: 0 });
      // title block
      const bx = 1150, by = 866, bw = 412, bh = 96;
      this.rect(bx, by, bw, bh, Object.assign({ w: 1.3, a: 0.85 }, R));
      this.line(bx, by + 34, bx + bw, by + 34, Object.assign({ w: 0.8 }, R));
      this.line(bx + 250, by + 34, bx + 250, by + bh, Object.assign({ w: 0.8 }, R));
      this.line(bx + 250, by + 65, bx + bw, by + 65, Object.assign({ w: 0.8 }, R));
      this.text(title, bx + 12, by + 26, { size: 27, font: HAND, a: 0.92 });
      this.text(sub, bx + 12, by + 58, { size: 18 });
      this.text(o.note || 'freehand, pencil on cartridge paper', bx + 12, by + 84, { size: 15, a: 0.7 });
      this.text('SHEET', bx + 262, by + 56, { size: 12, font: HAND, a: 0.6 });
      this.text(`${n} / ${total}`, bx + 318, by + 58, { size: 24, font: HAND });
      this.text(o.scale || 'SCALE  n.t.s.', bx + 262, by + 89, { size: 15, font: HAND, a: 0.8 });
      return this;
    }
  }


  /* Tiny pinhole camera: world x right, y up, z forward. Returns project(p) -> [sx, sy, depth] or null behind the lens. */
  function cam(o) {
    const pos = o.pos || [0, 0, 0], yaw = o.yaw || 0, pit = o.pitch || 0, f = o.f || 800, cx = o.cx ?? 800, cy = o.cy ?? 500;
    const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pit), sp = Math.sin(pit);
    return p => {
      let x = p[0] - pos[0], y = p[1] - pos[1], z = p[2] - pos[2];
      const x1 = x * cyw - z * syw, z1 = x * syw + z * cyw;           // yaw about y
      const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;             // pitch about x (positive looks up)
      if (z2 < 0.5) return null;
      return [cx + f * x1 / z2, cy - f * y2 / z2, z2];
    };
  }

  g.Sketch = { cam, Page, TAU, W, H, rng, rgb, rgba, pip, catmull, lerp, lerpP, HAND, NOTE };
})(window);
