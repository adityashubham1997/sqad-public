---
name: squad-dev-analyst
description: >
  Deep analysis of stories or free-text descriptions. Evaluates architecture
  impact, researches prior art, assesses feasibility and effort. Use when user
  says "analyze story", "dev analyst", "assess this", or runs /dev-analyst.
---

# SQUAD-Public Dev Analyst

Three agents: **Nova** (Analyst), **Atlas** (Architect), **Oracle** (Researcher).

**Bootstrap (read now):**
- `squad-method/config.yaml` — team config
- `squad-method/agents/_base-agent.md` — base protocols
- `squad-method/agents/nova.md` — primary for Step 1
- `squad-method/fragments/story-analysis.md`

**Phase-gated loading:**
- Step 2: `squad-method/agents/atlas.md`, `squad-method/fragments/kg-query-protocol.md`
- Step 3: `squad-method/agents/oracle.md`

## Step 1 — Detect Input Mode

Tracker ID → fetch details. Free text → Nova structures into AC.

**USER GATE:** "Is this the right scope? [Continue/Adjust]"

## Step 2 — Architecture Impact (Atlas)

**Load now:** `squad-method/agents/atlas.md`, `squad-method/fragments/kg-query-protocol.md`

Atlas analyzes:
1. Repos affected
2. Files to change (verified via Grep/Glob)
3. Cross-repo implications
4. Performance considerations
5. KG blast radius (if available)

Cite file:line for every claim. Tag uncertainties as `[ASSUMPTION-N]`.

## Step 3 — Deep Research (Oracle)

**Load now:** `squad-method/agents/oracle.md`

1. Codebase — prior implementations
2. Tracker — related stories, prior work
3. Web — best practices, industry patterns
4. Prior art summary

**CRITICAL:** If no grounding from ANY source, STOP and ask user.

## Step 4 — Consolidated Analysis

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📊 Nova · 🏗️ Atlas · 🔬 Oracle
  SQUAD-Public Dev Analysis — [story/description]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Story Breakdown (Nova)
## Architecture Assessment (Atlas)
## Research Findings (Oracle)
## Effort Estimate
## Open Questions
## Assumptions
```

Save to: `squad-method/output/specs/analysis-[story]-[date].md`

**USER GATE:** "Review. [Done/Dig deeper/Adjust]"

## Behavioral Rules

- NEVER proceed past Step 1 without user scope confirmation
- NEVER fabricate file paths, tracker data, or research findings
- EVERY file path claim must be verified via Glob or Grep
- If architecture impact is unclear, say so — don't guess
