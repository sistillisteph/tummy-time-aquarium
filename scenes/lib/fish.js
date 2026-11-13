// Shared fish drawing, used by the pond (koi) and the reef (tropical fish).
// A fish is seen from above: a body built around a wiggling spine, a two-lobed tail, see-through fins,
// coloured patches and bands, fine scales and soft shading.
//
// Look options (all optional except base):
//   base     body colour
//   fin      fin colour (use some transparency)
//   tail     tail colour (defaults to fin)
//   spots    [[colour, how many patches, patch size], ...]   random blotches (koi style)
//   bands    [[t, half width, colour, edge colour?], ...]     stripes across the body; t = 0 nose ... 1 tail
//   tancho   true: one red spot on the head
//   metal    true: shimmering back
//   outline  colour of a contour line (for high contrast looks)
//   girth    body width multiplier (default 1)
//   tailLen  tail length multiplier (default 1)

const PROFILE = [[0, 0.5], [0.04, 0.74], [0.1, 0.9], [0.22, 1], [0.38, 0.95], [0.55, 0.76], [0.72, 0.5], [0.88, 0.3], [1, 0.2]];
function widthAt(t) {
  for (let i = 1; i < PROFILE.length; i++) if (t <= PROFILE[i][0]) {
    const [s0, w0] = PROFILE[i - 1], [s1, w1] = PROFILE[i], k = (t - s0) / (s1 - s0);
    return w0 + (w1 - w0) * k * k * (3 - 2 * k);
  }
  return 0.2;
}
const SPINE_N = 18;
const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];

export default function makeFish(api) {
  const { rand } = api;
  // Fine scale texture, filled over each body
  const scaleTile = document.createElement('canvas'); scaleTile.width = 14; scaleTile.height = 12;
  {
    const g = scaleTile.getContext('2d');
    g.strokeStyle = 'rgba(0,0,0,0.16)'; g.lineWidth = 1;
    for (const [x, y] of [[0, 0], [14, 0], [7, 6], [0, 12], [14, 12]]) { g.beginPath(); g.arc(x, y, 7, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,0.13)';
    for (const [x, y] of [[0, 1], [14, 1], [7, 7], [0, 13], [14, 13]]) { g.beginPath(); g.arc(x, y, 5, 0.3 * Math.PI, 0.7 * Math.PI); g.stroke(); }
  }
  const scalePattern = api.ctx.createPattern(scaleTile, 'repeat');

  return class Fish extends api.Critter {
    constructor(look) {
      super(look);
      this.girth = rand(0.9, 1.12) * (look.girth || 1); this.tailLen = rand(0.9, 1.25) * (look.tailLen || 1);
      this.patches = [];
      for (const [color, n, size] of look.spots || []) for (let i = 0; i < n; i++) {
        const cs = rand(0.12, 0.85), ct = rand(-0.7, 0.7), blobs = [];
        for (let b = 0; b < 3; b++) blobs.push({ s: cs + rand(-0.07, 0.07), t: ct + rand(-0.45, 0.45), r: size * rand(0.09, 0.15) });
        this.patches.push({ color, blobs });
      }
      if (look.tancho) this.patches.push({ color: '#d9361a', blobs: [{ s: 0.1, t: 0, r: 0.075 }] });
    }
    // fish eat with the mouth, at the front of the head
    mouth() { const d = this.L * 0.38; return [this.x + Math.cos(this.heading) * d, this.y + Math.sin(this.heading) * d]; }
    // Build the body outline from a wiggling spine
    prepare() {
      const L = this.L, N = SPINE_N, bodyLen = 0.74 * L, maxW = 0.1 * L * this.girth;
      const c = Math.cos(this.heading), sn = Math.sin(this.heading);
      const amp = 0.035 + 0.05 * this.swim;
      const P = [];
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        P.push({ t, lx: 0.4 * L - t * bodyLen, ly: L * (amp * (0.12 + t * t) * Math.sin(this.phase - 3.6 * t) + this.curv * t * t) });
      }
      for (let i = 0; i < N; i++) {
        const a = P[Math.max(0, i - 1)], b = P[Math.min(N - 1, i + 1)], p = P[i];
        let tx = b.lx - a.lx, ty = b.ly - a.ly; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
        p.x = this.x + p.lx * c - p.ly * sn; p.y = this.y + p.lx * sn + p.ly * c;
        p.tx = tx * c - ty * sn; p.ty = tx * sn + ty * c;          // points toward the tail
        p.nx = -p.ty; p.ny = p.tx;                                   // sideways
        p.w = widthAt(p.t) * maxW;
      }
      const side = (p, k) => [p.x + p.nx * p.w * k, p.y + p.ny * p.w * k];
      const body = new Path2D();
      const smoothSide = (k, from, to, step) => {
        for (let i = from; i !== to; i += step) {
          const [x1, y1] = side(P[i], k), [x2, y2] = side(P[i + step], k);
          body.quadraticCurveTo(x1, y1, (x1 + x2) / 2, (y1 + y2) / 2);
        }
      };
      const h0 = P[0], fx = -h0.tx, fy = -h0.ty;
      const [lx0, ly0] = side(h0, 1), [rx0, ry0] = side(h0, -1);
      body.moveTo(lx0, ly0);
      smoothSide(1, 0, N - 1, 1);
      body.lineTo(...side(P[N - 1], 1)); body.lineTo(...side(P[N - 1], -1));
      smoothSide(-1, N - 1, 0, -1);
      body.lineTo(rx0, ry0);
      body.bezierCurveTo(rx0 + fx * h0.w * 1.05, ry0 + fy * h0.w * 1.05, lx0 + fx * h0.w * 1.05, ly0 + fy * h0.w * 1.05, lx0, ly0);
      body.closePath();
      // Tail: two flowing lobes that lag behind the body wave
      const T = P[N - 1], tl = 0.32 * L * this.tailLen;
      const wag = Math.sin(this.phase - 3.6 * 1.3) * (0.3 + 0.25 * this.swim) + this.curv * 1.5;
      const dir = a => rot(T.tx, T.ty, wag + a);
      const at = (a, d) => { const [x, y] = dir(a); return [T.x + x * d, T.y + y * d]; };
      const tail = new Path2D();
      tail.moveTo(...side(T, 1));
      tail.quadraticCurveTo(...at(0.3, tl * 0.5), ...at(0.55, tl));
      tail.quadraticCurveTo(...at(0.12, tl * 0.75), ...at(0, tl * 0.6));
      tail.quadraticCurveTo(...at(-0.12, tl * 0.75), ...at(-0.55, tl));
      tail.quadraticCurveTo(...at(-0.3, tl * 0.5), ...side(T, -1));
      tail.closePath();
      const rays = [];
      for (let k = -4; k <= 4; k++) rays.push([T.x, T.y, ...at(k * 0.12, tl * (0.95 - Math.abs(k) * 0.05))]);
      // Fins: pectoral (big, near head) and pelvic (small, mid-body)
      const fins = new Path2D();
      const flap = Math.sin(this.phase * 0.8) * 0.25 * (1 - this.swim * 0.6);
      const addFin = (idx, len, wid, spread) => {
        const p = P[idx];
        for (const k of [1, -1]) {
          const [dx, dy] = rot(p.tx, p.ty, k * (spread + flap));
          const bx = p.x + p.nx * p.w * k * 0.8, by = p.y + p.ny * p.w * k * 0.8;
          fins.ellipse(bx + dx * len * 0.85, by + dy * len * 0.85, len, wid, Math.atan2(dy, dx), 0, Math.PI * 2);
          fins.closePath();
        }
      };
      addFin(Math.round(0.2 * (N - 1)), 0.085 * L, 0.04 * L, 1.0);
      addFin(Math.round(0.55 * (N - 1)), 0.045 * L, 0.022 * L, 0.8);
      return { P, body, tail, fins, rays, maxW };
    }
    spinePoint(P, t, k) {
      const f = Math.max(0, Math.min(1, t)) * (SPINE_N - 1), i = Math.min(SPINE_N - 2, Math.floor(f)), u = f - i;
      const a = P[i], b = P[i + 1];
      const w = a.w + (b.w - a.w) * u;
      return [a.x + (b.x - a.x) * u + (a.nx + (b.nx - a.nx) * u) * w * k, a.y + (b.y - a.y) * u + (a.ny + (b.ny - a.ny) * u) * w * k];
    }
    band(c, P, t0, t1) {
      c.beginPath();
      c.moveTo(...this.spinePoint(P, t0, -1.4)); c.lineTo(...this.spinePoint(P, t0, 1.4));
      c.lineTo(...this.spinePoint(P, t1, 1.4)); c.lineTo(...this.spinePoint(P, t1, -1.4));
      c.closePath(); c.fill();
    }
    shadow(c, g) { c.fill(g.body); c.fill(g.tail); c.fill(g.fins); }
    draw(c, g) {
      const L = this.L, { P, body, tail, fins, rays, maxW } = g, look = this.look;
      // fins and tail are see-through
      c.fillStyle = look.fin; c.fill(fins);
      c.fillStyle = look.tail || look.fin; c.fill(tail);
      c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = Math.max(0.6, L * 0.004);
      c.beginPath(); for (const [x1, y1, x2, y2] of rays) { c.moveTo(x1, y1); c.lineTo(x2, y2); } c.stroke();
      c.save();
      c.fillStyle = look.base; c.fill(body);
      c.clip(body);
      for (const patch of this.patches) {
        c.fillStyle = patch.color; c.beginPath();
        for (const b of patch.blobs) { const [x, y] = this.spinePoint(P, b.s, b.t); c.moveTo(x + b.r * L, y); c.arc(x, y, b.r * L, 0, Math.PI * 2); }
        c.fill();
      }
      for (const [t, w, color, edge] of look.bands || []) {
        if (edge) { c.fillStyle = edge; this.band(c, P, t - w - 0.018, t + w + 0.018); }
        c.fillStyle = color; this.band(c, P, t - w, t + w);
      }
      // scales
      scalePattern.setTransform(new DOMMatrix().translate(this.x, this.y).rotate(this.heading * 180 / Math.PI).scale(L / 260));
      c.fillStyle = scalePattern; c.fill(body);
      // rounded shading: darker edges, light along the back
      c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = maxW * 0.9; c.stroke(body);
      c.lineCap = 'round'; c.lineJoin = 'round';
      const backLine = (w, a) => {
        c.strokeStyle = `rgba(255,255,255,${a})`; c.lineWidth = w; c.beginPath();
        for (let i = 1; i < SPINE_N * 0.8; i++) i === 1 ? c.moveTo(P[i].x, P[i].y) : c.lineTo(P[i].x, P[i].y);
        c.stroke();
      };
      const shimmer = look.metal ? 0.12 + 0.08 * Math.sin(this.phase * 0.3 + this.x * 0.01) : 0;
      backLine(maxW * 0.9, 0.08 + shimmer * 0.5); backLine(maxW * 0.35, 0.14 + shimmer);
      // dorsal fin seen edge-on along the back
      c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = Math.max(1, L * 0.012); c.beginPath();
      for (let i = Math.round(SPINE_N * 0.3); i < SPINE_N * 0.68; i++) c.lineTo(P[i].x, P[i].y);
      c.stroke();
      c.restore();
      if (look.outline) { c.strokeStyle = look.outline; c.lineWidth = Math.max(1.5, L * 0.012); c.stroke(body); c.stroke(tail); }
      // eyes on the sides of the head
      for (const k of [1, -1]) {
        const [x, y] = this.spinePoint(P, 0.06, k * 0.78);
        c.fillStyle = '#0d0d0d'; c.beginPath(); c.arc(x, y, L * 0.017, 0, Math.PI * 2); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.arc(x - L * 0.005, y - L * 0.005, L * 0.006, 0, Math.PI * 2); c.fill();
      }
    }
  };
}
