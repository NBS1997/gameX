---
title: feel-test-protocol
date: 2026-05-06
status: working
phase: 2.5
authors: [orchestrator]
---

# Feel-Test Protocol — *Neap* slice (working title was *Tide / Pull*)

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

### Automatable regression check (code-level)

Every animation entry-point under `game/src/render/` and `game/src/scenes/` that authors a multi-frame motion (camera tween, ease-in/out, particle burst, eased opacity) **must** consult `prefersReducedMotion()` from `../a11y/reduceMotion.ts` and apply the bible's swap rule.

The QA agent runs this static check from `C:\Dev\gameX\game\`:

```powershell
# Each render/scene file that drives multi-frame motion must import or call prefersReducedMotion.
# Currently in scope: cursorTrail, softDrift, main (held-success ease), moonrise.
Select-String -Path src/render/moonrise.ts -Pattern 'prefersReducedMotion' -Quiet
```

**Pass:** the file matches. **Fail:** the file does not — the animation is running unconditionally and is a WCAG 2.2 SC 2.3.3 conformance gap. Forward-log entry from cycle 1 of `/captain` (2026-05-06) names this as the regression check that gated the moonrise reduce-motion fix.

## The held-success dwell-to-savour test

**Run after:** any cycle that touches the goal-met / `postCompleteMs` block in `game/src/main.ts`.

**Why:** the canonical "dwell to savour, tap to advance" reframe from retrospective P1 #4. The 2.5s auto-advance must become a *ceiling* (no-input fallback), not a *floor*; from 1500ms onward, any pointer press advances the night. A press during savour must NOT fire the press-attack audio (the player is signalling "advance," not "engage with the verb").

### Manual feel-test (after a code change to the held-success block)

1. Hard-refresh the page. Play Night 1 to goal-met.
2. **Test ceiling** — sit completely still after the bell. Confirm the night auto-advances at ~2.5s.
3. **Test tap-to-advance** — replay Night 1, reach goal-met, wait until the bell finishes (~1.5s), then click anywhere. Confirm the night advances immediately.
4. **Test savour-minimum** — replay Night 1, reach goal-met, click *before* 1500ms. Confirm the night does NOT advance (the savour minimum protects the bell-and-cream beat).
5. **Test press-attack suppression** — listen for the press-attack sound during the savour window. Confirm it does NOT fire (the press is signalling advance, not engage).

**Pass:** all four behaviours land cleanly.

### Automatable regression check (code-level)

The QA agent runs this static check from `C:\Dev\gameX\game\`:

```powershell
# main.ts must declare a SAVOUR_MIN_MS constant and reference it from the goal-met block.
Select-String -Path src/main.ts -Pattern 'SAVOUR_MIN_MS' -Quiet
```

**Pass:** match returns True. **Fail:** match returns False — the held-success auto-advance is still acting as a forced cut and is a soft-compulsion drift (retrospective P1 #4; ethics perimeter via habit-formation). The press-attack-suppression gate (step 5 of the manual feel-test) is reviewed by code inspection at the same call-site rather than by static check, since `!wasGoalComplete` already appears unrelatedly at the goal-met edge detection.

## The intent-beat test

**Run after:** any cycle that touches `game/src/render/intentBeat.ts` or its `main.ts` wiring (closure-sprint day 4, P1 #5).

**Why:** every night must offer a per-night affordance pulse between title-card fade-out and input-enable, so the player's eye lands on what the night is asking. Without it, N2 and N3 open into a silent bay with no diegetic "look here" beat — which would push the game toward tutorial overlays or text instructions, both perimeter violations. Suppressed on within-session re-entry so it doesn't become a tax for returning players.

### Manual feel-test (after a code change to intent-beat)

1. Hard-refresh the page. Clear localStorage. Trigger first-launch.
2. **Test N1 affordance** — moonrise plays; title card holds 3s and fades; on title-card fade-out, no separate ring fires (the harbour ring's natural breathing IS the affordance). Confirm input is briefly gated (~1.5s) before pull responds, then pull works as today.
3. **Test N2 affordance** — title card "Full moon. The bay fills." fades out; immediately a faint ring pulses at the lantern centroid (~880, 435), scale eases up and back over ~600ms, alpha 0 → 0.35 → 0. Input enables when pulse finishes.
4. **Test N3 affordance** — title card "Waning gibbous. The lanterns are lit." fades out; a foam-stop ring expands from the east edge (1920, 540), radius 0 → 200 over ~800ms, alpha 0.4 → 0.
5. **Test skip-on-press** — replay any night, tap during the affordance pulse. Pulse cancels, input enables immediately, no audio press-attack fires (the press signals "advance," not engage).
6. **Test re-entry suppression** — complete N1 → enter N2 → return to picker → re-enter N2. Confirm the N2 ring does NOT fire the second time; harbour pulse on N1 still breathes as today (not affected by suppression — only the new ring is).
7. **Test reduce-motion** — Windows reduce-motion ON. Replay each night fresh. N2 and N3 show a single static ring at peak alpha for ~200ms then disappear; no ease tween, no expansion. N1 still gates input briefly.

**Pass:** all seven behaviours land cleanly.

### Automatable regression check (code-level)

The QA agent runs this static check from `C:\Dev\gameX\game\`:

```powershell
# The intent-beat module must exist and be wired into main.ts.
Test-Path src/render/intentBeat.ts
Select-String -Path src/main.ts -Pattern 'intentBeat' -Quiet
```

**Pass:** both commands return True. **Fail:** the affordance is unwired and N2/N3 open silently — closure-sprint P1 #5 regression.

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
2. **DevTools → Application → Local Storage.** Confirm: only `neap/save/v2` exists (and possibly the legacy `tide-pull/save/v1` if the user previously launched the slice — it is read-only and acceptable). Any other key = violation.
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
