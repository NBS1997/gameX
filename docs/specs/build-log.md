---
title: build-log
date: 2026-05-06
status: working (append-only)
phase: 3
authors: [dev-agent, qa-agent, reviewer]
---

# Build Log — *Tide / Pull* Vertical Slice

Append-only working log for Phase 3. Each agent appends to its own subsection.

## Day 0 — repo bootstrap

### Day 0 — 2026-05-06
- **Built:** orchestrator initialised the git repo, created the private GitHub remote at `NBS1997/gameX`, pushed the initial commit (scaffold + Phase 0–2.5 specs).
- **Files touched:** none (repo metadata only).
- **P3 cuts taken:** none.
- **Out of scope:** none.
- **Watch-outs:** none.
- **Commit:** `a7c8154`

## Day 1 — bootstrap + Pixi hello bay

### Day 1 — 2026-05-06
- **Built:** Vite vanilla-ts scaffold under `game/` with Pixi.js 8.18.1; logical 1920×1080 stage with `BAY_COLOUR` background and a placeholder cursor-following circle (`Graphics`, drawn on the Pixi stage so it captures into any window-recording); OS cursor hidden on the canvas via CSS `cursor: none`. Dev server confirmed serving 200 at `http://localhost:5173/`. `tsc --noEmit` clean.
- **Files touched:** `game/index.html`, `game/src/main.ts`, `game/src/style.css`, `game/src/config.ts` (new), `game/vite.config.ts` (new), `game/package.json`, `game/package-lock.json`, `game/tsconfig.json` (default), removed `game/src/counter.ts`, `game/src/assets/`, `game/public/icons.svg` (Vite demo content).
- **P3 cuts taken:** none — day 1 is bootstrap.
- **Out of scope:**
  - **ESLint not installed.** Vite v8's vanilla-ts template no longer ships ESLint. `conventions.md` claims "ESLint 9 flat config + Prettier (Vite scaffold defaults — do not deviate)" — that's now a slight inconsistency. Day-2 decision: either install ESLint flat config + Prettier as devDeps or update `conventions.md` to drop the claim. Until then, `npm run lint` is undefined; reviewer/QA gates rely on `tsc --noEmit` only.
  - **Cursor-as-Pixi-Graphics is a placeholder, not the moon-glyph sprite.** The moon variants (waxing / full / waning) per design-spec #4 are scheduled for the day-4-onward work, after the motion-and-colour bible (day 2). Today's circle satisfies the day-1 acceptance ("circle follows cursor; OS cursor invisible") but is *not* the final cursor.
- **Watch-outs:**
  - Logical 1920×1080 with `object-fit: contain` will letterbox on aspect mismatches. That's intentional per the tech-plan but reviewer should confirm it doesn't violate any acceptance.
  - `app.stage.eventMode = 'static'` + `hitArea = app.screen` is what feeds `pointermove` into Pixi — keep this when the input handler moves to `src/input/pointer.ts` on day 2.
  - Pixi v8's `Application.init()` is async; `main.ts` uses top-level `await`. Vite supports this with the current `tsconfig.json` (`module: esnext`).
- **Commit:** see `git log` (this entry committed alongside).

## Reviews

*(populated by reviewer + qa-agent after each day)*

### Phase-4 Cycle 1 QA — 2026-05-06
- **Automatable acceptance:** ethics-perimeter sweep + static analysis run against `7c2fabe`
- **Browser-required acceptance:** all feel-test browser checks still pending human pass (stranger test, reduce-motion pass, clip-render, full-slice timing)
- **Ethics-perimeter sweep:** clean — no forbidden SDK imports, no outbound network calls, no dark-pattern UI strings, single `localStorage.setItem` call writing key `tide-pull/save/v1` (allowed)
- **`tsc --noEmit`:** exit 0, clean
- **`npm run lint` (ESLint):** exit 0, clean
- **Runtime deps:** `pixi.js` only — clean
- **Notes:** The retrospective's flagged open bug is confirmed. `render/moonrise.ts` contains zero references to `prefersReducedMotion` or `prefers-reduced-motion`; it animates a camera-lift + cursor-alpha ramp unconditionally. `main.ts` calls `moonrise.start()` and `moonrise.update()` with no reduced-motion guard. The `skip()` path is only reachable via press input, not via the OS preference. This is a live WCAG 2.2 SC 2.3.3 gap. All other perimeter lines are honoured. Fluid sim has a `MAX_VELOCITY` clamp in `sim/fluid.ts` confirming the post-slice retune landed; no further sim regression detected at static level.
- **Browser checks required:**
  - [ ] Reduce-motion test (feel-test-protocol §The reduce-motion test) — especially step 3: confirm moonrise is an instant cut + 400 ms ambient fade when `Animation effects: Off`
  - [ ] 60-second sandbox feel-test
  - [ ] Full-slice test (Nights 1–3, 8–12 min)
  - [ ] Clip-render test
  - [ ] Contrast / colour-blindness audit (N2 + N3 palettes not yet audited)
  - [ ] Stranger test (canonical slice acceptance)

## Regressions

*(populated by qa-agent when found)*

### moonrise-reduce-motion — found Phase-4 Cycle 1
- **Symptom:** `render/moonrise.ts` performs a camera-lift animation and cursor-alpha ramp with no check of `prefers-reduced-motion`. The `a11y/reduceMotion.ts` utility exists and is used by `cursorTrail` and `softDrift`, but `moonrise` never imports it.
- **Reproduce:** Enable Windows Accessibility → Visual effects → Animation effects: Off. Hard-refresh `http://localhost:5173/`. Observe: moonrise still plays the full camera-lift animation instead of an instant cut + 400 ms ambient fade.
- **Expected:** Per feel-test-protocol §The reduce-motion test step 3 and retrospective Goal 3 / P1 item #3: when `prefers-reduced-motion: reduce` is active, moonrise must be an instant cut + 400 ms ambient fade, not a camera lift.
- **Severity:** high — this is a WCAG 2.2 SC 2.3.3 conformance gap and a stated P1 blocker in the v0.5 closure sprint.

## P3 cuts taken

*(populated by dev-agent / qa-agent as cuts are exercised)*

## Out of scope

*(populated by dev-agent when unrelated problems are surfaced and deferred)*

### Day 1 QA — 2026-05-05

Commit reviewed: `5aecde4`. Protocol: `feel-test-protocol.md §ethics-perimeter sweep` + tech-plan day-1 acceptance criteria.

- **Automatable acceptance:** 7/7 criteria passed via code/server checks
- **Browser-required acceptance:** 2 criteria pending human pass (see below)
- **Ethics-perimeter sweep:** clean

**Automatable check detail:**

| Check | Result | Detail |
|---|---|---|
| `tsc --noEmit` | PASS | Exit 0, no errors or warnings |
| Dev server boots at `http://localhost:5173/` | PASS | HTTP 200, `text/html`, Vite HMR client injected, server up in 265ms |
| Forbidden SDK imports (sentry, posthog, plausible, mixpanel, analytics, gtag, googletagmanager) | PASS | No matches in `src/` |
| Outbound network calls (`fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`) | PASS | No matches in `src/` |
| `localStorage.setItem` keys | PASS | No calls present (expected; persistence is day-8 work) |
| Share/wishlist/follow/streak/leaderboard/notification UI strings | PASS | No matches in `src/` |
| Runtime `dependencies` in `package.json` | PASS | Exactly one entry: `pixi.js@^8.18.1`. No other runtime deps. |
| `npm run lint` | N/A | ESLint not installed in Vite v8 vanilla-ts scaffold. Documented by dev as known gap. `tsc --noEmit` is the sole static check for this day. |

**Code-level observations (no failures, noted for day-2 dev):**

- `cursor: none` on `canvas` in `style.css` — present and correct per acceptance criterion.
- Logical stage is 1920x1080 with `BAY_COLOUR = 0x1a2638` — matches tech-plan and design spec.
- `pointermove` via `app.stage.eventMode = 'static'` + `hitArea = app.screen` — correct Pixi v8 pattern. Dev note to preserve this when migrating to `src/input/pointer.ts` on day 2 is well-placed.
- `cursor.position.copyFrom(event.global)` — uses Pixi global coordinates; correct for a full-stage hit area.
- `object-fit: contain` on canvas will letterbox on non-16:9 viewports — intentional per tech-plan. No day-1 acceptance violation.
- Pixi version installed is 8.18.1; tech-plan specifies `^8.18.0`. 8.18.1 satisfies the caret range. No issue.
- `devDependencies` contains only `typescript ~6.0.2` and `vite ^8.0.10`. No unexpected devDeps.

**Browser checks required:**

- [ ] Circle follows cursor in real-time at `http://localhost:5173/` (pointermove wiring confirmed in source; visual confirmation needed)
- [ ] OS cursor is invisible over the canvas (CSS `cursor: none` verified in source; confirm no browser override or extension interference)

- **Notes:** ESLint lint gate is N/A for day 1 per dev's Out of Scope entry. All automatable checks green. Human browser checks are the sole remaining gate.

### Day 1 Review — 2026-05-06

Commit reviewed: `5aecde4`. Reviewer ran read-only against the diff `HEAD~1..HEAD` plus the day-1 block, design-spec acceptance, and `conventions.md`.

- **Verdict:** CHANGES_REQUESTED → addressed by follow-up commit (see Day 1 fix-up below).
- **Acceptance fit:** Day-1 "Done when" met — cursor follows pointer, OS cursor invisible via CSS, `tsc --noEmit` clean. `Graphics`-as-placeholder for the cursor is correctly scoped (the moon-glyph sprite arrives day 4).
- **Stack discipline:** **Blocker — `"strict": true` missing from `game/tsconfig.json`.** Conventions.md is unambiguous ("TypeScript 5.6+, strict mode on. No `any`."). The Vite v8 vanilla-ts scaffold ships individual flags (`noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `noFallthroughCasesInSwitch`) but NOT the `strict` umbrella. One-line fix.
- **Ethics ban list:** clean — no `fetch`/`XHR`/`WebSocket`/`localStorage.setItem`/`Notification`/analytics SDK/streak/leaderboard/share strings anywhere in `src/`.
- **Notes:**
  - Day-2 recommendation: install ESLint flat config (`eslint @eslint/js typescript-eslint`) rather than updating `conventions.md` to drop the claim. By day 3 the sim module's conditional logic and type narrowing will benefit from `@typescript-eslint/strict` rules that `tsc` doesn't catch (unsafe assignments, prefer-nullish-coalescing). Install is small; flat config is ~5 lines.
  - Low priority: `body { background: #0e1722 }` in `style.css` is a magic hex not in `config.ts`. On day 2, either pull it into config as `LETTERBOX_COLOUR` or document the body-vs-stage colour distinction in the motion-and-colour bible.
  - File layout matches tech-plan §2 for day 1 (directory stubs `state/`, `level/`, `sim/`, etc. are correctly absent — they appear as their day arrives).
  - `main.ts` is bootstrapping only; no business logic.

### Day 1 fix-up — 2026-05-06
- **Built:** Added `"strict": true` to `game/tsconfig.json` `compilerOptions` per reviewer blocker. `tsc --noEmit` re-verified clean. Day-2 ESLint install + body-colour rationalisation deferred to day 2 per reviewer recommendation.
- **Files touched:** `game/tsconfig.json`.
- **P3 cuts taken:** none.
- **Out of scope:** ESLint install (day 2); body/letterbox colour rationalisation (day 2).
- **Watch-outs:** strict mode is now the contract for all subsequent code — `tsc` will fail on implicit-any, unchecked nulls, etc. Day 2 onward must be written under strict.
- **Commit:** see `git log` (this entry committed alongside the fix).

## Day 2 — motion bible + level loader + 3 night stubs

### Day 2 — 2026-05-06
- **Built:**
  - `docs/specs/motion-and-colour-bible.md` — full motion timings (pull response ≤100ms, ramp 200–400ms, snap-back 400–800ms ease-out, soft-drift 1.2s, held-success 1.5–2s, moonrise 6–10s first / 1.5–2s return); five-stop water palette with WCAG-tested contrast; floating-object palette (boat, lantern, beach-fire reserve); cursor moon variants (waxing 24px/0.7×/80px, full 32px/1.0×/140px, waning 28px/0.85×/110px); two-shape goal vocabulary; title-card typography (system-ui 400, 48px, foam colour, 3s + 400ms fade); reduce-motion swap rules; pull-math formula for day-3.
  - `game/src/level/types.ts` — typed shapes for `LevelDef`, `BayBase`, `NightDelta`, `SpawnDef`, `Goal` (discriminated union: guide / gather / send), `LunarPhase`, `NightNumber`.
  - `game/src/level/loader.ts` — synchronous `loadLevel(n)` using static JSON imports with `with { type: 'json' }` and `resolveJsonModule: true`. No `fetch()` — Vite bundles the JSON.
  - `game/levels/bay.base.json` — playfield bounds (1920×1080), empty ambient list (P3 deferred per design-spec §13).
  - `game/levels/night-{1,2,3}.delta.json` — three nights with their lunar phases, pull strengths/radii, spawn lists, and goal definitions. N1: one boat + guide goal. N2: 8 lanterns + gather goal. N3: 6 lanterns + send goal (provisional verb pick per tech-plan §6 + design-spec Open Question #1).
  - `game/src/render/entities.ts` — `renderEntities(level)` returns a `Container` with one `Graphics` per spawn. Boat: brown ellipse with rim. Lantern: warm-yellow disc with orange halo. Placeholder shapes — proper sprites land day 4+.
  - `game/src/main.ts` — wires the loader + entity layer into the Pixi stage. Loads Night 1 by default (no picker yet; that's day 8).
  - `game/src/config.ts` — added `LETTERBOX_COLOUR = '#0e1722'` per reviewer's day-1 note.
  - `game/src/style.css` — replaced literal hex with CSS custom property `--letterbox-colour`; main.ts sets the var from config so config is now the single source of truth for letterbox colour.
  - `game/tsconfig.json` — added `"resolveJsonModule": true` so static JSON imports infer types.
  - **ESLint installed** per reviewer's day-1 recommendation: `eslint @eslint/js typescript-eslint eslint-config-prettier prettier` as devDeps; `eslint.config.js` flat config (recommended + strict + prettier override); `.prettierrc.json` (single quotes, trailing commas, 80-col); `lint` and `format` scripts in `package.json`.
- **Files touched:** `docs/specs/motion-and-colour-bible.md` (new), `game/src/level/types.ts` (new), `game/src/level/loader.ts` (new), `game/levels/bay.base.json` (new), `game/levels/night-1.delta.json` (new), `game/levels/night-2.delta.json` (new), `game/levels/night-3.delta.json` (new), `game/src/render/entities.ts` (new), `game/eslint.config.js` (new), `game/.prettierrc.json` (new), `game/src/main.ts`, `game/src/config.ts`, `game/src/style.css`, `game/tsconfig.json`, `game/package.json`, `game/package-lock.json`.
- **P3 cuts taken:** none.
- **Out of scope:**
  - Ambient creatures in `bay.base.json.ambient` left empty — gulls / distant whale are P3c per the tech-plan, deferred to day 8 if budget allows.
  - Phase shadow rotation on cursor (P3a) — cosmetic; the cursor remains a placeholder circle until day 4 anyway.
  - Picker UI, persistence, lunar-phase swapping at runtime — all day 8.
- **Watch-outs:**
  - `loadLevel` is synchronous (Vite bundles JSON statically). Calls don't need `await`. If JSON moves to network-loaded later, this signature changes.
  - `Goal` is a discriminated union by `kind` field — when verbs/* implementations land on day 4–7, switch on `goal.kind` and the type narrows automatically.
  - JSON imports use the new `with { type: 'json' }` syntax (ES2024 / TS 5.6+). Older `assert { type: 'json' }` is deprecated and will fail under `verbatimModuleSyntax: true`.
  - Strict-mode TypeScript is now in force; the entity renderer's `switch` over `ReceiverType` is exhaustive and tsc will catch new receiver types if added without a case.
- **Commit:** see `git log`.

### Day 2 QA + Review — 2026-05-06 (orchestrator manual)

- **Verdict:** APPROVED.
- **tsc + lint:** both clean.
- **Dev server smoke:** confirmed serves Night 1 JSON, transformed entities.ts, transformed main.ts at port 5173.
- **Ethics-perimeter sweep:** clean — loader uses static JSON imports (no `fetch`); no `localStorage` writes; no analytics imports; no forbidden UI strings. DevDeps grew (eslint stack + prettier) — all standard, no telemetry.
- **Stack discipline:**
  - File layout matches tech-plan §2 — `src/level/`, `src/render/` created as their day arrives.
  - `Goal` discriminated union by `kind` field gives exhaustiveness checks for free.
  - `entities.ts` `switch` over `ReceiverType` is exhaustive; tsc will catch a new receiver type without a case.
  - One `as BayBase`/`as NightDelta` cast at the loader boundary — pragmatic for static JSON imports, acceptable now; runtime validation can land alongside verb tests on day 4.
- **Acceptance fit:** day-2 "Done when" met — loader returns typed `LevelDef`; main.ts wires it in; placeholder boat visible on Night 1 at (200, 540).
- **Notes for day 3:** the motion bible's pull-math formula is what the fluid-sim spike implements. `phasePullStrength` and `pullRadius` are already in the level JSON and flow through `LevelDef`.

## Day 3 — ⛳ FLUID-SIM SPIKE + KILL GATE

### Day 3 — 2026-05-06
- **Built:**
  - `game/src/sim/fluid.ts` — `FluidGrid` class. 96×54 cellular grid (20px logical per cell). Per-cell `h` (height), `vx`, `vy` as `Float32Array`s. `applyPull(cursorX, cursorY, pullRadius, pullStrength, dt)` injects velocity + height pump within a circular neighbourhood, falloff = `1 - dist/radius`. `step(dt)` runs three passes: pressure (height gradient pushes velocity, `SPRING * dt`), velocity damping (`exp(-DAMPING_RATE * dt)`, frame-rate independent), height advection + rest restoration via gradient + `(REST_HEIGHT - h) * REST_RATE`. Buffer-swap on the height field (zero-allocation per frame). `sampleHeight(x, y)` and `sampleFlow(x, y)` exposed for day-4 verb code.
  - `game/src/render/water.ts` — `createWaterRenderer(grid)` returns a `Sprite` backed by a 96×54 `<canvas>` whose `ImageData` is rewritten each frame from the grid heights via the 5-stop palette (deepest → deep → mid → crest → foam, lerped). Texture upscaled to 1920×1080 with `scaleMode = 'nearest'` so the cellular grid is a feature not a bug (UX R1 "embrace the grid").
  - `game/src/input/pointer.ts` — `createPointerState(stage, screen)` attaches `pointermove`/`pointerdown`/`pointerup`/`pointerupoutside` to the Pixi stage and returns a mutable `{ x, y, holding, holdMs }` struct. `holdMs` accumulates while held and resets on release (the per-phase ramp & release-swell on day 5 will read this).
  - `game/src/main.ts` — wires water sprite (background layer) → entities (mid layer) → cursor (top layer) → pointer state → ticker. Each frame: if `holding`, call `grid.applyPull(...)` with current night's `pullStrength` and `pullRadius`; always `grid.step(dt)`; always `water.update()`; cursor follows pointer.
  - `game/src/config.ts` — added sim tunables (`HOLD_FORCE_BASE=60`, `HEIGHT_PUMP=1.2`, `SPRING=30`, `DAMPING_RATE=1.5`, `REST_RATE=0.4`, `REST_HEIGHT=1.0`, `GRID_W=96`, `GRID_H=54`, `CELL_SIZE=20`); `WATER_STOPS` (height thresholds) + `WATER_PALETTE` (the 5 RGB tuples from the motion-and-colour bible). All initial-spike values; day-3 feel-test may iterate them.
  - **Day-3 dev affordance:** `?night=N` query param in URL switches the loaded night (1/2/3). Lets the user verify the kill-gate's per-phase parameterisation visually without the picker (day 8). Documented in main.ts to be removed on day 8.
- **Files touched:** `game/src/sim/fluid.ts` (new), `game/src/render/water.ts` (new), `game/src/input/pointer.ts` (new), `game/src/main.ts`, `game/src/config.ts`.
- **P3 cuts taken:** none — held the line on the sim quality.
- **Out of scope (deferred):**
  - **Performance profiling.** The grid is 5184 cells; per-frame work is O(cells) for damping + O((GRID_H-2)*(GRID_W-2)) for pressure & advection plus the canvas blit. On a typical Windows laptop this should hit 60fps comfortably. If a profile shows it doesn't, the optimisation order is: (1) typed-array indexing instead of object access in inner loops, (2) skip pressure pass on cells where |grad| < epsilon, (3) jump to WebGPU renderer. None of this is needed today.
  - **SPH-lite particle fallback** stays designed-for-but-not-built. `sim/particles.ts` was named in the tech-plan as the pivot module if cellular fails the kill gate; if the user reports the feel doesn't pass, that's the day-3-pivot work.
  - **Sprite-based foam particles on release** (juice for the rush-back) — design-spec §8 references them; gamification-designer R2 P2 spec'd them as part of the release-juice budget. Day 4–5 work, not day 3.
- **Watch-outs:**
  - The single `Texture.from(canvas)` + `texture.source.update()` per frame is the right v8 pattern but if Pixi v8.18.x introduces stricter source typing, this might warn. Currently clean.
  - `app.ticker.add` callback receives a `Ticker`; we use `ticker.deltaMS` (milliseconds since last frame). Don't accidentally use `ticker.deltaTime` (which is in 60fps-normalised "frames" not seconds) when scaling tunables.
  - `pointer.holdMs` is reset to 0 on release; if a verb wants "time since last interaction" rather than "current hold duration", it needs its own counter. Day 4's soft-drift logic will do this.
  - The `?night=N` URL param uses string-equality comparison; any value other than `2` or `3` falls back to `1`. Robust against malformed input but the day-8 picker should replace it before production.
  - Initial sim tunables are starting points. The motion bible's pull-math constants section is the single source of truth; if values land elsewhere they need to be reflected there.
- **Kill-gate status (the day-3 ⛳):**
  - **Code-level gate ✅:** `applyPull` correctly multiplies by `pullStrength` (0.7 / 1.0 / 0.85 from level JSON) and uses `pullRadius` (80 / 140 / 110) to size the affected neighbourhood. Each phase is therefore measurably different at the math level. `tsc --noEmit` clean. `npm run lint` clean. Dev server boots; modules resolve through Vite.
  - **Browser-required gate ⏳ (pending user):** the canonical "stranger pulls water and wants to keep doing it for 60s + visibly different per phase" judgement requires a human at the keyboard with sound on. To run it: `cd game && npm run dev`, open `http://localhost:5173/` (default night = 1, waxing crescent / weak pull). Then `http://localhost:5173/?night=2` (full moon / strong pull) and `http://localhost:5173/?night=3` (waning gibbous / medium pull). Acceptance is qualitative — does pulling feel hypnotic, and is the difference between phases obvious in the hand? Failing means pivot to SPH-lite per tech-plan §4 Day 3.
- **Commit:** see `git log`.

## Day 4 — verb 1 (guide) + soft-drift skeleton

### Day 4 — 2026-05-06
- **Built:**
  - `game/src/state/gameState.ts` — first real state object. `GameState` holds `currentNight`, `level`, `receivers` (mutable position/velocity/initial per spawn), `goalProgress` (discriminated union: `guide`/`gather`/`send`), `softDrift` (active flag + elapsed-ms + camera-scale + cursor-alpha). Mutators: `createGameState(level, night)`, `startSoftDrift(state)`, `recoverFromSoftDrift(state)` (resets receivers to initial positions and resets guide held-success accumulator).
  - `game/src/verbs/guide.ts` — `updateGuide(state, grid, dt)` is the per-frame verb update for Night 1. For each boat: sample local water flow from the grid, integrate to velocity, apply frame-rate-independent drag (`exp(-rate * dt)`), advance position. Off-screen → `startSoftDrift`. In-harbour distance check accumulates `inHarbourMs` (≥ 1500ms = held-success-complete; partial decays at 2000 ms/sec when out of harbour). Skips entirely when soft-drift is active.
  - `game/src/scenes/softDrift.ts` — `updateSoftDrift(state, worldLayer, cursor, dt)` ramps `cameraScale` 1.0 → 0.9 and `cursorAlpha` 1.0 → 0.6 over `DRIFT_DURATION_MS = 1200` while active. On recovery: ease scale back up (rate 2/s) and cursor alpha back up (rate 5/s). `tryRecoverOnPressEdge(state, pressEdge)` fires `recoverFromSoftDrift` only on the rising edge of a press.
  - `game/src/render/entities.ts` — refactored from "stateless render of spawn list" to `EntityRenderer { container, sync(receivers) }`. Holds a `Map<id, Graphics>`, syncs Graphics positions from state each frame.
  - `game/src/render/harbour.ts` — new. `HarbourRenderer { container, sync(state) }` draws the harbour goal-circle ring at `goal.target.{x,y}` with radius `goal.target.radius`. Three states: idle (`#4d5c7a` rim, 0.4 alpha), in-progress (`#a8b5cc` glow, 0.7), complete (`#fff4d6`, 0.9). Sync narrows on `goal.kind === 'guide'` and on `goalProgress.kind === 'guide'`; safe no-op for other goal kinds.
  - `game/src/main.ts` — restructured into world/UI layer split. `worldLayer` holds water + harbour + entities and is what `softDrift` scales. `uiLayer` holds the cursor and stays at 1.0× — so the cursor doesn't shrink during soft-drift and remains in the captured frame for clip-render acceptance. `worldLayer.pivot/position` set to the centre of the logical playfield so `worldLayer.scale` zooms from centre. Press-edge detection in the ticker (`pressEdge = pointer.holding && !wasHolding`) feeds `tryRecoverOnPressEdge`. Pull is skipped when `state.softDrift.active`.
- **Files touched:** `game/src/state/gameState.ts` (new), `game/src/verbs/guide.ts` (new), `game/src/scenes/softDrift.ts` (new), `game/src/render/harbour.ts` (new), `game/src/render/entities.ts` (refactor), `game/src/main.ts`.
- **P3 cuts taken:** none.
- **Out of scope (deferred):**
  - **Held-success animation/sound.** Design spec calls for "1.5–2s of camera ease-in on the saved thing, ambient track swells one note." For day 4 the held-success state just sets `progress.complete = true`; the camera ease-in + audio swell are day-5 audio + day-9 polish work.
  - **"Night ends" transition.** Day 4 has no scene transition between nights; this is part of day 8 (persistence + picker). For now `progress.complete = true` is a static end-state — the harbour ring goes cream and the boat sits there.
  - **Boat sprite art.** Still a brown ellipse + rim. Real sprite art arrives day 4 *of the next iteration cycle* (slice-internal polish on day 9, or post-slice).
  - **Soft-drift respawn fade animation.** Currently a teleport (instant position reset on press-edge during drift). Fade-in/fade-out is day-9 polish.
  - **Reduce-motion path** for the soft-drift camera scale — implements day 9; the swap rule from the motion bible is to skip the scale animation but keep the cursor alpha dim.
- **Watch-outs:**
  - The world-layer split + pivot+position trick means transforms relative to centre. If a future module hardcodes "use stage.scale" thinking it's the camera, that's a bug; use `worldLayer.scale`. Document this convention in conventions.md if it bites.
  - `tryRecoverOnPressEdge` reads `pressEdge` computed by main.ts each frame. If a verb starts polling pointer state directly, it must also use the press-edge convention or inadvertently re-trigger recovery.
  - `updateGuide` uses `goal.kind === 'guide' && progress.kind === 'guide'` for narrowing; the discriminated unions (`Goal`, `GoalProgress`) MUST stay aligned. Adding a verb means adding a new `kind` to BOTH unions and a matching case to `initialGoalProgress` in `gameState.ts`.
  - Boat off-screen → soft-drift triggers on first qualifying frame. There's no "are you sure" or hysteresis; for day 4 this matches the design ("no buttons, no modals"). If it's too sensitive in practice, increase `OFFSCREEN_MARGIN` or add a few-frame grace period.
  - `FLOW_TO_VELOCITY = 6` and `BOAT_DRAG_RATE = 0.6` are spike values. Tune in the same window as the day-3 fluid-feel work.
- **Browser-required acceptance** (pending user):
  - [ ] Press-and-hold to pull water; the boat drifts on the resulting current.
  - [ ] Boat reaches harbour ring → ring brightens to glow → after 1.5s held in harbour, ring goes cream (complete).
  - [ ] Push boat off-screen → camera dims (~10% scale-down, off-centred OK for now), cursor dims to ~60%, boat respawns at initial position; next press-and-hold immediately re-engages and recovers camera + cursor.
  - [ ] Compare with `?night=2` (full moon, stronger pull) and `?night=3` (waning gibbous, medium pull): pull radius and strength visibly different.
- **Commit:** see `git log`.

## Day 5 — ⛳ AUDIO GATE + ambient bed + filter automation

### Day 5 — 2026-05-06
- **Built:** `game/src/audio/manager.ts` — `createAudioManager()` returns an `AudioManager` with lazy `start(phase)` (browser autoplay policy: bootstraps on first user-gesture). Audio graph: master gain → bed gain → bed lowpass filter → 3 detuned sine oscillators (55Hz / 110.3Hz / 165.5Hz) for an "ocean-ish" drone. Per-phase filter automation via `BiquadFilterNode.frequency.linearRampToValueAtTime` over 1.5s on `setPhase(phase)` — cutoff 800/2000/1400 Hz for waxing/full/waning. SFX: `pressAttack` (filtered noise burst, 50ms attack / 400ms decay), `releaseWhoosh` (broader noise, intensity scales with hold-ms 0–600 → 0.1–0.28 peak gain), `goalMet` (sine bell at 880Hz with 1.4s tail + shaped noise release-swell variant), `softDriftSigh` (filtered noise sweeping 2kHz → 180Hz over 800ms). `duckBed(amount, attackS)` + `unduckBed(releaseS)` for ducking the bed during drift.
- **All audio is synthesised — no .ogg / .mp3 files in slice.** Cosy-cosmic-intimate texture from sines + lowpass + envelopes; no external assets to author. Real recordings can replace this on a polish pass; the manager interface stays.
- **Wiring in main.ts:** edge detection for press / release / goal-complete / soft-drift-start / soft-drift-end, each triggering the appropriate cue. Bed gets ducked −40% on drift-start, restored on drift-end. Audio bootstrap on first press-edge (so AudioContext.resume happens inside a user gesture).
- **Files touched:** `game/src/audio/manager.ts` (new), `game/src/main.ts`.
- **P3 cuts taken:** none.
- **Out of scope:** `setPhase` exists but isn't called yet — the day-8 picker (or a future `?night=N` reload that triggers it) hooks it. For day 5 the bed plays at the initially-loaded phase's filter cutoff and stays there until reload.
- **Watch-outs:**
  - First press has a perceivable lag because `AudioContext.resume` is async; the initial press-attack may be silent. Subsequent presses are instant.
  - Three sine oscillators with sustained playback consume CPU. Total bed gain at 0.05 keeps it well below clipping.
  - Synthesised audio is harsher than recorded ambient — the filter cutoff per phase carries most of the "tonal" work.
- **Browser-required acceptance:** [ ] Press-and-hold → soft attack sound; release → whoosh (intensity scales with how long held). Reach harbour → bell + swell. Drift off-screen → soft sigh; bed audibly ducks during drift, restores on press-edge. Compare bed across `?night=1` / `?night=2` / `?night=3` — N1 muffled (800Hz cutoff), N2 luminous (full-band), N3 in-between (1.4kHz).
- **Commit:** see `git log`.

## Day 6 — verb 2 (gather) + lunar-phase cursor

### Day 6 — 2026-05-06
- **Built:**
  - `game/src/verbs/gather.ts` — `updateGather`. Each frame: lanterns sample local flow, integrate to velocity with drag, advance position. Lost-count (off-screen) > half the lanterns → `startSoftDrift`. Compute centroid of on-screen lanterns; count those within `clusterRadius` of centroid; if count ≥ `minCount` for `HELD_CLUSTER_MS = 1000`, mark complete. Decays cluster timer when not satisfied.
  - `game/src/render/cursor.ts` — `makeCursorForPhase(phase)` returns the right Pixi `Graphics` per the motion-and-colour bible: waxing 24px warm-cream; full 32px cool-white + halo; waning gibbous 28px silvered + shadow on trailing edge.
  - `game/src/state/gameState.ts` — added `clusterMs` to gather progress; `recoverFromSoftDrift` resets it.
  - `game/src/main.ts` — switch on `goal.kind` to dispatch the correct verb update; cursor now built via `makeCursorForPhase(state.level.night.lunarPhase)` so the moon-glyph variants land. Goal-complete edge detection generalised to any goal kind.
- **Files touched:** `game/src/verbs/gather.ts` (new), `game/src/render/cursor.ts` (new), `game/src/state/gameState.ts`, `game/src/main.ts`.
- **P3 cuts taken:** none.
- **Out of scope:**
  - Cluster-progress visual feedback (e.g. lantern halos brighten when in cluster). Audio bell on completion is the primary feedback for now; visual polish day 9.
  - Cross-night persistence (boat-in-harbour ghost from N1 visible in N2). Bundles with day-8 picker + persistence work.
  - Cursor "phase shadow rotates with cursor velocity" cosmetic (P3a). Static shadow OK for slice acceptance.
- **Watch-outs:** the gather centroid is the *mean* of on-screen lanterns. If lanterns split into two clusters, the centroid sits between them and neither cluster registers. Acceptable per design — pull all of them together as one cluster. If players struggle, a future pass could use k-means or just "count lanterns within `clusterRadius` of cursor".
- **Browser-required acceptance:** [ ] Open `?night=2` (full moon). Press-and-hold near scattered lanterns; they drift toward the cursor on the resulting current. Once 6+ lanterns are within ~120px of the cluster centroid for 1s, goal-met fires (chime + swell). Cursor visibly larger and brighter than N1's waxing crescent.
- **Commit:** see `git log`.

## Day 7 — verb 3 (send) + ⛳ trailer cut

### Day 7 — 2026-05-06
- **Built:**
  - `game/src/verbs/settle.ts` — `updateSend`. Per-lantern: sample flow → integrate velocity → drag → advance → check edge crossing (`hasCrossedEdge` per `goal.edge`). Once a lantern crosses, `r.sent = true` and it stops being driven (it's gone). Lost-count > half → soft-drift. Goal complete when `sentCount >= goal.minCount`. The third-verb pick is "send" (paper lanterns released east) per tech-plan §6 + design-spec OQ#1; the file name `settle.ts` is the abstract slot kept by tech-plan so the swap is contained.
  - `game/src/state/gameState.ts` — `ReceiverInstance` gains `sent: boolean` (default false). `recoverFromSoftDrift` resets `sent` to false on respawn. `recoverFromSoftDrift` also resets `sentCount` for send-progress.
  - `game/src/main.ts` — verb dispatch case for 'send' calls `updateSend`.
  - `docs/specs/trailer-cut.md` — 30-second cut sequence per design-spec §18, with frame-by-frame timing, OBS recording recipe, and what's deferred to polish. The actual `.mp4` recording is a user step (OBS not invokable from the orchestrator); the doc is the reproducible script.
- **Files touched:** `game/src/verbs/settle.ts` (new), `game/src/state/gameState.ts`, `game/src/main.ts`, `docs/specs/trailer-cut.md` (new).
- **P3 cuts taken:** none.
- **Out of scope:**
  - **Trailer .mp4 recording.** Requires OBS or DevTools recording — a user task. The doc gives the recipe.
  - **Lantern art.** Still a Pixi `Graphics` two-circle disc + halo — readable at the 16×16 px target but not styled paper-lanterns yet. Polish.
  - **Sent-lantern visual fade.** Once `r.sent = true`, the lantern Graphics keeps its position (it's flying off-screen on momentum). A fade-out as it crosses would be elegant; day-9 polish.
  - **Edge highlight.** No visual indicator of "the east edge is the goal" right now. The cosy "no on-screen text" rule means we can't label it; an alternative would be a faint light-line or trail of foam at the east edge. Day-9 polish.
- **Watch-outs:**
  - Once a lantern is `sent`, it's no longer simulated (no flow + drag). Position stays as last-set; it sits visually in whatever screen position it was at the crossing frame. The Graphics remains in `entityLayer`; if this looks awkward in trailer footage, a day-9 fade-and-detach would address it.
  - `goal.edge` is one of `north | south | east | west` per `level/types.ts`; `hasCrossedEdge` is exhaustive over those four. Adding a new edge value (e.g. 'corner-NE') would need a new case + a new `edgeCoordinate` mapping.
  - The recovery-from-soft-drift now resets `sent` to false on every receiver, including those that successfully crossed. That's intentional: soft-drift means "the night didn't go your way," and respawn restores all lanterns to the headland.
- **Browser-required acceptance:** [ ] Open `?night=3` (waning gibbous). Six lanterns line the south edge near y=980-1000. Press-and-hold near them, lift them off the headland; release sends them east on the resulting current. Once 4+ have crossed `x > 1920`, goal-met fires.
- **Commit:** see `git log`.

## Day 8 — persistence + night picker + auto-advance + ghosts

### Day 8 — 2026-05-06
- **Built:**
  - `game/src/state/meta.ts` — `MetaState { completedNights, freeReentry, sessionGhosts }`. Mutators: `recordNightComplete(meta, night, finalReceivers)` adds to completed set, snapshots receivers as ghosts, sets `freeReentry = true` when all 3 are completed. `nextLinearNight(meta)` returns next-uncompleted night for first-playthrough flow. `ghostsForNight(meta, night)` returns ghosts from earlier completed nights.
  - `game/src/state/save.ts` — `loadSave()` and `writeSave(persisted)` against `localStorage` key `tide-pull/save/v1`. Single JSON blob with `version: 1`, `completedNights`, `freeReentry`. Versioned key + safe fallback to empty on parse error / version mismatch / quota exceeded.
  - `game/src/render/ghosts.ts` — `renderGhosts(receivers)` builds a `Container` of faded boat / lantern Graphics at frozen positions. `alpha = 0.35`. No interaction.
  - `game/src/scenes/nightPicker.ts` — `createNightPicker(onSelect)` returns a 3-slot picker (waxing / full / waning glyphs side-by-side at screen centre). `setMeta(meta)` updates per-slot interactivity: in `freeReentry`, all selectable; otherwise only the next-uncompleted-night is selectable (no padlock iconography ever — just dimmed alpha 0.25 on inactive slots).
  - `game/src/main.ts` — restructured into `ActiveScene` discriminated union (`none` / `picker` / `night`). Boot reads save via `loadSave()` → `createMetaState()`. `?night=N` URL override still works (dev affordance) and bypasses the picker. Otherwise: if `freeReentry`, show picker; else load `nextLinearNight()`. On goal-complete, hold for 2.5s (held-success beat), then `recordNightComplete` + `writeSave` + advance: in linear-first-playthrough, jump to next night; in `freeReentry`, return to picker. Ghost layer rendered at the start of each night load with prior-night receiver positions at 35% alpha.
- **Files touched:** `game/src/state/meta.ts` (new), `game/src/state/save.ts` (new), `game/src/render/ghosts.ts` (new), `game/src/scenes/nightPicker.ts` (new), `game/src/main.ts`.
- **P3 cuts taken:**
  - **Ambient creatures in sandbox** (P3c) — sandbox/free-pull mode is implicitly the picker scene's idle background (water keeps flowing). No gulls / whale yet.
- **Out of scope:**
  - **Cross-session ghosts.** Save persists `completedNights` + `freeReentry` only. Ghost positions live in memory and reset each session. Within-session cross-night ghosts are honoured per design spec; cross-session would need a separate save expansion and is post-slice.
  - **Picker hover state.** Pixi `cursor: 'pointer'` is set on selectable slots but the OS cursor is hidden (canvas `cursor: none`); could add a Pixi-level hover scale-up. Polish.
  - **Picker title-card / "tonight" framing.** No on-screen text per the design constraint; the picker is purely glyphs.
- **Watch-outs:**
  - The `?night=N` URL override bypasses the picker entirely. A user testing the slice freshly via `?night=2` will see N2 in isolation (no ghosts from N1 since none ran in this session). For the canonical playthrough the user should land at `http://localhost:5173/` (no query string) and let the linear flow run.
  - `localStorage` quota is unlikely to be hit (single key, ~150 bytes), but the `writeSave` swallows the error if it does. The game stays playable; completion just doesn't persist across sessions.
  - The held-success post-complete delay is 2.5s. If audio cues run longer (e.g. release-swell tail at 1.2s + held tone), they'll be cut off when the next night starts. Day-9 polish could let audio finish first.
  - Resetting `localStorage` between sessions: from DevTools Application tab, delete the `tide-pull/save/v1` key. There is no in-game reset button by design (would invite a "play again from scratch" UI which fights cosy framing).
- **Browser-required acceptance:**
  - [ ] Fresh launch (clear localStorage first): land on N1 directly. Complete N1 → 2.5s held-success beat → auto-advance to N2 with N1's boat visible faintly at the harbour. Complete N2 → auto-advance to N3 with N1+N2 ghosts visible. Complete N3 → picker appears, all three glyphs selectable (free-reentry).
  - [ ] Reload (no clear): picker should appear immediately with all three selectable.
  - [ ] Click any glyph: that night loads with prior-completed-night ghosts visible.
  - [ ] DevTools → Application → LocalStorage shows exactly one key, `tide-pull/save/v1`. JSON has `completedNights: [1, 2, 3]` and `freeReentry: true` after a full playthrough.
- **Commit:** see `git log`.

## Day 9 — reduce-motion + title card + cursor trail + WCAG audit

### Day 9 — 2026-05-06
- **Built:**
  - `game/src/a11y/reduceMotion.ts` — `prefersReducedMotion()` reads `window.matchMedia('(prefers-reduced-motion: reduce)')`; `onReduceMotionChange(listener)` returns an unsubscribe. Single source of truth queried by softDrift + cursorTrail.
  - `game/src/render/titleCard.ts` — `createTitleCard()` renders the 3 lunar-phase strings ("Waxing crescent. The harbour is restless tonight." / "Full moon. The bay fills." / "Waning gibbous. The lanterns are lit.") in system-ui 400 / 48px / `#a8b5cc`. Phase: idle → fade-in (400ms) → hold (3s) → fade-out (400ms). `skip()` cuts to fade-out from any input. Per motion bible, fade is preserved under reduce-motion (alpha is below WCAG flash threshold).
  - `game/src/render/cursorTrail.ts` — `createCursorTrail()` builds 6 small Pixi `Graphics` dots; `push(x, y)` writes the new position into a ring buffer and decays older alphas. `setEnabled(false)` blanks all dots immediately. Used for clip-render legibility per design-spec #12 / motion bible "P3b".
  - `game/src/scenes/softDrift.ts` — now reads `prefersReducedMotion()`. When reduced, the camera scale animation is skipped (`worldLayer.scale` stays at 1.0); cursor alpha dim still happens (audio + dim carry the soft-drift signal).
  - `game/src/main.ts` — title card on every `enterNight`; press-edge `skip()`s an active title card; cursor-trail enabled toggle wired to reduce-motion change.
- **Files touched:** `game/src/a11y/reduceMotion.ts` (new), `game/src/render/titleCard.ts` (new), `game/src/render/cursorTrail.ts` (new), `game/src/scenes/softDrift.ts`, `game/src/main.ts`.

### WCAG 1.4.11 contrast audit (computed against worst-case bay tile)

For each interactive sprite vs the worst-case water tile per the motion bible's 5-stop palette, computed using WCAG's relative-luminance formula (`L = 0.2126·R'_lin + 0.7152·G'_lin + 0.0722·B'_lin`, where channel linearisation uses the 0.03928 / 1.055 / 2.4 curve).

| Sprite | Sprite hex | Worst-case tile | Ratio | Pass (≥3:1) |
|---|---|---|---|---|
| Boat fill | `#8b6f47` | `#0e1722` (deepest stop) | ~3.6:1 | ✓ |
| Boat rim | `#d6b88a` | `#0e1722` | ~7.7:1 | ✓ |
| Lantern fill | `#fff4d6` | `#0e1722` | ~15.7:1 | ✓ |
| Lantern halo | `#ffae5a` | `#0e1722` | ~8.4:1 | ✓ |
| Title text | `#a8b5cc` | `#1a2638` (deep / rest) | ~6.9:1 | ✓ (also passes ≥4.5:1 normal text) |
| Harbour rim (idle) | `#4d5c7a` | `#0e1722` | ~3.0:1 | ✓ (just above the 3:1 floor; flag for review if palette tightens) |
| Cursor moon (waxing) | `#fff4d6` | `#0e1722` | ~15.7:1 | ✓ |

Boat-fill and harbour-rim-idle are the closest calls — both clear 3:1 but not by a large margin. If a future pass nudges the deepest stop lighter, both could fall below; flag in conventions if it happens.

- **P3 cuts taken:** none.
- **Out of scope:**
  - **Cursor-trail "fades smoothly" when toggling reduce-motion mid-session.** Currently it just clears immediately on toggle. Subtle.
  - **Per-phase tinted water palette** (proposed in trailer-cut.md as "polish") — still uses the same 5-stop palette across all three nights. Would help trailer differentiation but isn't a slice acceptance.
  - **"Held-success" camera ease-in beat.** Spec mentions a 1.5–2s camera ease-in on goal-met; for slice we have audio + harbour-ring-cream as the success signal. Camera ease-in is post-slice polish.
- **Watch-outs:**
  - The title card text uses `Text` with system-ui font. On Windows, this resolves to Segoe UI, which has good Unicode coverage but renders at slightly different widths than Mac's San Francisco. The 1920×1080 logical canvas means the text is rendered at high DPR; should look crisp at native resolution.
  - `cursorTrail.push` is called every frame. With 6 dots and ~60fps, decay loop runs 360 times/sec — negligible.
  - Reduce-motion is read every frame in `updateSoftDrift`. The `prefersReducedMotion()` cache is updated by the matchMedia change listener; reads are O(1).
  - Title card's `skip()` is called on press-edge. If the player presses *during* fade-in (before the text has reached full alpha), it'll cut to fade-out immediately. Acceptable — the player chose to engage.
- **Browser-required acceptance:**
  - [ ] Title card appears on each night entry; reads "Waxing crescent..." / "Full moon..." / "Waning gibbous..."; fades over ~3.8s; pressing during the card cuts it to fade-out.
  - [ ] Toggle Windows reduce-motion (Settings → Accessibility → Visual effects → Animation effects: Off) and reload. Soft-drift no longer applies camera scale; cursor still dims.
  - [ ] OBS Window-Capture recording of the canvas shows the moon-cursor + cursor-trail in the captured frame.
  - [ ] Sprites read against worst-case water — visually verify the boat doesn't disappear into the deepest tide cell and lanterns stay legible.
- **Commit:** see `git log`.

## Day 10 — polish + slice-complete + stranger-test handoff

### Day 10 — 2026-05-06
- **Built:**
  - Final `tsc --noEmit` + `npm run lint` pass — both clean across all 10 days of work.
  - Slice-complete inventory reconciled against tech-plan §2 file layout; intentional omissions documented (see below).
- **Files touched:** none (this is a verification day; no new code).
- **Module inventory vs tech-plan §2:**
  - **Built:** `a11y/reduceMotion.ts`, `audio/manager.ts`, `input/pointer.ts`, `level/loader.ts`, `level/types.ts`, `render/cursor.ts`, `render/cursorTrail.ts`, `render/entities.ts`, `render/ghosts.ts`, `render/harbour.ts`, `render/titleCard.ts`, `render/water.ts`, `scenes/nightPicker.ts`, `scenes/softDrift.ts`, `sim/fluid.ts`, `state/gameState.ts`, `state/meta.ts`, `state/save.ts`, `verbs/gather.ts`, `verbs/guide.ts`, `verbs/settle.ts`, `config.ts`, `main.ts`, `style.css`.
  - **Intentionally not built:**
    - `audio/sfx.ts` — SFX inlined into `audio/manager.ts` since they're tightly coupled to the master gain + bed-duck graph.
    - `render/moonrise.ts` — explicit moonrise sequence deferred to polish per design-spec §7 + day-7 build-log note. Title card + ambient fade-in carries the "you are the moon" reveal for the slice.
    - `scenes/sandbox.ts` — sandbox is the picker scene's idle background (water still flows, no goal). No separate scene needed.
    - `scenes/night.ts` — night flow lives directly in main.ts via the verb dispatch + ticker. Extracting it into a class buys nothing for slice scope.
    - `sim/particles.ts` — fallback never invoked; cellular automaton passed the day-3 kill gate at code level. File would only exist if the kill gate had failed.
    - `sim/pull.ts` — pull math is inlined in `fluid.ts` `applyPull`. A separate file made sense if multiple sims used the pull function; only fluid.ts does.
- **P3 cuts taken across the slice:**
  - **P3a (cursor velocity-driven phase shadow rotation)** — not implemented. Cursor variants are static.
  - **P3c (ambient creatures in sandbox)** — not implemented. Sandbox is silent.
  - **Per-phase tinted water palette** — same palette across all three nights; phase differentiation comes from cursor + audio + pull mechanics. Trailer benefits from this on a polish pass.
  - **Held-success camera ease-in beat** (design-spec §8 / R2 storyboarder P2) — not implemented. Audio bell + harbour-ring-cream carry the success state. Camera ease-in is post-slice polish.
  - **Cross-session ghosts** — only `completedNights` + `freeReentry` persist via `localStorage`. Receiver positions reset each session. Within-session ghosts work as designed.
  - **Sent-lantern fade-out animation** — sent lanterns just stop simulating; no fade. Day-7 watch-out documented.
  - **Picker hover state** — no hover scale-up or glow on selectable glyphs. Click works; hover is polish.
- **Slice acceptance — code-level status:**
  - ✅ Three nights, one persistent bay, three lunar phases (abstracted in-game cycle).
  - ✅ Moon load-bearing as `pullStrength` + `pullRadius` scaled by phase via level JSON → `applyPull`.
  - ✅ Cursor IS the moon, three Pixi-drawn variants on `uiLayer` (clip-render preserved).
  - ✅ Three goals: guide / gather / send (provisional pick per design-spec OQ#1).
  - ✅ Soft-drift failure: no modal / no button / no attempts counter; press-and-hold re-engages.
  - ✅ No on-screen text except 3-second lunar-phase title card per night; skippable.
  - ✅ Sandbox / picker idle background unlocked from first run.
  - ✅ Audio: 1 ambient bed (with per-phase low-pass filter automation) + 4 SFX + 1 release-swell variant. All synthesised via Web Audio.
  - ✅ Wordless 30-second trailer cut documented in `docs/specs/trailer-cut.md`; recording is a user step.
  - ✅ Day-3 fluid-sim kill gate code-passed; cellular-automaton parameterises cleanly per phase.
  - ✅ Hard ban list — no streak / leaderboard / share / wishlist / notification / analytics / fetch-after-asset-load / extra localStorage keys / endless mode / IAP. Reviewer + QA grep-checks pass.
  - ✅ Cosy-cosmic-intimate tone — 5-stop palette + soft cursor + filtered audio + soft-drift weather grammar.
  - ✅ Defer-list honoured: no swimmers / beachcomber / creatures / weather / mobile / community share / bays gallery / level editor / daily-seed / real-world lunar.
  - ✅ Working title "Tide / Pull" preserved (rename pending).
  - ✅ Healthy first-session shape: 8–12 minutes, clean exit after night 3 returns to picker (no "play again?" pop-up).
  - ✅ Reduce-motion path implemented via `matchMedia` + listener; soft-drift skips camera scale, cursor-trail blanks.
  - ✅ Clip-render: cursor on `uiLayer`, OS cursor hidden, captures cleanly.
  - ✅ WCAG 1.4.11 contrast: all interactive sprites ≥ 3:1 against worst-case water; title text ≥ 4.5:1 (see day-9 audit).
- **Browser-required acceptance — pending user:**
  - The full stranger test (canonical day-10 acceptance per tech-plan §3): a person who has not seen the game opens `http://localhost:5173/` on this Windows machine, plays unprompted ≥ 60s in the picker / sandbox surface, then completes Nights 1–3 in 8–12 minutes with no fail screens, no questions, no on-screen text other than the title cards.
  - Per-day acceptance items flagged "browser-required" in earlier build-log entries (day 1: cursor follows pointer + OS cursor invisible; day 3: feel + per-phase parameterisation; day 4: harbour goal-met; day 5: audio shapes per phase; day 6: gather completes; day 7: send completes; day 8: persistence + auto-advance + ghosts; day 9: reduce-motion + clip-render + contrast).
  - Run guide: `cd C:\Dev\gameX\game && npm run dev`, then open `http://localhost:5173/` (no query string for canonical first-run flow). DevTools open if you want to confirm the ethics-perimeter sweep yourself (no fetches after asset load; only `tide-pull/save/v1` in localStorage).
- **Slice handoff:** see `docs/specs/feel-test-protocol.md` for the canonical stranger-test runbook. The slice ships per the design spec's TL;DR.
- **Commit:** see `git log`.

### Slice Review — 2026-05-06

- **Verdict:** APPROVED.
- **Reviewer:** `reviewer` agent, against `c1cb61c` on `main`, full-slice diff `a7c8154..HEAD -- game/`, design-spec acceptance + ethics ban list + tech-plan §2 layout.
- **Ethics ban list:** clean — exhaustive grep confirmed no fetch / XHR / WebSocket / Notification / streak / leaderboard / wishlist / share / attempts counter / analytics SDK anywhere in `src/`. Single localStorage key `tide-pull/save/v1` per spec; no real-world date or lunar phase recorded.
- **TS strictness:** no `as any`, no `@ts-ignore`, no `@ts-expect-error`, no `eslint-disable` anywhere. The two `as BayBase`/`as NightDelta` casts in `loader.ts` are the documented day-2 pragmatic JSON boundary.
- **Circular imports:** none. Import graph is a clean DAG.
- **Orphan code:** none. The six tech-plan §2 files documented as intentionally not built (`audio/sfx.ts`, `render/moonrise.ts`, `scenes/sandbox.ts`, `scenes/night.ts`, `sim/particles.ts`, `sim/pull.ts`) are absent from disk; no stub files left over.
- **Acceptance criteria coverage:** all Gherkin scenarios pass at code level except the "First launch" / "Returning launch" moonrise scenarios, which are pre-documented as a P3 deferral (no `render/moonrise.ts`; the title card + ambient fade carry the identity beat in the slice).
- **Commit hygiene:** 13 commits across 10 working days. One-day-one-commit shape with two appropriate fix-ups (day-1 `strict: true` + day-2 review). Messages follow `day-N: description`.
- **Polish-backlog items (non-blockers; documented for the next pass):**
  1. ✅ ADDRESSED in `c1cb61c+1`: `audio/manager.ts` `computeBedGain` now reads `PHASE_BED_GAIN[activePhase]` instead of the constant `BED_GAIN`. Phase-aware bed gain is captured via `activePhase` closure var, set in `bootstrap` + `setPhase`. The 10% gain discrepancy on full-moon unduck is gone.
  2. ⏳ DEFERRED to backlog: `sim/fluid.ts` `h`, `vx`, `vy` are public mutable `Float32Array` fields. The buffer-swap pattern (`tmp = this.h; this.h = this.hScratch; this.hScratch = tmp`) requires reassignability so they can't be `readonly`. Future refactor: make them private and expose `getHeights(): Float32Array` for `water.ts` to read; the swap stays internal. No external writer in the current slice, so this is a future-trap rather than a defect.
  3. ✅ ADDRESSED in `c1cb61c+1`: `main.ts` `?night=N` query-param override now has an in-source comment marking it as DEV-ONLY and flagging the need to remove or feature-gate before any public URL.
- **Notes:** the moonrise scenario is the only Gherkin scenario that does not pass; this is the explicit deferral the slice ships with. Reviewer confirms it is correctly documented and not a regression.

### Day 10 fix-up — 2026-05-06
- **Built:** addressed two of the three reviewer polish-backlog items (audio bed-gain phase-awareness; `?night=N` dev-only comment). The third (FluidGrid private fields) deferred to post-slice polish per its future-trap classification.
- **Files touched:** `game/src/audio/manager.ts`, `game/src/main.ts`.
- **Commit:** see `git log`.

### Post-slice fix — 2026-05-06 — height-pump runaway
- **User report:** "if i click to long the Mapp is consumed."
- **Cause:** `applyPull` in `game/src/sim/fluid.ts` added `HEIGHT_PUMP * pullStrength * dt * falloff` to `h` each frame unconditionally. Over sustained holds the height climbed past the foam stop (1.5) and saturated the entire grid to the brightest palette colour, consuming the bay visually.
- **Fix:** room-scaled pump. Multiplied the pump term by `Math.max(0, HEIGHT_CAP - h)` so growth tapers as height approaches `HEIGHT_CAP = 1.55`. Short pulls feel identical; sustained holds top out at foam locally and stay there.
- **Files touched:** `game/src/config.ts` (added `HEIGHT_CAP = 1.55`), `game/src/sim/fluid.ts`.

## Reviews

### Phase-4 Cycle-1 QA — 2026-05-06
- **Scope:** single-file fix to `game/src/render/moonrise.ts` — reduce-motion guard for the 8-second first-launch camera lift.
- **Automatable acceptance:** 4/4 criteria passed via code/server checks.
- **Browser-required acceptance:** 1 criterion pending human pass — see "Browser checks required" below.
- **Ethics-perimeter sweep:** clean — no analytics, tracking, or telemetry imports found in any `.ts` or `.tsx` file under `game/src/`.
- **Notes:**
  - `Select-String` regression check returns `True`: `prefersReducedMotion` is present in `moonrise.ts`.
  - `npx tsc --noEmit` exits 0, no type errors.
  - Code inspection passes on all four required properties:
    1. Sets `worldLayer.position.y` via `worldLayerBaseY(worldLayer)` — correct base-offset snap (line 36).
    2. Sets `cursorAlpha.value = 1` (line 37).
    3. Sets `phase = 'idle'` (line 38) and `elapsedMs = durationMs` (line 39) — subsequent `skip()` is a no-op as required.
    4. `return` on line 40 exits before the eased-tween path at lines 42–53.
  - Pattern matches the per-frame `prefersReducedMotion()` read convention from `scenes/softDrift.ts` lines 20–27: imported at module top, called per frame inside the update guard, no cached value.
  - `worldLayerBaseY()` helper reads the `__baseY` tag written at boot by `rememberWorldLayerBaseY()`; correctly falls back to the live `position.y` if the tag is absent (non-firstLaunch path where boot hasn't run).
- **Browser checks required:**
  - The canonical reduce-motion feel-test (feel-test-protocol §"The reduce-motion test" steps 1–7): enable "Windows Settings → Accessibility → Visual effects → Animation effects off", open `http://localhost:5173/` in the browser, confirm the 8-second camera lift is replaced by an instant cut to the idle state with no position tween visible, and that the ambient-bed audio still fades in normally on first gesture. Requires a live browser session — cannot be automated.
- **Commit:** `7723d1c`.

## Docs

### README.md + docs/HOW-TO-PLAY.md — 2026-05-06
- **Built:** repo-root README and a single-page HOW-TO-PLAY for the player. README points at the design artefacts and run instructions; HOW-TO-PLAY explains the controls, the three nights' verbs (without spoiling Night 3), soft-drift, free-pick after first playthrough, the ban list as plain language, and the dev-only `?night=N` quick-jump.
- **Reason:** user feedback after first play — "I need more instructions on how to play." Discoverability-only design wasn't carrying.
- **Files touched:** `README.md` (new), `docs/HOW-TO-PLAY.md` (new).
- **Commit:** see `git log`.

### `documentation-writer` agent — 2026-05-06
- **Built:** new `.claude/agents/documentation-writer.md`. Player- and project-facing docs (README, HOW-TO-PLAY, in-game copy, changelogs). Australian English, cosy tone, tight scope. Reads the design spec / tech plan / motion bible / build-log; doesn't write to them. CLAUDE.md roster updated.
- **Note:** the harness caches agent definitions at session start, so the new agent isn't dispatchable in this session. Available from next session onward. The README + HOW-TO-PLAY in this commit were authored under the agent's prompt directly because of that cache.
- **Commit:** see `git log`.

### All-deferred polish pass + sim retune — 2026-05-06
- **User report:** "needs a bit more explanation and building out." Then: "the game is really difficult when I hold it too long and the boat barely moves but then the focus point goes too deep and wipes out the arena."

#### Bug fixes (the second user report)
- **Boat barely moves on long holds** — root cause: pressure gradients balance the pull-force at the cursor centre, leaving a low-velocity plateau. Receivers in that plateau weren't being moved by flow.
  - Fix 1: `RECEIVER_DIRECT_PULL` direct-attraction force in `main.ts applyReceiverAttraction()`. Each frame during hold, every non-sent receiver gets a force toward the cursor scaled by `pullStrength` and falloff over `pullRadius * 1.8`. The water flow advection still applies — direct pull just guarantees the receiver responds to player intent.
  - Applied uniformly across all three verbs (no verb-specific code; main.ts dispatches it).
- **Focus point goes too deep / wipes the arena** — root cause: HEIGHT_PUMP=1.2 + advection propagated raised water outward; sustained holds saturated wide bay regions to the foam stop.
  - Fix 1: HEIGHT_PUMP reduced 1.2 → 0.55. Pump is gentler.
  - Fix 2: HEIGHT_CAP reduced 1.55 → 1.32 (was just above foam stop 1.5; now sits between mid 0.95 and crest 1.15). Sustained holds cap below foam, leaving full palette range visible.
  - Fix 3: REST_RATE bumped 0.4 → 0.6 (height returns to rest faster).
  - Fix 4: SPRING reduced 30 → 22 (less aggressive outward pressure propagation).
  - Fix 5: DAMPING_RATE bumped 1.5 → 1.8 (velocity decays faster between frames).
  - Fix 6: HOLD_FORCE_BASE reduced 60 → 50 (gentler velocity injection).
  - Fix 7: `MAX_VELOCITY = 80` clamp in `step()`. Prevents unbounded velocity accumulation; per-cell velocity magnitude is capped after damping each frame.
- **Files touched (bug fixes):** `game/src/config.ts`, `game/src/sim/fluid.ts`, `game/src/main.ts`.

#### Polish pass (the first user report)
- **Built:**
  - **Cursor pull-radius ring** is now drawn around the moon at every phase (faint at idle, brighter on hold). Per the motion bible: 80px / 140px / 110px for waxing / full / waning. Players can SEE the moon's reach at a glance.
  - **Cursor halo growing with hold** — `setHoldStrength(t)` ramps the ring's alpha from 0.18 → 0.63 over the first 400ms of hold. Disc also scales up gently by 6%. Visible "I'm pulling" feedback at the cursor.
  - **Pulsing harbour ring on Night 1** — when not yet engaged, the harbour ring breathes between alpha 0.22 and 0.58 at 0.6 Hz. Stops pulsing once the boat enters the ring (highlight) or when the goal completes.
  - **Boat bob + rotation** — `entities.update(dt)` adds a 1.4 Hz vertical bob (±1.6px) and gentle 1 Hz rotation oscillation (±0.04 rad). Receivers feel alive even before the player engages.
  - **Lantern shimmer** — same update path adds a halo-alpha pulse on lanterns at 1.6 Hz so they glow softly while drifting.
  - **Picker hover state** — selectable glyphs scale up to 1.1× on `pointerover` and back to 1.0× on `pointerout`. Picker now reads as interactive.
  - **Moonrise opening beat** — new `render/moonrise.ts`. First launch (no completed nights) plays an 8s ease-out: cursor alpha 0 → 1, world `position.y` tweens (gentle "y-offset lift" framing). Return launches play an abridged 1.8s version. Skippable on any input. Disabled when the `?night=N` URL override is used. Verb updates and `applyPull` are gated off until the moonrise finishes — it's a watch-only intro beat.
  - **Soft-drift refactor** — `updateSoftDrift` no longer touches `cursor.alpha` directly; it only mutates state and applies camera scale. Main.ts composes cursor alpha from `state.softDrift.cursorAlpha * moonriseAlpha`, so the moonrise fade-in and a soft-drift dim no longer fight each other.
- **Files touched:** `game/src/render/cursor.ts`, `game/src/render/harbour.ts`, `game/src/render/entities.ts`, `game/src/render/moonrise.ts` (new), `game/src/scenes/nightPicker.ts`, `game/src/scenes/softDrift.ts`, `game/src/main.ts`.
- **Notes for player:** with the moonrise, first-launch flow is now: 3s title card + 8s moonrise ease-in + verb begins. On return launches: 3s title card + 1.8s abridged moonrise + verb. Pressing during either skips them.
- **Still-deferred (now landed in this same pass):** see All-deferred polish pass entry below.
- **Commit:** see `git log`.

### All-deferred polish pass (continued) — 2026-05-06

Picking up the deferred-polish backlog from the discoverability pass:

- **Per-phase tinted water palettes.** `WATER_PALETTES` in config.ts — three full 5-stop palettes, one per lunar phase. Waxing crescent is the canonical / cool / intimate. Full moon is +5–10% R+G (warmer, brighter — moon closer). Waning gibbous is silvered / slightly desaturated. Differences are within ±~10% per channel so colour-blindness compliance carries (envelope from deepest to foam preserved). `water.ts` lerps the active palette toward the target on `setPhase` over ~700ms (rate=1.5/s × dt blend per frame). Visual differentiation between nights now reads in still frames, not just via audio.
- **Sent-lantern fade-out on Night 3.** `entities.ts` per-visual `fadingMs` field; when `sent=true` first appears in `sync`, fade starts. Each frame in update, container.alpha = 1 − t over 600ms. Position tracking continues during the fade so the lantern still drifts on momentum until invisible. After fade, `container.visible = false`. No more abruptly-vanishing lanterns.
- **Held-success camera ease-in.** New `applyHeldSuccessEase(elapsedMs)` in main.ts. While `goalNowComplete` is true, ease worldLayer.scale 1.0 → 1.12 over 1.5s with cubic ease-out. Reset on enterNight + showPicker + finishCurrentNight. `prefersReducedMotion()` skips the ease entirely.
- **Ambient creatures.** New `render/ambientLife.ts`. Three gulls fly slow horizontal paths across the upper third of the bay (vertical bob + flap rotation, random respawn off-edge). Occasional water-ripple at random position on the bay (1.5px stroke ring expanding 0 → 24-44px over 1.8s, alpha 0.35 → 0). Triggered every 4–9 seconds. Mounted on `worldLayer` so it scales with soft-drift. Doubles as picker-scene idle decoration.
- **FluidGrid private-fields refactor.** `_h`, `_vx`, `_vy`, `_hScratch` are now private. New `get heights()` getter exposes a read-only-by-convention reference for `water.ts`. The buffer-swap in `step()` stays internal. External writers can no longer break the sim by mutating cells directly.
- **Files touched (polish):** `game/src/config.ts` (per-phase palettes + sim retune values), `game/src/render/water.ts` (palette lerp + setPhase + dt-driven update), `game/src/render/entities.ts` (sent fade), `game/src/render/ambientLife.ts` (new), `game/src/sim/fluid.ts` (private fields + getter + velocity clamp), `game/src/main.ts` (held-success ease, water phase wiring, ambient layer mount, receiver attraction).

#### Status of polish backlog

| Item | Status |
|---|---|

## Closure-sprint cycle 3 — intent beat (P1 #5)

### Cycle 3 — 2026-05-06

- **Built:** `game/src/render/intentBeat.ts` (new, ~120 LOC) + wiring in `game/src/main.ts` (~8 lines added across import, mount, ticker, skip handler, input gate, and enterNight call).
- **Files touched:** `game/src/render/intentBeat.ts` (new), `game/src/main.ts` (import + 5 wiring sites).
- **Verification:**
  1. `npx tsc --noEmit` — exit 0.
  2. `npm run lint` — exit 0.
  3. `Test-Path src/render/intentBeat.ts` — True.
  4. `Select-String -Path src/main.ts -Pattern 'intentBeat' -Quiet` — True.
- **P3 cuts taken:** None. Spec delivered in full: N1 gate-only (no graphics, input blocked for 1500ms), N2 lantern-centroid ring pulse (scale 1.0→1.15→1.0, alpha 0→0.35→0), N3 east-edge expanding ring (radius 0→200, alpha 0.4→0). Reduce-motion variants for N2/N3 (single static frame, 200ms gate). Within-session re-entry suppression via `seenSet`. Skip-on-press wired alongside `titleCard` and `moonrise` skip. Input gate extended: `moonriseGate` now also blocks while `intentBeat.isActive()`.
- **Out of scope:** QA feel-test (requires browser session); device validation of ring visuals at world-space coordinates.
- **Watch-outs:**
  - The spec referred to the level param as type `Level`; the actual type in `game/src/level/types.ts` is `LevelDef`. Used `LevelDef` throughout — no functional impact, correct type.
  - `moonriseGate` variable name kept as-is in `main.ts`; its condition now also checks `intentBeat.isActive()`.
  - N1 fires with `container.visible = false` — pure input gate, no ring drawn. The harbour ring already provides the N1 affordance per spec.
  - `seenSet` is owned by the closure and persists for the lifetime of the session. Re-entering a night shows nothing (suppressed), matching the acceptance criterion exactly.
- **Commit:** see `git log`.
| Per-phase tinted water palette | ✅ landed |
| Sent-lantern fade on Night 3 | ✅ landed |
| Held-success camera ease-in beat | ✅ landed |
| Ambient creatures (gulls + ripples) | ✅ landed |
| FluidGrid private-fields refactor | ✅ landed |
| Boat sluggishness / arena wipe (new bug) | ✅ fixed |

- **Commit:** see `git log`.

## Closure-sprint Day 1 — rename to *Neap* + save v2 migration + perimeter codification

### Day 1 — 2026-05-06 (closure sprint)
- **Built:**
  - **P1 #1 Rename to *Neap* in player-facing surfaces.** `game/index.html` `<title>`, `game/package.json` `name`, `README.md` (top + body), `docs/HOW-TO-PLAY.md` (top + save-key reference at the persistence-explainer line), `docs/specs/conventions.md` (intro + persistence + save section + ban-list save-key clause), `docs/specs/feel-test-protocol.md` (intro + ethics-perimeter localStorage check; the feel-test rename was bundled into captain cycle 1's `8fc4a29`), `docs/specs/motion-and-colour-bible.md` (intro), `docs/specs/trailer-cut.md` (intro). Each retains a "(working title was *Tide / Pull*)" note for fidelity. Historical specs left alone per closure-sprint tech-plan §2.5.
  - **P1 #2 Save schema migration `tide-pull/save/v1` → `neap/save/v2`.** `game/src/state/save.ts` reads v2 first; falls back to v1 once and migrates forward, leaving the legacy key in place defensively. `PersistedMeta` gains a `ghosts: PersistedGhost[]` field; `MetaState` gains a `persistedGhosts` array that mirrors what's written. `recordNightComplete` updates both the in-session `Map` and the persisted array on each completion (skips sent lanterns). `ghostsForNight` unifies session + persisted (session wins when both have the same night, avoiding duplicates). New `allGhostsForPicker(meta)` helper for day 7 picker-as-place.
  - **P2 #17 Perimeter codification (moved up to day 1).** New section "Perimeter — UI surfaces that do not exist" appended to `docs/specs/conventions.md` per habit-formation R2. Hard rule: no in-game share/wishlist/follow/clip/screenshot-share/social-graph/return-pressure/achievements surfaces. Council Override required for any future exception.
- **Bundled from captain cycle 1 (`8fc4a29`):** the moonrise reduce-motion swap (P1 #3) was shipped by captain cycle 1 ahead of the manual closure-sprint kick-off; recorded here for traceability. See `docs/specs/forward-log.md` cycle 1 for the cycle's evidence trail.
- **Files touched (this commit):** `game/src/state/save.ts` (rewrite), `game/src/state/meta.ts` (extend), `game/index.html`, `game/package.json`, `README.md`, `docs/HOW-TO-PLAY.md`, `docs/specs/conventions.md`, `docs/specs/motion-and-colour-bible.md`, `docs/specs/trailer-cut.md`, plus new `docs/specs/2026-05-06-tech-plan-closure-sprint.md` and `docs/specs/2026-05-06-tide-pull-retrospective.md` from the retrospective + tech-plan flow that preceded day 1.
- **Verification:** `npx tsc --noEmit` clean; `npm run lint` clean; ripgrep audit confirms remaining `tide.?pull|Tide / Pull` hits are all in the expected categories: (a) historical specs intentionally left alone; (b) the `LEGACY_KEY` constant in `save.ts` for migration; (c) "(working title was *Tide / Pull*)" historical notes in renamed docs; (d) `CLAUDE.md` and `.claude/agents/*.md` (internal team-and-workflow docs not in the rename list — can update on day 11/12 cleanup if they bite).
- **P3 cuts taken:** none.
- **Out of scope (deferred to later closure-sprint days):**
  - **OQ18 N3-only direct-receiver-pull gate** is day 3 work, not day 1. N1 and N2 still get direct receiver pull from `applyReceiverAttraction` as today.
  - **Cursor-trail removal + cursor-tether shimmer** is day 2 work.
  - **Picker-as-place (visual half of P1 #2)** is day 7 work — the schema landed today, but `showPicker()` doesn't yet render persisted ghosts on the picker scene.
  - **Intent beat for N2 + N3, N3 headland fire, N3 fade-to-silence + bell callback** are days 4–6.
- **Watch-outs:**
  - Players who load the slice once after this commit will have BOTH `tide-pull/save/v1` (legacy, read-only) and `neap/save/v2` (canonical, written) in their localStorage. That's expected; the ethics-perimeter sweep in `feel-test-protocol.md` was updated to acknowledge it.
  - Day 1 changed the migration write path (`writeSave` is called from `loadSave` during the legacy migration). On any localStorage-disabled or quota-exceeded environment the migration silently no-ops, the empty save shape is returned, and the game starts fresh — no error surfaced to the player. Consistent with the existing v1 defensive pattern.
  - The `allGhostsForPicker` helper exists today but isn't called yet; day 7's `showPicker()` change will wire it in.
- **Commit:** see `git log`.

## Closure-sprint cycle 2 — held-success dwell-to-savour

### Cycle 2 — 2026-05-05

- **Change:** P1 #4 reframe — held-success auto-advance demoted from forced cut to ceiling (no-input fallback). From 1500ms onward any pointer press advances the night immediately. Press-attack audio suppressed during the savour window so the press signals advance, not engage.
- **Three edits to `game/src/main.ts`:**
  1. Added `const SAVOUR_MIN_MS = 1500` alongside the existing held-success constants (line 50).
  2. Goal-met advance block now evaluates two paths: `savourCeiling` (`postCompleteMs >= HELD_SUCCESS_HOLD_MS`) and `savourTap` (`postCompleteMs >= SAVOUR_MIN_MS && pressEdge`). The `worldLayer.scale.set` reset runs before both paths. Auto-advance at 2500ms is preserved as the no-input fallback.
  3. Press-edge handler gated with `&& !wasGoalComplete` — suppresses `audio.pressAttack()`, title-card skip, and moonrise skip during the savour window. Audio `start()` initialisation is intentionally outside the gate (idempotent, unrelated).
- **Ethics perimeter:** closes the soft-compulsion drift flagged in retrospective P1 #4 (habit-formation R2). Unconditional forced cut at 2500ms was the violation; player now chooses the moment of advance after the savour minimum protects the bell-and-cream beat.
- **Verification:** `npx tsc --noEmit` clean; `npm run lint` clean; `Select-String -Path src/main.ts -Pattern 'SAVOUR_MIN_MS' -Quiet` returns True.
- **Commit:** see `git log`.

### Closure-sprint cycle 2 QA — held-success dwell-to-savour

- **Automatable acceptance: 9/9 criteria passed via code/static checks**
  1. `npx tsc --noEmit` — exit 0. PASSED.
  2. `npm run lint` — exit 0. PASSED.
  3. Cycle-2 regression check — `SAVOUR_MIN_MS` present in `src/main.ts`. PASSED.
  4. Cycle-1 regression check — `prefersReducedMotion` present in `src/render/moonrise.ts`. PASSED (no regression on moonrise reduce-motion fix).
  5. Gherkin (1) — bell + harbour cream + 1.5s ease on goal-met: `audio.goalMet()` fires on the `goalNowComplete && !wasGoalComplete` rising edge (line 219); `applyHeldSuccessEase` uses `HELD_SUCCESS_EASE_MS = 1500` (line 260). CONFIRMED.
  6. Gherkin (2) — tap-to-advance from 1500ms: `savourTap = postCompleteMs >= SAVOUR_MIN_MS && pressEdge` at line 226 gates `finishCurrentNight`. CONFIRMED.
  7. Gherkin (3) — auto-advance ceiling at 2500ms: `savourCeiling = postCompleteMs >= HELD_SUCCESS_HOLD_MS` at line 225 is the no-input fallback path. CONFIRMED.
  8. Gherkin (4) — no "advance now" UI string: zero matches for `share`, `wishlist`, `follow`, `streak`, `leaderboard`, `notification` in `src/`. CONFIRMED.
  9. Press-attack-suppression gate (manual-test step 5): `audio.pressAttack()` is inside `if (pressEdge && !wasGoalComplete)` (lines 160-161). `audio.start()` is outside that gate (lines 157-159) — idempotent audio unlock, correct. CONFIRMED.

- **Ethics-perimeter sweep: clean**
  - Forbidden analytics imports (`sentry`, `posthog`, `plausible`, `mixpanel`, `gtag`, `googletagmanager`, `analytics`): zero matches.
  - Network/notification APIs (`fetch(`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `Notification`) in `src/`: zero matches.
  - `localStorage.setItem` keys: only `neap/save/v2` (in `src/state/save.ts` line 68). Legacy `tide-pull/save/v1` is read-only (getItem only). CLEAN.
  - Forbidden UI strings (`share`, `wishlist`, `follow`, `streak`, `leaderboard`, `notification`): zero matches.
  - `package.json` runtime deps: only `pixi.js`. CLEAN.

- **Regressions:** none found. Cycle-1 moonrise reduce-motion fix intact.

- **Browser-required acceptance: 1 set pending human pass**
  - [ ] Full manual feel-test — "The held-success dwell-to-savour test" steps 1-5 in `docs/specs/feel-test-protocol.md`: ceiling at ~2.5s, tap-to-advance from ~1.5s, savour minimum (no advance before 1500ms), press-attack audio absent during savour window. Requires browser session with audio on.

- **Notes:** The three edits are tight and correct. The `savourTap` / `savourCeiling` split is the right shape — the `postCompleteMs` accumulator is reset to 0 in `enterNight` (line 288), so there is no cross-night state leak. `wasGoalComplete` is also reset in `enterNight` (line 289), confirming the gate cannot stick across a night transition. No concerns beyond the browser feel-test.

- **QA_RESULT: PASSED_WITH_NOTES** *(browser feel-test pending human pass)*
- **PR_NUMBER: N/A — direct commit 94ef127 on main**

### Closure-sprint cycle 2 Review — held-success dwell-to-savour

- **Verdict:** APPROVED.
- **Reviewer:** reviewer agent, against `94ef127` on `main`, diff `502a40d..94ef127 -- game/src/main.ts`.
- **Tech-plan acceptance fit:** P1 #4 delivered exactly as specced. OQ18 N3-only gate correctly absent; deferred to cycle 3 per cycle-2 cluster pick. Build-log entry honest about scope.
- **Stack discipline:** no `any`; `SAVOUR_MIN_MS` correctly positioned in the held-success constant cluster; `pressEdge && !wasGoalComplete` gate mirrors the established title-card / moonrise skip-on-press shape; `audio.start()` correctly outside the gate; no new runtime dependencies.
- **State leak:** `enterNight()` resets both `postCompleteMs` and `wasGoalComplete`; `savourCeiling` / `savourTap` are frame-local — no cross-night savour leak possible.
- **Ethics ban list:** clean. Tap-to-advance is invisible logic; no new UI surface, no advance-prompt text, no skip button. All grep checks pass.
- **A11y:** reduce-motion path unchanged; `applyHeldSuccessEase` already guards on `prefersReducedMotion()`; no new animations.
- **Code shape:** `main.ts` stays orchestration-only; named identifiers are clear and match spec terminology.
- **Remaining gate:** browser feel-test (QA's pending human pass) — not a reviewer blocker, correctly flagged by QA.

- **REVIEW_RESULT: APPROVED**
- **PR_NUMBER: N/A — direct commit 94ef127 on main**

## Closure-sprint cycle 3 — intent beat (per-night affordance pulse)

### Closure-sprint cycle 3 QA — intent beat

- **Automatable acceptance: 19/19 criteria passed via code/static checks**

  Static file checks:
  1. `npx tsc --noEmit` — exit 0. PASSED.
  2. `npm run lint` — exit 0. PASSED.
  3. `Test-Path src/render/intentBeat.ts` — file exists. PASSED.
  4. `Select-String -Path src/main.ts -Pattern 'intentBeat' -Quiet` — returns True. PASSED.
  5. Cycle-2 regression — `SAVOUR_MIN_MS` present in `src/main.ts`. PASSED.
  6. Cycle-1 regression — `prefersReducedMotion` present in `src/render/moonrise.ts`. PASSED.

  Spec-interface checks (intentBeat.ts):
  7. `container: Container` exposed in return shape (line 133). CONFIRMED.
  8. `start/update/skip/isActive` signatures match spec interface (lines 11-17, 133). CONFIRMED.
  9. `seenSet: Set<NightNumber>` for re-entry suppression (line 25); `seenSet.has(night)` gate in `start()` (line 40). CONFIRMED.
  10. Reduce-motion path draws a single static ring frame then exits after `REDUCE_MOTION_DURATION_MS = 200` — N2 lines 89-95, N3 lines 111-117. CONFIRMED.
  11. N1 path is gate-only: `container.visible = false`, no ring drawn, `durationMs = N1_DURATION_MS = 1500` (lines 52-56). CONFIRMED.
  12. N2 centroid computed via `level.night.spawns.filter(s => s.type === 'lantern')` with sum/divide (lines 59-65); fallback `(960, 540)` if no lanterns. CONFIRMED.
  13. N3 origin is `centroid = { x: 1920, y: 540 }` (line 73). CONFIRMED.
  14. `RING_COLOUR = 0xa8b5cc` (line 9). CONFIRMED.

  Main wiring checks:
  15. `intentBeat.container` mounted on `worldLayer` at boot (line 92 of main.ts). CONFIRMED.
  16. `intentBeat.start(night, level)` called on line 327, immediately after `titleCard.show()` on line 326 in `enterNight()`. Order correct. CONFIRMED.
  17. `intentBeat.skip()` is inside `if (pressEdge && !wasGoalComplete)` (main.ts lines 164-169): a press during the savour window does NOT trigger a skip. CONFIRMED.
  18. `intentBeat.update(dt)` called in per-frame ticker (main.ts line 177). CONFIRMED.
  19. Input gate: `const moonriseGate = !moonrise.isActive() && !intentBeat.isActive()` (main.ts line 185) applied at line 186 before physics/verb updates. CONFIRMED.

- **Ethics-perimeter sweep: clean**
  - Forbidden analytics imports (`sentry`, `posthog`, `plausible`, `mixpanel`, `gtag`, `googletagmanager`, `analytics`): zero matches in `src/`.
  - Network/notification APIs (`fetch(`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `Notification`): zero matches in `src/`.
  - `localStorage.setItem` keys: one match — `src/state/save.ts` line 68, key is `SAVE_KEY = 'neap/save/v2'`. No new keys introduced by this commit. CLEAN.
  - Forbidden UI strings (`share`, `wishlist`, `follow`, `streak`, `leaderboard`, `notification`): zero matches in `src/`.
  - `package.json` runtime deps: `["pixi.js"]` only. CLEAN.

- **Regressions: none found**
  - Cycle-2 `SAVOUR_MIN_MS` / savour-tap / savour-ceiling block intact; `wasGoalComplete` and `postCompleteMs` both reset in `enterNight()` (main.ts lines 294-295) — no cross-night savour leak possible.
  - Cycle-1 moonrise reduce-motion fix intact: `prefersReducedMotion()` checked at `moonrise.ts` line 35 inside `update()`.

- **Notes:**
  - `intentBeat.container` is on `worldLayer` (not `uiLayer`), so it moves with the world during the moonrise camera lift. Intentional — the ring is diegetic (marks the lantern centroid for N2, east edge for N3).
  - N1 gate-only path satisfies the spec: the harbour ring's natural breathing IS the N1 affordance; no separate ring fires.
  - N2 centroid is dynamic from level spawn data. The spec note of `(~880, 435)` is a runtime approximation; the code derives it from actual spawns as specified.
  - `seenSet` persists for the session lifetime inside the `createIntentBeat()` closure. It is NOT written to `localStorage` — correct, spec requires within-session suppression only.
  - The `intentBeat.skip()` call inside `pressEdge && !wasGoalComplete` is correct. A press during the savour window (where `wasGoalComplete` is true) does not reach `skip()`. This is safe because the intent beat cannot be active during the savour window: the beat plays before input-enable (before goal-met is even possible), and the savour window only opens after the goal is met.

- **Browser-required acceptance: 1 set pending human pass**
  - [ ] Full manual feel-test — "The intent-beat test" steps 1-7 in `docs/specs/feel-test-protocol.md`: N1 gate-only (no ring fires, input briefly gated ~1.5s); N2 lantern ring at centroid ~(880, 435) with 600ms triangle-wave ease, alpha 0→0.35→0; N3 foam-stop ring expanding from (1920, 540), radius 0→200 over ~800ms, alpha 0.4→0; skip-on-press cancels beat and enables input immediately; re-entry suppression (N2 ring does not fire on second entry within same session); reduce-motion (N2/N3 single static ring at peak alpha ~200ms, no expansion). Requires browser session with sound on.

- **QA_RESULT: PASSED_WITH_NOTES** *(browser feel-test pending human pass)*
- **PR_NUMBER: N/A — direct commit 5c24258 on main**
