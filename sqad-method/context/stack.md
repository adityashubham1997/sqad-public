---
node: stack
parent: root
children: []
token_estimate: 200
load_when: "stack-related work, /dev-task implementation, /review-code"
---

# Detected Stack

<!-- SQAD:auto-generated — rebuilt by /setup and /refresh -->

## Languages
{{detected_languages}}

## Frameworks
{{detected_frameworks}}

## Build Tools
{{build_tools}}

## Test Frameworks
{{test_frameworks}}

## Cloud Providers
{{detected_cloud_providers}}

## IaC
{{detected_iac}}

## Containers
{{detected_containers}}

## CI/CD
{{detected_ci_cd}}

## Commands

| Action | Command |
|---|---|
| Test | `{{test_command}}` |
| Build | `{{build_command}}` |
| Lint | `{{lint_command}}` |

## Loaded Fragments

Based on detected stack, the following fragments are available:

- Stack: `fragments/stack/{{language}}.md` per detected language
- Cloud: `fragments/cloud/{{provider}}.md` per detected cloud provider
- Tracker: `fragments/tracker/{{tracker}}.md` for configured tracker
- Rubric: `fragments/rubric/base.md` + `rubric/security.md` (always)
  + `rubric/{{language}}.md` + `rubric/zero-trust-infra.md` (if cloud)
