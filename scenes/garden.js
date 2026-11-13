// Butterfly garden: a lawn seen from above, flowers, and butterflies that flutter over to baby's hand
// and land on flowers. A hand held still makes new flowers bloom around it.
export default function garden(api) {
  const { rand, pick, sounds: { bell, PENTA } } = api;

  // --- Butterfly, seen from above: the wings fold up (look narrower) and open as it flaps ---
  class Butterfly extends api.Critter {
    constructor(look) { super(look); this.flapRate = rand(1.4, 1.9); }
    update(dt, hands, all) {
      super.update(dt, hands, all);
      if (this.perched > 0) return;
      // little sideways hops, so the flight looks fluttery rather than smooth
      const j = Math.sin(this.phase * 0.7 + this.len * 10) * this.L * 0.6 * dt * (0.3 + this.swim);
      this.x -= Math.sin(this.heading) * j; this.y += Math.cos(this.heading) * j;
    }
    prepare() {
      const L = this.L, look = this.look;
      let sp;   // how open the wings look from above, 0..1
      if (this.perched > 0) sp = 0.6 + 0.38 * Math.sin(this.phase * 0.9);          // resting: slow open and close
      else {
        const glide = Math.sin(this.phase * 0.11 + this.cruise * 7) > 0.82 && this.scared <= 0;
        sp = glide ? 0.95 : 0.12 + 0.88 * Math.abs(Math.sin(this.phase * this.flapRate));
      }
      const fore = new Path2D(), hind = new Path2D(), veins = [], dots = [];
      for (const k of [1, -1]) {
        const Y = v => v * L * k * sp;
        fore.moveTo(0.06 * L, k * 0.03 * L);
        fore.quadraticCurveTo(0.24 * L, Y(0.22), 0.13 * L, Y(0.55));      // leading edge out to the tip
        fore.quadraticCurveTo(0.03 * L, Y(0.62), -0.07 * L, Y(0.45));     // rounded tip and outer edge
        fore.quadraticCurveTo(-0.06 * L, Y(0.2), -0.02 * L, k * 0.03 * L); // inner edge back to the body
        fore.closePath();
        hind.moveTo(0, k * 0.03 * L);
        hind.quadraticCurveTo(-0.02 * L, Y(0.44), -0.15 * L, Y(0.4));
        if (look.tails) {
          hind.quadraticCurveTo(-0.24 * L, Y(0.34), -0.37 * L, Y(0.27));
          hind.quadraticCurveTo(-0.26 * L, Y(0.2), -0.22 * L, Y(0.15));
        } else hind.quadraticCurveTo(-0.28 * L, Y(0.33), -0.24 * L, Y(0.14));
        hind.quadraticCurveTo(-0.2 * L, k * 0.04 * L, -0.1 * L, k * 0.025 * L);
        hind.closePath();
        for (const [x, y] of [[0.12, 0.5], [0.04, 0.56], [-0.04, 0.48], [-0.08, 0.38], [-0.17, 0.33], [-0.21, 0.2]]) veins.push([x * L, Y(y)]);
        // pale dots just inside the dark rim
        for (let i = 0; i <= 5; i++) {
          const u = i / 5, a = 1 - u;
          const x = a * a * 0.13 + 2 * a * u * 0.03 + u * u * -0.07, y = a * a * 0.55 + 2 * a * u * 0.62 + u * u * 0.45;
          dots.push([x * L * 0.9, Y(y * 0.9)]);
        }
      }
      const all = new Path2D(); all.addPath(fore); all.addPath(hind);
      return { L, sp, fore, hind, all, veins, dots };
    }
    place(c) { c.translate(this.x, this.y); c.rotate(this.heading); }
    shadow(c, g) {
      c.save(); this.place(c); c.fill(g.all);
      c.beginPath(); c.ellipse(-0.06 * g.L, 0, 0.2 * g.L, 0.04 * g.L, 0, 0, Math.PI * 2); c.fill();
      c.restore();
    }
    draw(c, g) {
      const { L, sp, fore, hind, all, veins, dots } = g, look = this.look;
      c.save(); this.place(c);
      const grad = c.createRadialGradient(0, 0, L * 0.04, 0, 0, L * 0.6 * Math.max(sp, 0.35));
      grad.addColorStop(0, look.inner || look.wing); grad.addColorStop(1, look.wing);
      c.fillStyle = look.hindInner ? look.hindInner : grad; c.fill(hind);
      c.fillStyle = grad; c.fill(fore);
      c.save(); c.clip(all);
      c.strokeStyle = look.edge; c.globalAlpha = 0.45; c.lineWidth = Math.max(0.7, L * 0.008);
      c.beginPath(); for (const [x, y] of veins) { c.moveTo(0.02 * L, 0); c.lineTo(x, y); } c.stroke();
      c.globalAlpha = 1;
      c.lineWidth = L * 0.1; c.stroke(all);                                    // dark rim inside the wing edge
      c.fillStyle = look.spot;
      for (const [x, y] of dots) { c.beginPath(); c.arc(x, y, L * 0.014, 0, Math.PI * 2); c.fill(); }
      if (look.eye) for (const k of [1, -1]) {                                  // eye spots on the hind wings
        const x = -0.13 * L, y = k * 0.27 * L * sp, r = L * 0.05;
        c.fillStyle = look.spot; c.beginPath(); c.ellipse(x, y, r * 1.25, r * 1.25 * Math.max(sp, 0.2), 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = look.eye; c.beginPath(); c.ellipse(x, y, r, r * Math.max(sp, 0.2), 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#111'; c.beginPath(); c.ellipse(x, y, r * 0.45, r * 0.45 * Math.max(sp, 0.2), 0, 0, Math.PI * 2); c.fill();
      }
      c.restore();
      // body: striped abdomen, fuzzy thorax, head, antennae with clubs
      const body = look.body || '#1d1712';
      c.fillStyle = body;
      c.beginPath(); c.ellipse(-0.11 * L, 0, 0.16 * L, 0.03 * L, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = Math.max(0.6, L * 0.006);
      for (let i = 1; i < 6; i++) { const x = -0.03 * L - i * 0.04 * L; c.beginPath(); c.moveTo(x, -0.026 * L); c.lineTo(x, 0.026 * L); c.stroke(); }
      c.fillStyle = body; c.beginPath(); c.ellipse(0.04 * L, 0, 0.065 * L, 0.045 * L, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.ellipse(0.04 * L, 0, 0.045 * L, 0.028 * L, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = body; c.beginPath(); c.arc(0.12 * L, 0, 0.032 * L, 0, Math.PI * 2); c.fill();
      c.strokeStyle = body; c.lineWidth = Math.max(1, L * 0.01); c.lineCap = 'round';
      for (const k of [1, -1]) {
        c.beginPath(); c.moveTo(0.14 * L, k * 0.012 * L); c.quadraticCurveTo(0.24 * L, k * 0.03 * L, 0.31 * L, k * 0.09 * L); c.stroke();
        c.beginPath(); c.arc(0.31 * L, k * 0.09 * L, 0.014 * L, 0, Math.PI * 2); c.fill();
      }
      c.restore();
    }
  }

  // --- Flowers, drawn once into a small sprite each, then placed, swayed and bounced ---
  function petalPath(c, len, wid) {
    c.beginPath(); c.moveTo(0, 0);
    c.bezierCurveTo(len * 0.35, -wid, len * 0.9, -wid * 0.9, len, 0);
    c.bezierCurveTo(len * 0.9, wid * 0.9, len * 0.35, wid, 0, 0);
  }
  function leaf(c, a, len, col) {
    c.save(); c.rotate(a);
    petalPath(c, len, len * 0.3); c.fillStyle = col; c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = Math.max(1, len * 0.04);
    c.beginPath(); c.moveTo(len * 0.1, 0); c.lineTo(len * 0.9, 0); c.stroke();
    c.restore();
  }
  function makeSprite(f) {
    const R = f.r * api.UNIT, S = Math.ceil(R * 2.8), dpr = api.DPR;
    const cv = document.createElement('canvas'); cv.width = cv.height = Math.ceil(S * 2 * dpr);
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, S * dpr, S * dpr);   // origin at the centre
    const leafCol = api.stage === 0 ? '#3a3a3a' : '#3f8a2e';
    for (let i = 0; i < 3; i++) leaf(c, f.a + i * 2.1 + 0.6, R * 2.3, leafCol);
    // soft shadow of the flower head
    c.fillStyle = 'rgba(0,0,0,0.22)'; c.beginPath(); c.arc(R * 0.18, R * 0.25, R * 1.02, 0, Math.PI * 2); c.fill();
    const n = f.type === 'daisy' ? 14 : f.type === 'tulip' ? 6 : 8;
    for (let layer = 0; layer < (f.type === 'tulip' ? 2 : 1); layer++) {
      for (let i = 0; i < (f.type === 'tulip' ? 3 : n); i++) {
        const a = f.a + (i + layer * 0.5) / (f.type === 'tulip' ? 3 : n) * Math.PI * 2;
        const len = f.type === 'tulip' ? R * (1 - layer * 0.25) : R, wid = f.type === 'daisy' ? R * 0.13 : f.type === 'tulip' ? R * 0.62 : R * 0.36;
        c.save(); c.rotate(a);
        const g = c.createLinearGradient(0, 0, len, 0);
        g.addColorStop(0, f.inner); g.addColorStop(0.45, f.color); g.addColorStop(1, f.color);
        petalPath(c, len, wid); c.fillStyle = g; c.fill();
        c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 1; c.stroke();
        c.restore();
      }
    }
    // centre with little dots
    c.fillStyle = f.centre; c.beginPath(); c.arc(0, 0, R * (f.type === 'daisy' ? 0.3 : 0.22), 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.22)';
    for (let i = 0; i < 9; i++) { const a = i * 2.4, d = R * 0.15 * Math.sqrt(i / 9); c.beginPath(); c.arc(Math.cos(a) * d, Math.sin(a) * d, R * 0.03, 0, Math.PI * 2); c.fill(); }
    return { cv, S };
  }
  const INNER = { '#ffffff': '#f0f0e6', '#111111': '#333333' };
  function newFlower(x, y, ambient) {
    const colors = api.LOOK.flowers, color = pick(colors), hc = api.stage === 0;
    const f = {
      x, y, nx: x / api.W, ny: y / api.H, ambient, life: ambient ? Infinity : 30, grow: ambient ? 1 : 0, bounce: 0,
      r: rand(0.022, 0.034), a: rand(0, 6), p: rand(0, 10), type: pick(['daisy', 'cosmos', 'tulip', 'cosmos']), color,
      inner: INNER[color] || color, centre: hc ? (color === '#111111' ? '#ffffff' : '#111111') : /^#ffd2/.test(color) ? '#e8661a' : '#ffd23f',
    };
    if (f.type === 'daisy' && !hc) f.inner = '#ffffff';
    f.sprite = makeSprite(f);
    return f;
  }

  // 2D lawn for when the GPU effects are off
  const grassCv = document.createElement('canvas');
  function renderGrass() {
    const { W, H } = api, [r, g, b] = api.LOOK.bg;
    grassCv.width = Math.max(1, Math.round(W / 2)); grassCv.height = Math.max(1, Math.round(H / 2));
    const c = grassCv.getContext('2d');
    c.fillStyle = `rgb(${r * 0.8},${g * 0.8},${b * 0.8})`; c.fillRect(0, 0, grassCv.width, grassCv.height);
    c.lineCap = 'round';
    for (let i = 0; i < grassCv.width * grassCv.height / 25; i++) {
      const x = Math.random() * grassCv.width, y = Math.random() * grassCv.height, a = -1.2 + Math.random() * 0.8, l = 3 + Math.random() * 6, k = 0.6 + Math.random() * 0.8;
      c.strokeStyle = `rgb(${r * k | 0},${g * k | 0},${b * k | 0})`; c.lineWidth = 1;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
    }
  }

  const FULL = [
    { wing: '#f7931e', inner: '#d9600b', edge: '#1a1209', spot: '#fff8e8' },                         // monarch
    { wing: '#46a8ff', inner: '#0f4fd6', edge: '#0a1630', spot: '#cfe8ff' },                         // morpho
    { wing: '#f9e65c', inner: '#e8c21f', edge: '#a07800', spot: '#ffffff' },                         // brimstone
    { wing: '#f7f4ea', inner: '#ddd8c6', edge: '#4a473f', spot: '#ffffff' },                         // cabbage white
    { wing: '#f8dd6a', inner: '#eac44a', edge: '#151515', spot: '#fff5c0', eye: '#e8432a', tails: true }, // swallowtail
    { wing: '#d23a2a', inner: '#8e1f16', edge: '#2a1410', spot: '#f4e3c1', eye: '#2b6fd6' },        // peacock
  ];

  return {
    id: 'garden', order: 3, icon: '🦋', name: { en: 'Butterflies', es: 'Mariposas' },
    Critter: Butterfly, size: 0.16, speed: 1.1, wander: 3,
    waves: false, shadow: { lift: 3, alpha: 0.22 }, particle: 'petal', motes: '255,240,170',
    particleColors: () => api.LOOK.flowers,

    // bg = grass colour, light = sunlight colour, flowers = flower colours, looks = butterflies
    stages: [
      { bg: [92, 96, 92], light: [240, 240, 240], flowers: ['#ffffff', '#111111', '#e01010'], looks: [
        { wing: '#ffffff', inner: '#e6e6e6', edge: '#000000', spot: '#ffffff', body: '#000' },
        { wing: '#111111', inner: '#000000', edge: '#ffffff', spot: '#111111', body: '#000' },
        { wing: '#ffffff', inner: '#e6e6e6', edge: '#000000', spot: '#ffffff', eye: '#e01010', body: '#000' },
      ] },
      { bg: [60, 130, 55], light: [255, 250, 210], flowers: ['#e3200f', '#ffd200', '#ffffff'], looks: [
        { wing: '#e3200f', inner: '#b8150a', edge: '#111111', spot: '#ffffff' },
        { wing: '#ffd200', inner: '#e0a800', edge: '#111111', spot: '#ffffff' },
        { wing: '#ffffff', inner: '#eeeeee', edge: '#e3200f', spot: '#ffffff', eye: '#111111' },
        { wing: '#111111', inner: '#000000', edge: '#ffd200', spot: '#111111' },
      ] },
      { bg: [86, 150, 64], light: [255, 240, 190], flowers: ['#ff6f91', '#ffd23f', '#ffffff', '#b06cff', '#ff9a3c'], looks: FULL },
      { bg: [92, 165, 72], light: [255, 236, 200], flowers: ['#ff6f91', '#ffd23f', '#ffffff', '#b06cff', '#5ac8ff', '#ff9a3c', '#7dff8a'], looks: [...FULL,
        { wing: '#ff6fb0', inner: '#7fe0ff', edge: '#5a1a6a', spot: '#ffffff' },
        { wing: '#b07cff', inner: '#6a3ab8', edge: '#2a0f5a', spot: '#ffe14d', eye: '#ffe14d' },
        { wing: '#3fd17a', inner: '#1f9a50', edge: '#0f4a2a', spot: '#ffffff' },
        { wing: '#ff8a3d', inner: '#ffd23f', edge: '#7a1d00', spot: '#ffffff', tails: true },
      ] },
    ],

    decor: {
      // flowers already in the lawn: butterflies sometimes rest on them
      init() {
        for (let i = 0; i < 14; i++) {
          let x, y;
          do { x = rand(0.05, 0.95); y = rand(0.06, 0.94); } while (Math.abs(x - 0.5) < 0.18 && Math.abs(y - 0.5) < 0.18);
          api.foods.push(newFlower(x * api.W, y * api.H, true));
        }
        renderGrass();
      },
      layout() {
        for (const f of api.foods) { f.x = f.nx * api.W; f.y = f.ny * api.H; f.sprite = makeSprite(f); }
        renderGrass();
      },
    },
    onSplash(x, y, radius) {
      for (const f of api.foods) if (Math.hypot(f.x - x, f.y - y) < radius) f.bounce = 1;
    },

    sound: {
      nibble() { bell(pick(PENTA.slice(0, 6)), 0.9, 0.06); },
      splash() { const s = Math.floor(rand(0, 3)); for (let i = 0; i < 5; i++) bell(PENTA[s + i], 1.2, 0.12, i * 0.07); },
      perch() { bell(pick(PENTA.slice(5)), 1.4, 0.04); },
    },

    // Keep a hand still for a moment and flowers bloom around it; butterflies come to rest on them
    food: {
      max: 8, every: 4, layer: 'under', perch: [3, 6],
      spawn(h) {
        return Array.from({ length: 3 }, (_, i) => {
          const a = rand(0, Math.PI * 2), d = h.r * rand(1.3, 2.4);
          const f = newFlower(h.x + Math.cos(a) * d, h.y + Math.sin(a) * d, false);
          f.delay = i * 0.25; return f;
        });
      },
      update(f, dt) {
        if (f.ambient || f.age < f.delay) return;
        if (!f.chimed) { f.chimed = true; bell(pick(PENTA), 0.8, 0.05); }
        const left = f.life - f.age;
        f.grow = left < 1.5 ? Math.max(0, left / 1.5) : Math.min(1, f.grow + dt * 1.8);
      },
      ready: f => f.grow > 0.8,
      draw(c, f, t, dt) {
        if (f.grow <= 0) return;
        f.bounce = Math.max(0, f.bounce - dt * 1.5);
        const { cv, S } = f.sprite;
        const ease = 1 - Math.pow(1 - f.grow, 3);
        const s = ease * (1 + 0.3 * Math.sin(f.bounce * 12) * f.bounce);
        c.save(); c.translate(f.x, f.y); c.rotate(Math.sin(t * 0.8 + f.p) * 0.06 + f.bounce * 1.5); c.scale(s, s);
        c.drawImage(cv, -S, -S, S * 2, S * 2);
        c.restore();
      },
    },

    // Lawn seen from above: clumps of blades leaning different ways, swaying, soft shade drifting from a tree
    shader: {
      background: `
        float sway = sin(uT * 0.9 + p.x * 2.0 + p.y * 1.3) * 0.5 + 0.5;
        // three families of short blades pointing different ways, picked by a patchy mask
        vec2 a1 = mat2(0.97, 0.26, -0.26, 0.97) * p, a2 = mat2(0.71, -0.71, 0.71, 0.71) * p, a3 = mat2(0.26, 0.97, -0.97, 0.26) * p;
        float b1 = noise(vec2(a1.x * 260.0, a1.y * 55.0 + sway * 0.5));
        float b2 = noise(vec2(a2.x * 260.0, a2.y * 55.0 - sway * 0.5));
        float b3 = noise(vec2(a3.x * 260.0, a3.y * 55.0 + sway * 0.3));
        float m1 = noise(p * 11.0), m2 = noise(p * 11.0 + 17.0);
        float blades = mix(mix(b1, b2, smoothstep(0.35, 0.65, m1)), b3, smoothstep(0.45, 0.75, m2));
        blades = blades * 0.75 + noise(p * 520.0) * 0.25;
        float patches = noise(p * 3.0);
        vec3 dark = base * vec3(0.7, 0.85, 0.6), warm = base * vec3(1.25, 1.18, 0.85);
        col = mix(dark, warm, patches) * (0.55 + 0.7 * blades) * (0.92 + 0.16 * noise(p * 900.0));
        float shade = smoothstep(0.42, 0.68, noise(p * 1.4 + vec2(uT * 0.015, uT * 0.01)) * 0.75 + noise(p * 4.0 + uT * 0.03) * 0.25);
        col *= 1.0 - 0.35 * shade;
        col += light * (1.0 - shade) * 0.07 * uGlow;
        col *= mix(1.0, 0.72, clamp(r, 0.0, 1.0));`,
    },
    draw2D(c) { c.drawImage(grassCv, 0, 0, api.W, api.H); },
  };
}
