# Neap

A cosy one-button physics game where you are the moon.

This repository hosts a vertical slice — three nights over one bay. The slice runs locally; it isn't deployed anywhere yet.

(Working title until renamed: *Tide / Pull*. Historical specs and commit messages reference the old name; the game itself is *Neap*.)

## Run it

```powershell
cd game
npm install      # first time only
npm run dev
```

Open `http://localhost:5173/` in Edge or Chrome (latest). No build step needed for play; `npm run dev` runs Vite with HMR.

## Play it

Hold the mouse button anywhere on the bay to pull the tide toward your cursor. Let go and the water rushes home. The boat, the lanterns, and the cursor itself respond to the moon — that's you.

See [`docs/HOW-TO-PLAY.md`](docs/HOW-TO-PLAY.md) for the full guide.

## What's in here

- [`game/`](game/) — the slice. Pixi.js v8 + TypeScript + Vite. No external assets in source; sprites are Pixi `Graphics`, audio is synthesised via Web Audio API.
- [`docs/specs/`](docs/specs/) — the design and build trail:
  - `2026-05-05-premise.md` — the original concept pitch.
  - `2026-05-05-tide-pull-design.md` — the design spec from the Creative Council (six specialists, four rounds).
  - `2026-05-06-tech-plan.md` — the original implementation plan from the tech lead.
  - `2026-05-06-build-pipeline-adapter.md` — the plan that adapted the dev/qa/reviewer agents for greenfield local work.
  - `2026-05-06-tide-pull-retrospective.md` — the post-build retrospective and v0.5 closure-sprint design.
  - `2026-05-06-tech-plan-closure-sprint.md` — the tech plan for the closure sprint currently underway.
  - `motion-and-colour-bible.md` — timings, palette, lunar variants.
  - `conventions.md` — stack rules and the ethics ban list as code rules.
  - `feel-test-protocol.md` — the QA runbook for verifying the slice in a browser.
  - `trailer-cut.md` — the 30-second trailer cut sequence.
  - `build-log.md` — the per-day record of what shipped, what was cut, and what was deferred.
  - `forward-log.md` — the Phase-4 ralph-loop working log (created on first `/captain` cycle).
- [`.claude/agents/`](.claude/agents/) — the multi-agent design and build team.
- [`AGENTS.md`](AGENTS.md) — the team and workflow reference.

## Stack

TypeScript 6.0 (strict). Pixi.js 8.18. Vite 8 with Rolldown. Native Web Audio API. ESLint flat config + Prettier. The slice ships with exactly one runtime dependency, `pixi.js`. No analytics, telemetry, or remote calls after initial asset load — by design.

## What it isn't

- It isn't a deployed game. It runs at `localhost:5173` only.
- It isn't a finished product. The slice is a vertical proof; the v0.5 closure sprint per the retrospective is in progress.
- It isn't a service. There is no leaderboard, no streak, no daily challenge, no notifications, no in-game share or wishlist surface. Those are listed as a hard ban in `docs/specs/conventions.md` and grep-checked by the reviewer agent.

## Status

The slice is code-complete and the v0.5 closure sprint is underway per `docs/specs/2026-05-06-tech-plan-closure-sprint.md`. The browser-required acceptance — culminating in the day-10 stranger test — is the remaining gate. See `docs/specs/build-log.md` for the per-day "Browser-required acceptance" checklists.
