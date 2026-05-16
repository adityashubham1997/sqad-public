---
template: story-template
description: Story creation template with AC structure
used_by: /create-story
---

# {{story_id}} — {{story_title}}

**Type:** Story / Bug / Task
**Priority:** Critical / High / Medium / Low
**Points:** {{estimate}}
**Sprint:** {{sprint_name}}
**Assignee:** {{assignee}}

---

## Description

{{description_paragraph}}

## Acceptance Criteria

### AC-1: {{criterion_title}}
**GIVEN** {{precondition}}
**WHEN** {{action}}
**THEN** {{expected_outcome}}

### AC-2: {{criterion_title}}
**GIVEN** {{precondition}}
**WHEN** {{action}}
**THEN** {{expected_outcome}}

## Edge Cases

- {{edge_case_1}}
- {{edge_case_2}}

## Technical Notes

- **Affected repos:** {{repos}}
- **Affected services:** {{services}}
- **Dependencies:** {{dependencies_or_none}}
- **Risk level:** Low / Medium / High

## Definition of Done

- [ ] All AC implemented and verified
- [ ] Unit tests written and passing
- [ ] Integration tests (if applicable)
- [ ] Code review approved
- [ ] Documentation updated
- [ ] No CRITICAL or MAJOR review findings
