---
name: sqad-retro
description: >
  Sprint retrospective using live tracker data. Facilitated by Tempo with
  Compass and Scribe. Shows what shipped, what slipped, velocity, and
  facilitates structured discussion. Use when user says "retro",
  "retrospective", "sprint review", or runs /retro.
---

# SQAD-Public Retro — Sprint Retrospective

Facilitated by **Tempo** (Scrum Master). Supporting: **Compass** (product),
**Scribe** (documentation).

Read: agent files, `sqad-method/templates/retro-template.md`, `sqad-method/config.yaml`,
`sqad-method/fragments/tracking-protocol.md`.

## Step 1 — Identify Sprint

Fetch most recently completed sprint from tracker. If ambiguous, ask.

## Step 2 — Fetch Sprint Data

Stories, defects, git activity for the sprint period.

## Step 3 — Compute Metrics

Stories committed/delivered, points, carry-over, defects, completion rate.

## Step 4 — Present Summary

Using `sqad-method/templates/retro-template.md`.

## Step 5 — Facilitated Discussion

### Round 1: "What went well?" (agents + user input)
### Round 2: "What didn't go well?" (agents + user input)
### Round 3: "What should we change?" (concrete actions with owners)

**Wait for user input at each round.**

## Step 5b — Agent Effectiveness (from tracking data)

If `sqad-method/output/tracking.jsonl` has records:
Analyze operations, review findings, discussions, trends.

## Step 6 — Document & Save

Scribe compiles: summary, went well, didn't go well, action items.
Save to: `sqad-method/output/reports/retro-[sprint]-[date].md`

## Step 7 — Track

```bash
echo '{"ts":"[ISO_DATE]","command":"retro","repo":"workspace","outcome":"report_saved"}' >> sqad-method/output/tracking.jsonl
```

## Behavioral Rules

- ALL 3 discussion rounds are interactive — wait for user input
- NEVER fabricate sprint data
- Action items must be SPECIFIC with owners and dates
- This is a SAFE SPACE — no blame
