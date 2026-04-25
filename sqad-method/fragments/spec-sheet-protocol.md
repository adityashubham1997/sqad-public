---
fragment: spec-sheet-protocol
description: Rules for generating and validating implementation spec sheets
included_by: dev-task Phase 2, dev-analyst
---

# Spec Sheet Protocol

## What is a Spec Sheet?

A spec sheet is the contract between analysis and implementation. It specifies
EXACTLY what will be built — files to create/modify, tests to write, patterns
to follow, and risks to address. The developer implements per spec sheet,
no more, no less.

## Spec Sheet Generation Rules

1. **Ground in existing code.** Before specifying any approach, read the existing
   codebase to find similar patterns. Reference specific files and line numbers.
2. **Be explicit about files.** List every file that will be created or modified,
   with the expected change described.
3. **Reference existing patterns.** For every new file, point to an existing file
   that serves as the pattern/template to follow.
4. **Specify tests.** List every test case with its description and the behavior
   it validates.
5. **Identify risks.** What could go wrong? What assumptions are we making?
6. **Scope boundary.** Explicitly state what is NOT in scope to prevent creep.

## Spec Sheet Validation (Before Approval)

- [ ] Every acceptance criterion has at least one implementation item
- [ ] Every implementation item maps to a specific file
- [ ] Every new pattern references an existing pattern as its model
- [ ] Test cases cover happy path AND edge cases from AC
- [ ] Risks are identified with mitigation strategies
- [ ] Scope boundary is clearly stated
- [ ] No assumptions made without flagging them as UNCERTAIN

## Anti-Hallucination in Spec Sheets

- Do NOT reference files that don't exist — verify with Glob/Grep first
- Do NOT reference APIs or functions that don't exist — verify in the codebase
- Do NOT estimate effort without justification from similar prior work
- If you're unsure about a technical approach, mark it as "NEEDS VERIFICATION"
  and ask the user before proceeding to implementation
