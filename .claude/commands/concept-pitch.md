You are running the **Concept Pitch** orchestration. This is Phase 0 of the gameX workflow — the team proposes what game to build before the Creative Council convenes to design it. Do not delegate this to a subagent — you are the orchestrator yourself.

If the user supplied any direction or constraint between the fence markers below, treat it as a soft nudge for the creative-director (not a premise). If the markers are empty, the user wants the team to propose everything.

---
$ARGUMENTS
---

## Flow

The flow runs in three phases with one user checkpoint. There is no multi-round critique here — the goal is divergent ideation, not convergence. Convergence happens in `/creative-council` after the user has picked.

### Phase 1 — Dispatch creative-director

Dispatch the `creative-director` agent once, via the Agent tool with `subagent_type: "creative-director"`. The prompt must include:

1. Any user nudge from the fence markers above (or "no nudge — propose anything" if empty).
2. The hard constraints: Windows-runnable, vertical slice in <2 weeks of solo dev, 3–5 genre-distinct candidates, dark-pattern defaults apply.
3. An instruction to return the candidates in the format defined by the agent's system prompt.

Wait for the agent to return.

### Phase 2 — User checkpoint

Show the user the candidates verbatim. Then present these options as **neutral siblings** (no "recommended" labels, no default-highlighting):

> "The creative director has produced N candidates. What next?
> 1. Pick a single candidate — name the number.
> 2. Mix candidates — say which two or three to fuse and how.
> 3. Regenerate — ask for a fresh batch with a sharper or different nudge.
> 4. Refine — ask the director to deepen one candidate before deciding.
>
> Which?"

**Stop. Do not proceed until the user chooses.**

If the user picks **regenerate**, return to Phase 1 with whatever sharper nudge they provided. Hard cap: 3 regenerations total. If the third batch still doesn't land, surface that to the user and ask whether to take the closest miss or pause the workflow.

If the user picks **refine**, dispatch creative-director once more with the candidate to deepen and any guidance the user gave. Then return to the checkpoint with the refined version replacing the original.

If the user picks **mix**, you (the orchestrator) compose the merged premise yourself in one paragraph, show it to the user, and ask "is this the premise?" before proceeding to Phase 3.

If the user picks **a single candidate**, proceed to Phase 3 with that candidate's full pitch as the premise.

### Phase 3 — Write premise file

Write the chosen premise to `docs/specs/YYYY-MM-DD-premise.md`. Use today's actual date. Create the `docs/specs/` directory if it doesn't exist.

The premise file structure:

```markdown
---
title: <kebab-case slug derived from the title>
date: <YYYY-MM-DD>
status: premise
phase: 0
authors: [creative-director, orchestrator]
---

# <Title>

**Genre:** ...
**Hook:** ...
**Target player:** ...
**Core mechanic:** ...
**Why now:** ...
**Vertical slice:** ...
**Comparable titles:** ...
**Risks:** ...

## How this premise was chosen
<one paragraph — pick / mix / refine, what the user redirected on, what
got cut from the original director memo>

## Director's full memo
<the verbatim creative-director output that produced the chosen
candidate, for traceability into the council phase>
```

Do NOT commit the file — the user reviews first.

## Constraints during orchestration

- Australian English in your own framing text.
- Do not editorialise on the candidates before the user has seen them — show them verbatim, then let the user decide.
- Hard cap: 3 regenerations. The point is to start designing, not to keep auditioning.
- Present user checkpoint options as neutral siblings.

## Completion signal

When the premise file is written, output exactly:

```
CONCEPT_PITCH_RESULT: PREMISE_WRITTEN
PREMISE_PATH: docs/specs/<filename>
```

Then tell the user the premise is ready for review and that the next step is `/creative-council` (passing the premise file path or pasting the premise inline as the argument).
