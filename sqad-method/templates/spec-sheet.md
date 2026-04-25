---
template: spec-sheet
description: Implementation specification sheet — the contract between analysis and code
used_by: /dev-task Phase 2, /dev-analyst
---

# Spec Sheet — {{story_id}}

**Story:** {{story_title}}
**Author:** {{agent_name}} ({{agent_role}}) | **Date:** {{date}}
**Status:** DRAFT | APPROVED | IMPLEMENTING

---

## 1. Objective

{{one_paragraph_describing_what_this_spec_achieves_and_why}}

## 2. Acceptance Criteria Mapping

| # | Acceptance Criterion | Implementation Item | Test Case | Status |
|---|---|---|---|---|
| AC-1 | {{criterion}} | {{what_to_implement}} | {{test_description}} | Pending |
| AC-2 | {{criterion}} | {{what_to_implement}} | {{test_description}} | Pending |

## 3. Files to Modify

| File | Change Type | Description | Pattern Reference |
|---|---|---|---|
| `{{file_path}}` | CREATE / MODIFY | {{what_changes}} | `{{existing_file_to_follow}}` |

## 4. Architecture Impact

- **Repos affected:** {{list}}
- **Services affected:** {{list}}
- **Cross-service:** Yes / No — {{details_if_yes}}
- **New tables/migrations:** Yes / No — {{details_if_yes}}
- **API changes:** Yes / No — {{details_if_yes}}
- **Performance considerations:** {{notes}}

## 5. Implementation Approach

### Pattern to Follow
```
Reference: {{existing_file_path}}:{{line_range}}
The existing implementation at [file] follows [pattern]. This spec
extends/mirrors that pattern with the following modifications:
{{specific_modifications}}
```

### Key Decisions
| Decision | Choice | Justification |
|---|---|---|
| {{decision_point}} | {{chosen_approach}} | {{why}} |

## 6. Test Plan

| # | Test Case | Type | Expected Behavior |
|---|---|---|---|
| T-1 | {{test_name}} | Unit / Integration | {{expected}} |
| T-2 | {{edge_case_test}} | Unit | {{expected}} |

**Test framework:** {{detected_framework}} (detected from {{evidence}})
**Test pattern:** Following existing `{{example_test_file}}`

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| {{risk}} | Low/Med/High | Low/Med/High | {{mitigation}} |

## 8. Scope Boundary

**In scope:** {{explicit_list}}
**NOT in scope:** {{explicit_list_of_exclusions}}

## 9. Assumptions

| # | Assumption | Confidence | Verified By |
|---|---|---|---|
| [ASSUMPTION-1] | {{assumption}} | VERIFIED / LIKELY / UNCERTAIN | {{source}} |

**All UNCERTAIN assumptions must be verified by {{user_name}} before implementation begins.**

## 10. Approval

- [ ] {{user_name}} (Owner)
- [ ] Atlas (Architecture)
- [ ] Forge (Implementation approach)
- [ ] Nova (AC completeness)
