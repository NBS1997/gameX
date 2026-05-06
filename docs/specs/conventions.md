---
title: conventions
date: 2026-05-06
status: working
phase: 2.5
authors: [orchestrator]
---

# Conventions — *Neap* slice (working title was *Tide / Pull*)

The single source of code conventions for the vertical slice. Read on every dev / reviewer run. Replaces (and shrinks down) the older Tamagotchi-era CONVENTIONS / ARCHITECTURE / ANTI_PATTERNS / security stack.

## Stack

- **Language:** TypeScript 5.6+, strict mode on. No `any`.
- **Renderer:** Pixi.js 8.18+. WebGL by default; switch to WebGPU only if profiled.
- **Build:** Vite 8 with Rolldown. `npm run dev` for HMR at `http://localhost:5173/`.
- **Audio:** native Web Audio API (`AudioContext` + `BiquadFilterNode` + `GainNode`). Howler 2.2 only as fallback if exercised on day 5.
- **Persistence:** `localStorage`, single key `neap/save/v2`. Legacy `tide-pull/save/v1` is read-only on first launch (one-time migration) and then ignored.
- **Tests:** none automated for the slice. Manual feel-test via `docs/specs/feel-test-protocol.md`.
- **Linting:** ESLint 9 flat config + Prettier (Vite scaffold defaults — do not deviate).

## Layout

All code lives under `game/`:

```
game/
├── index.html              # one canvas, cursor: none on it
├── package.json
├── vite.config.ts
├── tsconfig.json
├── public/
│   ├── audio/              # 5 audio files, .ogg + .mp3 each
│   └── sprites/            # cursor-moon variants, lantern/boat/etc.
├── levels/                 # JSON, hand-authored
│   ├── bay.base.json
│   ├── night-1.delta.json
│   ├── night-2.delta.json
│   └── night-3.delta.json
└── src/
    ├── main.ts             # entrypoint: boot, Pixi app, RAF loop
    ├── config.ts           # all tunables: pull strengths per phase, timings
    ├── state/              # gameState.ts, save.ts
    ├── level/              # loader.ts, types.ts
    ├── sim/                # fluid.ts, particles.ts (fallback), pull.ts
    ├── render/             # stage.ts, water.ts, cursor.ts, titleCard.ts, moonrise.ts
    ├── input/              # pointer.ts
    ├── audio/              # manager.ts, sfx.ts
    ├── scenes/             # sandbox.ts, nightPicker.ts, night.ts
    ├── verbs/              # guide.ts, gather.ts, settle.ts (third verb file)
    └── a11y/               # reduceMotion.ts
```

If a file doesn't fit one of these directories, ask whether it earns a new directory or whether it belongs in `config.ts` / state.

## Naming

- **Files:** kebab-case (`game-state.ts`, `cursor-moon-waxing.png`).
- **Types / interfaces:** PascalCase (`LevelDef`, `ReceiverDef`, `LunarPhase`).
- **Functions / variables:** camelCase (`enterNight`, `pullStrength`).
- **Constants:** SCREAMING_SNAKE_CASE only when truly constant across the lifetime of the program (`SAVE_KEY`); otherwise camelCase.
- **Audio files:** kebab-case, format `<role>-<descriptor>.ogg` (e.g. `ambient-bed.ogg`, `release-whoosh.ogg`).
- **Sprite files:** kebab-case, format `<role>-<variant>.png` (e.g. `cursor-moon-full.png`, `lantern-paper.png`).

## Imports

- Relative imports within `src/`. No path aliases until they earn their keep.
- One module per file. Default exports only for top-level entrypoints; named exports otherwise.
- Type-only imports use `import type { ... }`.

## State

- One state object lives in `state/gameState.ts`. Plain TS object with a typed shape.
- Mutate via named functions only: `enterNight(n)`, `markCompleted(n)`, `softDrift()`, `setLunarPhase(p)`.
- No global mutable variables outside the state object.
- No reactive framework, no signals library. Solo dev, ten days, one screen of state.

## Save

- Single `localStorage` key: `neap/save/v2`.
- Single JSON blob: `{ version: 2, completedNights: NightNumber[], freeReentry: boolean, ghosts: PersistedGhost[] }`.
- `PersistedGhost = { night: NightNumber; type: ReceiverType; x: number; y: number }` — bay-memory only, never a visit counter or completion timestamp.
- No real-world date written to save. No notification scheduling. No streak field. No attempts/failures count.
- Legacy migration: `tide-pull/save/v1` (older shape, no `ghosts` field) is read once on first launch and lifted into the v2 shape with `ghosts: []`. The legacy key is left in place defensively (cheap; allows rollback) but never written to.

## No-go list (ethics ban list as code rules)

Items 21–33 of `docs/specs/2026-05-05-tide-pull-design.md`, restated as concrete code prohibitions:

- ❌ `setInterval` / scheduled-notification logic for re-engagement.
- ❌ Any leaderboard, ranked list, or "X players solved this" UI.
- ❌ Any "streak" / "consecutive days" / "missed day" counter or surface.
- ❌ Any `Date` comparison against a stored historical date for gating content.
- ❌ Any UI labelled "share", "wishlist", "follow", "tweet", "post". (Trailer end-card is external; not in code.)
- ❌ Any `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource` after the initial asset load. (Asset load itself is via Pixi `Assets.load` and `AudioContext` decode — those are fine.)
- ❌ Any `localStorage.setItem` with a key other than `neap/save/v2` (legacy `tide-pull/save/v1` is read-only).
- ❌ Any `Notification` API call, `serviceWorker` registration, push, or banner code path.
- ❌ Any analytics / telemetry / error-reporting SDK: Sentry, GA, gtag, Plausible, PostHog, Mixpanel, Amplitude, Heap, Hotjar, FullStory, LogRocket. Not even imported.
- ❌ Any IAP, cosmetic shop, or real-money code.
- ❌ Any "bays played" lifetime counter or attempts counter shown to the player.
- ❌ Any in-game text other than the 3-second lunar-phase title card per night (3 strings total).

The reviewer agent grep-checks these every run.

## Perimeter — UI surfaces that do not exist

Hard rule, codified during the v0.5 closure sprint per habit-formation R2 P2 #17. Cannot be violated without an explicit Council Override entry in this file.

- ❌ No `share`, `wishlist`, `follow`, `tweet`, `post`, `gift`, `invite`, `clip`, or `screenshot-share` button anywhere in the player-facing UI.
- ❌ No "rate this game", "review on Steam", or "leave feedback" surface inside the build.
- ❌ No social-graph features (no friend list, no leaderboard against friends, no friend-recommends, no co-op invite).
- ❌ No "your daily bay is ready" / "you missed Tuesday's bay" / any return-pressure copy.
- ❌ No achievements, no badges, no unlock surfaces beyond the in-session linear→free-pick gate.

Any external CTA (Steam wishlist, itch follow, social handle) lives **only** in the trailer-end card or external store-page surfaces — never in the build itself. The trailer's wishlist card is a Steam-page artefact, not in-game UI.

If a future feature seems to require any of the above, the answer is "no" by default; an explicit Council Override entry must justify in writing why this game is the exception, and the override must be backed by a Round-2 critique pass.

## Anti-patterns

*Empty at slice start. The reviewer / dev agents add an entry here when a pattern emerges that we want future code to avoid. Format: short title, one paragraph of context, the pattern to avoid, the pattern to prefer.*

## No-comment policy

Default: write no comments. Comments are for the *why* when it's non-obvious — a hidden constraint, a workaround for a specific bug, a subtle invariant.

- Don't explain what the code does. Well-named identifiers do that.
- Don't write multi-line block comments or paragraph-length JSDoc.
- Don't reference issues, tickets, or "added for the X flow". That belongs in the build-log.
- One short line is the maximum. If you need more than that, the code probably wants restructuring.
