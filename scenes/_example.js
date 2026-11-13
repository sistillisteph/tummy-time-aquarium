// Example scene: ladybugs on a picnic blanket.
// Files whose name starts with "_" are skipped. Copy this file to a new name (for example ladybugs.js)
// and it shows up in the panel the next time the page loads.
export default function ladybugs(api) {
  const { rand, pick, sounds: { bell, PENTA } } = api;

  // The animal. api.Critter already does the moving: wandering, coming to hands, eating, running from slaps.
  // You only say how it looks. `this.L` is its size in pixels; `this.heading` is the way it faces.
  class Ladybug extends api.Critter {
    shadow(c) {
      c.beginPath(); c.ellipse(this.x, this.y, this.L * 0.3, this.L * 0.25, this.heading, 0, Math.PI * 2); c.fill();
    }
    draw(c) {
      const L = this.L, look = this.look;
      c.save(); c.translate(this.x, this.y); c.rotate(this.heading);
      c.fillStyle = '#111'; c.beginPath(); c.arc(L * 0.27, 0, L * 0.12, 0, Math.PI * 2); c.fill();          // head
      c.fillStyle = look.shell; c.beginPath(); c.ellipse(0, 0, L * 0.3, L * 0.25, 0, 0, Math.PI * 2); c.fill(); // shell
      c.strokeStyle = '#111'; c.lineWidth = L * 0.02; c.beginPath(); c.moveTo(L * 0.3, 0); c.lineTo(-L * 0.3, 0); c.stroke();
      c.fillStyle = look.dots;
      for (const [x, y] of [[0.1, 0.12], [-0.12, 0.1], [0.1, -0.12], [-0.12, -0.1]]) { c.beginPath(); c.arc(x * L, y * L, L * 0.05, 0, Math.PI * 2); c.fill(); }
      c.restore();
    }
  }

  return {
    id: 'ladybugs',          // unique name
    order: 10,               // position in the panel (smaller = first)
    icon: '🐞',
    name: { en: 'Ladybugs', es: 'Catarinas' },
    Critter: Ladybug,
    size: 0.12,              // animal size, as a fraction of the screen
    speed: 0.8,              // swimming / walking speed
    wander: 2,               // how much they meander
    waves: false,            // true = hands and slaps make waves (for water scenes)
    shadow: { lift: 0.4, alpha: 0.3 },
    particle: 'petal',       // what bursts out on a slap: 'bubble', 'petal' or 'spark'
    particleColors: () => ['#e3200f', '#111111', '#ffffff'],

    // One entry per age: 0–3 months, 3–6, 6–12, 12+. bg = background colour; looks = animal colours.
    stages: [
      { bg: [90, 90, 90], looks: [{ shell: '#ffffff', dots: '#000' }, { shell: '#e01010', dots: '#000' }] },
      { bg: [60, 110, 180], looks: [{ shell: '#e3200f', dots: '#111' }, { shell: '#ffd200', dots: '#111' }] },
      { bg: [214, 200, 170], looks: [{ shell: '#e3200f', dots: '#111' }, { shell: '#ff8a1a', dots: '#111' }] },
      { bg: [214, 200, 170], looks: [{ shell: '#e3200f', dots: '#111' }, { shell: '#4fa8ff', dots: '#fff' }, { shell: '#9be564', dots: '#111' }] },
    ],

    sound: {
      nibble() { bell(pick(PENTA), 0.6, 0.05); },
      splash() { for (let i = 0; i < 4; i++) bell(PENTA[i * 2], 0.8, 0.1, i * 0.06); },
      eat() { bell(PENTA[7], 0.5, 0.08); },
    },

    // Optional: food that appears around a hand held still. Remove this block for no food.
    food: {
      max: 10, every: 3, layer: 'under',
      spawn(h) {
        return Array.from({ length: 4 }, () => {
          const a = rand(0, Math.PI * 2), d = h.r * rand(1.2, 2.2);
          return { x: h.x + Math.cos(a) * d, y: h.y + Math.sin(a) * d, life: 20 };
        });
      },
      draw(c, f) {   // a little green leaf
        c.fillStyle = '#5fbf3a'; c.beginPath(); c.ellipse(f.x, f.y, api.UNIT * 0.018, api.UNIT * 0.01, 0.6, 0, Math.PI * 2); c.fill();
      },
    },

    // Background when the GPU effects are off (or always, if you don't write a shader)
    draw2D(c) { api.gradient(c, 0.7); },
    // Optional GPU background in GLSL. Set `col` (colour). Available: p (position), r (distance from centre),
    // base (bg colour), light, uT (seconds), uGlow, noise(), hash(), caustic(). See pond.js / garden.js.
    shader: {
      background: `
        vec2 g = floor(p * 12.0);
        col = base * (mod(g.x + g.y, 2.0) < 1.0 ? 1.0 : 0.85);   // checked picnic blanket
        col *= mix(1.0, 0.75, clamp(r, 0.0, 1.0));`,
    },
  };
}
