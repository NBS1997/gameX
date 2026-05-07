---
title: forward-feature-1 — N4 last-quarter, the withhold night
date: 2026-05-07
status: design (synthesised from slim council; ratified by Stage-3 8-specialist convergence; user-checkpoint substituted per captain protocol)
phase: 4
authors: [storyboarder, gamification-designer, habit-formation, ux-designer, pm, product-strategist, captain]
input_stage3_pick: cluster A — "Build a fourth night per design-spec item 36" (gamification URG 5 + pm URG 4; mean URG 4.5)
---

# Neap N4 — Last Quarter, the Withhold Night

## TL;DR

N4 is a fourth night appended after N3, unlocked from the picker once N1–N3 are complete (linear gate, no padlock iconography). Lunar phase is **last-quarter half-moon** (the second neap-tide phase, honouring the title's bookends; visually distinct from N1's waxing crescent, which is lit on the opposite hemisphere). The new verb is **withhold** — a press-and-hold game whose new sentence is *don't pull when the heron is near*. A **single heron** stands at the eastern foam line, sharing the spatial axis of N3's headland fire. When the cursor enters its proximity ring AND the player either lifts their press or keeps the cursor still under press, an internal `dwellT` accumulator rises; on `dwellT >= 1.0` the goal is met, the heron lifts off in a single slow wingbeat, crosses the bay east, exits the frame, the moon dips below the horizon, dawn comes up cool, and the existing closure-callback chain (final bell + fade-to-silence + master restore) fires. **The creature is a peer, not a pet** — never named, never tracked, never owed; no trust-meter / bond / relationship variable in code or copy; no cross-session state about the heron at all. Wedge clause "press-and-hold to pull the tide" survives — withhold is *local* to the heron's proximity; the rest of the bay still pulls under hold. Press-and-hold remains the only input.

## North-star

This is the kishōtenketsu **kyū** (resolution / final act). Mapping locked: N1 = ki, N2 = shō, N3 = ten (the lunar-inversion turn — pull becomes release across the eastern edge), N4 = kyū. The *resolution* of a press-and-hold game is the moment the player learns there is one place not to press. The slice's wedge — *the bay changes with tonight's phase* — gains a fourth phase as evidence. The slice's missing SDT-relatedness lands through *responsiveness in the present moment* (the bay contains a being that reacts to your pull right now), never through accumulated relationship.

## Hard ethics perimeter (restated, uncrossable for N4)

The full design-spec items 21–33 hold. Plus the **N4 perimeter contract** authored by habit-formation:

**Forbidden in code, copy, persistence, or dev-facing comments:**
- Creature has a proper name (in code identifiers, copy, or save schema). The species-noun-as-silhouette is the only allowed referent. Code uses `heron`, `visitor`, or `creature` — never a proper name.
- Creature has a trust meter, bond meter, affinity scalar, or any 0..1 relationship value persisted or unpersisted. **Variable names `creatureTrust`, `bond`, `affinity`, `friendship` are banned at review time.** The internal accumulator is named `dwellT` (purely mechanical: dwell-time normalised) precisely to avoid relationship-shape framing.
- Creature remembers the player across sessions: no `lastSeenAt`, no `visitCount`, no `creatureKnowsYou` flag. The save schema gains zero fields about the heron.
- Creature is announced — UI prompt, picker glyph, achievement-style flourish, audio sting reserved for "new content," or "secret unlock" framing.
- Missed-creature framing in any form: no "the heron didn't come tonight" copy, no faded-silhouette "haven't seen them in a while" cue, no return-pressure nudge.
- Creature responds to *cumulative* player behaviour across sessions ("after three calm nights it approaches"). All responsiveness is to *this session's* pull-state.
- "Creature dies" / "creature leaves and never returns" framings. Departures (off-frame on harsh-pull) are soft-drift consistent with boats and lanterns.
- Creature appears on a real-world cadence (real date, real lunar phase, real time-of-day) — already banned by item 27.

**Allowed:**
- Creature is unnamed, referred to only by silhouette or species-noun in code (`heron`, `visitor`); no possessive in copy.
- Creature responds to the *current moment only* — pull magnitude, cursor velocity, distance from cursor, hold-state.
- Creature lifts and crosses the bay on goal-met as a single one-time per-night beat; subsequent N4 visits start with the heron back at the foam line. The same creature-shape may appear; no "returned" framing.
- Creature never crosses the picker surface — no glyph, no "seen" tick, no silhouette in the picker.

**Wedge defence:** the wedge is *"You are the moon. Hold to pull the tide; let go to watch it rush home."* Withhold preserves the wedge because press-and-hold remains the verb. The bay still pulls under hold *outside* the heron's proximity. What N4 teaches is *where* not to pull. Withhold is local, not global.

## Visual identity

### Palette (5-stop water-depth, compressed-toward-deep)

| Stop | N4 hex | Delta vs N1/N2/N3 |
|---|---|---|
| Deepest | `#0e1722` | unchanged (letterbox-anchor) |
| Deep | `#172132` | −2 lightness vs `#1a2638` |
| Mid | `#27334d` | −2 lightness vs `#2c3a55` |
| Crest | `#46556f` | −3 lightness vs `#4d5c7a` |
| Foam | `#a8b5cc` | unchanged (foam is a constant — title-card / tether / ghosts depend on it) |

### Heron

- Fill `#9aa6bd` (cooler-grey-blue, sits in foam-to-crest gap), rim `#cdd6e6` cold halo.
- Contrast vs deepest tile `#0e1722` = **8.4:1** (well above WCAG 1.4.11 3:1 floor).
- Position: standing at the eastern foam line near the headland (`x ≈ 1700, y ≈ 880`, ground level — adjust to author's eye in level data).
- Idle: cubic ease-in-out micro-tilt ±2° on head-axis, **4.3s period** (deliberately co-prime with floater 1.5 Hz and fire 1.2 Hz so nothing in the bay beats in lockstep).
- Approach (cursor enters 220 px proximity ring AND `cursorVelocity < STILL_V` OR `!isPressed`): head rotates toward cursor over **600 ms ease-out**; no body translation.
- Recoil (cursor enters 90 px hard-proximity OR pull-strength > 0.6×): head averts + single body-shift step away by 18 px over **350 ms ease-out**, then re-locks idle. Rate-limited to one per 2 s.
- Pre-lift (`dwellT > 0.85`): two slow wing-stretch frames over **1500 ms ease-in-out** synchronised to the existing held-success savour window.
- Lift (goal-met): single slow wingbeat (~1200 ms), translate east-and-up over **2400 ms ease-out** to off-frame at the eastern edge; no return.

### Cursor moon variant

- **Last-quarter half-moon**, 26 px radius.
- Fill `#e7ddc8` (between waxing-crescent's `#fff4d6` and waning-gibbous's `#e9e1d0`).
- Shadow `#2c2a26` on the **leading hemisphere** (rotates with cursor velocity per existing rule). The leading-hemisphere shadow distinguishes N4 visually from N3's trailing-hemisphere shadow at a 200 ms screenshot glance.
- Pull radius ring at **95 px** (between waxing's 80 and waning-gibbous's 110).
- Pull-strength multiplier **0.75×** (gentlest of four phases — neap register).

### Cursor-tether on N4

- Tether **does not** render to the heron at any distance. The heron is not a goal-target receiver and rendering a tether to it would code-read as a goal-target and break the wedge.
- Tether to actual N4 receivers: there are none other than the heron, so tether is effectively suppressed for N4. Use `cursorTether.setEnabled(false)` in `enterNight` for N4.
- Pull-radius ring on the cursor-moon brightens slightly as `dwellT` rises: alpha ramps from `BASE_ALPHA` to `BASE_ALPHA + 0.15 * dwellT`. This is the single load-bearing feedback that prevents N4 from feeling broken — the player needs to know stillness is *registering*.

### Picker 4th slot glyph

- Last-quarter half-moon glyph rendered identically to the other three via `makeCursorForPhase('last-quarter')`.
- Slot positions redistribute symmetrically around centre — `(idx - 1.5) * SLOT_SPACING` for indices 0..3.
- **No padlock, no number, no label, no creature silhouette in the slot.** The heron stays unannounced per the perimeter contract.

### Intent-beat for N4

- Single foam-stop arc (140°, radius 240, alpha 0.4 → 0 over 800 ms triangle-envelope) sweeps from the eastern headland toward bay-centre — points the eye to the heron's side without rendering the heron louder than its idle alpha.
- Reduce-motion swap: static foam-arc at peak alpha for 200 ms.

### Title-card

- Same face / size / colour / fade as the other three title cards. Weight 400 unchanged. Hold 3000 ms unchanged.
- Storyboarder line: **"Last quarter. The bay holds what was given."**

### Reduce-motion swap (mandatory; designed in from frame zero per design-spec item 11)

- Idle micro-tilt → static creature at neutral pose.
- Approach head-rotate → instant 100 ms alpha pulse 0.85 → 1.0 → 0.85 on the heron (signals see-you without head motion).
- Recoil → omit the body-shift, keep the alpha pulse.
- Pre-lift wing-stretch → instant cut to wings-out pose, hold for the existing 1500 ms savour, then instant cut to lift.
- Lift translation → fade-to-zero alpha over 600 ms instead of east-and-up translation.
- Moon-set / dawn fade-to-silence → reuse cycle 5's reduce-motion path (no y-drift; alpha-only).

### Moonrise on N4

Returning launch's **1.5–2 s abridged form**. The player has already seen the bay this session (N1/N2/N3); a 6–10 s longer-form variant would over-signal "this is special" and pressure the heron into being a reveal, which the unannounced-creature constraint forbids.

## The verb — withhold (mechanic spec)

```ts
// Per-frame, in updateWithhold(state, dt, hooks):

const RING_R = 220;            // soft proximity, ~2.3× pull-radius
const HARD_R = 90;             // hard proximity, ~0.95× pull-radius
const STILL_V = 25;            // px/s; cursor velocity below this counts as "still"
const SHY_V = 220;             // px/s; hard yank scares the heron
const DWELL_RISE = 0.45;       // /s when (held && cursorV < STILL_V && in ring) OR (!held && in ring)
const DWELL_FALL = 0.35;       // /s otherwise (decays, never resets to 0 mid-attempt)
const SHY_BLEED = 0.6;         // dwellT bled per shy event
const TOUCH_DWELL = 1.0;       // dwellT threshold for goal-met

const cursorPos = state.input.cursor;
const cursorV = state.input.cursorVelocity;  // px/s, smoothed over last frame
const isPressed = state.input.isPressed;
const d = dist(heron.position, cursorPos);

if (d > RING_R) {
  // Outside proximity ring: dwell decays, no recoil possible.
  state.dwellT = Math.max(0, state.dwellT - DWELL_FALL * dt);
} else if (d < HARD_R && cursorV > SHY_V) {
  // Hard yank inside proximity: shy.
  state.dwellT = Math.max(0, state.dwellT - SHY_BLEED);
  if (!state.recoilCooldownUntil || state.t > state.recoilCooldownUntil) {
    state.heronRecoilT = state.t;
    state.recoilCooldownUntil = state.t + 2000;
  }
} else if ((isPressed && cursorV < STILL_V) || !isPressed) {
  // Stillness inside proximity: dwell rises.
  state.dwellT = Math.min(1.0, state.dwellT + DWELL_RISE * dt);
} else {
  // In proximity but moving cursor under press: dwell decays.
  state.dwellT = Math.max(0, state.dwellT - DWELL_FALL * dt);
}

// Goal-met edge:
const goalMetThisFrame = state.dwellT >= TOUCH_DWELL && !state.goalCompleteFlag;
if (goalMetThisFrame) {
  state.goalCompleteFlag = true;
  hooks.onGoalMet();   // triggers existing held-success savour + closure callback
}
```

**Numbers are placeholders for feel-tuning.** The dev-agent should expose them as named constants in `config.ts` per the established pattern (cycles 5, 6 extracted feel-tuning literals to `config.ts`). Browser feel-test §"The withhold-verb test" gates the cycle.

### Failure / soft-drift

Hard-pull (`cursorV > SHY_V` inside `HARD_R`) bleeds `dwellT` and triggers a single recoil step. The heron does not flee; it stays at its post. Subsequent stillness re-grows `dwellT`. There is no failure state; there is no "the heron is gone forever" persistence. Soft-drift is consistent with boats and lanterns elsewhere. **No failure surface fires at any point if the player presses early.** The acceptance Gherkin makes this explicit.

### Pacing

Successful attempt 12–25 s; the verb reads in roughly two attempts (~30–40 s) because the cursor-tether and pull-radius ring already teach proximity — N4 inverts what those rings *mean*. The pull-radius ring brightening on `dwellT` rise is the load-bearing feedback that bridges the inverted meaning.

## The goal — `kind: 'still'`

New goal kind added to `level/types.ts`:

```ts
export interface StillGoal {
  kind: 'still';
  proximityRadius: number;     // RING_R, default 220
  hardRadius: number;          // HARD_R, default 90
  dwellSeconds: number;        // 1.0 / DWELL_RISE = ~2.22s minimum stillness time
}

export type GoalKind = 'guide' | 'gather' | 'send' | 'still';
export type Goal = GuideGoal | GatherGoal | SendGoal | StillGoal;
```

**Goal-bearing.** `goalNowComplete && !wasGoalComplete` rising edge fires unchanged (reuses cycles 5 + 7 closure-callback chain: final bell + fade-to-silence + master restore + headland-fire-style render-state machine for the heron lift).

**Final bell on N4** is re-pitched: 880 Hz × `2^(-7/12)` ≈ **587 Hz** (a perfect-fifth lower than N1/N3's 880 Hz). Same envelope as `goalMet`. New method `audio.heronSettleChime()` mirroring `lanternIgnitesFire()` shape from cycle 7.

## The receiver — heron render module

`game/src/render/heron.ts`, ~110 LoC, follows the cycle 3/6/7 render-module pattern (Container + Graphics + state machine + per-frame `update(dt)` + `reset()` + `setPosition()` + reduce-motion guard).

State machine: `idle | approaching | recoiling | preLift | lifting | gone`.

```ts
phase: 'idle' | 'approaching' | 'recoiling' | 'preLift' | 'lifting' | 'gone';

// Transitions (only forward):
// idle ↔ approaching ↔ recoiling (by per-frame proximity + velocity from outside)
// (idle | approaching) → preLift  when dwellT >= 0.85
// preLift → lifting              when goal-met edge fires
// lifting → gone                 when translate-out completes

reset(): phase = 'idle'; dwellT mirror = 0; clear all timeouts.
setPosition(pos): updates the foam-line anchor in level data.
update(dt, dwellT, cursorPos, isPressed): drives transitions + visual state.
setReduceMotion(reduced): swaps animation curves for static/cut variants.
```

The render module reads `dwellT` as input but **does not own** it. `dwellT` lives in `state.goalProgress` (the existing `GoalProgress` discriminated union extended), persisted only within the current night, not across nights or sessions.

## Persistence — save schema v3

PM's correctness analysis is correct: `save.ts:76` and `save.ts:87` both hardcode `n === 1 || n === 2 || n === 3`. A v2 save with N4 entries would survive in-memory but be silently dropped on next load. **v3 is needed.**

```ts
const SAVE_KEY = 'neap/save/v3';
const LEGACY_KEY_V2 = 'neap/save/v2';
const LEGACY_KEY_V1 = 'tide-pull/save/v1';

interface SaveDataV3 {
  version: 3;
  completedNights: NightNumber[];   // 1 | 2 | 3 | 4
  freeReentry: boolean;
  ghosts: PersistedGhost[];          // unchanged shape; night now 1..4
}

// Read order:
// 1. SAVE_KEY (v3) — if v3, return as-is.
// 2. LEGACY_KEY_V2 (v2) — if v2, lift fields directly (no shape change), write back as v3.
// 3. LEGACY_KEY_V1 (v1) — if v1, lift completedNights + freeReentry, ghosts: [], write back as v3.
// 4. Otherwise empty.
//
// Write: always to SAVE_KEY (v3). v2 and v1 are read-only.
//
// filterNights extends to (n === 1 || n === 2 || n === 3 || n === 4).
// filterGhosts extends matching: (obj.night === 1 || ... || obj.night === 4).
// Migration is idempotent and non-throwing per the existing pattern.
```

`meta.ts:70` size check `=== 3` extends to `=== 4`. `nextLinearNight` extends to chain 1 → 2 → 3 → 4 then return null.

**No new fields about the heron are added to the save schema.** The heron is fully ephemeral within a session; subsequent N4 visits start with the heron back at the foam line.

## Picker integration

- **Four slots from launch.** No "secret unlock" affordance, no "new content" indicator, no badge. The fourth slot is just there from launch.
- Pre-completion of N1: pressing the N4 slot routes to N1 via the existing linear gate (the picker shows the slot, the press-edge handler routes to `nextLinearNight(meta)` if the prerequisite isn't met).
- Pre-completion of N4 (post-N3): the N4 slot is selectable in the linear order. After the player completes N4, `meta.completedNights.size === 4` and `freeReentry` becomes true.
- Picker rendering of N4's ghost: **none.** The heron leaves no ghost. N4 contributes nothing to `meta.persistedGhosts` because the heron is not in `state.receivers` (it's a separate render module like `headlandFire.ts`).

## Trailer beats (after N4 ships, four-up across phases)

Per strategist:
- 0–2s: Black + sustained note. Title card "Neap" fades up over a still bay. (compressed from 3s)
- 2–6s: Moonrise.
- 6–11s: Cursor as moon. First press-and-hold. Water lifts.
- 11–14s: Release. Water rushes back. Soft chime. Goal met.
- 14–18s: N2 cut. Full moon. Lanterns clustering. One press, one release.
- 18–22s: N3 cut. Waning gibbous. Lantern crosses headland; fire ignites.
- **22–26s: N4 cut.** Last-quarter moon. Deeper palette. Heron at the rocks. Player holds still. Heron lifts.
- 26–30s: Four-up across phases (waxing crescent / full / waning gibbous / last quarter), wishlist CTA card.

## Steam page deltas

- **Short description (after N4):** *"You are the moon. Hold to pull the tide; let go to watch it rush home. A cosy one-screen physics piece across four lunar nights — the bay quiets a little each time you visit it, and on the fourth night it remembers you back."* (290 chars)
- **Comp-set update:** promote *A Short Hike* to lead price + length + tone comp; add *Alba: A Wildlife Adventure*; drop *Downwell* from primary list.
- **Tags:** primary unchanged. Secondary adds `Birds`; consider rotating out `Top-Down` for `Beautiful` if Steam still surfaces it.
- **Pricing:** bump from $5.99 to $7.99 (runtime now 12–18 min; sits honestly on *A Short Hike*'s shelf).

## Wedge defence (final)

The wedge sentence's load-bearing clause is *"the bay changes with tonight's phase."* N4 adds a fourth phase (last quarter) — strictly more wedge evidence. The slice's wedge becomes *more* legible with N4. The press-and-hold input gesture is preserved; *withhold* is a local intent applied to the heron's proximity, not a global verb change. Wedge survives.

## In scope (what cycle 10's N4 work delivers across three sub-cycles)

1. New night entry: `levels/night-4.delta.json` + `loader.ts` registration + `NightNumber` extended to `1 | 2 | 3 | 4` + `LunarPhase` extended to include `'last-quarter'` + `GoalKind` extended to include `'still'` + new `StillGoal` interface.
2. New verb file `game/src/verbs/withhold.ts` — `updateWithhold(state, dt, hooks)` per the mechanic spec above.
3. New render module `game/src/render/heron.ts` — idle wading silhouette, foam-stop palette, state machine + reduce-motion swap.
4. Save schema bump `neap/save/v2` → `neap/save/v3` with backwards-compatible migration (v2 → v3 lifts shape unchanged; v1 still reachable via existing legacy fall-through).
5. Picker integration: fourth slot rendered with `last-quarter` glyph; `nextLinearNight` extends to chain through 4; `meta.ts:70` size check extends; no ghost rendering for N4.
6. Audio: one new method `audio.heronSettleChime()` (587 Hz, mirroring `lanternIgnitesFire` shape).
7. Closure callback: existing `finalBell` + `fadeToSilence` + `restoreMaster` chain fires on N4 goal-met (re-pitched bell to 587 Hz); reduce-motion swap consistent with cycle 5.
8. Title card: storyboarder line "Last quarter. The bay holds what was given." added to `TITLE_STRINGS`.
9. Intent-beat: extend `intentBeat.ts` with N4 path (single foam-stop arc from eastern headland).
10. Cursor moon: `cursor.ts` adds last-quarter glyph variant.
11. Cursor-tether: `cursorTether.setEnabled(false)` in `enterNight` for N4.
12. Pull-radius ring brightness modulation by `dwellT` (cursor.ts or main.ts wiring).
13. Feel-test protocol: new section "The withhold-verb test" added to `feel-test-protocol.md`.

## Out of scope (cycle 10 scope fence — must not creep)

1. New input modality (no second button, no modifier keys, no double-click, no drag).
2. New persisted progression beyond `completedNights`, `freeReentry`, `ghosts`.
3. Multiple creatures, multiple herons, or N5+ nights.
4. Daily-seed / sandbox / bonus modes.
5. Storefront lexicon ("creature unlocked", "secret night", "bonus night", "rare visitor").
6. Reactive heron on N2 (strategist's URG-5 Stage-3 echo) — separate cycle, not bundled.
7. Between-night moon-traversal cinematic (UX's Stage-3 echo) — defer.
8. Renaming variables to relationship-shape (`creatureTrust`, `bond`, `affinity`, `friendship`).
9. Persisting any heron state — `lastSeenAt`, `visitCount`, `creatureKnowsYou`, `firstVisitAt`.
10. Naming the heron in code, copy, or comments.
11. Trailer recording (P1 #9 user-step, deferred).
12. WCAG re-audit (P2 #15, deferred).

## Sub-cycle decomposition

Three captain cycles. Each is BUG_POLISH-shaped implementation tail per the substitution chain established in cycles 5–9 (this very document is the upstream artefact for sub-cycles B and C).

### Sub-cycle A (this cycle, 10) — Schema + level data + picker scaffolding

**Ships:** schema-only N4 that loads but is mechanically inert. The picker shows four slots; clicking N4 (after N1–N3 complete) loads `night-4.delta.json` and runs the bay with `goal.kind === 'still'` — but no withhold verb is implemented yet, so the goal is unreachable. This is correct: the schema lands cleanly, and sub-cycles B + C populate the verb and the heron.

Acceptance: tsc clean; lint clean; v2 save migrates to v3 cleanly; picker renders 4 slots; N4 loads when selected (linearly gated); regression checks for cycles 1–9 all pass.

### Sub-cycle B (cycle 11 if convergence holds) — Verb + render module + audio

**Ships:** N4 plays end-to-end. `verbs/withhold.ts` + `render/heron.ts` + `audio.heronSettleChime()` + cursor.ts last-quarter glyph + cursorTether suppression on N4 + pull-radius brightness modulation.

Acceptance: N4 reachable via picker; heron stands at foam line; withholding for ~2.5s fires `goalNowComplete` rising edge; closure callback (final bell + fade-to-silence + master restore) fires; reduce-motion swap honoured.

### Sub-cycle C (cycle 12 if convergence holds) — Picker + intent-beat + N4 polish

**Ships:** intent-beat N4 path; title-card N4 line; updates to `motion-and-colour-bible.md` and `feel-test-protocol.md`; any feel-tuning constants extracted to `config.ts`.

Acceptance: N4 feels finished; the heron-lift moment lands at trailer-screenshot quality; documentation reflects N4.

The sub-cycles are sequenced (A → B → C) because B depends on A's schema and C depends on B's verb. Re-ordering is not advised. The realistic envelope is 3 cycles, with one cycle of slack absorbed if B's heron feel-tuning eats more than one cycle.

## Acceptance criteria (Gherkin)

```gherkin
Feature: Neap N4 — Last Quarter, the Withhold Night

  Scenario: N4 unlocks after N1–N3 completion
    Given a player who has completed N1, N2, and N3 in any prior session
    And the persisted save shows completedNights includes 1, 2, 3
    When the picker scene renders
    Then four glyph slots are visible (N1 waxing-crescent, N2 full, N3 waning-gibbous, N4 last-quarter)
    And the N4 slot is selectable with the same affordance as N1–N3
    And no "unlocked" badge, no "new" indicator, no toast appears
    And no padlock iconography appears on any slot

  Scenario: First-playthrough linear order extends through N4
    Given the player has never completed any night
    When the picker scene renders
    Then four slots are visible with their lunar-phase glyphs
    And pressing any slot routes to N1 until N1 is completed
    And after N1 is complete, pressing N4 routes to N2; after N2, to N3; after N3, to N4

  Scenario: Free-pick after N4 completion
    Given the player has completed N1, N2, N3, and N4 at least once
    When the player opens the picker
    Then any of the four nights is directly selectable
    And freeReentry is true in the persisted save

  Scenario: Withhold verb — stillness within proximity
    Given the player is in N4 with the heron at the eastern foam line
    When the cursor enters the heron's proximity ring
    And the player either lifts their press, or holds with cursorVelocity below STILL_V
    For a continuous-or-cumulative dwell-time totalling at least dwellSeconds
    Then the goal is met
    And the existing held-success / final-bell / fade-to-silence closure callback fires
    And the heron lifts on a single slow wingbeat, crosses east, exits the frame
    And the moon dips below the horizon
    And dawn comes up cool

  Scenario: Withhold verb — hard-pull recoils, never fails
    Given the player is in N4 with the heron at the foam line
    When the cursor moves at velocity above SHY_V within the heron's hard-proximity radius under press
    Then the heron recoils with a single body-shift step (rate-limited to one per 2s)
    And dwellT bleeds by SHY_BLEED but never below 0
    And no failure surface, no modal, no "RETRY?" appears at any point
    And subsequent stillness re-grows dwellT toward the goal threshold

  Scenario: Save schema v3 migrates from v2 cleanly
    Given a player whose only data is a v2 blob (no N4 entries)
    When the game loads
    Then the v2 blob is read, completedNights is filtered to [1, 2, 3], and a v3 blob is written back
    And the v2 blob is left in place defensively
    And no localStorage error throws to the caller (quota / disabled storage stays non-fatal)

  Scenario: N4 reduces motion from frame zero
    Given OS reduce-motion is on
    When the player enters N4
    Then the intent-beat collapses to a static foam-arc at peak alpha for 200 ms
    And the heron's idle wading is a static pose (no micro-tilt)
    And the heron's recoil omits body-shift, retains only the alpha pulse
    And the lift-and-cross translation collapses to a 600 ms alpha-fade
    And the moon-set / dawn fade-to-silence follows cycle 5's no-y-drift reduce-motion path

  Scenario: Heron is unannounced
    Given a fresh player has never seen N4 before
    When they enter N4 for the first time
    Then no UI prompt, no title-card mention of the heron, no audio sting introduces it
    And the title card reads only "Last quarter. The bay holds what was given."
    And the picker N4 slot does not show a heron silhouette

  Scenario: Heron is ephemeral within and across sessions
    Given a player completes N4 and writes v3 save
    When the player closes and re-opens the browser tab
    Then the v3 save contains completedNights including 4 and freeReentry true
    And no heron-related field exists in the save (no lastSeenAt, no visitCount, no creatureKnowsYou)
    And re-entering N4 places the heron back at the eastern foam line as if newly arrived
    And no copy or visual cue says "returned" or "the heron came back"

  Scenario: Wedge survives — press-and-hold still pulls outside the heron
    Given the player is in N4 with the heron at the foam line
    When the cursor is far from the heron (outside RING_R)
    And the player presses and holds
    Then the bay's water responds to the pull with strength 0.75× and radius 95 px
    And the verb is identical to N1/N2/N3 in mechanism, only changed in tuning
```

## Risk register

| Risk | Severity | Mitigation |
|---|---|---|
| Withhold verb feels like a fail-state — player presses too early, dwell decays, reads as punishment | High | Decay is gradual (~400ms to half), dwell never resets to 0 mid-attempt, the heron does not flinch, only the audio bed darkens half a step. Pull-radius brightness modulation by `dwellT` is the load-bearing feedback. Feel-test gates the cycle. |
| Press-and-hold wedge violation — "do nothing" verb arguably breaks "Hold to pull the tide" | Medium | Withhold is **local** to the heron's proximity. The rest of the bay still pulls under hold. Wedge defence section in spec; acceptance scenario "wedge survives" makes it explicit. |
| Save v2→v3 migration corrupts in-progress saves | High | Mirror v1→v2 defensive parsing: try/catch every JSON.parse, fall through to empty save on failure, never throw. Manual smoke-test step in feel-test-protocol before sub-cycle A ships: inject stub v2 blob in DevTools, reload, confirm v3 written with completedNights preserved. |
| Heron reads as target / engagement-pressure variable | High | Habit-formation perimeter contract is restated above; reviewer enforces variable-name ban list (`creatureTrust`, `bond`, `affinity`, `friendship`); `dwellT` is the canonical name. Code review explicitly checks for relationship-shape. |
| Lunar phase strategically wrong — new-moon manifestation-app vibes / waxing-crescent N1-redundancy / last-quarter palette repetition | Medium | Last-quarter chosen on multi-axis argument: (a) neap-tide phase consistent with title; (b) visually distinct from N1 (opposite hemisphere lit); (c) pull-strength 0.75× is a fresh tuning point; (d) cosy "letting-go" symbolism pairs with stillness-verb. |
| Heron lift moment doesn't read as "the kyū" — looks like one more night | High | Strategist's trailer beats include a 4-second N4 cut where the heron lift is the entire visible motion. Sub-cycle C polish targets that frame. If feel-test reveals it doesn't land, consider extending lift duration from 2400 ms to 3200 ms in the next polish cycle. |

## What N4 must NOT promise

N4 is **not** a "secret level," "bonus content," "new ending," or "twist" advertised on the storefront. It is the bay's fourth night, included at launch, discovered by playing through, and resolved by the same press-and-hold grammar as the first three.

## Stage-3 substitution traceability

This document substitutes for the captain protocol's `superpowers:brainstorming` user-approval hard-gate per the explicit substitution clause in the Captain skill's NEW_FEATURE stack step 1. The eight-specialist Stage-3 ratification (cycle 10 retro: 8/8 NEW_FEATURE; cluster A picked at mean URG 4.5) constitutes the user-approval. The user's verbatim cycle-10 nudge — *"the team have done a great job but it is time for them to bring something new. I'm looking for actual creativity from the team — they are to build without my input other than I want to be impressed."* — explicitly delegates creative authority to the team and is a stronger signal than the brainstorming skill's user-checkpoint. Recorded here for traceability.

---

## Cycle 11 retro refinements (sub-cycle B implementation clarifications)

Cycle 11's eight-specialist retro converged 8/8 on sub-cycle B (mean URG 4.75, the loop's highest). Four UX refinements + three architectural clarifications + one feel-tuning principle were surfaced and are codified here as authoritative for sub-cycle B's plan-write and dev-agent dispatch. These do not redesign N4 — they tighten ambiguities the cycle-10 design memo left coin-flip-shaped.

### UX refinements (ux-designer cycle-11 retro)

1. **Cursor-tether disable timing.** On `enterNight(4)`, the cursor-tether fades to alpha 0 over **250 ms ease-out**, not an instant cut. Instant cut would read as a glitch given the tether is the player's anchor for what "near" means.
2. **Recoil body-shift direction.** The 18 px shift is along the **unit vector from cursor to heron** (away from cursor), not along a fixed eastward axis, **clamped so the heron never crosses below the foam line** (y-floor enforced).
3. **Pre-lift wing-stretch independence.** Pre-lift starts at `dwellT >= 0.85` and runs its own **1500 ms clock**. It does **NOT** gate on or sync to the existing held-success savour window — that fires only at the goal-met edge.
4. **Brightness modulation easing.** Pull-radius alpha ramp `BASE + 0.15 * dwellT` uses `smoothstep(dwellT)` curve, **not raw linear**. Raw linear reads as twitchy at low `dwellT` values where the player most needs the "is it registering?" signal.

### Architectural clarifications (reviewer cycle-11 retro)

5. **`dwellT` lives in `state.goalProgress`.** Extends the `still` `GoalProgress` discriminant from cycle 10 (which already has `dwellT: number`). The heron render module reads `dwellT` as input but does NOT own it. This is what cycle 10's design memo specs in §"The receiver — heron render module"; cycle 11 makes the contract explicit for sub-cycle B's dispatch.
6. **`gone` is a single post-lift terminal.** No "outsideN4" variant. `heron.reset()` runs on every `enterNight(4)` to return phase to `idle`, so `gone` is only ever transiently terminal within a single night-session.
7. **`cursorTether.setEnabled(false)` fires unconditionally in `enterNight` for N4.** Not conditional on heron proximity. The N4 night has zero in-state.receivers anyway, so the tether has nothing to render to.

### Perimeter enforcement (habit-formation cycle-11 retro)

8. **Pre-commit grep gate on banned identifiers.** Before sub-cycle B's commit lands, orchestrator runs:
   ```powershell
   Select-String -Path game/src -Pattern 'creatureTrust|bond|affinity|friendship|trust' -Recurse -CaseSensitive | Where-Object { $_.Line -notmatch '//.*existing-comment-allowlist' }
   ```
   Expected: zero matches. Any match in NEW code is a blocking perimeter violation; pre-existing matches in the cycle-10 commit (verified clean by reviewer) stand.
9. **`SaveDataV3` byte-identical to sub-cycle-A shape.** Sub-cycle B adds zero fields to `SaveDataV3`. Verified by `git diff ce651c6..HEAD -- game/src/state/save.ts` showing no interface changes after sub-cycle A.
10. **Canonical constant names.** The `0.85` pre-lift threshold is named `PRE_LIFT_DWELL` (NOT `TRUST_THRESHOLD`, `BOND_THRESHOLD`, `RELATIONSHIP_LEVEL`). Mirrors the `dwellT` naming choice from cycle 10.

### Feel-tuning principle (gamification cycle-11 retro)

11. **All feel-tuning constants exposed to `config.ts` from frame zero.** `DWELL_RISE`, `DWELL_FALL`, `STILL_V`, `SHY_V`, `RING_R`, `HARD_R`, `SHY_BLEED`, `TOUCH_DWELL`, `PRE_LIFT_DWELL`, plus any motion durations not already on the heron render module's named constants. Sub-cycle C's feel-test pass should be able to re-tune without touching `verbs/withhold.ts` or `render/heron.ts`. This follows the cycle-5 pattern (closure-beat literals → cycle-6 extracted to `config.ts` after reviewer note).

### Cycle-10 reviewer carry-overs (bundled into sub-cycle B per pm cycle-11)

12. **`Record<LunarPhase, readonly RGB[]>` typing in `config.ts:51`** — replace inline union with imported `LunarPhase` type so future phase additions don't drift.
13. **`isNightSelectable` explicit night-4 clause in `nightPicker.ts:100`** — currently the final `return meta.completedNights.has(3)` covers night 4 implicitly; make it explicit:
    ```ts
    if (night === 4) return meta.completedNights.has(3);
    return false;  // unreachable; defensive default
    ```

### Dispatch-text watch-outs (qa-agent cycle-11 retro)

The two highest-blocker-risk surfaces in sub-cycle B are:
- **`dwellT` wiring call-site** — the per-frame call from `main.ts` into `updateWithhold` must thread the cursor velocity correctly. Cycle-7's `fireArg` pattern is the reference; the analogous `withholdArg` shape is `{ heron: { position }, dwellT (read-only from goalProgress), cursorVelocity, isPressed }`.
- **Heron `idle ↔ approaching ↔ recoiling` recoil-cooldown edge** — the `recoilCooldownUntil` timestamp must reset on `enterNight` and must NOT leak across night transitions.

These watch-outs go into the sub-cycle B dispatch text verbatim.
