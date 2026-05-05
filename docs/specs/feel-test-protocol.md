---
title: feel-test-protocol
date: 2026-05-06
status: working
phase: 2.5
authors: [orchestrator]
---

# Feel-Test Protocol — *Tide / Pull* slice

The QA runbook. Used by the QA agent (for the automatable parts) and by the human (for the browser-session parts) to verify each tech-plan day against the design spec's acceptance criteria.

## Setup

1. From `C:\Dev\gameX\game\`: `npm install` (first time only), then `npm run dev`.
2. Open `http://localhost:5173/` in **Edge or Chrome**, latest stable.
3. Maximise the browser window. Close other tabs that play sound.
4. **Sound on**, system volume around half. Audio is half the feel.
5. Open DevTools (F12) before any test that exercises ethics-perimeter checks.

## The 60-second sandbox test

**Run after:** day 3 onward, every day.
**Why:** the canonical "does the toy feel good" test from design-spec Goal 1 + tech-plan day 3 kill gate.

1. Hard-refresh the page (Ctrl+Shift+R).
2. Land on the title / sandbox surface. Do nothing else.
3. Press-and-hold at varying positions and durations. Release. Repeat.
4. Note: are you still wanting to do this at second 60?

**Pass:** yes, and the surface is responsive within 100ms of every press.
**Fail:** the toy stops being interesting before second 60, OR pull response feels sluggish.

## The single-night test

**Run after:** the day that ships each night (day 4 for N1, day 6 for N2, day 7 for N3).

1. Pick the night you're testing.
2. Play it end-to-end. Try to win. Try to fail.
3. Check: does the held-success beat land (1.5–2s of camera ease-in + ambient swell on goal-met)?
4. Check: does soft-drift trigger as expected if you let the goal-state slip (camera ease-out, ambient duck, cursor dim, no modal/button)?
5. Check: does pressing-and-holding again *re-engage* without any prompt?

**Pass:** all four checks land cleanly. **Fail:** any check missing.

## The full-slice test

**Run after:** day 7 (provisional; nights 1–3 playable but pre-polish) and day 10 (canonical).

1. Hard-refresh. Clear `localStorage` (DevTools → Application → Local Storage → right-click `localhost:5173` → Clear).
2. Play through Nights 1 → 2 → 3 in one session, in order (first-playthrough is linear-only).
3. Time it. Acceptance: 8–12 minutes.
4. Confirm: bay state from N1 visible in N2; from N1+N2 visible in N3.
5. Confirm: no fail screens, no pop-ups, no on-screen text other than three title cards.
6. Confirm: clean exit after N3 — ambient resolves, moon dips, no "play again?" pop-up.

**Pass:** all six. **Fail:** any one.

## The reduce-motion test

**Run after:** day 9.

1. Windows Settings → Accessibility → Visual effects → **Animation effects: Off**.
2. Hard-refresh the browser.
3. Verify: moonrise is an instant cut + 400ms ambient fade (not a camera lift).
4. Verify: release rush is a 200ms opacity 1→0.6 + scale 1→0.98 ease-out (not a particle burst + camera shake).
5. Verify: cursor-trail particles are damped or absent.
6. With the page still open, toggle **Animation effects: On**. Wait two seconds.
7. Trigger another release. Verify: behaviour reverts on this animation (mid-session toggle works).

**Pass:** all seven. **Fail:** any one.

## The clip-render test

**Run after:** day 7 (trailer cut) and day 9 (verification).

1. Open OBS Studio. New scene: **Window Capture** → the browser window.
2. Record 10 seconds of any night with normal play (a press, a release, a goal-met).
3. Stop. Open the recording in any video player.
4. Scrub through. Confirm the moon-cursor is visible in **every frame** with input.

**Pass:** cursor visible throughout. **Fail:** cursor missing in any frame (means OS cursor leaked, or Pixi sprite isn't on `uiLayer`).

## The contrast test (day 9)

1. Take a screenshot of N1, N2, N3 mid-pull at the **darkest point** of the heightmap palette.
2. Use any browser-extension contrast checker (axe DevTools, WAVE, or a colour picker plus a contrast-ratio calculator).
3. Sample the worst-case water tile colour for each phase.
4. Sample every interactive sprite colour (boat, lantern, third-verb receiver, cursor).
5. Compute contrast ratio for each sprite vs each worst-case tile.

**Pass:** every interactive sprite ≥ 3:1 (WCAG 1.4.11) against its worst-case tile.
**Fail:** any pairing < 3:1 — flag the offending sprite for rim-light / drop-shadow rework.

## The ethics-perimeter sweep (every QA run)

1. **DevTools → Network tab.** Hard-refresh. Wait for assets to resolve. Confirm: zero `fetch` / `xhr` rows after initial asset load (filter `Fetch/XHR`).
2. **DevTools → Application → Local Storage.** Confirm: only `tide-pull/save/v1` exists. Any other key = violation.
3. **DevTools → Application → Service Workers.** Confirm: none registered.
4. **DevTools → Application → Notifications.** Confirm: permission state is `default` and game has not requested.
5. **Visual scan of all UI surfaces** (sandbox, title, all three nights, picker post-completion). Confirm: no button / link / icon labelled "share", "wishlist", "follow", "post", "tweet". The trailer end-card is external — not in the build.
6. **Code-level grep** (the QA agent does this automatically): no imports of `sentry`, `posthog`, `plausible`, `mixpanel`, `gtag`, `googletagmanager`, `analytics`.

**Pass:** all six clean. **Fail:** any one — flag as ethics-violation regression in build-log.

## The stranger test (day 10 — canonical slice acceptance)

1. Find one human who has not seen the game.
2. Open the URL on this Windows machine. Hand them the mouse.
3. **Don't speak.** Don't gesture.
4. Time how long they engage with the sandbox before either asking what to do or stopping.

**Pass criterion 1:** ≥60 seconds unprompted in sandbox.

5. Once they've explored the sandbox, ask: "want to play through three nights?" Hand them the mouse again. Don't speak.
6. Time the full-slice playthrough.

**Pass criterion 2:** completes Nights 1–3 in 8–12 minutes with no fail screens, no questions, no on-screen text other than title cards.

If both pass, the slice is shippable. If either fails, the failure goes in build-log under `## Regressions` with a description of the specific point where the stranger lost flow.

## Report template (QA agent appends to build-log)

```
### Day N QA — {ISO date}
- **Automatable acceptance:** {N}/{total} criteria passed via code/server checks
- **Browser-required acceptance:** {N} criteria pending human pass
- **Ethics-perimeter sweep:** {clean | violations — list}
- **Notes:** {what dev / reviewer should know}
- **Browser checks required:**
  - [ ] {test name from this protocol}
  - [ ] ...
```
