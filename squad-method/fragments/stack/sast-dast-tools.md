---
fragment: stack/sast-dast-tools
description: SAST/DAST security scanning tools and integration patterns
load_when: "always available — loaded by Aegis and during review phases"
token_estimate: 350
---

# SAST/DAST Security Tools

## Static Application Security Testing (SAST)

### Tool Matrix

| Tool | Languages | Integration | Focus |
|---|---|---|---|
| **SonarQube** | JS/TS, Java, Python, C#, Go, Ruby | CI/CD, IDE plugins | Code quality + security |
| **Semgrep** | 30+ languages | CLI, CI/CD, pre-commit | Pattern-based vulnerability detection |
| **CodeQL** | JS/TS, Java, Python, C#, Go, Ruby | GitHub Actions native | Semantic code analysis |
| **Snyk Code** | JS/TS, Java, Python, Go, Ruby | CLI, IDE, CI/CD | Real-time vulnerability detection |
| **Checkmarx** | 25+ languages | CI/CD, IDE | Enterprise SAST |
| **Bandit** | Python only | CLI, CI/CD | Python-specific security linting |
| **Brakeman** | Ruby/Rails only | CLI, CI/CD | Rails-specific security scanning |
| **Gosec** | Go only | CLI, CI/CD | Go-specific security analysis |
| **Security Code Scan** | C#/.NET | MSBuild, IDE | .NET security analysis |

### CI/CD Integration Pattern

```yaml
# GitHub Actions example
security-scan:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Run Semgrep
      uses: semgrep/semgrep-action@v1
      with:
        config: p/owasp-top-ten
    - name: Run Snyk
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Pre-commit Hook Pattern

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/semgrep/semgrep
    hooks:
      - id: semgrep
        args: ['--config', 'p/security-audit']
```

## Dynamic Application Security Testing (DAST)

### Tool Matrix

| Tool | Type | Integration | Focus |
|---|---|---|---|
| **OWASP ZAP** | Open-source | CLI, Docker, CI/CD | Full DAST scanner |
| **Nuclei** | Open-source | CLI, CI/CD | Template-based vulnerability scanning |
| **Burp Suite** | Commercial | CI/CD (Enterprise) | Comprehensive web security |
| **StackHawk** | SaaS | CI/CD native | Developer-first DAST |
| **Trivy** | Open-source | CLI, CI/CD | Container + IaC + SBOM scanning |

### Container Security Scanning

```bash
# Trivy — container image scan
trivy image --severity HIGH,CRITICAL myapp:latest

# Trivy — filesystem scan (IaC misconfigurations)
trivy fs --security-checks vuln,config .

# Snyk container
snyk container test myapp:latest
```

## Dependency Scanning (SCA)

| Tool | Ecosystems | Focus |
|---|---|---|
| **Snyk** | npm, pip, Maven, NuGet, Go, Cargo, Gems | Known CVEs + license |
| **Dependabot** | npm, pip, Maven, NuGet, Go, Cargo, Gems | Auto-PR for updates |
| **Renovate** | 50+ package managers | Auto-PR with grouping |
| **npm audit** | npm only | Built-in CVE check |
| **pip-audit** | pip only | Python CVE check |
| **dotnet list --vulnerable** | NuGet | .NET CVE check |

## Infrastructure as Code Security

| Tool | IaC Types | Focus |
|---|---|---|
| **Checkov** | Terraform, CloudFormation, K8s, Docker | Misconfiguration detection |
| **tfsec** | Terraform | Terraform-specific security |
| **KICS** | Terraform, Docker, K8s, Ansible | Multi-IaC scanning |
| **Trivy** | Terraform, Docker, K8s | Misconfiguration + CVE |

## Anti-Patterns

- Running SAST only in CI — shift left to pre-commit and IDE
- Ignoring findings without documented justification
- Using only one tool — layer SAST + SCA + DAST for defense in depth
- Not triaging findings — leads to alert fatigue and ignored reports
- Scanning only main branch — scan feature branches and PRs
