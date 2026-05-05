You are running the **Tech Plan** orchestration. This is Phase 2 of the gameX workflow — the bridge from the Creative Council's design spec to a buildable implementation plan. Do not delegate the orchestration to a subagent — you are the orchestrator yourself.

If the user supplied a specific design spec path between the fence markers below, use it. Otherwise, the orchestrator picks the most recent file matching `docs/specs/*-design.md`.

---
$ARGUMENTS
---

## Flow

Three phases with one user checkpoint.

### Phase 1 — Locate the design spec

If the user named a file in the arguments, use that path. Otherwise:

1. List `docs/specs/` (with Glob: `docs/specs/*-design.md`).
2. If zero matches: stop, tell the user there's no design spec yet, and tell them to run `/creative-council` first. Do NOT generate a plan from a premise file alone — the council's full output is the input.
3. If one match: use it.
4. If multiple matches: use the most recent by filename date prefix (`YYYY-MM-DD-...`). Tell the user which one you picked and let them redirect if they wanted a different one.

### Phase 2 — Dispatch tech-lead

Dispatch the `tech-lead` agent once, via the Agent tool with `subagent_type: "tech-lead"`. The prompt must include:

1. The full path to the design spec (so the agent can read it).
2. The hard constraint: must run on this Windows machine with standard tooling.
3. The vertical-slice mandate: smallest playable thing that proves the concept works.
4. An instruction to return the plan in the format defined by the agent's system prompt.

Wait for the agent to return.

### Phase 3 — User checkpoint

Show the user the tech-lead's full plan. Then present these options as **neutral siblings**:

> "The tech lead has drafted the implementation plan. What next?
> 1. Approve — write the plan to `docs/specs/YYYY-MM-DD-tech-plan.md` and tell me what to do next.
> 2. Redirect — name the section to revise and what direction. I'll re-dispatch tech-lead with the redirection.
> 3. Reject — pause the workflow. The plan needs more discussion before it's ready.
>
> Which?"

**Stop. Do not proceed until the user chooses.**

If the user picks **redirect**, re-dispatch tech-lead with the redirection appended to the prompt. Hard cap: 3 redirections. After that, surface to the user that the plan isn't converging and ask whether to ship the closest version or pause for re-design.

If the user picks **reject**, do not write the file. Tell the user the workflow has paused and ask what they'd like to revisit (the design spec, the council output, the premise, or something else).

If the user picks **approve**, proceed to Phase 4.

### Phase 4 — Write tech-plan file

Write the approved plan to `docs/specs/YYYY-MM-DD-tech-plan.md`. Use today's actual date. The tech-plan structure mirrors the tech-lead's output format (stack choice, architecture sketch, vertical-slice scope, build sequence, risks, what's not covered) plus a frontmatter block:

```markdown
---
title: tech-plan-<kebab-slug>
date: <YYYY-MM-DD>
status: approved
phase: 2
input_design_spec: docs/specs/<the-design-file>.md
authors: [tech-lead, orchestrator]
---
```

Do NOT commit the file — the user reviews first.

## Constraints during orchestration

- Australian English in your own framing text.
- Do not editorialise on the tech-lead's plan before the user has seen it. Show it verbatim.
- Hard cap: 3 redirections.
- Present user checkpoint options as neutral siblings.

## Completion signal

When the tech-plan file is written, output exactly:

```
TECH_PLAN_RESULT: PLAN_WRITTEN
PLAN_PATH: docs/specs/<filename>
```

Then tell the user the plan is ready for review and that the next step is the build phase (which is currently deferred — a follow-up plan will adapt the existing `dev`/`qa`/`reviewer` agents for greenfield local-only work before the build phase can run).
