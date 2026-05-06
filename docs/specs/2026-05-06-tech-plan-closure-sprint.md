---
title: tech-plan-closure-sprint
date: 2026-05-06
status: approved
phase: 2 (closure sprint planning, post-Phase-3.5 retrospective)
input_design_spec: docs/specs/2026-05-06-tide-pull-retrospective.md
authors: [tech-lead, orchestrator]
---

# Neap (formerly *Tide / Pull*) — v0.5 Closure Sprint Tech Plan

**Spec read:** `C:\Dev\gameX\docs\specs\2026-05-06-tide-pull-retrospective.md`
**Working directory:** `C:\Dev\gameX`
**Host:** Windows 11 Pro · PowerShell 5.1 · Node v25.7.0 · npm 10.8.1 · git 2.41.0
**Dev budget:** solo, ~2 weeks (10 working days), AI-assisted
**Scope class:** closure sprint on a shipped slice — engineering, not redesign

---

## 1. Stack confirmation

The stack from the original tech-plan stays exactly as-is. None of the 11 P1s warrants a new runtime dependency.

| Concern | Decision | Notes |
|---|---|---|
| Language | TypeScript 6.0.2 (per `package.json`) | strict; no change |
| Renderer | Pixi.js `^8.18.1` | already installed; the new modules (`intentBeat`, `cursorTether`, headland fire) are all `Container` + `Graphics` work |
| Build/dev | Vite `^8.0.10` | no change |
| Audio | native Web Audio | the new `fadeToSilence(durationS)` is a `linearRampToValueAtTime` on the existing `masterGain`; no Howler |
| Persistence | `localStorage`, single key | key migrates `tide-pull/save/v1` → `neap/save/v2` (P1 #1, #2) |
| Lint/format | ESLint flat config + Prettier | no change |
| Test | manual feel-testing + stranger-test | matches retrospective |
| Trailer capture | OBS Studio (user-driven) | per Hard Constraint #6, the orchestrator does not invoke OBS |

**No new packages.** Specifically:

- **Howler is NOT installed and stays not-installed.** The day-5 audio fallback in the original plan was a contingency; it never fired and the closure sprint doesn't change the audio architecture meaningfully (just adds `fadeToSilence` and one extra bell).
- **No analytics, no Sentry, no PostHog, no GA, no Plausible** — the perimeter is enforced by absence per design-spec items 21–33.
- **No `nanoid`, `mitt`, `comlink`, etc.** All P1 work composes from what `pixi.js` and the existing module structure already provide.

The only thing to note before day 1: confirm that no automated dependency-update PR has bumped Pixi to v9 in the meantime; the closure sprint is **not** a Pixi-major-upgrade window. Pin to `8.18.1` exact (`"pixi.js": "8.18.1"`, no caret) for the duration of the sprint if drift becomes a worry.

---

## 2. Architecture sketch — diff from current state

Current source layout (24 .ts files under `game/src/`) is solid; the closure sprint adds three new render modules, modifies four existing core modules, deletes one file, and ships one save-schema migration.

### 2.1 New files to create

| Path | Purpose | Approx LOC | Owner-day |
|---|---|---|---|
| `game/src/render/intentBeat.ts` | Single-shot per-night affordance (N1 reuses `harbour.ts` pulse; N2 = centroid ring; N3 = east-edge ring) | ~120 | Day 4 |
| `game/src/render/cursorTether.ts` | Replacement for `cursorTrail.ts`. Per-frame line cursor → in-range receiver, alpha = `0.3 * holdT * (1 - dist/range)` | ~80 | Day 5 |
| `game/src/render/headlandFire.ts` | The new N3 receiver. Idle pulse 1.2 Hz, brightens on first lantern proximity, persists for the rest of the night | ~110 | Day 6 |
| `docs/specs/2026-05-XX-steam-page-draft.md` | P1 #11 forcing-function artefact (date-stamped at draft time) | doc | Day 9 |

### 2.2 Existing files to modify

| Path | Change | Item |
|---|---|---|
| `game/src/state/save.ts` | Bump `SAVE_KEY` to `neap/save/v2`; new `SaveDataV2` shape; **migration on read** (try v2 first, fall back to v1, write back as v2 once); persisted `ghosts` array | P1 #1, #2 |
| `game/src/state/meta.ts` | `PersistedMeta` gains `ghosts: { night: NightNumber; type: ReceiverType; x: number; y: number }[]`. `recordNightComplete` writes ghost positions to persistence-shaped data; `ghostsForNight` reads from a unified store (session + persisted), de-duplicates by `night` if both exist | P1 #2 |
| `game/src/main.ts` | Held-success block (lines 216–228) re-frame; intent-beat hook between title-card fade and input-enable; cursor-tether wiring replaces cursor-trail wiring; N3-only branch in `applyReceiverAttraction` (gate on `state.level.night.goal.kind === 'send'` per OQ18 adjudication); N3 fade-to-silence + final-bell scheduler; picker-entry duck (P2 #16 if time) | P1 #4, #5, #7, #8 + OQ18 + P2 #16 |
| `game/src/render/moonrise.ts` | One-line guard at the top of `update`: `if (prefersReducedMotion()) { phase = 'idle'; cursorAlpha.value = 1; worldLayer.position.y = worldLayerBaseY(worldLayer); audio.fadeBedIn(0.4); return; }` (the audio fade-in is invoked from main.ts, not this module — module stays pure-render) | P1 #3 |
| `game/src/render/cursor.ts` | Drop the `cursorTrail` import/coupling; cursor module already independent — verify no leftover references | P1 #8 |
| `game/src/audio/manager.ts` | Add `finalBell()` (sine 880 Hz, same envelope as goalMet) + `fadeToSilence(durationS: number)` (linear ramp on master to 0); also add `fadeBedIn(s: number)` if not already present in the reduce-motion swap path | P1 #3, #7 |
| `game/src/render/harbour.ts` | Light extraction: existing pulse becomes the N1 path of `intentBeat.ts` — minimal change; harbour ring still owns its breathing animation, intent-beat module just orchestrates (suppresses on subsequent re-entries within session) | P1 #5 |
| `game/src/verbs/settle.ts` | New `onLanternIgnitesFire` callback hook surfaced to N3; `headlandFire.ts` listens. Sent-lantern fade timing unchanged (fire ignites just before the 600 ms alpha-down) | P1 #6 |
| `game/src/render/titleCard.ts` | `TITLE_STRINGS['waning-gibbous']` swapped to storyboarder-authored line (P2 #13 — final wording is an open question; pick the storyboarder candidate as default and ship it day 9 unless overridden by user at day-7 trailer checkpoint) | P2 #13 |
| `game/src/render/entities.ts` | Optional: `fire` receiver type registered for parity, OR the fire stays a separate render module (`headlandFire.ts`) that is *not* a `ReceiverInstance`. **Pick: keep fire out of `state.receivers`** — it's an ambient response to the verb, not a verb target. Wire purely render-side. | P1 #6 |
| `game/levels/night-3.delta.json` | Add `ambient.fire: { x: 1700, y: 980 }` block (or the geometric structure used elsewhere — consult the existing `ambient` schema in `bay.base.json` on day 6 before authoring) | P1 #6 |
| `game/index.html` | `<title>` text becomes `Neap` | P1 #1 |
| `game/package.json` | `name` field becomes `neap` (or `neap-game` if npm complains; verify on day 1) | P1 #1 |
| `docs/specs/conventions.md` | Add new section "Perimeter — UI surfaces that do not exist" per P2 #17 (do this in day 1 with the rename — it's a single section append) | P2 #17 |
| `docs/specs/motion-and-colour-bible.md` | Append swap-table rows: harbour-pulse, picker-glyph hover, intent-beat pulses, cursor-tether, fade-to-silence y-drift; rename headers | P1 #3, #5, #8, P2 ripple |
| `docs/specs/trailer-cut.md` | Update moonrise duration text (8s first / 1.8s return) and confirm reduce-motion behaviour matches what ships | P1 #9 prerequisite |
| `README.md` | Rename, then on day 8 (after #5 lands) trim per P2 #18 | P1 #1, P2 #18 |
| `docs/HOW-TO-PLAY.md` | Rename, then on day 8 trim per P2 #18; N3 verb-label → "let go" / "release" per P2 #12 | P1 #1, P2 #12, P2 #18 |
| `docs/specs/feel-test-protocol.md` | Rename only | P1 #1 |
| `docs/specs/build-log.md` | Append closure-sprint entries day-by-day; new `## WCAG re-audit` section on day 9 | ongoing |

### 2.3 Files to delete

| Path | Reason |
|---|---|
| `game/src/render/cursorTrail.ts` | Removed per P1 #8. Verify no imports remain (`main.ts`, anywhere) before deletion. The acceptance Gherkin requires "the `cursorTrail.ts` code path no longer exists." |

### 2.4 Save schema migration shape

```ts
// game/src/state/save.ts (after change)

const SAVE_KEY = 'neap/save/v2';
const LEGACY_KEY = 'tide-pull/save/v1';

interface SaveDataV2 {
  version: 2;
  completedNights: NightNumber[];
  freeReentry: boolean;
  ghosts: { night: NightNumber; type: ReceiverType; x: number; y: number }[];
}

// Read order:
// 1. localStorage[SAVE_KEY] — if v2, return as-is.
// 2. localStorage[LEGACY_KEY] — if v1, lift completedNights + freeReentry,
//    set ghosts: [], write back to SAVE_KEY, leave LEGACY_KEY in place
//    (do NOT remove — defensive; cheap; the user might roll back).
// 3. Otherwise empty SaveDataV2.
//
// Write: always to SAVE_KEY only. v1 is read-only.
```

The migration write should be **idempotent and non-throwing** — wrap in try/catch as the existing code does; localStorage quota / disabled storage stays non-fatal.

### 2.5 Rename touch-set checklist (P1 #1)

Run as a single ripgrep audit on day 1 after the changes are made; this is the canonical "did I miss anything" gate.

```
rg "tide.?pull|Tide / Pull" --glob "!docs/specs/2026-05-*-tide-pull-*" \
   --glob "!docs/specs/build-log.md" --glob "!node_modules" \
   --glob "!dist" --glob "!.git"
```

Expected hits (player-facing surfaces — must replace):

- `game/index.html` `<title>`
- `game/package.json` `name`
- `game/src/state/save.ts` `SAVE_KEY` constant
- `README.md` (top-level + body)
- `docs/HOW-TO-PLAY.md` (top-level + body)
- `docs/specs/conventions.md` (intro)
- `docs/specs/feel-test-protocol.md` (intro)
- `docs/specs/motion-and-colour-bible.md` (intro)
- `docs/specs/trailer-cut.md` (intro + script lines that mention the name)

Expected hits to **leave alone** (historical record per spec §1 last paragraph):

- `docs/specs/2026-05-05-tide-pull-design.md`
- `docs/specs/2026-05-05-premise.md` (if it mentions the name)
- `docs/specs/2026-05-06-tide-pull-retrospective.md`
- `docs/specs/2026-05-06-tech-plan.md`
- `docs/specs/2026-05-06-tech-plan-closure-sprint.md` (this file's frontmatter title is `tech-plan-closure-sprint`; body refs to "Tide / Pull (formerly)" stay as historical fidelity)
- `docs/specs/build-log.md` existing entries (going-forward entries use Neap)
- past commit messages

Repo rename `gh repo rename` is **deferred** per spec; do not run it in this sprint.

### 2.6 Intentionally not designed yet

Recorded ambient bed, second bay, mobile/touch port, curator outreach, pricing decision, repo rename, `?night=N` removal, gamification's reluctant-lanterns variant, per-lantern crossing chime, per-night sim reactivity, ambient-creature responsiveness, daily-seed sandbox, kishōtenketsu fourth night. All listed as P3 in the spec. None of them earn a file in this sprint.

---

## 3. Sprint sequence — 10 working days + 2-day slack

**Format:** `Day N — Title (S/M/L) [⛳ checkpoint if applicable]`. Estimates: S ≤ ½ day, M ≈ ½–1 day, L = 1–2 days. The sequencing rule: foundation (rename + save migration) lands first because everything else writes through the new schema; visual/a11y P1s mid-sprint; N3-cluster work consolidated on one day; trailer + stranger-test + Steam draft at the end where they consume the slice's polished state.

---

### Day 1 — Rename to *Neap* + save schema migration + conventions perimeter (M) [⛳]

- **Build:**
  - Run the §2.5 ripgrep audit; replace name across the 9 player-facing surfaces. Leave historical specs alone.
  - `game/src/state/save.ts`: bump key, new shape, migration-on-read.
  - `game/src/state/meta.ts`: `PersistedMeta.ghosts` field; `recordNightComplete` writes ghost positions; `ghostsForNight` unifies session + persisted (de-dupe by `night` — persisted wins because it's the canonical record once a night completes).
  - `docs/specs/conventions.md`: append the "Perimeter — UI surfaces that do not exist" section per P2 #17. Doing this on day 1 (rather than day 9 P2) makes it a hard rule before any new render module ships, which closes the door on the perimeter accidentally drifting during the sprint.
- **Depends on:** nothing.
- **Done when:**
  - Acceptance scenario "Rename to Neap is in tree" passes (ripgrep finds zero hits in player-facing files).
  - Acceptance scenario "Cross-session ghosts persist" *partially* passes — schema is in place; rendering ghosts at picker scene is day 7 (P2 #14).
  - Manual save-migration smoke: clear localStorage, set a stub `tide-pull/save/v1` blob with `completedNights: [1]`, reload, confirm `neap/save/v2` is written and `freeReentry: false` is preserved.
  - `lint` and `build` pass.
- **⛳ Checkpoint:** Show user the diff of the rename + migration; confirm before continuing. The rename has emotional weight beyond engineering — let them sign off.
- **Cost:** M.
- **Gherkin satisfied:** "Rename to Neap is in tree"; foundation for "Cross-session ghosts persist".

### Day 2 — Moonrise reduce-motion fix + cursor-trail removal + cursor tether shimmer (M)

Two small visual P1s done together; both touch `main.ts` rendering wiring, and bundling them avoids two separate retest cycles for the same area.

- **Build:**
  - **P1 #3 moonrise reduce-motion** — add the early-return guard described in §2.2. Confirm `audio.start()` still runs on first pointer press (audio init is independent of moonrise). Verify with OS reduce-motion toggled both ways.
  - **P1 #8a delete `cursorTrail.ts`** — remove file, remove imports from `main.ts` (lines 20, 93–94, 101–104, 171). Verify no other module imports it.
  - **P1 #8b create `render/cursorTether.ts`** — line draws each frame during hold, mounted on `uiLayer` between entities and cursor-disc. Per-frame complexity: O(receivers); fine, since N2 has 8 lanterns and N3 has ≤6. Reduce-motion swap: solid line, no fade-in tween, same alpha computation.
- **Depends on:** Day 1 (no — independent; could swap with day 1 if rename is held up).
- **Done when:**
  - Acceptance scenario "Moonrise honours reduce-motion" passes (OS toggle, fresh launch, instant cut + 400 ms ambient bed fade-in, no y-offset tween).
  - Acceptance scenario "Cursor tether shimmer replaces trail" passes:
    - Tether visible during hold within range; alpha scales with `holdT` and inverse distance.
    - Reduce-motion: static frame, no fade-in.
    - `rg cursorTrail` returns zero hits in `game/src/`.
- **Cost:** M.
- **Gherkin satisfied:** "Moonrise honours reduce-motion"; "Cursor tether shimmer replaces trail".

### Day 3 — Held-success re-frame + OQ18 N3-only gate (S → M)

- **Build:**
  - **P1 #4 held-success re-frame** — modify the `goalNowComplete` block in `main.ts` (lines 216–228):
    - Keep the bell + cream + 1.5 s ease as today.
    - Track a `canAdvanceMs` flag: at `postCompleteMs >= 1500` (savour minimum), allow any pointer press to call `finishCurrentNight(scene)` immediately.
    - At `postCompleteMs >= 2500` (ceiling), auto-advance as today.
    - Player can hold past 2500 ms — ceiling only fires when no input arrives.
    - Tap-during-savour: short-circuit ease, advance immediately (cuts scale tween short by snapping to current eased value).
  - **OQ18 adjudication** — gate `applyReceiverAttraction` in `main.ts` (line 187 callsite) on `state.level.night.goal.kind === 'send'`. Single-line guard. The function definition stays as-is; the call site changes from unconditional to gated. This means N1 boats and N2 lanterns no longer experience direct pull; they only move via the fluid flow field. **This is a behaviour change visible to the player** — N1 and N2 may need light retuning of `pullStrength` / `pullRadius` if guidance feels weaker. Test all three nights end-to-end before moving on.
- **Depends on:** Day 1, Day 2.
- **Done when:**
  - Acceptance scenario "Held-success is dwell-to-savour" passes:
    - Bell + cream + ease fire on goal-met.
    - At 1500 ms a pointer press advances.
    - At 2500 ms with no input, auto-advance.
    - No "advance now" UI exists.
  - All three nights still complete in feel-test (especially N1 — boats may need pull-strength bump if direct-pull removal makes them sluggish; tune in `config.ts` if needed).
- **Cost:** M (the OQ18 retune may eat half the day on its own).
- **Gherkin satisfied:** "Held-success is dwell-to-savour"; "OQ18 N3-only direct pull" (implicit — the spec scenario mandates it but isn't its own Gherkin block; the trailer on day 9 is the empirical test).

### Day 4 — Intent beat for Nights 1, 2, 3 (M)

- **Build:**
  - Create `game/src/render/intentBeat.ts`:
    - `IntentBeat` interface with `start(night, level)` / `update(dt)` / `skip()` / `isActive()`.
    - N1 path: defers to existing `harbour.ts` pulse (the affordance already ships; intent-beat module just suppresses on re-entry within session via a `Set<NightNumber>` of nights-seen-this-session).
    - N2 path: compute centroid of initial lantern positions (8 lanterns from `night-2.delta.json`); render a faint ring at that point; scale 1.0 → 1.15 → 1.0 over 600 ms ease-in-out, alpha 0 → 0.35 → 0.
    - N3 path: foam-stop ring (`#a8b5cc`), expands from `(1920, 540)` over 800 ms, alpha 0.4 → 0, radius 0 → 200.
  - Wire into `main.ts`:
    - `enterNight()`: after title-card.show, schedule input-disable for ~2 s post-fade; intent-beat starts at title-card-fade-done; input enables when intent-beat finishes OR on any input (skip).
    - Reduce-motion swap: replace the animation with a single-frame ring at peak alpha for 200 ms, then off.
- **Depends on:** Day 1 (rename), Day 3 (input-handler shape).
- **Done when:**
  - Acceptance scenario "Intent beat fires on each night" passes for all three nights.
  - Re-entering a night within the same session does NOT re-fire the beat.
  - Tapping during the beat skips it and enables input immediately.
- **Cost:** M.
- **Gherkin satisfied:** "Intent beat fires on each night".

### Day 5 — N3 receiver variety: headland fire (M) [⛳]

The N3 cluster starts here — fire ignition is the dependency for day 6's fade-to-silence work.

- **Build:**
  - Create `game/src/render/headlandFire.ts`:
    - `HeadlandFire` interface with `setIgnited()` / `update(dt)` / sprite container.
    - Idle: small disc, `#ff8a4a` fill, faint glow, pulse alpha 1.2 Hz at low amplitude.
    - Ignited: scale-up tween 200 ms then sustain at brightened state.
    - Reduce-motion swap: omit pulse and ignition tween; static idle vs static ignited frames only.
  - Modify `game/levels/night-3.delta.json`: add `ambient.fire: { x: 1700, y: 980 }` (consult existing `ambient` schema in `bay.base.json` first; if no `ambient.fire` slot exists, extend `level/types.ts` with a typed `AmbientFireDef` and update `loader.ts` merge).
  - Modify `game/src/verbs/settle.ts`: add hook — when any lantern's `position.x > 1600 && distance to (1700, 980) < 80` for the first time, fire a callback. Pass the callback in from `main.ts` so `settle.ts` doesn't import audio or render directly.
  - Modify `game/src/audio/manager.ts`: add `lanternIgnitesFire()` — re-uses goalMet bell with +200 Hz transposition (sine 1080 Hz, shorter envelope, lower gain).
  - Wire in `main.ts`: N3 entry instantiates `headlandFire`, mounts on `worldLayer` (above water, below entities); first-ignition callback triggers `audio.lanternIgnitesFire()` + `fire.setIgnited()`.
- **Depends on:** Day 1, Day 3.
- **Done when:**
  - Acceptance scenario "N3 has receiver variety via headland fire" passes:
    - Lantern crosses near (1700, 980) → fire ignites.
    - Soft warm chime plays.
    - Fire stays lit for the rest of the night.
  - Fire does not count toward `goal.minCount` (verify by checking N3 goal-met still fires only when ≥4 lanterns cross the east edge).
- **⛳ Checkpoint:** Show user the new N3 fire interaction; confirm visual + audio direction before fade-to-silence layers on top tomorrow. This is the first new visual element since the slice shipped — easy to over- or under-shoot tonally.
- **Cost:** M.
- **Gherkin satisfied:** "N3 has receiver variety via headland fire".

### Day 6 — N3 fade-to-silence + final bell callback + picker-entry duck (M)

The rest of the N3 closure cluster, plus the smaller P2 audio item that fits the same `audio/manager.ts` work session.

- **Build:**
  - Modify `game/src/audio/manager.ts`: add `finalBell()` (sine 880 Hz — same frequency as N1 goal-met bell, confirm by reading the existing `goalMet()` source; if the N1 bell isn't 880 Hz, match whatever it is for the callback to land); add `fadeToSilence(durationS: number)` that ramps `masterGain` to 0 over duration; add `fadeBedIn(durationS: number)` if not already present (for the moonrise reduce-motion path).
  - Modify the goal-met block in `main.ts` for N3 specifically:
    - On `goalNowComplete && currentNight === 3 && !wasGoalComplete`: schedule `setTimeout(() => audio.finalBell(), 1500)`, then `setTimeout(() => audio.fadeToSilence(4), 3500)`.
    - Held-success "tap to advance" must clear these timeouts and ramp gain back up on `enterNight` (which already calls `audio.setPhase` — extend it to also `audio.unduckBed(0.6)` and reset master gain if it was being faded).
    - Optional cosmetic: `worldLayer.position.y` slow drift over 4 s during fade; reduce-motion omits the drift.
  - **P2 #16 picker-entry duck** — in `showPicker()`: `audio.duckBed(0.3, 0.6)`. In `enterNight()` from picker: `audio.unduckBed(0.6)`. Verify it composes with the N3 fade (don't introduce a separate state machine — duck on top of fade just means the duck sits at the lower of the two values).
- **Depends on:** Day 5 (fire ignition is part of the N3 closure flow).
- **Done when:**
  - Acceptance scenario "N3 closes with a callback" passes:
    - Goal-met fires the existing bell.
    - 1500 ms later final bell fires at the same frequency as N1 goal-met.
    - 2000 ms after final bell, master gain fades to 0 over 4 s.
    - Player can advance early via pointer press; gain restores on re-entry.
  - Picker entry from a completed night ducks bed by 30%; entering a night from picker un-ducks.
- **Cost:** M.
- **Gherkin satisfied:** "N3 closes with a callback".

### Day 7 — Picker as place + persistent ghost rendering (S → M)

Lands the visual half of P1 #2 (day 1 was the schema half) plus P2 #14, which is "free" once #2 ships.

- **Build:**
  - Modify `main.ts` `showPicker()`: do NOT clear `ghostLayer` on transition to picker if `meta.completedNights.size > 0` — instead, render the union of all persisted ghosts on the picker scene. Ambient creatures (`ambientLife`) are already mounted on `worldLayer` — verify they stay mounted at picker (which they should, given `worldLayer` isn't removed).
  - Verify on `enterNight`: `ghostsForNight(meta, night)` now reads persisted-or-session, returns merged list. `renderGhosts` consumes it as today — no change to `render/ghosts.ts`.
  - Verify the "no completion ticks" hard line — `nightPicker.ts` already shows three glyphs with no ticks; quick audit, no change expected.
- **Depends on:** Day 1 (schema), Day 6 (showPicker call sites).
- **Done when:**
  - Close browser tab mid-session, reopen → picker shows ghosts from completed nights (boats from N1, lanterns from N2, etc.).
  - Acceptance scenario "Cross-session ghosts persist" fully passes including the picker-scene display.
  - No visit counter, no per-night completion timestamp, no "bays played" UI exists anywhere (audit `nightPicker.ts` and any UI files).
- **Cost:** S–M.
- **Gherkin satisfied:** "Cross-session ghosts persist" (full); P2 #14 "Picker as place".

### Day 8 — Title-card line, README/HOW-TO-PLAY trim, "let go" verb-label, motion bible swap-table updates (S → M)

P2 cluster day. Each item is small, but they need quiet attention to land cleanly together.

- **Build:**
  - **P2 #13** — Update `titleCard.ts` `TITLE_STRINGS['waning-gibbous']` to the storyboarder candidate (default: *"Waning gibbous. Let go what the bay's been holding."*). Document the alternative two strings in a code comment so swap on day 9 user feedback is one-line.
  - **P2 #12** — Update `docs/HOW-TO-PLAY.md` § "What each night is asking of you" — N3 framing → "let go" / "release" (programmer-facing `goal.kind === 'send'` stays as is in code).
  - **P2 #18** — Trim `README.md` Play-it section to one sentence: *"Hold the mouse to pull the tide. Let go to watch it rush home."* Trim `docs/HOW-TO-PLAY.md` to: one-paragraph orientation + three-night description (no N3 spoiler) + soft-drift mention + dev-only `?night=N` mention. Drops the long discoverability narrative.
  - **Motion bible append** — `docs/specs/motion-and-colour-bible.md` swap-table rows for harbour-pulse, picker-glyph hover, intent-beat (3 rows), cursor-tether, fade-to-silence y-drift.
- **Depends on:** Day 4 (intent beats are the reason README/HOW-TO-PLAY can be trimmed).
- **Done when:**
  - All four artefacts updated; `lint` (markdown is not linted, but verify build still passes); spot-check by re-reading HOW-TO-PLAY end-to-end.
- **Cost:** S–M.
- **Gherkin satisfied:** indirectly supports "Stranger-test passes" (the stranger reads README first if curious).

### Day 9 — WCAG re-audit + `trailer-cut-1.mp4` recording (M) [⛳]

Two of the four end-of-sprint gates land here; the third (stranger-test) is day 10 and the fourth (Steam draft) is also day 10.

- **Build:**
  - **P2 #15 WCAG re-audit:**
    - For each of 3 lunar palettes × 5 interactive sprites (boat, lantern, harbour ring, cursor moon, title text) × worst-case water tile: compute relative-luminance contrast ratio.
    - Use any in-browser CB simulator (Chrome DevTools Rendering panel has `Emulate vision deficiencies` for deuteranopia/protanopia/tritanopia).
    - Document results in `docs/specs/build-log.md` under `## WCAG re-audit`.
    - Fix any drop below 4.5:1 (text) or 3:1 (non-text). Most likely failure point: lantern at full-moon palette where water is brightest. If failures appear, adjust rim-light or fill colour in `entities.ts` rather than re-tinting water.
  - **P1 #9 trailer recording (USER STEP — orchestrator describes only):**
    - **The user runs OBS Studio** with the `trailer-cut.md` recipe. Orchestrator provides:
      - Pre-flight checklist: localStorage cleared (`localStorage.removeItem('neap/save/v2')` in DevTools console), browser at default zoom, Edge or Chrome full-screen-window, system audio capture armed, mic muted.
      - Frame-by-frame timing the user follows from `trailer-cut.md`.
      - Output filename: `docs/specs/trailer-cut-1.mp4`.
    - Update `docs/specs/trailer-cut.md` to reflect actual moonrise duration (8s first / 1.8s return).
- **Depends on:** all prior days. The trailer is meaningless until the visual + audio + N3 closure are all landed.
- **Done when:**
  - Acceptance scenario "WCAG re-audit passes" passes.
  - Acceptance scenario "Trailer-cut-1.mp4 exists" passes.
  - **Empirical OQ18 test:** the user (and tech-lead, after viewing) confirm whether the trailer reads as "moon pulls water → water pulls things" or "moon pulls things directly." If the trailer reads as the latter on N3 such that the wedge clause feels broken, log this as a follow-up — gamification's "soften to flow assist" wins on the next pass and the day-10 Steam-page draft notes this as deferred. Do NOT re-open OQ18 in this sprint; the spec adjudicated, the trailer is the empirical re-test.
- **⛳ Checkpoint:** User reviews `trailer-cut-1.mp4` + WCAG audit results. Confirm slice is "ready to show a stranger" before day 10.
- **Cost:** M (most time goes to the trailer recording loop — trailer is the user's tightest creative deliverable).
- **Gherkin satisfied:** "WCAG re-audit passes"; "Trailer-cut-1.mp4 exists".

### Day 10 — Stranger-test (×2) + Steam page draft + slice closeout (M) [⛳]

- **Build:**
  - **P1 #10 stranger-test (USER STEP — orchestrator describes only):**
    - **The user finds two non-developers**, runs the protocol from `docs/specs/feel-test-protocol.md` § "The stranger test". This Windows machine, default URL, no priming, no spoken instruction, observe.
    - Acceptance: ≥ 60 s unprompted in picker/sandbox, full slice in 8–12 minutes, no questions asked.
    - **Parallel reduce-motion pass** — second tester (or first tester re-tests with localStorage cleared) plays the same protocol with Windows 11 reduce-motion toggled on (Settings → Accessibility → Visual effects → Animation effects: off). Confirms moonrise instant-cut, intent-beat single-frame, cursor-tether static, fade-to-silence with no y-drift.
    - Document outcomes in `docs/specs/build-log.md` under `## Stranger-test results`. If a tester gets stuck, document the named cause; **do not patch on day 10 — file as a follow-up.**
  - **P1 #11 Steam page draft:**
    - Create `docs/specs/2026-05-XX-steam-page-draft.md` (date-stamp at write time).
    - Sections per spec §11. Three screenshots: capture from a fresh-localStorage build, one per night, full-screen-window crop. The trailer reference is the day-9 `.mp4`. Tags locked. Pricing range provisional $5.99 with $7.99 noted as alternative.
  - **Slice closeout:**
    - Update `docs/specs/build-log.md` with closure-sprint summary entry.
    - Run a final ripgrep audit per §2.5 to catch any rename drift introduced mid-sprint.
    - Run `npm run lint` and `npm run build` clean.
- **Depends on:** all prior days.
- **Done when:**
  - Acceptance scenario "Stranger-test passes" passes (both runs).
  - Acceptance scenario "Steam page draft exists" passes.
  - Build-log entry committed.
- **⛳ Final checkpoint:** Hand off to user. v0.5 is declared shipped if both stranger-test passes hold; if a tester fails, the slice is **not** declared shipped, the failure cause goes in the build-log, and days 11–12 absorb the remediation.
- **Cost:** M.
- **Gherkin satisfied:** "Stranger-test passes"; "Steam page draft exists".

### Days 11–12 — Slack / contingency

Reserved for:

- A failed stranger-test on day 10 → triage and patch one named cause (most likely: an intent-beat that didn't land; a tuning miss on N3 fire interaction range; a title-card line that confused the tester).
- A WCAG failure on day 9 → palette retune.
- Re-record `trailer-cut-1.mp4` if day 9 reveals OQ18 needs revisiting.
- Migration corner-case patch if a stranger tested with v1 save data and something broke.
- If unused: research the `gh repo rename` mechanics and prep the rename PR (don't run it — public-deployment threshold not crossed).

---

## 4. Risks ranked likelihood × impact

| # | Risk | L × I | Mitigation |
|---|---|---|---|
| 1 | **OQ18 retune cascades into N1/N2 feel.** Removing direct-receiver-pull from N1 and N2 (gating it on `goal.kind === 'send'`) changes how boats and lanterns respond. The flow-field-only path may feel weaker than what shipped, requiring `pullStrength`/`pullRadius` retune in `config.ts`. Solo-dev iteration on feel-tuning eats unbudgeted hours. | **High × High** | Day 3 reserves a full day. Tune in `config.ts`, not in the verbs themselves — keep changes contained. If retune isn't landing by end of day 3, defer the OQ18 gate to day 11–12 slack and ship N3-only direct-pull as a Pixi feature flag (`config.OQ18_N3_ONLY = true`). The flag becomes a one-line revert if the trailer reveals it was the wrong call. |
| 2 | **Headland-fire interaction edge cases.** "Lantern crosses near (1700, 980) for the first time" has ambiguity around: (a) what if a lantern crosses, drifts back, crosses again — does fire stay lit (yes, per spec); (b) what if two lanterns cross simultaneously — does the chime fire twice (no, idempotent); (c) what if the first lantern is sent at frame N and the second at frame N+1 with the fire ignition tween still in progress (chime fires once on first ignition only). | **Med × Med** | Implement as a strict state machine (`idle` → `ignited`, no transitions back). First-ignition callback fires exactly once, guarded by an internal `hasIgnited` boolean. Day-5 acceptance test exercises all three edges. |
| 3 | **Held-success "tap to advance" collides with other input handlers.** The press-edge in `main.ts` already does several things: skip title card, skip moonrise, attack audio. Adding "advance scene" to that edge means a press during the savour beat triggers all of them in some order. If `enterNight` is called mid-tween, `worldLayer.scale` may be left in a partial state. | **Med × Med** | `enterNight` already does `worldLayer.scale.set(1)` on entry — so the partial-tween-state is reset. Verify by inspecting the call. Test: complete N1, tap during savour at exactly 1500 ms, confirm N2 enters cleanly with scale 1.0. Add explicit reset in `finishCurrentNight` if the call-order proves fragile. |
| 4 | **Save migration corner cases.** Players with corrupted `tide-pull/save/v1` blobs (partial JSON, missing fields, invalid `completedNights`) hit the migration path. The current v1 reader already filters invalid nights and try/catches; the v2 reader needs the same defensiveness. | **Med × Med** | Mirror the existing v1 defensive parsing in v2. On any parse failure, fall through to empty save (don't block playback). Test: manually inject a malformed v1 blob via DevTools, reload, confirm game loads with empty save. |
| 5 | **Rename touch-set bigger than estimated.** The retrospective spec says ~40 references; the §2.5 audit suggests ~25 player-facing. If the codebase has accumulated string references in places not seen (e.g. comments, vite config, eslint config), the day-1 budget overruns. | **Med × Low** | Day 1 ripgrep is the canonical audit. Run it as the first task of day 1, not the last; size estimate is known before commits start. If over-budget, defer non-critical renames (e.g. comments) to day 11–12. |
| 6 | **Trailer recording reveals OQ18 needs revisiting.** Day 9 may show the N3 direct-pull reading wrong on muted autoplay. The spec explicitly designates the trailer as the empirical OQ18 resolver. | **Low × High** | Days 11–12 absorb. Re-record budget is 2–3 hours (one OBS session). If the trailer fundamentally doesn't read, the spec authorises switching to gamification's "soften to flow assist" — which is a one-line change in `applyReceiverAttraction` to scale force by water-flow magnitude. |
| 7 | **Stranger-test can't be scheduled.** Two non-developers, on this Windows machine, no priming. If neither tester is available within the day-10 window, the slice is in limbo. | **Low × High** | This is a coordination risk, not engineering. Mitigation: schedule both testers in advance, ideally before day 8. Day 11–12 slack covers a single missed window. If both miss, the slice ships "pending stranger-test" and the test happens in the following week. |
| 8 | **`prefers-reduced-motion` parallel-pass tester is hard to find.** Same-tester, second-pass with reduce-motion toggled may give skewed results (the first pass primes them). | **Low × Med** | Use the second tester (different person) for the reduce-motion pass. Alternatively, accept the first-tester second-pass and document the priming caveat in the build-log. |

Risks explicitly NOT carried forward from the original tech-plan:

- **R1 fluid-sim feel** — passed its kill gate, shipped, soft-drift bug fixed in post-slice polish. Closed.
- **R2 audio scope creep** — new work in this sprint is `finalBell` + `fadeToSilence` + minor wiring; total ~30 LOC. Not a risk at this size.
- **R7 browser autoplay policy** — solved on day 5 of the original build. Closed.

---

## 5. What this plan does NOT cover

### Items deferred per the retrospective spec (P3 / v1.0+)

Carried forward verbatim from spec §"P3 — deferred to v1.0+":

- Recorded ambient bed (replaces synthesised audio for Steam-page launch).
- Curator outreach (15 cosy-Steam-adjacent targets).
- Mobile/touch port — "touch breaks the cursor-as-moon wedge" stays.
- Pricing decision ($5.99 vs $7.99).
- 9:16 TikTok cut.
- Second-bay content drop / Night 4 / creature-of-session.
- Held-ceiling cursor "bowstring" feedback.
- Per-night fluid-sim reactivity (`DAMPING_RATE` / `REST_RATE` per phase).
- Per-lantern crossing chime on N3.
- Ambient creatures responding to player pull.
- `?night=N` URL override removal.

### Items the tech-lead would push back on from the spec

- **P2 #16 picker-entry duck** — moved from P2 to day 6 alongside the audio manager work because doing it separately wastes a retest cycle on the audio graph. This is a sequencing call, not a scope expansion.
- **P2 #17 conventions perimeter codification** — moved from P2 to day 1. Doing it before day 4–6 (when new render modules ship) closes the perimeter-drift door at the right moment. Cost is unchanged.
- **The orchestrator's adjudication of OQ18 (N3-only) is the right call for ship**, but flagging that gating `applyReceiverAttraction` on `goal.kind === 'send'` is a **behaviour change for N1 and N2** that wasn't there before. The day-3 plan reserves time for the retune; if it doesn't go cleanly, recommendation is **ship behind a `config.OQ18_N3_ONLY` flag** so the change is reversible until the trailer empirically resolves it. The spec doesn't authorise a flag; tech-lead is proposing one as a risk-mitigation.
- **The trailer being internal-artefact-only is correct** — the spec's reasoning (synthesised audio at storefront-autoplay 10s loop volume reveals as synthesised) is sound. No push back.
- **The Steam page being a `docs/specs/` draft, not a Steamworks live page, is correct** — forcing-function value, no commitment. No push back.

### Items needing adjudication before day 1

- **Final wording of N3 title-card line** (spec OQ #3). Default to the storyboarder candidate (*"Waning gibbous. Let go what the bay's been holding."*) on day 8 unless the user adjudicates differently before then. The other two candidates ship as code-comments for one-line swap.
- **Repo rename timing.** Spec says "at the moment of first public surface, not in this sprint." Confirmed — but if the user's intent was to rename the GitHub repo *before* the Steam page draft date-stamp, that's a public surface trigger. Surface this on day 1.
- **Whether `package.json.name` should be `neap` or `neap-game`.** npm restrictions on registered names are unlikely to apply (this isn't being published), but `neap` is a common dictionary word and a defensive `neap-game` may be cleaner if any tooling reads the name. Pick at day 1 ripgrep time.
- **OQ18 fallback flag.** Whether to ship `config.OQ18_N3_ONLY` as a feature flag (tech-lead's recommendation) or land the change unflagged (spec's plain reading). Surface at day 1; default to flagged unless the user vetoes.

### Items that are explicitly out of scope and will not be touched

- The build pipeline (`dev`, `qa`, `reviewer`, `planner-triage` agents). Per `CLAUDE.md`, deferred until Phase 3 unblock work happens.
- GitHub remote / `gh` setup / MCP server for GitHub.
- Hooks at `.claude/hooks/`.
- Test automation (no Vitest, no Playwright).
- Asset pipeline (no atlas baking, no Aseprite tooling — sprites stay PNGs, audio stays synthesised).
- Localisation.
- WebGPU renderer switch.
- Pixi v9 upgrade.
- Any analytics, telemetry, share, wishlist, follow, gift, invite, or notification surface — perimeter codified day 1.

---

```
TECH_LEAD_RESULT: PLAN_DRAFTED
DESIGN_SPEC_READ: 2026-05-06-tide-pull-retrospective.md
AGENT: tech-lead
```
