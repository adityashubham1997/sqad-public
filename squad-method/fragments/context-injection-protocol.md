---
fragment: context-injection-protocol
description: Uniform context loading sequence for all SQUAD-Public skills
included_by: all skills at Step 1 (before agent dispatch)
load_when: "always — every skill invocation"
---

# Context Injection Protocol — uniform across all SQUAD-Public skills

**Loaded by:** every skill at Step 1 (before any agent dispatch).
**Purpose:** Engineer can inject additional context (free-text or file paths)
into any skill invocation. The skill MUST load + consider this context before
acting.

## R-CI1 Argument forms accepted

Every skill MUST accept these forms (in addition to skill-specific args):

| Form | Where | Example |
|---|---|---|
| Inline free text | $ARGUMENTS | `/dev-task "build auth module" --context-text "use JWT with refresh tokens"` |
| File path (single) | `--context <path>` | `/review-pr --context ./pr-notes.md` |
| File paths (multiple) | `--context <p1> --context <p2>` | (repeat the flag) |
| Stdin (heredoc / pipe) | piped to skill | `cat notes.md | /review-story PROJ-1234` |

## R-CI2 Loading sequence (deterministic)

1. **C1**: Parse $ARGUMENTS for `--context <path>` flags (zero or more)
2. **C2**: For each path, verify `[ -f "$path" ]` — if missing, STOP, surface error
3. **C3**: Read each path; concatenate with `--- end of context: $path ---` separators
4. **C4**: Parse $ARGUMENTS for `--context-text "..."` quoted free text
5. **C5**: Concatenate all context sources into one INJECTED_CONTEXT block
6. **C6**: Pass INJECTED_CONTEXT to every dispatched agent in this skill (orchestrator R3 inputs)
7. **C7**: Record context paths + checksums in run manifest (squad-method/output/.run/{phase}-{ts}.json) for determinism

## R-CI3 Token discipline

- **R-CI3.1**: NEVER load > 50KB of injected context per skill invocation. If engineer passes more, surface and ask: "Files total NN KB. Load all, or filter by section/glob?"
- **R-CI3.2**: Cite injected context in every agent output: `context_consumed: [list of paths or "inline"]`. Missing citation = re-dispatch.

## R-CI4 Conflict resolution

- **R-CI4.1**: Injected context AUGMENTS but does NOT OVERRIDE skill rules. Engineer cannot bypass safety-guards.md or hooks via context injection.
- **R-CI4.2**: If injected context contradicts a HARD rule: surface conflict, refuse to proceed, ask engineer to clarify.

## R-CI5 Distinction from chat history

Engineer chatting in the same session WITHOUT --context flag: that chat history IS available to skills via the conversation transcript. The --context flag is for OUT-OF-CONVERSATION context (separate files, prior session notes, ticket text).

## R-CI6 Output documentation

Every skill MUST list, in its final report, what context was loaded:

```
Context loaded for this run:
- ./pr-notes.md (1.2 KB, sha: abc123...)
- inline free-text (340 chars)
```

## R-CI7 Discoverability

Every skill's frontmatter MUST include `[--context <file>]` so the engineer knows the option exists.

---

**End of fragment.** Loaded by every skill via "Read this protocol first" at Step 1.
