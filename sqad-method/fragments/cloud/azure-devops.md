---
fragment: cloud/azure-devops
description: Azure DevOps CI/CD and project management patterns
load_when: "cloud.ci_cd includes azure-devops OR tracker.type equals azure-devops"
token_estimate: 500
---

# Azure DevOps

## Pipeline Patterns (azure-pipelines.yml)

```yaml
trigger:
  branches:
    include: [main]

pool:
  vmImage: 'ubuntu-latest'

stages:
  - stage: Build
    jobs:
      - job: BuildApp
        steps:
          - task: NodeTool@0
            inputs: { versionSpec: '20.x' }
          - script: npm ci && npm test
          - task: PublishTestResults@2
  - stage: Deploy
    dependsOn: Build
    condition: succeeded()
    jobs:
      - deployment: Production
        environment: 'production'
        strategy:
          runOnce:
            deploy:
              steps:
                - script: echo "Deploy"
```

## Best Practices

| Pattern | Preferred | Avoid |
|---|---|---|
| **Pipelines** | YAML pipelines in repo | Classic UI-only pipelines |
| **Variables** | Variable groups, Key Vault integration | Inline secrets in YAML |
| **Environments** | Named environments with approval gates | Direct deploy without gates |
| **Artifacts** | Pipeline artifacts, Azure Artifacts feed | Manual artifact management |
| **Templates** | Reusable YAML templates, extends keyword | Copy-paste pipeline definitions |
| **Service connections** | Managed identity, workload identity federation | Password-based connections |

## Azure Boards Integration

- Link commits to work items: `AB#1234` in commit messages
- Use branch policies requiring linked work items
- Track velocity via sprint boards and burndown charts
- Define iteration paths matching your sprint cadence

## Review Checks

| ID | Check | Severity |
|---|---|---|
| ADO-1 | **No approval gates** — production deploys without environment approval | CRITICAL |
| ADO-2 | **Secrets in YAML** — credentials not in variable groups or Key Vault | CRITICAL |
| ADO-3 | **No test results** — pipeline doesn't publish test results | MAJOR |
| ADO-4 | **Missing branch policies** — PRs can merge without builds passing | MAJOR |
| ADO-5 | **No artifact versioning** — builds don't produce versioned artifacts | MINOR |
