// Coral reef: a shallow sandy lagoon with corals and anemones, tropical fish and sea turtles.
import makeFish from './lib/fish.js';

export default function reef(api) {
  const { rand, pick, sounds: { bloop } } = api;
  const Fish = makeFish(api);

  // --- Sea turtle, seen from above, paddling with its front flippers ---
  class Turtle extends api.Critter {
    constructor(look) {
      super(look);
      this.sizeMul = 2.2; this.speedMul = 0.42; this.z = 2;   // big, slow, swims above the fish
      this.len = rand(0.9, 1.1);
    }
    mouth() { const d = this.L * 0.36; return [this.x + Math.cos(this.heading) * d, this.y + Math.sin(this.heading) * d]; }
    place(c) { c.translate(this.x, this.y); c.rotate(this.heading); }
    flippers(c, L, fill) {
      const paddle = Math.sin(this.phase * 0.55);
      for (const k of [1, -1]) {
        c.save(); c.translate(0.1 * L, k * 0.15 * L); c.rotate(k * (1.15 + 0.45 * paddle));
        c.beginPath(); c.ellipse(0.15 * L, 0, 0.17 * L, 0.05 * L, k * 0.12, 0, Math.PI * 2); fill(); c.restore();
        c.save(); c.translate(-0.17 * L, k * 0.11 * L); c.rotate(k * (2.35 - 0.25 * paddle));
        c.beginPath(); c.ellipse(0.06 * L, 0, 0.075 * L, 0.035 * L, 0, 0, Math.PI * 2); fill(); c.restore();
      }
    }
    shadow(c) {
      const L = this.L;
      c.save(); this.place(c);
      c.beginPath(); c.ellipse(0, 0, 0.27 * L, 0.21 * L, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(0.3 * L, 0, 0.09 * L, 0.065 * L, 0, 0, Math.PI * 2); c.fill();
      this.flippers(c, L, () => c.fill());
      c.restore();
    }
    draw(c) {
      const L = this.L, look = this.look;
      c.save(); this.place(c);
      c.fillStyle = look.skin; c.strokeStyle = look.scute; c.lineWidth = Math.max(1, L * 0.008);
      this.flippers(c, L, () => { c.fill(); c.stroke(); });
      // head, turning a little from side to side
      c.save(); c.rotate(Math.sin(this.phase * 0.25) * 0.12);
      c.beginPath(); c.ellipse(0.3 * L, 0, 0.09 * L, 0.065 * L, 0, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = '#111';
      for (const k of [1, -1]) { c.beginPath(); c.arc(0.33 * L, k * 0.045 * L, 0.012 * L, 0, Math.PI * 2); c.fill(); }
      c.restore();
      // shell with scutes
      const shell = new Path2D(); shell.ellipse(0, 0, 0.27 * L, 0.21 * L, 0, 0, Math.PI * 2);
      const g = c.createRadialGradient(-0.03 * L, -0.03 * L, 0.02 * L, 0, 0, 0.28 * L);
      g.addColorStop(0, look.shellLight); g.addColorStop(1, look.shell);
      c.fillStyle = g; c.fill(shell);
      c.save(); c.clip(shell);
      c.strokeStyle = look.scute; c.lineWidth = Math.max(1.2, L * 0.012); c.lineJoin = 'round';
      const hex = (cx, cy, rx, ry) => { c.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; c.lineTo(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry); } c.closePath(); c.stroke(); };
      for (const x of [-0.13, 0, 0.13]) hex(x * L, 0, 0.07 * L, 0.06 * L);
      for (const k of [1, -1]) for (const x of [-0.15, 0, 0.15]) hex(x * L, k * 0.13 * L, 0.075 * L, 0.06 * L);
      c.beginPath(); c.ellipse(0, 0, 0.245 * L, 0.185 * L, 0, 0, Math.PI * 2); c.stroke();
      c.restore();
      c.strokeStyle = look.scute; c.lineWidth = Math.max(1.5, L * 0.012); c.stroke(shell);
      c.restore();
    }
  }

  // --- Corals: drawn once onto their own canvas; anemones sway live ---
  const staticCv = document.createElement('canvas'), sctx = staticCv.getContext('2d');
  let anemones = [], layout = [];
  function farFromCentre() {
    for (;;) {
      const x = rand(0.05, 0.95), y = rand(0.07, 0.93);
      if (Math.abs(x - 0.5) > 0.3 || Math.abs(y - 0.5) > 0.27) return [x, y];   // keep the middle open for swimming
    }
  }
  function brain(c, x, y, r, col, dark) {
    const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, col); g.addColorStop(1, dark);
    c.fillStyle = 'rgba(0,0,0,0.22)'; c.beginPath(); c.arc(x + r * 0.15, y + r * 0.2, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    c.strokeStyle = dark; c.lineWidth = Math.max(1, r * 0.05); c.lineCap = 'round';
    const seed = rand(0, 10);
    for (let i = 1; i < 6; i++) {
      c.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.08) {
        const rr = r * (i / 6.2) * (1 + 0.12 * Math.sin(a * (5 + i) + seed + i));
        c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      c.stroke();
    }
  }
  function branch(c, x, y, r, col, tip) {
    c.lineCap = 'round';
    const grow = (x0, y0, a, len, w, depth) => {
      const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len;
      c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
      if (depth > 0) for (const s of [-0.5, 0.45]) grow(x1, y1, a + s + rand(-0.2, 0.2), len * 0.7, w * 0.72, depth - 1);
      else { c.fillStyle = tip; c.beginPath(); c.arc(x1, y1, w * 0.7, 0, Math.PI * 2); c.fill(); }
    };
    c.fillStyle = 'rgba(0,0,0,0.2)'; c.beginPath(); c.arc(x + r * 0.15, y + r * 0.2, r * 0.8, 0, Math.PI * 2); c.fill();
    const n = 6;
    for (let i = 0; i < n; i++) grow(x, y, i / n * Math.PI * 2 + rand(-0.2, 0.2), r * 0.42, r * 0.13, 2);
  }
  function table(c, x, y, r, col, dark) {
    c.fillStyle = 'rgba(0,0,0,0.22)'; c.beginPath(); c.ellipse(x + r * 0.15, y + r * 0.2, r, r * 0.85, 0.3, 0, Math.PI * 2); c.fill();
    c.fillStyle = col; c.beginPath(); c.ellipse(x, y, r, r * 0.85, 0.3, 0, Math.PI * 2); c.fill();
    c.strokeStyle = dark; c.lineWidth = Math.max(1, r * 0.03);
    for (let i = 0; i < 28; i++) {
      const a = i / 28 * Math.PI * 2;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.82); c.stroke();
    }
    c.strokeStyle = dark; c.lineWidth = Math.max(1, r * 0.06); c.beginPath(); c.ellipse(x, y, r, r * 0.85, 0.3, 0, Math.PI * 2); c.stroke();
  }
  function starfish(c, x, y, r, col, dot) {
    const a0 = rand(0, 6), path = new Path2D();
    for (let i = 0; i < 5; i++) {
      const a = a0 + i / 5 * Math.PI * 2, b = a + Math.PI / 5;
      const [ox, oy] = [x + Math.cos(a) * r, y + Math.sin(a) * r], [ix, iy] = [x + Math.cos(b) * r * 0.38, y + Math.sin(b) * r * 0.38];
      if (i === 0) path.moveTo(ox, oy);
      path.quadraticCurveTo(x + Math.cos(a + 0.3) * r * 0.55, y + Math.sin(a + 0.3) * r * 0.55, ix, iy);
      const na = a + Math.PI * 2 / 5;
      path.quadraticCurveTo(x + Math.cos(na - 0.3) * r * 0.55, y + Math.sin(na - 0.3) * r * 0.55, x + Math.cos(na) * r, y + Math.sin(na) * r);
    }
    c.fillStyle = 'rgba(0,0,0,0.2)'; c.save(); c.translate(r * 0.1, r * 0.15); c.fill(path); c.restore();
    c.fillStyle = col; c.fill(path);
    c.fillStyle = dot;
    for (let i = 0; i < 5; i++) for (let j = 1; j < 4; j++) {
      const a = a0 + i / 5 * Math.PI * 2;
      c.beginPath(); c.arc(x + Math.cos(a) * r * j * 0.22, y + Math.sin(a) * r * j * 0.22, r * 0.05, 0, Math.PI * 2); c.fill();
    }
  }
  function rock(c, x, y, r, col) {
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath();
    const pts = Array.from({ length: 9 }, (_, i) => { const a = i / 9 * Math.PI * 2; return [Math.cos(a) * r * rand(0.75, 1.05), Math.sin(a) * r * rand(0.7, 1)]; });
    pts.forEach(([px, py], i) => i ? c.lineTo(x + px + r * 0.15, y + py + r * 0.2) : c.moveTo(x + px + r * 0.15, y + py + r * 0.2)); c.fill();
    const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, col[0]); g.addColorStop(1, col[1]);
    c.fillStyle = g; c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(x + px, y + py) : c.moveTo(x + px, y + py)); c.fill();
  }

  // Lay out the reef in normalised coordinates; render() redraws it at the current screen size
  function makeLayout() {
    const P = api.LOOK.coral;
    layout = []; anemones = [];
    const kinds = ['brain', 'branch', 'table', 'brain', 'branch', 'rock', 'star', 'rock', 'branch', 'star'];
    for (const kind of kinds) {
      const [x, y] = farFromCentre();
      layout.push({ kind, x, y, r: rand(0.045, 0.08) * (kind === 'star' ? 0.55 : kind === 'rock' ? 0.7 : 1), c: pick(P.colors), seed: Math.random() });
    }
    for (let i = 0; i < 3; i++) {
      const [x, y] = farFromCentre();
      anemones.push({ x, y, r: rand(0.05, 0.07), color: pick(P.anemone), n: 34, p: rand(0, 10), shrink: 0 });
    }
  }
  function render() {
    const { W, H, UNIT, DPR } = api, P = api.LOOK.coral;
    staticCv.width = Math.max(1, Math.round(W * DPR)); staticCv.height = Math.max(1, Math.round(H * DPR));
    sctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    for (const o of layout) {
      const x = o.x * W, y = o.y * H, r = o.r * UNIT, [col, dark] = o.c;
      if (o.kind === 'brain') brain(sctx, x, y, r, col, dark);
      else if (o.kind === 'branch') branch(sctx, x, y, r, col, P.tip);
      else if (o.kind === 'table') table(sctx, x, y, r, col, dark);
      else if (o.kind === 'star') starfish(sctx, x, y, r, P.star, P.starDot);
      else rock(sctx, x, y, r, P.rock);
    }
  }

  const FULL = [
    // clownfish
    { base: '#ff7a1a', fin: 'rgba(255,140,40,0.7)', tail: 'rgba(255,122,26,0.85)', girth: 1.3, tailLen: 0.8,
      bands: [[0.12, 0.045, '#ffffff', '#111111'], [0.47, 0.055, '#ffffff', '#111111'], [0.86, 0.03, '#ffffff', '#111111']] },
    // blue tang
    { base: '#2163ff', fin: 'rgba(40,110,255,0.6)', tail: '#ffd21f', girth: 1.35, tailLen: 0.85, spots: [['#0b1a5a', 2, 0.45]] },
    // yellow tang
    { base: '#ffd91a', fin: 'rgba(255,230,80,0.7)', tail: 'rgba(255,217,26,0.9)', girth: 1.4, tailLen: 0.8 },
    // bannerfish
    { base: '#f5f2e8', fin: 'rgba(255,240,180,0.6)', tail: '#ffd21f', girth: 1.4, tailLen: 0.8,
      bands: [[0.22, 0.08, '#151515'], [0.62, 0.07, '#151515']] },
    // queen angelfish
    { base: '#2bb3ff', fin: 'rgba(255,225,77,0.7)', tail: '#ffe14d', girth: 1.4, tailLen: 0.85, spots: [['#ffe14d', 3, 0.4]] },
    // mandarin
    { base: '#ff5a1f', fin: 'rgba(46,139,255,0.6)', tail: '#2e8bff', girth: 1.2, spots: [['#2e8bff', 5, 0.3]] },
  ];
  const TURTLE = { shell: '#5d7f34', shellLight: '#94b25a', scute: '#33461a', skin: '#a9c27a' };

  return {
    id: 'reef', order: 2, icon: '🐠', name: { en: 'Coral reef', es: 'Arrecife' },
    Critter: Fish, size: 0.12, speed: 1.1, wander: 2.6,
    waves: true, wake: 0.8, shadow: { lift: 1.8, alpha: 0.3 }, particle: 'bubble', motes: '255,255,240',

    // n fish plus a turtle or two
    spawn(n) {
      const list = [];
      for (let i = 0; i < n; i++) list.push(new Fish(pick(api.LOOK.looks)));
      for (let i = 0; i < Math.max(1, Math.round(n / 8)); i++) list.push(new Turtle(api.LOOK.turtle));
      return list;
    },

    // bg = sand, light = water tint, looks = fish, turtle, coral colours
    stages: [
      { bg: [120, 120, 124], light: [40, 40, 46],
        looks: [
          { base: '#ffffff', fin: 'rgba(255,255,255,0.7)', tail: '#ffffff', girth: 1.35, tailLen: 0.8, outline: '#000',
            bands: [[0.2, 0.06, '#000000'], [0.5, 0.06, '#000000'], [0.8, 0.05, '#000000']] },
          { base: '#111111', fin: 'rgba(255,255,255,0.5)', tail: '#ffffff', girth: 1.35, tailLen: 0.8, outline: '#fff',
            bands: [[0.15, 0.04, '#ffffff'], [0.5, 0.05, '#ffffff']] },
          { base: '#ffffff', fin: 'rgba(255,255,255,0.7)', tail: '#e01010', girth: 1.35, tailLen: 0.8, outline: '#000',
            bands: [[0.3, 0.07, '#e01010'], [0.68, 0.06, '#e01010']] },
        ],
        turtle: { shell: '#1a1a1a', shellLight: '#3a3a3a', scute: '#ffffff', skin: '#d8d8d8' },
        coral: { colors: [['#f2f2f2', '#9a9a9a'], ['#2a2a2a', '#000000'], ['#e01010', '#7a0000']], tip: '#ffffff',
          anemone: ['#ffffff', '#e01010'], star: '#e01010', starDot: '#ffffff', rock: ['#5a5a5a', '#2a2a2a'] } },
      { bg: [215, 195, 140], light: [20, 110, 200],
        looks: [FULL[0], FULL[2], { ...FULL[1], spots: [] },
          { base: '#e3200f', fin: 'rgba(255,90,70,0.6)', tail: '#ffffff', girth: 1.35, tailLen: 0.8, outline: '#000', bands: [[0.4, 0.07, '#ffffff', '#111111']] }],
        turtle: TURTLE,
        coral: { colors: [['#e3200f', '#7a1006'], ['#ffd200', '#a07800'], ['#ff7a1a', '#8a3a00']], tip: '#ffffff',
          anemone: ['#ffd200', '#e3200f'], star: '#e3200f', starDot: '#ffd200', rock: ['#8a8070', '#4a4438'] } },
      { bg: [228, 208, 162], light: [30, 170, 190], looks: FULL, turtle: TURTLE,
        coral: { colors: [['#ff7aa8', '#b8326a'], ['#ffa24a', '#b85a14'], ['#b07cff', '#6a3ab8'], ['#ffd76a', '#b8902a']], tip: '#fff3d6',
          anemone: ['#ff9ad1', '#8affd0', '#ffd27a'], star: '#ff6a3d', starDot: '#ffe0b0', rock: ['#9a9080', '#5a5244'] } },
      { bg: [236, 212, 172], light: [40, 190, 200],
        looks: [...FULL,
          { base: '#ff5fa2', fin: 'rgba(255,170,205,0.6)', tail: '#7fe0ff', girth: 1.3, bands: [[0.45, 0.06, '#ffffff']] },
          { base: '#9b4dff', fin: 'rgba(200,150,255,0.6)', tail: '#ffe14d', girth: 1.35, spots: [['#ffe14d', 3, 0.3]] },
          { base: '#26c96f', fin: 'rgba(130,240,170,0.6)', tail: '#ff7a1a', girth: 1.3, bands: [[0.3, 0.05, '#ffe14d'], [0.65, 0.05, '#ffe14d']] }],
        turtle: { ...TURTLE, shell: '#3f8f6a', shellLight: '#7fd0a0' },
        coral: { colors: [['#ff7aa8', '#b8326a'], ['#ffa24a', '#b85a14'], ['#b07cff', '#6a3ab8'], ['#5ad8ff', '#1a7ab8'], ['#7dff8a', '#2a9a3a']], tip: '#ffffff',
          anemone: ['#ff9ad1', '#8affd0', '#ffd27a', '#b48cff'], star: '#ff4fa0', starDot: '#ffe14d', rock: ['#9a9080', '#5a5244'] } },
    ],

    decor: {
      init() { makeLayout(); render(); },
      layout() { render(); },
      draw(c, t, dt, hands) {
        c.drawImage(staticCv, 0, 0, api.W, api.H);
        // anemones: tentacles sway, and pull in when a hand comes close
        const { W, H, UNIT } = api;
        for (const a of anemones) {
          const x = a.x * W, y = a.y * H, r = a.r * UNIT;
          const near = hands.some(h => Math.hypot(h.x - x, h.y - y) < r * 2.2);
          a.shrink += ((near ? 1 : 0) - a.shrink) * Math.min(1, dt * (near ? 6 : 1.5));
          c.fillStyle = 'rgba(0,0,0,0.2)'; c.beginPath(); c.arc(x + r * 0.15, y + r * 0.2, r * 0.9, 0, Math.PI * 2); c.fill();
          c.lineCap = 'round'; c.lineWidth = Math.max(2, r * 0.12);
          for (let i = 0; i < a.n; i++) {
            const ang = i / a.n * Math.PI * 2 + Math.sin(t * 1.3 + i * 0.7 + a.p) * 0.12;
            const len = r * (0.75 + 0.25 * Math.sin(i * 2.3 + a.p)) * (1 - 0.55 * a.shrink);
            const tx = x + Math.cos(ang) * len, ty = y + Math.sin(ang) * len;
            c.strokeStyle = a.color; c.globalAlpha = 0.9;
            c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(ang + 0.2) * len * 0.6, y + Math.sin(ang + 0.2) * len * 0.6, tx, ty); c.stroke();
            c.globalAlpha = 1; c.fillStyle = '#ffffff'; c.beginPath(); c.arc(tx, ty, c.lineWidth * 0.45, 0, Math.PI * 2); c.fill();
          }
          c.fillStyle = a.color; c.beginPath(); c.arc(x, y, r * 0.22, 0, Math.PI * 2); c.fill();
        }
      },
    },

    sound: {
      nibble() { bloop(1100 + Math.random() * 500, 1900, 0.06, 0.05); },
      splash() {
        bloop(600, 180, 0.3, 0.3);
        for (let i = 0; i < 6; i++) bloop(900 + Math.random() * 900, 1700 + Math.random() * 600, 0.06, 0.09, 0.06 + i * 0.05);
      },
      eat() { bloop(330, 660, 0.08, 0.18); },
    },

    // Fish flakes that drift and spin on the surface
    food: {
      max: 14, every: 3, layer: 'over',
      spawn(h) {
        return Array.from({ length: 7 }, () => {
          const a = rand(0, Math.PI * 2), d = h.r * rand(0.9, 2.2), s = api.UNIT * rand(0.02, 0.05);
          return { x: h.x + Math.cos(a) * d * 0.3, y: h.y + Math.sin(a) * d * 0.3, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
            r: api.UNIT * rand(0.008, 0.013), color: pick(['#ffb347', '#ff6f61', '#ffd166', '#9be564']), spin: rand(-2, 2), rot: rand(0, 6), life: 22,
            pts: Array.from({ length: 5 }, (_, i) => [i / 5 * Math.PI * 2, rand(0.6, 1.1)]) };
        });
      },
      update(f, dt) { f.rot += f.spin * dt; },
      draw(c, f) {
        c.globalAlpha = Math.min(1, f.age * 3, (f.life - f.age) / 2);
        c.fillStyle = f.color; c.beginPath();
        for (const [a, k] of f.pts) c.lineTo(f.x + Math.cos(a + f.rot) * f.r * k, f.y + Math.sin(a + f.rot) * f.r * k);
        c.fill(); c.globalAlpha = 1;
      },
      onEat(f) { api.wave(f.x, f.y, api.UNIT * 0.015, -0.4); },
    },

    // Bright sandy floor with ripple marks, turquoise water deepening toward the edges, sunlight caustics
    shader: {
      background: `
        bend = slope * 0.25;
        vec2 q = (vUv + bend) * vec2(uAspect, 1.0);
        float n = noise(q * 4.0);
        float marks = 0.5 + 0.5 * sin((q.x * 0.5 + q.y) * 55.0 + noise(q * 2.5) * 7.0);
        float grain = hash(floor(q * 600.0));
        vec3 sand = base * (0.86 + 0.1 * marks + 0.06 * grain + 0.1 * (n - 0.5));
        vec3 tint = light * (0.35 + 0.65 * uGlow);
        col = mix(sand, tint, clamp(0.2 + 0.6 * r, 0.0, 0.85));
        col += vec3(1.0, 1.0, 0.92) * caustic(vUv + bend * 1.5) * 0.45 * uGlow;`,
      surface: `
        col += vec3(0.9, 0.97, 1.0) * clamp(shine * 8.0, 0.0, 0.5);
        col *= 1.0 - clamp(-shine * 4.0, 0.0, 0.22);`,
    },
    draw2D(c, t) { api.gradient(c, 0.55, api.LOOK.bg, api.LOOK.light); api.caustics(c, t, 0.45, [255, 255, 235]); },
  };
}
