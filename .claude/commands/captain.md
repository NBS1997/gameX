You are running the **Captain** ralph-loop orchestration. This is Phase 4 of the gameX workflow — the post-build, autonomous loop that runs after the dev/qa/reviewer day blocks have built the slice. Do not delegate this to a subagent — you are the orchestrator yourself.

The canonical invocation is `/loop /captain` (composing with the superpowers `loop` skill in dynamic mode). The command does **one cycle** then self-paces the next via `ScheduleWakeup`. Running `/captain` directly (without `/loop`) is supported for single-cycle smoke tests.

The argument fence below is for an optional user nudge — typically empty. If non-empty, treat it as a constraint or focus hint that biases the cycle (e.g. "focus on audio polish only", "pivot ban — do not surface PIVOT this cycle").

---
$ARGUMENTS
---

## North-star vs. actual

`/captain` does not name its own objective. The objective is whatever the upstream pipeline already wrote into `docs/specs/`:

- **North-star** — `docs/specs/<...>-premise.md`, `docs/specs/<...>-design.md`, `docs/specs/<...>-tech-plan.md`.
- **Actual** — `docs/specs/build-log.md`, the working code under `game/`, recent `git log`.

Each cycle reads both, retros the gap, picks one next-best step, executes it, verifies, then schedules the next cycle.

> **WATCH-OUT.** This loop has no hard cycle cap and no no-progress detection. The user explicitly declined both during brainstorming on 2026-05-06. Stop conditions are: ship-ready quorum, pivot trigger, or `/halt`. If the loop ever appears to spin (e.g. same `NEXT_STEP` two cycles in a row with no commits between), surface that observation in the next cycle log entry and consider proposing a cap to the user — but do not unilaterally add one.

## Per-cycle anatomy (six stages, no human gates inside a cycle)

### Stage 1 — Read state

In this order, using Read/Glob/Bash:

1. The most recent `docs/specs/*-premise.md`.
2. The most recent `docs/specs/*-design.md`.
3. The most recent `docs/specs/*-tech-plan.md`.
4. Last 100 lines of `docs/specs/build-log.md` (use Read with `offset` and `limit`).
5. `docs/specs/forward-log.md` if it exists (full file — it's the only place the loop's own history lives).
6. `git log --oneline -20`.

This is the **north-star + actual** snapshot for the cycle. Hold it in your context — it's the input to Stage 2.

### Stage 2 — Retro fan-out (parallel)

Dispatch **eight parallel Agent calls in a single message**:

- `storyboarder`
- `gamification-designer`
- `habit-formation`
- `ux-designer`
- `pm`
- `product-strategist`
- `qa-agent` (build-quality lens)
- `reviewer` (code-correctness lens)

Each prompt must include:

1. The Stage-1 snapshot (or pointers to the files plus the `git log` excerpt — pointers are fine; the agents have Read).
2. An explicit instruction to return EXACTLY this format and nothing else:

```
GAP: <one sentence: where 'shipped' diverges from 'specced'>
NEXT_STEP: <one concrete next action, single sentence>
KIND: BUG_POLISH | NEW_FEATURE | SHIP_READY | PIVOT
RATIONALE: <2-3 sentences>
URGENCY: 1-5  (5 = blocks ship-ready)
SHIP_READY_VOTE: YES | NO
AGENT: <name>
```

If any specialist's output fails this schema, re-dispatch only that specialist with a format reminder. Do not paper over.

If eight parallel tool calls in one message hits a ceiling, fall back to two consecutive batches of four parallel calls. Do not dispatch sequentially.

### Stage 3 — Convergence + pick

Tally the eight memos in this order:

1. **Ship-ready check.** If ≥ 6 of 8 voted `SHIP_READY_VOTE: YES`, fire **Stop condition #1** (see "Stop conditions" below). Skip the rest of this cycle.
2. **Pivot check.** Else if any `KIND: PIVOT` came from `pm` or `product-strategist`, fire **Stop condition #2**. Skip the rest.
3. **Cluster + score.** Else, cluster semantically-equivalent `NEXT_STEP`s — when in doubt, treat as separate clusters. Score each cluster by mean `URGENCY` of its members. Pick the highest-scoring cluster. Ties broken first by `pm`'s urgency, then by which cluster `product-strategist` is in.

The `NEXT_STEP` text from the chosen cluster becomes "the step". The most-common `KIND` in the cluster becomes "the kind".

### Stage 4 — Sanity gate

If the chosen cluster is split on `KIND`, degrade per this table. No human-in-loop, but record a `SANITY_FLAG` in the cycle log so the trade-off is visible.

| Disagreement | Degrade to | Reason |
|---|---|---|
| `BUG_POLISH` ↔ `NEW_FEATURE` | `BUG_POLISH` | Lighter; if it really was a new feature, next cycle re-surfaces it. |
| `BUG_POLISH` ↔ `SHIP_READY` | `BUG_POLISH` | Don't ship over an unresolved bug. |
| `NEW_FEATURE` ↔ `SHIP_READY` | `SHIP_READY` | Slice is converging; let next cycle re-evaluate. |
| Anything ↔ `PIVOT` | Halt loop (Stop #2) | `PIVOT` is dominant — surface to human. |

### Stage 5 — Execute (route by kind)

Run the stack for the chosen kind. See "Step-kind routing" below for the exact sequence.

### Stage 6 — Verify + log + schedule

This is the **cycle-level** final gate, run regardless of which stack executed in Stage 5. Distinct from any per-stack QA inside Stage 5; this asks "did the stack leave the codebase clean?", not "did the change itself pass QA".

1. Run automatable checks from `game/`:
   - `npx tsc --noEmit` (must exit 0).
   - The automatable subset of `docs/specs/feel-test-protocol.md` (forbidden-SDK grep, outbound-network grep, dark-pattern-string grep, runtime-deps check).
2. **If checks fail:** log the failure under `verification: FAIL — <one-line summary>` and **still call `ScheduleWakeup`**. The next cycle will surface the broken state as the highest-urgency `BUG_POLISH`.
3. Append a cycle entry to `docs/specs/forward-log.md` (append-only; create the file with frontmatter on first cycle if absent — see "forward-log format" below).
4. Call `ScheduleWakeup` with `prompt = "/loop /captain"` and `delaySeconds` per the heartbeat heuristics.

## Step-kind routing — the superpowers composition

### `BUG_POLISH` (defect or craft pass on existing systems)

1. Invoke `Skill(superpowers:systematic-debugging)`. Follow it on the gap — root-cause the issue before fixing.
2. Invoke `Skill(superpowers:test-driven-development)`. Write a regression check (or a feel-test-protocol bullet) BEFORE dispatching the fix.
3. `Agent(dev-agent)` once, with the diagnosis + the failing check.
4. `Agent(qa-agent)` to verify via `feel-test-protocol.md`.
5. `Agent(reviewer)` to review the diff.
6. Invoke `Skill(superpowers:verification-before-completion)`. Produce evidence (tsc clean, qa pass, reviewer pass) before logging the cycle.

### `NEW_FEATURE` (a gap that genuinely needs design — heaviest)

1. Invoke `Skill(superpowers:brainstorming)`. Explore intent against the existing design spec. The skill's hard-gate "user approval before implementation" is fulfilled by the eight-specialist parallel ratification already performed in Stage 3 — note this substitution explicitly in the cycle log so the deviation from the skill's letter is traceable.
2. **Slim council.** Single message, six parallel Agent calls — `storyboarder`, `gamification-designer`, `habit-formation`, `ux-designer`, `pm`, `product-strategist` (no qa/reviewer). Each returns a one-page memo on the feature. Synthesise into `docs/specs/forward-feature-<n>.md` (use the next available `<n>`). **No R2/R3 — the next loop cycle is the critique.**
3. Invoke `Skill(superpowers:writing-plans)`. Turn the mini-design into an executable plan (under `docs/specs/`, named `forward-feature-<n>-plan.md`).
4. Invoke `Skill(superpowers:executing-plans)` (or `superpowers:subagent-driven-development` if the plan has independent parallel pieces). Drive execution, dispatching `dev-agent` per plan step.
5. After each plan step: `Agent(qa-agent)` + `Agent(reviewer)`.
6. Invoke `Skill(superpowers:requesting-code-review)`. Final review pass before logging the cycle.

### `SHIP_READY` (packaging + comms; no new code)

1. `Agent(documentation-writer)` to produce/update README, HOW-TO-PLAY, itch.io page copy, trailer beats.
2. Invoke `Skill(superpowers:verification-before-completion)`. Verify: artefacts named in the design spec exist; the slice runs cleanly from a fresh `npm install` in `game/`; README reflects current state.
3. Invoke `Skill(superpowers:finishing-a-development-branch)`. Produces the final "ready to ship" summary content for Stop #1's summary file.

### `PIVOT` (halt-and-surface only)

1. Write `docs/specs/<YYYY-MM-DD>-pivot-recommendation.md` with: the council's reasoning, which specialists dissented and on what, and 2–3 proposed alternative directions (drawn from the dissents). Include the verbatim memos from `pm` and `product-strategist` (the two specialists allowed to trigger this stop).
2. Halt the loop (Stop #2). **Do NOT auto-pivot** — pivots are human decisions. Do not call `ScheduleWakeup`.

## Stop conditions

| # | Condition | Action |
|---|---|---|
| 1 | ≥ 6 of 8 specialists vote `SHIP_READY_VOTE: YES` in Stage 3 | Write `docs/specs/<YYYY-MM-DD>-ship-ready-summary.md` (use the `finishing-a-development-branch` output if `SHIP_READY` stack ran this cycle, otherwise summarise inline). Append final log entry. Print the SHIP_READY completion signal. Do NOT call `ScheduleWakeup`. |
| 2 | `KIND: PIVOT` from `pm` or `product-strategist` (Stage 3 step 2), or sanity gate degrades to `PIVOT` (Stage 4) | Run the `PIVOT` stack. Append final log entry. Print the PIVOT_RECOMMENDED completion signal. Do NOT call `ScheduleWakeup`. |
| 3 | User `/halt` | Handled natively by `/loop`. On the next firing (if any), detect that `/halt` was issued and write a "halted at cycle N" log entry. Print the HALTED_BY_USER completion signal. |

## Heartbeat — `ScheduleWakeup` heuristics

`prompt` is always `"/loop /captain"`.

`delaySeconds`:

- `BUG_POLISH`, `SHIP_READY` cycle (fast): **270s**. Under the 5-minute cache TTL, so the next cycle runs cache-warm.
- `NEW_FEATURE` cycle (heavy — ran the slim council + plan + execute): **1200–1800s**. Already paid the cache miss; amortise.
- Verification failed in Stage 6: **270s**. Get back to it quickly; the next cycle will fix the regression.

`reason` should be specific — e.g., `"after BUG_POLISH cycle 4 — fixed oarlock click latency"`. Generic "next cycle" is not acceptable.

Halt cycles do NOT call `ScheduleWakeup`. The completion signal is the terminator.

## forward-log format

If `docs/specs/forward-log.md` does not exist on the first cycle, create it with this frontmatter and a one-line preamble:

```markdown
---
title: forward-log
date: <YYYY-MM-DD>
status: working (append-only)
phase: 4
authors: [captain]
---

# Forward Log — Phase 4 ralph cycles

Append-only working log for Phase 4. Each cycle of `/captain` appends one entry below.

## Cycles
```

Each cycle entry, appended under `## Cycles`:

```markdown
### Cycle <N> — <YYYY-MM-DD>
- **Kind:** BUG_POLISH | NEW_FEATURE | SHIP_READY | PIVOT
- **Step:** <one-line description>
- **Vote tally:** ship-ready <X>/8; pivot <Y>/8; <kind-distribution>
- **Stack:** <list the skills + agents that ran>
- **Verification:** PASS | FAIL — <one-line summary>
- **Sanity flags:** <none | SANITY_FLAG: <description>>
- **Commit:** <hash if any, else "no code change">
- **Next wakeup:** <delaySeconds>s OR "halt — <reason>"
```

## Constraints during orchestration

- **Australian English** in your own framing text, synthesis, and log entries.
- **Parallel dispatch, always.** Stage 2's eight Agent calls go in one message. The slim council inside `NEW_FEATURE` Stage 5 puts six Agent calls in one message. Sequential dispatch is a bug.
- **Ethics perimeter holds.** The `habit-formation` specialist applies the same dark-pattern ban list as in `/creative-council`. If any cycle's chosen step would cross the perimeter, the cycle must record the trade-off explicitly in the log entry under `Sanity flags`. If `habit-formation` itself proposes something that crosses the perimeter, re-dispatch with a reminder.
- **Neutral-sibling framing** in any rare user-facing text (e.g. the SHIP_READY summary or the PIVOT recommendation). No "recommended" labels. No token-cost callouts.
- **No silent pivots.** PIVOT always halts. Never auto-execute a pivot.
- **No runaway protection by design choice.** See WATCH-OUT above. If the loop spins, the user is expected to `/halt`.

## Completion signals

Print exactly one of these at the end of every firing.

Cycle continuing:

```
FORWARD_CYCLE: <N>
FORWARD_KIND: <BUG_POLISH | NEW_FEATURE | SHIP_READY | PIVOT>
FORWARD_STEP: <one-line description>
NEXT_WAKEUP: <delaySeconds>
```

Halt — ship-ready:

```
FORWARD_RESULT: SHIP_READY
SUMMARY_PATH: docs/specs/<YYYY-MM-DD>-ship-ready-summary.md
```

Halt — pivot:

```
FORWARD_RESULT: PIVOT_RECOMMENDED
PIVOT_PATH: docs/specs/<YYYY-MM-DD>-pivot-recommendation.md
```

Halt — user:

```
FORWARD_RESULT: HALTED_BY_USER
LOG_PATH: docs/specs/forward-log.md
```
