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

## Regressions

*(populated by qa-agent when found)*

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
