# Tummy-Time Aquarium

Fish are projected onto a white blanket or the floor in front of your baby. The webcam watches her hands with MediaPipe hand tracking: when she reaches out, nearby fish swim over and circle her hand. When she slaps the floor, they scatter with a splash of bubbles and a "bloop".

## What you need

- Laptop with Chrome, a webcam, and a projector (HDMI from the laptop)
- A plain white blanket or sheet (light floors work too)
- A dim room, with a little soft light on so the camera can still see her hands
- Internet the first time (the hand tracker downloads from Google's CDN)

## Run it

```bash
cd tummy-time-aquarium
python3 -m http.server 8001      # Windows: py -m http.server 8001
```

Open http://localhost:8001 in Chrome. Drag the window onto the projector, press **F** for fullscreen, then **Start camera**.

You can try it with no camera: moving the mouse over the water acts like a hand, and clicking makes a splash.

## Set up (once per room layout)

1. **Aim the projector** at the floor in front of where she'll lie. Mount it high and pointing down, from behind or beside her, so the beam lands on the blanket and not in her eyes.
2. **Aim the webcam** at the same patch of floor. Higher and more top-down is better. It should see the whole projected area.
3. **Calibrate:** press **C**. Four numbered coloured dots appear on the floor. In the camera preview, click the centre of dot 1, 2, 3 and then 4. Now the fish line up with real hands on the blanket.
4. **Test it:** put your hand on the blanket. Fish should come to it. Slap the blanket and they should scatter. Turn on **Show hand dots** to see where the program thinks your hand is.
5. **Tune the slap:** watch the bar under *Slap detection* as you reach and slap. Put the red line above where gentle reaching gets to and below where a slap gets to.
6. Press **H** to hide the panel.

## Tips

- **Hands not detected?** Add a bit of soft room light. The hand tracker needs to see skin and fingers. *Light under hand* (on by default) also shines a warm glow on her hand, which helps.
- MediaPipe is trained mostly on adult hands. Baby hands usually work, but tracking is better when the camera is closer (around 1–1.5 m) and sees her hand from above.
- **Fish scatter too easily?** Raise *Slap threshold*. **Slaps are ignored?** Lower it.
- **Fish don't come close enough?** Raise *Reach distance*.
- If you move the camera or projector, recalibrate (C).
- Settings and calibration save automatically.

## Safety

- Nothing heavy over her. The projector and camera go on a stable shelf, table or tripod off to the side or behind her, with legs taped down or weighted. Never hang them above her.
- The projector beam should never shine into her eyes. Lower the brightness if it's very bright.
- Cords taped down and out of reach.
- Short sessions, always supervised.
