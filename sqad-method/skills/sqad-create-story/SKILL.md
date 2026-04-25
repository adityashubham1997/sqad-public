---
name: sqad-create-story
description: >
  Create a well-formed story in your tracker. Three agents collaborate: Tempo
  structures, Compass validates product value, Nova sharpens AC. Use when user
  says "create story", "new story", "write a story for", or runs /create-story.
---

# SQAD-Public Create Story

Three agents: **Tempo** (structure), **Compass** (product value), **Nova** (AC precision).

Read `sqad-method/agents/tempo.md`, `sqad-method/agents/compass.md`,
`sqad-method/agents/nova.md`, `sqad-method/templates/story-template.md`,
`sqad-method/config.yaml`.

## Step 1 — Gather Intent

If `$ARGUMENTS` provided, use as story description.
If not: "Describe what needs to be built and why."

Check for flags: `--sprint=current`, `--epic=EPIC123`

## Step 2 — Nova Structures Requirements

1. Extract core requirement
2. Identify ambiguities — ask user for each
3. Draft AC in GIVEN/WHEN/THEN format
4. Identify edge cases
5. Flag implicit assumptions

**USER GATE:** "Review the structured requirements. [Continue/Adjust]"

## Step 3 — Compass Validates Product Value

- Who benefits?
- Measurable outcome?
- Smallest valuable deliverable?
- Scope to cut?

## Step 4 — Tempo Assembles the Story

Using `sqad-method/templates/story-template.md`:
Title, type, sprint, epic, description (background, scope, out of scope),
AC, story points, technical notes.

## Step 5 — User Review

**USER GATE:** "Review this story. [Create in tracker/Revise/Cancel]"

## Step 6 — Create in Tracker

Use tracker MCP tools if available. If creation fails, save as local file:
`sqad-method/output/specs/story-draft-[date].md`

## Behavioral Rules

- Nova must ask about EVERY ambiguity
- Compass must evaluate product value — even for technical stories
- Tempo must include Out of Scope
- NEVER create in tracker without user confirmation
