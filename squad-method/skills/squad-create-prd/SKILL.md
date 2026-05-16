---
name: squad-create-prd
description: >
  Create a Product Requirements Document with multi-agent collaboration. Compass
  drives product vision, Nova sharpens requirements, Atlas validates architecture,
  Oracle researches competitive landscape, Forge reality-checks implementation.
  Use when user says "create prd", "product requirements", "write a PRD", or
  runs /create-prd.
---

# SQUAD-Public Create PRD — Multi-Agent Product Requirements Document

Five agents collaborate: **Compass** (product vision), **Nova** (requirements),
**Atlas** (architecture feasibility), **Oracle** (research), **Forge** (implementation).

Read these before starting:
- `squad-method/agents/compass.md`, `squad-method/agents/nova.md`
- `squad-method/agents/atlas.md`, `squad-method/agents/oracle.md`
- `squad-method/agents/forge.md`
- `squad-method/config.yaml`

## Step 1 — Discovery Interview (Compass leads)

Compass asks questions ONE AT A TIME:

1. "What problem does this solve? Who feels the pain today?"
2. "Who is the target user? Describe their day-to-day."
3. "What does success look like? How will we measure it?"
4. "What's the scope boundary — what is this NOT?"

Conditional: competitive products, existing tracker epics, target timeline.

**USER GATE:** "Is this capture accurate? [Continue/Correct]"

## Step 2 — Parallel Research & Analysis

**Oracle** — competitive & market research (web, codebase, tracker)
**Atlas** — architecture feasibility (repos, layers, complexity, risks)
**Forge** — implementation reality check (effort, simplest approach, risks)

**USER GATE:** "Review research findings. Adjust scope? [Continue/Adjust]"

## Step 3 — PRD Generation (Compass + Nova)

Compass drafts. Nova sharpens every requirement with GIVEN/WHEN/THEN AC.

PRD structure: Problem → User → Goals → Solution (overview, flows, FRs, NFRs) →
Architecture Impact → Implementation Estimate → Competitive Landscape →
Scope Boundary → Risks → Timeline → Open Questions → Appendix.

## Step 4 — Squad Review

All agents review their section for accuracy and completeness.

## Step 5 — Present & Save

**USER GATE:** "Review this PRD. [Approve/Revise/Add section]"

Save to: `squad-method/output/specs/prd-[feature]-[date].md`

## Behavioral Rules

- Compass asks questions ONE AT A TIME — no walls of questions
- Nova MUST validate every AC is testable
- Atlas's assessment must be grounded (file paths, actual constraints)
- Oracle cites every research finding with a source
- Forge's "simplest version" is the real MVP recommendation
- NEVER fabricate competitive analysis — if none found, say so
