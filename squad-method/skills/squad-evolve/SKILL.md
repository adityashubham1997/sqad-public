---
name: squad-evolve
description: >
  Skill self-evolution loop. Analyzes tracking.jsonl for patterns in
  successes and failures, proposes evidence-backed skill edits (max 3 per cycle),
  gates each edit through a quality rubric, and applies accepted edits to a branch.
  Inspired by SkillLens + SkillOpt — zero external dependencies.
  Use when user says "evolve skills", "improve squad skills", "self-optimize",
  or runs /evolve.
---

# SQUAD-Public Evolve — Skill Self-Evolution Loop

Implements the Rollout → Reflect → Bounded Update protocol using
`squad-method/output/tracking.jsonl` as evidence.

Read `squad-method/agents/_base-agent.md` and `squad-method/config.yaml`.

## Phase 1 — EVIDENCE COLLECTION (Rollout Data)

```bash
# Read tracking records
cat squad-method/output/tracking.jsonl 2>/dev/null | tail -100
# Read optimizer memory
cat squad-method/output/meta-skill.md 2>/dev/null
```

Group records by skill:
- **Successes**: `outcome` = `completed`, `pr_created`, `merged`
- **Failures**: `outcome` = `user_aborted`, `error`, `blocked`

**Minimum records gate**: If a skill has < 5 records → "Insufficient data for [skill]
(need 5+, have [N]). Skipping." Do NOT score skills with < 5 records.

## Phase 2 — REFLECT (Analyze Trajectories)

For each skill with 5+ records:

1. **Success patterns**: What did successful runs share?
   - High `phases_completed` count
   - Low `review_verdict` critical findings
   - Low `assumptions_count`

2. **Failure patterns**: What did failed runs share?
   - Low `phases_completed` (early abort = which phase?)
   - High `critical` findings
   - High `assumptions_count` (insufficient grounding)

3. **Contrast**: What differs between success and failure?

4. **Recurring findings**: Same `critical` finding text in 2+ records = skill gap

Produce **gradients** (proposed edits):
```
{
  target_file: "squad-method/skills/squad-dev-task/SKILL.md",
  section: "Phase 3 — IMPLEMENT",
  edit_type: "add_rule",
  proposed_addition: "Run lint before committing",
  evidence_records: ["ts1", "ts2", "ts3"],
  evidence_summary: "4/6 dev-task failures had lint errors in Phase 3"
}
```

**Critical rule**: Analyze BOTH successes AND failures. Rules derived only from
failures produce overly cautious agents. Rules derived only from successes miss
common failure modes.

## Phase 3 — QUALITY GATE (SkillLens Rubric)

Score each proposed edit on 3 dimensions (1-5 each):

| Dimension | Score 1 | Score 5 |
|---|---|---|
| **Specificity** | Vague ("be more careful") | Cites specific file:line, exact text |
| **Actionability** | Requires interpretation | Agent can execute without judgment |
| **Grounding** | 0-1 supporting records | 4+ supporting records |

**Gate**: Only edits scoring ≥ 3 on ALL three dimensions proceed.
Reject: "be more thorough", "improve quality", "consider X" — these fail specificity.

**USER GATE** — Show rubric scores and ask for approval before proceeding.

```
━━━ QUALITY GATE — Phase 3 ━━━

Proposed edit 1:
  Target: squad-dev-task / Phase 3
  Edit: "Run lint before committing staged files"
  Evidence: 4/6 failures, lint errors in Phase 3
  Rubric: Specificity=4, Actionability=5, Grounding=4
  → PASSES GATE ✅

Proposed edit 2:
  Target: squad-qa-task / Phase 1
  Edit: "be more careful about edge cases"
  Evidence: 2 failures mentioned edge cases
  Rubric: Specificity=1, Actionability=1, Grounding=2
  → FAILS GATE ❌ (specificity=1, actionability=1)

Edits passing gate: 1/2. Continue? [Yes/Revise/Skip]
```

## Phase 4 — BOUNDED UPDATE (Max 3 Edits)

1. **Rank** passing edits by: `grounding_score × specificity_score`
2. **Select top 3** (hard cap — gradient clipping)
3. **Present each edit** for user approval:

```
┌─ Proposed Edit 1 of [N] ───────────────────────────────┐
│ Target: squad-method/skills/squad-dev-task/SKILL.md     │
│ Section: Phase 3 — IMPLEMENT                            │
│ Proposed: Add "Run lint before committing"              │
│ Evidence: 4/6 dev-task failures had lint errors         │
│   Records: [record-ts1], [record-ts2]                   │
│ Rubric: Specificity=4, Actionability=5, Grounding=4     │
│──────────────────────────────────────────────────────── │
│ [Accept] [Reject] [Modify]                              │
└─────────────────────────────────────────────────────────┘
```

For **Modify**: User provides the corrected text. Re-score rubric. If still ≥ 3 → apply.

## Phase 5 — COMMIT ON BRANCH (Slow Update)

```bash
# Create evolution branch
git checkout -b evolve/$(date +%Y-%m-%d)-cycle-N

# Apply accepted edits (one commit per edit)
# Message format: "evolve(skill-name): [edit description]"
```

After applying:
1. Update `squad-method/output/meta-skill.md`:
   - Add to **Proven Edits** (for accepted edits)
   - Add to **Rejected Edits** (for rejected edits with reason)
   - Update cycle count

2. Tell user:
   ```
   Evolution cycle complete.
   Branch: evolve/[date]-cycle-N
   Accepted edits: [N]
   Rejected edits: [N]

   Validate by running the next [N] tasks on this branch.
   If outcomes improve → merge to main.
   If no change or regression → revert.
   ```

## Phase 6 — TRACK

```bash
echo '{"ts":"[ISO_DATE]","command":"evolve","outcome":"completed","skills_analyzed":[N],"edits_proposed":[N],"edits_accepted":[N],"edits_rejected":[N],"evolution_cycle":[N]}' >> squad-method/output/tracking.jsonl
```

## Behavioral Rules

- **Never evolve without evidence.** Every edit must cite specific tracking records.
- **Never wholesale rewrite.** Max 3 edits per cycle. Surgical only.
- **Never auto-apply.** User gate at every edit. No exceptions.
- **Never skip the quality gate.** If a rule fails rubric, reject it — don't lower the bar.
- **Analyze both success and failure.** Asymmetric analysis produces bad rules.
- **Slow update.** Edits land on branch, not main. Validate before merging.
- **Track rejections.** Rejected edits are logged to prevent re-proposing them.
- **Meta-skill memory.** Update `meta-skill.md` after every cycle.
