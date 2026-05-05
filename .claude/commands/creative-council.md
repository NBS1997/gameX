You are running the **Creative Council** orchestration. Do not delegate this to a subagent — you are the orchestrator yourself.

The premise is below between the fence markers. It typically arrives via `/concept-pitch` (which writes the chosen premise to `docs/specs/YYYY-MM-DD-premise.md`) or directly from the user. The entire flow you run must serve this premise.

---
$ARGUMENTS
---

## The six specialists

All six live in `.claude/agents/` and are dispatched via the Agent tool with their kebab-case name as `subagent_type`:

- `storyboarder` — emotional-arc framing, scene-by-scene
- `gamification-designer` — loops, feedback, pacing, juice
- `habit-formation` — ethical re-engagement, natural triggers
- `ux-designer` — composition, readability, motion, a11y
- `pm` — prioritisation, scope, acceptance-criteria
- `product-strategist` — positioning, category, wedge

## Flow

The flow runs **three rounds by default** (Round 1 take → Round 2 critique → Round 3 ratify/dissent), with one optional Round 4 (final critique) triggered only if Round 3 produces dissent and the user asks for it. Two user checkpoints: one after Round 1, and one after Round 3 *only if* dissents remain. Hard cap: 4 rounds total.

### Phase 1 — Round 1 fan-out (parallel)

Dispatch all six specialists in a **single message with six parallel Agent tool calls**. Each call uses:

- `subagent_type: "<agent-name>"`
- `prompt`: includes (a) the premise above, (b) any additional context the user supplied, (c) an explicit instruction to produce a Round 1 memo in the five-section format defined by the agent's system prompt.

Wait for all six to return. Save their memos — you will need to feed all of them back in Phase 3 and (if invoked) Phases 5 and 7.

### Phase 2 — Organised findings + user checkpoint #1

Read all six Round 1 memos and write an **Organised Findings** synthesis with these sections:

- **Recurring themes** — where ≥ 2 specialists converged.
- **Tensions** — where specialists conflicted, and on what.
- **Blind spots** — things no specialist raised that you notice as orchestrator.
- **Open questions for the user** — anything that needs user input before Round 2.

Show the synthesis to the user. **Stop. Do not proceed to Phase 3 until the user explicitly approves or redirects.**

If the user redirects, incorporate the redirection into the Phase 3 dispatch.

### Phase 3 — Round 2 critique (parallel)

Dispatch all six specialists again, in a single message with six parallel Agent tool calls. Each call's prompt must include:

1. The original premise.
2. The Organised Findings synthesis from Phase 2 (after any user redirection).
3. **All five other specialists' Round 1 memos in full** — each specialist must see the five they didn't write, not just the synthesis. This is what makes the mechanic work.
4. An instruction to produce a Round 2 critique in the three-section format (Where I concede / Where I hold the line / Revised recommendations).

Wait for all six to return.

### Phase 4 — Draft Consensus (no checkpoint)

After Round 2, write a **Draft Consensus** distilling where the council has landed. Use these sections:

- **Converged recommendations** — the ranked list the council collectively endorses, drawn from Round 2 revised recommendations.
- **Open dissents** — material disagreements still standing after Round 2 (cite which specialists hold them).
- **Confidence** — your read on how settled this is, on a 1–5 scale, with one sentence of reasoning.

Show the Draft Consensus to the user briefly so they have visibility, then proceed automatically to Phase 5. Do not pause for a decision here — the Draft Consensus is the artefact specialists will react to in Round 3.

### Phase 5 — Round 3 ratify or dissent (parallel)

Dispatch all six specialists in a single message with six parallel Agent tool calls. **This round uses a different output format** — specify it explicitly in each prompt. Each call's prompt must include:

1. The original premise.
2. The Draft Consensus from Phase 4.
3. The specialist's own Round 2 critique (so they can compare against where they landed).
4. An instruction to return EXACTLY this format and nothing else:

```
DECISION: RATIFY | DISSENT
REASON: <1–3 sentences>
SPECIFIC DISSENTS (if any):
- <point being challenged> — <why>
AGENT: <name>
```

Wait for all six to return. If any output isn't in this format, re-dispatch that specialist with a reminder.

### Phase 6 — Convergence reading + user checkpoint #2 (only if dissent)

Count the RATIFY and DISSENT decisions.

**If all six ratify:** Convergence reached. Tell the user "All six ratified — consolidating now," then proceed to Phase 8.

**If one or more dissent:** Summarise the dissents for the user — which specialists, on which specific points, and the reasoning. Present these two options as neutral siblings (no recommendation, no defaulting):

> "Round 3 produced N dissents. Two options:
> 1. Consolidate with the dissents recorded in the final spec.
> 2. Run Round 4 — a final critique pass against the dissents.
>
> Which?"

**Stop. Do not proceed until the user chooses.**

If they choose 1, proceed to Phase 8.
If they choose 2, continue to Phase 7.

### Phase 7 — Round 4 final critique (parallel, hard cap)

Dispatch all six specialists in a single message with six parallel Agent tool calls. Each call's prompt must include:

1. The original premise.
2. The Draft Consensus from Phase 4.
3. The dissents from Round 3 (verbatim).
4. An instruction to produce a final Round 4 critique in the same three-section format as Round 2 (Where I concede / Where I hold the line / Revised recommendations).

Wait for all six to return. **Do not dispatch any further rounds.** This is the cap. Proceed to Phase 8 regardless of whether dissents remain.

### Phase 8 — Consolidation

Write the final spec to `docs/specs/YYYY-MM-DD-<topic>-design.md`. Use today's actual date and a kebab-case topic slug derived from the premise. Create the `docs/specs/` directory if it doesn't exist.

The spec must include these sections, in order:

- **Frontmatter** — title, date, status: design (pre-implementation), authors.
- **TL;DR** — one paragraph distilling the council's converged view. If unresolved dissents remain, name them in the TL;DR.
- **Problem** — why are we building this, with specific references to the codebase.
- **Goals** — numbered.
- **Non-goals** — numbered. Anything the council explicitly rejected.
- **Proposed changes** — concrete, scoped, referencing file paths where known.
- **Acceptance criteria** — Gherkin-style per `.claude/planner/skills/GHERKIN_CRITERIA.md`.
- **Open questions** — anything the council couldn't resolve. Unresolved Round 3 dissents go here.
- **Appendix A: Round 1 memos** — all six, verbatim.
- **Appendix B: Organised Findings** — verbatim.
- **Appendix C: Round 2 critiques** — all six, verbatim.
- **Appendix D: Draft Consensus** — verbatim (only if Phase 4 produced one, which is always except in trivial early-exit cases).
- **Appendix E: Round 3 ratify/dissent** — all six decisions, verbatim (only if Round 3 ran).
- **Appendix F: Round 4 critiques** — all six, verbatim (only if Round 4 ran).

Do NOT commit the spec. Tell the user the path and ask them to review.

## Constraints during orchestration

- Australian English in your own synthesis, draft consensus, and spec text.
- Never dispatch a specialist sequentially when you could dispatch in parallel — each round is one message with six tool calls.
- If any specialist's output fails the round's format, re-dispatch only that specialist with a reminder of the format. Do not paper over.
- The habit-formation agent applies a default ethics perimeter (no streak counters, guilt nudges, loot boxes, gacha, social-pressure mechanics). If the chosen genre genuinely requires crossing the perimeter, the council must weigh the trade-off explicitly in writing and the consolidated spec must record the override and its justification. If habit-formation's output crosses the perimeter without that explicit justification, flag it in Organised Findings and re-dispatch that agent with a reminder.
- **Hard cap: 4 rounds.** Do not dispatch a fifth round under any circumstances. If consensus is genuinely irreconcilable after 4 rounds, that finding goes in the spec and the workflow ends. The cap is about runaway protection (specialists arguing in circles), not token cost.
- **Present user checkpoint options as neutral siblings.** Do not label one as "recommended" or "default". Do not include token-cost callouts in user-facing prompts. Quality of the council output is the optimisation target.

## Completion signal

When the spec file is written, output exactly:

```
COUNCIL_RESULT: SPEC_WRITTEN
SPEC_PATH: docs/specs/<filename>
```

Then tell the user the file is ready for their review and that the next step is `/tech-plan` to produce the implementation plan.
