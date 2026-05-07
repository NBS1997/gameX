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

## The OQ18 N3-only direct-pull test

**Run after:** any cycle that touches `applyReceiverAttraction` or the call-site in `game/src/main.ts`.

**Why:** the wedge clause is "moon pulls water → water pulls things." Direct cursor → receiver attraction must be N3-only (`goal.kind === 'send'`) so N1 boats and N2 lanterns move via the fluid flow field alone — the moon pulls water, water carries the receivers. On N3 the verb IS releasing / sending, so direct attraction is acceptable as the verb-grammar. The retrospective adjudicated this; the closure-sprint plan day 3 schedules it. If the gate doesn't ship, the trailer (P1 #9) cannot demonstrate the wedge honestly because the moon will appear to pull receivers directly on every night.

### Manual feel-test (after a code change to `applyReceiverAttraction`'s call-site)

1. Hard-refresh the page. Clear localStorage. Play Night 1.
2. **Test N1 (guide) — flow only.** Press-and-hold near the boat. Confirm the boat moves *because the water pushed it*, not *because the cursor tugged it*. Move the cursor in slow circles around the boat at varying distances; the boat's motion should follow the water deformation (delayed, indirect), not lock to the cursor's heading (direct, instant).
3. **Test N1 reaches harbour.** Confirm the boat still settles into the harbour ring via flow alone. If the boat consistently fails to reach the harbour, retune `night-1.delta.json` `pullStrength` upward in 0.05 increments until guidance feels right.
4. **Test N2 (gather) — flow only.** Replay Night 2. Confirm: lanterns drift toward each other via the bay filling, not via direct cursor pull. Cluster forms naturally as water gathers them.
5. **Test N3 (send) — direct pull active.** Replay Night 3. Confirm: direct cursor-to-lantern pull IS still applied. Hold near a lantern; it should respond to the cursor on top of the flow field. The verb-grammar is "let go / send" — direct pull is the verb here.
6. **Per-night gate verification (DevTools).** Optional: in DevTools console during N1/N2, log the `goal.kind` to confirm the gate evaluates correctly per night.

**Pass:** all five behaviours land cleanly. **Fail:** N1/N2 receivers visibly track cursor heading directly, OR N3 lanterns ignore the cursor and only respond to flow.

### Automatable regression check (code-level)

The QA agent runs this static check from `C:\Dev\gameX\game\`:

```powershell
# OQ18: a marker comment at the applyReceiverAttraction call-site documents
# the N3-only invariant and serves as the regression anchor.
Select-String -Path src/main.ts -Pattern 'OQ18' -Quiet
```

**Pass:** match returns True. **Fail:** match returns False — the call-site is unguarded and the wedge clause is silently contradicted on N1/N2 (retrospective OQ18 adjudication; trailer P1 #9 cannot record honestly).

## The N3 closure-callback test (fade-to-silence + final bell)

**Run after:** any cycle that touches `audio.finalBell` / `audio.fadeToSilence` / `audio.restoreMaster` or the N3 goal-met scheduler in `game/src/main.ts`.

**Why:** closure-sprint P1 #7 — the kishōtenketsu "and ever since" beat. N3 must close differently from N1 and N2: the goal-met bell fires, then 1500ms later the same bell rings as a structural callback to N1 (same 880Hz frequency, no transposition), then 2000ms after that the master gain ramps to silence over 4 seconds. The bay closes its own loop. The savour-tap "advance now" path must short-circuit the schedule cleanly so the master gain restores on the next night entry.

### Manual feel-test (after a code change to the closure callback)

1. Hard-refresh the page. Clear localStorage. Play through to Night 3 (or use `?night=3`). Reach goal-met (release ≥4 lanterns past the east edge).
2. **Test the existing goal-met bell.** Confirm the standard goal-met bell fires once on the rising edge (sine 880Hz, envelope down over ~1.4s).
3. **Test the final bell callback.** Approximately 1500ms after the first bell, a second bell fires at the same frequency (880Hz). The two notes form an audible "two notes, two nights apart, same pitch" callback: the bay closing its own loop.
4. **Test fade-to-silence.** Approximately 3500ms after the goal-met (2000ms after the final bell), the master gain begins a linear ramp toward zero over 4 seconds. The ambient bed quiets gradually until silence. No abrupt cut.
5. **Test savour-tap short-circuit.** Replay N3, reach goal-met, tap during the savour minimum (after 1500ms but before the auto-ceiling at 2500ms). Confirm: night advances cleanly; on entering the picker (or N1 if linear), master gain is restored to full level. No "stuck silence" carries forward.
6. **Test N1 and N2 do NOT fire the closure beat.** Replay N1 to goal-met; confirm only the standard goal-met bell fires (no second bell, no master fade). Same for N2.
7. **Test free-reentry.** With `meta.freeReentry === true`, enter N3 via picker, complete it. Confirm the closure beat fires every time N3 is completed (it is structural, not a one-shot).
8. **Test reduce-motion.** Windows reduce-motion ON. The audio behaviour is identical (audio is not motion). Any optional `worldLayer.position.y` drift during the fade is omitted under reduce-motion.

**Pass:** all eight behaviours land cleanly.

### Automatable regression check (code-level)

The QA agent runs this static check from `C:\Dev\gameX\game\`:

```powershell
# P1 #7: audio manager exposes finalBell + fadeToSilence + restoreMaster; main.ts schedules them on N3.
Select-String -Path src/audio/manager.ts -Pattern 'finalBell' -Quiet
Select-String -Path src/audio/manager.ts -Pattern 'fadeToSilence' -Quiet
Select-String -Path src/audio/manager.ts -Pattern 'restoreMaster' -Quiet
Select-String -Path src/main.ts -Pattern 'finalBell' -Quiet
```

**Pass:** all four return True. **Fail:** any returns False — the closure beat is unwired and N3 ends with the same beat as N1/N2; the kishōtenketsu third-act resolution is missing (closure-sprint P1 #7 regression).

## The cursor-tether test

**Run after:** any cycle that touches `game/src/render/cursorTether.ts` or its `main.ts` wiring (closure-sprint day-2 second half, P1 #8).

**Why:** the wedge clause is "moon pulls water → water pulls things." The cursor-tether is the *visible* proof of mediation between the cursor (moon) and the receivers (boats, lanterns) during a hold — a soft per-frame line whose alpha grows with hold-onset and decays with cursor-receiver distance. Replaces the placeholder cursor-trail (decorative dots that don't communicate the verb). Trailer (P1 #9) cannot record honestly without this — a muted-autoplay viewer needs to *see* the link to read the wedge.

### Manual feel-test (after a code change to cursor-tether)

1. Hard-refresh the page. Clear localStorage. Play any night.
2. **Test tether-on-hold.** Press-and-hold near a receiver within pull range. Confirm a soft foam-stop shimmer line draws from the cursor centre to the in-range receiver. Alpha grows over the 200–400ms hold-onset ramp.
3. **Test alpha decays with distance.** Move the cursor away from the receiver while still holding (within range). Confirm the tether's alpha decreases as distance grows (`0.3 * holdT * (1 - dist/range)`).
4. **Test out-of-range disappearance.** Move the cursor outside the pull range while still holding. Confirm the tether disappears (alpha = 0). When you re-enter range, it reappears.
5. **Test multi-receiver.** On N2 (8 lanterns) or N3 (6 lanterns), with multiple receivers in range, confirm the tether either chooses the nearest receiver OR draws to all in-range receivers (per spec — verify implementation choice). No flicker between receivers when the cursor moves slowly.
6. **Test release behaviour.** Release the mouse. Confirm the tether disappears immediately (next frame). The release-snapback is the visual payoff; the tether should NOT compete with it.
7. **Test reduce-motion swap.** Windows reduce-motion ON. Replay the hold. Confirm the tether is either omitted entirely OR a static line at the same alpha (per spec implementation), with no fade-in tween.
8. **Test no leftover cursor-trail.** Confirm no decorative dot-trail follows the cursor anywhere in the slice. The old `cursorTrail.ts` placeholder must be gone from the build.

**Pass:** all eight behaviours land cleanly.

### Automatable regression check (code-level)

The QA agent runs these static checks from `C:\Dev\gameX\game\`:

```powershell
# P1 #8: cursorTether replaces cursorTrail. The tether file exists; the trail does not.
Test-Path src/render/cursorTether.ts
Select-String -Path src/main.ts -Pattern 'cursorTether' -Quiet
# Negative checks — these MUST be False after the fix.
Test-Path src/render/cursorTrail.ts
Select-String -Path src/main.ts -Pattern 'cursorTrail' -Quiet
```

**Pass:** first two return True; last two return False. **Fail:** if `cursorTrail.ts` still exists or `cursorTrail` still appears in `main.ts`, the placeholder is shipping (closure-sprint day-2 second-half regression; trailer P1 #9 will record the wrong wedge legibility).

### Cycle-5 feel-tuning literals — config.ts extraction

Bundled with cycle 6 per reviewer's cycle-5 non-blocking suggestion: the `1500`, `3500`, `4`, and `0.4` feel-tuning literals from cycle 5's N3 closure scheduler should now live as named constants in `config.ts`.

```powershell
# Feel-tuning literals must be named constants in config.ts.
Select-String -Path src/config.ts -Pattern 'N3_FINAL_BELL' -Quiet
Select-String -Path src/config.ts -Pattern 'N3_FADE_TO_SILENCE' -Quiet
Select-String -Path src/config.ts -Pattern 'MASTER_RESTORE_RAMP' -Quiet
```

**Pass:** all three return True. **Fail:** the literals still live inline in `main.ts`, contradicting conventions §"all tunables in config.ts."

## The N3 headland-fire test

**Run after:** any cycle that touches `game/src/render/headlandFire.ts`, the lantern-proximity hook in `verbs/settle.ts`, the `audio.lanternIgnitesFire()` method, or the N3 wiring in `main.ts` (closure-sprint Day 5, P1 #6).

**Why:** the visual partner to cycle 5's audio closure beat (P1 #7 final bell + fade-to-silence). On N3, when the first lantern crosses the headland (within ~80px of the fire position), a small disc on the headland brightens from its idle pulse to a sustained ignited state, accompanied by `audio.lanternIgnitesFire()` (sine 1080Hz, transposed +200Hz from the N1 goal-met bell). The bay *responds* to the player's "let go" verb diegetically — the world acknowledges what was sent. State machine is strict idle → ignited (no transitions back); ignition callback is idempotent (subsequent lanterns crossing don't re-fire). Fire stays out of `state.receivers` — it's an ambient response, not a verb target.

### Manual feel-test (after a code change to the headland fire)

1. Hard-refresh the page. Clear localStorage. Play to N3 (or use `?night=3`).
2. **Test idle pulse.** On N3 entry, observe the headland (eastern shore around `(1700, 980)`). Confirm a small warm disc (`#ff8a4a`) pulses gently at ~1.2Hz at low amplitude. The disc is visible but quiet — this is the idle state.
3. **Test first-ignition.** Press-and-hold near a lantern, release it eastward. As the first lantern crosses within ~80px of the fire position, confirm: (a) the fire scales-up briefly (~200ms tween) then sustains at a brightened state; (b) `audio.lanternIgnitesFire()` plays a soft warm chime (sine 1080Hz, shorter envelope than the N1 goal-met bell, lower gain).
4. **Test idempotent ignition.** Continue sending more lanterns through the proximity zone. Confirm: only the FIRST crossing fires the chime + ignition tween. Subsequent lanterns trigger no audio and no visual change — the fire stays lit but doesn't re-ignite.
5. **Test fire persists for the night.** Once ignited, confirm the fire stays at the brightened state for the rest of N3 (no decay, no pulse-back-to-idle).
6. **Test fire does NOT count toward goal.** N3's goal is ≥4 lanterns past the east edge. Confirm goal-met still fires only when ≥4 lanterns are sent — the fire ignition does not satisfy `goal.minCount` on its own.
7. **Test back-and-forth lantern.** Send a lantern toward the headland; before it crosses the proximity threshold, pull it back via the flow field (or wait for it to drift back). Then send it again. Confirm: the fire ignites only on the FIRST true crossing; if it crosses, drifts back, and crosses again, the fire stays at its existing state (no double-fire on re-cross).
8. **Test other nights.** Replay N1 and N2. Confirm the headland fire is NOT visible (it's N3-only).
9. **Test reduce-motion.** Windows reduce-motion ON. Replay N3. Confirm: idle pulse is omitted (the disc is static at its idle alpha); ignition tween is omitted (the disc snaps from idle to ignited brightness instantly). The audio chime fires regardless (audio is not motion).

**Pass:** all eight behaviours land cleanly.

### Automatable regression check (code-level)

The QA agent runs these static checks from `C:\Dev\gameX\game\`:

```powershell
# P1 #6: headland fire module + audio method + level-data + main.ts wiring all present.
Test-Path src/render/headlandFire.ts
Select-String -Path src/audio/manager.ts -Pattern 'lanternIgnitesFire' -Quiet
Select-String -Path src/main.ts -Pattern 'headlandFire' -Quiet
Select-String -Path ../game/levels/night-3.delta.json -Pattern '"fire"' -Quiet
Select-String -Path src/level/types.ts -Pattern 'AmbientDef' -Quiet
```

**Pass:** all five return True. **Fail:** the visual partner to the N3 closure beat is missing — the bay does not respond to "let go," the trailer's third-up frame has no subject (closure-sprint P1 #6 regression).

## The picker-as-place test

**Run after:** any cycle that touches `game/src/scenes/nightPicker.ts` ghost rendering or its `meta.ts` data feed (closure-sprint Day 7, P1 #2 visual half).

**Why:** the cycle-1 day-1 save schema persists `meta.persistedGhosts` across sessions, but until P1 #2 ships there is no rendering of those ghosts at the picker scene. The picker is the only place the player sees the whole arc; without ghosts it reads as an abstract three-button menu rather than a bay that holds memory of nights they've played. The Steam draft (cycle 8) explicitly claims "your bay carries forward what you've done, softly" — P1 #2 makes that claim visually true. **Perimeter constraint (habit-formation cycle 9):** silhouettes ONLY — no completion counters, no badges, no numeric tallies, no "ready" copy, no hover tooltips that name what the silhouette was.

### Manual feel-test (after a code change to picker ghost rendering)

1. Hard-refresh the page. Clear localStorage. Land on Night 1 (linear flow, no picker yet).
2. Play and complete N1. Watch auto-advance to N2.
3. Play and complete N2. Watch auto-advance to N3.
4. Play and complete N3. `meta.freeReentry` flips to true after the closure beat. The picker appears.
5. **Test ghost rendering.** Each of the three slots shows faint foam-stop (`#a8b5cc`) rim silhouettes positioned within the slot frame, depicting:
   - N1 slot: small boat ellipse (rim only) at the position where the boat settled (near the harbour ring).
   - N2 slot: small lantern circles (rim only) at lantern cluster centroid positions.
   - N3 slot: small lantern circles for the lanterns that did NOT cross east (sent lanterns are absent — the bay carries forward what was held, not what was sent).
6. **Test perimeter compliance.** Confirm visually: NO numeric counters, NO badges, NO "completed" copy, NO hover tooltips that name what the silhouette was. The picker is a place, not a checklist.
7. **Test cross-session persistence.** Hard-refresh the browser. Confirm: ghosts persist (the cycle-1 v2 schema works end-to-end).
8. **Test mid-arc state.** Clear localStorage, complete only N1, refresh. Confirm: only N1 slot shows ghosts; N2 and N3 slots are clean.
9. **Test reduce-motion.** Silhouettes are static (no pulse, no animation); rendering identical with reduce-motion on or off.

**Pass:** all five behaviours land cleanly. **Fail:** the picker is empty after completed nights (the day-1 schema is shipped but unused at the picker — closure-sprint P1 #2 visual-half regression).

### Automatable regression check (code-level)

The QA agent runs this static check from `C:\Dev\gameX\game\`:

```powershell
# P1 #2: picker scene must reference picker-ghost rendering.
Select-String -Path src/scenes/nightPicker.ts -Pattern 'PICKER_GHOST' -Quiet
```

**Pass:** True. **Fail:** False — the picker is ignoring the cycle-1 v2 schema; the bay-memory promise from the Steam draft is not visually backed.

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

## The N4 schema-only test (sub-cycle A — schema lands; verb is sub-cycle B)

**Automatable static checks** (run from `game/`):

```powershell
# 1. Schema files exist and parse.
Test-Path levels/night-4.delta.json                                              # -> True
node -e "JSON.parse(require('fs').readFileSync('levels/night-4.delta.json','utf8'))"  # -> no throw

# 2. Type extensions present.
Select-String -Path src/level/types.ts -Pattern "'last-quarter'" -Quiet           # -> True
Select-String -Path src/level/types.ts -Pattern "'still'" -Quiet                  # -> True
Select-String -Path src/level/types.ts -Pattern "StillGoal" -Quiet                # -> True
Select-String -Path src/level/types.ts -Pattern "1 \| 2 \| 3 \| 4" -Quiet         # -> True
Select-String -Path src/level/types.ts -Pattern "heron\?: Vec2" -Quiet            # -> True

# 3. Loader registration.
Select-String -Path src/level/loader.ts -Pattern "night-4.delta.json" -Quiet      # -> True
Select-String -Path src/level/loader.ts -Pattern "4: night4Json" -Quiet           # -> True

# 4. Save schema v3.
Select-String -Path src/state/save.ts -Pattern "'neap/save/v3'" -Quiet            # -> True
Select-String -Path src/state/save.ts -Pattern "'neap/save/v2'" -Quiet            # -> True (legacy key reference)
Select-String -Path src/state/save.ts -Pattern "version: 3" -Quiet                # -> True
Select-String -Path src/state/save.ts -Pattern "n === 4" -Quiet                   # -> True

# 5. Meta state.
Select-String -Path src/state/meta.ts -Pattern "size === 4" -Quiet                # -> True
Select-String -Path src/state/meta.ts -Pattern "completedNights.has\(4\)" -Quiet  # -> True

# 6. Picker scaffolding.
Select-String -Path src/scenes/nightPicker.ts -Pattern "1, 2, 3, 4" -Quiet        # -> True
Select-String -Path src/scenes/nightPicker.ts -Pattern "'last-quarter'" -Quiet    # -> True
Select-String -Path src/scenes/nightPicker.ts -Pattern "idx - 1.5" -Quiet         # -> True

# 7. Cursor + title-card additions.
Select-String -Path src/render/cursor.ts -Pattern "'last-quarter'" -Quiet         # -> True
Select-String -Path src/render/titleCard.ts -Pattern "'last-quarter'" -Quiet      # -> True
Select-String -Path src/render/titleCard.ts -Pattern "Last quarter" -Quiet        # -> True

# 8. Verb-switch exhaustiveness no-op for 'still'.
Select-String -Path src/main.ts -Pattern "case 'still'" -Quiet                    # -> True

# 9. GoalProgress union extended + initialGoalProgress + recoverFromSoftDrift cover 'still'.
Select-String -Path src/state/gameState.ts -Pattern "kind: 'still'" -Quiet        # -> True

# 10. tsc + lint clean.
npx tsc --noEmit                                                                   # -> exit 0
npm run lint                                                                       # -> exit 0
```

**Manual feel-test steps** (browser, run `npm run dev` from `game/`):

1. Fresh tab, clear `localStorage`, reload. Picker shows **four slots** (waxing-crescent / full / waning-gibbous / last-quarter glyphs). No padlocks. No badges. Slots are symmetrically centred around the screen midpoint.
2. Press the N4 slot. Routing falls back to N1 (linear gate). N1 plays normally.
3. Complete N1, N2, N3 in order. After N3 completes, picker shows N4 selectable.
4. Press the N4 slot. Title card reads exactly **"Last quarter.  The bay holds what was given."** (two spaces between sentences). Card holds 3000 ms then fades.
5. After title fades, the cursor displays the **last-quarter half-disc** glyph (leading hemisphere shadowed; opposite of N3's trailing-hemisphere shadow). Pull-radius ring is 95 px.
6. Press-and-hold pulls water with strength 0.75x (gentlest of the four). The water responds; nothing else happens. The bay is empty (no boats, no lanterns). **The night never completes** — this is correct for sub-cycle A; the heron + verb land in sub-cycle B.
7. Press the browser back-button or refresh. Save is written under `localStorage['neap/save/v3']` (DevTools -> Application -> localStorage). `version: 3` field present. `completedNights` includes 1, 2, 3 (not 4 — N4 didn't complete because the verb is inert).
8. **v2 -> v3 migration check.** Open DevTools console, run:
   ```js
   localStorage.clear();
   localStorage.setItem('neap/save/v2', JSON.stringify({
     version: 2,
     completedNights: [1, 2],
     freeReentry: false,
     ghosts: [{ night: 1, type: 'boat', x: 1700, y: 540 }],
   }));
   ```
   Reload the tab. Picker shows N3 selectable, ghost silhouettes render for N1 at the picker (cycle-9 pattern), and `localStorage['neap/save/v3']` exists with the migrated data; `localStorage['neap/save/v2']` is left in place defensively.
9. **Reduce-motion check (no behaviour change for sub-cycle A).** OS reduce-motion ON, repeat steps 1–6. The picker, cursor, title-card, and water-pull behaviours are unchanged from existing nights — sub-cycle A introduces no new motion.

## The N4 withhold-verb test (sub-cycle B — verb + heron + audio land; intent-beat is sub-cycle C)

**Automatable static checks** (run from `game/`):

```powershell
# 1. Verb file exists.
Test-Path src/verbs/withhold.ts                                                          # -> True

# 2. Render module exists.
Test-Path src/render/heron.ts                                                            # -> True

# 3. Heron state machine phases all present.
Select-String -Path src/render/heron.ts -Pattern "'idle'" -Quiet                         # -> True
Select-String -Path src/render/heron.ts -Pattern "'approaching'" -Quiet                  # -> True
Select-String -Path src/render/heron.ts -Pattern "'recoiling'" -Quiet                    # -> True
Select-String -Path src/render/heron.ts -Pattern "'preLift'" -Quiet                      # -> True
Select-String -Path src/render/heron.ts -Pattern "'lifting'" -Quiet                      # -> True
Select-String -Path src/render/heron.ts -Pattern "'gone'" -Quiet                         # -> True

# 4. Audio method.
Select-String -Path src/audio/manager.ts -Pattern 'heronSettleChime' -Quiet              # -> True
Select-String -Path src/audio/manager.ts -Pattern '587' -Quiet                           # -> True

# 5. main.ts wiring.
Select-String -Path src/main.ts -Pattern 'updateWithhold' -Quiet                         # -> True
Select-String -Path src/main.ts -Pattern 'heron\.update' -Quiet                          # -> True
Select-String -Path src/main.ts -Pattern 'heron\.reset' -Quiet                           # -> True
Select-String -Path src/main.ts -Pattern 'heron\.triggerRecoil' -Quiet                   # -> True
Select-String -Path src/main.ts -Pattern 'heronSettleChime' -Quiet                       # -> True

# 6. config.ts feel-tuning constants.
Select-String -Path src/config.ts -Pattern 'WITHHOLD_RING_R' -Quiet                      # -> True
Select-String -Path src/config.ts -Pattern 'WITHHOLD_DWELL_RISE' -Quiet                  # -> True
Select-String -Path src/config.ts -Pattern 'WITHHOLD_PRE_LIFT_DWELL' -Quiet              # -> True

# 7. Perimeter — banned identifiers (case-sensitive).
Select-String -Path src -Pattern 'creatureTrust|bond|affinity|friendship' -Recurse -CaseSensitive
# (expect: zero matches in NEW code; pre-existing matches if any are recorded in cycle-10 review)

# 8. Save-schema unchanged.
git diff ce651c6..HEAD -- src/state/save.ts
# (expect: no SaveDataV3 interface body changes; v3 read order unchanged)

# 9. Picker — explicit night-4 clause.
Select-String -Path src/scenes/nightPicker.ts -Pattern 'night === 4' -Quiet              # -> True

# 10. tsc + lint clean.
npx tsc --noEmit                                                                          # -> exit 0
npm run lint                                                                              # -> exit 0
```

**Manual feel-test steps** (browser, run `npm run dev` from `game/`):

1. Fresh tab, clear `localStorage`, complete N1 -> N2 -> N3 -> reach N4 selectable. Press N4. Title card "Last quarter. The bay holds what was given." holds 3000 ms, fades 400 ms.
2. After title fades, the heron is visible at the eastern foam line (`x ≈ 1700, y ≈ 880`). It's standing, body roughly upright, with a faint cool halo. Idle micro-tilt is visible but subtle (±2°, slow 4.3s cycle).
3. Hover the cursor over the bay (no press). The pull-radius ring brightens slightly as the cursor enters within 220 px of the heron. The brightening is smooth (smoothstep), not linear.
4. Press-and-hold near the heron, **keep the cursor still**. Within ~2.5 seconds the heron's wings stretch out (pre-lift wing-stretch). Continue holding still. The heron lifts on a single slow wingbeat, translates east-and-up over ~2.4s, and exits the frame. A 587 Hz settle chime plays as the lift starts; the existing final-bell + fade-to-silence + master-restore chain fires per N3's pattern.
5. **Hard-pull recoil:** restart N4 (free-reentry should be enabled after step 4). Press-and-hold and rapidly move the cursor across the heron (faster than 220 px/s within 90 px of it). The heron does a single 350 ms ease-out body-shift away from the cursor (along the cursor->heron unit vector, clamped above the foam line). It does NOT die, NOT flee permanently. Stop moving — the heron settles back to idle. Subsequent stillness re-grows `dwellT` toward the goal threshold. **No failure surface, no modal, no "RETRY?"**.
6. **Withhold without press:** restart N4. Move the cursor near the heron (within 220 px) and **don't press at all**. `dwellT` should still rise (lifting the press counts as stillness too); after ~2.5s the heron lifts.
7. **Reduce-motion check.** OS reduce-motion ON. Restart N4. Heron's idle is a static pose (no micro-tilt). Approach is an instant 100ms alpha pulse 0.85->1->0.85. Recoil is omitted (alpha pulse only). Pre-lift wing-stretch is an instant scale-pose. Lift is a 600ms alpha-fade in place (no translation).
8. **Cursor-tether suppression.** On entering N4 the foam-line cursor tether is disabled (alpha 0 / invisible). On returning to picker -> N1, the tether is restored.
9. **Save schema unchanged.** Open DevTools -> Application -> localStorage. `neap/save/v3` exists with completedNights including 4 after step-4 success. **No new fields about the heron** (no `heronSeen`, `lastHeronVisitAt`, `heronTrust`, etc).
10. **Perimeter check.** Throughout the session, no UI text mentions "heron," "creature," "trust," "bond," "friend," etc. The game is wordless about it; the player meets the heron silently.
