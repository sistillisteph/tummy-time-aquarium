# Scenes

Every `.js` file in this folder is a scene and shows up as a button in the panel. Files starting with `_` are skipped.

| File | Scene |
|---|---|
| `pond.js` | Koi pond: water that bends the light, food pellets |
| `reef.js` | Coral reef: sand, corals, anemones, tropical fish and sea turtles, fish flakes |
| `garden.js` | Butterflies on a lawn: flowers bloom around a resting hand and butterflies land on them |
| `lib/fish.js` | Fish drawing shared by the pond and the reef |
| `_example.js` | Template: ladybugs on a picnic blanket |

## Add a scene

1. Copy `_example.js` to a new name, for example `ladybugs.js`.
2. Change the `id`, `name`, `icon`, the animal drawing and the colours.
3. Reload the page. The new button appears.
4. Add the file name to `index.json` too. The local server (`python3 -m http.server`) lists the folder by itself, but hosts that don't list folders (GitHub Pages, for example) read the file names from `index.json`.

If a scene has an error, it is skipped and the error is shown in the browser console (F12); the other scenes still load.

## What a scene file contains

A scene file exports a function that receives `api` and returns the scene:

- **`Critter`**: the animal class. Extend `api.Critter`, which already does the behaviour (wander, come to hands, circle and nibble, eat food, run from slaps). Write `draw(c, g)`, and optionally `shadow(c, g)` and `prepare()`. Whatever `prepare()` returns is passed to `shadow` and `draw` as `g`. Useful fields: `x`, `y`, `heading`, `L` (size in px), `phase` (animation clock), `swim` (0–1 speed), `scared`, `excite`, `perched`, `look` (its colours). Override `mouth()` if it eats from somewhere other than its centre. Set `sizeMul` / `speedMul` in the constructor for a bigger or slower animal.
- **`spawn(n)`** (optional): make the animals yourself, for example `n` fish plus a turtle.
- **`stages`**: four looks, one per age (0–3 months, 3–6, 6–12, 12+). Each has `bg` and `light` colours (`[r, g, b]`), `looks` (one is picked per animal), and anything else the scene wants. The current one is `api.LOOK`.
- **`size`, `speed`, `wander`**: animal size (fraction of the screen), speed and how much it meanders.
- **`waves`**: `true` for water. Hands and slaps then make waves, and `api.wave(x, y, radius, strength)` works. **`wake`**: how much the animals ripple the water.
- **`shadow`**: `{ lift, alpha }`: how far below the animal the shadow falls, and how dark it is.
- **`particle`**: what bursts out on a slap: `'bubble'`, `'petal'` or `'spark'`. **`particleColors()`** gives their colours.
- **`motes`**: colour of floating specks, as `'r,g,b'`, or leave it out for none.
- **`sound`**: `nibble()`, `splash()`, `eat()`, `perch()`. Use `api.sounds.bloop` (water) or `api.sounds.bell` (chimes) with `api.sounds.PENTA` notes.
- **`food`** (optional): what appears around a hand held still for a moment.
  - `spawn(hand)` returns new items `{ x, y, life, ... }`.
  - `draw(c, item, t, dt)` draws one item. `layer: 'under'` draws it below the animals, `'over'` above.
  - `update(item, dt)`, `ready(item)` (can it be eaten yet?) and `onEat(item)` are optional.
  - `perch: [min, max]` makes the animals rest on the item for that many seconds instead of eating it.
  - Items with `ambient: true` (pushed into `api.foods` from `decor.init`) are resting spots that are always there.
- **`decor`** (optional): things that are not animals. `init()` runs when the scene starts, `layout()` after the window changes size, and `draw(c, t, dt, hands)` every frame below the animals. **`onSplash(x, y, radius)`** reacts to slaps.
- **`draw2D(c, t)`**: the background without the GPU. Helpers: `api.gradient(c, edgeDarkness, centreColour, edgeColour)` and `api.caustics(c, t, alpha, colour)`.
- **`shader`** (optional): the GPU background in GLSL. `background` sets `col` (and `bend` to distort what's drawn on top, as water does). `surface` runs after the animals are drawn in, for glints on the water. Available: `vUv`, `p` (aspect-corrected position), `r` (0 centre … 1 corner), `base` (bg colour with the light setting applied), `light`, `slope` / `shine` / `h0` (the waves), `uT` (seconds), `uGlow`, `noise()`, `hash()`, `caustic(uv)`.
