---
title: trailer-cut
date: 2026-05-06
status: working (recording deferred to user)
phase: 3
authors: [orchestrator]
---

# Trailer Cut — *Neap* (working title was *Tide / Pull*)

The 30-second wordless trailer per design-spec §18 / Goal 7. Strategist's R2 sketch refined for what's actually buildable from the current slice.

**Why wordless:** Steam autoplay-muted on the storefront. Visual must carry the wedge. This is only possible because of soft-drift + load-bearing-moon + persistent-bay decisions made in Phase 1.

**Recording:** authoring this cut requires OBS or browser DevTools recording. The orchestrator builds the visual sequence but the final render is the user's task — see "Recording recipe" below.

## Sequence (frame-by-frame)

| Range | Source | Beat |
|---|---|---|
| 0:00 – 0:03 | Black + sustained note | Title card "Tide / Pull" (or eventual rename) fades up over a still bay |
| 0:03 – 0:08 | `?night=1`, no input | Moonrise stand-in: ambient bed fades in; cursor moon-glyph (waxing crescent) appears at upper-right of frame |
| 0:08 – 0:14 | `?night=1` | First press-and-hold near the boat. Water lifts toward the cursor. Held beat ~3s |
| 0:14 – 0:18 | `?night=1` | Release: water rushes back, soft chime as boat settles into harbour ring (which goes cream → goal-met) |
| 0:18 – 0:22 | Cut to `?night=2` (full moon) | Same bay, full-moon palette tint (filter cutoff at 2kHz audibly different). Cursor is now full-moon disc, larger; pull radius visibly wider |
| 0:22 – 0:26 | `?night=3` (waning gibbous) | Lanterns line the headland; one press-release sends them east into open water |
| 0:26 – 0:30 | Three-up freeze | Three frames side-by-side: N1 boat in harbour, N2 lanterns clustered, N3 lanterns crossing east edge. End card: wishlist CTA (trailer-only, never in-game) |

## Recording recipe

Boot the dev server: `cd game && npm run dev`. Open OBS → Window Capture → the browser window. Set canvas record at 1920×1080, 60fps. Mute mic; capture system audio.

Record three takes (one per night URL: `?night=1`, `?night=2`, `?night=3`). For each:
1. Hard-refresh the page so the moonrise reset (currently the moonrise is implicit — we don't have the explicit moonrise sequence yet; that's day-9 polish work). For day-7-trailer-1, the "moonrise" segment is just the audio bed fading in over a still bay.
2. Hold mouse off-canvas for 3 seconds (black frame / no input).
3. Press-and-hold near the relevant receiver until goal-met.
4. Continue holding for 2 seconds after goal-met to capture the held-success beat.
5. Release. Stop recording.

Splice the three takes in any video editor (DaVinci Resolve free is on Windows). Add the title card and end card as overlays.

## What's deferred to a polish pass

- **Explicit moonrise sequence** — day 9 work per tech-plan. For trailer-1, the bed fade-in carries it.
- **Per-phase palette tint visible in still frames** — currently the palette is the same across phases; the audio filter is what differentiates. A subtle phase-tint on the water (e.g. shift the deep-stop hex toward warmer for waxing, cooler for full) is day-9 polish.
- **End-card art** — placeholder text "Wishlist on Steam" suffices for the slice's first trailer take.
- **Audio mastering** — synthesised audio is acceptable for the first take; replace with recorded ambient + foley on a polish pass.

## Assumptions documented for the user

- Target file: `docs/specs/trailer-cut-1.mp4` (path referenced in tech-plan §4 day 7).
- The trailer demonstrates the wedge in the form available at end-of-day-7. Days 8–9 will add the night-picker (replacing the URL param) and the polish pass that improves visual differentiation between phases.
