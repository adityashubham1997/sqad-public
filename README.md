<div align="center">

# SQAD-Public

### 16-Agent AI Development Framework — Any Stack, Any IDE, Any Cloud

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js >=18](https://img.shields.io/badge/Node.js-%3E%3D18.0-green.svg)](https://nodejs.org)
[![Tests](https://img.shields.io/badge/Tests-73%20passing-brightgreen.svg)](#testing)
[![Agents](https://img.shields.io/badge/Agents-16-purple.svg)](#-16-agents)
[![Skills](https://img.shields.io/badge/Skills-27-orange.svg)](#-27-skills)

**SQAD-Public** is a platform-agnostic, open-source multi-agent AI development framework. It deploys a squad of **16 specialized AI agents** that understand your tech stack, cloud infrastructure, issue tracker, and team conventions — then collaborates with you through **27 slash commands** across the entire software lifecycle.

[Installation](#-installation) · [Quick Start](#-quick-start) · [Agents](#-16-agents) · [Skills](#-27-skills) · [Detection](#-dynamic-stack-detection) · [Customization](#-customization)

</div>

---

## Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [How It Works](#-how-it-works)
- [16 Agents](#-16-agents)
- [27 Skills](#-27-skills)
- [Dynamic Stack Detection](#-dynamic-stack-detection)
- [Cloud & Infrastructure Detection](#-cloud--infrastructure-detection)
- [Fragment Architecture](#-fragment-architecture)
- [Review Rubrics](#-review-rubrics)
- [IDE Support](#-ide-support)
- [Issue Tracker Support](#-issue-tracker-support)
- [Customization](#-customization)
- [Configuration Reference](#-configuration-reference)
- [Directory Structure](#-directory-structure)
- [Testing](#-testing)
- [System Overview UI](#-system-overview-ui)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Installation

### Prerequisites

- **Node.js** >= 18.0.0
- An AI-powered IDE (Claude Code, Windsurf, Cursor, etc.)

### Install via npx (recommended)

```bash
npx sqad-public init
```

This will:
1. Copy the `sqad-method/` directory into your workspace
2. Auto-detect your tech stack (languages, frameworks, build tools, test frameworks)
3. Auto-detect cloud infrastructure (providers, IaC, containers, CI/CD, monitoring)
4. Auto-detect your issue tracker
5. Detect installed IDEs
6. Generate `config.yaml` with all detected values
7. Create output directories for specs, reviews, and releases

### Install with specific IDEs

```bash
# Specify which IDEs to configure
npx sqad-public init --ide claude,windsurf,cursor

# Configure all 7 supported IDEs
npx sqad-public init --ide all
```

### Global install (optional)

```bash
npm install -g sqad-public
sqad-public init
```

### Update an existing installation

```bash
npx sqad-public update
```

### Uninstall

```bash
npx sqad-public uninstall
```

---

## ⚡ Quick Start

### 1. Initialize your workspace

```bash
cd /path/to/your/project
npx sqad-public init --ide claude,windsurf
```

**Output:**
```
🚀 SQAD-Public v1.0.0 — Initializing...

📁 Copying sqad-method/ to workspace...
🔍 Detecting tech stack...
   Languages: javascript, typescript
   Frameworks: react, nextjs
   Build tools: npm
   Test frameworks: jest
☁️  Detecting cloud infrastructure...
   Providers: aws
   IaC: terraform
   Containers: docker, kubernetes
   CI/CD: github-actions
📋 Detecting issue tracker...
   Tracker: jira

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SQAD-Public v1.0.0 — Configured ✅
 Stack:      javascript, typescript | react, nextjs | jest
 Cloud:      aws (terraform)
 Tracker:    jira
 Agents:     16 built-in
 IDEs:       Claude Code, Windsurf
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. Configure your team

Edit `sqad-method/config.yaml`:

```yaml
company:
  name: "Acme Corp"
project:
  name: "Widget Platform"
  description: "E-commerce platform with headless CMS"
  domain: "e-commerce"
user:
  name: "Jane Developer"
  role: "Senior Engineer"
```

### 3. Start using commands in your IDE

Open your AI IDE and type any slash command:

```
/dev-task          → Implement a story end-to-end (6 phases)
/review-code       → Pre-commit code review by 3 agents
/brainstorm        → Multi-agent brainstorming session
/ai-audit          → Audit your AI/LLM integrations
```

---

## 🔄 How It Works

SQAD-Public operates through a pipeline that transforms your workspace context into agent-powered workflows:

```
┌──────────┐    ┌─────────────┐    ┌────────────┐    ┌────────────┐    ┌─────────────┐
│  /setup  │ →  │  Detection  │ →  │  Config    │ →  │  Fragment  │ →  │  Agent +    │
│  (CLI)   │    │  Engines    │    │  Generate  │    │  Loading   │    │  Skill Run  │
└──────────┘    └─────────────┘    └────────────┘    └────────────┘    └─────────────┘
                 stack.js                              Stack-specific     Multi-agent
                 cloud.js           config.yaml        rubrics &          phase-gated
                 tracker.js         CONTEXT.md         patterns           workflows
```

### Core Concepts

- **Agents** — 16 specialized AI personas, each with a unique review lens, communication style, and domain expertise
- **Skills** — 27 phase-gated workflows (slash commands) that orchestrate multiple agents through a task
- **Fragments** — Modular knowledge units (stack patterns, cloud best practices, review rubrics) loaded dynamically based on your detected stack
- **Grounding Waterfall** — Anti-hallucination protocol: agents search code → KG → docs → artifacts before acting. If nothing found, they **stop and ask**
- **User Gates** — Every multi-phase skill pauses between phases for your review. Agents never proceed without your approval
- **Agent Discussions** — When agents disagree, they deliberate with evidence and present both sides for your decision

---

## 🤖 16 Agents

Every agent extends `_base-agent.md` which provides shared protocols: Grounding Waterfall, Anti-Hallucination Rules, Git Workflow, Communication Modes, and Tracking.

### Core Engineering

| # | Agent | Icon | Role | Review Lens |
|---|---|---|---|---|
| 1 | **Nova** | 🌟 | Orchestrator | Routes tasks, resolves conflicts, enforces protocols |
| 2 | **Atlas** | 🏗️ | Solution Architect | Blast radius, scalability, dependency analysis |
| 3 | **Forge** | 💻 | Dev Lead | Code quality, idioms, DRY, minimal change |
| 4 | **Cipher** | 🧪 | QA Engineer | Test coverage, edge cases, TDD workflow |
| 5 | **Sentinel** | 🛡️ | Test Architect | Test pyramid, risk-based coverage, framework selection |

### Quality & Review

| # | Agent | Icon | Role | Review Lens |
|---|---|---|---|---|
| 6 | **Raven** | 🦅 | Adversarial Reviewer | Hidden bugs, tech debt, failure modes |
| 7 | **Catalyst** | 🚀 | Release Engineer | Release readiness, compliance, quality gates |
| 8 | **Aegis** | 🔐 | Security Analyst | Zero Trust, least privilege, OWASP, secrets |

### Research & Documentation

| # | Agent | Icon | Role | Review Lens |
|---|---|---|---|---|
| 9 | **Oracle** | 🔬 | Technical Researcher | Prior art, docs research, cross-referencing |
| 10 | **Scribe** | 📝 | Tech Writer | Documentation quality, accuracy, freshness |

### Planning & Operations

| # | Agent | Icon | Role | Review Lens |
|---|---|---|---|---|
| 11 | **Compass** | 🧭 | Product Manager | Customer value, scope, product decisions |
| 12 | **Tempo** | ⏱️ | Sprint Master | Sprint tracking, velocity, blockers |

### Cloud & Infrastructure

| # | Agent | Icon | Role | Review Lens |
|---|---|---|---|---|
| 13 | **Stratos** | ☁️ | Cloud Architect | Cloud-native, cost, IaC, Well-Architected |
| 14 | **Phoenix** | 🔥 | DevOps/SRE | Deploy safety, observability, rollback |

### Generative AI (NEW)

| # | Agent | Icon | Role | Review Lens |
|---|---|---|---|---|
| 15 | **Spark** | ⚡ | AI Developer | Agentic workflows, LLM integration, RAG, prompts, evals |
| 16 | **Muse** | 🔮 | AI Researcher | Model evaluation, automation discovery, architecture design |

### Agent Communication Modes

All agents support two modes:
- **Logical Mode** (default) — Terse, evidence-based, compressed words but never compressed logic
- **Talkative Mode** — Full prose, elaboration, context for complex explanations. Activate with "talkative mode"

---

## ⚙️ 27 Skills

Skills are phase-gated, multi-agent workflows triggered by slash commands. Each skill defines which agents participate, what phases to execute, and where to pause for user approval.

### Ideate & Plan

| Command | Skill | Description |
|---|---|---|
| `/brainstorm` | sqad-brainstorm | Multi-agent brainstorming — diverge, stress-test, converge |
| `/create-prd` | sqad-create-prd | Multi-agent PRD creation with requirements discovery |
| `/create-story` | sqad-create-story | Create story with acceptance criteria refinement |
| `/current-sprint` | sqad-current-sprint | Pull sprint data from tracker, show status |
| `/standup` | sqad-standup | Auto-generate daily standup from git + tracker |
| `/product-researcher` | sqad-product-researcher | All-source research using codebase, web, tracker |
| `/dev-analyst` | sqad-dev-analyst | Deep story analysis — architecture impact, feasibility |

### Build & Implement

| Command | Skill | Description |
|---|---|---|
| `/dev-task` | sqad-dev-task | **6-phase pipeline**: Analyse → Spec → Implement → Test → Review → PR |
| `/test-story` | sqad-test-story | Story-aware test generation following existing patterns |

### Quality Assurance

| Command | Skill | Description |
|---|---|---|
| `/qa-task` | sqad-qa-task | Full QA lifecycle — dependency analysis, test strategy, risk matrix |
| `/test-repo` | sqad-test-repo | Run full test suite for current repo and report |
| `/test-project` | sqad-test-project | Run tests across ALL repos in workspace |

### Review

| Command | Skill | Description |
|---|---|---|
| `/review-code` | sqad-review-code | Pre-commit review by 3 agents (Forge, Raven, Aegis) |
| `/review-pr` | sqad-review-pr | Full PR review — patterns, bugs, security, compliance |
| `/review-story` | sqad-review-story | Validate implementation against tracker acceptance criteria |

### Ship & Release

| Command | Skill | Description |
|---|---|---|
| `/rrr` | sqad-rrr | Release Readiness Report from tracker data |
| `/rrr-fix` | sqad-rrr-fix | Auto-fix minor release violations (L10N, metadata) |
| `/release-bundle` | sqad-release-bundle | Assemble release PR with build verification and notes |
| `/retro` | sqad-retro | Sprint retrospective with live tracker data |

### Operations & Meta

| Command | Skill | Description |
|---|---|---|
| `/setup` | sqad-setup | Interactive workspace configuration (3 questions + auto-detect) |
| `/refresh` | sqad-refresh | Rebuild knowledge graphs, regenerate context files |
| `/refresh-git` | sqad-refresh-git | Enrich context with learnings from PR review comments |
| `/health` | sqad-health | Agent effectiveness analysis and bias detection |
| `/assemble` | sqad-assemble | Multi-agent group discussion (roundtable) |
| `/git-learn` | sqad-git-learn | Learn from team git history — PR comments, review patterns |

### AI & Agentic (NEW)

| Command | Skill | Description |
|---|---|---|
| `/ai-audit` | sqad-ai-workflow-audit | Audit all AI/LLM integration points — providers, architecture, rubric checks |
| `/ai-ideate` | sqad-ai-ideate | Brainstorm AI automation opportunities tailored to your stack |

### The `/dev-task` Pipeline (Detailed)

The flagship skill runs 6 phases with user gates between each:

```
Phase 1: ANALYSE  (Nova + Atlas)     → Read story, identify risks, map dependencies
    ↓ USER GATE: "Review analysis. Continue?"
Phase 2: SPEC     (Forge + Compass)  → Write spec sheet, file list, test plan
    ↓ USER GATE: "Review spec. Continue?"
Phase 3: IMPLEMENT (Forge)           → Write code following spec, existing patterns
    ↓ USER GATE: "Review code. Continue?"
Phase 4: TEST     (Cipher)           → Write tests, run suite, verify coverage
    ↓ USER GATE: "Review tests. Continue?"
Phase 5: REVIEW   (Raven + Sentinel) → Adversarial review, rubric check, security scan
    ↓ USER GATE: "Address findings? Continue?"
Phase 6: PR       (Forge + Tempo)    → Create branch, commit, open PR with summary
```

---

## 🔍 Dynamic Stack Detection

SQAD-Public auto-detects your tech stack by scanning workspace files. No manual configuration required.

### Language Detection

| Marker File | Language Detected |
|---|---|
| `package.json` | JavaScript |
| `tsconfig.json` | TypeScript |
| `pom.xml` | Java |
| `build.gradle` / `build.gradle.kts` | Java / Kotlin |
| `requirements.txt` / `pyproject.toml` / `setup.py` | Python |
| `go.mod` | Go |
| `Cargo.toml` | Rust |
| `Gemfile` | Ruby |
| `Package.swift` / `Podfile` | Swift |
| `*.csproj` / `*.sln` (deep scan) | C# |

### Framework Detection

| Category | Frameworks | Detection Method |
|---|---|---|
| **Frontend Web** | React, Angular, Vue, Svelte, SvelteKit, Next.js | `package.json` dependencies |
| **Backend JS** | Express, NestJS | `package.json` dependencies |
| **Python** | Django, Flask, FastAPI | `requirements.txt`, `pyproject.toml` |
| **Java/Kotlin** | Spring Boot, Quarkus, Micronaut | `pom.xml`, `build.gradle` |
| **Ruby** | Rails, Sinatra | `Gemfile` |
| **C# / .NET** | .NET Core, .NET Framework, ASP.NET, EF Core | Deep scan `*.csproj` content |
| **Mobile** | React Native, Android, iOS, Ionic/Capacitor | Dependencies, `AndroidManifest.xml`, `.xcodeproj`, `ionic.config.json` |
| **AI/ML** | LangChain, LlamaIndex, OpenAI, Anthropic, CrewAI, AutoGen | `package.json` + `requirements.txt` |

### Deep Recursive Scanning

The detection engine scans up to **4 levels deep** to find:
- `*.csproj` / `*.sln` / `*.fsproj` for C#/.NET projects
- `AndroidManifest.xml` + `build.gradle` for Android native projects
- `*.xcodeproj` / `*.xcworkspace` for iOS projects
- `*.tf` for Terraform configurations
- `Dockerfile` in service directories
- Kubernetes manifests (`kind: Deployment`, `kind: Service`)
- Helm charts (`Chart.yaml`)

Directories automatically skipped: `node_modules`, `.git`, `dist`, `build`, `out`, `bin`, `obj`, `.next`, `.nuxt`, `__pycache__`, `.venv`, `vendor`, `target`, `coverage`

---

## ☁️ Cloud & Infrastructure Detection

| Marker | What's Detected |
|---|---|
| `*.tf` files | Terraform (+ provider: AWS/GCP/Azure from content) |
| `cdk.json` | AWS CDK |
| `Pulumi.yaml` | Pulumi |
| `Dockerfile` / `docker-compose.yml` | Docker |
| `k8s/` directory or K8s YAML | Kubernetes |
| `Chart.yaml` (Helm) | Helm Charts |
| `.github/workflows/` | GitHub Actions |
| `.gitlab-ci.yml` | GitLab CI |
| `Jenkinsfile` | Jenkins |
| `prometheus.yml` | Prometheus |
| `grafana/` or `grafana.ini` | Grafana |
| `sentry.properties` / `SENTRY_DSN` | Sentry |

---

## 🧩 Fragment Architecture

Fragments are modular knowledge units loaded dynamically based on your detected stack. They provide agents with context-specific patterns, best practices, and review checks.

### Fragment Types

| Type | Count | Location | Purpose |
|---|---|---|---|
| **Stack** | 20 | `fragments/stack/` | Language/framework patterns, architecture, anti-patterns |
| **Cloud** | 8 | `fragments/cloud/` | Cloud provider best practices, IaC patterns |
| **Core** | 7 | `fragments/` | Review protocols, KG queries, TDD workflow, safety guards |
| **Tracker** | 3 | `fragments/tracker/` | Tracker-specific integration patterns |
| **Rubric** | 25 | `fragments/rubric/` | Review check tables (auto-loaded per stack) |

### Stack Fragments (20)

`javascript` · `react` · `react-native` · `angular` · `vue` · `svelte` · `nextjs` · `express` · `nestjs` · `android` · `ios` · `ionic` · `csharp` · `dotnet-core` · `spring` · `django` · `flask` · `fastapi` · `rails` · `generative-ai`

Each stack fragment includes:
- **Core patterns** table (preferred vs avoid)
- **Project structure** reference
- **Code examples** with idiomatic patterns
- **Performance rules**
- **Security considerations**
- **Testing patterns**
- **Anti-patterns to flag**

### Cloud Fragments (8)

`aws` · `azure` · `gcp` · `docker` · `kubernetes` · `terraform` · `monitoring` · `github-actions`

### How Fragment Loading Works

```
1. Detection engines scan workspace → detect [react, typescript, aws, docker]
2. Fragment loader reads each fragment's YAML frontmatter:
   load_when: "stack.frameworks includes react"
3. Matching fragments are injected into the agent's context
4. Agent reviews code using stack-specific patterns + rubric checks
```

---

## ✅ Review Rubrics

Rubrics are review checklists loaded dynamically per detected technology. Each check has a severity level (CRITICAL, MAJOR, MINOR, NIT).

### Available Rubric Modules (25)

| Category | Rubrics | Checks |
|---|---|---|
| **Always loaded** | `base`, `security` | Core quality + security baseline |
| **Languages** | `javascript`, `typescript`, `python`, `java`, `go`, `rust`, `ruby`, `csharp` | Language-specific anti-patterns |
| **Frontend** | `react`, `react-native`, `angular` | Component patterns, state management |
| **Mobile** | `android` (8 checks), `ios` (8 checks), `ionic` (7 checks) | Platform-specific safety |
| **Backend** | `spring` (7 checks) | Framework-specific patterns |
| **Cloud** | `cloud-aws`, `cloud-azure`, `cloud-gcp`, `kubernetes`, `docker`, `terraform` | Cloud security, IaC checks |
| **AI** | `generative-ai` (10 checks) | LLM safety, prompt injection, eval coverage |
| **Infrastructure** | `zero-trust-infra` | Least privilege, network segmentation |

### Example: Generative AI Rubric

| ID | Check | Severity |
|---|---|---|
| GAI-1 | Exposed API key — LLM key hardcoded or committed | CRITICAL |
| GAI-2 | No prompt injection defense — user input unsanitized | CRITICAL |
| GAI-3 | No LLM observability — calls without tracing | MAJOR |
| GAI-4 | No evaluation pipeline — AI feature shipped untested | MAJOR |
| GAI-5 | Hardcoded prompts — no versioning or template management | MAJOR |

### Example: Android Rubric

| ID | Check | Severity |
|---|---|---|
| AND-1 | Main thread I/O — synchronous network/disk (ANR risk) | CRITICAL |
| AND-2 | GlobalScope usage — leak risk from unscoped coroutines | CRITICAL |
| AND-4 | Missing `android:exported` — API 31+ crash | MAJOR |

---

## 💻 IDE Support

SQAD-Public transforms skills into IDE-native formats automatically.

| IDE | Format | Status |
|---|---|---|
| **Claude Code** | `CLAUDE.md` + `.claude/commands/` | ✅ Full support |
| **Windsurf** | `.windsurf/workflows/` + `.windsurf/skills/` | ✅ Full support |
| **Cursor** | `.cursor/rules/` (MDC format) | ✅ Full support |
| **Codex** | `.codex/` | ✅ Full support |
| **Kiro** | `.kiro/` | ✅ Full support |
| **Gemini CLI** | `GEMINI.md` | ✅ Full support |
| **AntiGravity** | `.antigravity/` | ✅ Full support |

### Usage per IDE

**Claude Code:**
```
> /dev-task
> /review-code
> /brainstorm
```

**Windsurf:**
```
> /dev-task
> /review-code
> /brainstorm
```

**Cursor:**
Rules are loaded automatically from `.cursor/rules/`. Use `@` mentions to invoke agents.

---

## 📋 Issue Tracker Support

| Tracker | Detection | How It's Used |
|---|---|---|
| **Jira** | `.jira.yml` or `JIRA_*` env vars | Sprint data, story details, AC extraction |
| **GitHub Issues** | `.github/ISSUE_TEMPLATE/` | Issue tracking, PR linking |
| **Linear** | `.linear/` or `LINEAR_API_KEY` | Sprint data, story sync |
| **Shortcut** | `SHORTCUT_API_TOKEN` | Story tracking |
| **Notion** | Integration config | Documentation, sprint boards |

---

## 🎨 Customization

### Custom Agents

Create team-specific agents in `sqad-method/custom-agents/`:

```markdown
---
extends: _base-agent
name: DataDog
agent_id: custom-datadog
role: Observability Engineer
icon: "🐕"
review_lens: "Are metrics, traces, and logs properly instrumented?"
capabilities:
  - Monitor application performance
  - Design alerting strategies
  - Review observability coverage
---

# DataDog — Observability Engineer

## Identity
[Your agent personality and expertise description]

## Review Instinct
[What this agent checks in every review]
```

### Custom Fragments

Add stack-specific knowledge in `sqad-method/plugins/`:

```markdown
---
fragment: stack/remix
description: Remix framework patterns
load_when: "stack.frameworks includes remix"
---

# Remix Stack Context
[Your patterns, rules, anti-patterns]
```

### Custom Rubrics

Add review checks in `sqad-method/fragments/rubric/`:

```markdown
---
rubric: my-custom
description: Team-specific review checks
load_when: "always"
---

| ID | Check | Rule | Severity |
|---|---|---|---|
| TEAM-1 | **Logging** | Every API endpoint must log request/response | MAJOR |
```

---

## 📝 Configuration Reference

`sqad-method/config.yaml` is the central configuration file. Most fields are auto-populated by `sqad-public init`.

```yaml
# --- Company ---
company:
  name: ""                          # Your company name

# --- Project ---
project:
  name: ""                          # Project name
  description: ""                   # One-line description
  domain: ""                        # e.g., fintech, e-commerce, healthtech
  compliance: []                    # [soc2, hipaa, pci-dss, gdpr]

# --- User ---
user:
  name: ""                          # Your name (REQUIRED — agents check this)
  role: ""                          # Your role

# --- Team ---
team:
  name: ""                          # Team name
  communication_tools: []           # [slack, teams, discord]

# --- Git ---
github:
  host: "github.com"
  org: ""                           # GitHub org/user
  default_branch: "main"

# --- Stack (auto-detected) ---
stack:
  languages: []                     # [javascript, typescript, python, ...]
  frameworks: []                    # [react, nextjs, django, android, ios, ...]
  build_tools: []                   # [npm, gradle, pip, ...]
  test_frameworks: []               # [jest, pytest, junit, ...]
  test_command: ""                  # e.g., "npm test"
  build_command: ""                 # e.g., "npm run build"
  lint_command: ""                  # e.g., "npm run lint"

# --- Cloud (auto-detected) ---
cloud:
  providers: []                     # [aws, gcp, azure]
  iac: []                           # [terraform, cdk, pulumi]
  container: []                     # [docker, kubernetes]
  ci_cd: []                         # [github-actions, gitlab-ci, jenkins]
  monitoring: []                    # [prometheus, grafana, sentry]

# --- Tracker ---
tracker:
  type: ""                          # jira, github-issues, linear, shortcut, notion
  project_key: ""                   # e.g., PROJ
  base_url: ""                      # e.g., https://acme.atlassian.net

# --- Agents ---
agents:
  built_in: 16                      # Don't change
  custom: []                        # List custom agent file names

# --- IDEs ---
ides:
  installed: []                     # [claude, windsurf, cursor, codex, kiro, gemini, antigravity]

# --- Communication ---
communication:
  language: "en"                    # Agent communication language
```

---

## 📂 Directory Structure

After initialization, your workspace will contain:

```
your-project/
├── sqad-method/                    # SQAD framework (do not delete)
│   ├── config.yaml                 # Central configuration
│   ├── agents/                     # 16 built-in agents + _base-agent
│   │   ├── _base-agent.md
│   │   ├── nova.md
│   │   ├── forge.md
│   │   ├── spark.md                # AI Developer (NEW)
│   │   ├── muse.md                 # AI Researcher (NEW)
│   │   └── ...
│   ├── custom-agents/              # Your custom agents go here
│   ├── fragments/
│   │   ├── stack/                  # 20 stack fragments
│   │   ├── cloud/                  # 8 cloud fragments
│   │   ├── rubric/                 # 25 rubric modules
│   │   ├── tracker/                # 3 tracker fragments
│   │   ├── review-rubric.md        # Base review rubric
│   │   ├── review-protocol.md      # Multi-agent review protocol
│   │   └── ...                     # Core protocol fragments
│   ├── skills/                     # 27 skill directories
│   │   ├── sqad-dev-task/SKILL.md
│   │   ├── sqad-review-code/SKILL.md
│   │   ├── sqad-ai-workflow-audit/SKILL.md  # NEW
│   │   ├── sqad-ai-ideate/SKILL.md          # NEW
│   │   └── ...
│   ├── context/                    # Context templates
│   ├── templates/                  # Output templates
│   ├── tools/                      # Knowledge graph tools
│   ├── plugins/                    # Custom extensions
│   └── output/                     # Generated artifacts
│       ├── specs/                  # Spec sheets
│       ├── reviews/                # Review reports
│       ├── releases/               # Release bundles
│       └── tracking.jsonl          # Operation tracking log
├── CONTEXT.md                      # Canonical project context
├── CLAUDE.md                       # Claude Code context (if configured)
├── GEMINI.md                       # Gemini CLI context (if configured)
├── .windsurf/                      # Windsurf config (if configured)
├── .cursor/                        # Cursor config (if configured)
└── sqad-system-overview.html       # Interactive system visualization
```

---

## 🧪 Testing

SQAD-Public includes a comprehensive test suite:

```bash
# Run all tests
npm test

# Run specific test file
node --test test/detect-mobile-ai.test.js
```

### Test Coverage

| Test File | Tests | What It Covers |
|---|---|---|
| `detect-stack.test.js` | 9 | Language detection, framework parsing |
| `detect-cloud.test.js` | 9 | Cloud provider, IaC, container, CI/CD detection |
| `detect-cloud-deep.test.js` | 7 | Deep recursive Terraform, Dockerfile, K8s, Helm, Pulumi |
| `detect-dotnet.test.js` | 9 | C#/.NET deep scan, framework version, test framework |
| `detect-frameworks.test.js` | 14 | React Native, Angular, Python, Ruby, Java, Vue, Svelte |
| `detect-mobile-ai.test.js` | 10 | Android, iOS, Ionic, LangChain, CrewAI, AutoGen |
| `detect-tracker.test.js` | 3 | Jira, GitHub Issues detection |
| `generate-config.test.js` | 5 | Config generation and parsing |
| `generate-ide-skills.test.js` | 7 | Skill discovery, frontmatter, IDE transforms |

**Total: 73 tests, all passing**

---

## 🌐 System Overview UI

Open `sqad-system-overview.html` in a browser for an interactive visualization of the complete framework:

- **Flow diagrams** — Setup pipeline, dev-task 6-phase flow, AI workflow
- **Agent gallery** — All 16 agents with roles and capabilities
- **Detection matrix** — Full framework detection table
- **Fragment catalog** — All stack, cloud, core, and tracker fragments
- **Rubric catalog** — All review modules with check counts
- **Skill catalog** — All 27 skills with descriptions
- **Architecture layers** — 8-layer system architecture

```bash
# Quick preview
open sqad-system-overview.html
# or
python3 -m http.server 8080 && open http://localhost:8080/sqad-system-overview.html
```

---

## 🤝 Contributing

### Adding a New Stack Fragment

1. Create `sqad-method/fragments/stack/your-stack.md` with YAML frontmatter
2. Add detection logic in `lib/detect/stack.js`
3. Create `sqad-method/fragments/rubric/your-stack.md` with review checks
4. Add tests in `test/`
5. Run `npm test` to verify

### Adding a New Agent

1. Create `sqad-method/agents/your-agent.md` extending `_base-agent`
2. Define: Identity, Communication Style, Principles, Review Instinct
3. Update `config.yaml` agent count
4. Reference the agent in relevant skills

### Adding a New Skill

1. Create `sqad-method/skills/sqad-your-skill/SKILL.md`
2. Define: Bootstrap files, Phases, User gates, Behavioral rules
3. Specify which agents participate in each phase

### Running Tests

```bash
npm test                           # All tests
node --test test/your-test.js      # Specific test
```

---

## 📜 License

MIT — see [LICENSE](LICENSE) for details.
