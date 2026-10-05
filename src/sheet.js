(function () {
  'use strict';
  const S = Sketch, W = S.W, H = S.H;
  const stage = document.getElementById('stage');
  const paperC = document.getElementById('paper');
  const inkC = document.getElementById('ink');
  const grain = document.getElementById('grain');
  const ictx = inkC.getContext('2d');
  const pctx = paperC.getContext('2d');

  const SCENES = window.SCENES || []; SCENES.forEach((s, n) => { s.index = n; });
  const TOTAL = SCENES.length;
  let speedMul = 1, cur = -1, k = 1, switching = false, paused = false;
  const DURATION = 34; // seconds for a sheet at 1x
  // ?render: no UI, no automatic pen; tools/render.mjs drives the player through window.__sketch
  const RENDER = new URLSearchParams(location.search).has('render'); if (RENDER) document.body.classList.add('render');

  /* ---------------------------------------------------------------- paper */
  const THEMES = {
    cream: { base: '#f2ead8', blot: ['rgba(206,176,120,0.10)', 'rgba(255,255,255,0.14)'], grid: { minor: 20, major: 100, mc: 'rgba(96,120,150,0.075)', Mc: 'rgba(96,120,150,0.11)' }, fib: ['rgba(120,96,60,0.07)', 'rgba(255,255,255,0.35)'], vig: 'rgba(120,90,40,0.28)', tape: true, blend: 'multiply', grain: [250, 244, 230, 62] },
    kraft: { base: '#b68b56', blot: ['rgba(80,52,24,0.20)', 'rgba(232,192,132,0.20)'], grid: null, fib: ['rgba(60,38,18,0.20)', 'rgba(244,216,166,0.26)'], fibN: 6200, vig: 'rgba(40,24,8,0.42)', tape: false, blend: 'normal', grain: [246, 222, 176, 46] },
    mint: { base: '#edf4f0', blot: ['rgba(120,160,150,0.10)', 'rgba(255,255,255,0.20)'], grid: { minor: 10, major: 50, mc: 'rgba(60,140,140,0.15)', Mc: 'rgba(60,140,140,0.30)' }, fib: ['rgba(80,120,110,0.06)', 'rgba(255,255,255,0.4)'], vig: 'rgba(70,110,100,0.16)', tape: false, blend: 'multiply', grain: [240, 250, 246, 55] },
    pcb: { base: '#eeefe9', blot: ['rgba(160,150,110,0.08)', 'rgba(255,255,255,0.2)'], grid: { minor: 20, major: 100, mc: 'rgba(60,90,200,0.06)', Mc: 'rgba(60,90,200,0.14)' }, fib: ['rgba(100,100,80,0.06)', 'rgba(255,255,255,0.4)'], vig: 'rgba(120,110,70,0.18)', tape: false, blend: 'multiply', grain: [250, 250, 244, 50] },
    pencil: { base: '#f3efe2', blot: ['rgba(200,180,130,0.10)', 'rgba(255,255,255,0.16)'], grid: null, fib: ['rgba(110,96,64,0.06)', 'rgba(255,255,255,0.35)'], vig: 'rgba(120,100,60,0.18)', tape: false, blend: 'multiply', grain: [250, 246, 234, 70] },
    cyan: { base: '#e9e3d0', blot: ['rgba(150,120,70,0.10)', 'rgba(255,255,255,0.18)'], grid: null, fib: ['rgba(110,90,50,0.08)', 'rgba(255,255,255,0.45)'], vig: 'rgba(80,60,20,0.28)', tape: false, blend: 'normal', grain: [220, 240, 255, 34], glow: 'drop-shadow(0 0 1.1px rgba(190,225,255,0.55))' },
    sepia: { base: '#efe3c6', blot: ['rgba(190,150,90,0.13)', 'rgba(255,250,235,0.22)'], grid: null, fib: ['rgba(110,80,40,0.09)', 'rgba(255,255,255,0.4)'], fibN: 3400, vig: 'rgba(110,80,30,0.32)', tape: false, blend: 'multiply', grain: [250, 240, 216, 58] },
    ink: { base: '#f4f0e4', blot: ['rgba(190,170,120,0.10)', 'rgba(255,255,255,0.22)'], grid: { minor: 10, major: 50, mc: 'rgba(120,120,110,0.05)', Mc: 'rgba(120,120,110,0.10)' }, fib: ['rgba(100,90,60,0.06)', 'rgba(255,255,255,0.4)'], fibN: 2400, vig: 'rgba(100,90,50,0.22)', tape: false, blend: 'multiply', grain: [250, 246, 234, 52] },
    archive: { base: '#f1e9d2', blot: ['rgba(190,160,100,0.10)', 'rgba(255,252,240,0.20)'], grid: null, fib: ['rgba(120,96,60,0.06)', 'rgba(255,255,255,0.35)'], fibN: 3000, vig: 'rgba(130,100,50,0.20)', tape: false, blend: 'multiply', grain: [248, 242, 226, 50] },
    bluepen: { base: '#efe6d0', blot: ['rgba(200,170,110,0.12)', 'rgba(255,255,255,0.14)'], grid: null, fib: ['rgba(120,96,60,0.07)', 'rgba(255,255,255,0.3)'], vig: 'rgba(140,110,50,0.24)', tape: false, blend: 'multiply', grain: [250, 244, 226, 44] },
  };
  let theme = THEMES.cream;
  function themeFor(scene) { const t = scene && scene.theme; return typeof t === 'string' ? (THEMES[t] || THEMES.cream) : Object.assign({}, THEMES.cream, t || {}); }

  function paintPaper() {
    const w = paperC.width, h = paperC.height, R = S.rng(7), th = theme;
    pctx.setTransform(1, 0, 0, 1, 0, 0);
    pctx.fillStyle = th.base; pctx.fillRect(0, 0, w, h);
    pctx.setTransform(k, 0, 0, k, 0, 0);
    for (let i = 0; i < 26; i++) {
      const x = R() * W, y = R() * H, r = 120 + R() * 380;
      const g = pctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, R() > 0.5 ? th.blot[0] : th.blot[1]);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      pctx.fillStyle = g; pctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    if (th.grid) {
      const G = th.grid;
      pctx.strokeStyle = G.mc; pctx.lineWidth = 1 / k * 0.8; pctx.beginPath();
      for (let x = 0; x <= W; x += G.minor) { pctx.moveTo(x, 0); pctx.lineTo(x, H); }
      for (let y = 0; y <= H; y += G.minor) { pctx.moveTo(0, y); pctx.lineTo(W, y); }
      pctx.stroke();
      pctx.strokeStyle = G.Mc; pctx.beginPath();
      for (let x = 0; x <= W; x += G.major) { pctx.moveTo(x, 0); pctx.lineTo(x, H); }
      for (let y = 0; y <= H; y += G.major) { pctx.moveTo(0, y); pctx.lineTo(W, y); }
      pctx.stroke();
    }
    for (let i = 0; i < (th.fibN || 2600); i++) {
      const x = R() * W, y = R() * H, a = R() * 6.28, l = 3 + R() * 9;
      pctx.strokeStyle = R() > 0.5 ? th.fib[0] : th.fib[1];
      pctx.lineWidth = 0.5; pctx.beginPath(); pctx.moveTo(x, y);
      pctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); pctx.stroke();
    }
    const v = pctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, th.vig);
    pctx.fillStyle = v; pctx.fillRect(0, 0, W, H);
    if (th.tape) for (const [x, y, r] of [[38, 30, -0.7], [W - 38, 30, 0.7], [38, H - 30, 0.7], [W - 38, H - 30, -0.7]]) {
      pctx.save(); pctx.translate(x, y); pctx.rotate(r);
      pctx.fillStyle = 'rgba(232,214,160,0.72)'; pctx.fillRect(-42, -13, 84, 26);
      pctx.strokeStyle = 'rgba(160,130,70,0.35)'; pctx.lineWidth = 0.8; pctx.strokeRect(-42, -13, 84, 26);
      for (let t = -36; t < 40; t += 5) { pctx.beginPath(); pctx.moveTo(t, -13); pctx.lineTo(t + 1.5, 13); pctx.strokeStyle = 'rgba(160,130,70,0.10)'; pctx.stroke(); }
      pctx.restore();
    }
  }
  function makeGrain() {
    const c = document.createElement('canvas'); c.width = c.height = 220;
    const x = c.getContext('2d'), R = S.rng(99), id = x.createImageData(220, 220), G = theme.grain;
    for (let i = 0; i < id.data.length; i += 4) {
      const v = R();
      id.data[i] = G[0]; id.data[i + 1] = G[1]; id.data[i + 2] = G[2];
      id.data[i + 3] = v > 0.86 ? Math.floor((v - 0.86) * 7.1 * G[3]) : 0;
    }
    x.putImageData(id, 0, 0);
    grain.style.backgroundImage = `url(${c.toDataURL()})`;
    grain.style.backgroundSize = '220px 220px';
  }
  function applyTheme(scene) {
    theme = themeFor(scene);
    inkC.style.mixBlendMode = theme.blend;
    inkC.style.filter = theme.glow || 'none';
    makeGrain();
    if (paperC.width) paintPaper();
  }

  /* --------------------------------------------------------------- player */
  class Player {
    constructor(scene) {
      const P = new S.Page(scene.seed, { ink: scene.ink });
      scene.build(P, scene.index + 1, TOTAL);
      this.page = P; this.ops = P.ops; this.i = 0; this.j = 0; this.credit = 0; this.seed = scene.seed; this.scene = scene;
      // animated groups: op ranges the scene marked as live; after the pen finishes they are redrawn every frame
      this.anims = (P.anims || []).map(a => Object.assign({ st: {} }, a)); this.skip = new Uint8Array(this.ops.length); this.anims.forEach(a => this.skip.fill(1, a.i0, a.i1)); this.base = null; this.t0 = null; this.reveal = !!scene.reveal; this.full = null;
      this.total = 0;
      for (const op of this.ops) this.total += this.units(op) * this.ucost(op);
    }
    units(op) {
      switch (op.k) { case 's': return Math.max(0, op.p.length - 1); case 'f': return this.reveal ? this.bands(op).n : op.steps; default: return 1; }
    }
    ucost(op) {
      switch (op.k) { case 's': return 1; case 'f': return this.reveal ? (this.bands(op).n > 1 ? 30 : 9) : 9; case 'D': return 1 + op.p.length * 0.12; case 'e': return 2; default: return 1; }
    }
    get done() { return this.i >= this.ops.length; }
    get fraction() { return this.done ? 1 : this.i / this.ops.length; }
    reset() { ictx.setTransform(1, 0, 0, 1, 0, 0); ictx.clearRect(0, 0, inkC.width, inkC.height); ictx.setTransform(k, 0, 0, k, 0, 0); }
    advance(b) {
      this.credit += b;
      while (this.i < this.ops.length) {
        const op = this.ops[this.i], N = this.units(op);
        if (N === 0) { this.i++; this.j = 0; continue; }
        const uc = this.ucost(op), avail = Math.floor(this.credit / uc);
        if (avail < 1) break;
        const take = Math.min(avail, N - this.j);
        this.draw(op, this.j, this.j + take, ictx, this.pat);
        this.j += take; this.credit -= take * uc;
        if (this.j >= N) { this.i++; this.j = 0; }
      }
      if (this.done) this.credit = 0;
    }
    finish() { this.advance(Infinity); }
    /* ---- reveal mode: the finished page is rendered up front and the pen uncovers it stroke by stroke,
       so strokes that end up hidden (back faces in the 3D painter's order) never flash on screen ---- */
    ensure() {
      if (!this.reveal && !this.anims.length) return;
      if (this.reveal && (!this.full || this.full.k !== k)) {
        const c = document.createElement('canvas'); c.width = inkC.width; c.height = inkC.height; const x = c.getContext('2d'); x.setTransform(k, 0, 0, k, 0, 0); this.drawAll(this.ops, x);
        const pat = ictx.createPattern(c, 'no-repeat'); pat.setTransform(new DOMMatrix([1 / k, 0, 0, 1 / k, 0, 0])); this.full = { c, k, pat };
      }
      if (this.anims.length && (!this.base || this.base.k !== k)) { this.buildBase(); this.anims.forEach(a => { a.st.at = undefined; }); }
    }
    /* a fill is uncovered as a sweep of diagonal strips, so big black masses get inked in rather than popping in */
    bands(op) {
      if (op.rb) return op.rb;
      const white = !op.g && op.a >= 1 && /^#f{3,6}$/i.test(op.c); let A = 0, v0 = 1e9, v1 = -1e9; const ca = Math.cos(-0.7), sa = Math.sin(-0.7);
      for (let i = 0; i < op.poly.length; i++) { const p = op.poly[i], q = op.poly[(i + 1) % op.poly.length]; A += p[0] * q[1] - q[0] * p[1]; const v = -p[0] * sa + p[1] * ca; if (v < v0) v0 = v; if (v > v1) v1 = v; }
      A = Math.abs(A) / 2; const n = white ? 1 : Math.max(1, Math.min(400, Math.round(A / 260)));
      return (op.rb = { n, white, v0, v1, ca, sa });
    }
    get pat() { return this.reveal && this.full ? this.full.pat : null; }
    drawReveal(op, from, to, c, rv) {
      c.fillStyle = rv;
      switch (op.k) {
        case 's': {
          const p = op.p, L = [], Rr = [];
          for (let n = from; n <= to; n++) {
            const q = p[n], a = p[Math.max(0, n - 1)], b = p[Math.min(p.length - 1, n + 1)];
            let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
            const hw = q[2] * 1.1 + 0.8;
            L.push(q[0] - ty * hw, q[1] + tx * hw); Rr.push(q[0] + ty * hw, q[1] - tx * hw);
          }
          c.beginPath(); c.moveTo(L[0], L[1]); for (let n = 2; n < L.length; n += 2) c.lineTo(L[n], L[n + 1]); for (let n = Rr.length - 2; n >= 0; n -= 2) c.lineTo(Rr[n], Rr[n + 1]); c.closePath(); c.fill();
          break;
        }
        case 'f': {
          // fills lay down their own ink (white occluders hide what is behind, washes tint); big ones sweep in as strips
          const B = this.bands(op); c.fillStyle = op.g ? rv : (op.fs || (op.fs = S.rgba(op.c, op.a))); c.save(); c.beginPath(); c.moveTo(op.poly[0][0], op.poly[0][1]); for (let n = 1; n < op.poly.length; n++) c.lineTo(op.poly[n][0], op.poly[n][1]); c.closePath();
          if (B.n === 1) { c.fill(); c.restore(); break; }
          c.clip(); const h = (B.v1 - B.v0) / B.n, a = B.v0 + from * h - 1, b = B.v0 + to * h + 1, L = 4000, px = -B.sa, py = B.ca, ux = B.ca, uy = B.sa;
          c.beginPath(); c.moveTo(px * a - ux * L, py * a - uy * L); c.lineTo(px * a + ux * L, py * a + uy * L); c.lineTo(px * b + ux * L, py * b + uy * L); c.lineTo(px * b - ux * L, py * b - uy * L); c.closePath(); c.fill(); c.restore();
          break;
        }
        case 'd': c.beginPath(); c.arc(op.x, op.y, op.r + 0.8, 0, 6.3); c.fill(); break;
        case 'D': for (const q of op.p) { c.beginPath(); c.arc(q[0], q[1], q[2] + 0.8, 0, 6.3); c.fill(); } break;
      }
    }
    /* ---- live animation ---- */
    drawAll(ops, c, skip) { for (let n = 0; n < ops.length; n++) { if (skip && skip[n]) continue; const op = ops[n], N = op.k === 'f' ? op.steps : this.units(op); if (N === 0) continue; this.draw(op, 0, N, c); } }
    buildBase() {
      const c = document.createElement('canvas'); c.width = inkC.width; c.height = inkC.height; const x = c.getContext('2d'); x.setTransform(k, 0, 0, k, 0, 0);
      this.drawAll(this.ops, x, this.skip); this.base = { c, k };
    }
    bbox(ops) {
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; const inc = (x, y, r = 2) => { if (x - r < x0) x0 = x - r; if (y - r < y0) y0 = y - r; if (x + r > x1) x1 = x + r; if (y + r > y1) y1 = y + r; };
      for (const op of ops) { if (op.p) op.p.forEach(q => inc(q[0], q[1], (q[2] || 1) + 2)); if (op.poly) op.poly.forEach(q => inc(q[0], q[1])); if (op.k === 'd') inc(op.x, op.y, op.r + 2); }
      x0 = Math.max(-240, Math.floor(x0)); y0 = Math.max(-240, Math.floor(y0)); x1 = Math.min(W + 240, Math.ceil(x1)); y1 = Math.min(H + 240, Math.ceil(y1));
      return x1 > x0 && y1 > y0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
    }
    genAnim(a, t) {
      const Q = new S.Page(this.seed + 7 + Math.floor(t * 4) % 3, { ink: this.page.ink }); a.fn(Q, t); const st = a.st; st.ops = Q.ops; st.at = t; st.k = k;
      if (a.cache) { const bb = this.bbox(Q.ops); st.bb = bb; if (!bb) return; const c = st.c || (st.c = document.createElement('canvas')); c.width = Math.ceil(bb.w * k); c.height = Math.ceil(bb.h * k); const x = c.getContext('2d'); x.setTransform(k, 0, 0, k, -bb.x * k, -bb.y * k); this.drawAll(Q.ops, x); }
    }
    animate(now) {
      if (this.t0 === null) this.t0 = now; const t = (now - this.t0) / 1000;
      if (this.scene.takeover) { const c = ictx; c.setTransform(1, 0, 0, 1, 0, 0); if (this.scene.takeover(c, t, inkC.width, inkC.height, this)) return; }
      this.ensure();
      const c = ictx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, inkC.width, inkC.height); c.drawImage(this.base.c, 0, 0);
      for (const a of this.anims) {
        const st = a.st, fps = a.fps ?? 24;
        if (st.at === undefined || st.k !== k || (fps > 0 && (t - st.at >= 1 / fps || t < st.at))) this.genAnim(a, t);
        c.setTransform(k, 0, 0, k, 0, 0);
        if (a.xf) { const m = a.xf(t); c.translate((m.x || 0) + (m.px || 0), (m.y || 0) + (m.py || 0)); if (m.rot) c.rotate(m.rot); c.translate(-(m.px || 0), -(m.py || 0)); }
        if (a.cache) { if (st.bb) c.drawImage(st.c, st.bb.x, st.bb.y, st.bb.w, st.bb.h); } else this.drawAll(st.ops, c);
      }
      c.setTransform(k, 0, 0, k, 0, 0);
    }
    /* redraw everything already drawn (after a resize / sheet switch) */
    replay() {
      const ti = this.i, tj = this.j;
      this.ensure(); this.reset();
      for (let n = 0; n <= ti && n < this.ops.length; n++) {
        const op = this.ops[n], N = this.units(op);
        if (N === 0) continue;
        this.draw(op, 0, n < ti ? N : tj, ictx, this.pat);
      }
    }
    draw(op, from, to, c = ictx, rv = null) {
      if (op.blend && !rv) { c.save(); c.globalCompositeOperation = op.blend; try { this.drawOp(op, from, to, c, rv); } finally { c.restore(); } return; }
      this.drawOp(op, from, to, c, rv);
    }
    drawOp(op, from, to, c = ictx, rv = null) {
      if (to <= from && op.k !== 'e') return;
      if (rv) return this.drawReveal(op, from, to, c, rv);
      switch (op.k) {
        case 's': {
          const p = op.p, fs = op.fs || (op.fs = S.rgba(op.c, op.a));
          const L = [], Rr = [];
          for (let n = from; n <= to; n++) {
            const q = p[n], a = p[Math.max(0, n - 1)], b = p[Math.min(p.length - 1, n + 1)];
            let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
            const hw = q[2] * 0.68;
            L.push(q[0] - ty * hw, q[1] + tx * hw); Rr.push(q[0] + ty * hw, q[1] - tx * hw);
          }
          c.fillStyle = fs; c.beginPath(); c.moveTo(L[0], L[1]);
          for (let n = 2; n < L.length; n += 2) c.lineTo(L[n], L[n + 1]);
          for (let n = Rr.length - 2; n >= 0; n -= 2) c.lineTo(Rr[n], Rr[n + 1]);
          c.closePath(); c.fill();
          break;
        }
        case 'f': {
          const steps = op.steps, aStep = a => 1 - Math.pow(1 - a, 1 / steps);
          c.beginPath(); c.moveTo(op.poly[0][0], op.poly[0][1]);
          for (let n = 1; n < op.poly.length; n++) c.lineTo(op.poly[n][0], op.poly[n][1]);
          c.closePath();
          for (let s = from; s < to; s++) {
            if (op.g) {
              const g = op.g, gr = g.r1 !== undefined ? c.createRadialGradient(g.x0, g.y0, g.r0 || 0, g.x0, g.y0, g.r1) : c.createLinearGradient(g.x0, g.y0, g.x1, g.y1);
              gr.addColorStop(0, S.rgba(g.c0, aStep(g.a0))); gr.addColorStop(1, S.rgba(g.c1, aStep(g.a1)));
              c.fillStyle = gr;
            } else c.fillStyle = S.rgba(op.c, aStep(op.a));
            c.fill();
          }
          if (to >= steps && op.edge) {
            c.lineWidth = 1.2; c.lineJoin = 'round';
            c.strokeStyle = S.rgba(op.g ? op.g.c1 : op.c, Math.min(1, (op.g ? op.g.a1 : op.a) * 0.55));
            c.stroke();
          }
          break;
        }
        case 'd': c.fillStyle = S.rgba(op.c, op.a); c.beginPath(); c.arc(op.x, op.y, op.r, 0, 6.3); c.fill(); break;
        case 'D': {
          c.fillStyle = S.rgba(op.c, op.a);
          for (const q of op.p) { c.beginPath(); c.arc(q[0], q[1], q[2], 0, 6.3); c.fill(); }
          break;
        }
        case 'e': {
          c.save(); c.globalCompositeOperation = 'destination-out'; c.fillStyle = '#000';
          c.beginPath(); c.moveTo(op.poly[0][0], op.poly[0][1]);
          for (let n = 1; n < op.poly.length; n++) c.lineTo(op.poly[n][0], op.poly[n][1]);
          c.closePath(); c.fill(); c.restore();
          break;
        }
      }
    }
  }

  /* ------------------------------------------------------------------ app */
  const players = [];
  function playerFor(i) { return players[i] || (players[i] = new Player(SCENES[i])); }

  function layout() {
    const availW = RENDER ? window.innerWidth : window.innerWidth - 12, availH = RENDER ? window.innerHeight : window.innerHeight - 54 - 12;
    const scale = Math.min(availW / W, availH / H);
    const cw = Math.floor(W * scale), ch = Math.floor(H * scale), dpr = Math.min(2, window.devicePixelRatio || 1);
    stage.style.width = cw + 'px'; stage.style.height = ch + 'px';
    const pw = Math.round(cw * dpr), ph = Math.round(ch * dpr);
    const changed = paperC.width !== pw || paperC.height !== ph;
    if (changed) {
      paperC.width = inkC.width = pw; paperC.height = inkC.height = ph;
      k = pw / W;
      paintPaper();
      if (cur >= 0) playerFor(cur).replay();
    }
  }

  function show(i, instant) {
    i = (i + TOTAL) % TOTAL;
    if (switching) return;
    switching = true;
    const go = () => {
      cur = i;
      history.replaceState(null, '', '#' + (i + 1));
      document.querySelectorAll('#tabs button').forEach((b, n) => b.classList.toggle('on', n === i));
      const p = playerFor(i);
      applyTheme(SCENES[i]); layout(); p.replay();
      stage.classList.remove('out');
      switching = false;
    };
    if (instant) go(); else { stage.classList.add('out'); setTimeout(go, 330); }
  }

  let last = performance.now(), renderT = null;
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (cur >= 0 && !switching) {
      const p = playerFor(cur);
      if (RENDER) { if (p.done && (p.anims.length || p.scene.takeover) && renderT !== null) p.animate(renderT * 1000); }
      else if (!p.done) { p.ensure(); p.advance(Math.max(140, p.total / DURATION) * speedMul * dt); p.t0 = null; }
      else if (!RENDER && (p.anims.length || p.scene.takeover) && !paused) p.animate(now);
      if (p.scene.pump) p.scene.pump(p.done);
    }
    requestAnimationFrame(frame);
  }

  function boot() {
    const tabs = document.getElementById('tabs');
    SCENES.forEach((s, n) => {
      const b = document.createElement('button');
      b.textContent = s.name; b.title = s.name;
      b.onclick = () => show(n);
      tabs.appendChild(b);
    });
    document.getElementById('prev').onclick = () => show(cur - 1);
    document.getElementById('next').onclick = () => show(cur + 1);
    document.getElementById('redraw').onclick = () => { const p = playerFor(cur); p.i = 0; p.j = 0; p.credit = 0; p.reset(); };
    document.getElementById('finish').onclick = () => { const p = playerFor(cur); p.finish(); };
    const sp = document.getElementById('speed');
    sp.onclick = () => { speedMul = speedMul === 1 ? 2 : speedMul === 2 ? 4 : speedMul === 4 ? 0.5 : 1; sp.textContent = speedMul + '×'; };
    addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') show(cur + 1);
      else if (e.key === 'ArrowLeft') show(cur - 1);
      else if (e.key === ' ') { e.preventDefault(); playerFor(cur).finish(); }
      else if (e.key === 'r' || e.key === 'R') document.getElementById('redraw').click();
      else if (e.key === 'p' || e.key === 'P') { paused = !paused; }
    });
    addEventListener('resize', layout);
    const start = Math.max(0, Math.min(TOTAL - 1, (parseInt(location.hash.slice(1), 10) || 1) - 1));
    layout();
    show(start, true);
    // if the handwriting font arrives late, re-lay the lettering out
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => {
      players.forEach(p => { if (p) { p.ops.forEach(o => { if (o.lay) o.lay = null; }); p.base = null; p.full = null; } });
      if (cur >= 0) playerFor(cur).replay();
    });
    requestAnimationFrame(frame);
    window.__sketch = { show, get player() { return playerFor(cur); }, players, scenes: SCENES.map(s => s.name),
      // for tools/render.mjs: draw a fraction of the drawing, or all of it, or set the clock for animated parts
      at(frac) { const p = playerFor(cur); p.i = 0; p.j = 0; p.credit = 0; p.reset(); p.ensure(); if (frac >= 1) p.finish(); else p.advance(p.total * frac); return p.done; },
      step(units) { const p = playerFor(cur); p.ensure(); p.advance(units); return p.done; },
      clock(t) { renderT = t; const p = playerFor(cur); p.t0 = 0; if (p.done && (p.anims.length || p.scene.takeover)) p.animate(t * 1000); },
      stats() { const p = playerFor(cur), sec = p.page.sections || [], n = p.ops.length; return { name: p.scene.name, ops: n, total: p.total, done: p.done, missing: [...(p.page.missing || [])].join(''), sections: sec.map((q, i) => ({ name: q.name, ops: (i + 1 < sec.length ? sec[i + 1].at : n) - q.at })), before: sec.length ? sec[0].at : n }; } };
  }

  const fontsReady = document.fonts && document.fonts.load
    ? Promise.race([Promise.all([document.fonts.load('16px "Architects Daughter"'), document.fonts.load('16px Caveat')]), new Promise(r => setTimeout(r, 1500))])
    : Promise.resolve();
  fontsReady.catch(() => { }).then(boot);
})();
