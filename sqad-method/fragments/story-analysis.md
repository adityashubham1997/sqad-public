---
fragment: story-analysis
description: Framework for analyzing tracker stories or free-text descriptions
included_by: dev-analyst, dev-task Phase 1
---

# Story Analysis Framework

## Input Mode Detection

Detect input type automatically:
- Matches tracker ID pattern (e.g., PROJ-123, #456, ISSUE-789) → **Tracker Mode**
- Everything else → **Description Mode**

## Tracker Mode Analysis

1. **Fetch** story from {{tracker_type}} using available MCP tools or API
2. **Extract:** ID, title, description, AC, linked epics, assignee, sprint, state
3. **Display** all extracted information to the user
4. **Analyze:**
   - Are the AC specific and testable?
   - Are there implicit requirements not captured in AC?
   - What edge cases does the story NOT mention?
   - Are there dependencies on other stories/epics?
5. **ASK** the user: "Is this the right story? Is my analysis correct?"

## Description Mode Analysis

1. **Acknowledge** the description as received
2. **Structure** into formal requirements:
   - Extract the core intent (what needs to happen)
   - Identify the target (which repo, which component)
   - Draft acceptance criteria in GIVEN/WHEN/THEN format
3. **Identify gaps:**
   - What's ambiguous in the description?
   - What edge cases aren't mentioned?
   - What implicit assumptions is the user making?
4. **Search tracker** (optional, offer to user): "Want me to check {{tracker_type}} for related work?"
5. **Present** structured requirements back to user
6. **ASK:** "Is this what you meant? Anything to add or correct?"

## Architecture Impact Assessment

For both modes, analyze:
- Which repos are affected?
- Which layers/services need changes?
- Which modules/components need modification?
- Any new database tables/fields/migrations required?
- Cross-service implications?
- API contract changes?
- Performance implications on large datasets?

## Research Phase

- Search existing codebase for similar implementations
- Check tracker for related stories/defects/epics
- Research official documentation for the detected stack
- If no grounding available, research web/docs until confident
- **NEVER proceed without grounding** — if you can't find relevant context, ask the user to provide it
