---
title: Tide / Pull — post-build retrospective + v0.5 closure sprint
date: 2026-05-06
status: design (pre-implementation)
phase: 3.5 (post-slice retrospective)
authors: [storyboarder, gamification-designer, habit-formation, ux-designer, pm, product-strategist, orchestrator]
inputs:
  - docs/specs/2026-05-05-tide-pull-design.md
  - docs/specs/2026-05-06-tech-plan.md
  - docs/specs/build-log.md
---

# TL;DR

The Creative Council reconvened for a post-build retrospective on the *Tide / Pull* slice (committed at `c1cb61c…cf1a749` on `main`, with three subsequent post-slice fixes and polish passes). All six specialists reviewed their own R1+R2 memos against what actually shipped, then converged in three rounds (Round 1 retrospectives → Round 2 cross-critique → Round 3 ratify) on a tightly-scoped **v0.5 closure sprint**: 11 P1 items, 7 P2 items, and a clear deferral list to v1.0+. The headline calls: rename to ***Neap*** (the team's R2 *Lull* pick collided with `Lull: Rest After Crying` on Steam mid-round), ship cross-session ghost persistence, fix the moonrise reduce-motion a11y bug UX caught, re-frame the held-success beat to "dwell to savour, tap to advance" (resolving a three-way tension), extend the intent beat to all three nights, add a single new N3 receiver (storyboarder's headland fire ignited by passing lanterns), close the slice with an N1-callback bell + fade-to-silence on Night 3, replace the cursor-trail with a tether shimmer at hold-onset, record the trailer as an internal artefact, run the canonical stranger-test (with a parallel reduce-motion pass), and draft the Steam page in `docs/specs/` as a forcing function. One open question — direct-receiver-pull purity — was resolved in adjudication: keep the direct pull on **Night 3 only**. v1.0 expansion (recorded foley, second bay, mobile, pricing) is gated behind the closure sprint completing and the stranger-test passing.

# Problem

The user shipped a 10-day vertical slice followed by ~30% of unbudgeted post-slice work (height-cap fix, all-deferred polish pass, sim-retune for "boat barely moves" + "arena wipe" bugs, discoverability docs). Then asked the council: *"please review all the work that has been done. I would like each [specialist] to really review the game and tell me if this is what they imagined and where they would take it next."* Then later — partway through Round 2 — added: *"keep discussing as if I'm not here, the team has the responsibility to get it right."*

The retrospective surfaces three problems the slice ships with that the original design phase didn't fully anticipate:

1. **Discoverability is incomplete.** The user's first-play feedback ("I need more instructions") prompted out-of-game docs (`README.md` + `docs/HOW-TO-PLAY.md`). UX flagged in R1 that this patches the wrong layer — the in-game "intent beat" UX won at design Round 2 only landed for Night 1.

2. **N3 lantern-repeat is the biggest pacing flatness.** The "one new receiver per level" promise (gamification design R1) only half-shipped. N1 boat → N2 lanterns → N3 lanterns — same receiver type twice, even though the verbs differ.

3. **The auto-advance after held-success is soft compulsion.** Habit-formation flagged this in retrospective R1: a 2.5-second window where the system advances the scene without asking is the same shape as an unskippable transition. The original spec didn't authorise it.

There is also one bug the design phase did not anticipate: **`render/moonrise.ts` does not honour `prefers-reduced-motion`**, which is a WCAG 2.2 SC 2.3.3 conformance gap. UX caught it during this retrospective.

The slice itself is solid — every ethics-perimeter line is honoured in code, the cellular-automaton fluid sim passed its kill gate, the cosy-cosmic-intimate tone landed (post-polish), the wedge sentence maps clause-by-clause to visible features, and all six specialists confirm "this is mostly what I imagined." But the gaps above are real and the team has organised them into a single closure sprint to land before declaring v0.5 shipped.

# Goals

1. **Close the discoverability gap diegetically** by extending the intent beat to Nights 2 and 3 so the player learns each verb from the world, not from the README.
2. **Resolve the held-success soft-compulsion drift** with a "dwell to savour, tap to advance" reframe that preserves the resolution beat (gamification + storyboarder) while restoring autonomy (habit-formation).
3. **Fix the moonrise reduce-motion a11y bug** to honour the WCAG conformance commitment in the motion-and-colour bible.
4. **Make the persistent bay claim land across sessions** by persisting completed-night receiver positions in `tide-pull/save/v2`.
5. **Restore N3 receiver variety** with a single new sprite (small headland fire) ignited by passing lanterns.
6. **Close the three-night arc with a callback** — N3 ends with the same bell tone as N1 + ambient resolves to silence + moon dips below the horizon.
7. **Replace the unproven cursor-trail with a cursor-tether shimmer at hold-onset** so the direct-receiver-pull verb-grammar reads as moonlight, not hidden physics.
8. **Rename to *Neap* before any external surface goes up** (Steam page, itch page, social handle).
9. **Record `trailer-cut-1.mp4` as an internal artefact** that proves the wedge sentence is verifiable in moving pictures.
10. **Run the canonical stranger-test** (two non-developers, this Windows machine, default URL, no priming) plus a parallel pass with `prefers-reduced-motion` toggled on.
11. **Draft the Steam page in `docs/specs/`** as a forcing function for the rename, comp-set, three-screenshot story, and one-paragraph wedge.
12. **Codify "no in-game social/wishlist/follow surface" in `docs/specs/conventions.md`** as a perimeter line a future contributor cannot accidentally cross.
13. **Re-run the WCAG / colour-blindness audit against all three lunar palettes** (the day-9 audit only ran the canonical waxing palette).

# Non-goals

1. **No v1.0 expansion arc this sprint.** Second bay, fourth night, additional creatures, mobile/touch port — all P3, gated on stranger-test results.
2. **No recorded ambient bed in this sprint.** Synthesised audio ships with v0.5 (slice + trailer-cut-1); recorded foley becomes a v1.0 polish item ahead of broad-curator outreach.
3. **No in-game "today's bay" / daily-seed surface.** If it ever ships post-v0.5 it must be sandbox-only with no completion record (habit-formation's hard line).
4. **No completion ticks, padlocks, streak counters, or "bays played" UI** anywhere in the picker — ever.
5. **No "come back tomorrow" / "return when the tide rises again" copy** in the N3 farewell beat or any title-card / Steam-page surface.
6. **No fourth night as a *night*.** The "fourth-night" question converges on **picker-as-place + persistent ghosts**, not a scheduled new level.
7. **No removal of the `?night=N` URL override yet.** It stays until the post-v0.5 public-deployment threshold; explicitly documented as DEV-ONLY in `game/src/main.ts` and `docs/HOW-TO-PLAY.md`.
8. **No pricing decision now.** Strategist's call ($5.99 vs $7.99) waits on curator feedback.
9. **No premature curator outreach.** Gated on trailer-cut-1.mp4 + Steam page draft existing + stranger-test passing.

# Proposed changes

Ranked for execution in the closure sprint. Each item names the file(s) it touches and the rationale. Costs are S (≤ ½ day), M (½–1 day), L (1–2 days).

## P1 — must ship before v0.5 is declared

### 1. Rename to *Neap*

**Cost: S** decision / **M** execution.

- Replace "Tide / Pull" / "tide-pull" across:
  - `README.md`
  - `docs/HOW-TO-PLAY.md`
  - `docs/specs/build-log.md` (going-forward entries; existing entries left as historical record)
  - `docs/specs/conventions.md`, `docs/specs/feel-test-protocol.md`, `docs/specs/motion-and-colour-bible.md`, `docs/specs/trailer-cut.md`
  - `game/package.json` `name` field
  - `game/index.html` `<title>`
  - All commit messages going forward use `Neap` (historical commits stay as-is)
- **`localStorage` key migration:** bump `tide-pull/save/v1` → `neap/save/v2` in `game/src/state/save.ts`. On load, attempt the new key first, then fall back to the legacy key for one read (migrate in-place). Document migration semantics in `conventions.md`.
- Repo rename `gh repo rename NBS1997/gameX neap` happens at the moment of first public surface, not in this sprint; current sprint just commits the in-tree rename.
- Spec headers in this file (`docs/specs/2026-05-06-tide-pull-retrospective.md`) stay as-is for historical fidelity; future spec files use `neap-` slugs.

### 2. Cross-session ghost persistence

**Cost: S.**

- Bump save schema in `game/src/state/save.ts` from `v1` → `v2`. New shape:
  ```ts
  interface SaveDataV2 {
    version: 2;
    completedNights: NightNumber[];
    freeReentry: boolean;
    ghosts: { night: NightNumber; type: ReceiverType; x: number; y: number }[];
  }
  ```
- `recordNightComplete` in `game/src/state/meta.ts` writes ghost positions to the persistence layer at completion time.
- `ghostsForNight()` in `meta.ts` reads from persisted store, not just session memory.
- `render/ghosts.ts` is unchanged — it just receives more ghost data.
- **Hard constraint (habit-formation):** no visit counter, no per-night completion timestamp, no "bays played." Bay-memory only.
- Migration on first read: if `v1` is present and `v2` is not, copy `completedNights` + `freeReentry` and write empty `ghosts` array.

### 3. Moonrise reduce-motion swap

**Cost: S.** WCAG 2.2 SC 2.3.3.

- In `game/src/render/moonrise.ts`, the `update()` method must read `prefersReducedMotion()` from `game/src/a11y/reduceMotion.ts`.
- Per the motion-and-colour bible (line 117): **"Moonrise camera y-offset tween (6–10 s) → Instant cut + 400 ms ambient bed fade-in only."**
- Also extend the swap table in the bible to add: harbour-pulse → omit under reduce-motion; picker-glyph hover scale → omit under reduce-motion (UX P2).
- One-line `if (prefersReducedMotion()) { skip(); return; }` at the top of `update()` is the minimum fix; ambient bed fade-in is already handled by `audio/manager.ts`.

### 4. Held-success re-frame: "dwell to savour, tap to advance"

**Cost: S.** Resolves the gamification ↔ habit-formation ↔ storyboarder three-way tension.

- In `game/src/main.ts`, the `goalNowComplete` branch in the ticker:
  - Keep the audio bell + harbour-cream + 1.5s ease-in (the "savour" beat).
  - **Remove** the unconditional `if (postCompleteMs >= HELD_SUCCESS_HOLD_MS) finishCurrentNight(scene)` auto-advance.
  - **Replace** with: any new pointer press *after* the bell has fired (i.e. `postCompleteMs >= 1500`) advances. The 2.5s `HELD_SUCCESS_HOLD_MS` becomes a *ceiling* — if no input arrives, advance at 2.5s anyway, but the player can advance earlier or hold longer (no upper bound on holding).
  - Player who taps during the savour gets the abridged beat (audio + cream, no full ease) and immediate advance.
- This honours: **gamification's** "let the resolution play out" (the 1.5s ease still fires); **habit-formation's** autonomy line (the player can always advance); **storyboarder's** resolution beat (the bell + cream + ease still happen).

### 5. Intent beat for Nights 2 and 3

**Cost: M.**

- Extend the existing N1 pulsing harbour-ring affordance in `game/src/render/harbour.ts` to a more general "intent beat" pattern.
- **N1 (already shipped):** harbour ring breathes 0.6 Hz, ±0.18 alpha around 0.4 base, until first input.
- **N2 (new):** in `game/src/verbs/gather.ts` or a new `render/intentBeat.ts` — on level entry, single 600ms scale pulse on the lantern centroid (compute centroid of the eight initial lantern positions; render a faint ring at that point, scale 1.0 → 1.15 → 1.0 ease-in-out, alpha 0 → 0.35 → 0). Fires once per level entry; suppressed on subsequent re-entries within the session.
- **N3 (new):** on level entry, a single foam-stop-coloured (`#a8b5cc`) ring expands from the east edge midpoint (x=1920, y=540) over 800 ms, alpha 0.4 → 0, radius 0 → 200. Suggests the destination geometry without text.
- All three intent beats run *between* the title card fade-out and the moment input is enabled (~2 s pre-input window). Skip on any input.
- **Reduce-motion swap:** all three intent beats become an instant single-frame highlight (no animation), per the bible.

### 6. N3 receiver variety — small headland fire ignited by passing lanterns

**Cost: S–M.** Storyboarder's elegant proposal that solves the lantern-repeat flatness without adding a new verb.

- In `game/levels/night-3.delta.json`, add an `ambient.fire` entry with position `{ x: 1700, y: 980 }` (on the southeast headland, before the east-edge crossing).
- New sprite class in `game/src/render/entities.ts`: `fire` receiver type, rendered as a small pulsing warm disc (`#ff8a4a` fill, `#ffd966` flicker — the design spec's reserved beach-fire palette). Idle state: faint glow, pulse at 1.2 Hz.
- New event in `game/src/verbs/settle.ts`: when any lantern's `position.x > FIRE_X - 100 && distance to fire < 80` for the first time, fire `audio.lanternIgnitesFire()` (a soft warm chime — re-uses the goalMet bell with a +200Hz transposition or similar) and the fire sprite scales up briefly + brightens. Persistent state: once ignited, fire stays at the brightened state for the rest of the night.
- **Not a new verb.** Fire ignition is a side effect of the existing send verb; goal completion still requires `sentCount >= goal.minCount`.
- Sent-lantern fade (post-slice polish) keeps its 600ms alpha-down — fire ignition happens just before the lantern starts fading.

### 7. N3 fade-to-silence + final bell as N1 bell callback

**Cost: S.** Storyboarder's "and ever since" Pixar beat.

- After `goalNowComplete` fires on N3 specifically, in addition to the existing `audio.goalMet()`:
  - Schedule a second `audio.finalBell()` 1500 ms after goal-met, at the **same frequency as the N1 goalMet bell** (sine 880 Hz). This creates the across-night callback.
  - In `game/src/audio/manager.ts`, add an `audio.fadeToSilence(durationS: number)` method that ramps the master gain to 0 over 4 seconds.
  - Trigger `fadeToSilence(4)` 2 seconds after `finalBell` (so: 0s goal-met, 1.5s final-bell, 3.5s start fade, 7.5s silence).
  - The held-success "tap to advance" can short-circuit this; if it does, immediately ramp gain back up on next night entry.
- Optional: `worldLayer.position.y` slow drift downward over 4 s during the fade — moon "dipping" — as cosmetic. Reduce-motion: omit the y-drift, keep audio fade.

### 8. Cursor-trail removed; cursor tether shimmer at hold-onset

**Cost: S.** UX (remove trail) + gamification (tether shimmer) converge.

- Delete `game/src/render/cursorTrail.ts` and its imports/usages from `main.ts`.
- New `game/src/render/cursorTether.ts`:
  - Each frame during hold, for any non-sent receiver within `pullRadius * RECEIVER_PULL_RADIUS_MULTIPLIER` of the cursor (re-using the existing `applyReceiverAttraction` range), draw a thin line from cursor to receiver.
  - Line: 1.5px wide, `#a8b5cc` colour, alpha = `0.3 * holdT * (1 - dist/range)`. Fades in at hold-onset (200ms ease-in), snaps to 0 on release.
  - Mounted on `uiLayer`, above entities, below cursor-disc.
- **Reduce-motion swap:** tether is solid (no fade), single static frame; same alpha but no animation curve.

### 9. Record `trailer-cut-1.mp4`

**Cost: S** (1–2 hours of OBS + DaVinci).

- Per `docs/specs/trailer-cut.md` recipe (script, frame timing, OBS settings).
- **Internal artefact only.** Used as stranger-test conversation-piece + internal "we shipped a thing" totem.
- **Not Steam-page material.** Synthesised audio reveals at storefront-autoplay 10-second loop volume; Steam-page trailer requires recorded foley (P3, v1.0 polish).
- Update `docs/specs/trailer-cut.md` to reflect actual moonrise duration (8s first-launch / 1.8s return) instead of the deferred-and-bed-fade-only language.
- The OQ18 dissent (direct-receiver-pull purity) **is empirically tested** by this recording: if the trailer reads as "the moon pulls things directly" rather than "the moon pulls water → water pulls things," the team revisits OQ18.

### 10. Run the canonical stranger-test

**Cost: S** (time only).

- Per `docs/specs/feel-test-protocol.md` § "The stranger test" (already documented).
- Two non-developers, on this Windows machine, default URL, no priming, no spoken instruction.
- **Parallel reduce-motion pass (UX addition):** identical protocol with Windows OS-level `prefers-reduced-motion: reduce` toggled on.
- Acceptance: ≥ 60 s unprompted in picker / sandbox surface, then full slice in 8–12 minutes with no questions, no fail screens, no on-screen text other than the three title cards.
- **This is the v0.5 ship gate.** No external surface goes live and no curator gets emailed until at least one stranger has played the slice cold.

### 11. Draft the Steam page in `docs/specs/`

**Cost: M.** Strategist's forcing function.

- New file `docs/specs/2026-05-XX-steam-page-draft.md` (date-stamp at draft time).
- Sections:
  - **Final name** (Neap + tagline).
  - **Three-paragraph wedge description** for the storefront.
  - **Five primary tags + secondary tags** (current locked: `Cozy`, `Physics`, `Relaxing`, `Minimalist`, `Atmospheric`, `Casual` + secondaries).
  - **Three screenshots** (one per night — currently producible from the build).
  - **Capsule mock** (text-only sketch; visual mock optional).
  - **Trailer reference** (the recorded `.mp4`).
  - **Comp-set** (named: *Where's My Water?* + *Townscaper* + *A Building Full of Cats*; explicitly **not** *Spilled!*).
  - **Pricing range** (provisional $5.99 with $7.99 noted as alternative).
- Doesn't go to Steamworks. Forces the strategic surface to commit to a single artefact that surfaces remaining disagreements.

## P2 — close-out polish; ships if time permits

### 12. Player-facing N3 verb-label: "Let go" / "Release"

**Cost: XS.** Storyboarder + gamification + UX + habit-formation converged. Internal `goal.kind === 'send'` stays (programmer-facing only). HOW-TO-PLAY and any title-card / trailer copy uses *let go* or *release*. Update:
- `docs/HOW-TO-PLAY.md` § "What each night is asking of you" — change Night 3 reference from any "send" framing to "let go" / "release."

### 13. N3 title-card line — storyboarder-authored

**Cost: XS.** Replace `game/src/render/titleCard.ts` `TITLE_STRINGS['waning-gibbous']` from current text with one of:
- *"Waning gibbous. Let go what the bay's been holding."* (storyboarder candidate)
- *"Waning gibbous. The lanterns find the open water."* (strategist candidate)
- *"Waning gibbous. The bay is quiet now."* (habit-formation candidate, only if used as a *closing* not opening card)

**Storyboarder authors the final wording.** Hard constraint (habit-formation): no `come back` / `return` imperatives. Title card stays opening-only — closing happens via the fade-to-silence + final bell of #7.

### 14. Picker as place

**Cost: S** (on top of #2). Mounting persistent ghosts at the picker scene happens automatically once #2 ships and `enterNight` doesn't clear the ghost layer when transitioning to picker. Ambient gulls/ripples already mounted on `worldLayer`. **No completion ticks ever** (habit-formation hard line).

### 15. WCAG / CB re-audit against all three lunar palettes

**Cost: S.**
- Compute relative-luminance contrast ratio for each interactive sprite (boat, lantern, harbour ring, cursor moon, title text) against the worst-case water tile of each phase's `WATER_PALETTES` entry.
- Run deuteranopia / protanopia / tritanopia simulations on the three palettes (any in-browser CB simulator works).
- Document results in `docs/specs/build-log.md` under a `## WCAG re-audit` section.
- Fix any drop below 4.5:1 (text) or 3:1 (non-text).

### 16. Audio bed duck on picker entry

**Cost: S.** Habit-formation's "world keeps living, but you're between scenes."
- In `game/src/main.ts`, on `showPicker()` call `audio.duckBed(0.3, 0.6)` (30% duck over 600 ms).
- On `enterNight()` from picker, call `audio.unduckBed(0.6)`.
- On scene-end fade-to-silence (#7) the duck composes; not a separate state machine.

### 17. Codify "no in-game social/wishlist/follow surface" in conventions.md

**Cost: S.** Add a new section to `docs/specs/conventions.md` titled "Perimeter — UI surfaces that do not exist":
- No `share`, `wishlist`, `follow`, `tweet`, `post`, `gift`, `invite` button anywhere in the player-facing UI.
- Any external CTA (Steam wishlist) lives only in the trailer-end card or external store-page surfaces, never in the build.
- This is a hard rule that cannot be violated without an explicit Council Override entry in this file.

### 18. Trim README + HOW-TO-PLAY after intent beats land

**Cost: S.** Once #5 ships:
- `README.md` keeps the run instructions + repo orientation but drops the "Play it" section into a single sentence: *"Hold the mouse to pull the tide. Let go to watch it rush home."*
- `docs/HOW-TO-PLAY.md` reduces to: a one-paragraph orientation, the three-night description (without spoiling N3), the soft-drift mention, and the dev-only `?night=N` parameter. Drops the long discoverability narrative.

## P3 — deferred to v1.0+ (do not ship in this sprint)

- **Recorded ambient bed** to replace synthesised audio (Steam-page-launch blocker, not v0.5 blocker).
- **Curator outreach** — 15 cosy-Steam-adjacent targets (Comfy Cozy Gaming, Wholesome Games, Cozy Game Club, Camp Cozy Games, +11). Gated on trailer + Steam page + stranger-test passing.
- **Mobile/touch port** — defer with documented "touch breaks the cursor-as-moon wedge" rationale. Do not signal "mobile coming" on the Steam page.
- **Pricing decision** ($5.99 vs $7.99) — strategist's call post-curator-feedback.
- **9:16 TikTok cut** — same source footage; 1000-true-fans funnel.
- **Second-bay content drop / Night 4 / creature-of-session** — only after stranger-test passes and Steam-page evidence comes in.
- **Held-ceiling cursor "bowstring" feedback** (gamification R1 P3).
- **Per-night fluid sim reactivity** (gamification R1 P3) — `DAMPING_RATE` / `REST_RATE` shifts per phase.
- **Per-lantern crossing chime on N3** (storyboarder R1 P1, gamification R1 P3) — small chime on each lantern's east-edge crossing. Bundled with #6+#7 audio work if time permits, otherwise post-v0.5.
- **Ambient creatures responding to player pull** (gamification's "spectators not participants" tension).
- **`?night=N` URL override removal** — defer until first public deployment threshold.

# Acceptance criteria

```gherkin
Feature: Closure sprint — v0.5 ship gates

  Scenario: Rename to Neap is in tree
    Given the closure sprint has shipped
    When I grep the tree for "Tide / Pull" or "tide-pull" excluding historical spec files dated before 2026-05-07
    Then I find no occurrences in player-facing surfaces (README, HOW-TO-PLAY, in-game title, package.json name)
    And the localStorage key is "neap/save/v2"
    And legacy "tide-pull/save/v1" data migrates on first read

  Scenario: Cross-session ghosts persist
    Given I have completed Night 1 and Night 2
    When I close the browser tab and reopen
    Then ghosts from Nights 1 and 2 are visible at the picker
    And on entering Night 3 the ghosts from Nights 1 and 2 are visible in the bay
    And no visit counter, completion timestamp, or "bays played" UI is rendered anywhere

  Scenario: Moonrise honours reduce-motion
    Given the OS reports prefers-reduced-motion
    When I launch the slice for the first time
    Then the moonrise is an instant cut with a 400ms ambient bed fade-in
    And the camera y-offset tween does not fire

  Scenario: Held-success is dwell-to-savour
    Given I complete a night's goal
    When the goal-met audio bell fires
    Then the harbour ring goes cream and the camera ease-in plays
    And after 1500ms (the savour minimum) any pointer press advances to the next scene
    And after 2500ms the scene auto-advances if no input arrives
    And no visible "advance now" prompt or counter is rendered

  Scenario: Intent beat fires on each night
    Given I enter Night 1, 2, or 3 for the first time in this session
    When the title card has finished fading
    Then a single visual beat plays before pull-input is enabled:
      | Night | Beat                                                          |
      | 1     | Harbour ring pulses once at 0.6Hz                             |
      | 2     | A faint ring scales 1.0->1.15->1.0 at the lantern centroid    |
      | 3     | A foam-stop ring expands from the east edge midpoint over 800ms |
    And input enables ~2s after title-card fade
    And any input during the intent beat skips it and enables input immediately

  Scenario: N3 has receiver variety via headland fire
    Given I am playing Night 3
    When a lantern crosses the headland near (1700, 980) for the first time
    Then a small fire sprite ignites at that position
    And a soft warm chime plays
    And the fire stays lit for the rest of the night

  Scenario: N3 closes with a callback
    Given I have just completed Night 3
    When the goal-met audio bell fires
    Then 1500ms later a final bell fires at the same frequency as the Night 1 goal-met bell
    And 2000ms after that final bell the ambient master gain fades to silence over 4 seconds
    And the player can advance early via pointer press

  Scenario: Cursor tether shimmer replaces trail
    Given I am holding the mouse during a night
    When a non-sent receiver is within pullRadius * RECEIVER_PULL_RADIUS_MULTIPLIER of the cursor
    Then a thin line is drawn from cursor to that receiver
    And the line alpha scales with hold strength and inverse distance
    And the line is omitted under prefers-reduced-motion (replaced with a single static frame)
    And the cursorTrail.ts code path no longer exists

  Scenario: Trailer-cut-1.mp4 exists
    Given the closure sprint has shipped
    Then docs/specs/trailer-cut-1.mp4 exists
    And the file plays the 30-second cut described in docs/specs/trailer-cut.md

  Scenario: Stranger-test passes
    Given a non-developer who has not seen the game
    When they open the URL on this Windows machine, no priming
    Then they engage with the picker / sandbox surface unprompted for at least 60 seconds
    And on invitation they complete Nights 1, 2, 3 in 8 to 12 minutes
    And no fail screens, pop-ups, or on-screen text other than the three title cards are rendered
    And the parallel pass with prefers-reduced-motion toggled on yields the same outcome

  Scenario: Steam page draft exists
    Given the closure sprint has shipped
    Then docs/specs/2026-05-XX-steam-page-draft.md exists
    And it contains: final name (Neap), tagline, three-paragraph description, primary + secondary tags, three screenshots, capsule mock, trailer reference, comp-set, pricing range

  Scenario: WCAG re-audit passes
    Given all three lunar palettes are active
    When I compute relative-luminance contrast ratio for every interactive sprite against its worst-case water tile per phase
    Then every text element passes ≥ 4.5:1
    And every non-text interactive sprite passes ≥ 3:1
    And the deuteranopia / protanopia / tritanopia simulations show distinguishable receivers at every phase
    And the results are recorded in docs/specs/build-log.md
```

# Open questions

These are the questions the council could not unanimously close. They are recorded here so the user (or a future contributor) can adjudicate.

1. **OQ18 direct-receiver-pull purity** — adjudicated to **N3-only** in the spec (UX's R2 position), but **the trailer recording is the empirical resolver**. If `trailer-cut-1.mp4` reads as "the moon pulls things directly" on Night 3 such that the wedge clause "where the bay changes with tonight's phase" feels broken, gamification's "soften to flow assist" wins on the next pass. If the trailer reads as "the moon pulls water → water pulls things" through-line, UX's N3-only is the resolution.

2. **N3 receiver variety shape** — storyboarder's "headland fire ignited by passing lanterns" (chosen for this spec) versus gamification's "two of the six lanterns behave differently (reluctant, drift back if not committed)." Both could ship together. The spec ships storyboarder's first because it adds a new visual element (which solves the lantern-repeat flatness more directly) at lower cost; gamification's reluctant-lanterns are a v1.0-polish add-on if the slice needs more depth on subsequent playthroughs.

3. **Final wording of the N3 title-card line** — storyboarder authors. Three candidates listed in §13.

4. **`?night=N` URL override removal timing** — currently kept as DEV-ONLY through this sprint. The team agrees it has to go before any public deployment but no specialist has named *when* in v1.0+ that happens. Defer to PM at the first public-deployment decision point.

# Appendix A: Round 1 retrospective memos (verbatim, all six)

## A.1 storyboarder

### Take

The slice landed the cosmic-intimate shape I held the line on, and it landed it more completely than I dared hope on Day 2. Three nights, one bay, three lunar phases, the moon literally in the player's hand — the kishōtenketsu compression survived first contact with the build pipeline. The two beats I conceded in Round 4 (the moonrise, the held-success ease-in) were both built anyway in the post-slice polish pass — I was wrong to give them up, and PM/UX were right to keep them in the spec. What ships now is the version of *Tide / Pull* I described in Round 1, not a watered-down compromise. That said, the bay still feels like *one bay over three nights* more than *a place with a memory* — ghosts at 35% alpha aren't quite the emotional callback I imagined, and Night 3's *ketsu* (the lanterns going east) is mechanically a "send 4 of 6 across an invisible line" task; the *farewell* register I argued for in Round 4 isn't quite legible without copy. The bones are right. The grace notes need another pass.

### Observations

- Moonrise shipped — and it's the right version of it. `game/src/render/moonrise.ts` runs 8s on first launch, 1.8s on return, skippable on any input, gated behind `?night=N` URL override. PM was right to push back on the always-on cinematic; UX's tiered version (which ships) keeps the *ki* beat where it earns its keep.
- Cursor IS the moon, and visibly phases. `game/src/render/cursor.ts` lines 32–44 — three distinct discs (waxing 24px warm-cream / full 32px + halo / waning 28px + trailing shadow). The pull-radius ring is also drawn around the cursor (added in the polish pass), which makes the moon's *reach* legible without text.
- Three-string title card lands clean. Three lines, system-ui 48pt, 3s hold, skippable. The lines do real tonal work.
- Held-success beat shipped. `applyHeldSuccessEase` runs a 1.5s cubic ease worldLayer.scale 1.0 → 1.12 on goal completion, then auto-advance 2.5s after.
- Persistent ghosts are mechanically present but emotionally thin. Build-log day 8 confirms in-session only — *cross-session ghosts deferred*. So if the player closes the tab between nights (perfectly plausible across an 8–12 minute session), the bay arrives empty.
- Night 3 *ketsu* is "send 4 lanterns past x>1920," not "farewell." Six lanterns lined along the south edge crossing east is geometry, not departure. The sigh-of-release I argued for isn't audio-cued differently from any other release. The verb works; the *farewell* register is fragile.
- Soft-drift survived intact and is the gentle-failure model I wanted.
- Ambient creatures landed (post-slice). 3 gulls + intermittent ripples every 4–9s. The bay feels like a place rather than a level.

### Recommendations

- **[P1] Cross-session ghosts** — the persistent-bay claim halves the moment a player closes the tab. — cost: S
- **[P1] Night-3 *ketsu* needs a farewell beat that isn't shared with N1/N2** — the moon dips below the horizon, the ambient bed fades to silence over ~3s, the title card returns one line ("The bay is quiet now."). — cost: S
- **[P1] Per-lantern "release-into-current" SFX on Night 3** — one soft per-crossing chime, slightly lower in pitch than the bell. — cost: S
- **[P2] Sandbox at the picker is currently silent water** — mounting one persistent ghost layer at the picker (a faint boat in the harbour, faint lanterns drifting). — cost: S
- **[P2] Title-card line for Night 3 telegraphs the wrong frame** — "The lanterns are lit." is descriptive, not directional. Suggest: "Waning gibbous. Time to let them go." or "Waning gibbous. The tide carries them out tonight." — cost: S
- **[P2] Gull-passes during the held-success beat** — a scripted gull-pass triggered on goal-complete (one bird crossing the bay over ~2s). — cost: M
- **[P3] Ambient bed needs to *resolve*, not just stop, after Night 3** — cost: S
- **[P3] One bonus night that's *kishōtenketsu* expanded** (eclipse / king tide / one-night-only weather). — cost: L

### Tensions

- "Send" was the right verb but the *receiver* was the wrong shape. Six lanterns lined up along a south-edge headland reads like asset placement, not a beach where someone lit them. A small rocky pier or jetty graphic underneath the lanterns would make the south edge feel *human-touched*.
- The pulse on the harbour ring (post-slice polish, 0.6Hz, depth 0.18) is a UX affordance more than a story beat. I'd tune the depth down to 0.10 and slow it to 0.4Hz.
- The post-slice direct-receiver-pull force is the right fix for sluggishness, but it shifts the verb's grammar. Pre-fix, the moon moved water and the water moved boats — pure indirection. Post-fix, the moon also pulls boats directly. It feels better to play; it's slightly less *moon-pulling-tides-pulling-boats*.
- Free-reentry exposes the picker as the "real" home, not Night 1. The picker doesn't tell a story — it's three glyphs on water.

### Open questions for the user

1. Should cross-session ghosts persist?
2. Is the picker the right home for free-reentry, or should free-reentry land directly back on Night 3?
3. Does the slice need a Night 3 farewell title card / fade-to-silence end-of-session beat?
4. Are you happy with "Tide / Pull" as the ship name, or is the rename still on the table?
5. The bonus fourth night — worth knowing if "post-slice" means "polish what's there" or "extend the arc."

```
MEMO_ROUND: 1 (retrospective)
AGENT: storyboarder
```

---

## A.2 gamification-designer

### Take

The toy is here. *Tide / Pull* shipped as a cosy-physics-toy in the *Where's My Water?* / *Townscaper* lineage I argued for, and the day-3 cellular-automaton spike — with its height-pump, advection, pressure pass and (post-fix) velocity clamp — does the thing I most cared about: the surface answers the cursor in under a frame and keeps answering after release. The release-as-payoff held, the soft-drift no-modal failure model is exactly the loop I held the line on, and the moonrise + held-success ease-in landed in the post-slice polish where I kept arguing they belonged. The two reported feel-bugs (sluggish boat, arena-wipe) were the right bugs to surface — they were the difference between "interesting sim" and "hypnotic toy" — and the retune (`HEIGHT_PUMP` 1.2 → 0.55, `MAX_VELOCITY` clamp, `RECEIVER_DIRECT_PULL` direct-attraction) is honest engineering: we admitted the physics-only intent-readout had a dead zone and added a parallel intent channel rather than papering over it. Net: the toy feels like a toy now, not a physics demo. What it doesn't yet feel like is three distinct nights — the receiver-variety promise compressed harder than we wanted.

### Observations

- Core / meta / meta-meta survived contact. Lunar phase modulates `pullStrength` / `pullRadius` / palette / audio cutoff, and within-session ghosts paint earlier nights into the bay. That *is* a meta-meta — modest, in-session, ethics-clean.
- The release juice budget I claimed in C2 actually shipped. Press-attack at 50 ms attack / 400 ms decay paired with the release-whoosh; bell+swell pair on `goalMet`; duck-on-drift on the bed.
- Soft-drift is the cleanest piece of work in the slice. SDT competence preserved without punishment.
- The post-fix `applyReceiverAttraction` is conceptually a small compromise on "input *is* the physics". It works, it's gentle, and it's keyed off the same `pullStrength`/`pullRadius` so phase still differentiates — but it is a second channel of intent.
- "One new receiver per level" only half-shipped. N1 boat / N2 lanterns × 8 / N3 lanterns × 6. The visible-receiver-novelty curve is boat → lantern → lantern.
- Pull-radius ring + hold halo is the affordance I should have shouted for in Round 1.

### Recommendations

- **[P1] Restore receiver variety on N3 — beach-fire OR a creature, not lanterns again.** Cost: M.
- **[P1] Surface direct-receiver-pull in the cursor language.** Faint thread/tether shimmer between cursor and any receiver inside `pullRadius * 1.8` while holding. Cost: S.
- **[P1] Held-success duration is currently a flat 2500 ms hold + 1500 ms scale ease.** Stretch the ease to 2200 ms, end on a held still frame for ~600 ms. Cost: S.
- **[P2] N2 lantern-gather has a centroid-drift footgun.** Switch to "lanterns within `clusterRadius` of cursor" with a 1 s held threshold. Cost: S.
- **[P2] Add a fourth, receiver-only "weather" night to the picker post-completion** (sandbox variant). Cost: M.
- **[P2] Hold-ceiling feedback on the cursor** (Round-1 P3, still unshipped). Cost: S.
- **[P3] Per-night water surface reactivity, not just palette.** Cost: M.
- **[P3] Sent-lantern fadeout is 600 ms; on a still frame N3 ends with abrupt silence. Add a final lone-bell tone ~1.5 s after `goal.complete` resolves.** Cost: S.

### Tensions

- Honesty: this is one-verb continuous-aim, and the third verb is now genuinely a verb. The "one button" line is fine in marketing copy; let's not let it constrain the next sprint's design vocabulary.
- The third-verb pick "send" landed well but as a player-facing label is weaker than what the verb actually is. "Send" is a programmer noun.
- Audio scope: 5 cues + 1 bed shipped, against the 1+4 ceiling I conceded to UX. UX was right; I'd defend the current count but not push for more.
- "One new receiver per level" — I'd push back on this in retrospect, hard. The lantern-twice choice cost the receiver-variety promise.
- Ambient life is lovely but borderline cosmetic. Gulls + ripples are spectators, not participants.

### Open questions for the user

1. Is N3's third receiver the lock-in, or did we ship "lanterns again" because send + lanterns was the easiest day-7 path?
2. Do you want a fourth sandbox night surfaced explicitly?
3. Is "send" the player-facing word, or is that a copy decision still open?
4. The post-fix `applyReceiverAttraction` is a working compromise. Are you satisfied with it as the answer?
5. What's the next sprint's success criterion?

```
MEMO_ROUND: 1 (retrospective)
AGENT: gamification-designer
```

---

## A.3 habit-formation

### Take

The slice ships clean. Every item from the ban list I authored in Round 1 / locked in Round 2 is honoured in code, not just in spec — `state/save.ts` writes a single `tide-pull/save/v1` key, `state/meta.ts` persists only `completedNights` + `freeReentry` (no real-world date, no streak field, no attempts), `nightPicker.ts` dims unselectable slots to alpha 0.25 with no padlock iconography ever, `package.json` has exactly one runtime dep (`pixi.js`), no analytics SDK is even installed, the `Notification`/`fetch`/`XHR`/`WebSocket`/`setInterval` greps return zero matches in `src/`, and `HOW-TO-PLAY.md` reproduces the ban list in plain language. The "lunar as in-session rhythm, not real-world calendar" call survived intact. The natural-trigger retention story is *thin in the slice* (because there are only three nights and they don't change between sessions other than by completion state), but that thinness is the honest cost of the Round 3 cuts. My job in retrospect is mostly: don't spike the football, surface the two soft-compulsion drifts I see in the live build, and name the post-slice ethics risks the design phase didn't anticipate.

### Observations

- `game/src/state/save.ts` — single key `tide-pull/save/v1`, version-gated, swallows quota errors. No date, no streak, no attempts. Compliant.
- `game/src/state/meta.ts` — `MetaState` carries `completedNights: Set<NightNumber>`, `freeReentry: boolean`, `sessionGhosts: Map`. No "bays played" counter, no attempts tally.
- `game/src/scenes/nightPicker.ts:42-56` — selectable slots are alpha 1.0; unselectable are alpha 0.25 with `eventMode = 'none'`. **No padlock, no completion tick, no progress bar.**
- `game/src/main.ts:217-228` — held-success at 2.5s before `finishCurrentNight`. The 2.5s number is unilateral — never explicitly costed by the council.
- `docs/HOW-TO-PLAY.md` — language audit clean. No "complete every night to unlock", no "X% complete", no "you missed", no "come back".
- `game/src/audio/manager.ts` — single bed with phase-aware filter automation; `setPhase` is called on `enterNight` but **not stopped or attenuated when the picker shows**.

### Recommendations

- **[P1] Re-frame the 2.5s held-success delay as a *pacing beat the player can shorten*, not an auto-advance.** Continue pulling-input is honoured during the 2.5s window; **or** require an explicit release before advancing. Cost: S.
- **[P1] Audio bed should fade ~30% over 600ms when entering the picker, lift back on night entry.** Cost: S.
- **[P2] No-explicit-quit means no graceful exit ritual — add one.** After 30s of idle on the picker, the bed quiets to near-silence and the moon-glyphs dim. Cost: S.
- **[P2] Add a pre-emptive design-spec note for any future "share clip" feature.** Memo it now into `conventions.md` as "no in-game social surface, ever — clip recording is OS-level only". Cost: S.
- **[P3] Defer-but-name: any post-slice "today's bay" / daily seed must ship as sandbox-only with no completion record.** Cost: M (post-slice).
- **[P3] Add one creature-of-the-session that appears unscheduled.** Cost: S–M (post-slice).

### Tensions

- The 2.5s auto-advance is the one place the build drifted into mild compulsion that the spec does not authorise. A 2.5s held-success window where you can't decline to advance is the same shape as an unskippable transition.
- Hover-scale on selectable picker glyphs but no completion ticks reads correctly to me as "phases-only, equal-weight after free-reentry".
- Audio bed continuing into the picker is borderline. The duck is the cosy answer.
- `build-log.md:241` notes cluster-progress visual feedback was deferred. On Night 2 (gather) this means the success state is partly inaudible to a deaf or audio-off player — a11y issue dressed as a habit-formation issue.

### Open questions for the user

1. The 2.5s held-success auto-advance — does it feel like pacing or like compulsion?
2. After all three nights, when the picker first appears, did you feel the "I am being shown a menu" beat?
3. Have you ever hit the picker, sat on it for >30s, and felt the absence of a "this is a good place to stop" cue?
4. For post-slice: is there any scenario you imagine where you would want a "today's bay" surface with any kind of completion record?
5. The dev-only `?night=N` URL override — will it actually be removed?

```
MEMO_ROUND: 1 (retrospective)
AGENT: habit-formation
```

---

## A.4 ux-designer

### Take

The build mostly honoured the bible — but with an uncomfortable irony: the player still arrives saying "I need more instructions," and our response was a README and a HOW-TO-PLAY page outside the game. That is a UX failure I own. The cosy-without-soup brief did land — `WATER_PALETTES` keeps the deepest-to-foam contrast envelope (~7:1) across all three phases. The cursor-IS-the-moon decision shipped end-to-end. The release-is-the-payoff motion bible held. Where I let the bible drift — moonrise to 8s/1.8s rather than 6–10s/1.5–2s, picker hover at 1.1× — those drifts are inside their stated ranges. Where I genuinely failed: I argued for the "intent beat" in Round 2, the council accepted it, and I did not specify it tightly enough in the bible. It is not in the build. That, more than anything else, is why the player wants instructions.

### Observations

- Pull-feedback timings — pass. `HOLD_RAMP_MS = 400`. Press response is one frame.
- Per-phase palette envelope — likely passes CB sim, but never re-tested. The day-9 audit only computed against the canonical waxing palette.
- Cursor disc + ring — pass with one drift. 24/32/28 disc radii match bible exactly; pull radii 80/140/110 match. Ring alpha goes 0.18 → 0.63 on full hold.
- Reduce-motion — implemented, but **moonrise itself does not honour reduce-motion**. `render/moonrise.ts` has no `prefersReducedMotion()` call. Bible specified "Instant cut + 400 ms ambient bed fade-in only." A reduce-motion user gets the full 8-second camera lift on first launch. That is a regression against my own spec.
- Title card + held-success — pass.
- Goal communication / discoverability — incomplete. Night 1 has the pulsing harbour ring; Nights 2 and 3 have no equivalent.

### Recommendations

- **[P1] Ship a true intent beat for all three nights.** Two seconds total before player input enables. Cost: S.
- **[P1] Reduce-motion swap for moonrise.** One-line `prefersReducedMotion()` check in `moonrise.ts:21` to skip to elapsed=duration immediately. Cost: S.
- **[P2] Re-run the WCAG/CB audit against all three palettes.** Cost: S.
- **[P2] On-cursor "you are pulling" legibility uplift** — thin (1px) inner radius indicator. Cost: S.
- **[P3] Sent-lantern fade is correct (`entities.ts:60-71`); no change needed** — calling out as a positive.
- **[P3] Picker glyph reachability** — comfortable. No change. Cost: 0.

### Tensions

- Moonrise duration drift (10s/2s spec → 8s/1.8s build) — acceptable. The user wants verb sooner, not later.
- Per-phase water tints — do they read in still frames? Honestly, I am not sure.
- Cursor-trail at low opacity for clip legibility — does it actually help? I am genuinely uncertain.
- The "discoverability without text" rule vs. the player's actual experience. The intent beat is the right in-game answer; we should ship it before treating the README as the solution.

### Open questions for the user

1. Are you open to a 2-second pre-input "intent beat" on level entry?
2. Do you want me to push to remove the README/HOW-TO-PLAY as the discoverability answer?
3. The waning-gibbous palette likely passes WCAG 1.4.11 against its own deepest tile but I have not verified.

```
MEMO_ROUND: 1 (retrospective)
AGENT: ux-designer
```

---

## A.5 pm

### Take

The slice shipped. Within the 10-day budget, with all six of my Round-4 risk-register items either retired or accepted-and-survived, and with the day-3 fluid-sim kill gate code-passing on first attempt. The three-levels-not-six call held: three nights, three verbs, one persistent bay, and the kishōtenketsu landing on Night 3 the storyboarder wanted. The 6-cue audio compromise survived contact with reality — and the synthesis-not-recordings choice retired the day-5 audio-mute risk entirely. I am happy with the 10 days. I am less happy with the unbudgeted week of post-slice work that followed: the discoverability pass, the all-deferred polish pass, the boat-barely-moves bug, and now this retrospective. That work was good and the game is better for it, but none of it was in my plan. The slice was complete on day 10. The thing currently sitting in `c:\Dev\gameX\game` is a *post-slice v0.5*, not a slice, and we should call it that.

### Observations

- Day-3 kill gate passed at code level; SPH-lite (`sim/particles.ts`) was correctly never created.
- My three-levels-not-six call saved roughly five days.
- The audio compromise survived but only because we synthesised everything. Better outcome than my fallback.
- Post-slice scope crept by ~30%. None of this was in the day-1-to-10 plan.
- The dev-agent worktree-isolation cache issue should be in the post-mortem.
- The reviewer agent caught one real issue (`strict: true` missing) and three polish items, two of which got fixed same-day.

### Recommendations

- **[P1] Declare "v0.5 shipped" and stop building.** Cost: S.
- **[P1] Run the canonical stranger-test.** Cost: S.
- **[P1] Record the trailer .mp4 from `docs/specs/trailer-cut.md`.** Cost: S.
- **[P2] Decide rename.** Cost: S as decision, L as renaming-execution.
- **[P2] Cross-session ghost persistence.** Cost: S.
- **[P3] V1.0 expansion arc** (the additional three nights). Cost: M-to-L.
- **[P3] Adapt phase-3/4 build-pipeline agents for the next game.** Cost: M.

**Kill-criteria for "the slice is done shipping":** stranger-test passes, trailer .mp4 exists, no critical bugs in the bug log for one calendar week.

### Tensions

- Scope crept by ~30% in post-slice and we let it. The orchestrator should have escalated "should we ship this or build more?" to the user *before* the polish pass.
- The held-success-then-auto-advance flow grew between day 8 and the polish pass.
- The discoverability pass (README + HOW-TO-PLAY) is a tell.
- The post-build retrospective itself counts as schedule.
- The boat-barely-moves bug is the closest thing we have to a missed acceptance.

### Open questions for the user

1. Is this v0.5 or v1.0?
2. Stranger-test scheduling.
3. Trailer recording.
4. Rename.
5. Next slice or done?

```
MEMO_ROUND: 1 (retrospective)
AGENT: pm
```

---

## A.6 product-strategist

### Take

The slice earns the wedge — but only after the all-deferred polish pass dragged it across the line. As of the day-10 review the build was a *Spilled!*-adjacent risk: same palette across all three nights, no moonrise, audio-only differentiation. The polish pass added `WATER_PALETTES` per phase, the moonrise beat (`render/moonrise.ts`), the held-success ease, ambient gulls + ripples, and the cursor halo that visualises the moon's reach. That last set of additions is what now makes the wedge sentence verifiable in the build, not just the spec. The lineage *Tide / Pull* is now legible: *Where's My Water?* (input-is-physics, single expressive verb) + *Townscaper* (one-toy cosy minimalism, screenshot-legible) + *A Building Full of Cats* (low-stakes, intimate). The trailer-cut sketch I drew at R2 still ships from this build verbatim *with one caveat*. The cosy-cosmic-intimate tone has landed in code, not just spec. The biggest unaddressed strategic risk is the rename. The slug "tide-pull" is now baked into `localStorage` (`tide-pull/save/v1`), repo URL (`NBS1997/gameX`), and player-facing copy.

### Observations

- Wedge sentence maps clause-by-clause to visible features. All five clauses survive code review.
- Per-phase visual differentiation now reads in still frames. **A curator-grade screenshot is now distinguishable per night.**
- The trailer cut as drafted is now buildable verbatim — except the moonrise length. The 1.8s abridged version cuts into the 3-second lift block but works as a return-launch trailer take.
- Steam tag stack delivers, mostly. All six primary tags map to shipped features.
- Long-term shape is invisible in the slice. The picker shows three glyphs equally — there's no visual hint that the post-slice game grows.
- Curator screenshots: the build now produces ones they'd post.
- Rename has not pre-baked publicly. Window for rename closes the moment a Steam page goes up.

### Recommendations

- **[P1] Rename before any pre-public surface (Steam page draft, itch page, social handle) — cost: M.** Current pick: ***Lull*** — one syllable, search-clean, lunar-adjacent via "lull of the tide".
- **[P1] Record `trailer-cut-1.mp4` from this build — cost: S.**
- **[P1] Steam page draft, even if not published — cost: M.**
- **[P2] Curator outreach list** (Comfy Cozy Gaming, Wholesome Games, Cozy Game Club, Those Awesome Indies, Camp Cozy Games). — cost: S.
- **[P2] Add the long-term-shape tell to the picker** — a faint silhouette of a second bay's headland in the picker margin. — cost: S.
- **[P2] Mobile/touch port — defer the question, but document the answer if asked — cost: L if pursued.**
- **[P3] Consider a "second bay" content drop as the post-slice expansion — cost: L.**

### Tensions

- Audio is fully synthesised; Steam page audio sample needs recorded music. Functional for the slice and for the trailer's first take. Not functional for a Steam page audio sample where players preview a 10-second loop in isolation.
- The 1.8s abridged moonrise versus the trailer's 3-second opening lift.
- The cosy curator audience reads the gulls + ripples as cosy-cosmic. Curators who came up on *Stardew Valley* + *Wholesome Direct* may read the cellular grid as "needs more art." My posture: lean in.
- The build drifted on screenshot policy. `HOW-TO-PLAY.md` lists "no in-game wishlist surface" as a feature, which reads as defensive. Suggest re-framing for any Steam-page copy.

### Open questions for the user

1. Rename or hold? (*Lull* is my current pick.)
2. Steam page draft now or post-trailer?
3. Recorded audio for the Steam page audio sample — mid-2026 commitment?
4. Mobile/touch port — on the table at all?
5. Second-bay content drop — interest level?

```
MEMO_ROUND: 1 (retrospective)
AGENT: product-strategist
```

---

# Appendix B: Organised Findings (verbatim)

Reproduced verbatim from the orchestrator synthesis between Round 1 and Round 2. (The body of the synthesis appears in the conversation transcript and is summarised in the spec body above; the 18 open questions are the primary artefact.)

The 18 open questions, by category:

**Strategic (1–7):** v0.5 vs v1.0 / rename now / record trailer / stranger-test / recorded audio / mobile port / 4th-night.
**Build (8–14):** cross-session ghosts / N3 receiver variety / held-success direction / all-three-nights intent beat / moonrise reduce-motion / N3 fade-to-silence ending / picker as place.
**Copy / surface (15–18):** N3 verb-label / N3 title-card line / cursor-trail keep-or-cut / direct-receiver-pull purity.

User redirection between Round 1 and Round 2: *"keep discussing as if I'm not here, the team has the responsibility to get it right."* Recorded as full delegation; the team self-resolved.

---

# Appendix C: Round 2 critiques (verbatim, all six)

## C.1 storyboarder

### Where I concede

- **Held-success duration is genuinely contested, not a clear "more resolution" call.** Habit-formation's framing is correct and I underweighted it. The fix isn't "make it longer" but "make the held-still tail interruptible and the ease itself shorter and more legible." Withdrawing the linger framing.
- **The picker scene is a place, not a beat.** I pushed for "picker as a 4th sandbox night" in R1. Habit-formation and gamification both flagged risk of turning the post-completion idle into a recordable performance surface. The picker should *be* a place — gentle ambient life, water still flowing, glyphs at rest — not a *night*. No 4th-night naming, no goal, no completion tick.
- **"Send" vs "release" — gamification was sharper than me.** The N3 title-card line should use "let go" or "release" language.
- **The discoverability patch (README + HOW-TO-PLAY) is a tell, not a fix.** Once the intent beat lands on all three nights, the HOW-TO-PLAY can be retired or relegated.

### Where I hold the line

- **Cross-session ghost persistence is the highest-payoff narrative fix in the whole backlog.** Holding it as **P1**.
- **N3 ends in a callback, not a fade-to-silence.** The bell should reuse the *same* tone as the N1 harbour bell. Two notes, two nights apart, same pitch — the bay closing its own loop.
- **N3 receiver variety is non-negotiable.** **A small fire on the headland that the released lanterns ignite as they pass** is one cheap option. Holding P1.
- **Direct-receiver-pull purity matters for the verb grammar.** The cursor tether shimmer is the right reconciliation — make the direct-pull *visible* so the player reads it as moonlight on the boat.
- **Moonrise reduce-motion bug is a P1 narrative bug, not just a11y.** The opening beat is broken for an audience we said we'd respect.

### Revised recommendations

- [P1] Cross-session ghost persistence — cost: S
- [P1] Intent beat on all three nights — cost: S
- [P1] N3 second receiver (small headland fire ignited by passing lanterns) — cost: S
- [P1] Moonrise reduce-motion path — cost: S
- [P1] N3 final bell + ambient resolve (callback to N1 bell) — cost: S
- [P1] Cursor tether shimmer for direct-pull — cost: S
- [P1] Rename to *Lull* before any public surface — cost: S
- [P2] Held-success: 1.5s ease-in + ~600ms held-still tail, *interruptible* on press — cost: M
- [P2] N3 verb-label "release" / "let go" in title-card line — cost: S
- [P2] Picker: ambient life softens, no completion ticks, no goal — cost: S
- [P2] Drop README/HOW-TO-PLAY once intent beats land — cost: S
- [P3] Stranger-test → if it passes, declare v0.5 shipped per pm — cost: S
- [P3] Recorded foley (replace synth) for Steam-page launch — cost: L

### Positions on the 18 open questions

1. v0.5 vs v1.0 — DEFER TO pm. Slice is v0.5.
2. Rename now / later — Now (decide), later (execute on Steam page).
3. Record trailer — Yes. P1.
4. Stranger-test — Run before declaring v0.5. Non-negotiable.
5. Recorded audio — Slice ships synth. v1.0 needs foley.
6. Mobile port — DEFER TO product-strategist.
7. 4th-night question — No 4th night. Picker is a place.
8. Cross-session ghosts — P1. Ship.
9. N3 receiver variety — P1. Headland fire.
10. Held-success direction — 1.5s ease-in + ~600ms held-still, interruptible on press.
11. All-three-nights intent beat — P1. Ship.
12. Moonrise reduce-motion — P1. One-line fix.
13. N3 fade-to-silence ending — Final bell callback, *then* ambient resolves.
14. Picker as place — Ambient life, no goal, no completion tick.
15. N3 verb-label — "Release" or "let go." Not "send."
16. N3 title-card line — DEFER TO documentation-writer. My suggestion: "Waning gibbous. Let go what the bay's been holding."
17. Cursor-trail — DEFER TO ux-designer.
18. Direct-receiver-pull purity — Keep the direct-pull but make it *visible* via cursor tether shimmer.

```
MEMO_ROUND: 2 (retrospective)
AGENT: storyboarder
```

---

## C.2 gamification-designer

### Where I concede

1. **Direct-receiver-pull is a verb-grammar shift, not a polish item.** Storyboarder is right. If we touch attraction tuning we keep it strictly as a soft proximity assist on the existing flow, not a direct vector.
2. **The "stacked ~3.5s minimum" is wrong as I framed it.** The 1.5s is a verb-met *threshold*; the 2.5s is a *post-complete savour beat*. The real number to argue about is the 2.5s post-complete beat.
3. **README/HOW-TO-PLAY is a discoverability failure I share with UX.** I did not own that gamification owns the diegetic onboarding signal.
4. **Strategist's "synth audio is Steam-page-blocking" lands.** The trailer audio bed needs a recorded layer before public surface.

### Where I hold the line

1. **2.5s post-complete hold stays at 2.5s, but becomes player-shortenable, not opt-in.** Any input during the savour collapses the remainder and advances. No checkbox, no menu — the player *learns* they can tap to skip on the second night.
2. **N3 lantern-repeat is the biggest pacing flatness and that holds.** Receiver-variety inside N3 is P1.
3. **N3 verb-label is "release", not "send".** "Send" implies *destination*; "release" describes the player's hand action.
4. **N3 needs a fade-to-silence ending beat. P1.**
5. **Picker is mechanically fine but emotionally thin** — and *that* is gamification's problem, not just storyboarder's.
6. **Auto-advance vs picker after first playthrough is a flow-shape decision, not a habit decision.** Already in code; what's contested is only the duration of the savour.

### Revised recommendations

- [P1] N3 release-beat + fade-to-silence — cost: S
- [P1] N3 receiver variety (2 of the 6 lanterns behave differently) — cost: M
- [P1] Cross-session ghost persistence — cost: S
- [P1] Tap-to-shorten the 2.5s savour — cost: S
- [P1] N3 title card reads "Release" (or "Let go") — cost: XS
- [P1] Per-lantern crossing chime on N3 — cost: S
- [P2] Diegetic intent-beat for N2 + N3 — cost: S
- [P2] Recorded ambient bed for trailer / Steam-page autoplay — cost: M
- [P2] N3 ambient resolve curves into the picker — cost: S
- [P3] Sandbox at picker: persistent ghosts + free-pull, no goal — cost: M
- [P3] N4 prototype (king tide / eclipse) as gamification's R&D track for v1.0 — cost: L

### Positions on the 18 open questions

1. v0.5 vs v1.0 — Declare v0.5 shipped now; freeze scope.
2. Rename — DEFER TO product-strategist.
3. Trailer recording — Yes, record this week.
4. Stranger-test — DEFER TO pm.
5. Recorded audio for Steam page — DEFER TO product-strategist.
6. Mobile/touch — Defer with documented answer.
7. 4th night / N4 — Deferred to v1.0.
8. Cross-session ghosts — Ship. P1.
9. N3 receiver variety — Ship. P1.
10. Held-success direction — 2.5s stays; tap-to-shorten added.
11. All-three-nights intent beat — Ship for N2 and N3. DEFER TO ux-designer on motion vocabulary.
12. Moonrise reduce-motion — Ship. P1 a11y.
13. N3 fade-to-silence — Ship. P1.
14. Picker as place — Ship: mount persistent ghosts. P1.
15. N3 verb-label — *Release* (or *Let go*).
16. N3 title-card line — DEFER TO storyboarder.
17. Cursor-trail — DEFER TO ux-designer.
18. Direct-receiver-pull purity — Hold the line. Water is the medium.

```
MEMO_ROUND: 2 (retrospective)
AGENT: gamification-designer
```

---

## C.3 habit-formation

### Where I concede

**Auto-advance: I was wrong to push for "shorter or opt-in" as a binary.** Gamification's stretch-to-2.2s + 600ms held-still tail is a *world-event variable-reward* applied at the conclusion of a player-initiated ritual, not a *frequency-of-action* schedule. That's inside the perimeter, not outside it. I concede the duration argument. What I keep is the *opt-out*: any player should be able to skip the tail with a click after ~1.5s.

**Storyboarder's per-lantern crossing chime is better than my "ritual greeting" instinct.** Reorder above any session-bookending ritual.

**README/HOW-TO-PLAY: UX is right that the intent beat should subsume them across all three nights.** Pull it once N1/N2/N3 intent beats all ship.

**Strategist's "synth audio is Steam-page-blocking" lands.** Concede this for the Steam page.

### Where I hold the line

**The 30s idle ritual stays withdrawn and I'd oppose anyone reintroducing it.** Anything that activates because a player is *not* doing something risks becoming a guilt nudge by adjacency.

**Picker bed duck (-6dB on hover) holds as P2.** Autonomy-supporting at the navigation layer.

**No cross-session streak surfacing on the ghost feature.** The ghost is a trace of *what the bay did*, not a counter of *what the player did*.

**Hold the line against any "come back tomorrow" copy on the N3 farewell beat.**

**Synthesised audio: ship for the slice, replace before any public surface.**

### Revised recommendations

- [P1] Cross-session ghosts as place-memory, no visit-counter — cost: M
- [P1] N3 farewell beat (storyboarder's design) — cost: S
- [P1] Per-lantern crossing chime — cost: S
- [P1] Stretch held-success to 2.2s + 600ms held-still, with click-skip after 1.5s — cost: S
- [P1] N3 receiver variety (fire/creature) — cost: M
- [P1] All-three-nights intent beat, then remove README/HOW-TO-PLAY belts — cost: M
- [P2] Picker bed duck on hover (-6dB) — cost: S
- [P2] Sandbox at picker (mount persistent ghosts) — cost: M
- [P2] Stranger-test before declaring v0.5 — cost: S
- [P3] Final lone bell ~1.5s after N3 fade — cost: S
- [P3] N4 sandbox bonus night (eclipse / king tide) — only if it remains discovery-not-obligation — cost: L

### Positions on the 18 open questions

1. v0.5 vs v1.0 — Declare v0.5 shipped.
2. Rename — Yes, before any public surface. DEFER TO product-strategist.
3. Trailer .mp4 — Record now. Outside my perimeter concerns.
4. Stranger-test — Mandatory before v0.5; this is partly an ethics check.
5. Recorded audio — v1.0 blocker. DEFER TO product-strategist on timing.
6. Mobile/touch — Defer.
7. 4th-night question — Ship as picker-sandbox (P2), not as a scheduled "return on the 4th night."
8. Cross-session ghosts — Ship P1. Bay-as-place only; no visit count, no "welcome back."
9. N3 receiver variety — Ship P1.
10. Held-success direction — Stretch to 2.2s + 600ms held-still tail, with click-skip after 1.5s.
11. All-three-nights intent beat — Ship P1, then pull README/HOW-TO-PLAY.
12. Moonrise reduce-motion — Ship P1. DEFER TO ux-designer on the swap detail.
13. N3 fade-to-silence — Ship P1.
14. Picker as place — Ship P2 with persistent ghosts.
15. N3 verb-label — "release" or "let go" over "send."
16. N3 title-card line — "The bay is quiet now" or similar descriptive. No imperative.
17. Cursor-trail — DEFER TO ux-designer.
18. Direct-receiver-pull purity — DEFER TO storyboarder + gamification.

```
MEMO_ROUND: 2 (retrospective)
AGENT: habit-formation
```

---

## C.4 ux-designer

### Where I concede

- **Strategist on synthesised audio.** Conceded — at trailer-cut volume the 10-second loop will reveal the synth tells.
- **PM on declaring v0.5 and stopping.** PM is right: bound it. Treat my P1s as a tight close-out batch.
- **Habit-formation on the held-success window framing.** Frame it as "player can shorten by moving" rather than as a forced wait.
- **Storyboarder on N3 farewell beat.** This is a P1 craft fix, not a P2 nicety.
- **Gamification on cursor tether shimmer.** A faint cursor-to-receiver tether at hold-onset surfaces direct-pull more cleanly. Concede the trail; adopt the tether.

### Where I hold the line

- **Moonrise must honour `prefers-reduced-motion`.** WCAG 2.2 SC 2.3.3 conformance gap. Non-negotiable P1.
- **WCAG re-audit against canonical waxing palette.** P2.
- **In-game intent beat for all three nights.** A README and HOW-TO-PLAY card are the wrong layer.
- **Cursor trail: remove.** Replace with the gamification tether shimmer at hold-onset.
- **README/HOW-TO-PLAY after intent beat lands: trim, don't keep at full length.**
- **No cosmetic motion under reduce-motion at all.** This includes the harbour pulse.

### Revised recommendations

- [P1] Moonrise reduce-motion runtime fix — cost: S
- [P1] In-game intent beat on all three nights — cost: M
- [P1] Cursor tether shimmer at hold-onset — cost: S
- [P1] N3 fade-to-silence + final lone bell — cost: S
- [P1] Held-success framing as "player-can-shorten" — cost: S
- [P2] WCAG re-audit against all three lunar palettes — cost: S
- [P2] Reduce-motion swap table closure — cost: S
- [P2] Cross-session ghost persistence at picker — cost: M
- [P2] HOW-TO-PLAY card trim post intent-beat — cost: S
- [P3] Stranger-test rig with reduce-motion toggled on — cost: S

### Positions on the 18 open questions

1. v0.5 vs v1.0 — DEFER TO PM. Verdict: declare v0.5 shipped now.
2. Rename — DEFER TO STRATEGIST. Verdict: *Lull*.
3. Trailer recording — DEFER TO PM. Verdict: record trailer-cut-1.mp4 this week.
4. Stranger-test — Verdict: yes, and run a parallel pass with `prefers-reduced-motion` toggled on.
5. Recorded audio for trailer/Steam — DEFER TO STRATEGIST. Required for any pre-public surface.
6. Mobile — DEFER TO STRATEGIST. Verdict: defer.
7. 4th-night — DEFER TO STORYBOARDER. Verdict: a sandbox night at the picker layer.
8. Cross-session ghosts — Verdict: yes, at picker only. P2.
9. N3 receiver variety — DEFER TO GAMIFICATION.
10. Held-success direction — Verdict: movement during the window cuts it short; baseline holds at ~2.0–2.2s.
11. All-three-nights intent beat — Verdict: yes, in-world. P1.
12. Moonrise reduce-motion — Verdict: P1 runtime fix.
13. N3 fade-to-silence ending — Verdict: yes; ambient resolves to silence over ~4s, single lone bell tail. P1.
14. Picker as place — DEFER TO STORYBOARDER. Verdict: yes; ghosts + a long-term-shape tell.
15. N3 verb-label — DEFER TO STORYBOARDER. Verdict: "let go" over "send" or "release."
16. N3 title-card line — DEFER TO STORYBOARDER. Verdict: descriptive, e.g. "The bay is quiet now."
17. Cursor-trail — Verdict: remove. Replace with cursor tether shimmer.
18. Direct-receiver-pull purity — DEFER TO GAMIFICATION. Verdict: keep direct-receiver-pull on N3 only.

```
MEMO_ROUND: 2 (retrospective)
AGENT: ux-designer
```

---

## C.5 pm

### Where I concede

**On rename and trailer urgency.** I framed rename as a P2 and trailer as a P1. Conceded: trailer-cut-1 with current synth audio is **not** Steam-page material. It is internal proof and stranger-test bait.

**On the held-success beat.** I now think habit's read wins: the resolution should *play out* and the player can press to advance whenever. No "hold still or we won't progress" implicit rule.

**On scope creep by 30%.** The 30% I flagged was almost entirely WCAG audit + reduce-motion + cursor-trail — work the council explicitly asked for. Not creep. I withdraw the framing.

### Where I hold the line

**Cross-session ghosts is the single highest-payoff next ship.** Cost-S, player-visible-on-second-launch. It goes first.

**No v1.0 expansion arc this sprint.** The next sprint is a *closure* sprint, not an expansion sprint.

**README/HOW-TO-PLAY is a design-failure patch, not a fix.**

**Stranger-test is the gate, not the polish.**

**Picker is mechanically fine, ship it.**

### Revised recommendations

Closure sprint, sequenced for two weeks of solo-dev time:

1. **[P1] Cross-session ghost persistence — cost: S.**
2. **[P1] Moonrise reduce-motion swap — cost: S.**
3. **[P1] Held-success re-frame — cost: S.**
4. **[P1] Intent beat for N2 + N3 — cost: S.**
5. **[P1] N3 receiver variety — cost: M.**
6. **[P1] Rename to *Lull* — cost: S.**
7. **[P1] Record trailer-cut-1.mp4 (internal artefact) — cost: S.**
8. **[P1] Run stranger test with 2 non-developers — cost: S.**

Then post-closure-sprint P2/P3 items.

### Positions on the 18 open questions

1. v0.5 vs v1.0 — v0.5.
2. Rename — execute this sprint.
3. Trailer record — this sprint, internal-artefact only.
4. Stranger test — this sprint.
5. Recorded audio — DEFER TO product-strategist. Post-v0.5.
6. Mobile — Defer to v1.0.
7. 4th-night sandbox — Defer until stranger-test results.
8. Cross-session ghosts — Yes, P1, this sprint.
9. N3 receiver variety — Yes, P1.
10. Held-success direction — Re-frame; advance-on-press ceiling.
11. All-three-nights intent beat — Yes, P1.
12. Moonrise reduce-motion — Yes, P1, this sprint. A11y bug.
13. N3 fade-to-silence ending — DEFER TO gamification. P2.
14. Picker as place — No this sprint. Hold the line.
15. N3 verb-label — DEFER TO storyboarder.
16. N3 title-card line — DEFER TO storyboarder.
17. Cursor-trail — Keep. Already shipped.
18. Direct-receiver-pull purity — No (remove). Holds the verb-grammar consistency.

```
MEMO_ROUND: 2 (retrospective)
AGENT: pm
```

---

## C.6 product-strategist

### Where I concede

**On scope creep:** I let "more polish to land" become the natural conclusion. PM's "scope inflation justified after the fact" is the truer accounting.

**On synthesised audio as Steam-page-blocking: I overshot.** I move recorded foley from "blocker" to "P2 polish before broad-curator outreach."

**On "send" being a programmer noun: gamification is right.** Player-facing copy is storyboarder's call.

**On 2.5s held-success being soft compulsion: habit-formation has the stronger claim.** Reframe to "dwell to savour, tap to advance."

### Where I hold the line

**The rename is overdue and *Lull* is dead.** *Lull: Rest After Crying* is on Steam right now (app/3557060). Discoverability collision is fatal. **Three live alternatives:**

1. **Neap** — single syllable, owns "small calm tide" semantically. Steam-clean. **My pick.**
2. **Foreshore** — sounds like a place; aligns with picker-as-place framing.
3. **Pull** (just *Pull*) — keeps half the working title.

**Rejected:** *Tide* (taken), *Tide / Pull* (slash hostile), *Ebb* (Ebb Tide RPG presence).

**The trailer is recordable now and the user must record it this week.**

**Steam page draft as forcing function.**

**Mobile-defer is the right call and must be documented.**

**Curator outreach is P2, not P1, and gated on trailer + Steam page.**

**Stranger-test is non-negotiable and remains pending.**

**Long-term shape — *1000 True Fans*, not mass.**

### Revised recommendations

| Priority | Title | Cost |
|---|---|---|
| **P1** | Kill *Lull*; pick *Neap* | S |
| **P1** | Record trailer .mp4 this week | S |
| **P1** | Stranger-test the slice | S |
| **P1** | Draft Steam page in `docs/specs/` | M |
| **P2** | Cross-session ghost persistence | M |
| **P2** | Curator outreach (15 targets) | S |
| **P2** | Document mobile defer + ethics-override absences | S |
| **P2** | Recorded ambient bed for v1.0 | M |
| **P3** | v1.0 expansion arc | L |
| **P3** | Pricing decision: $5.99 vs $7.99 | S |
| **P3** | TikTok / shorts cut (vertical 9:16) | S |

### Positions on the 18 open questions

1. v0.5 vs v1.0 — **v0.5 ships.**
2. Rename — **Kill *Tide / Pull* and *Lull*. Adopt *Neap*.**
3. Trailer — **Record this week.**
4. Stranger-test — **Run before any external surface goes live.**
5. Recorded vs synthesised audio — **Synth ships for v0.5 + trailer-1; recorded foley is v1.0 polish.**
6. Mobile — **Deferred to v2. Document.**
7. 4th-night question — DEFER TO STORYBOARDER + GAMIFICATION. Sandbox-via-picker, not v0.5 night.
8. Cross-session ghosts — **Yes. P2.** DEFER TO STORYBOARDER on shape.
9. N3 receiver variety — DEFER TO GAMIFICATION + STORYBOARDER. Constraint: don't add a fourth verb.
10. Held-success direction — **Concede to habit-formation.** Reframe to "dwell to savour, tap to advance."
11. All-three-nights intent beat — DEFER TO UX. P1.
12. Moonrise reduce-motion swap — DEFER TO UX. P1 a11y bug.
13. N3 fade-to-silence ending — DEFER TO STORYBOARDER. Final bell + ambient resolve to silence ships.
14. Picker as place — DEFER TO STORYBOARDER. Persistent ghosts at picker = bay-as-place.
15. N3 verb-label — Internal "send" stays. Player-facing is storyboarder.
16. N3 title-card line — DEFER TO STORYBOARDER. ("The lanterns find the open water.")
17. Cursor-trail — DEFER TO UX.
18. Direct-receiver-pull purity — DEFER TO GAMIFICATION + STORYBOARDER. Trailer is the empirical test.

```
MEMO_ROUND: 2 (retrospective)
AGENT: product-strategist
```

---

# Appendix D: Draft Consensus (verbatim)

The Draft Consensus produced between Round 2 and Round 3 is reproduced in the spec body above (§"Proposed changes" mirrors the converged P1/P2/P3 ranking; §"Open questions" reflects the two open dissents). The full text was presented to all six specialists at Round 3 in the same form. Headline calls:

- **Rename: *Neap*** (replacing *Lull* mid-round when strategist found Steam collision).
- **11 P1s** in the closure sprint.
- **7 P2s** as close-out polish.
- **OQ18 direct-receiver-pull** flagged as the only material open dissent for Round 3 to resolve.

Confidence rating recorded at **4.5 / 5**.

---

# Appendix E: Round 3 ratify/dissent (verbatim, all six)

## E.1 storyboarder

```
DECISION: RATIFY
REASON: The consensus carries every storyboarding beat I held the line on — cross-session ghosts at P1, N3 as callback (final bell echoing N1), receiver variety, moonrise reduce-motion as opening-beat fix, and intent beats extended to N2/N3. The two open dissents are downstream tuning questions, not arc-breakers, and either resolution preserves the "moon pulls water → water pulls things" through-line. The held-success re-frame ("dwell to savour, tap to advance") honours the emotional intent without forcing a duration the player must endure.
SPECIFIC DISSENTS (if any):
- (none)
AGENT: storyboarder
```

## E.2 gamification-designer

```
DECISION: RATIFY
REASON: The consensus carries the loop-level wins I cared about — held-success re-frame (#4), cursor tether shimmer (#8), N3 fade-to-silence + bell callback (#7), and intent beats on N2/N3 (#5) all land in P1. The remaining direct-receiver-pull dissent is a verb-grammar nuance I can live with at "N3 only" if UX wins that sub-debate; it's not worth blocking ratification. N3 receiver variety shape (fire vs reluctant-lanterns) is a storyboarding call and either solves my pacing-flatness concern.
SPECIFIC DISSENTS (if any):
AGENT: gamification-designer
```

## E.3 habit-formation

```
DECISION: RATIFY
REASON: Every ethics-perimeter line I held is preserved in writing: bay-memory not visit counter, no "come back" imperatives on N3, no in-game social surface codified in conventions, picker bed duck shipping, and the held-success re-frame removes the forced-wait soft-compulsion concern by making 2.5s a ceiling rather than a floor. The 4th-night question is correctly bounded to picker-sandbox with no scheduled-return surface. OQ18 is appropriately scoped to verb-grammar without introducing score or accuracy.
SPECIFIC DISSENTS (if any):
AGENT: habit-formation
```

## E.4 ux-designer

```
DECISION: RATIFY
REASON: Every Round 2 position I held the line on is in the consensus as written — moonrise reduce-motion swap as non-negotiable WCAG 2.2 SC 2.3.3 conformance, intent beats on N2 and N3, cursor-trail removed in favour of tether shimmer at hold-onset, WCAG re-audit per palette, and reduce-motion parallel pass in stranger-test. The open dissent on OQ18 preserves my "keep on N3 only" position for the council to resolve, which is the correct mechanism. No craft-level concerns remain unaddressed.
SPECIFIC DISSENTS (if any):
- OQ18 direct-receiver-pull — I maintain N3-only as recorded; the verb-grammar shift (release-and-pull vs release-and-wait) is what gives N3 its distinct feel and supports the peak-end farewell. Softening it across nights would flatten the arc, but I accept this as a live dissent for council resolution rather than a blocker to ratification.
AGENT: ux-designer
```

## E.5 pm

```
DECISION: RATIFY
REASON: The consensus structurally matches my Round 2 closure-sprint framing — cross-session ghosts, held-success re-frame, stranger-test gate, trailer-cut-1, and Steam page draft all land at P1 in the right order. P2/P3 deferrals (mobile, pricing, recorded foley, second-bay) hold scope. OQ18 keeping N3-only direct-pull is the correct minimum-surface resolution.
SPECIFIC DISSENTS (if any):
AGENT: pm
```

## E.6 product-strategist

```
DECISION: RATIFY
REASON: Every strategic position I held survived intact: *Neap* is the rename, trailer-cut-1 is the empirical gate, the Steam page draft is the forcing function, stranger-test is in P1, mobile is deferred with documented rationale, and curator outreach sits correctly at P3 behind the trailer. The OQ18 dissent is correctly scoped to a trailer-readability test, which is the right empirical resolver — no strategic ambiguity remains for me to dissent on.
SPECIFIC DISSENTS (if any):
- (none)
AGENT: product-strategist
```

---

## Final adjudication on OQ18 (orchestrator, on behalf of the delegated user)

The user explicitly delegated decisions to the team for this retrospective. Round 3 produced 5 RATIFY + 1 RATIFY-with-recorded-dissent on OQ18 (UX). UX framed their dissent as preservation-not-blocking. No specialist requested Round 4. Adjudicating to the team's strongest principled position: **UX's "keep direct-receiver-pull on Night 3 only"** is adopted as the spec's resolution of OQ18.

Reasoning:
- **Storyboarder:** "keep direct-pull but make it visible via cursor tether shimmer." UX's N3-only is compatible — the tether shimmer fires only when direct-pull is active, which means Nights 1+2 cleanly have water-only, and Night 3 has tether + direct-pull as a paired visual.
- **Gamification:** "soften to soft proximity assist on existing flow." UX's N3-only is more conservative (zero direct pull on N1+N2) — a strict subset of gamification's "soften everywhere," and gamification ratified anyway.
- **PM (R2 position was "keep as-is"; R3 stated "OQ18 keeping N3-only direct-pull is the correct minimum-surface resolution").** UX's N3-only is what PM ratified.
- **Strategist:** "trailer must read 'moon pulls water → water pulls things'; the recording is the empirical test." UX's N3-only resolves the constraint trivially on N1+N2; N3 trailer reading is empirically tested when `trailer-cut-1.mp4` is recorded.

The adjudication is therefore the lowest-conflict resolution that preserves every specialist's R3 ratification rationale.

Implementation: in `game/src/main.ts`, gate the `applyReceiverAttraction` call on `state.level.night.goal.kind === 'send'` (Night 3 only).

```gherkin
Scenario: Direct-receiver-pull active on Night 3 only
  Given I am holding the mouse during Night 1 or Night 2
  Then no direct-receiver attraction force is applied to receivers
  And boats / lanterns move purely via fluid-flow advection
  Given I am holding the mouse during Night 3
  Then the direct-receiver-attraction force is applied to non-sent lanterns within range
  And the cursor tether shimmer is visible to those lanterns
```

If the recorded `trailer-cut-1.mp4` reveals "the moon pulls things directly" reading on Night 3 such that the wedge sentence's "let go to watch it rush home" framing is broken, the team revisits OQ18 in a future sprint.

---

*End of spec.*
