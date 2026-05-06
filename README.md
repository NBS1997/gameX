# Tide / Pull

A cosy one-button physics game where you are the moon. Working title; rename pending.

This repository hosts a vertical slice — three nights over one bay, built across ten days of solo dev work. The slice runs locally; it isn't deployed anywhere.

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
  - `2026-05-06-tech-plan.md` — the implementation plan from the tech lead.
  - `2026-05-06-build-pipeline-adapter.md` — the plan that adapted the dev/qa/reviewer agents for greenfield local work.
  - `motion-and-colour-bible.md` — timings, palette, lunar variants.
  - `conventions.md` — stack rules and the ethics ban list as code rules.
  - `feel-test-protocol.md` — the QA runbook for verifying the slice in a browser.
  - `trailer-cut.md` — the 30-second trailer cut sequence.
  - `build-log.md` — the per-day record of what shipped, what was cut, and what was deferred.
- [`.claude/agents/`](.claude/agents/) — the multi-agent design and build team.
- [`CLAUDE.md`](CLAUDE.md) — the team and workflow reference.

## Stack

TypeScript 5.6 (strict). Pixi.js 8.18. Vite 8 with Rolldown. Native Web Audio API. ESLint flat config + Prettier. The slice ships with exactly one runtime dependency, `pixi.js`. No analytics, telemetry, or remote calls after initial asset load — by design.

## What it isn't

- It isn't a deployed game. It runs at `localhost:5173` only.
- It isn't a finished product. The slice is a vertical proof — three nights, one bay, the toy plus the verbs and the soft-drift failure model. Polish (an explicit moonrise sequence, per-phase tinted water, recorded audio) and a rename to a search-clean title are post-slice work.
- It isn't a service. There is no leaderboard, no streak, no daily challenge, no notifications, no in-game share or wishlist surface. Those are listed as a hard ban in `docs/specs/conventions.md` and grep-checked by the reviewer agent.

## Status

The slice is code-complete (commit `7723d1c` on `main`). The browser-required acceptance — culminating in the day-10 stranger test — is the remaining gate. See `docs/specs/build-log.md` for the per-day "Browser-required acceptance" checklists.
