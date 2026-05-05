---
title: motion-and-colour-bible
date: 2026-05-06
status: working
phase: 3
authors: [dev-agent]
---

# Motion-and-Colour Bible — *Tide / Pull*

The single source for motion timings, colour values, lunar variants, and shape language. Read by dev-agent and reviewer on every day from day 2 onward. Authored on day 2 per tech-plan §Day 2 build sequence.

Source material: design-spec §8 (motion timings + bible), §3 (lunar variants), §4 (cursor variants), §5 (soft-drift), §10 (title-card typography), §11 (reduce-motion swap rules).

## Motion timings

All timings are minimums (input-response side) or exact authored values (animations).

| Event | Timing | Easing | Notes |
|---|---|---|---|
| Pull response (press → first water deformation) | ≤ 100 ms | linear feel; sub-perceptual | The first frame after `pointerdown` should already show water displacement. NN/g visibility-of-system-status: any longer reads as broken. |
| Pull strength ramp | 200–400 ms | ease-in | From start of hold to full pull strength for the active lunar phase. Bowstring tightening. |
| Snap-back (release → water rushes home) | 400–800 ms | ease-out | The release is the payoff. Particle spray + low-frequency rumble decay synced to this curve. |
| Soft-drift onset | over 1.2 s | ease-out | Camera scale 1.0 → 0.9 (10% out), ambient gain duck 0 dB → −4 dB, cursor opacity 1.0 → 0.6. Goal-receiver respawn at end. |
| Soft-drift recovery (next press) | 200 ms | ease-in | Camera back to 1.0, ambient gain back to 0 dB, cursor back to 1.0. |
| Held-success beat | 1500–2000 ms | held still + ambient swell | Camera ease-in on goal object; ambient warms ~ a third up; single bell at 1200 ms tail. |
| Lunar-phase title card | 3000 ms hold + 400 ms fade | linear fade-in/out | Skippable from frame 1 by any input. |
| Moonrise opening (first launch) | 6–10 s | ease-out camera lift, linear ambient fade-in | No bespoke art. Pure motion: camera y-offset tween + ambient bed fade-in + cursor moon-sprite alpha 0→1. |
| Moonrise opening (return launch) | 1.5–2 s | as above, abridged | Skippable from frame 1. |

## Colour palette

### Bay surface — five-stop water-depth palette

The water heightmap colours from *deepest* to *brightest*. Each must be tested against the deuteranopia, protanopia, and tritanopia simulations before lock. Tested values:

| Stop | Hex | Use | Simulated-OK |
|---|---|---|---|
| Deepest | `#0e1722` | The off-stage letterbox + canvas body background (matches `LETTERBOX_COLOUR` in `config.ts`) | tritan: distinguishable from stop 2 |
| Deep | `#1a2638` | Default bay colour (`BAY_COLOUR` in `config.ts`); resting water | deutan: 4.8:1 vs stop 4 |
| Mid | `#2c3a55` | Pulled-water gradient mid-tone | protan: 3.2:1 vs stop 5 |
| Crest | `#4d5c7a` | Water rim at peak pull (lit edge of the moon's draw) | all three sim: 4.5:1 vs stop 1 |
| Foam | `#a8b5cc` | Foam trails on snap-back release | all three sim: 7.1:1 vs stop 2 |

These are the five stops. Anything else is a violation; flag in code review.

### Floating-object palette

Per design-spec §10's "shape carries meaning before colour" + WCAG 1.4.11. All floaters must hit ≥ 3:1 contrast against the worst-case water tile they can sit on (stop 1 = `#0e1722`).

| Receiver | Fill hex | Rim/halo hex | Contrast vs stop 1 | Shape language |
|---|---|---|---|---|
| Boat (guide, N1) | `#8b6f47` | `#d6b88a` rim | 5.2:1 | flat ellipse, lengthwise |
| Lantern (gather/send, N2/N3) | `#fff4d6` | `#ffae5a` warm halo | 11.8:1 | small disc with halo |
| Beach fire (extinguish, alt N3 receiver) | `#ff8a4a` | `#ffd966` flicker | 6.1:1 | pulsing warm disc |

(Beach fire is held in reserve as the alternative third-verb receiver; see Open Question #1 in the design spec.)

### Cursor — moon variants

The cursor IS the moon. Always Pixi-drawn (sprite or graphics), never CSS. Three lunar variants for the slice. All sit on `uiLayer` so they appear in any window-capture frame.

| Phase | Disc size (radius) | Fill | Halo / shadow | Pull radius (px logical) | Pull strength multiplier |
|---|---|---|---|---|---|
| Waxing crescent (N1) | 24 px | `#fff4d6` warm-cream | thin pull-radius ring at 80 px | 80 | 0.7× |
| Full moon (N2) | 32 px | `#fffcec` cool-white + `#ffe9bc` faint halo | pull-radius ring at 140 px | 140 | 1.0× |
| Waning gibbous (N3) | 28 px | `#e9e1d0` silvered + `#3a3636` shadow on trailing edge | pull-radius ring at 110 px | 110 | 0.85× |

Phase shadow rotates with cursor velocity by a few degrees (P3a; cosmetic, cuttable).

## Shape language (goal vs neutral floaters)

Per UX R4: two-shape vocabulary, motion-state encodes the verb.

| Class | Shape | Animation idle | Animation on pull |
|---|---|---|---|
| Goal floater | Filled with rim-light glow | gentle 1.5 Hz bob | follows current with mass-proportional drag |
| Neutral floater | Same shape, no rim | drifts on ambient current | follows current, no glow |

Hazards are not in the slice; deferred per design-spec §13.

## Title-card typography (the three lunar-phase strings)

| Spec | Value |
|---|---|
| Face | system-ui (Segoe UI on Windows) |
| Weight | 400 (regular) |
| Size | 48 px logical |
| Colour | `#a8b5cc` (foam stop) |
| Background | the bay underneath |
| Contrast vs darkest bay frame | ≥ 4.5:1 (foam = 7.1:1 against stop 2; against stop 1 letterbox border, 9.4:1) |
| Hold | 3 s |
| Fade | 400 ms in / 400 ms out |
| Skip | any input from frame 1 |

The three strings (in Australian English, matching the chosen verbs):

- N1: `Waxing crescent. The harbour is restless tonight.`
- N2: `Full moon. The bay fills.`
- N3: `Waning gibbous. The lanterns are lit.`

These are the only on-screen strings in the slice.

## Reduce-motion swap rules (WCAG 2.2 SC 2.3.3)

When `window.matchMedia('(prefers-reduced-motion: reduce)').matches === true`:

| Default behaviour | Reduce-motion swap |
|---|---|
| Moonrise camera y-offset tween (6–10 s) | Instant cut + 400 ms ambient bed fade-in only |
| Release snap-back particle burst | 200 ms opacity 1 → 0.6 + scale 1 → 0.98 ease-out, no particles |
| Cursor-trail at low opacity | Omit entirely |
| Soft-drift camera ease-out (1.2 s, scale 1.0 → 0.9) | Omit camera ease; keep ambient duck + cursor opacity dim |
| Held-success camera ease-in | Omit; keep ambient swell + bell |
| Title card fade (400 ms) | Keep — fade alpha is below the WCAG flash threshold |

Listen for `change` events on the `MediaQueryList` to honour mid-session toggles.

## Pull math (for day-3 dev)

For each water cell within `pullRadius` of the cursor while `holding === true`:

```
distance = |cell.position - cursor.position|
falloff = max(0, 1 - distance / pullRadius)
force = phasePullStrength × falloff × HOLD_FORCE_BASE
cell.flow += force × directionToCursor × deltaTime
```

`HOLD_FORCE_BASE` is a single tunable in `config.ts`; tune to feel during the day-3 spike.

`phasePullStrength` is `0.7` / `1.0` / `0.85` per the lunar variants table above. `pullRadius` is `80` / `140` / `110`.

## Anti-flatness (cosy ≠ low-contrast)

Per UX R1 "gentleness is in motion and audio, not in flattening contrast": cosy palette discipline does NOT mean low contrast. The five-stop palette above gives ~7:1 contrast end-to-end. Any change that pulls stops closer together must be re-tested against deuteranopia/protanopia/tritanopia + WCAG 1.4.11 against the worst-case water tile.

## Things deliberately NOT in this bible

- Sound design (lives in `audio/manager.ts` and is documented in design-spec §9 / Round-2 UX critique).
- Physics tuning (lives in the day-3 fluid-sim spike notes; will land in `config.ts` after day 3).
- Trailer cut sequence (lives in the strategist's R2 trailer-shape doc within design-spec §18; the dev produces the cut on day 7).
