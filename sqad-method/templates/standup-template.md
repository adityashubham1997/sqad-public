---
template: standup-template
description: Daily standup auto-generated from git + tracker
used_by: /standup
---

# Daily Standup — {{date}}

**Team:** {{team_name}} | **Sprint:** {{sprint_name}} | **Day:** {{sprint_day}}/{{sprint_length}}

---

## 📊 Sprint Progress

| Metric | Value |
|---|---|
| Points committed | {{committed}} |
| Points completed | {{completed}} |
| Points remaining | {{remaining}} |
| Burn rate | {{on_track / behind / ahead}} |

## ✅ Done Since Last Standup

{{git_commits_and_completed_stories}}

## 🔄 In Progress

| Story | Assignee | Status | Blockers |
|---|---|---|---|
| {{story_id}} | {{assignee}} | {{status}} | {{blockers_or_none}} |

## 🚫 Blocked

| Story | Blocker | Since | Action Needed |
|---|---|---|---|
| {{story_id}} | {{blocker_description}} | {{date}} | {{action}} |

## ⚠️ Risks

{{risks_or_none}}
