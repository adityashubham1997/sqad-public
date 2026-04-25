---
name: sqad-product-researcher
description: >
  Deep product research across all sources — tracker, web, codebase, library docs.
  Use when user says "product research", "research this", "what do we know about",
  or runs /product-researcher.
---

# SQAD-Public Product Researcher — All-Source Deep Research

Two agents: **Oracle** (primary researcher), **Compass** (product framing).

Read `sqad-method/agents/oracle.md`, `sqad-method/agents/compass.md`,
`sqad-method/config.yaml`.

## Step 1 — Understand the Question

Parse `$ARGUMENTS` for topic. Clarify if too broad.

**USER GATE:** "I'll research: [topic]. Is this the right focus? [Yes/Adjust]"

## Step 2 — Multi-Source Research (Oracle)

Execute ALL sources in order:

### 2a. Codebase Search
Grep/Glob for related patterns, existing implementations.

### 2b. Tracker Search
Query tracker for related stories, epics, defects, prior work.

### 2c. Library/Framework Docs
If topic involves a library, query documentation sources.

### 2d. GitHub Organization
```bash
gh search repos "[topic]" --limit 10
gh search code "[topic]" --limit 10
```

### 2e. Web Search
Best practices, competitive analysis, industry trends.

## Step 3 — Compass Frames Product Context

Product lens: roadmap alignment, customer value, competitive landscape, effort-to-value.

## Step 4 — Consolidated Report

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔬 Oracle + 📋 Compass — Product Research
  Topic: [topic]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Executive Summary
## Source Findings (Codebase, Tracker, Docs, GitHub, Web)
## Compass — Product Assessment
## Recommendations
## Confidence Assessment
```

Save to: `sqad-method/output/reports/research-[topic]-[date].md`

## Behavioral Rules

- NEVER fabricate sources, URLs, or tracker data
- If a source returns nothing, note it clearly
- Cross-reference findings — flag conflicts
- Cite every finding with its source
