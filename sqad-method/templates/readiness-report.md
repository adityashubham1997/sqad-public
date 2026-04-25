---
template: readiness-report
description: Release readiness assessment report
used_by: /release-readiness
---

# Release Readiness Report

**Version:** {{version}}
**Date:** {{date}}
**Signal:** 🟢 HIGH / 🟡 MEDIUM / 🔴 LOW

---

## Executive Summary

{{one_paragraph_summary}}

## Quality Gates

| Gate | Status | Details |
|---|---|---|
| All tests passing | ✅ / ❌ | {{details}} |
| No CRITICAL findings | ✅ / ❌ | {{details}} |
| No MAJOR findings open | ✅ / ❌ | {{details}} |
| Security review passed | ✅ / ❌ | {{details}} |
| L10N compliance | ✅ / ❌ | {{details}} |
| Documentation updated | ✅ / ❌ | {{details}} |
| Performance validated | ✅ / ❌ | {{details}} |
| Rollback plan documented | ✅ / ❌ | {{details}} |

## Stories in Release

| ID | Title | Status | Review |
|---|---|---|---|
| {{story_id}} | {{title}} | DONE / IN REVIEW | APPROVED / PENDING |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| {{risk}} | Low/Med/High | Low/Med/High | {{mitigation}} |

## Agent Assessments

- **Catalyst:** {{release_assessment}}
- **Phoenix:** {{deployment_assessment}}
- **Aegis:** {{security_assessment}}
- **Tempo:** {{sprint_assessment}}
- **Compass:** {{product_assessment}}

## Recommendation

**{{SHIP / HOLD / BLOCK}}** — {{reason}}
