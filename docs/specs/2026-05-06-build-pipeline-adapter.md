---
title: build-pipeline-adapter
date: 2026-05-06
status: draft
phase: 2.5
input_design_spec: docs/specs/2026-05-05-tide-pull-design.md
input_tech_plan: docs/specs/2026-05-06-tech-plan.md
authors: [orchestrator]
---

# Build Pipeline Adapter Plan

## TL;DR

The four deferred agents — `dev`, `qa`, `reviewer`, `planner-triage` — were authored for a Tamagotchi-style React Native repo with a GitHub PR pipeline, a `develop` branch, Jest, Maestro, and a knowledge base. None of that exists in `C:\Dev\gameX`. Every doc they reference is missing; every hook they invoke is missing; the `gh` commands cannot run because there is no remote. This plan rewrites the three that survive the greenfield-local-browser-game context (`dev`, `qa`, `reviewer`), retires the fourth (`planner-triage`) for now, creates the small set of supporting artefacts the new agents need, and defines a tight build loop that runs against the tech-plan's day blocks instead of GitHub issues. Output: three rewritten agent files, four new docs, one retired agent file. After this plan ships, Phase 3 (build) can run.

## Problem

`docs/specs/2026-05-06-tech-plan.md` schedules a 10-working-day vertical slice with concrete day-by-day acceptance criteria, three ⛳ kill-gate checkpoints (day 3 fluid sim, day 5 audio, day 7 trailer), and a final ⛳ stranger-test on day 10. The dev work needs an agent that can act on those day blocks. The four existing agents cannot, because their assumptions look like this:

| Assumption | Reality in `C:\Dev\gameX` |
|---|---|
| `gh issue view {NUMBER}` is the input | No GitHub remote. No issues. |
| `gh pr create --base develop` is the output | No remote, no `develop` branch. |
| `npx jest --forceExit` is the test gate | No Jest, no test suite, by design (tech-plan §1) |
| `npm run lint` / `npx tsc --noEmit` are the quality gates | These will exist after `npm create vite@latest` on day 1 — but the existing dev agent fails before then |
| Hooks at `.claude/hooks/guard_*.py` enforce conventions | `.claude/hooks/` does not exist |
| `docs/CONVENTIONS.md`, `ARCHITECTURE.md`, `ANTI_PATTERNS.md` are the rule sources | None of these exist |
| `docs/knowledge/flows.yaml` and `impact-map.yaml` carry navigation/consumer maps | The knowledge base is post-v0.1 — does not exist |
| Maestro flows on a connected device | This is a browser game; Maestro is an Android E2E framework |
| `Result<T>` pattern, repository layer, parameterised SQL | This is a Pixi/WebGL game with no DB |
| Tamagotchi spec at `docs/superpowers/specs/2026-04-21-tamagotchi-design.md` is source of truth | The source of truth is the Phase-1 design spec at `docs/specs/2026-05-05-tide-pull-design.md` |
| `planner-triage` figures out which PR caused a QA regression | No PRs, no regressions yet, no triage to do |

The existing `dev.md`, `qa.md`, and `reviewer.md` system prompts currently carry a "Pre-D1 note" admitting that `gh` commands will fail until the remote is set up. The note is honest but the rest of the prompt then proceeds as if everything else applies. It does not.

## Goals

1. Rewrite three agents (`dev`, `qa`, `reviewer`) so they execute the tech-plan's day blocks against `C:\Dev\gameX` on this Windows machine, with zero GitHub dependencies.
2. Retire `planner-triage` for the slice. Document the trigger condition for when it comes back.
3. Replace the missing rule docs (`CONVENTIONS.md`, `ARCHITECTURE.md`, `ANTI_PATTERNS.md`, `security.md`) with one tight greenfield-local equivalent that the agents reference.
4. Define a manual feel-test protocol that replaces Jest — the tech-plan's "stranger plays unprompted ≥60s" is the canonical test, and the QA agent needs a runbook for it.
5. Define a code-review checklist scoped to this stack (Pixi v8 + TS + Vite + native Web Audio + ethics ban list + reduce-motion / contrast / clip-render).
6. Keep the agent set small. No new agents. Three rewrites, one retirement, four new docs.
7. Preserve every hard ethics constraint from design-spec items 21–33. The reviewer agent's checklist enforces them by absence (no analytics SDK, no notification call, no leaderboard module, no in-game share UI).
8. The plan ships *before* day 1 of the build phase. Phase 3 cannot start until the three new agent files exist and the four new docs exist.

## Non-goals

1. Not a CI pipeline. Solo dev, two weeks, local browser game — there is no automated build, no GitHub Actions, no test runner gating commits.
2. Not a Maestro / device-testing replacement. The slice is desktop-browser-only; mobile / touch is non-goal #8 of the design spec.
3. Not a knowledge base (`flows.yaml` / `impact-map.yaml`). The codebase will be small enough through the slice that grepping is cheaper than maintaining a graph.
4. Not a security review module. There is no auth, no DB, no network calls after asset load (tech-plan §3 acceptance criterion #8). The threat surface is already minimised by stack choice.
5. Not a friction-log mechanism. The friction log was a Tamagotchi-era pattern for tuning a long-running pipeline; for a 10-day slice the build-log captures the same information at the same cost.
6. Not a multi-developer review flow. Solo dev means the reviewer agent is the only second pair of eyes — no PR comments, no re-review loops, no merge gating.

## Adapter — per agent

### `dev` agent — rewrite (keep most of the rewrite shape; replace input, output, and gates)

#### Keep
- The "Pipeline Execution Mode" idea: execute immediately, do not pause for confirmation.
- The "scope creep is forbidden" rule: only work on the assigned task; note unrelated problems instead of fixing them.
- The "self-review against production concerns" pre-handoff check, narrowed to this stack.

#### Replace

| Was | Becomes |
|---|---|
| Input: `gh issue view {N}` | Input: a tech-plan day reference like `tech-plan day 4` or a free-form task block. The orchestrator (or the user) hands the agent the day block as a prompt — that block contains build description, dependencies, "done when", and cost. |
| Branch: pre-created by pipeline | Branch: there is one branch (`main` or whatever the user names it locally). The agent commits directly to it. No PRs. Use `git init` on day 0 if it isn't already a git repo. |
| Tests: `npx jest --forceExit` | Tests: `npx tsc --noEmit` and `npm run lint` (both shipped by the Vite scaffold) — these run as the dev agent's pre-commit gate. Manual feel-test happens in the QA agent's run, not here. |
| Output: `gh pr create` + `gh issue comment` | Output: a commit on the local branch (no push), plus a short note appended to `docs/specs/build-log.md` describing what was built, what was cut, and any deferred items. |
| Doc references: CONVENTIONS / ARCHITECTURE / ANTI_PATTERNS / security / knowledge / Tamagotchi spec | Doc references: `docs/specs/2026-05-06-tech-plan.md` (the build map), `docs/specs/2026-05-05-tide-pull-design.md` (acceptance criteria + ethics ban list), and the new `docs/specs/conventions.md` (this stack's rules — see Supporting Artefacts below). |
| Maestro draft section | Deleted. Browser game. |
| Colour-token rules section (RN-specific) | Deleted. Cosy palette is in the day-2 motion-and-colour bible; the agent reads that. |
| "Documentation Updates" section | Replaced: append to `build-log.md` and update `docs/specs/conventions.md` only if a new pattern is introduced. The design spec and tech-plan are immutable Phase-1/Phase-2 artefacts; the agent does not edit them. |
| `gh` MCP / GitHub MCP | Deleted from "Available Tools". |
| Hooks: `guard_protected_files.py`, `guard_anti_patterns.py`, `guard_branch.py` | Deleted from frontmatter. No hooks in this project. The reviewer agent enforces conventions instead — at human review time, not at write time. |

#### New rules specific to this stack

- **No new runtime dependencies without an explicit nod in the build-log entry.** The slice ships with `pixi.js` only (and `howler` only if exercised). Adding any third dep needs a one-line justification.
- **No telemetry / analytics / Sentry / GA / Plausible / PostHog / network calls after initial asset load.** Verify by checking DevTools Network tab is empty after assets resolve (tech-plan §3 acceptance #8).
- **The cursor must be a Pixi `Sprite`, never a CSS-driven element.** Clip-render acceptance depends on this.
- **All animations must respect `prefers-reduced-motion`** per the swap rules in design-spec §11.
- **Motion timings come from the day-2 motion-and-colour bible, not from feel.** Pull response ≤100ms; ramp 200–400ms; snap-back 400–800ms ease-out.

#### Tools list (frontmatter)

`Bash, Read, Write, Edit, Grep, Glob` — same as before. Drop the GitHub MCP reference. Drop the hook frontmatter block.

#### Output signal

```
DEV_RESULT: DAY_{N}_COMPLETE | DAY_{N}_BLOCKED
DAY_REF: tech-plan day {N}
COMMITS: {short-sha-list}
BUILD_LOG: docs/specs/build-log.md
```

If `BLOCKED`, include `BLOCKER: {one sentence}`.

---

### `qa` agent — rewrite (this is the biggest reshape; the role changes from "Jest analyst" to "feel-tester + acceptance verifier")

#### Keep
- The "report results, do not fix" boundary.
- The "find regressions, document them, file them" stance — but in this context "filing" means appending to `build-log.md`, not opening GitHub issues.

#### Replace

| Was | Becomes |
|---|---|
| Input: pipeline-provided Jest results + PR number + issue number | Input: a tech-plan day reference, plus the design spec's acceptance criteria for whatever was just built. Optional: a fresh Windows browser load (Edge or Chrome). |
| Test source: `src/__tests__/` Jest files | Test source: this agent does not write code. It runs the dev server (`npm run dev`), opens the browser, and exercises the acceptance criteria for the day. |
| Maestro flows | Deleted. |
| testID requests | Deleted. No React, no testID concept. |
| Knowledge-base lookups (`flows.yaml`, `impact-map.yaml`) | Deleted. Codebase is small; grep covers it. |
| `gh issue create` for regressions | Append a regression entry to `docs/specs/build-log.md` under a `## Regressions` heading. The dev agent picks them up on the next run. |
| Doc references: TESTING / SECURITY / Tamagotchi spec / knowledge | Doc references: `docs/specs/2026-05-05-tide-pull-design.md` (acceptance criteria), `docs/specs/2026-05-06-tech-plan.md` (day acceptance), and the new `docs/specs/feel-test-protocol.md`. |

#### New rules specific to this stack

- **The canonical QA test is the stranger test from tech-plan day 10.** Every prior day's QA pass is a partial dry run of it. After day 3, run a 60-second sandbox feel-test on the latest build. After day 4, play Night 1 end-to-end. After day 6, play Nights 1–2. After day 7, play Nights 1–3. The dev agent's local commit is "done"; QA validates against the day's acceptance criteria.
- **The agent must run the feel-test on this Windows machine, in a real browser, with sound on.** Reading code is not a substitute. If the agent cannot execute `npm run dev` and load the page, it returns `QA_RESULT: BLOCKED` rather than guessing.
- **Each QA pass produces a feel-test report block in `build-log.md`** following the protocol's template (see Supporting Artefacts).
- **WCAG 1.4.11 contrast audit on day 9** is owned by this agent. Sample the worst-case water tile per phase, check ≥3:1 against every interactive sprite. Tooling: any in-browser colour picker plus a contrast ratio calc; or the WAVE / axe DevTools extensions if installed.
- **Reduce-motion verification on day 9** is owned by this agent. Toggle Windows OS-level reduce-motion mid-session, observe behaviour swaps per design-spec §11.
- **Clip-render verification on day 9 + day 7** is owned by this agent. Run OBS on a "Window Capture" source for the browser; record 5–10 seconds; confirm the moon-cursor renders in every frame of the recording.
- **Ethics ban-list check** on every QA pass: open DevTools → Network tab, confirm no fetches/xhrs after asset resolve; open DevTools → Application → Local Storage, confirm only the `tide-pull/save/v1` key exists; visually scan UI for any wishlist/follow/share button (there shouldn't be one).

#### Tools list

`Bash, Read, Write, Edit, Grep, Glob` — same. Drop GitHub MCP. Drop hook frontmatter.

#### Output signal

```
QA_RESULT: PASSED | PASSED_WITH_NOTES | REGRESSIONS_FOUND | BLOCKED
DAY_REF: tech-plan day {N}
ACCEPTANCE_CRITERIA_PASSED: {count}/{total}
REGRESSIONS: {one-line summaries or "none"}
NOTES: {anything subtle the dev agent should know}
```

---

### `reviewer` agent — rewrite (read-only stays; checklist swaps wholesale)

#### Keep
- The read-only constraint.
- "Do not rewrite code; point out what needs to change" boundary.
- "If conventions are ambiguous, approve and note it."
- The post-`/code-review` deduplication discipline (don't repeat what the plugin already flagged).

#### Replace

| Was | Becomes |
|---|---|
| Input: `gh pr diff {N}` + `gh issue view {N}` | Input: `git diff main` (or `git diff HEAD~1` after the dev agent's commit), plus the day block from the tech-plan. The reviewer reads what the dev agent just shipped, against what the day was meant to ship. |
| Verdict via `gh pr review --approve` / `--request-changes` | Verdict appended to `build-log.md` under a `## Reviews` heading: `APPROVED` or `CHANGES_REQUESTED` plus specific actionable feedback. The dev agent reads this on the next run if changes were requested. |
| Maestro / testID / Jest checklist items | Deleted. |
| Knowledge-base currency checks | Deleted. |
| Anti-patterns reference | Replaced with the new `docs/specs/conventions.md` anti-patterns section (see Supporting Artefacts). |
| Tamagotchi spec reference | Replaced with the design spec at `docs/specs/2026-05-05-tide-pull-design.md` for acceptance-criteria fit. |

#### New checklist (the whole thing)

**Tech-plan acceptance fit**
- Does the diff match the day block's "Done when"?
- Are P3-cuts noted in `build-log.md` rather than smuggled silently?
- Is scope creep present (anything not in the day block)?

**Stack discipline**
- Cursor is a Pixi `Sprite`, not CSS.
- Animations gated on `matchMedia('(prefers-reduced-motion: reduce)')` where required.
- All timings sourced from the motion-and-colour bible; no magic numbers.
- TypeScript strict; no `any` slipped in.
- No new runtime dependencies (or a justified note in `build-log.md` if there is one).

**Ethics ban list (design-spec items 21–33)**
- No streak counter, calendar grid, leaderboard, or share/wishlist UI in the build.
- No notification, push, email, or banner code paths.
- No analytics / telemetry / Sentry / GA / Plausible / PostHog imports.
- No real-money / IAP / cosmetic-purchase code.
- No real-world date check or real-lunar-phase check (only the abstracted in-game cycle).
- No `localStorage` keys other than `tide-pull/save/v1`.
- No `fetch` / `XMLHttpRequest` / `WebSocket` calls after initial asset load.
- No "bays played" lifetime counter, attempts counter, or completion tick UI.

**A11y / craft**
- Reduce-motion swap rules implemented per design-spec §11.
- Cursor-in-frame on captured video (clip-render acceptance).
- WCAG 1.4.11 contrast audit deferred to day 9 — flag if it appears earlier and is wrong.

**Code shape**
- File layout matches tech-plan §2 (`src/state`, `src/level`, `src/sim`, `src/render`, `src/input`, `src/audio`, `src/scenes`, `src/verbs`, `src/a11y`).
- No business logic in `main.ts` beyond bootstrapping.
- One state object, one save key, one level loader — no parallel implementations sneaking in.

#### Tools list

`Read, Grep, Glob, Bash` — same as before. Drop GitHub MCP. `permissionMode: default` stays.

#### Output signal

```
REVIEW_RESULT: APPROVED | CHANGES_REQUESTED
DAY_REF: tech-plan day {N}
COMMIT: {short-sha}
NOTES: {one short paragraph}
```

---

### `planner-triage` agent — retire for the slice

This agent's only job is figuring out which PR caused a QA regression so the right author re-opens the right ticket. With:

- one developer,
- no PRs,
- regressions surfaced in `build-log.md` and picked up on the next dev run,
- a 10-day total schedule,

…there is nothing for `planner-triage` to triage. **Recommendation:** delete `.claude/agents/planner-triage.md`. Re-add when (a) the codebase has more than one contributor, (b) a `develop` branch and PR pipeline exist, and (c) regressions are filed against PRs rather than against day blocks.

If the user prefers to keep it on disk for reference, leave the file but mark it `status: archived` in a note at the top, and remove its Tools entry so it cannot be invoked.

---

## Supporting artefacts to create

Four short docs. Each is a tight working artefact, not a polished spec.

### 1. `docs/specs/conventions.md` — stack rules

The single source of code conventions for this slice. Replaces all of CONVENTIONS / ARCHITECTURE / ANTI_PATTERNS / security.

**Sections:**
- **Stack** — TS strict, Pixi v8, Vite 8, native Web Audio, localStorage. From tech-plan §1.
- **Layout** — file paths under `game/src/`. From tech-plan §2.
- **Naming** — kebab-case for files, PascalCase for types, camelCase for functions/vars.
- **Imports** — relative within `src/`; no path aliases until they earn their keep.
- **State** — one object in `gameState.ts`, mutated via named functions.
- **Save** — one localStorage key, `tide-pull/save/v1`, single JSON blob, no other keys.
- **No-go list** — every item from the ethics ban list (21–33) restated as a code rule.
- **Anti-patterns** — initial empty section. Populated as the slice progresses; reviewer adds entries when patterns emerge.
- **No-comment policy** — code comments only when the *why* is non-obvious (matches Claude Code default).

**Length target:** under 200 lines. This doc is read every dev run; bloat punishes immediately.

### 2. `docs/specs/feel-test-protocol.md` — the QA runbook

How the QA agent (and the dev when self-testing) executes the canonical "play it" tests.

**Sections:**
- **Setup** — `npm run dev`, open `http://localhost:5173/` in Edge or Chrome (latest), full-screen the browser, sound on.
- **The 60-second sandbox test** — load the page, do nothing else, hold the press for various durations on various tiles, release, repeat. Pass criterion: you want to keep going at second 60.
- **The single-night test** — pick night N, play it end-to-end, observe the held-success beat, observe soft-drift if you trigger it. Pass criterion: matches the day's acceptance.
- **The full-slice test** — three nights, one session. Pass criterion: 8–12 minutes total, clean exit after night 3, no fail screens, no pop-ups, no on-screen text other than three title cards.
- **The reduce-motion test** — Windows Settings → Accessibility → Visual effects → Animation effects toggle off. Reload page. Verify swaps per design-spec §11. Toggle back on mid-session. Verify response.
- **The clip-render test** — OBS, Window Capture, record 10 seconds of any night. Open the recording. Confirm the moon-cursor is in every frame.
- **The contrast test (day 9)** — sample the darkest cell of the heightmap palette per phase, run a contrast checker against every interactive sprite colour. Document failures.
- **The ethics-perimeter sweep (every QA run)** — DevTools Network tab empty after asset resolve; localStorage has only `tide-pull/save/v1`; no share/wishlist UI in the build.
- **Report template** — the QA agent writes a feel-test entry into `build-log.md` using this template.

**Length target:** under 150 lines.

### 3. `docs/specs/build-log.md` — the working log

Append-only working log. Created empty on day 0. The dev, QA, and reviewer agents append entries here.

**Initial structure:**
```markdown
# Build Log — Tide / Pull Vertical Slice

## Day 0 — bootstrap
*(populated by dev agent on first run)*

## Reviews
*(populated by reviewer agent)*

## Regressions
*(populated by QA agent)*

## P3 cuts taken
*(populated by dev/QA agents as cuts are exercised)*
```

Each agent's section format is defined in its own system prompt. Solo dev means one log; multi-agent means three writers, but no contention if each appends to its own subsection.

### 4. `docs/specs/motion-and-colour-bible.md` — authored by dev on day 2

Per tech-plan day 2 build item. Transcribes design-spec §8 (motion timings), §3 (lunar variants), §4 (cursor variants), and §10 (title-card typography) into a single doc the dev agent reads each subsequent day. Created by the dev agent itself; this plan only schedules its existence.

---

## Workflow shape (the new build loop)

The Tamagotchi pipeline was: **issue → dev → push → QA → reviewer → merge → next issue.**

The greenfield local slice loop is: **day block → dev → QA → reviewer → next day block.** All within `C:\Dev\gameX`. No remote.

Concretely, for any given tech-plan day:

1. **Orchestrator** (or user) hands the dev agent the day block from `docs/specs/2026-05-06-tech-plan.md`.
2. **Dev agent** implements the day's scope. Runs `npx tsc --noEmit` and `npm run lint`. Commits locally on `main`. Appends a build-log entry under `## Day N`.
3. **QA agent** runs the feel-test protocol against the day's acceptance criteria. Appends a feel-test entry. Returns `PASSED` / `PASSED_WITH_NOTES` / `REGRESSIONS_FOUND` / `BLOCKED`.
4. **Reviewer agent** reads the diff against the day block. Appends a review entry. Returns `APPROVED` / `CHANGES_REQUESTED`.
5. If any of QA / reviewer returns changes/regressions, dev runs again. Otherwise, advance to the next day block.
6. **⛳ checkpoints from the tech-plan** (day 3 fluid sim, day 5 audio, day 7 trailer, day 10 stranger test) trigger an additional **user checkpoint** — the orchestrator pauses and shows the user what was built before the next day starts.

This is a tight three-agent loop, no PRs, no remote, no merge step. Day completes when QA passes and reviewer approves.

## Order of work (before Phase 3 build can start)

These are the steps to ship this adapter plan. Approximate order; some can run in parallel.

1. **Approve this plan** (user checkpoint).
2. **Rewrite `.claude/agents/dev.md`** per the dev section above. Around 80–120 lines, down from 154.
3. **Rewrite `.claude/agents/qa.md`** per the qa section above. Around 80–120 lines, down from 145.
4. **Rewrite `.claude/agents/reviewer.md`** per the reviewer section above. Around 80–100 lines, down from 129.
5. **Delete `.claude/agents/planner-triage.md`** (or archive it with the status note).
6. **Write `docs/specs/conventions.md`** as described.
7. **Write `docs/specs/feel-test-protocol.md`** as described.
8. **Create empty `docs/specs/build-log.md`** with the initial four-heading scaffold.
9. **`git init` if not already a repo**, first commit captures the docs and adapted agents. (Optional but lets the dev/reviewer agents diff against history from day 1.)
10. **Update `CLAUDE.md`** to reflect the new workflow shape. The "Deferred (Tamagotchi-pipeline assumptions, will adapt later)" table can collapse to a one-line "build pipeline adapted, see `docs/specs/2026-05-06-build-pipeline-adapter.md`." The "Five-phase workflow" table gains real Phase 3 / Phase 4 entries pointing at the new agent set.
11. **Phase 3 build can start.** Day 1 of the tech-plan is the dev agent's first task.

Steps 2–8 can run in parallel; nothing depends on a sibling step. The `CLAUDE.md` update (step 10) should land last so it accurately reflects what now exists.

## Risks

1. **The new agent prompts drift from the tech-plan during build.** *Medium × medium.* Mitigation: the dev/QA/reviewer prompts each link to the tech-plan and design spec by absolute path; the build-log captures any divergence; the orchestrator reads the build-log between days.
2. **The "no automated tests" call bites at week 2.** *Low × medium.* The slice is small and feel-driven; automated tests would not have caught a feel regression anyway. If a non-feel regression class emerges (e.g. the level loader corrupts state on save/load), the dev agent adds a single Vitest spec for that one path. Promote `vitest` to a runtime dep only if exercised.
3. **Reviewer-without-second-author is a code-review degenerate case.** *Medium × low.* The reviewer agent reading a diff against the tech-plan's day block is more rigorous than self-review but less than human peer review. Mitigation: the day-3, day-5, day-7, day-10 user checkpoints are the human review cadence.
4. **The user wants to add features mid-build.** *Medium × medium.* The dev agent's "scope creep is forbidden" rule plus the tech-plan's day blocks make scope drift visible. Off-day requests append to a `## Out of scope` section in `build-log.md` rather than getting silently absorbed.
5. **`planner-triage` retirement is premature if the slice splits across multiple sessions.** *Low × low.* The agent file is one re-add away if needed.
6. **Conventions doc grows unchecked.** *Medium × low.* The 200-line target is the fence. The reviewer agent flags it if it sprawls past that.

## What's not covered

- **Hooks (`.claude/hooks/`).** The Tamagotchi-era guard hooks (`guard_protected_files.py`, `guard_anti_patterns.py`, `guard_branch.py`, `guard_roles.py`) are not being ported. Reasoning: they enforce conventions at write-time; the reviewer agent enforces them at review-time, which is sufficient for a 10-day slice. If specific hooks earn their keep mid-build, add them in the moment.
- **Knowledge base (`docs/knowledge/`).** Out per Goal 6. Codebase grep is the lookup mechanism for the slice.
- **`docs/superpowers/`.** Tamagotchi-specific path. Not recreated.
- **Friction log.** Replaced by inline build-log entries.
- **GitHub MCP / `gh` CLI integration.** No remote.
- **Maestro / device testing.** Browser game; non-goal.
- **Multi-agent contention on `build-log.md`.** Solo dev. Each agent appends to its own subsection. If we ever go multi-agent-parallel, reach for a YAML index or one-file-per-day instead.
- **A "Phase 4 — QA polish" pass post-slice.** This adapter plan covers in-loop QA only. After day 10 the slice is either done (stranger test passes) or has named gaps (build-log captures them). Whether to keep iterating, ship, or hand off is a user call at the day-10 checkpoint.

---

*End of plan.*
