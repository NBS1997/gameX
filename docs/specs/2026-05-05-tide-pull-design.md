---
title: tide-pull design
date: 2026-05-05
status: design (pre-implementation)
authors: [storyboarder, gamification-designer, habit-formation, ux-designer, pm, product-strategist, orchestrator]
phase: 1
---

# Tide / Pull — Design Spec

## TL;DR

*Tide / Pull* (working title; rename deferred to end of Phase 2) is a cosy, one-screen, physics-based one-button game in which the player is the moon. Press-and-hold pulls water toward the cursor; release lets it rush back. The vertical slice is **three nights, one persistent bay, three lunar phases** — same place, three moods. The moon is load-bearing as a mechanic: pull strength and radius are scaled by the active lunar phase. The cursor IS the moon, drawn by Pixi (not the OS), with three lunar-phase variants. Failure is soft-drift (water keeps sloshing, goal-receivers gracefully respawn, the player's next press-and-hold is the retry — no modal, no button, no attempts counter). The game has no on-screen text apart from a 3-second lunar-phase title card per night. Audio is a single ambient bed with per-phase filter automation plus four SFX and a shaped release-swell variant. Built in Pixi.js / WebGL on Canvas, Windows-runnable as a browser game, with Steam as the distribution target. Solo dev, two weeks. **One unresolved dissent remains in this spec: the third verb (settle / extinguish / send), see Open Questions.**

## Problem

The repository is greenfield (`C:\Dev\gameX`) — no code, no design artefacts beyond the premise (`docs/specs/2026-05-05-premise.md`). The user picked *Tide / Pull* on instinct from a slate of five concept-pitch candidates and brought it to the Creative Council with three named open questions: the fluid-sim approach (the riskiest tech bet), the differentiator from *Spilled!* (Lente, 2025), and how six levels from one mechanic stay non-redundant. After Round 1 the user redirected on six framing calls (cosy, moon load-bearing, three levels, soft-drift, lunar-in-slice, Steam target), which collapsed several Round 1 tensions and reshaped scope. The council ran four rounds (3 standard + 1 final critique invoked at user request) and converged on the design described here.

## Goals

1. Ship a vertical slice that proves the toy *feels good* before any level is wrapped around it. Acceptance: a stranger who has never seen the game plays unprompted for at least 60 seconds with no objective.
2. Make the moon load-bearing as a mechanic, not a skin: pull strength and radius scale with lunar phase, and the player feels the difference between phases in their hands.
3. Build three nights of one persistent bay, with bay state carrying across nights (debris, lanterns, ash) within a single session.
4. Establish a soft-drift failure model that preserves flow stakes without imposing punishment, and that contains zero attempts/failures counter visible to the player.
5. Lock the cosy-cosmic-intimate tone — comparable cluster *Where's My Water?* + *Townscaper* + *A Building Full of Cats* — across motion, audio, palette, and copy.
6. Hold a hard ethics perimeter: no streaks, no leaderboards, no missed-day badges, no calendar grid, no notifications, no real-world date check, no real-money anything, no in-game share/wishlist/follow surface, no "bays played" counter, no endless mode, no time-limited FOMO, no attempts counter.
7. Produce a wordless 30-second trailer cut by end of week 1 that drives slice juice priorities. The trailer can render correctly on Steam's storefront-autoplay-muted variant.
8. Pass a baseline accessibility commitment: respect `prefers-reduced-motion`, render the cursor inside the captured frame so clips read, hold all interactive elements at WCAG 1.4.11 (3:1 non-text contrast) against the worst-case water tile they can sit on.
9. Keep the slice within two solo-dev weeks on a Windows machine.

## Non-goals

1. *Not* a *Spilled!*-style cosy janitorial cleanup. The wedge is moon-as-force, not boat-as-protagonist.
2. *Not* a leaderboard, score-stars, XP, medal, achievement-spam, or any extrinsic-motivation surface in the slice or its post-slice extension.
3. *Not* a real-world lunar phase tie-in. The lunar cycle is in-game and abstracted; resets each session unless the player chooses to continue.
4. *Not* a daily-challenge with score, rank, or completion record. Any post-slice "today's bay" must ship as a sandbox seed, never scored.
5. *Not* a six-level slice. The original premise specified six; the user reduced to three, and the council ratified.
6. *Not* a hard-reset failure model with a 2-second reset (premise as written). Replaced by soft-drift.
7. *Not* a multi-button or modifier-key game. One verb (press-and-hold), continuous pointer aim, no extra inputs.
8. *Not* a mobile/touch port in the slice. Desktop browser, mouse-first.
9. *Not* a swimmer-rescue / beachcomber / creatures-with-faces / seasonal-weather slice. All deferred to post-slice.
10. *Not* the title-locked name. "Tide / Pull" is a working title; rename before any public commit. Steam-search collision risk and slash-tokenisation risk both flagged.

## Proposed changes

The repository will, by end of slice, contain:

### Vertical slice — gameplay

1. **One persistent bay** rendered top-down. Single screen, 16:9 playfield, internal render at 1920×1080, drawn with Pixi.js / WebGL on Canvas. Bay state persists across the three nights of a single session: night 1's wreck visible in night 2; night 2's lanterns / debris visible in night 3.
2. **Three nights, three lunar phases.** Night 1 = waxing crescent (gentle, pull strength ~0.7×, ~80px radius). Night 2 = full moon (potent, pull strength 1.0×, ~140px radius). Night 3 = waning gibbous (thoughtful, pull strength ~0.85×, ~110px radius). Pull strength and radius are functions of the active phase — the same one line of mechanic the strategist demanded as load-bearing. Linear progression on first playthrough only; after first completion, a free-pick night picker is available, with no padlock iconography ever shown.
3. **Three goals, all gradient-friendly and soft-drift-compatible.** Night 1 = guide (a small boat to harbour). Night 2 = gather (scattered floating objects — lanterns or driftwood — into a single mass; the lunar inversion of the verb is the *kishōtenketsu ten*). Night 3 = the unresolved third verb (see Open Questions).
4. **Cursor is the moon.** Pixi.js `Sprite` parented to a top-level UI container on the main stage, position updated each frame from `pointermove`. OS cursor hidden via CSS `canvas { cursor: none; }` on the renderer element. The cursor sprite phases across the three nights:
   - Waxing crescent — small disc (~24px), warm-cream fill, thin pull-radius ring at ~80px.
   - Full moon — larger disc (~32px), cool-white fill with faint halo, pull-radius ring at ~140px.
   - Waning gibbous — disc (~28px), silvered fill with shadow on the trailing edge, pull-radius ring at ~110px.
   The phase shadow rotates with cursor velocity by a few degrees, selling "this is a body, not a pointer."
5. **Soft-drift failure.** When goal-state drifts past threshold: camera eases out ~10% over 1.2s, ambient track ducks ~4dB, moon-cursor dims to ~60% opacity. Goal-receiver fades and respawns in its starting pose. The level is always live. The player's next press-and-hold re-engages: cursor brightens, camera eases back, ambient swells. No modal, no button, no "RETRY?" text, no attempts counter, no fail screen. Reduce-motion path: skip the camera ease, do the dim and duck only; engagement gesture identical.
6. **Sandbox / free-pull mode** unlocked from first run. Single bay, no goal, ambient creatures, lunar phase visible. Doubles as the title-screen background and the 60-second feel-test surface.
7. **Moonrise opening beat.** ~6–10 seconds on first launch (camera y-offset tween, ambient bed fade-in, cursor moon-sprite alpha 0→1 — no bespoke first-run-only art); ~1.5–2 seconds on returning launches; always skippable from frame 1 by any input. Reduce-motion path replaces the camera tween with an instant cut and a 400ms ambient fade-in.

### Vertical slice — visual / audio / a11y

8. **Motion-and-colour bible** authored before any shader is written. Pull response ≤100ms, strength ramp 200–400ms, snap-back 400–800ms ease-out. Five-stop water-depth palette tested for deuteranopia, protanopia, and tritanopia. Drop-shadow / rim-light on every interactive floating object (WCAG 1.4.11, 3:1 against the worst-case water tile). Two-shape goal vocabulary (goal vs neutral) plus motion-state encoding the verb (gather-targets pulse softly, guide-targets drift on a vector, settle-targets hold still and dim — or whichever third verb wins; see Open Questions).
9. **Audio.** One ambient bed authored as a stem with low-pass filter automation per phase (cutoff ~800Hz waxing → ~2kHz half → full-band full); four event SFX (press-attack, release-whoosh, goal-met chime, soft-drift sigh); one shaped release-swell variant of the press-attack (re-pitched, longer tail, same source). UX owns the bed and continuous tension cues; gamification owns the four event SFX and the swell. Total: 5 audio files, 6 audible cues.
10. **No on-screen text** apart from a single 3-second lunar-phase title card per night (one face, one weight, ≥4.5:1 against the darkest bay frame, 3s hold, fade 400ms). Goal communicated by what's animated in the first 1.5 seconds after camera settles.
11. **Reduce-motion path.** On boot and on resize, query `window.matchMedia('(prefers-reduced-motion: reduce)')`. When `matches === true`, the release rush (particle burst + camera shake + radial bloom) is replaced by a 200ms opacity 1→0.6 + scale 1→0.98 ease-out tween on the affected sprites. The moonrise camera tween is replaced by an instant cut with a 400ms ambient-bed fade-in. Listen for `change` events on the MediaQueryList to honour mid-session toggles.
12. **Clip-render.** Cursor is a Pixi.js `Sprite` (not OS cursor) so any window-capture renders the moon in-frame. Playfield 16:9 with safe margins. Cursor-trail at low opacity for compressed-video legibility (toggleable).

### Tech-direction guard-rails (for Phase 2 / tech-lead)

13. **Day-3 fluid-sim spike kill gate.** Cellular-automaton water on a coarse grid is the default approach, but the gate stands: a tester pulls water and *wants to keep doing it* for at least 60 seconds with no objective, AND pull strength parameterises cleanly per lunar phase. If either fails on day 3, pivot to a particle-only approximation (height-field / SPH-lite) immediately rather than grinding.
14. **Audio fallback** if filter automation can't ship by day 5: drop one of the four SFX, keep the bed and the swell. Five cues, no per-phase differentiation. Document this as accepted audio-mute risk.
15. **Internal level-loader** is JSON-driven with a delta-layer for per-night overlays (so the persistent bay isn't three independent files). Authored, not procedural.

### Positioning artefacts (out-of-game, in spec)

16. **Wedge sentence (Steam page short description):** *"You are the moon. Hold to pull the tide; let go to watch it rush home. A cosy one-screen physics toy where the bay changes with tonight's phase."*
17. **Steam tag stack.** Primary: `Cozy`, `Physics`, `Relaxing`, `Minimalist`, `Atmospheric`, `Casual`. Secondary: `Singleplayer`, `Short`, `2D`, `Top-Down`, `Cute`, `Wholesome`. Avoid `Puzzle` as primary, avoid `Indie` as a marketing tag.
18. **Wordless 30-second trailer cut by end of week 1.** Sketch: 0–3s black + sustained note + title card over still bay; 3–8s moonrise (no input); 8–14s cursor appears as moon glyph, first press-and-hold, water lifts; 14–18s release, soft chime, goal met (paper boat to harbour or equivalent); 18–24s cut to night two — same bay, different phase, different palette tint; 24–30s three-up of "tonight's bay" framing across phases, wishlist CTA. End card *only* on the trailer, never inside the game.
19. **Rename before any public commit.** "Tide / Pull" is a working title only. Slash breaks Steam search tokenisation; "Tide" collides with *Rip Tide*, *Tidefall*, *Tides of Annihilation*. Territory: short, two-syllable, lunar-evocative, search-clean. Decision deferred to end of Phase 2.
20. **Healthy first-session target: 8–12 minutes** for the three-level slice. Clean exit after night three (no "play again?" pop-up). Ambient resolves to a gentle cadence; the moon dips below the bay horizon.

### Hard ethics perimeter (recorded as a constraint the build cannot violate without explicit council override)

21. No streak counter, consecutive-days counter, or calendar grid.
22. No "you haven't played in X days" notification, push, email, or in-game banner.
23. No missed-day badge, no broken-streak recovery purchase, no make-up day.
24. No leaderboard, no friend comparison, no "X players solved this faster".
25. No daily-challenge with score, rank, or completion record.
26. No attempts counter, no failure counter, no retry tally visible to the player.
27. No real-world date check or real-lunar-phase check.
28. No notifications of any kind in the slice.
29. No infinite-scroll endless mode.
30. No real-money anything.
31. No social/wishlist/follow/share surface inside the game (trailer end-card and Steam-page CTAs are unaffected — those are external marketing artefacts).
32. No "bays played" lifetime counter, no completionist checklist, no achievement-spam.
33. No timed events that expire.

### Deferred to post-slice (out of scope)

34. Swimmers, beachcomber, additional creature receivers.
35. Seasonal weather events.
36. Kishōtenketsu fourth-act / additional nights.
37. Mobile / touch port.
38. Community share, bays gallery, level editor.
39. Daily-seed sandbox variant (post-slice only, sandbox-only, no scoring).
40. Real-world lunar tie-in.

## Acceptance criteria

```gherkin
Feature: Tide/Pull vertical slice

  Scenario: First launch
    Given the player opens the game for the first time
    When the title card appears
    Then the lunar-phase name displays for 3 seconds
    And a 6–10 second moonrise plays with camera lift and ambient stem fade-in
    And any input skips the moonrise from frame 1

  Scenario: Returning launch
    Given the player has completed at least one night
    When the game loads
    Then the moonrise plays for 1.5–2 seconds
    And a night-picker shows three nights, each represented only by its lunar-phase glyph
    And no padlock iconography appears for any night

  Scenario: First-playthrough ordering
    Given the player has never completed any night
    When the game loads
    Then only night one is selectable
    And nights two and three appear as their lunar-phase glyphs without padlocks
    And after night one is completed, night two becomes selectable; after night two, night three

  Scenario: Free-pick after first completion
    Given the player has completed all three nights at least once
    When the game loads
    Then any of the three nights is directly selectable from the picker
    And no completion ticks, progress bars, or "completed" labels are rendered

  Scenario: Core verb — guide (Night 1)
    Given a small boat is on screen under the waxing crescent
    When the player presses and holds
    Then the cursor-moon exerts pull on water with strength ~0.7× and radius ~80px
    And the boat drifts along the resulting current

  Scenario: Core verb — gather (Night 2)
    Given scattered floating objects are on the bay surface under the full moon
    When the player presses and holds near the objects
    Then objects converge along pull vectors and cluster at the cursor
    And the lunar inversion (full-moon strength ~1.0×, radius ~140px) is felt

  Scenario: Core verb — third verb (Night 3)
    # Currently unresolved — see Open Questions section.
    # Three candidates: settle / extinguish / send.

  Scenario: Soft-drift failure
    Given a goal-state has drifted past threshold
    When the threshold is crossed
    Then no fail screen, no modal, and no button appear
    And the camera eases out ~10% over 1.2s
    And the ambient track ducks ~4dB
    And the moon-cursor dims to ~60% opacity
    And the goal-receiver fades and respawns in its starting pose
    And the player's next press-and-hold re-engages with the cursor brightening, camera easing back, and ambient swelling
    And no attempts/failures counter is shown to the player at any point

  Scenario: Pull strength scales with lunar phase
    Given the player presses and holds for 1 second at maximum
    Then pull strength and radius are measurably greater on Night 2 than on Night 1
    And measurably greater on Night 2 than on Night 3

  Scenario: Persistent bay across nights
    Given the player has completed Night 1 in this session
    When Night 2 begins
    Then visible artefacts of Night 1 (e.g. wrecks, drift) remain in the bay
    Given the player has completed Nights 1 and 2 in this session
    When Night 3 begins
    Then visible artefacts of Nights 1 and 2 remain in the bay

  Scenario: Cosy session shape
    Given a stranger plays unprompted from a fresh browser load
    Then they remain engaged for at least 60 seconds in the sandbox / first-pull surface
    And the three-night slice can be completed within 8–12 minutes
    And no "play again?" pop-up appears after Night 3

  Scenario: Reduce-motion
    Given the OS reports prefers-reduced-motion
    When any animation plays
    Then the moonrise is replaced by an instant cut with a 400ms ambient-bed fade-in
    And the release rush is replaced by a 200ms opacity 1→0.6 + scale 1→0.98 ease-out
    And cursor-trail particles are damped or omitted
    And toggling prefers-reduced-motion mid-session updates the behaviour on the next animation

  Scenario: Clip-render
    Given any night is in play
    Then the OS cursor is hidden via CSS cursor: none on the canvas
    And a Pixi sprite renders at the input position as the moon
    And a window-capture screen recording shows the moon-cursor in the captured frame

  Scenario: Audio
    Given any night is in play
    Then exactly one ambient bed plays with phase-specific filter automation
    And up to four SFX cues fire on press-attack, release-whoosh, goal-met, and soft-drift events
    And one shaped release-swell variant fires on the climactic release of each night

  Scenario: No on-screen text
    Given any night is in play after the title card
    Then no UI text, tooltip, HUD element, score, percentage, attempts counter, or wishlist/follow/share surface is rendered

  Scenario: Day-3 fluid-sim spike kill gate
    Given day 3 of development
    When the fluid-sim spike is feel-tested
    Then a tester pulls water and wants to keep doing it for at least 60 seconds with no objective
    And pull strength parameterises cleanly per lunar phase
    And if either fails, the dev pivots to a particle-only approximation immediately

  Scenario: Trailer rendering
    Given the wordless 30-second trailer cut is rendered by end of week 1
    When the trailer plays on Steam's storefront-autoplay-muted variant
    Then the visual carries the wedge without sound
    And the cursor-as-moon is in the captured frame
    And the trailer ends on a Steam wishlist CTA card
```

## Open questions

### 1. Third verb for Night 3 — settle / extinguish / send

This is the only material disagreement that survived four rounds. The three candidates with their council backers:

- **"send" — storyboarder + gamification-designer (R4 convergence).** Concrete picture: paper lanterns on the headland shrine, visible but inert in N1 and N2; on N3 they line the shore. Press-and-hold draws the waning moon close, lanterns lift; release sends them out across the bay on the tide. Pull strength scales how far they travel. Soft-drift compatibility: a lantern released too early drifts back to shore (gradient); released at the right moment it joins the others on the horizon. Strengths: agentic (verb the player performs), cosy farewell tone, lunar-pull-scaled, release-as-payoff. Weaknesses: introduces a new asset class (lantern sprites) that must read at small px on dark water (cost M).

- **"extinguish" — ux-designer + pm (R4).** Concrete picture: a beach fire on the headland, burning since N1, that the waning-moon tide must drown. Soft-drift compatibility: fire flares back if released too soon (gradient, not binary). Strengths: high-motion-to-low-motion contrast collapse (most readable on a coarse cellular automaton on a top-down water surface), gradient soft-drift via flare-back, scales with pull strength. Weaknesses: faintly martial register ("drown a fire") that may fight cosy-cosmic-intimate (storyboarder's R4 concern, habit-formation softened on this).

- **"settle" — product-strategist (R4 hold) + storyboarder/pm (R3 picks, both since revised toward "send" or "extinguish").** Concrete picture: the bay's response to the player's release; player verb is "release"; the bay settles as the night ends. Strengths: cleanest cosy-curator audience read (Cozy Gamer / Wholesome Games / Comfy Cozy Gaming), keeps the wedge sentence's "watch it rush home" tonally consistent. Weaknesses: gamification's grammatical objection — "settle is a state, not a verb the player performs" — collapses agency at the *kishōtenketsu ketsu*.

**Recommended path forward:** the user adjudicates this during Phase 2 (tech-plan), since the choice has real implications for asset list (lantern sprites vs fire VFX) and for visual-language work that the tech plan must scope. Council leaning at R4 close: "send" had two specialists arrive at it independently with the same concrete picture; "extinguish" had two specialists pick it from the R3 binary (which did not include "send" as an option); "settle" had one specialist hold it on positioning grounds.

### 2. Title rename territory

"Tide / Pull" is a working title only. Strategist's R2 sketch (territory, not a pick): short, two-syllable, lunar-evocative, search-clean. Examples cited: *Lull*, *Neap*, *Selene*, *Moonkeep*, *Hush Bay*, *Tidewatch*. Decision deferred to end of Phase 2 once the third-verb call is made.

### 3. Lantern asset readability (only if "send" wins)

Gamification's R4 P2: lantern asset must read at 16x16 px on dark water. Critical for the L3 send-beat to land in the trailer clip. Tech-lead to validate during Phase 2.

### 4. Audio fallback path

PM's R4 P1 fallback if filter automation cannot ship by day 5: drop one of the four SFX, keep the bed and the swell. Five cues, no per-phase differentiation. Document as accepted audio-mute risk if exercised.

---

## Appendix A: Round 1 memos

### A1. storyboarder

#### Take

The premise has a sleeping giant the slate is underselling: "you're the moon" is not just a hook, it's a cosmological role. Right now the design reads as "tide puzzles" — but the player isn't a cursor, they're a celestial body with gravity. Every beat in the vertical slice should reinforce *scale asymmetry*: you are vast, slow, and far away; the things you save are small, fragile, and close. *Spilled!* is intimate (a glass of water). *Tide / Pull* should be cosmic-intimate (a moon, a bay, a single fisherman). The differentiator isn't fluid tech — it's that the player feels lonely and powerful at once. Six levels can absolutely sustain one mechanic if each one tells a different small story about what the tide *means* to the thing on it.

#### Observations

- **Greenfield — no code, no scenes yet.** Working from premise alone. The closest artefacts to read would be `docs/specs/` for the premise file, but the brief above is the canonical input.
- **The "you're the moon" identity beat is currently a tagline, not a scene.** There's no opening beat where the player *sees* themselves as the moon. No moonrise. No reflection of the moon on the water that moves with the cursor. That's the single biggest missed beat in the slice as described.
- **Failure is gentle but so is success — no asymmetry.** A 2-second reset is humane, but if a save also feels like 2 seconds of "level done," the emotional payoff flatlines. The Pixar beat "*until finally*" needs a held moment — the boat slides into harbour, the lighthouse blinks once, the tide settles. Anticipation and follow-through (Disney principles) are missing from the success state.
- **Levels 1–6 risk being a difficulty curve, not a story.** Tutorial → harder → harder is mechanical. Kishōtenketsu would serve this better than a Western arc: introduction (you learn you're the moon), development (you help small things), *twist* (something the tide can't fix, or something the tide accidentally hurt), reconciliation (you understand restraint).
- **No callbacks across the slice.** The boat from level 1 should reappear in level 6's harbour. The swimmer you saved should be on the beach when the beachcomber walks past. Six disconnected vignettes is six times less memorable than one bay over six nights.

#### Recommendations

- **[P1] Frame the slice as "Six Nights Over One Bay"** — rationale: a single setting across six levels gives callbacks, time-of-day progression, and a sense of place that *Spilled!* doesn't have. Differentiator unlocked. — cost: S (it's a framing decision, not new tech)
- **[P1] Add a moonrise opening beat (10 seconds, no input)** — rationale: the player sees the moon rise over the bay, the water lifts toward it, then the cursor "becomes" the moon. The identity beat lands once and pays dividends every level. Anticipation + Staging. — cost: S
- **[P1] Design level 4 as the *ten* (twist) of a kishōtenketsu arc** — rationale: e.g. you must *push water away* from a nesting bird, or *not pull* while a whale passes. Inverts the verb. Solves the "levels 4–5 feel redundant" risk by making level 4 the emotional pivot, not just harder. — cost: M
- **[P2] Held success moments** — rationale: 1.5–2 seconds of camera ease-in on the saved thing, ambient track swells one note, then transition. Currently undefined; without it, wins evaporate. — cost: S
- **[P2] Persistent bay** — rationale: the harbour fills with the boats you've guided. By level 6 the bay is populated by your earlier saves. Cheap, enormous emotional return. — cost: S–M
- **[P3] Ambient creature life independent of goals** — rationale: gulls, a distant whale spout, a fishing boat that isn't your level goal. Sells "you are the moon of a real place." — cost: M

#### Tensions

- I expect **gamification-designer** to push for tighter feedback loops and score juice; I'd resist any scoring that overlays the moonrise/held-success beats. Numbers on screen will kill the cosmic-intimate tone faster than anything.
- I expect **tech-lead / pm** to flag "Six Nights Over One Bay" as scope creep (one persistent scene with state). I'd argue it's actually *cheaper* than six bespoke levels — same bay geometry, different time of day, different actor.
- I expect **product-strategist** to want the *Spilled!* differentiator stated as a feature ("persistent world!"). I'd argue the differentiator is a *feeling* (lonely, powerful, far away), and features follow from that, not the other way round.
- The kishōtenketsu twist (level 4 inverts the verb) may conflict with "one button, one rule" purity. Worth the trade — a game with no surprise across six levels is a tech demo.

#### Open questions for the council

1. Is the bay one place across six levels, or six places? (I have a strong view but it's a council call.)
2. Does the moon ever *appear* on screen as a visible body, or is it implied by the cursor only? Identity beat depends on this.
3. Are there any human/creature characters the player sees twice? Callbacks need recurring actors.
4. What's the failure *sound*? Gentle reset is visual; audio should match. Currently undefined.
5. Does the ambient track evolve across the six nights, or loop? (Scene transitions live or die on this.)
6. Is there a level 0 — a no-goal sandbox where the player just plays with the tide before being asked to *do* anything? Strongly implied by the premise but not in the slice.

---

### A2. gamification-designer

#### Take

*Tide / Pull* has a beautiful core verb — pull/release is a tactile, breathing rhythm that maps to a real thing the player already understands (the moon, the tide, lungs). That's a gift. The risk isn't the one-button conceit; it's that the council treats this as a puzzle game when the verb wants to be a *toy first, puzzle second*. The core loop is sub-second (press → water deforms → boat reacts → release → water rushes → consequence), and that loop must feel hypnotic before any "level" is wrapped around it. Six levels from one mechanic only stays fresh if each level introduces a new *thing the water touches*, not a new way to press the button. Spend the juice budget on the water surface and the *release* moment — that's where the game's identity lives. The differentiator from *Spilled!* is intent: *Spilled!* is about restoration and tidiness; *Tide / Pull* should be about *force you barely control*, the moon as a gentle but unsubtle god.

#### Observations

- **The core loop is ~1 second long; the meta loop is "did the bay survive?"; the meta-meta loop is implied but absent.** Press → deform → release → rush → outcome (core). Solve a bay → next bay (meta). What's above that? The premise doesn't say. Without a meta-meta — a slow accumulation of moons, tides, named bays, a coastline filling in — six levels is just six arcade puzzles in a trench coat.
- **The release is the load-bearing moment, not the press.** Pulling water in is the wind-up; the rush back out is where boats actually move, fires drown, swimmers get carried. Most one-button games juice the press. This one needs to juice the *let go* — that's the moon's exhale. If the release feels limp, the whole game feels limp.
- **One-button doesn't equal one-axis.** Cursor position is a second input the premise glosses over. Where the player aims the pull is as expressive as how long they hold it. The council should name this honestly: it's a *one-button-plus-pointer* game. That's still elegant, but it changes what "skill expression" means.
- **Failure states being gentle is great, but reset-in-2-seconds erases the loop's tension entirely.** Csikszentmihalyi's flow needs stakes. Suggest: failure doesn't reset — the water just keeps sloshing and the boat drifts off-screen, and *the player chooses* when to retry. That preserves gentleness without erasing consequence (SDT competence).
- **Levels 4–5 redundancy risk is real and is a content design problem masquerading as a mechanic problem.** The fix is introducing new *receivers* of the water (objects that react differently): a boat (drifts with current), a fire (consumed by volume), a swimmer (panics, must be carried gently — too much force drowns them), flotsam (light, scatters), a creature (swims against your pull). Each receiver is a new verb-without-a-button.

#### Recommendations

- **[P1] Build the toy before the level — 30 seconds of just water and a boat with no goal must feel good** — rationale: if the sub-second loop isn't hypnotic, no level design saves it; this is also the fluid-sim de-risk in disguise — cost: M
- **[P1] Spend juice budget on the release, not the press — particle spray on rush-back, low-frequency rumble that decays, boats lurching with audible hull creak, foam trails** — rationale: the release is the loop's payoff beat — cost: S
- **[P1] Introduce one new water-receiver per level across the six — boat, fire, swimmer, flotsam, creature, weather** — rationale: depth from new interactions, not new inputs (Koster: learning new things is fun) — cost: M
- **[P2] Add a meta-meta loop: a slowly-revealed coastline map where each cleared bay paints in a stretch of shore** — rationale: gives Achievers and Explorers (Bartle) something past the per-level loop without adding a meta-economy or streak — cost: S
- **[P2] Replace hard reset with soft drift — failure means the bay state continues, player chooses retry** — rationale: preserves gentleness, restores stakes, removes the only dark-pattern-adjacent thing in the spec (forced reset is a mild punishment) — cost: S
- **[P3] Hold-to-pull should have a felt ceiling — water "tightens" and resists past a threshold, communicated by audio and a subtle visual strain** — rationale: gives mastery curve a physical limit to play against, like a bowstring — cost: M
- **[P3] Defer scoring/stars/medals until after the toy works** — rationale: scoring locks design intent prematurely and pushes toward Achiever-only satisfaction — cost: S

#### Tensions

- **I expect to disagree with `pm` on scope.** "Build the toy first" reads as unscoped exploration, but it's the fastest path to knowing whether the premise is viable. A locked six-level plan before the water feels good is the bigger risk.
- **I expect tension with `habit-formation`** on whether a coastline meta-meta loop is engagement-bait. I think it's not — it's a Koster-style "the world reveals itself as you play" frame, not a streak — but they should weigh in.
- **I expect tension with `tech-lead`** on fluid sim. Cellular-automaton water on a coarse grid is fine *for behaviour*, but the *visual* surface (foam, refraction, depth shading) is what sells the juice. Those are separable problems and the budget conversation should treat them separately.
- **I'm not sure** about the cursor-position framing. If the council decides the brand promise is genuinely "one button," then cursor-as-input is a lie we're telling. If it's "one button of skill, plus aim," it's honest. This is a positioning call, not a design call.

#### Open questions for the council

1. Is there a meta-meta loop, or is the game six discrete puzzles? My recommendation is yes (coastline map), but the orchestrator should rule.
2. Is "one button" a hard brand constraint, or "one button of *timing/pressure*, plus pointer aim"? This affects every downstream decision.
3. Does failure reset hard (current spec) or soft-drift (my recommendation)? Affects flow, stakes, and the habit-formation read.
4. Is the target session length 2 minutes (one bay) or 20 minutes (a coastline run)? The juice and pacing answers diverge sharply between those two.
5. How much of the six-level budget can be spent on one "showcase" level where the water itself is the spectacle (e.g. a storm) versus six tight puzzles?

---

### A3. habit-formation

#### Take

*Tide / Pull* is structurally one of the cleanest ethical premises I've reviewed: gentle failure, single verb, no economy, no progression treadmill. The risk isn't that the design crosses the perimeter — it's that the *meta-layer* (daily bays, "streams and clips well", future Steam/mobile pressures) quietly imports dark patterns to justify a retention number. The job here is to lock in natural re-engagement now, while there's nothing to retrofit. The good news: the moon/tide fantasy has built-in calendar rhythms (lunar cycle, tide tables, day/night) that do retention work *the world is already doing*, with zero need for streaks, push notifications, or FOMO. Fogg's B=MAP triggers can all be internal (curiosity, mastery, "I wonder what happens if I pull harder near the cliff") rather than external prompts. Lean into that.

#### Observations

- **Greenfield.** No `docs/specs/`, no notification module, no clock provider yet. Every retention decision is still cheap to make.
- **The premise already passes the 13-year-old filter.** "Failure states are gentle (level resets in 2 seconds, no death animation, no shame)" is textbook self-determination-theory-friendly — competence without punishment. Verified.
- **Signal sources implied by the fiction are unusually rich for a one-button game.** The moon implies lunar phase, real-world tide, day/night, possibly weather. None of these need a notification — they change the *bay*, and the player notices on their next voluntary visit.
- **"Streams and clips well" is the single line in the premise that worries me.** Designing for clipability is fine; designing for *streamer-driven vanity loops* (leaderboards, daily-shame timers, share-or-lose) is the vector. Flag for the council.
- **Investment surface is currently thin.** The player puts skill in, but nothing tangible accumulates. That's a feature for ethics and a question mark for natural return — addressed in Recs.

#### Recommendations

- **[P1] Lunar-cycle bay states — natural trigger, not a prompt** — The bay looks and behaves differently across a ~28-session lunar arc (spring tides pull harder, neap tides feel sluggish, new-moon nights hide debris). Player returns because the *world changed*, not because the app nagged. Relies on: calendar-shaped rhythms, variable-reward applied to world events. 13yo filter: pass. Cost: M.
- **[P1] Opt-in opening ritual: "tonight's tide"** — On launch, a 3-second title card shows the current moon phase and one sentence of bay flavour ("The harbour is restless tonight"). No streak, no counter, no "day 4 of 7". Relies on: rituals the player opts into. 13yo filter: pass. Cost: S.
- **[P1] Replace any "daily challenge" framing with "today's bay"** — Same content, different psychology. A *daily challenge* implies missing it costs you; *today's bay* implies the world simply is what it is today, and yesterday's is gone the way yesterday is gone. No catch-up mechanic, no "you missed 3 bays" counter. Relies on: low-frequency high-meaning events. 13yo filter: pass. Cost: S.
- **[P2] Unfinished-level curiosity hooks, not completion pressure** — When a player abandons a level, the bay remembers the wreck. Returning shows the wreck still there, weather worn. No "X levels incomplete!" badge. Relies on: in-world consequence as natural trigger. 13yo filter: pass. Cost: M.
- **[P2] Sandbox/free-pull mode unlocked early** — A bay with no goal, just water and weight. Supports autonomy (SDT) and gives the clip-makers their canvas without the game pushing them toward sharing. Relies on: natural re-engagement, autonomy support. 13yo filter: pass. Cost: S.
- **[P3] Seasonal weather events (4–6 per year)** — A storm week, a king-tide weekend. Surprise-delight at low frequency. Relies on: surprise-delight at low frequency. 13yo filter: pass. Cost: M.
- **[P3] Healthy-session shape: soft "good stopping point" cue** — After ~15–20 minutes of play, the ambient track resolves to a gentle cadence and the moon dips. Player can keep going; the game has simply *offered* a stop. Relies on: rituals, autonomy. 13yo filter: pass. Cost: S.

#### Tensions

- **"Streams and clips well" vs. ethics.** Industry-standard play here is share-to-unlock, weekly leaderboards with reset anxiety, or "your friend just beat your score" pushes. I'm explicitly recommending against all three. The ethical alternative — sandbox + replay export + no leaderboard or a *seasonal* opt-in board — will perform worse on raw share counts. I'll defend that trade.
- **Daily content vs. completionism.** A daily-rotating bay risks becoming a streak in disguise the moment we add a "bays played this month" counter. I'd ban that counter pre-emptively. If the council wants a *visible* progression surface, I'd prefer a "bays you remember" gallery the player curates voluntarily over an automatic log.
- **Six levels from one mechanic** is gamification-designer's problem, but it touches mine: if level variety is thin, the temptation to bolt on extrinsic motivators (XP, stars, unlocks) grows. Lock in "no stars, no XP" now, force depth to come from mechanic and level design.
- **Mobile port pressure** (not in the premise but implied by "mobile-style players"). If this ships to App Store / Play, monetisation pressure will push toward IAP loops. Worth deciding upfront: this is a paid game or an ad-free free game with no IAP. Anything else compromises the ethics frame.

#### Open questions for the council

1. Is a daily-rotating bay in scope for the vertical slice, or post-launch? It changes the natural-trigger story.
2. Are we shipping with any leaderboard at all? My default is no; if yes, seasonal-and-opt-in is the only version I'd sign off.
3. What's the monetisation model? Paid, free-with-ads, free-with-IAP. The ethics perimeter survives the first two cleanly; the third needs explicit council justification.
4. Does the moon/lunar fantasy get to be *literal* (real-world moon phase drives the game) or *abstracted* (in-game moon cycle on its own clock)? Literal is more magical and gives free natural triggers; abstracted is more accessible to players who pick up the game irregularly.
5. Is there an "endless tide" mode planned? If yes, I want to vet the session-length cues before it's built.

---

### A4. ux-designer

#### Take

*Tide / Pull* lives or dies on the fidelity of one feedback loop: the moment a player presses, the water has to *answer*. That answer is the entire UX. With no text, no HUD, and a soft failure model, every piece of communication — intent, strength, timing, goal, hazard, success — has to ride on motion, colour, and shape. The good news is that the moon-and-tide metaphor is one of the cleanest visual contracts in the medium: gravity is legible because we already know it. The risk is that "gentle" gets mistaken for "low-contrast" and the bay reads as a pretty soup. The craft challenge is to keep the surface calm while making every interactive element unmistakable at a glance, on any screen, for any eye.

#### Observations

- **Greenfield — no code yet.** No `docs/specs/`, no scenes, no theme tokens to critique. Reasoning is from the premise. The first concrete UX artefact the team needs is a *motion-and-colour bible* before a single shader is written, because retrofitting readability into a fluid sim is brutal.
- **Cursor identity is load-bearing.** The cursor is both the moon (narrative anchor) and the pull-vector origin (functional). On desktop the OS cursor must be hidden and replaced; on touch the finger occludes the very thing it's controlling. This is a Fitts's-Law-meets-occlusion problem: the pull origin needs an offset indicator so the player can see *where* gravity is pulling without lifting their finger.
- **"How hard, how long" is invisible by default.** Press-and-hold has two hidden state variables — strength ramp and snap-back timer. Without a readout, players will mash. NN/g's *visibility of system status* heuristic applies directly. A subtle radial halo around the cursor (growing with hold duration) plus a tension ring on the water's edge would carry both without HUD chrome.
- **Top-down water + floating objects is a contrast trap.** Boats, debris, swimmers, fire — all sit on a surface that is itself animating in hue and luminance. WCAG 1.4.11 (non-text contrast 3:1) is the floor for any interactive object against the *worst-case* tile of water it can sit on, not the average. Drop-shadows or rim-light on floating objects are non-negotiable.
- **No-text goal communication needs a vocabulary, not a one-off.** Six levels with six different goals (harbour a boat, drown a fire, deliver flotsam, save a swimmer…) means six icons or six shape-languages, all readable in the first 1.5 seconds. *Spilled!* gets away with a single goal type; we won't.

#### Recommendations

- **[P1] Motion-and-colour bible before code** — Lock pull-feedback timings (press response ≤100ms, strength ramp 200–400ms, snap-back 400–800ms with ease-out), a five-stop water-depth palette tested for deuteranopia/protanopia/tritanopia, and a shape-language for goal vs. hazard vs. neutral floaters. Cite Material motion + HIG. — cost: M
- **[P1] Cursor = moon, with an offset reticle** — The moon glyph is the brand; a thin reticle 16–24px below-left of the touch point shows the actual pull origin so the finger never blocks it. Desktop hides OS cursor. — cost: S
- **[P1] Tension feedback on two surfaces** — Cursor halo grows with hold strength; the water's pulled crest gets a brightening rim. Two redundant channels so colour-blind players still read intent. — cost: S
- **[P2] Goal-shape vocabulary** — Harbour = inset arc, fire = pulsing warm disc, swimmer = upright oval with motion line, beachcomber = static triangle on sand. Shape carries meaning before colour does (WCAG 1.4.1). — cost: M
- **[P2] Audio as momentum readout** — Low-frequency rumble scales with mass of water in motion; release = exhale, not splash. Players with reduce-motion enabled lean on audio harder. — cost: M
- **[P2] Reduce-motion path** — Snap-back becomes a crossfade rather than a wave; ambient water idle stops. Required for WCAG 2.3.3 and respectful of vestibular issues. — cost: S
- **[P3] Resolution and aspect** — 16:10 letterboxed in browser, internal render at 1280×800 upscaled, 60fps target. Mobile-portrait deferred — different composition problem entirely. — cost: S

#### Tensions

- **Gentle vs. legible.** Habit-formation will (rightly) push for a soft, low-stakes palette; I will push back when "soft" means "boat and water are both 70% lightness". Gentleness is in *motion and audio*, not in flattening contrast.
- **Goal clarity vs. minimalism.** Storyboarder may want unspoken, discovered goals. I want the player to know what success looks like within ~1.5s of level start. We can compromise with a brief "intent beat" — the goal object animates once on level entry — but I won't give up on it.
- **One-button purity vs. modifier creep.** Gamification will be tempted to add a double-tap or long-hold variant by level 4 to fight redundancy. I'd rather we vary *level geometry and object behaviour* than overload the button. One button means one button.
- **Tech-lead's fluid sim choice will constrain my motion language.** A coarse cellular automaton has a particular visual signature (blocky, stepped). If we go that route, the art direction has to *embrace* the grid (think *Captain of Industry* water or pixel-art tides), not fight it.

#### Open questions for the council

1. Input target — desktop-mouse-first, touch-first, or both? Cursor design forks hard at this fork.
2. Is the moon visible *on screen* as the cursor, or is the cursor a pull-point and the moon is implied above the bay?
3. Do we ever show text (level number, "tap to start")? If yes, what typeface family — and does it appear in-world or as a frame around the bay?
4. How does the level-reset transition look? "Gentle but clear" failure is a 2-second motion piece I'd like to design before we lock the fail state.
5. Are creatures (later levels) characters with faces, or silhouettes? This decides whether we need an animation rig or just motion-tweened sprites — and whether "save the swimmer" reads as rescue or as physics puzzle.
6. Colour-blind mode — toggle, or baked-in by default? I'd argue baked-in: shape and motion carry meaning, colour is reinforcement.

---

### A5. pm

#### Take

Tide / Pull is a small game with a big technical bet hidden inside a soft palette. The whole thing lives or dies on one question: does the water *feel good* to pull? Everything else — levels, goals, art, audio — is downstream of that. As PM, my push for Round 1 is to collapse scope ruthlessly around the fluid-sim spike, treat the six levels as a *content target* rather than a *vertical-slice gate*, and define "slice complete" in terms of feel-metrics, not feature-counts. Three excellent levels beat six tepid ones; the council should consider that trade openly. Two weeks solo is enough for a *lovable prototype*, not a full slice — calling it the latter sets the dev up to fail.

#### Observations

- **No code, no design spec yet.** `docs/specs/` doesn't exist; this is pure greenfield. Sequencing matters more than usual — the first artefact written should be the tech-plan's fluid-sim spike, not level 1.
- **The riskiest bet (fluid sim) is also the longest pole.** A solo dev on a two-week clock cannot afford to discover in week 2 that cellular-automaton water doesn't feel right. This needs a hard kill-criteria gate at day 3.
- **"One-button" is a marketing hook, not a scope reducer.** Authoring six distinct levels from one verb is *more* design work than six levels from three verbs, not less. The premise undersells the level-design cost.
- **Spilled! comparison is load-bearing for positioning but not for scope.** Spilled! is gentle/cosy; Tide/Pull's hook ("a thousand wrecks") implies *consequence*. Pick a side early — cosy or arcade-skill — because the level designs diverge.
- **Failure-state design is already good (2s reset, no shame).** That's a habit-formation win and removes a whole class of polish work. Keep it.

#### Recommendations

- **[P1] Fluid-sim spike with kill-criteria — feel-test by day 3, abandon if it doesn't pass — cost: M.** Grid-based cellular automaton, single bay, no goals yet. Acceptance: a tester can pull water and *want to keep doing it* for 60 seconds with no objective.
- **[P1] Lock slice scope to THREE levels, not six — cost: S (scope decision).** Three distinct verbs of goal (guide, extinguish, deliver). Six is content target for v1.0, not the slice.
- **[P1] Define "slice complete" as a 3-minute playable loop with audio + soft palette + reset flow — cost: M.** Measurable: a stranger plays unprompted for ≥3 minutes on first sit.
- **[P2] Level editor (internal, not shipped) — cost: M.** Authoring levels in code will burn the back half of week 2. A 2-hour JSON-driven level loader pays for itself.
- **[P2] One ambient track + 4 SFX (pull-loop, release-whoosh, success, reset) — cost: S.** Audio is 40% of "feel"; budget it.
- **[P3] Creatures, beachcomber, swimmer-rescue — cost: L.** Defer to post-slice. These are v1.0 content.
- **[P3] Mobile/touch input — cost: M.** Browser game on Windows is the slice target. Don't dual-target yet.

#### Tensions

- I expect the **gamification-designer** to want more verbs / juice in the slice. I'll resist — the slice's job is to prove feel, not depth.
- I expect the **storyboarder** to want the swimmer-rescue and beachcomber in the slice for emotional arc. I'll resist for the same reason — defer to v1.0.
- I expect **tech-lead** to push back on the day-3 kill gate as too tight. I'll hold the line: if the sim doesn't feel good in 3 days of focused work, it won't feel good in 10. Pivot to a different sim approach (SPH-lite, height-field) rather than grinding.
- The **product-strategist** may want stronger Spilled! differentiation in the slice itself. My view: differentiation is a *positioning* problem, not a *slice* problem. Solve it in trailer/copy, not in week 2.

#### Open questions for the council

1. **Cosy or arcade-skill?** The premise straddles. Pick one before level 2 is designed.
2. **Is "a thousand wrecks" literal or flavour?** If literal, the sim must support persistent debris — that's a different tech bet.
3. **Kill-criteria for the fluid sim:** what's the second-choice approach if cellular-automaton fails the day-3 feel test?
4. **Three vs six levels for the slice** — does the council back the scope cut, or does six stay?
5. **Acceptance criteria draft (Gherkin) for slice-complete:** Given a fresh browser load, when the player presses-and-holds anywhere on the bay, then water visibly accumulates toward the cursor within 200ms. Given water has accumulated, when the player releases, then water rushes back with visible momentum and audible whoosh. Given a level goal, when the goal is achieved, then a soft success cue plays and the next level loads within 2s. Given a level fail-state, when failure is detected, then the level resets within 2s with no death animation or shame copy. Given a stranger plays unprompted, when 3 minutes elapse, then the stranger is still playing voluntarily.

---

### A6. product-strategist

#### Take

*Tide / Pull* is not *Spilled!* and the council should stop letting *Spilled!* set the frame. *Spilled!* is a one-hour cosy janitorial loop with a boat as cursor; *Tide / Pull* is a one-screen arcade puzzle where **the player is the force, not the actor**. That inversion — "you're the moon, your input *is* the physics" — is a real wedge if the team commits to it as a design constraint, not a marketing line. The audience is not the *Spilled!* cosy crowd; it's the *Downwell* / *Mini Motorways* / *Chants of Sennaar* "elegant single-verb" crowd that overlaps with itch.io physics-toy connoisseurs and r/IndieDev clip-watchers. The risk is splitting the difference: a soft palette and "gentle failure" pull toward cosy, but the verb (*pull, release, watch wreckage*) is closer to *Katamari* or *World of Goo* than to *Unpacking*. Pick one tribe in the wedge; let the other be a bonus.

#### Observations

- ***Spilled!* (Lente, March 2025, Steam) is a ~1-hour cosy cleanup with 8 progressively-larger areas and an upgrade loop.** It owns the "tiny relaxing boat + water" position. Trying to out-cosy it is a losing fight. The *Tide / Pull* premise's failure-state framing ("level resets in 2 seconds, no shame") is borrowed cosy-genre language and may be miscued for an arcade puzzle.
- **The "one-button" Steam tag is thin and uncompetitive at the top end.** *Downwell* still anchors it; recent entrants like *ONE BUTTON RUN* are low-signal. This is a category where a well-presented entry can rank, especially cross-listed with Physics, Puzzle, and Relaxing. That's a real distribution wedge.
- **The strongest comparable the premise *didn't* name is *World of Goo* / *Where's My Water?* / *Pikuniku* — physics puzzles with a single expressive verb.** Framing *Tide / Pull* in that lineage rather than the *Spilled!* lineage gives it a clearer shelf.
- **"You're the moon" is currently cosmetic.** Nothing in the mechanic description requires the moon framing — it would read identically as "magnet" or "vortex". If the moon is the wedge, the moon needs to *do something* the magnet can't: a day/night cycle that constrains pull strength, multiple moons (co-op), eclipses as level modifiers, gravitational falloff that the player feels. Otherwise drop the moon and call it what it is.
- **The category I'd try to name: "input-as-physics" or "force puzzler".** Adjacent to but distinct from cosy. Tags to claim on Steam: *Physics*, *Puzzle*, *Singleplayer*, *Relaxing*, *Minimalist*, *Casual*, *2D*. Skip *Cozy* — it brings the wrong reviewers.

#### Recommendations

- **[P1] Commit to "force puzzler", not "cosy water game" — rationale: *Spilled!* owns cosy-water; the wedge is the inverted player role, not the palette — cost: M** (mostly marketing-copy and screenshot direction; mechanics are already there).
- **[P1] Make the moon load-bearing — rationale: if the framing is just skin, a competitor reskins it in a weekend; tie pull strength or radius to a visible lunar phase or position so the fiction *is* the constraint — cost: M.**
- **[P2] Reframe the six levels as *six verbs the same button can do* (guide, douse, deliver, rescue, sink, gather) — rationale: solves the redundancy risk by making each level a category demo, not a difficulty tick — cost: S.**
- **[P2] Plan one post-slice expansion vector publicly: daily challenge with deterministic seed — rationale: 30-second clips of "today's bay" is the TikTok/Bluesky distribution loop one-button games actually win on; level editor and mobile port are larger bets to defer — cost: M.**
- **[P3] Rename. *Tide / Pull* is fine internally but search-collides with tides, pull-requests, and fitness apps — rationale: the storefront-search and clip-discoverability cost compounds — cost: L** (rename is always L; flagging not insisting).

#### Tensions

- I expect *habit-formation* to defend the "gentle failure, no shame" framing on ethics grounds; I agree ethically but worry it drags the *positioning* toward cosy where we lose. These are separable: keep the gentle failure, drop the cosy *marketing*.
- I expect *gamification-designer* to want juice and feedback that sells the physics; I'll back that — the wedge dies without it.
- I expect *pm* to push back on the rename and on "make the moon load-bearing" as scope creep into the slice. Fair. The moon-as-constraint can be a single line of code (pull strength = f(phase)) and still earn its keep.
- I expect *tech-lead* to flag that committing to "input *is* the physics" raises the floor on fluid-sim quality. Correct. The wedge and the riskiest tech bet are the same bet.

#### Open questions for the council

1. Is the moon framing load-bearing or cosmetic? If cosmetic, drop it; if load-bearing, what's the one mechanic that requires it?
2. Which tribe are we courting in the slice's launch trailer — *Downwell* mastery players, *Spilled!* cosy players, or itch.io physics-toy tinkerers? Pick one for the trailer; the others can find us later.
3. Are we shipping to Steam, itch.io, or web-first? The category positioning differs sharply across those three storefronts.
4. Is there appetite for a daily-challenge mode in the slice (small now, defines the long-term shape) or is that strictly post-slice?
5. Does the team accept that "no dark patterns" rules out streaks on the daily challenge? (I think yes; want it documented.)

---

## Appendix B: Organised Findings (synthesis after Round 1)

### Recurring themes (where ≥ 2 specialists converged)

1. **The fluid sim is the whole game.** All four of `gamification-designer`, `pm`, `ux-designer`, and `product-strategist` made the same argument from different angles: feel of water comes first, everything is downstream. PM proposes a hard day-3 kill gate; gamification calls it "build the toy before the level"; UX wants a motion-and-colour bible before a shader is written; strategist notes the wedge and the riskiest tech bet are the same bet.

2. ***Spilled!* is the wrong frame; differentiate now.** `product-strategist` ("stop letting *Spilled!* set the frame"), `storyboarder` ("*Spilled!* is intimate; *Tide / Pull* should be cosmic-intimate"), `gamification-designer` ("force you barely control, the moon as a gentle but unsubtle god"). Three specialists agree the cosy/Spilled-adjacent positioning leaves us in someone else's house.

3. **The moon must be load-bearing, not cosmetic.** `storyboarder`, `gamification-designer`, `ux-designer`, and `product-strategist` all flagged this. Strategist puts it bluntly: "Nothing in the mechanic description requires the moon framing — it would read identically as 'magnet' or 'vortex'." Storyboarder wants a moonrise opening beat; UX wants the cursor *to be* the moon; strategist wants pull strength tied to lunar phase or position.

4. **Depth comes from new *receivers*, not new inputs.** `gamification-designer` ("one new water-receiver per level: boat, fire, swimmer, flotsam, creature, weather"), `product-strategist` ("six verbs the same button can do — guide, douse, deliver, rescue, sink, gather"), `storyboarder` ("level 4 inverts the verb — push, don't pull, near a nesting bird"). All three solve the levels-4–5-redundancy risk by varying *what the water touches*, not *how the button works*.

5. **The release is the payoff, not the press.** `gamification-designer` explicit; `ux-designer`'s audio-as-momentum readout aligns; `storyboarder`'s "held success moments" aligns. Spend juice on the rush-back, not the wind-up.

6. **Defer extrinsic motivation.** `habit-formation` (no streaks, no leaderboards by default), `gamification-designer` ("defer scoring/stars/medals until after the toy works"), `pm` (P3 deferral). Three specialists agree XP/stars/medals are post-slice or never.

7. **Sandbox / free-pull mode pulls weight.** `habit-formation` (P1, autonomy support), `gamification-designer` ("build the toy"), `storyboarder` ("level 0 — a no-goal sandbox"). Same idea, three names.

### Tensions (where specialists conflicted)

1. **Cosy vs arcade-skill positioning.** PM names it directly: "the premise straddles, pick one before level 2." Strategist insists "force puzzler, not cosy". Habit-formation defends the gentle-failure framing on ethics grounds. Storyboarder's "cosmic-intimate" sits between but leans cosmic. Strategist offers a clean compromise: keep gentle failure, drop the cosy *marketing*.

2. **Three levels vs six for the slice.** PM wants three excellent levels in two solo weeks; the others have not weighed in directly, but gamification's "build the toy first" tilts in PM's direction. Storyboarder's "Six Nights Over One Bay" arc presupposes six. Live disagreement.

3. **Hard-reset failure (premise) vs soft-drift.** Premise specifies a 2-second hard reset. Habit-formation explicitly endorses it ("textbook self-determination-theory-friendly"). Gamification-designer pushes back: "reset-in-2-seconds erases the loop's tension entirely … failure doesn't reset, the water just keeps sloshing." Real tension between flow stakes and no-punishment ethics.

4. **"One button" vs "one button + pointer aim".** Gamification-designer flags this honestly: cursor position is a second input the premise glosses over. UX treats cursor design as load-bearing. Strategist treats "one button" as the brand promise. Tension between marketing line and design honesty.

5. **Bay continuity.** Storyboarder argues hard for *one persistent bay across six nights* with callbacks (the boat from level 1 in level 6's harbour). Nobody else weighed in; PM may flag scope.

6. **Goal communication: discovered vs always-clear.** Storyboarder's kishōtenketsu approach implies discovery; UX requires the player to know what success looks like within ~1.5s of level start. UX offers a compromise: "intent beat" — goal animates once on level entry.

7. **Meta-meta loop shape.** Gamification wants a coastline-map meta where each cleared bay paints a stretch of shore. Habit-formation wants lunar-phase bay states and opt-in seasonal events but no progression counter. Both are "natural re-engagement", but they're different shapes.

### Blind spots (orchestrator)

1. **Audio direction has no owner.** UX touched the audio surface; storyboarder asked about failure sound and ambient track evolution; PM budgeted four SFX. But no one took *ownership* of audio as a primary identity vector. For a one-button game with no UI chrome, audio is probably half the feel.

2. **"Guide a boat to harbour" hides AI/pathfinding work.** Boats drifting passively on water momentum vs steered with a rudder are different tech bets and design languages.

3. **Clip-friendliness is named as a risk but not as a positive design constraint.** Habit-formation flags it as a vanity-metric vector. Strategist names it as positioning. Nobody designed *for* a 12-second self-contained clip.

4. **On-screen text policy is undecided and crosscutting.** UX raised it as an open question. Affects localisation (cheap-or-free if no text), tutorial design, and the moonrise/intent-beat language.

5. **Lunar-cycle bay states (habit-formation P1) and coastline meta-loop (gamification P2) both imply the slice ships into a long-term shape that doesn't exist yet.** Risk: slice ships, hits a positioning wall, post-slice work is a whole second project.

### Open questions for the user (resolved at checkpoint #1)

1. Cosy or arcade-skill? — **Cosy.**
2. Is the moon load-bearing or cosmetic? — **Load-bearing.**
3. Three levels or six in the vertical slice? — **Three.**
4. Hard-reset failure or soft-drift? — **Soft-drift.**
5. Lunar / daily-rotating bay in scope for the slice, or strictly post-slice? — **Lunar in scope.**
6. Storefront target — Steam, itch.io, or web-first? — **Steam (mild preference).**

---

## Appendix C: Round 2 critiques

### C1. storyboarder

#### Where I concede

**PM is right that three swimmer-rescue/beachcomber/creature receivers cannot coexist in a three-level slice.** I conceded too slowly in Round 1. With three levels and the user's "lunar bay state IS in scope" call, the slice's narrative budget is already spent on two things: making the moon feel load-bearing, and making the bay feel persistent across nights. Adding three character-receivers on top is greedy — the arc gets diluted, none of them earn their faces. I drop the swimmer and beachcomber from the slice. They become the post-slice expansion arc the strategist hinted at.

**UX's "intent beat" is the right compromise and I was wrong to push for fully-discovered goals.** A cosy game does not punish confusion, and a player who cannot find the goal on a single screen is not having a contemplative experience — they're squinting. Goal animates once on entry, then sits quiet. The discovery I was protecting can live in *what the goal becomes after you solve it* (the wreck remains, the fire's smoke lingers), not in the goal itself.

**Strategist's "force puzzler not cosy" is overruled by the user, and good — but their wedge insight survives.** The moon being load-bearing means the *cosmic* register is mandate, not flavour. Cosy + cosmic-intimate is the tone: think *A Short Hike* meets *Mountain* meets a Studio Ghibli night sky. Not *Spilled!*. I had the tone half-right in Round 1; strategist sharpened it.

**Audio direction is not mine to claim.** UX already framed audio as a momentum readout (rumble scales with mass, release = exhale not splash) — that is the right home. I will contribute beat-level audio cues (the sigh on a successful release, the hush when the moon dips at session-end), not the system.

#### Where I hold the line

**Bay continuity across the three nights is non-negotiable now that the user picked lunar.** The user's call gave me the engine I was asking for in Round 1 for free. Three nights, one bay, three moon phases. The bay you leave at the end of night one is the bay you find at the start of night two. This is the difference between "three levels" and "a story you tell a friend".

**Kishōtenketsu compresses to three cleanly, with the twist living in the third beat.** Four-act Japanese narrative is *ki* (introduction), *shō* (development), *ten* (twist/turn), *ketsu* (resolution). For three levels the cleanest mapping is:
- **Night 1 — *ki + shō* fused.** Crescent moon, weak pull. Goal: gentle (guide a small boat to harbour). Player learns the verb. The bay is calm.
- **Night 2 — *ten* (the twist).** Full moon, strong pull. Goal inverts: you must *not* pull too hard — something fragile (a fire on the shore that mustn't be doused too fast, or flotsam that mustn't be smashed on the rocks). The moon being stronger *is* the twist; it makes the player feel the lunar phase in their hands. This is the moment the moon stops being cosmetic.
- **Night 3 — *ketsu*.** Waning, soft. The bay shows wear from nights 1–2 (the wreck from night 1 is still there; ash from night 2 lingers on the water). Goal: a quiet act of return — gather the drifted flotsam back to where it belongs. The player ends gentler than they started.

The "twist beat" does not need to live in a fourth post-slice level. It lives in night 2's *inversion of the verb's meaning* — same button, opposite intent. That is genuine kishōtenketsu and it fits in three.

**The release is still where the storytelling happens, not the press.** Gamification was right and I am repeating it: every emotional beat in the three nights lands on a let-go, not a hold. The boat reaches harbour on a release. The fire steadies on a release. The flotsam settles on a release. This is the moon's grammar — gravity is not a thing you press, it is a thing you stop holding.

**One persistent moon glyph cursor across all three nights, visibly phasing.** UX's offset-reticle moon cursor + the user's lunar mandate = the moon is literally on screen, in the player's hand, changing shape across the three nights. This is the load-bearing moon the strategist demanded, expressed as a single visual decision. No extra mechanics needed.

#### Revised recommendations

- **[P1] Three nights, one bay, three moon phases — kishōtenketsu compressed.** Night 1 calm/crescent/guide; night 2 twist/full/restraint; night 3 soft/waning/return. Bay state persists across nights. Cost: M.
- **[P1] The release carries the emotional beat in every level.** Cost: S (a discipline, not a feature).
- **[P1] Moon-glyph cursor that phases across the three nights.** Cost: S.
- **[P2] Accept UX's intent beat — goal animates once on entry, then quiets.** Cost: S.
- **[P2] Night-2 verb inversion is the kishōtenketsu twist.** Cost: M.
- **[P2] Opening 3-second title card per night — moon phase + one line of bay flavour.** Cost: S.
- **[P3] Concede the swimmer / beachcomber / creature receivers to post-slice.** Cost: S to defer, L to build later — not a slice cost.
- **[P3] Session-end fade — after the third night's release, the moon dips below the bay's horizon and the ambient resolves.** Cost: S.

#### Tensions remaining

- The "one persistent bay" decision now interacts with PM's level-editor recommendation — the loader needs a delta layer (per-night overlays on a base bay), not three independent JSON files.
- Cosy + cosmic-intimate is a tone neither *Spilled!* nor *Downwell* gives us a reference for. Closest comparables I would actually name in a pitch: *A Short Hike*, *Mountain*, *Sable*'s opening, the night sequences of *Journey*.

---

### C2. gamification-designer

#### Where I concede

**Coastline meta-meta is dead; lunar replaces it cleanly.** Habit-formation's lunar-cycle bay states are a stronger meta-meta than my coastline map for three reasons I underweighted in Round 1: (a) the calendar is doing retention work the world already provides, so we don't have to fabricate progression; (b) lunar phase is the *visible signifier* of the moon mandate the user just locked in — the moon stops being cosmetic the instant it's also the meta-loop's clock; (c) coastline-as-map implies completionism and a "filled in" end-state, which fights the cosy framing. I withdraw coastline as a structure. I'd like to fold one piece of it forward — see Recommendations.

**"Force you barely control" tonal framing — softened, not dropped.** With cosy chosen, my Round 1 phrasing reads too aggressive. The shape I actually wanted is *high-inertia, high-readability*: water has weight and lag, but the player never feels punished for it. *Where's My Water?* is the right comparable here, not *Downwell*. Cosy-physics-toy is a real category and I should have named it.

**Scoring on screen — full alignment with storyboarder.** My Round 1 said defer extrinsic motivation; storyboarder says numbers will kill cosmic-intimate. Same call, his reasoning is better. No score, no stars, no timer, no percentage-water-saved readout in the slice. The release *is* the score.

**"One new receiver per level" compresses to three.** PM's verbs (guide / extinguish / deliver) are fine but I'd swap one — see below. Three verbs is the right count.

#### Where I hold the line

**One-button + pointer-aim honesty — push, don't drop.** This still matters. "One button" as a marketing tag is fine; "one button" as a *design constraint* is being quietly violated by cursor position carrying continuous 2D information. I'm not asking the team to remove pointer aim — it's load-bearing. I'm asking us to stop calling it one-button internally and call it what it is: **one-verb, continuous-aim**.

**Release is the payoff, and that's where audio lives.** I'll claim audio ownership of the *release moment* specifically — the exhale, the rush-back, the settle. UX should own ambient bed, UI/cursor sound, and the motion-and-colour bible's audio mappings (low-freq rumble = mass). The split: UX owns the *readout* layer (continuous tension audio), I own the *event* layer (press-attack, release-payoff, goal-met chime, soft-drift sigh).

**Sandbox/free-pull mode in the slice, not deferred.** Habit-formation and synthesis both flagged this. PM put it at P3 / defer. I disagree — for a feel-first slice with a 60-second "wants to keep pulling" acceptance test, sandbox *is* the acceptance test surface. It costs almost nothing once the sim spike passes day 3 (it's a level with no goal). Promote to P1.

**Strategist's "input *is* the physics" survives the cosy pivot.** Cosy doesn't mean low-stakes-input. *Where's My Water?* is cosy-adjacent and the input-is-physics constraint is total. Adopt the constraint, drop the force-puzzler marketing frame.

#### Revised recommendations

[P1] **Three receivers, three verbs: guide, extinguish, gather.** — Swap PM's "deliver" for "gather". Order: L1 guide (boat to harbour), L2 gather (floating lanterns to shrine), L3 extinguish (beach fire). — cost: S (level design only; sim covers all three).

[P1] **Sandbox / free-pull "Level 0" — open from first run.** — cost: S.

[P1] **Lunar phase IS the meta-meta signifier.** — Visible moon glyph in corner or as cursor-state shows current phase; phase modulates pull radius/strength subtly. One persistent bay across the three levels, returned to under different phases. The *bay remembers*. — cost: M.

[P2] **Soft-drift retry path: time-based, no input required.** — When the goal drifts past failure threshold, the level doesn't reset. Camera slowly pulls back over ~3s, water keeps sloshing, a soft tone plays, and the goal-receiver fades and respawns in its starting pose. Player can keep pulling through the transition. No "retry" button. — cost: S.

[P2] **Release juice budget — I own this.** — Per-release feedback stack. — cost: M.

[P2] **Press-attack juice — paired with release.** — cost: S.

[P3] **Kishōtenketsu twist via lunar phase, not level 4.** — cost: S.

[P3] **Audio direction split documented.** — cost: S.

**Dropped from Round 1:** coastline map (lunar replaces); end-of-slice meta unlock screen (cosy + no-extrinsic kills it); any scoring overlay; "force you barely control" as tonal frame (replaced with "high-inertia, high-readability cosy physics").

---

### C3. habit-formation

#### Where I concede

- **Literal real-world lunar phase is wrong for this slice.** I asked the question in Round 1 and on reflection the answer is clear: a Steam-target, one-screen, three-level cosy slice cannot hang its meta-loop on a 29.5-day external clock the player can't see the shape of. The player who buys on a waning gibbous and plays for an hour sees one frame of an arc they don't know exists. Worse, real-lunar creates an implicit "come back tomorrow for a different bay" pressure I would otherwise ban. Abstracted in-game lunar cycle, surfaced *within a session*, is the cosy-clean version.
- **My "today's bay" framing collapses into the strategist's daily-challenge seed and I should not have implied otherwise.** They are the same surface with two different motivations. I withdraw "today's bay" as a separate idea — it was sneaking a daily-return hook in under cosy clothing. If a deterministic daily seed ships, it ships post-slice and only as a *sandbox variant*, not as a scored challenge with a leaderboard.
- **15–20 min ambient cadence was a long-term-shape number, not a slice number.** For a three-level cosy slice, a healthy first session is 8–12 minutes.
- **pm is right that slice scope dominates.** My lunar P1 must cost S inside the slice or it gets cut. Concretely: a single in-game clock variable that drives tide amplitude and palette across the three levels — not a calendar, not a real date, not anything that reads outside the session.

#### Where I hold the line

- **Lunar stays load-bearing, but as an *in-session* rhythm, not a real-world calendar.** The three levels are three nights of one abstracted cycle. The cycle resets each session unless the player chooses to continue.
- **Storyboarder's "Three Nights Over One Bay" passes if and only if the three nights are sittable in one session and resumable without penalty.** The risk they don't see is completionism pressure. Mitigation: each night is a complete beat on its own, and the bay state on resume is *exactly* where the player left it.
- **Soft-drift failure passes the 13yo filter, but only with an explicit "rest the tide" affordance.** Need a one-button "let it settle / try again" gesture that's never punished and never tracked. No "attempts" counter visible to the player. Ever.
- **Hard ethics line on the strategist's daily-challenge framing.** Deterministic daily seed is fine as a *sandbox seed*. It is not fine as a scored challenge, leaderboard, streak, or "you missed Tuesday's bay" surface.
- **Clip-friendliness can be designed for ethically.** Build the spectacle, don't build the share loop.
- **No on-screen text policy for the slice.** Goal communication via shape/colour/motion. Text invites scoring, scoring invites comparison, comparison invites streaks.

#### Ban list (slice + post-slice, hard constraint)

- No streak counter, no consecutive-days counter, no calendar grid
- No "you haven't played in X days" notification, push, email, or in-game banner
- No missed-day badge, no broken-streak recovery purchase, no make-up day
- No leaderboard, no friend comparison, no "X players solved this faster"
- No daily-challenge with score, rank, or completion record
- No attempts counter, no failure counter, no retry tally visible to the player
- No real-world date or real-lunar-phase check (in-game clock only)
- No notifications of any kind in the slice; post-slice, only opt-in seasonal events at weekly-or-lower frequency
- No infinite scroll, no endless-mode that auto-generates past the third night
- No real-money anything (no gacha, no cosmetics, no boosters)
- No social share button inside the game; clip recording is OS-level only
- No "bays played" lifetime counter, no completionist checklist, no achievement-spam
- No timed events that expire (Steam Trading Card style FOMO)

The encouraged surfaces, by contrast: in-session lunar rhythm, surprise-delight at low frequency (one ambient creature appears once per session, unscheduled), opt-in opening/closing rituals (moonrise beat, settle beat), calendar-shaped rhythms expressed inside one session.

#### Revised recommendations

- **[P1] Lunar as in-session rhythm, not real-world calendar — abstracted three-night cycle, resets each session, no date check.** Cost: S.
- **[P1] Ban list recorded in the design spec as a hard constraint.** Cost: S.
- **[P1] Soft-drift failure with explicit "let it settle" affordance, no attempts counter.** Cost: S.
- **[P1] No-text goal communication policy carried through the slice.** Cost: S.
- **[P2] Opt-in moonrise opening + settle closing ritual.** Press-to-skip available from frame one. Cost: S.
- **[P2] Design the *release* as the clip-worthy moment, not the share button.** Cost: shared with gamification/UX, marginal.
- **[P2] Healthy first-session target: 8–12 minutes for the three-level slice, with a clean exit after night three.** Cost: S.
- **[P3] Post-slice daily seed as *sandbox variant only*.** Cost: M (post-slice).
- **[P3] Persistent bay across nights (storyboarder) is good *if and only if* it doesn't read as a completionist checklist.** Cost: shared, marginal.

#### Open question for consolidation

If the three nights are designed kishōtenketsu (one complete beat each), is the player allowed to play night two without playing night one? My instinct says yes — gating creates the completionism pressure I'm trying to ban. But that may push back on storyboarder's callback structure.

---

### C4. ux-designer

#### Where I concede

- **Storyboarder's "Six Nights Over One Bay" beats my goal-vocabulary sprawl.** I came into Round 1 thinking in six receiver shapes. With three levels confirmed and one persistent bay, my taxonomy was over-engineered.
- **Gamification's "build the toy before the level" supersedes my rush to define UI chrome.** If the toy doesn't feel hypnotic at zero-UI, no amount of composition saves it. UI chrome moves later.
- **PM's "stranger plays ≥3min" acceptance criterion is a better usability bar than my Hick/Fitts checklist.** The stranger-test is sharper.
- **Habit-formation is right that "streams and clips well" is the dark-pattern vector.** I withdraw any recommendation that the HUD optimise for streamability.
- **Product-strategist's moon-as-constraint (pull radius tied to lunar phase) makes my cursor visual easier, not harder.**

#### Where I hold the line

- **Cursor IS the moon, and it must be a *visual body*, not a reticle.** Three lunar-phase variants for the slice:
  - **Waxing crescent** — small cursor disc (~24px), warm-cream fill, thin pull-radius ring at ~80px. Pull strength ~0.7×. Reads as "gentle".
  - **Full moon** — larger disc (~32px), cool-white fill with faint halo, pull-radius ring at ~140px. Pull strength 1.0×. Reads as "potent".
  - **Waning gibbous** — disc (~28px), silvered fill with shadow on the trailing edge, pull-radius ring at ~110px. Pull strength ~0.85×. Reads as "thoughtful".
  The phase shadow rotates with cursor velocity by a few degrees. OS cursor hidden during play.
- **Soft-drift failure needs a visual retry trigger that isn't a button.** Proposal: when goal-state drifts past threshold, the camera eases out ~10% over 1.2s, ambient track ducks 4dB, moon-cursor dims to ~60% opacity. *Press-and-hold anywhere* re-engages. No modal, no button, no "RETRY?" text. The press-hold gesture *is* the retry. Reduce-motion path: skip the camera ease, do the dim and duck only.
- **Audio direction — I claim it.** Sketch: one ambient bed (slow strings + field recording, –18 LUFS); pull-loop (sub-bass + filter opening as hold lengthens, max ~2.5s ramp); release-whoosh (broadband noise burst, low-shelf rumble, 180–250ms); soft-drift cue (ambient ducks 4dB, low-pass sweeps in over 800ms — *that* is the failure signal, not a sting); success-swell (ambient warms a third up, single bell, 1.2s tail). Five sounds total. Fits PM's "1 ambient + 4 SFX" budget exactly.
- **On-screen text policy — minimal, diegetic, skippable.** No tutorial text. Goal communicated by *what's animated* in the first 1.5s after camera settles. One concession: a 3s lunar-phase title card on session start. Skip on any input.
- **Moonrise 10s no-input beat — accept on first session, hard-cap to 2s on returns.** Subsequent launches play a 2s abridged version; any input skips immediately.
- **Clip render — 16:9, 1920×1080 native, moon-cursor in-frame.** Cursor must render *into* the captured frame (not as an OS overlay) — Pixi draws the cursor sprite, not CSS.
- **Reduce-motion is a different failure model, not a stripped one.** With reduce-motion on: no camera ease, no parallax, no particle spray on release. For reduce-motion users I want a substituted visual — a single concentric ring expanding from release point, 400ms, no displacement. Different aesthetic, same readability.

#### Revised recommendations

- **[P1] Moon-cursor as character, three lunar variants** — load-bearing decision demands a visible body, not a reticle; phase ties to bay state in slice. Cost: S.
- **[P1] Soft-drift retry as press-and-hold-anywhere** — no modal, no button; the gesture is the retry; reduce-motion variant defined. Cost: S.
- **[P1] Audio palette — 1 ambient + 4 SFX** — claiming the blind spot; release-whoosh and soft-drift duck are the load-bearing cues. Cost: M.
- **[P1] On-screen text: zero tutorial, one 3s title card, skip-on-input** — fits the 2-week budget. Cost: S.
- **[P1] 16:9 playfield with in-frame cursor sprite** — Pixi-drawn, not OS cursor; safe margins for clip capture. Cost: S.
- **[P2] Moonrise: 10s first-launch, 2s thereafter, always skippable** — honours storyboarder's beat without punishing returning players. Cost: S.
- **[P2] Reduce-motion path with substituted release visual** — concentric ring instead of particle spray; audio carries the rest. Cost: S.
- **[P2] Goal communication via "what's animated in the first 1.5s"** — boat drifts, lantern flickers, bottle bobs; intent-beat replaces text. Cost: S.
- **[P3] WCAG 2.2 contrast pass on the soft palette** — soft palettes routinely fail 4.5:1 against water; audit before lock. Cost: S.
- **[P3] Cursor-trail at low opacity for clip legibility** — 6-frame fading trail so moon path reads in compressed video; toggleable. Cost: S.

---

### C5. pm

#### Where I concede

**Lunar bay state belongs in the slice.** The user overruled me, and habit-formation's argument is right: the moon framing is the meta-meta loop and the natural calendar already does the retention work no streak counter could ethically do. I conceded the wrong thing in Round 1.

**Moon must be load-bearing as a mechanic, not a skin.** Strategist was right and I underweighted it.

**Persistent bay across three levels (storyboarder).** Same bay, three nights — cheaper than three bespoke bays, gives narrative callback for free, and reinforces the lunar frame.

**Rename concern (strategist).** "Tide / Pull" search-collides on Steam. Concede the risk exists, but defer the action — naming is a Phase-2-end decision.

**Audio scope was undercooked.** UX is right that audio is the momentum readout. 4 SFX + 1 ambient won't carry soft-drift retry, held-success swells, and lunar-phase ambient differentiation. Concede — needs to grow.

**Soft-drift doesn't cleanly fit "extinguish".** Gamification's "new receivers per level" is a better frame than my fixed three goals.

#### Where I hold the line

**Two weeks solo is not enough for everything now in scope.** Cut required. The Day-3 fluid-sim kill gate stands, and now must include "pull strength varies with lunar phase" as a pass criterion.

**Sandbox/free-pull mode is IN — but as a side-effect, not a feature.** Expose it as the title screen background and a "free play" entry from the menu. Cost: S.

**Moonrise opening beat: defer to post-slice.** 10s no-input intro is lovely but is polish, not slice-defining. Cut.

**Three nights, three phases, linear order.** No level select in slice. Linear keeps onboarding clean and lets storyboarder's kishōtenketsu land on Night 3.

**Goals revised: guide, gather, settle** — all gradient-friendly, all soft-drift-compatible. Drop "extinguish" (binary failure model fights soft-drift). Drop "deliver" as a separate verb — it folds into "guide".

#### Revised recommendations

**The load-bearing-moon mechanic — pick one:**
- *Candidate A:* Pull strength + radius scale with lunar phase. Same input, different physics per night. Cheap, legible, forces replay variance. **PICK THIS.**
- *Candidate B:* Multiple phantom moons on full-moon night. Cool but doubles input-handling complexity and breaks "one button + pointer". Reject.

**Cuts to make two weeks fit:**
- Cut moonrise intro (defer).
- Cut creature life independent of goals (defer).
- Cut seasonal weather (defer).
- Cut reduce-motion path to a single global toggle (not per-effect).
- Cut goal-shape vocabulary to two shapes (goal vs neutral); hazards out of slice.

**Priority list:**

- [P1] Day-3 fluid-sim spike + lunar-phase parameterisation kill gate — cost S
- [P1] Moon = pull-strength/radius scaled by phase (load-bearing mechanic) — cost M
- [P1] One persistent bay, three nights, linear progression — cost M
- [P1] Three goals: guide (boat to harbour), gather (flotsam to shore), settle (lanterns drift to rest) — cost M
- [P1] Soft-drift failure with player-initiated retry — cost S
- [P1] Motion-and-colour bible before shader (UX) — cost M
- [P1] Cursor = moon glyph + offset reticle — cost S
- [P1] Audio scope expanded: 6 SFX + 3 ambient stems (one per phase) + release swell — cost M
- [P2] Sandbox as title-screen toy + menu entry — cost S
- [P2] Persistent bay callback (Night 3 shows Night 1+2 results) — cost S
- [P2] "Tonight's tide" 3s opt-in title card — cost S
- [P3] Rename decision — defer to end of Phase 2 — cost S

#### Top 5 risks (likelihood × impact)

1. Fluid sim doesn't parameterise cleanly for lunar variation — high × high. Day-3 gate.
2. Two-week scope overruns — high × high. Cuts above are the mitigation.
3. "Cosy" reads as "low-contrast / unreadable" — medium × high. UX bible mitigates.
4. Three goals feel samey because mechanic is one — medium × medium. Receiver-per-level mitigates.
5. Audio underscoped, release moment falls flat — medium × high. Expanded audio budget mitigates.

---

### C6. product-strategist

#### Where I concede

**Cosy framing was the right call, and my "force puzzler" was wrong for this premise.** Looking at the cosy-tag flood on Steam in 2025, my reflex was to dodge a saturated tag. But saturation cuts both ways: cosy is also where the wishlist behaviour lives, the curators are organised, and the discovery surface is real. *Townscaper* (95% positive, ~10.5k reviews) is the proof point. I was solving for the wrong shelf.

**Habit-formation's "today's bay" beats my "daily challenge".** Their framing is strictly better. "Daily challenge" imports a streak/leaderboard mental model that breaks the cosy contract; "today's bay" imports a *weather report* mental model that fits cosy-cosmic-intimate.

**PM is mostly right that "differentiation lives in the trailer".** I overshot in Round 1 by implying the slice itself had to ship the wedge. The honest position: differentiation is *expressed* in the trailer/copy, but it has to be *visible* somewhere in the slice or the trailer is a lie.

**Spilled! is the wrong comparable.** *Where's My Water?* is closer, but it's not the ceiling. The truer lineage cluster is *Where's My Water?* (physics-puzzle DNA) + *Townscaper* (one-toy cosy minimalism) + *A Building Full of Cats* (cosy + low-stakes + screenshot-legible). That's the wedge triangle.

#### Where I hold the line

**The wedge sentence (for the Steam page short description):**
> *"You are the moon. Hold to pull the tide; let go to watch it rush home. A cosy one-screen physics toy where the bay changes with tonight's phase."*

**Updated Steam tag stack:**
Primary: `Cozy`, `Physics`, `Relaxing`, `Minimalist`, `Atmospheric`, `Casual`. Secondary: `Singleplayer`, `Short`, `2D`, `Top-Down`, `Cute`, `Wholesome`. Avoid: `Puzzle` as primary; `Indie` as a marketing tag.

**Soft-drift failure is a positioning asset, not a mechanical compromise.** Hard-reset is arcade grammar; soft-drift is *weather* grammar.

**Persistent single bay across three nights — strategically worth it.** A named bay is a wishlist magnet — "I want to come back to *that bay*" — in a way "Level 2" is not.

**Title rename is still required.** "Tide / Pull" is unsearchable on Steam.

**Trailer / first-30s shape:**
- 0–3s: Black. A single sustained note. Title card fades up over a still bay.
- 3–8s: Moonrise. No input. Camera holds. Water glints.
- 8–14s: Cursor appears as a moon glyph. First press-and-hold. Water *lifts* toward it. Held beat.
- 14–18s: Release. Water rushes back. Soft chime as the goal is met.
- 18–24s: Cut to night two — same bay, different phase, different palette tint. The hook lands here.
- 24–30s: Three-up of "tonight's bay" framing across phases. Wishlist call to action.

**Long-term shape (post-slice wedge):** The slice is the *first three nights of one bay*. The post-slice game is *more bays, full lunar cycle, seasonal variants* — a Bays-and-Phases gallery, not a level grid. The visible-in-slice tell: a "bay select" menu with one bay shown and silhouettes of two more locked, OR the lunar-phase indicator showing the slice is night 3 of 28.

#### Revised recommendations

- **[P1] Adopt "today's bay" framing site-wide** — Cost: S.
- **[P1] Lock the wedge sentence as Steam short-description** — Cost: S.
- **[P1] Rename before any commit** — Steam search test, no slash, two-syllable lunar shape. Cost: S (decision) / M (if branding/logo work follows).
- **[P1] Persistent single bay across the three nights** — Cost: S–M.
- **[P1] Trailer-shape document before week 2** — Cost: S.
- **[P2] Visible "future bay" tell in the slice** — Cost: S.
- **[P2] Steam tag stack locked** — Cost: S.
- **[P2] Curator outreach list** — Cost: S.
- **[P3] Wordless screenshot policy** — Cost: S.
- **[P3] Defer mobile, defer community share, defer bays gallery** — Cost: $0 to defer.

---

## Appendix D: Draft Consensus

### Converged recommendations

1. **Three nights, one persistent bay, three lunar phases — abstracted in-game cycle, NOT real-world calendar.** Bay state carries across nights. Resets each session unless the player chooses to continue.
2. **Moon load-bearing as pull strength + radius scaled by lunar phase.**
3. **Cursor IS the moon — visible body, three lunar variants** (waxing crescent ~24px warm-cream 0.7× pull; full moon ~32px cool-white halo 1.0× pull ~140px radius; waning gibbous ~28px silvered shadow 0.85× pull).
4. **Three goals, gradient-friendly, soft-drift-compatible: guide / gather / settle.**
5. **Soft-drift failure: no modal, no button, no attempts counter.** Camera ease-out ~10%, ambient duck ~4dB, cursor dims to ~60%; goal-receiver fades and respawns; player's next press-and-hold is the retry.
6. **No on-screen text except a 3s lunar-phase title card per night.** Skippable.
7. **Sandbox / free-pull mode unlocked from first run.**
8. **Audio direction owned by UX (bed/tension), gamification handling event-layer.** Five sounds total.
9. **Wordless 30s trailer shape locked in week 1.**
10. **Day-3 fluid-sim spike kill gate, expanded.**
11. **Hard ban list** (no streaks/leaderboards/missed-day/notifications/etc.).
12. **Cosy-cosmic-intimate tone.** Comparable cluster: *Where's My Water?* + *Townscaper* + *A Building Full of Cats*.
13. **Defer to post-slice:** swimmers/beachcomber/creatures, weather, fourth-act, mobile, share, gallery, level editor, daily-seed sandbox variant.
14. **Rename "Tide / Pull" before any public commit.**
15. **Healthy first-session: 8–12 minutes; clean exit after night three.**

### Open dissents (Round 2 close)

1. **Audio budget.** UX's 1+4 vs PM's 6+3+swell.
2. **Moonrise opening beat.** UX 10s/2s vs PM cut.
3. **Third verb.** Settle (PM, storyboarder) vs extinguish (gamification).
4. **Level ordering.** Linear (PM) vs free choice (habit-formation).
5. **"One button" honesty.**

### Confidence: 4 / 5

The slice has a settled shape. Five remaining dissents are scope-edge details — none would change the overall design direction.

---

## Appendix E: Round 3 ratify/dissent

### E1. storyboarder

```
DECISION: RATIFY
REASON: The Draft Consensus holds bay continuity across three nights, the phasing moon-glyph cursor, kishōtenketsu compressed to three beats with the night-2 lunar inversion as the twist, and release as the emotional carrier — every load-bearing scene-level beat I held the line on in Round 2 survived. The remaining open dissents (audio budget, moonrise length, settle vs extinguish, linear vs free, "one-button" naming) are tunings, not story-shape breaks; settle/return I argued for is already on the consensus side of item 4, and I'm content for the council to leave the rest as recorded dissents.
AGENT: storyboarder
```

### E2. gamification-designer

```
DECISION: DISSENT
REASON: Two of my held lines were overridden in ways I can live with, but the third verb choice materially shapes the meta-meta arc and I cannot ratify "settle" as the L3 receiver. "Settle" is a state, not a verb the player performs — it collapses agency at the exact moment the lunar arc should crest. Extinguish gives the player a concrete action that pairs with the waning phase and closes the night-cycle loop with intent.
SPECIFIC DISSENTS:
- Third verb = "settle" — Settle describes the bay's response, not the player's input. L3 needs a verb the press-and-hold performs against a receiver (lanterns, embers, fires on the headland). Extinguish reads as an action, scales with pull strength under the waning moon, and gives the release moment something to mean. Settle risks a passive finale where the player witnesses rather than acts — directly against the agency principle in my Round 1.
AGENT: gamification-designer
```

### E3. habit-formation

```
DECISION: DISSENT
REASON: The ethics perimeter and ban list are honoured, and the soft-drift retry-as-next-press is close enough to my "let it settle" affordance — the gesture is the affordance. But the level-ordering question (open dissent #4) is unresolved and it matters: linear gating on a three-night kishōtenketsu structure quietly imports completionism pressure (must finish night one to see night two), which is the kind of soft compulsion the perimeter is meant to keep out.
SPECIFIC DISSENTS:
- Open dissent #4 (level ordering) — I dissent toward free choice, or at minimum: nights selectable from a simple picker after first completion, with no "locked" padlock iconography on first run. Linear-only gating turns a cosy three-act into a checklist and risks the player feeling they "owe" night one before they're allowed night two. If storyboarder's callback structure requires linear on first playthrough, fine — but nights two and three must be directly re-enterable thereafter without replaying night one.
- Trailer wishlist card (#9) — I can live with a Steam wishlist CTA on the trailer (it's a store-page artefact, not an in-game loop), but the council should record explicitly that no wishlist/follow/share surface appears inside the game itself. Worth one line in the spec so it doesn't drift in build.
AGENT: habit-formation
```

### E4. ux-designer

```
DECISION: DISSENT
REASON: Most of my spec landed, but two open dissents remain unresolved and one a11y commitment is missing from the Draft. I won't ratify a consensus that leaves the audio budget and moonrise unresolved and is silent on reduce-motion.
SPECIFIC DISSENTS:
- Audio budget (open dissent #1) — Hold 1 ambient bed + 4 SFX. PM's 6 SFX + 3 stems + release swell breaks the cosy-cosmic-intimate tone, fights the press-attack/release-whoosh as the only event-layer cues, and inflates two-week scope. Five sounds total is the ceiling.
- Moonrise opening beat (open dissent #2) — Hold 10s first-launch, 2s thereafter, always skippable. Cutting it loses the only diegetic frame for "you are the moon" and the title-card lunar-phase signal; trimming to 2s on repeat respects returning players without losing first-run readability.
- Reduce-motion path absent from Draft — Must be explicit: prefers-reduced-motion swaps the release rush for a slower opacity-and-scale settle (no rapid camera ease, no fast water snap-back). Without this, the slice ships non-compliant with a baseline a11y expectation the council has otherwise honoured.
- Clip-render frame (16:9, Pixi-drawn cursor in-frame) absent from Draft — Needs locking now because the cursor-IS-the-moon decision is meaningless in a trailer if the OS cursor renders outside the captured frame. This is a one-line constraint, not a feature.
AGENT: ux-designer
```

### E5. pm

```
DECISION: DISSENT
REASON: Consensus adopts ~80% of my prioritisation (Candidate A, guide/gather/settle, scope cuts, day-3 gate, linear order, 8–12 min session), but the audio budget cut to 1+4 contradicts my Risk #5 and the moonrise compromise still leaks week-1 art budget I costed as L. Both need pressing before I sign.
SPECIFIC DISSENTS:
- Audio budget (1+4) — Risk #5 (audio underscoped, medium × high) lands here. Five sounds total cannot carry three lunar phases as distinct moods plus release-swell payoff; without per-phase ambient differentiation the "moon load-bearing" claim is audio-mute. I want minimum 4 SFX + 3 ambient stems (one per phase) + release swell = 8 cues. If tech-lead says that's a week-2 risk, cut a SFX, not a stem.
- Moonrise opening beat (open between UX 10s/2s and my cut) — UX's "skippable + 2s on returns" still requires bespoke first-run-only animation work in week 1, which is the most contested week in the schedule. Cost is M-to-L for a beat the player skips. Hold the cut; recover the cosy-arrival feeling via the title card and ambient stem fade-in, which we're already building.
AGENT: pm
```

### E6. product-strategist

```
DECISION: RATIFY
REASON: The slice as scoped earns the wedge. Rename, persistent bay, soft-drift as weather grammar, wordless trailer shape, and the cosy-cosmic-intimate comparable cluster all landed. The remaining strategy items (tag stack, wedge sentence, future-bay tell, curator outreach, screenshot policy) are copy/marketing concerns that belong in the spec body, not blockers on the build.
AGENT: product-strategist
```

---

## Appendix F: Round 4 critiques

### F1. storyboarder

#### Where I concede

**Third verb: I concede "settle" as the player-facing label.** Gamification is right on the linguistics — *settle* describes the bay's response, not the gesture. I held the line on the *kishōtenketsu* shape, not on that specific noun, and I confused the two in Round 3. But I also won't concede to "extinguish" — it imports a faintly martial register (putting out fires, ending things) that fights cosy-cosmic-intimate. The third option is the right one: **"send"** or **"release"** as the verb, with floating lanterns or paper boats as the receiver. The player presses-and-holds to gather the lanterns into a current, releases, and the rush sends them out past the headland. That is a verb the press-and-hold performs, it scales with pull strength under the waning moon (more lanterns gathered, further they travel), and the release-moment payoff is the lanterns crossing the bay's edge into open water. The *ketsu* lands as a quiet outward motion, not a passive watching. Kishōtenketsu's *ketsu* is reframing, not climax — "the moon's pull becomes a sending-off" reframes the mechanic from ebb-and-flow into farewell, which is the cosy-cosmic-intimate beat I was reaching for.

**Moonrise opening: I concede to PM's cut.** UX's diegetic frame is real, but PM is correct that the title card plus ambient stem fade-in carries the "you are the moon" reveal at a fraction of the week-1 cost. The cursor-as-moon reveal happens the first time the player moves the mouse over the bay anyway — that is the diegetic moment, not a pre-roll cinematic. I introduced moonrise in Round 1 and it was the right instinct, but the cursor-IS-the-moon decision in item 3 of the consensus already does the work. Kill the moonrise.

#### Where I hold the line

**Level ordering: linear on first playthrough, free-pick thereafter.** Habit-formation is right that linear-only gating imports completionism, and I am right that the three-night kishōtenketsu only lands as a sequence on first encounter. The both-and is the answer and it should be in the spec verbatim: nights two and three are directly re-enterable from a simple picker after first completion, with no padlock iconography ever shown — first run just opens on night one because that is where the story starts, not because nights two and three are "locked". One sentence in the spec.

**Audio from the story side: one bed, three phase-tinted layers, four SFX — split the difference.** The bay showing wear from earlier nights is a visual-and-audio callback, and it does need phase-distinct ambient or the lunar-arc claim goes mute. But three full stems is week-2 risk. The story-side answer: one ambient bed with three filter/EQ tints (waxing brighter, full fuller, waning hollower) — one asset, three states. That is a stem-and-a-bit, not three stems, and it preserves the per-phase mood the callback structure depends on. Plus four SFX. Total asset count stays close to UX's ceiling; per-phase differentiation stays close to PM's floor.

#### Revised recommendations

- **[P1] Third verb = "send" (lanterns/paper boats), not settle, not extinguish — cost: S.**
- **[P1] Cut moonrise opening; rely on title card + ambient fade-in + cursor-reveal-on-first-mouse-move — cost: S.**
- **[P1] Level ordering: linear first playthrough, free-pick thereafter, no padlock iconography ever — cost: S.**
- **[P2] Audio: 1 ambient bed with 3 phase-tinted filter states + 4 SFX — cost: M.**
- **[P3] Spec line: no wishlist/follow/share surface inside the game; trailer-only — cost: S.**

---

### F2. gamification-designer

#### Where I concede

**Audio budget — I move toward UX's 1+4 ceiling, with one carve-out.** I came in flagging four event-layer cues plus an ambient bed. That's the 1+4. PM's 8-cue stack adds expressive range but it stacks on top of my event layer, not in place of it, and the press-attack already does most of the work a release swell would do at the climax. UX is right that more cues fight the cosy-cosmic-intimate tone. The carve-out: the single ambient bed should be authored as a stem with a low/high-frequency split so the lunar phase can be expressed as a filter sweep rather than a swap — that gives PM the per-phase mood without three discrete stems. Counts as one bed, sounds like three.

**Moonrise opening beat — UX's hold (10s first launch, 2s thereafter, skippable) is correct.** From a loop perspective: a toy is something you can immediately *do*. A 10s diegetic moonrise on every launch breaks the toy-first framing. UX's tiered version preserves the first-night reveal without taxing return sessions. PM's hard cut loses the kishōtenketsu *ki* beat; UX's compromise keeps it where it earns its keep.

**Level ordering — concede to habit-formation's free-choice-after-completion.** My loop instinct was linear-for-pacing, but on reflection: the toy-first framing *requires* free re-entry. Once a player has seen all three nights, locking them out of N1 to replay N2 is the checklist failure habit-formation flagged. Linear on first run (so kishōtenketsu lands), free picker after first completion, no padlock iconography. Storyboarder's landing is preserved on the first traversal, which is the only one that matters narratively.

#### Where I hold the line

**Third verb — I withdraw "extinguish" and propose "send" as the L3 verb.** PM's soft-drift critique landed. Extinguish is too binary: a fire is either out or it isn't, and the gradient-failure model (fire flares back on early release) is mechanically clever but tonally wrong for waning-moon kishōtenketsu *ketsu*. It introduces resistance and re-ignition where the night wants release.

But "settle" is still passive. The player must *do* something on release; settling is what the bay does in response.

**Concrete L3 picture: paper lanterns on the headland shrine.** Throughout N1 and N2 the shrine has been visible but inert in the background. On N3, lanterns line the shore. The press-and-hold draws the waning moon close; the lanterns lift; the release sends them out across the bay on the tide. Pull strength under the waning moon scales how far they travel before the current takes them. Soft-drift compatibility: a lantern released too early drifts back to shore (recoverable, gradient); released at the right moment it joins the others on the horizon. The verb is **send**. It's active, it scales with pull, the release moment *means* something (the lantern leaves your hand), and the bay's response — lanterns receding into dark water under a waning moon — is the *ketsu* that storyboarder and PM are protecting.

This also resolves the storyboarder/PM "settle" preference: settling is what *happens* (lanterns settle into the current, the bay settles for the season), but **send** is what the player *does*. Both readings survive.

**Toy-first serves the loop better than puzzle-second on every night.** Each of the three nights should be playable as a sandbox — the win-state is a soft suggestion, not a gate. This is non-negotiable from the loop side and aligns with habit-formation's free-choice position.

#### Revised recommendations

- **[P1] Third verb = "send" (lanterns on the headland shrine, L3) — cost: S.**
- **[P1] Audio = 1 bed (filter-swept per phase) + 4 event SFX — cost: S.**
- **[P1] Free-choice level picker after first completion, no padlock iconography — cost: S.**
- **[P2] Moonrise: 10s first-launch, 2s thereafter, always skippable — cost: S.**
- **[P2] Lantern asset must read at 16x16 px on dark water — cost: M.**
- **[P3] Sandbox mode preserves the lantern receiver on N3 — cost: S.**

---

### F3. habit-formation

#### Where I concede

**Audio budget — I concede toward PM's 8-cue version, but reframed as ethics, not production.** Three ambient stems (one per phase) plus the release swell isn't bloat — it's the world doing different things on different nights. That's the natural-trigger encouragement from my perimeter working as intended. A single bed across all three phases would flatten the lunar load-bearing into wallpaper; per-phase stems make "the world changed" audible the moment the player presses play. UX's calm-surface concern is real but answered by keeping the *attack* of each stem soft — these are beds, not stings. Five cues is the wrong ceiling.

**Third verb — I concede this isn't my call, with one note.** Extinguish is a working verb under the cosy frame in the same way snuffing a candle at bedtime is — it's a settling gesture, not a violent one. Drowning a fire reads aggressive only if the visual language is splash-and-hiss; under a waning moon with soft-drift physics, it reads as the tide quieting embers on a beach. I'd lose no sleep on extinguish. Defer to gamification-designer.

**Clip-render frame — confirmed fine, not a share loop.** A 16:9 Pixi-drawn capture surface is a passive affordance — the spectacle exists whether or not anyone clips it.

#### Where I hold the line

**Level ordering — linear on first playthrough only, no padlocks ever, free pick thereafter.** I'm pushing the compromise into spec language and holding firm on the visual grammar. First run: nights present sequentially because the storyboarder callback structure requires it for the L3 payoff to land. Fine. But the UI must never show a padlock, never show "locked", never show "complete N to unlock". Nights are signified by their lunar phase glyph alone — full, gibbous-or-whatever, waning crescent. After first completion, the night-select shifts from "tonight's" (single affordance) to "any night" (three glyphs, equal weight). No "completed" ticks, no progress bars. SDT (Ryan & Deci) autonomy support is the citation — padlocks convert intrinsic curiosity into extrinsic gating.

**Moonrise opening beat — UX's 10s-first/2s-after wins, skippable from frame one.** This is the opt-in ritual I argued for in Round 1. PM's cut treats the opening as friction; it's not — it's the equivalent of the kettle boiling before tea. The skip-from-frame-one clause is non-negotiable.

**Reduce-motion path — hold, do not defer.** This is a P1 a11y obligation, not a polish item. The 13-year-old filter cuts both ways: a 13-year-old with vestibular sensitivity is exactly the player a cosy game must not lock out. Solo dev, two weeks, still in scope. Bolting it on post-slice is the classic mistake.

**No in-game wishlist/follow/share surface — rider stands.** One line in the spec. Trailer can carry the Steam CTA; the game cannot.

#### Revised recommendations

- [P1] **Night-select UI: phase glyphs only, no padlocks, free pick after first run** — cost: S
- [P1] **Reduce-motion path in slice, not deferred** — cost: S
- [P1] **Moonrise 10s-first/2s-after, skippable frame one** — cost: S
- [P2] **Per-phase ambient stems (3) + release swell, on top of 4 SFX** — cost: M
- [P2] **No in-game wishlist/follow/share surface; trailer CTA only** — cost: S
- [P3] **Clip-render 16:9 frame as passive spectacle** — cost: M

---

### F4. ux-designer

#### Where I concede

**Audio budget — middle ground exists.** PM is right that three discrete lunar nights with one undifferentiated bed will read as flat. I was wrong to hold "5 files" as a hard ceiling without offering a tonal-differentiation path. The middle is: **1 ambient bed + per-phase low-pass filter automation (cutoff sweeps, no separate stems) + 4 SFX + 1 release swell that is a shaped variant of the press-attack SFX (re-pitched, longer tail, same source).** That is 5 audio files, 6 audible cues, and three perceptibly different nights. Filter/EQ on a single bed is how cosy ambient music does this work — cutoff at ~800Hz for new-moon (muffled, intimate), ~2kHz for half (open), full-band for full-moon (luminous). No new files, real differentiation. PM gets per-phase voice; I get tone discipline.

**Goal-shape vocabulary — concede to two shapes.** PM is right that three shapes on a top-down water surface in a cosy palette will muddy first-read hierarchy. Two shapes (goal vs neutral) plus motion-state differentiation carries the load. Shape does the noun, motion does the verb.

**Third-verb readability — extinguish wins on a top-down water surface.** Settle is a quiescence (low motion → lower motion); on a cosy palette top-down water surface that change is sub-threshold and the player will not see the goal completing. Extinguish is a damping with a contrast collapse (bright → dim, motion → still) — that's legible at 1080p in peripheral vision. Concede to gamification's "extinguish".

#### Where I hold the line

**Moonrise — re-costed to S, hold the beat.** PM costed bespoke first-run animation as M-to-L because they assumed character art. Pure motion + audio: camera y-offset tween (Pixi viewport translate, ~10s ease-out), ambient bed fade-in over the same window, cursor moon-sprite alpha 0→1. No new art, no new audio file (uses the existing bed). That's S cost. The 10s first-launch / 2s thereafter / always-skippable shape holds. The peak-end rule earns this beat — first-launch is the peak we are paying for.

**Reduce-motion path — non-negotiable.** WCAG 2.2 SC 2.3.3 (Animation from Interactions). Concrete language for tech-lead to quote: *"On boot and on resize, query `window.matchMedia('(prefers-reduced-motion: reduce)')`. When `matches === true`, the release rush (particle burst + camera shake + radial bloom) is replaced by a 200ms opacity 1→0.6 + scale 1→0.98 ease-out tween on the affected sprites. The moonrise camera tween is replaced by an instant cut with a 400ms ambient-bed fade-in. Listen for `change` events on the MediaQueryList to honour mid-session toggles."*

**Clip-render — non-negotiable.** A wordless trailer with an OS cursor in frame is a broken artefact. Concrete language: *"Cursor is a Pixi.js `Sprite` parented to a top-level UI container on the main stage, position updated each frame from `pointermove`. OS cursor hidden via CSS `canvas { cursor: none; }` on the renderer element. Capture via OBS window-capture on the canvas; the moon-cursor is in-frame because it is drawn by Pixi, not composited by the OS."* Cost S.

**No in-game share/wishlist/follow surface.** Confirmed. The slice is silent on social. Trailer end card lives in the trailer, not the build.

#### Revised recommendations

- **[P1] Audio budget: 1 bed + per-phase low-pass automation + 4 SFX + 1 shaped release swell — 5 files, 6 cues — cost: S.**
- **[P1] Reduce-motion path with the matchMedia spec above — cost: S.**
- **[P1] Clip-render: Pixi-sprite cursor, CSS `cursor: none` on canvas — cost: S.**
- **[P1] No in-game share/wishlist/follow/streak surfaces — cost: 0.**
- **[P2] Moonrise: 10s first-launch, 2s thereafter, always skippable, pure motion + audio — cost: S.**
- **[P2] Two-shape goal vocabulary (goal vs neutral) with motion-state encoding the verb — cost: S.**
- **[P2] Third verb = "extinguish" with contrast-collapse motion language — cost: S.**
- **[P3] Title card typography spec: one face, one weight, ≥4.5:1 against the darkest bay frame, 3s hold, fade 400ms — cost: S.**

---

### F5. pm

#### Where I concede

**1. Moonrise — partial concede.** UX's "pure motion + audio, no character art" framing changes the cost. If moonrise is camera lift + ambient stem fade-in + lunar-phase tint shift, with the cursor itself as the moon (no bespoke first-run-only art asset), then it's reusing systems already in the slice. **That's cost S, not M.** I withdraw the cut. Final shape: 6s on first launch (not 10s), 1.5s on returns, always skippable from frame 1 with any input. The 10s figure was indulgent; 6s is enough for the ambient stem to establish.

**2. Third verb — concede to extinguish.** Gamification's "fire flares back if released too soon" is genuinely a gradient state, not a binary. UX's framing — extinguish is high-motion-to-low-motion damping — is the correct read for what a top-down sim can actually render. Settle was my pick on soft-drift compatibility, but extinguish is soft-drift-compatible if "released too soon = fire reignites" replaces "fail state = retry on next press." That preserves the no-fail principle. **Concede: third verb is extinguish.**

**3. Level ordering — concede to habit-formation.** Linear-on-first + free-pick-after is one night-picker affordance that appears after the first completion. Cost S. Kishōtenketsu lands on the first run, and re-entry respect is preserved. No padlock iconography — completed nights light up, uncompleted nights are dimmed but tappable on returns only after first session ends. **Linear first session, free thereafter.**

**4. Reduce-motion + clip-render — concede they ship.** Both are cost S.

#### Where I hold the line

**Audio budget — hold, but accept UX's middle.** Five sounds total is still audio-mute for a moon-load-bearing premise. UX's compromise — **1 ambient bed with per-phase EQ/filter automation + 4 SFX + 1 release-swell variant = 6 cues** — is the acceptable middle. The filter automation does the per-phase mood work that three discrete stems would do, at roughly half the asset cost but with bespoke audio-engine work instead. **6 cues, not 5, not 8.** What comes out to pay for the sixth cue: cut one of the four SFX if tech-lead flags audio as week-2 risk on day 10. The release-swell is non-negotiable because it's the payoff the entire emotional arc is pointed at.

**Hard ban on wishlist/share/follow surfaces inside the game.** Habit-formation's line stays.

#### Revised recommendations

**P1 — Lock the 6-cue audio scope. Cost: M.** Tech-lead must confirm filter-automation is in budget by day 5 or fall back to 1 bed + 4 SFX + 1 swell (5 cues) and accept the audio-mute risk in writing.

**P1 — Day-3 fluid-sim spike kill gate. Cost: S.** Unchanged.

**P1 — Three nights, linear-first-then-free, extinguish as verb three. Cost: M.** The slice spine.

**P2 — Moonrise as camera-lift + ambient-stem fade-in (no bespoke art). Cost: S.** 6s first launch, 1.5s returns, skippable.

**P2 — Reduce-motion path + clip-render frame. Cost: S each.**

**P2 — Wordless 30s trailer cut by end of week 1. Cost: S.**

**P3 — Sandbox/free-pull mode. Cost: S.**

**Out of scope (deferred post-slice):** rename, Steam page assets, achievements, leaderboards, additional lunar phases, NPCs, narrative text, save-state cloud sync, mobile.

#### Updated top-5 risk register

1. **Fluid sim cost.** Day-3 gate. Mitigation locked.
2. **Audio scope creep.** 6 cues with filter automation; day-5 fallback to 5 cues.
3. **Extinguish gradient feel.** New risk — "fire reignites if released too soon" must feel forgiving, not punishing. Habit-formation owns the tuning pass.
4. **Moonrise skip discoverability.** Any input skips; must be communicated through input-responsiveness, not text.
5. **Two-week solo timeline.** P3 items are the buffer.

---

### F6. product-strategist

#### Where I concede

**Audio budget — I move from 5 to 7.** UX's 5-cue ceiling preserves cosy-tone discipline, but the wordless trailer's "cut to night two" beat is the entire wedge demonstration in 3 seconds. That cut has to land via *audio differentiation* — the visuals between half-moon and full-moon are subtle enough that without distinct ambient texture per phase, the trailer reads as "same bay, different camera angle." PM is right that 5 cues starves the trailer. But PM's 8 overshoots cosy. **Concede to 1 ambient bed with three phase-tinted variants (filter sweeps, not three separate stems) + 4 SFX = 5 named cues but 7 effective audio states.** This is closer to UX's discipline than PM's floor, but it gives the trailer the differentiation it needs.

**Moonrise — concede to UX's variable hold.** PM's cut-entirely is wrong for the trailer (defended below), but I was too quiet about first-launch vs. returning-player asymmetry. UX's 10s first-launch / 2s thereafter / always-skippable is correct. The trailer uses the 10s first-launch version; the returning player gets 2s; both serve different jobs. Concede.

**Reduce-motion + clip-render — concede they belong in the spec.** Both are trailer-load-bearing. Reduce-motion: Steam autoplays trailers silent on the store page — if the visual carries on its own, we win the impression. Clip-render with cursor captured is the moon-as-protagonist story.

**In-game wishlist surface — clean concede.** Confirming explicitly: "no wishlist/follow/share surface appears inside the game itself" does not constrain (a) the trailer's external wishlist card cut at the end, (b) the Steam page CTA, (c) the itch.io page, or (d) any out-of-game marketing surface.

#### Where I hold the line

**Third verb — hold "settle," but accept that the verb the player *performs* is "release."** Gamification's critique is grammatically correct: settle is the bay's response, not the input. But "extinguish" tilts the wedge agentic, toward *Where's My Water?* and away from *Townscaper / A Building Full of Cats*. The cosy-curator audience reads "extinguish" as combat-adjacent. **Resolution: the three goals stay "guide / gather / settle" (the bay's verbs — what the player *causes*), and the input mechanic stays "press-and-hold / release" across all three nights.** Settle is what the bay does; release is what the player does. The Steam short description uses "settle." This holds the cosy-cosmic-intimate tone and keeps the wedge clean.

**Moonrise opening the trailer — hold against PM's cut.** First 8 seconds under each option:

- *PM's cut:* Black → press-and-hold visible → tide pulls → release → cut to night two. The "you are the moon" reveal is missing. The trailer becomes a physics-toy demo, not a cosy-cosmic one. We lose the wedge in 8 seconds.
- *UX's 10s first-launch (trailer version):* Black → moonrise (3s, not 10 — trailer cuts the in-game beat) → cursor-becomes-moon (1s) → press-and-hold (2s) → tide pulls (1s) → release → cut to night two with phase shift. The wedge sentence renders visually. This is the trailer.

The trailer uses a 3-4s moonrise, not the 10s in-game version. PM's budget objection is about the *in-game* moonrise cost, which UX resolves with the 2s returning-player version. Trailer moonrise is a separate render asset, capturable from a single dev session.

**Level ordering — hold free-choice-after-first.** Habit-formation is right and this is wedge-aligned, not wedge-fighting. "The bay changes with tonight's phase" presumes the player picks tonight. Linear-only fights this. First-time linear (so the player learns press-and-hold before complexity) then free re-entry to nights two and three is correct.

**Final wedge sentence — locks unchanged.** "You are the moon. Hold to pull the tide; let go to watch it rush home. A cosy one-screen physics toy where the bay changes with tonight's phase." Survives all four dissents.

**Rename before public commit — hold.** Untouched in dissents.

#### Revised recommendations

- **[P1] Audio: 1 ambient bed + 3 phase-tinted filter variants + 4 SFX — cost: M.**
- **[P1] Trailer first 8 seconds locked — cost: S.**
- **[P1] Moonrise: 10s first-launch / 2s thereafter / always-skippable — cost: S.**
- **[P1] Reduce-motion path: trailer's storefront-autoplay-muted variant must read silent and with motion dampened — cost: S.**
- **[P1] Clip-render with cursor captured — cost: S.**
- **[P2] Three goals stay "guide / gather / settle"; input verb is "release" — cost: S.**
- **[P2] Free re-entry to nights two and three after first linear run; no padlock iconography — cost: S.**
- **[P2] Spec line: "no wishlist/follow/share surface inside the game itself; trailer-end and Steam-page CTAs are unaffected" — cost: S.**
- **[P1] Rename "Tide / Pull" before any public commit — cost: M.**
- **[P1] Final wedge sentence locks unchanged — cost: S.**

---

*End of spec.*
