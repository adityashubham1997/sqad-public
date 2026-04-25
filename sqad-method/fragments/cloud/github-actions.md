---
fragment: cloud/github-actions
description: GitHub Actions CI/CD patterns
load_when: "cloud.ci_cd includes github-actions"
token_estimate: 200
---

# GitHub Actions Context

## Best Practices

- Pin action versions to SHA (not `@v3` — use `@sha256:...`)
- Use job-level `permissions` with minimum required
- Cache dependencies (`actions/cache` or built-in npm/pip cache)
- Fail fast on lint/type-check before running expensive tests
- Use matrix strategy for multi-version testing
- Separate CI (test) from CD (deploy) workflows
- Use environments with protection rules for production deploys

## Security

- Never echo secrets — use `add-mask` for dynamic values
- Use OIDC for cloud provider auth (no long-lived keys)
- Restrict `pull_request_target` usage (code injection risk)
- Review third-party actions before use
- Use `GITHUB_TOKEN` with minimum permissions

## Workflow Structure

```yaml
name: CI
on:
  pull_request:
    branches: [main]
permissions:
  contents: read
jobs:
  lint:
    runs-on: ubuntu-latest
    steps: [...]
  test:
    needs: lint
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps: [...]
```

## Anti-Patterns to Flag

- Unpinned action versions (`uses: actions/checkout@v4`)
- `permissions: write-all`
- Secrets in workflow file (use GitHub Secrets)
- No caching for dependencies
- CI > 10 minutes without justification
