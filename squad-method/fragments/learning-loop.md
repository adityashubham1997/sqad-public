---
fragment: learning-loop
description: Protocol for SQUAD-Public to improve from previous run user inputs — feedback accumulation
load_when: "always — loaded by every skill at startup"
token_estimate: 350
---

# SQUAD-Public Learning Loop Protocol

SQUAD-Public improves across runs by accumulating user decisions, interview answers,
review corrections, and methodology refinements. This protocol defines HOW
the learning happens.

## Learning Sources

### 1. Interview Answers (context files)
When `/refresh` runs the human interview, engineer answers are
written into `<!-- SQUAD:KEEP -->` sections. These persist across refreshes.
**Each subsequent `/refresh` builds on previous answers**, not from scratch:
- SQUAD reads existing KEEP sections first
- Asks ONLY about new findings or changed patterns
- "Last time you said X. I now see Y has changed. Update?"

### 2. Review Corrections (tracking.jsonl)
Every `/review-pr`, `/review-code`, `/review-story` appends to `tracking.jsonl`:
```json
{
  "skill": "review-pr",
  "findings": [{"agent": "forge", "severity": "CRITICAL", "accepted": true}],
  "corrections": [{"agent": "raven", "finding": "...", "user_said": "not applicable because..."}]
}
```
When a user **rejects** a finding, SQUAD learns:
- `/review-pr` next run: "Last time, Raven flagged [X] and you said it wasn't applicable because [Y]. I'll skip similar patterns."
- `/health` aggregates rejection patterns → suggests rubric updates

### 3. Dev Task Decisions (progress docs)
During `/dev-task`, every phase gate records user decisions:
```
Phase 2 SPEC: User chose approach B over approach A. Reason: "simpler, matches existing pattern"
Phase 5 REVIEW: User overrode Cipher's test suggestion. Reason: "integration test sufficient"
```
Next `/dev-task` in same workspace reads previous progress docs:
- "In a similar story last sprint, you preferred approach B for [reason]. Apply same pattern?"

### 4. PR Review Patterns (from /git-learn)
`/git-learn` extracts recurring PR review themes → adds to CONTEXT.md Learnings section.
These learnings are loaded by every agent at L0 (context) in the Grounding Waterfall.

### 5. Sprint Retro Insights (from /retro)
Retro generates action items → some become rules in context files.
"We keep missing auth checks" → strengthen `rubric/security.md` section.

## Learning Accumulation Path

```
Run 1 (/setup):       Interview → initial context + config
Run 2 (/refresh):     Extract + delta interview → updated KEEP answers
Run 3 (/dev-task):    Phase decisions → progress doc → tracking.jsonl
Run 4 (/review-pr):   Review findings → user corrections → tracking.jsonl
Run 5 (/refresh):     Reads tracking.jsonl + previous KEEP → smarter interview
Run 6 (/retro):       Sprint insights → rules in context files
Run N (/health):      Pattern analysis → rubric evolution recommendations
```

**Key principle**: SQUAD never forgets a user decision. It accumulates in:
- `<!-- SQUAD:KEEP -->` blocks (methodology)
- `tracking.jsonl` (review decisions)
- CONTEXT.md Learnings section (PR patterns)
- Progress docs (phase decisions)

## How Agents Use Accumulated Learning

At skill startup, agents:
1. Read `tracking.jsonl` for the target repo — look for rejection patterns
2. Read `CONTEXT.md` Learnings — look for conventions
3. Read KEEP sections — look for methodology
4. Adjust their review/analysis accordingly

**Example**: If `tracking.jsonl` shows that Raven's "missing null check" findings
are rejected 80% of the time for this repo (because the repo uses TypeScript strict mode),
Raven reduces severity of null-check findings from MAJOR to NIT in future runs.

## Resetting Learning

To reset accumulated learning for a fresh start:
- Delete `squad-method/output/tracking.jsonl` → resets review patterns
- Remove `<!-- SQUAD:KEEP -->` blocks from context files → resets interview answers
- Delete progress docs → resets phase decisions
- Run `/refresh` → rebuilds from scratch with fresh interview
