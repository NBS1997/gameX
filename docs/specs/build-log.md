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
