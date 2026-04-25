<div align="center">

# SQAD-Public

### 26-Agent AI Development Framework — Any Stack, Any IDE, Any Cloud

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js >=18](https://img.shields.io/badge/Node.js-%3E%3D18.0-green.svg)](https://nodejs.org)
[![Tests](https://img.shields.io/badge/Tests-75%20passing-brightgreen.svg)](#testing)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success.svg)](#-security--privacy)
[![Agents](https://img.shields.io/badge/Agents-26-purple.svg)](#-26-agents)
[![Skills](https://img.shields.io/badge/Skills-29-orange.svg)](#-29-skills)

**SQAD-Public** (**S**quad **Q**uality **A**ssurance & **D**evelopment) is a platform-agnostic, open-source multi-agent AI development framework. It deploys a squad of **26 specialized AI agents** that understand your tech stack, cloud infrastructure, issue tracker, and team conventions — then collaborates with you through **29 slash commands** across the entire software lifecycle.

**One command. Zero config. Zero dependencies. Works with any stack.**

[Why SQAD?](#-why-sqad-public) · [Installation](#-installation) · [Quick Start](#-quick-start) · [Security](#-security--privacy) · [Agents](#-26-agents) · [Skills](#-29-skills)

</div>

<!-- TODO: Replace with actual demo GIF/recording -->
<!-- ![SQAD-Public Demo](docs/demo.gif) -->
> **See it in action:** Run `npx sqad-public init` in any project and watch SQAD detect your entire stack in seconds. Then try `/dev-task` to see the full 6-phase pipeline.

---

## Table of Contents

- [Why SQAD-Public?](#-why-sqad-public)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Security & Privacy](#-security--privacy)
- [How It Works](#-how-it-works)
- [26 Agents](#-26-agents)
- [29 Skills](#-29-skills)
- [Dynamic Stack Detection](#-dynamic-stack-detection)
- [Cloud & Infrastructure Detection](#-cloud--infrastructure-detection)
- [Fragment Architecture](#-fragment-architecture)
- [Review Rubrics](#-review-rubrics)
- [IDE Support](#-ide-support)
- [Issue Tracker Support](#-issue-tracker-support)
- [Customization](#-customization)
- [Configuration Reference](#-configuration-reference)
- [Directory Structure](#-directory-structure)
- [Knowledge Graph](#-knowledge-graph)
- [Testing](#-testing)
- [System Overview UI](#-system-overview-ui)
- [FAQ](#-faq)
- [Contributing](#-contributing)
- [License](#-license)

---

## 💡 Why SQAD-Public?

### The Problem

AI coding assistants are powerful, but without structure they hallucinate, forget context between sessions, skip tests, ignore your team's conventions, and produce inconsistent results. You end up spending more time reviewing AI output than you saved.

### The Solution

SQAD-Public gives your AI assistant **structure, memory, and expertise** through 26 specialized agents that each bring a different professional lens to your work:

```
You:       "Implement the login story"
SQAD:      6 agents activate across 6 phases:
           → Nova analyses requirements and catches AC gaps
           → Atlas assesses architecture impact
           → Forge writes code matching your existing patterns
           → Cipher generates tests following your test framework
           → Raven + Aegis review for bugs and security issues
           → You approve at every phase before proceeding
```

### What Makes It Different

| Feature | Without SQAD | With SQAD |
|---|---|---|
| **Setup time** | Hours of prompt engineering | `npx sqad-public init` — 5 seconds |
| **Stack awareness** | Manual context every session | Auto-detected once, always available |
| **Code style** | Generic, inconsistent | Matches your existing patterns |
| **Security** | Hope for the best | Aegis reviews every change against OWASP Top 10 |
| **Test coverage** | Often skipped | Cipher enforces TDD with your test framework |
| **Hallucination** | Frequent | Grounding Waterfall: code → KG → docs → ask |
| **AI control** | Full autonomy | User gates between every phase |
| **Dependencies** | Unknown supply chain | **Zero** — only Node.js built-ins |

### One Command, Any Stack

```bash
npx sqad-public init
```

That's it. SQAD detects your languages, frameworks, cloud, CI/CD, tracker, and IDEs automatically. No YAML to write. No plugins to install. No API keys needed. Works with **10+ languages**, **30+ frameworks**, **7 IDEs**, and **5 trackers** out of the box.

---

## 📦 Installation

### Prerequisites

- **Node.js** >= 18.0.0
- An AI-powered IDE (Claude Code, Windsurf, Cursor, etc.)

### One-line install (shell)

```bash
curl -fsSL https://raw.githubusercontent.com/adityashubham1997/sqad-public/main/install.sh | bash
```

With IDE options:
```bash
curl -fsSL https://raw.githubusercontent.com/adityashubham1997/sqad-public/main/install.sh | bash -s -- --ide claude,windsurf
```

The installer requires only **git + Node.js >= 18** (no npm/npx needed). It clones the repo to `~/.sqad-public`, pulls latest on every run, and runs init directly. Use `--update` to update an existing installation.

### Install via npx

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
 Agents:     26 built-in
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

### 3. Validate your setup

```bash
npx sqad-public doctor
```

### 4. Start using commands in your IDE

Open your AI IDE and type any slash command:

```
/dev-task          → Implement a story end-to-end (6 phases)
/review-code       → Pre-commit code review by 3 agents
/brainstorm        → Multi-agent brainstorming session
/ai-audit          → Audit your AI/LLM integrations
```

### 🚀 Start Here — Top 3 Commands for New Users

| # | Command | What It Does | Why Start Here |
|---|---|---|---|
| 1 | `/review-code` | Quick pre-commit review by 3 agents (Forge, Raven, Aegis) | Fastest value — see results in 30 seconds |
| 2 | `/dev-task` | Full 6-phase implementation pipeline | The flagship experience |
| 3 | `/brainstorm` | Multi-agent brainstorming on any topic | See agent diversity in action |

**Pro tip:** Run `npx sqad-public list` to see all 29 available skills with descriptions.

---

## 🔒 Security & Privacy

Security is a first-class concern. SQAD-Public is designed to be **safe to install in any codebase**, including enterprise and regulated environments.

### Zero Dependencies

```json
"dependencies": {}
```

SQAD-Public has **literally zero npm dependencies**. The entire framework uses only Node.js built-in modules (`node:fs`, `node:path`, `node:os`, `node:child_process`). This means:

- **Zero supply chain risk** — no transitive dependency vulnerabilities
- **No `node_modules/` bloat** — the package is 144 KB
- **No network calls** — detection is purely filesystem-based
- **Nothing phones home** — no telemetry, no analytics, no tracking pixels

### No API Keys Required

SQAD-Public does **not** require any API keys, tokens, or external service credentials to function. It works entirely within your local filesystem. Your AI IDE's existing authentication handles the LLM communication — SQAD only provides structure and context.

### What SQAD Reads

During `init`, the detection engines **read-only scan** your workspace for:

| What | Why | How |
|---|---|---|
| `package.json`, `Gemfile`, `requirements.txt`, etc. | Detect languages and frameworks | Reads dependency names (not values) |
| `*.tf`, `Dockerfile`, `*.yaml` | Detect cloud infrastructure | Checks file existence and certain keywords |
| `.github/`, `.jira.yml`, env var names | Detect CI/CD and trackers | Checks existence only |
| `.xcodeproj`, `AndroidManifest.xml`, `*.csproj` | Detect mobile/desktop platforms | Deep scan up to 4 levels |

**SQAD never reads your source code during init.** It only checks for marker files and dependency lists.

### What SQAD Writes

| Location | Content | Editable? |
|---|---|---|
| `sqad-method/config.yaml` | Detected stack, cloud, tracker | ✅ Yes — your config |
| `sqad-method/agents/` | Agent definition files (read-only context for AI) | ⚠️ Preserved on update |
| `sqad-method/output/` | Specs, reviews, releases, tracking log | ✅ Yours — gitignored |
| `.claude/`, `.windsurf/`, `.cursor/` | IDE-specific skill files | ✅ Auto-generated per IDE |

### Built-in Safety Guards

Every agent follows `safety-guards.md` which enforces:

- **File scope protection** — Agents never modify files outside the current task
- **No auto-push** — Agents never push to remote without your explicit approval
- **Sensitive file detection** — Auto-generated files (lock files, build output, IDE config) trigger a warning before modification
- **Secret scanning** — Before any commit, agents scan for API keys, AWS access keys, private keys, connection strings, and `.env` files
- **Destructive action guard** — Delete, drop, truncate, and force push require explicit confirmation one at a time

### User Gates (Human-in-the-Loop)

Every multi-phase skill pauses between phases for your review:

```
Phase 1: ANALYSE → Nova + Atlas deliver analysis
         ⏸️ USER GATE: "Review analysis. Approve to continue?"

Phase 2: SPEC → Forge writes spec
         ⏸️ USER GATE: "Review spec. Approve to continue?"

Phase 3: IMPLEMENT → Forge writes code
         ⏸️ USER GATE: "Review code. Approve to continue?"
         ...
```

**Agents never proceed without your approval.** You can reject, modify, or redirect at any gate.

### Anti-Hallucination Protocol (Grounding Waterfall)

Agents follow a strict evidence hierarchy before making any claim:

```
1. Search codebase (grep, AST, file reads)
2. Query Knowledge Graph (if available)
3. Check documentation and artifacts
4. If nothing found → STOP and ASK the user
   ❌ Never fabricate file paths, function names, or API endpoints
```

### Compliance Ready

If your project has compliance requirements, set them in `config.yaml`:

```yaml
project:
  compliance: [soc2, hipaa, pci-dss, gdpr]
```

Aegis (Security Analyst) will automatically include compliance-specific checks in every review.

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

- **Agents** — 26 specialized AI personas, each with a unique review lens, communication style, and domain expertise
- **Skills** — 29 phase-gated workflows (slash commands) that orchestrate multiple agents through a task
- **Fragments** — Modular knowledge units (stack patterns, cloud best practices, review rubrics) loaded dynamically based on your detected stack
- **Grounding Waterfall** — Anti-hallucination protocol: agents search code → KG → docs → artifacts before acting. If nothing found, they **stop and ask**
- **User Gates** — Every multi-phase skill pauses between phases for your review. Agents never proceed without your approval
- **Agent Discussions** — When agents disagree, they deliberate with evidence and present both sides for your decision

---

## 🤖 26 Agents

Every agent extends `_base-agent.md` which provides shared protocols: Grounding Waterfall, Anti-Hallucination Rules, Git Workflow, Communication Modes, and Tracking.

### Core Engineering

| # | Agent | Icon | Role | Review Lens |
|---|---|---|---|---|
| 1 | **Nova** | 🌟 | Dev Analyst | Story dissection, AC validation, edge case identification |
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

### OS & Systems

| # | Agent | Icon | Role | Review Lens |
|---|---|---|---|---|
| 17 | **Kernel** | 🐧 | OS/Systems Architect | Process safety, resource leaks, C/C++, concurrency, portability |

### Data Science & Analytics (NEW)

| # | Agent | Icon | Role | Review Lens |
|---|---|---|---|---|
| 18 | **Neuron** | 🧠 | ML/Data Science Engineer | Reproducibility, data leakage, experiment tracking, MLOps |
| 19 | **Prism** | 📊 | Data Analyst | SQL performance, data modeling, metrics consistency, data quality |

### Database

| # | Agent | Icon | Role | Review Lens |
|---|---|---|---|---|
| 20 | **Dynamo** | 🗄️ | Database Architect | Schema design, normalization, migrations, data modeling |
| 21 | **Index** | ⚡ | Query Optimizer | Query performance, indexing, N+1 detection, execution plans |

### Game Development

| # | Agent | Icon | Role | Review Lens |
|---|---|---|---|---|
| 22 | **Pixel** | 🎮 | Game Developer | Game loop, physics, rendering, networking, frame budget |
| 23 | **Quest** | 🎯 | Game Designer | Mechanics, difficulty curves, player psychology, UX |
| 24 | **Lore** | 📜 | Game Story Writer | Narrative, world-building, dialogue, player agency |

### Cross-Cutting

| # | Agent | Icon | Role | Review Lens |
|---|---|---|---|---|
| 25 | **Flux** | 💡 | Creative Thinker | Assumption challenging, lateral thinking, reframing problems |
| 26 | **Titan** | 🏛️ | Strict Architect | Zero-tolerance quality, standards enforcement, contract compliance |

### Agent Communication Modes

All agents support two modes:
- **Logical Mode** (default) — Terse, evidence-based, compressed words but never compressed logic
- **Talkative Mode** — Full prose, elaboration, context for complex explanations. Activate with "talkative mode"

---

## ⚙️ 29 Skills

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

### Operations & Release

| Command | Skill | Description |
|---|---|---|
| `/retro` | sqad-retro | Sprint retrospective with live tracker data |
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

### OS & Systems (NEW)

| Command | Skill | Description |
|---|---|---|
| `/os-audit` | sqad-os-audit | Audit process management, C/C++ patterns, resource safety, cross-platform portability |

### Data Science & Analytics (NEW)

| Command | Skill | Description |
|---|---|---|
| `/data-audit` | sqad-data-audit | Audit ML pipelines, data quality, experiment tracking, analytics models |

### Infrastructure & Observability (NEW)

| Command | Skill | Description |
|---|---|---|
| `/infra-audit` | sqad-infra-audit | Audit monitoring (Datadog, New Relic), config management (Ansible), CI/CD (Azure DevOps) |

### Database

| Command | Skill | Description |
|---|---|---|
| `/db-audit` | sqad-db-audit | Audit schema design, query performance, migration safety, connection management |

### Game Development

| Command | Skill | Description |
|---|---|---|
| `/game-review` | sqad-game-review | Review game code — performance, architecture, networking, design, narrative |

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
| `CMakeLists.txt` / `meson.build` | C++ |
| `Makefile` + `*.c` / `*.cpp` (deep scan) | C / C++ |

### ML / Data Science Detection

| Marker | Detected As |
|---|---|
| `scikit-learn` / `sklearn` in dependencies | sklearn |
| `torch` / `pytorch` in dependencies | pytorch |
| `tensorflow` / `keras` in dependencies | tensorflow / keras |
| `xgboost` / `lightgbm` in dependencies | xgboost / lightgbm |
| `mlflow` / `wandb` in dependencies | mlflow / wandb |
| `pandas` / `polars` in dependencies | pandas / polars |
| `dbt-core` in dependencies | dbt |
| `airflow` / `prefect` / `dagster` in dependencies | airflow / prefect / dagster |
| `pyspark` in dependencies | spark |
| `streamlit` in dependencies | streamlit |

### Database Detection

| Marker | Detected As |
|---|---|
| `prisma` / `@prisma/client` in deps | Prisma ORM |
| `typeorm` / `sequelize` / `knex` / `drizzle-orm` in deps | ORM |
| `mongoose` / `pymongo` in deps | MongoDB |
| `pg` / `psycopg2` in deps | PostgreSQL |
| `mysql2` in deps | MySQL |
| `redis` / `ioredis` in deps | Redis |
| `sqlalchemy` in deps | SQLAlchemy |
| `@elastic/elasticsearch` in deps | Elasticsearch |

### Game Engine Detection

| Marker | Detected As |
|---|---|
| `Assets/` + `ProjectSettings/` dirs | Unity |
| `*.uproject` file | Unreal Engine |
| `project.godot` file | Godot |
| `MonoGame` in `.csproj` | MonoGame |

### Infrastructure & Monitoring Detection

| Marker | Detected As |
|---|---|
| `datadog.yaml` / `dd-trace` in deps | Datadog |
| `newrelic.yml` / `newrelic` in deps | New Relic |
| `prometheus.yml` / `prom-client` in deps | Prometheus |
| `@sentry/*` / `sentry-sdk` in deps | Sentry |
| `@opentelemetry/*` in deps | OpenTelemetry |
| `ansible.cfg` / `playbook.yml` / `site.yml` | Ansible |
| `azure-pipelines.yml` | Azure DevOps |

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
  built_in: 26                      # Don't change
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
│   ├── agents/                     # 26 built-in agents + 3 abstract bases
│   │   ├── _base-agent.md
│   │   ├── nova.md
│   │   ├── forge.md
│   │   ├── spark.md                # AI Developer (NEW)
│   │   ├── muse.md                 # AI Researcher
│   │   ├── kernel.md               # OS/Systems Architect
│   │   ├── neuron.md               # ML/Data Science Engineer
│   │   ├── prism.md                # Data Analyst
│   │   ├── dynamo.md               # Database Architect (NEW)
│   │   ├── index.md                # Query Optimizer (NEW)
│   │   ├── pixel.md                # Game Developer (NEW)
│   │   ├── quest.md                # Game Designer (NEW)
│   │   ├── lore.md                 # Game Story Writer (NEW)
│   │   ├── flux.md                 # Creative Thinker (NEW)
│   │   ├── titan.md                # Strict Architect (NEW)
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
│   ├── skills/                     # 29 skill directories
│   │   ├── sqad-dev-task/SKILL.md
│   │   ├── sqad-review-code/SKILL.md
│   │   ├── sqad-ai-workflow-audit/SKILL.md  # NEW
│   │   ├── sqad-ai-ideate/SKILL.md
│   │   ├── sqad-os-audit/SKILL.md
│   │   ├── sqad-data-audit/SKILL.md         # NEW
│   │   ├── sqad-infra-audit/SKILL.md
│   │   ├── sqad-db-audit/SKILL.md           # NEW
│   │   ├── sqad-game-review/SKILL.md        # NEW
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

## 📊 Knowledge Graph

SQAD-Public includes a built-in dependency graph builder that maps your entire codebase structure. Agents use this for impact analysis, blast radius estimation, and test coverage mapping.

### Build a Knowledge Graph

```bash
node sqad-method/tools/knowledge-graph/build.js .
```

**Output:**
```
📊 Building knowledge graph for: /path/to/your/project
   Found 31 source files
   Nodes: 31 | Edges: 26
   Source: 21 | Tests: 10
   God nodes: 0
   Output: knowledge-graph-out/graph.json
```

### View Summary

```bash
node sqad-method/tools/knowledge-graph/summary.js .
```

Shows god nodes (files with degree > 30 — high coupling risk), untested source files, and directory communities.

### Supported Languages

The KG builder scans imports/requires across: **JavaScript**, **TypeScript**, **Python**, **Go**, **Rust**, **Java**, and **Ruby**.

### How Agents Use It

Skills like `/dev-task`, `/review-pr`, and `/refresh` query `graph.json` for:

- **Impact analysis** — "What depends on the file I'm changing?"
- **Blast radius** — "How far do changes ripple (2-hop)?"
- **Test coverage mapping** — "Which test files cover this module?"
- **God node warnings** — "Is this a high-coupling component requiring extra review?"

If no knowledge graph exists, agents gracefully fall back to grep-based analysis. The KG is a bonus, never a blocker.

### Cross-Repo Support

```bash
node sqad-method/tools/knowledge-graph/summary.js --root ./repo-a ./repo-b ./repo-c
```

Aggregates stats across multiple repositories for monorepo or multi-service architectures.

---

## 🧪 Testing

SQAD-Public includes a comprehensive test suite with unit tests and end-to-end validation:

```bash
# Run all tests
npm test

# Run specific test file
node --test test/detect-mobile-ai.test.js

# Run e2e detection validation (62 assertions across 12 stacks)
node test/e2e-setup-test.mjs

# Run e2e init validation (29 assertions)
node test/e2e-init-test.mjs
```

### Unit Tests (75)

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

### End-to-End Tests (91 assertions)

| Test File | Assertions | What It Covers |
|---|---|---|
| `e2e-setup-test.mjs` | 62 | 12 simulated projects: JS/React, Python/Django, Java/Spring, C#/.NET, Android, iOS, Ionic, Go, Rust, Ruby/Rails, AI frameworks, empty workspace |
| `e2e-init-test.mjs` | 29 | Full `sqad-public init` pipeline: file copy, detection, config.yaml generation, agent/skill count verification |

**Total: 75 unit tests + 91 e2e assertions, all passing**

---

## 🌐 System Overview UI

Open `sqad-system-overview.html` in a browser for an interactive visualization of the complete framework:

- **Flow diagrams** — Setup pipeline, dev-task 6-phase flow, AI workflow
- **Agent gallery** — All 26 agents with roles and capabilities
- **Detection matrix** — Full framework detection table
- **Fragment catalog** — All stack, cloud, core, and tracker fragments
- **Rubric catalog** — All review modules with check counts
- **Skill catalog** — All 29 skills with descriptions
- **Architecture layers** — 8-layer system architecture

```bash
# Quick preview
open sqad-system-overview.html
# or
python3 -m http.server 8080 && open http://localhost:8080/sqad-system-overview.html
```

---

## ❓ FAQ

### Is SQAD-Public safe to install in my enterprise codebase?

**Yes.** Zero dependencies, no network calls, no telemetry, no API keys required. It only reads marker files (not source code) during init. Everything stays local. See [Security & Privacy](#-security--privacy) for full details.

### Does SQAD-Public send my code to external servers?

**No.** SQAD-Public is a local framework that provides structure to your AI IDE. The AI IDE itself handles LLM communication (Claude, GPT, etc.) — SQAD only provides agent definitions, skill workflows, and context files that your IDE reads locally.

### What if my stack isn't detected?

Detection is best-effort. You can always manually edit `sqad-method/config.yaml` to add languages, frameworks, or cloud providers the auto-detection missed. Agents will use whatever is in `config.yaml`.

### Can I use SQAD-Public without an AI IDE?

The agent and skill definitions are plain Markdown files. You can read them manually, reference them in any LLM chat, or paste them into ChatGPT/Claude web interfaces. The CLI and IDE integrations just make it seamless.

### How do I add support for a new language or framework?

1. Add detection markers in `lib/detect/stack.js`
2. Create a stack fragment in `sqad-method/fragments/stack/your-stack.md`
3. Create a rubric module in `sqad-method/fragments/rubric/your-stack.md`
4. Add tests and run `npm test`

### Will `sqad-public update` overwrite my config?

**No.** The update command backs up your `config.yaml`, updates agents/fragments/templates, then restores your config. Your custom agents, plugins, and output data are never touched.

### Can I use only specific agents or skills?

Yes. You don't have to use all 29 skills. Just run the slash commands you need. Agents activate per-skill — you won't be overwhelmed.

### What's the difference between SQAD-Public and other AI coding frameworks?

SQAD-Public is **agent-first** (26 specialized personas with distinct review lenses), **phase-gated** (user approval at every step), and **grounding-enforced** (anti-hallucination waterfall). Most alternatives are prompt libraries or single-agent wrappers. SQAD gives you a full engineering team that collaborates, disagrees, and presents evidence.

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
