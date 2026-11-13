// Koi pond: koi seen from above, water that bends the light, food pellets that float on the surface.
import makeFish from './lib/fish.js';

export default function pond(api) {
  const { rand, pick, sounds: { bloop } } = api;
  const Fish = makeFish(api);

  const KOI_FULL = [
    { base: '#f4efe4', fin: 'rgba(255,250,242,0.42)', spots: [['#d9361a', 4, 0.55]] },                                  // kohaku
    { base: '#f4efe4', fin: 'rgba(255,250,242,0.42)', spots: [['#d63a1c', 3, 0.5], ['#141414', 4, 0.22]] },             // sanke
    { base: '#19191b', fin: 'rgba(30,30,34,0.5)', spots: [['#d4401e', 3, 0.55], ['#f1ece2', 2, 0.4]] },                 // showa
    { base: '#f2b42a', fin: 'rgba(255,214,120,0.45)', metal: true },                                                      // ogon
    { base: '#e6e4da', fin: 'rgba(250,250,245,0.42)', metal: true },                                                      // platinum
    { base: '#f4efe4', fin: 'rgba(255,250,242,0.42)', tancho: true },                                                     // tancho
    { base: '#e8691a', fin: 'rgba(255,165,95,0.45)', spots: [['#f6e7d2', 2, 0.4]] },                                      // orange
    { base: '#f5c42a', fin: 'rgba(255,224,130,0.45)', metal: true },                                                      // yamabuki
  ];

  return {
    id: 'pond', order: 1, icon: '🐟', name: { en: 'Koi pond', es: 'Estanque koi' },
    Critter: Fish, size: 0.17, speed: 1, wander: 2.2,
    waves: true, wake: 1, shadow: { lift: 1, alpha: 0.38 }, particle: 'bubble', motes: '220,240,230',

    // bg = water colour, light = caustic colour, looks = koi
    stages: [
      { bg: [52, 56, 64], light: [235, 235, 235], looks: [
        { base: '#ffffff', fin: 'rgba(255,255,255,0.7)', spots: [['#000000', 4, 0.6]], outline: '#000' },
        { base: '#0a0a0a', fin: 'rgba(255,255,255,0.55)', spots: [['#ffffff', 3, 0.55]], outline: '#fff' },
        { base: '#ffffff', fin: 'rgba(255,255,255,0.7)', spots: [['#e01010', 3, 0.6]], outline: '#000' },
        { base: '#ffffff', fin: 'rgba(255,255,255,0.7)', tancho: true, outline: '#000' },
      ] },
      { bg: [20, 60, 120], light: [190, 225, 255], looks: [
        { base: '#ffffff', fin: 'rgba(255,255,255,0.6)', spots: [['#e3200f', 4, 0.6]], outline: '#000' },
        { base: '#ffd200', fin: 'rgba(255,225,80,0.6)', spots: [['#111111', 3, 0.35]], outline: '#000' },
        { base: '#e3200f', fin: 'rgba(255,90,70,0.55)', spots: [['#ffffff', 2, 0.45]], outline: '#000' },
        { base: '#111111', fin: 'rgba(255,255,255,0.45)', spots: [['#ffd200', 3, 0.5]], outline: '#fff' },
      ] },
      { bg: [30, 100, 122], light: [175, 240, 255], looks: KOI_FULL },
      { bg: [24, 128, 140], light: [190, 255, 235], looks: [...KOI_FULL,
        { base: '#2f7bff', fin: 'rgba(120,180,255,0.5)', spots: [['#ffe14d', 3, 0.4]] },
        { base: '#9b4dff', fin: 'rgba(200,150,255,0.5)', spots: [['#ffffff', 3, 0.35]] },
        { base: '#26c96f', fin: 'rgba(130,240,170,0.5)', spots: [['#ff7a1a', 2, 0.45]] },
        { base: '#ff5fa2', fin: 'rgba(255,170,205,0.5)', metal: true },
      ] },
    ],

    sound: {
      nibble() { bloop(900 + Math.random() * 400, 1600, 0.07, 0.06); },
      splash() {
        bloop(520, 150, 0.35, 0.35);
        for (let i = 0; i < 4; i++) bloop(700 + Math.random() * 700, 1400 + Math.random() * 600, 0.08, 0.12, 0.08 + i * 0.06 + Math.random() * 0.04);
      },
      eat() { bloop(240, 520, 0.09, 0.22); bloop(800, 1200, 0.05, 0.06, 0.06); },
    },

    // Keep a hand still for a moment and pellets land on the water around it
    food: {
      max: 12, every: 3, layer: 'over',
      spawn(h) {
        const items = [];
        for (let i = 0; i < 5; i++) {
          const a = rand(0, Math.PI * 2), d = h.r * rand(1.1, 2.4);
          items.push({ x: h.x + Math.cos(a) * d, y: h.y + Math.sin(a) * d, r: api.UNIT * rand(0.008, 0.012),
            color: pick(['#c8782e', '#d98b3a', '#b5652a']), life: 25, delay: i * 0.12, landed: false });
        }
        return items;
      },
      update(f, dt) {
        // each pellet "plips" onto the water a moment after the last
        if (!f.landed && f.age >= f.delay) {
          f.landed = true; api.wave(f.x, f.y, api.UNIT * 0.012, -0.35);
          bloop(1500 + Math.random() * 300, 900, 0.05, 0.05);
        }
        f.x += Math.sin(f.age * 0.7 + f.r) * api.UNIT * 0.004 * dt;   // drift a little on the surface
      },
      ready: f => f.landed,
      draw(c, f) {
        if (!f.landed) return;
        const a = Math.min(1, (f.age - f.delay) * 4, (f.life - f.age) / 2), r = f.r;
        c.globalAlpha = a;
        c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.arc(f.x + r * 0.6, f.y + r * 0.9, r, 0, Math.PI * 2); c.fill();
        const g = c.createRadialGradient(f.x - r * 0.35, f.y - r * 0.35, r * 0.1, f.x, f.y, r);
        g.addColorStop(0, '#f7c08a'); g.addColorStop(1, f.color);
        c.fillStyle = g; c.beginPath(); c.arc(f.x, f.y, r, 0, Math.PI * 2); c.fill();
        c.globalAlpha = 1;
      },
      onEat(f) { api.wave(f.x, f.y, api.UNIT * 0.02, -0.6); },
    },

    // GPU water. Available: col, bend, slope, shine, p, r, base, light, uGlow, caustic(), noise(), hash()
    shader: {
      background: `
        bend = slope * 0.25;
        col = mix(base, base * 0.3, clamp(r, 0.0, 1.0));
        col += light * caustic(vUv + bend * 1.5) * 0.55 * uGlow;`,
      surface: `
        col += vec3(0.85, 0.95, 1.0) * clamp(shine * 9.0, 0.0, 0.55);
        col *= 1.0 - clamp(-shine * 4.0, 0.0, 0.25);`,
    },
    // Simple water when the GPU effects are off
    draw2D(c, t) { api.gradient(c, 0.3); api.caustics(c, t, 0.55); },
  };
}
