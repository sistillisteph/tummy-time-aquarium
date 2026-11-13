# Tummy-Time Aquarium

Fish are projected onto a white blanket or the floor in front of your baby. The webcam watches baby's hands with MediaPipe hand tracking: when she reaches out, nearby fish swim over and circle baby's hand. When she slaps the floor, they scatter with a splash of bubbles and a "bloop".

🎥 **See it in action:** [watch the Instagram reel](https://www.instagram.com/reel/DfgbFkXxLg8/)

## What you need

- Laptop with Chrome, a webcam, and a projector (HDMI from the laptop)
- A plain white blanket or sheet (light floors work too)
- A dim room, with a little soft light on so the camera can still see baby's hands
- Internet the first time (the hand tracker downloads from Google's CDN)

## Run it

```bash
cd tummy-time-aquarium
python3 -m http.server 8001      # Windows: py -m http.server 8001
```

Open http://localhost:8001 in Chrome. Drag the window onto the projector and follow the numbered steps in the panel.

You can try it with no camera: moving the mouse over the water acts like a hand, and clicking makes a splash.

## Set up (once per room layout)

The panel shows three numbered steps. Everything else is tucked under **Advanced settings**.

1. **Aim the projector** at the floor in front of where baby will lie. Mount it high and pointing down, from behind or beside baby, so the beam lands on the blanket and not in baby's eyes.
2. **Aim the webcam** at the same patch of floor. Higher and more top-down is better. It should see the whole projected area.
3. Click **1 · Start camera**.
4. Click **2 · Line up camera & projector**. Four numbered coloured dots appear on the floor. In the camera picture, click the centre of dot 1, 2, 3 and then 4. Now the animals line up with real hands on the blanket.
5. Click **3 · Full screen**. The panel hides; move the mouse and click ⚙︎ to bring it back.

**Test it:** put your hand on the blanket. The animals should come to it. Slap the blanket and they should run away.
If slaps are missed or happen too easily, open **Advanced settings → Slap detection**: the bar shows hand movement, and a slap fires when it crosses the red line.

## Scenes, food and age

- **Scenes:** 🐟 Koi pond, 🐠 Coral reef (tropical fish and sea turtles), 🦋 Butterflies (a garden). Pick one in the panel, press **N** for the next one or **1**–**9**, or set **Advanced settings → Change scene** to rotate automatically.
- **Food:** when a hand stays still for a moment, food appears around it and the animals come for it: pellets on the pond, flakes on the reef, flowers that bloom in the garden (butterflies land on them). With the mouse: stop moving it for a second.
- **Baby's age** sets the colours: black, white and red for 0–3 months (what newborns see best), bold simple colours for 3–6, full colour for 6–12, and a rainbow of colours from 12 months. Set a **Birthday** in Advanced settings and the age updates itself.
- **Realistic effects (GPU)** (on by default) adds water that bends the light and moving grass. If the computer can't do it, the app falls back to the simple version.
- The panel is in English or Spanish (button at the top right).

### Adding scenes

Each scene is one file in [`scenes/`](scenes/). Copy `scenes/_example.js` to a new name, edit it, and reload: it appears in the panel. See [scenes/README.md](scenes/README.md).

## Tips

- **Hands not detected?** Add a bit of soft room light. The hand tracker needs to see skin and fingers. *Light under hand* (on by default) also shines a warm glow on baby's hand, which helps.
- MediaPipe is trained mostly on adult hands. Baby hands usually work, but tracking is better when the camera is closer (around 1–1.5 m) and sees baby's hand from above.
- **Animals scatter too easily?** Raise *Slap strength needed*. **Slaps are ignored?** Lower it.
- **Animals don't come close enough?** Raise *How far they come*.
- If you move the camera or projector, line up again (C).
- Settings and calibration save automatically.

## Safety

- Nothing heavy over baby. The projector and camera go on a stable shelf, table or tripod off to the side or behind baby, with legs taped down or weighted. Never hang them above baby.
- The projector beam should never shine into baby's eyes. Lower the brightness if it's very bright.
- Cords taped down and out of reach.
- Short sessions, always supervised.
