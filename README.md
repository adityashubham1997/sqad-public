<div align="center">

# SQUAD

### AI Development Framework — Multi-Agent, Multi-Model, Multi-IDE

[![npm](https://img.shields.io/npm/v/squad-public.svg)](https://www.npmjs.com/package/squad-public)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js >=18](https://img.shields.io/badge/Node.js-%3E%3D18.0-green.svg)](https://nodejs.org)
[![Tests](https://img.shields.io/badge/Tests-156%20passing-brightgreen.svg)](#testing)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success.svg)](#security--privacy)
[![IDEs](https://img.shields.io/badge/IDEs-7%20supported-blueviolet.svg)](#supported-ides)
[![Skills](https://img.shields.io/badge/Skills-33%20commands-orange.svg)](#skills-slash-commands)

</div>

---

## What is SQUAD?

SQUAD is an open-source framework that gives your AI coding assistant a **team of 32 specialized agents** — each with a distinct professional lens — that collaborate on every task.

Instead of one general-purpose model trying to do everything, SQUAD dispatches specialists:

```
You:    "/dev-task — implement JWT authentication"

SQUAD:  Phase 1  → Nova finds 2 missing acceptance criteria in the story
        Phase 2  → Atlas flags rate-limiting gap, shows KG blast radius
        Phase 3  → Forge writes code matching your patterns, not boilerplate
        Phase 4  → Cipher generates tests following your test framework
        Phase 5  → Raven + Sentinel review for logic bugs + security issues
        Phase 6  → PR created, tracking logged
        You approve at every phase before it proceeds.
```

**No vendor lock-in. No cloud dependency. Works offline. Zero npm dependencies.**

---

## Table of Contents

**Getting started**
- [Installation](#installation)
- [Setup](#setup)
- [Quick Start](#quick-start)
- [All 33 Skills](#skills-slash-commands)
- [All 32 Agents](#agents)

**Going deeper**
- [How SQUAD Works — The 3 Orchestrators](#how-squad-works--the-orchestrators)
- [Knowledge Graph](#knowledge-graph)
- [Financial & Consulting Analysis Suite](#financial--consulting-analysis-suite)
- [Skill Self-Evolution — /evolve](#skill-self-evolution--evolve)
- [Token Compression Engine](#token-compression-engine)
- [How SQUAD Thinks — Internal Architecture](#how-squad-thinks--internal-architecture)
- [Configuration Reference](#configuration-reference)

**Reference**
- [Supported IDEs](#supported-ides)
- [Supported Model Providers](#supported-model-providers)
- [Setup Flow — Two Paths](#setup-flow--two-paths)
- [Adding a New Language Model](#adding-support-for-a-new-language-model)
- [Adding a New IDE](#adding-support-for-a-new-ide)
- [Security & Privacy](#security--privacy)
- [Testing](#testing)
- [FAQ](#faq)
- [Contributing](#contributing)
- [Credits & Acknowledgments](#credits--acknowledgments)

---

## Installation

### Option A — npm (recommended)

```bash
npx squad-public init
```

With specific IDEs:

```bash
npx squad-public init --ide claude,cursor,windsurf
```

### Option B — curl (no npm required)

```bash
curl -fsSL https://raw.githubusercontent.com/adityashubham1997/sqad-public/main/install.sh | bash
```

**Requirements:** Node.js >= 18. Git required for the curl method.

**What `init` does in ~10 seconds:**
1. Copies `squad-method/` to your workspace (agents, skills, fragments, tools)
2. Detects your tech stack — 15 languages, 40+ frameworks, cloud, CI/CD, IaC, databases, API specs
3. Builds knowledge graphs for each git repo
4. Deploys 33 skills to your installed IDEs
5. Generates `config.yaml` with everything detected

On subsequent runs, `init` **syncs** new agents, skills, tools, and fragments from the package while preserving your `config.yaml` and `output/` directory.

---

## Setup

After installation, run `/squad-setup` inside your IDE:

```
/squad-setup
```

This asks **3 required + 6 optional questions** that can't be auto-detected:

| # | Question | Required |
|---|---|---|
| 1 | Your name | ✅ |
| 2 | Your role | ✅ |
| 3 | Team name | ✅ |
| 4 | Company name | |
| 5 | Industry / domain | |
| 6 | Project name | |
| 7 | Project description | |
| 8 | Project type | |
| 9 | Sprint board URL → auto-detects Jira/Linear/GitHub/Shortcut/Notion | |

Setup also auto-detects your git config, scans repos, runs `/refresh` to build context files, and shows a **config completeness score** at the end.

> Without `/squad-setup`, SQUAD still works — tech detection ran at install. But agents won't know your name, team, or project context.

---

## Quick Start

After setup, try these in your IDE:

| Command | What it does |
|---|---|
| `/dev-task` | Full 6-phase implementation: analyse → spec → code → test → review → PR |
| `/review-code` | Pre-commit review by Forge + Raven + Sentinel |
| `/brainstorm` | Multi-agent ideation session |
| `/financial-analysis` | Quant-grade forensic financial analysis |
| `/refresh` | Scan workspace, rebuild knowledge graphs and context |
| `/health` | Agent effectiveness report with skill utility scores |

Every skill pauses at **user gates** — you approve before each phase advances.

---

## Skills (Slash Commands)

All 33 commands available after install:

| Skill | Agents | Description |
|---|---|---|
| `/dev-task` | Nova, Atlas, Forge, Cipher, Raven, Sentinel | Full 6-phase implementation pipeline with user gates |
| `/review-code` | Forge, Raven, Sentinel | Quick pre-commit review of uncommitted changes |
| `/review-pr` | Raven, Atlas, Sentinel, Forge, Cipher, Catalyst | Full pull request code review |
| `/review-story` | Raven, Atlas, Sentinel, Forge, Cipher | Validate implementation against acceptance criteria |
| `/qa-task` | Cipher, Sentinel, Raven | End-to-end QA workflow: dependencies → test plan → tests |
| `/test-story` | Cipher, Sentinel | Story-aware test generation following existing patterns |
| `/test-repo` | Cipher | Run test suite, analyze results, report coverage |
| `/test-project` | Cipher | Cross-repo test health report |
| `/dev-analyst` | Nova, Atlas, Oracle, Forge | Deep story analysis: feasibility, architecture, effort |
| `/brainstorm` | All agents | Multi-perspective brainstorming session |
| `/assemble` | All agents | Full group discussion — architecture debates, post-mortems |
| `/create-prd` | Compass, Nova, Atlas, Oracle | Multi-agent product requirements document |
| `/create-story` | Compass, Nova | Well-formed story with GIVEN/WHEN/THEN acceptance criteria |
| `/financial-analysis` | Ledger, Herald, Sage, Maven, Quant, Prism-Adversarial | Quant-grade forensic financial analysis (5-phase pipeline) |
| `/market-research` | Oracle, Sage, Herald, Prism-Adversarial | Structural market and industry deep-dive |
| `/consulting-brief` | Maven, Sage, Prism-Adversarial, Quant | Strategic problem architecture with decision science |
| `/evolve` | — | Skill self-evolution: analyze tracking → propose edits → branch |
| `/health` | — | Agent effectiveness report, skill utility scores, evolution candidates |
| `/refresh` | — | Scan workspace, rebuild KG, regenerate context files |
| `/refresh-git` | — | Enrich context from PR review history and git patterns |
| `/setup` | Tempo | Configure user, team, company, project, tracker |
| `/standup` | Tempo | Auto-generate daily standup from git + tracker |
| `/retro` | Tempo, Compass, Scribe | Sprint retrospective with tracker data |
| `/current-sprint` | Tempo | Sprint status at a glance |
| `/ai-ideate` | — | Design agentic workflow and AI automation ideas |
| `/ai-workflow-audit` | — | Audit existing AI/LLM integrations in the codebase |
| `/data-audit` | Neuron, Prism | ML pipeline and data quality audit |
| `/db-audit` | Dynamo | Database schema, query performance, migration safety |
| `/infra-audit` | Stratos, Aegis | Infrastructure observability and monitoring audit |
| `/os-audit` | Kernel | OS-level code, process management, systems patterns |
| `/game-review` | Pixel, Quest | Game engine code: performance, networking, design |
| `/git-learn` | Scribe | Extract learnings from PR history, enrich CONTEXT.md |
| `/product-researcher` | Oracle, Compass | Deep product research across tracker, web, codebase |

---

## Agents

SQUAD ships with **32 specialized agents** across four domains:

### Dev Agents (27)

| Agent | Role | Primary Skills |
|---|---|---|
| **Nova** | Requirements Analyst | AC validation, gap detection, story structuring |
| **Atlas** | Solution Architect | Architecture impact, blast radius, threat modeling |
| **Forge** | Senior Engineer | Code implementation, pattern compliance, self-review |
| **Cipher** | Test Engineer | Test generation, coverage analysis, TDD |
| **Sentinel** | QA Architect | Test strategy, risk-based planning, pyramid balance |
| **Raven** | Adversarial Reviewer | Logic bugs, edge cases, second-order effects |
| **Shadow** | Security Engineer | Cloud/code/infra security, pen-test mindset |
| **Catalyst** | Performance Engineer | Perf review, N+1 detection, scalability |
| **Oracle** | Research Analyst | Domain research, precedent analysis, codebase investigation |
| **Scribe** | Technical Writer | Documentation, changelog, API docs |
| **Compass** | Product Manager | Value framing, story validation, scope control |
| **Tempo** | Delivery Manager | Sprint status, velocity, retrospectives |
| **Phoenix** | Synthesis Agent | Consolidates multi-agent findings into verdicts |
| **Aegis** | Security Architect | Threat modeling, encryption, auth patterns |
| **Stratos** | Cloud Architect | Cloud infra, IaC, cost optimization |
| **Kernel** | Systems Engineer | OS-level, memory, concurrency, C/C++ |
| **Neuron** | ML Engineer | ML pipelines, model evaluation, data quality |
| **Prism** | Data Analyst | SQL, analytics, data models, dashboard quality |
| **Dynamo** | Database Engineer | Schema design, migrations, indexing strategy |
| **Pixel** | Game Developer | Game engine code, render pipelines |
| **Quest** | Game Designer | Mechanics, balance, progression |
| **Lore** | Narrative Designer | Dialogue, world-building |
| **Flux** | Creative Problem Solver | Alternative approaches, simplification |
| **Titan** | Quality Gate | Strict standards enforcement |
| **Spark** | AI Developer | AI/ML framework integration |
| **Muse** | AI Researcher | Research synthesis, paper analysis |
| **Neuron** | ML Engineer | Pipelines, model eval, data drift |

### Financial & Consulting Agents (5 new in v1.5)

| Agent | Role | Specialty |
|---|---|---|
| **Ledger** | Forensic Quantitative Analyst | Beneish M-Score, Benford's Law, accrual anomaly, footnote forensics |
| **Herald** | Quantitative Intelligence Analyst | Granger causality signals, Shannon entropy, Bayesian composite scoring |
| **Sage** | Structural Quantitative Researcher | Industry CAS modeling, Bass diffusion, power law, causal inference |
| **Maven** | Quantitative Strategic Architect | Bayesian decision theory, EVPI, Kelly criterion, mechanism design |
| **Quant** | Chief Risk & Mathematical Analyst | EVT tail risk, copulas, ruin probability, bootstrap CI |
| **Prism-Adversarial** | Adversarial Epistemics | 12-lens framework, superforecasting, Dutch Book coherence audit |

Agents are **lazy-loaded** — only agents needed for the current skill are loaded into context.

---

## How SQUAD Works — The Orchestrators

SQUAD has three orchestration layers:

```
┌──────────────────────────────────────────────────────┐
│                  SKILL (e.g. /dev-task)               │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │    AGENT     │  │    MODEL    │  │  DISPATCH   │  │
│  │ ORCHESTRATOR │──│ ORCHESTRATOR│──│ ORCHESTRATOR│  │
│  │              │  │             │  │             │  │
│  │  WHO runs?   │  │ WHICH model?│  │  HOW to run?│  │
│  │  What order? │  │ What tier?  │  │  Parallel   │  │
│  │  Dependencies│  │ What effort?│  │  or seq?    │  │
│  └──────────────┘  └─────────────┘  └─────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 1. Agent Orchestrator

Decides WHICH agents run, in WHAT order, with WHAT dependencies.

Every skill declares its agents. The orchestrator:
1. Builds a **dependency DAG** — some agents need other agents' output first
2. Identifies **parallel layers** — agents with no dependencies run simultaneously
3. Enforces **completion verification** — every declared agent MUST run (no skipping)
4. Validates **output contracts** — each agent produces structured output

```
Review Phase example (5 agents):

Layer 1 (parallel):   Raven + Atlas + Sentinel + Forge + Cipher
                      ↓ sync barrier — all 5 must finish
Layer 2 (sequential): Phoenix (synthesizes findings into verdict)
                      ↓
User Gate:            YOU approve/reject
```

Key rules — **R8: Anti-Skip** (never skip an agent to save time), **R9: Gate Ledger** (phases don't advance without gate approval), **R3: Output Contracts** (agent outputs are schema-validated).

> Full protocol: `squad-method/fragments/agent-orchestrator.md`

---

### 2. Model Orchestrator (Multi-Model Routing)

Decides WHICH AI model each agent uses, from WHICH provider.

```
Agent      Task                     Model Assigned      Why
──────     ────────────────────     ──────────────      ───────────────────
Raven      Adversarial review       Claude Opus 4       Heavy reasoning
Oracle     Research + long docs     Gemini 2.5 Pro      1M context window
Forge      Code generation          Claude Sonnet 4     Good balance
Scribe     Format documentation     GPT-4o-mini         Fast structured output
Sentinel   Security analysis        OpenAI o3           Deep reasoning
```

Routing priority chain:

```
workspace_mode → phase_override → blast_radius → budget_cap → agent_override → default
```

| Mode | Behavior |
|---|---|
| `balanced` (default) | Smart per-agent assignment |
| `quality` | Everything gets heavy models |
| `budget` | Everything gets fast models |

**Auto-upgrade:** When an agent is about to modify a **god node** (KG degree > 20), the router automatically upgrades to the heavy tier.

> Implementation: `squad-method/tools/router/`

---

### 3. Dispatch Orchestrator (Parallel Execution)

Decides HOW agents actually execute based on your IDE's capabilities:

| Path | Mechanism | IDEs | True Parallelism |
|---|---|---|---|
| **A** | Native subagent `Agent()` tool | Claude Code | ✅ Max 5 |
| **B** | CLI subprocess / API calls | Codex, Kiro, Gemini | ✅ Max 3 |
| **C** | Sequential simulation | Windsurf, Cursor, Antigravity | ❌ One at a time |

Path C delivers all the same correctness guarantees (dependency ordering, validation, anti-skip, gate enforcement) — only wall-clock time differs.

> Implementation: `squad-method/tools/dispatch/`

---

## Supported IDEs

| IDE | Parallel | Multi-Model | Hook Enforcement | Skill Format |
|---|---|---|---|---|
| **Claude Code** | ✅ Max 5 | ✅ Anthropic + OpenAI + Google | Automatic (settings.json) | `.claude/skills/` |
| **Codex** (OpenAI) | ✅ Max 3 | ✅ OpenAI + Anthropic | Script (hooks.sh) | `.codex/skills/` |
| **Kiro** (AWS) | ✅ Max 3 | ✅ Bedrock + Q + OpenAI + Google + Anthropic | Script (hooks.sh) | `.kiro/skills/` |
| **Gemini** (Google) | ✅ Max 3 | ✅ Google + Anthropic + OpenAI | Script (hooks.sh) | `.gemini/skills/` |
| **Cursor** | ❌ Sequential | ✅ Anthropic + OpenAI + Google | Script (hooks.sh) | `.cursor/rules/*.mdc` |
| **Windsurf** | ❌ Sequential | ❌ Single model | Script (hooks.sh) | `.windsurf/skills/` |
| **Antigravity** | ❌ Sequential | ✅ Anthropic + OpenAI | Script (hooks.sh) | `.antigravity/skills/` |

---

## Supported Model Providers

| Provider | Models | Best for |
|---|---|---|
| **Anthropic** | Claude Opus 4, Claude Sonnet 4 | Reasoning, code generation, implementation |
| **OpenAI** | o3, GPT-4o, GPT-4o-mini | Security reasoning, fast structured output |
| **Google** | Gemini 2.5 Pro, Gemini 2.0 Flash | Long-context research (1M tokens) |
| **Amazon Bedrock** | Claude via Bedrock, Titan, Llama 3 | AWS-native multi-model gateway |
| **Amazon Q** | Q Developer | AWS-specific codebase knowledge |

---

## Knowledge Graph

SQUAD includes a built-in, zero-dependency knowledge graph builder:

```bash
node squad-method/tools/knowledge-graph/build.js <repo-path>
# Optional: function-level AST analysis
node squad-method/tools/knowledge-graph/build.js <repo-path> --ast
```

### 4-Pass Analysis Pipeline

| Pass | Module | What It Does |
|---|---|---|
| 1 | `build.js` | Scan source files, extract imports, build dependency edges |
| 2 | `git-pass.js` | Git history: co-change patterns, churn hotspots, author count |
| 3 | `cluster.js` | Label propagation community detection (graph-aware, not directory-based) |
| 4 | `analyze.js` | Surprise edges, hotspot scoring, complexity grading (A–F) |

Optional Pass 5 (`--ast`): function-level nodes and call-graph edges via regex or tree-sitter.

### Supported Languages (15)

JavaScript, TypeScript, Python, Go, Rust, Java, Ruby, C, C++, C#, Swift, Kotlin, Scala, PHP, Protocol Buffers, GraphQL

### Output

```
<repo>/knowledge-graph-out/
├── graph.json      ← Full graph: nodes, edges, communities, hotspots, complexity
├── graph.html      ← Interactive D3-powered force-directed visualization
└── KG_REPORT.md    ← Human-readable analysis for agents
```

### Query API

Agents can query the graph programmatically via `squad-method/tools/knowledge-graph/query.js`:

```javascript
import { loadGraph, reverseDeps, godNodes, untestedFiles, ripple, shortestPath } from './query.js';

const graph = loadGraph('/path/to/repo');
reverseDeps(graph, 'lib/auth/login.js');  // what breaks if I change this?
godNodes(graph);                          // files with degree > 30
untestedFiles(graph);                     // source files with no tests
ripple(graph, 'lib/auth/login.js', 2);    // 2-hop blast radius
```

### Context Prioritization

Given a task description, `prioritize.js` ranks which files agents should read first:

```javascript
import { prioritize } from './prioritize.js';
const ranked = prioritize('fix authentication login flow', graph, { topN: 20 });
// Returns files sorted by: keyword match × degree centrality × test coverage gap
```

### Incremental Updates

For large repos, `incremental.js` updates only affected nodes/edges instead of a full rebuild — falls back to full rebuild if > 30% of files changed:

```javascript
import { analyzeChanges, applyIncrementalUpdate } from './incremental.js';
const { canIncremental, changedFiles } = analyzeChanges(repoPath);
```

---

## Financial & Consulting Analysis Suite

New in v1.5. Six quant-grade agents produce forensic-quality financial and strategic analysis.

> **Design principle:** "McKinsey gives you frameworks. Renaissance Technologies gives you edge. Every claim is falsifiable. Every conclusion has a confidence interval."

### Skills

| Skill | Agents | What It Produces |
|---|---|---|
| `/financial-analysis` | Ledger → Herald → Sage → Quant → Maven → Prism-Adversarial | 5-phase forensic pipeline: diverge → 12-lens → debate → converge → recommend |
| `/market-research` | Oracle, Sage, Herald, Prism-Adversarial | Industry structure, TAM validation, competitive dynamics |
| `/consulting-brief` | Maven, Sage, Prism-Adversarial, Quant | Strategic brief with mandatory pre-mortem + EVPI + Kelly criterion |

### 4-Gate Verification Protocol

Every major claim goes through four gates before appearing in a recommendation:

```
GATE 1: EMPIRICAL — backed by observable data? cite source + date
GATE 2: MATHEMATICAL — formula stated? sensitivity tested? CI provided?
GATE 3: LOGICAL/CAUSAL — mechanism stated? confounders identified?
GATE 4: ADVERSARIAL — strongest counterargument? what would disprove this?
```

Claims are classified: `[VERIFIED-4]` (all gates) → `[VERIFIED-3]` → `[VERIFIED-2]` → `[UNVERIFIED]` (never used in recommendations).

### What the Agents Do

**Ledger** (forensic): Beneish M-Score, Benford's Law analysis, Lev-Thiagarajan 12 signals, accrual anomaly (Jones Model), footnote forensics, DuPont 5-factor decomposition, forensic ratio screens (15+).

**Herald** (signals): Granger causality validation on every claimed signal, Shannon entropy of earnings calls, options-implied probability distributions (Breeden-Litzenberger), Bayesian composite signal scoring — P(decline/advance/sideways).

**Sage** (structural): Bass diffusion model, power law industry analysis (Clauset-Shalizi-Newman), formal causal inference (DiD, IV, DAGs), ergodicity check on growth projections, complex adaptive systems modeling.

**Maven** (strategy): Bayesian decision theory + EVPI, mechanism design, mandatory pre-mortem (7+ failure paths), Kelly criterion for capital allocation, DMDU for genuine uncertainty.

**Quant** (risk): Extreme Value Theory for tails (not normal distribution), copula tail dependence, ruin probability, bootstrap CI for small samples, AIC/BIC model selection.

**Prism-Adversarial** (adversarial): 12-lens analysis, superforecasting protocol (Tetlock), Dutch Book coherence audit, reference class forecasting, falsifiability certification, Fermi cross-checks on quantitative claims > $100M.

---

## Skill Self-Evolution — /evolve

SQUAD learns from its own execution history and proposes evidence-backed improvements to its own skills.

```
/evolve
```

### Protocol

```
Phase 1 — EVIDENCE COLLECTION
  Read tracking.jsonl (last 100 records) + meta-skill.md
  Separate: successes (completed/pr_created) vs failures (user_aborted/error)
  Group by skill. Skip skills with < 5 records.

Phase 2 — REFLECT
  Per skill: success patterns, failure patterns, contrast, recurring findings
  Produce "gradients" — proposed edits with evidence_records[]

Phase 3 — QUALITY GATE (SkillLens rubric)
  Score each edit on: Specificity (1-5), Actionability (1-5), Grounding (1-5)
  Gate: all three must score ≥ 3. Rejects: "be more thorough" (specificity=1)

Phase 4 — BOUNDED UPDATE
  Rank by grounding × specificity. Select top 3 (hard cap — gradient clipping).
  Show each edit with evidence. User: [Accept] [Reject] [Modify]

Phase 5 — COMMIT ON BRANCH
  git checkout -b evolve/YYYY-MM-DD-cycle-N
  One commit per accepted edit. Update meta-skill.md.
  Validate by running N tasks. If better → merge. If not → revert.
```

**Key design constraints:**
- Max 3 edits per cycle (gradient clipping)
- Edits land on a branch, never main (slow update pattern)
- User gate at every edit — never auto-applied
- Both success AND failure records analyzed (asymmetric analysis produces bad rules)
- `/health` shows skill utility grades (A–D) and flags evolution candidates

---

## Token Compression Engine

New in v1.5. Native JS compression pipeline — no external dependencies.

```javascript
import { compress } from 'squad-method/tools/compress/index.js';

const { compressed, stats } = compress(toolOutput);
// stats: { original: 1200, compressed: 480, ratio: 0.40, type: 'code' }
```

### Pipeline

```
Input → Detect content type → Mask (protect errors, assertions, KG data)
     → Domain handler → Universal compressor → Unmask → Output + stats
```

| Content Type | Handler | Typical Ratio |
|---|---|---|
| Code | Strip comments, collapse imports | 40–60% |
| Grep output | Group by file, deduplicate | 50–70% |
| JSON | Minify, truncate arrays > 10 items | 60–80% |
| Logs / errors | Collapse repeated lines, summarize stack traces | 50–70% |
| File listings | Summarize by extension, collapse deep paths | 60–80% |

**Protected content (never compressed):** error messages, test assertions, KG graph data, user input.

Enable in config:

```yaml
token_budget:
  compression: native    # none | native
  compress_targets: [file_reads, grep_results, context_files, file_listings, log_output]
```

---

## How SQUAD Thinks — Internal Architecture

### The Grounding Waterfall

Every skill follows an evidence-first protocol before doing any work:

```
Level 0: CONTEXT.md / CLAUDE.md      ← identity, rules, repo map (~300 tokens)
         DEEP-CONTEXT.md              ← architecture from KG (if exists)
         KG_REPORT.md                 ← pre-computed analysis summary

Level 1a: graph.json (Knowledge Graph) ← dependency edges, god nodes, communities
          (BEFORE any grep)             answers "what depends on X?" instantly

Level 1b: grep / code search          ← find patterns and similar implementations
          (AFTER KG, only if needed)

Level 2: Fragments                    ← conditional: rubric, stack, cloud, tracker
         (loaded if config matches)

Level 4: Nothing found                ← STOP — present design assumptions, await approval
```

**Why this matters:** The KG answers in one read what would otherwise require 3–10 grep commands. Pre-computing blast radius, test coverage, and god-node status saves ~80% of exploration tokens per typical workflow.

### Project Knowledge Structure

```
workspace/
├── CONTEXT.md              ← Root context (always loaded, ~300 tokens)
├── CLAUDE.md / GEMINI.md / AGENTS.md   ← IDE-specific copies
├── DEEP-CONTEXT.md         ← Architecture + data model + API surface + deployment
│
├── squad-method/
│   ├── config.yaml         ← Single source of truth for all configuration
│   ├── agents/             ← 32 agent personas (lazy-loaded per skill)
│   │   ├── _base-agent.md  ← Base protocols: grounding, communication, git, tracking
│   │   ├── nova.md         ← Nova: requirements analyst
│   │   ├── atlas.md        ← Atlas: solution architect
│   │   └── ...             ← 30 more agents
│   ├── skills/             ← 33 skill definitions (one per slash command)
│   ├── fragments/          ← Conditional knowledge modules (rubric, stack, cloud, etc.)
│   ├── tools/
│   │   ├── knowledge-graph/  ← KG builder, query API, prioritize, incremental, AST pass
│   │   ├── compress/         ← Token compression pipeline (detect, mask, handlers)
│   │   ├── router/           ← Multi-model routing engine
│   │   └── dispatch/         ← Parallel execution adapters per IDE
│   └── output/
│       ├── tracking.jsonl    ← Operation log (feeds /health, /evolve)
│       └── meta-skill.md     ← Optimizer memory across /evolve cycles
│
└── <repo>/knowledge-graph-out/
    ├── graph.json            ← Full dependency graph
    ├── graph.html            ← Interactive visualization
    └── KG_REPORT.md          ← Human-readable analysis
```

### Fragment System — Conditional Loading

Fragments load based on your project's detected config:

```
squad-method/fragments/
├── rubric/
│   ├── base.md              ← Always loaded for reviews
│   ├── javascript.md        ← Loaded if stack.languages includes "javascript"
│   ├── python.md            ← Loaded if stack.languages includes "python"
│   └── ...
├── stack/
│   ├── javascript.md
│   ├── python.md
│   └── ...
├── cloud/
│   ├── aws.md               ← Loaded if cloud.providers includes "aws"
│   └── monitoring.md
├── tracker/
│   ├── jira.md              ← Loaded if tracker.type == "jira"
│   └── linear.md
├── financial-analysis-protocol.md   ← Financial analysis pipeline
├── quant-verification-gates.md      ← 4-gate claim verification
├── forensic-checklist.md            ← Ledger pre-flight checklist
├── tdd-scaffold.md                  ← Characterization test protocol (Phase 1.5)
├── token-compression.md             ← Compression protocol for agents
├── kg-query-protocol.md             ← KG query recipes for agents
├── review-protocol.md               ← Review phase rules
├── tracking-protocol.md             ← tracking.jsonl schema
└── tdd-workflow.md                  ← TDD best practices
```

A Python/AWS/Jira project loads Python rubric + AWS fragments + Jira tracker. A JavaScript/no-cloud project loads a completely different set. Agents never see irrelevant knowledge.

### The dev-task Context Digest

Phase 1 of `/dev-task` produces a mandatory **Context Digest** before any analysis:

```
━━━ CONTEXT DIGEST ━━━

Files Read:
  ✅ CONTEXT.md (repo) — 200 lines
  ✅ DEEP-CONTEXT.md — 180 lines
  ✅ KG_REPORT.md — 45 nodes, 38 edges
  ❌ complete-flow.md — not found

Scope Analysis (from KG):
  Files in change path: 4
  God nodes in scope: none
  Untested files in scope: lib/generate/ide-skills.js
  Cross-community changes: NO

Blast Radius: LOW — 3 reverse deps, 2 test files covering scope

Assumptions:
  [ASSUMPTION-1]: ... — CONFIDENCE: HIGH
```

Phase 1 is incomplete until this digest is populated. Phase 1.5 writes **characterization tests** on the current behavior before any implementation begins.

---

## Configuration Reference

`squad-method/config.yaml` is auto-generated at install and filled in by `/setup`. Key sections:

```yaml
# Company & Project (set by /setup)
company:
  name: ""
  domain: ""                   # fintech | healthcare | saas | gaming | ...
  compliance: []               # soc2 | hipaa | pci-dss | gdpr

project:
  name: ""
  type: ""                     # web-app | api | library | cli | mobile | infra | monorepo | game | ai-ml
  maturity: ""                 # greenfield | brownfield | migration

# Tech Stack (auto-detected)
stack:
  languages: []
  frameworks: []
  test_command: "npm test"

# Model Routing
model_routing:
  default: "default"           # fast | default | heavy
  mode: "balanced"             # balanced | quality | budget
  execution_path: "auto"       # auto | agent_tool | cli | sequential
  agent_overrides: {}          # e.g. { raven: heavy, scribe: fast }
  complexity_upgrade:
    enabled: true
    blast_radius_threshold: 20 # KG degree → auto-upgrade to heavy

# Token Budget (v1.5)
token_budget:
  max_context_tokens: 50000
  compression: none            # none | native
  fragment_priority:
    - _base-agent
    - review-rubric
    - kg-query-protocol
    - tdd-workflow
    - review-protocol
    - tracking-protocol
  never_compress:
    - test_output
    - error_messages
    - kg_data
    - user_input

# Knowledge Graph
knowledge_graph:
  enabled: true
  auto_rebuild: true
  ast_enabled: false           # function-level analysis (opt-in)
  ast_languages: [js, ts, py]

# Agents
agents:
  built_in: 32
  custom: []                   # add custom agents here

# IDEs (auto-detected)
ides:
  installed: ["claude", "windsurf", "cursor", "codex", "kiro", "gemini", "antigravity"]
```

---

## Setup Flow — Two Paths

```
┌────────────────────────────────────────────────────────────┐
│  Path 1: npx squad-public init  (programmatic, ~10s)        │
│  ──────────────────────────────────────────────────────     │
│  1. Sync squad-method/ (agents, skills, tools, fragments)  │
│  2. detectStack() → 15 languages, 40+ frameworks           │
│  3. detectCloud() → providers / IaC / containers / CI      │
│  4. detectTracker() → jira / linear / github / shortcut    │
│  5. detectIDEs() → all 7 IDEs                              │
│  6. updateConfig() → write detected values                 │
│  7. Create output dirs                                     │
│  8. Scan repos                                             │
│  9. Build knowledge graphs                                 │
│  10. Generate context files (CONTEXT.md, DEEP-CONTEXT.md)  │
│  11. Deploy 33 skills to installed IDEs                    │
│  → Config populated with TECH details.                     │
│    company/project/user still empty → run /setup           │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│  Path 2: /squad-setup  (conversational, in-IDE)            │
│  ──────────────────────────────────────────────────────    │
│  Step 1: Verify installation                               │
│  Step 2: Required (3 Qs): name, role, team                 │
│  Step 3: Optional (6 Qs): company, domain, project...      │
│  Step 4: Extended artifact scan (docs, schemas, infra, CI) │
│  Step 5: Write all values to config.yaml                   │
│  Step 6: Run /refresh                                      │
│  Step 7: Offer /git-learn                                  │
│  → FULL config. Config completeness score shown.           │
└────────────────────────────────────────────────────────────┘
```

### MCP Tracker Integration

Setup guides you through connecting a tracker MCP server so agents can query stories directly:

| Tracker | MCP Server | Config |
|---|---|---|
| Jira | `@anthropic/mcp-jira` | `.{ide}/mcp.json` |
| Linear | `@anthropic/mcp-linear` | `.{ide}/mcp.json` |
| GitHub Issues | Built-in (Claude Code) | `.{ide}/mcp.json` |
| Shortcut | `shortcut-mcp-server` | `.{ide}/mcp.json` |
| Notion | `@modelcontextprotocol/server-notion` | `.{ide}/mcp.json` |

---

## Adding Support for a New Language Model

### Step 1 — Add provider to registry

Edit `squad-method/tools/router/providers.cjs`:

```javascript
var MISTRAL = {
  id: 'mistral',
  models: { fast: 'mistral-small-latest', default: 'mistral-large-latest', heavy: 'mistral-large-latest' },
  supports_effort: false,
  max_context: 128000,
};
```

### Step 2 — Add to IDE provider mapping

```javascript
cursor: {
  primary: ANTHROPIC,
  secondary: [OPENAI, GOOGLE, MISTRAL],  // ← add here
}
```

### Step 3 — (Optional) Agent affinity rules

```javascript
var AGENT_PROVIDER_AFFINITY = {
  scribe: { prefer: 'mistral', tier: 'fast', reason: 'structured_output' },
};
```

### Step 4 — Run tests

```bash
cd sqad-public && node --test test/providers.test.js
```

---

## Adding Support for a New IDE

### Step 1 — Create a transformer

`lib/transform/volta.js`:

```javascript
import { deploySkillDir } from './base.js';

export function deploy(workspacePath, skill, options = {}) {
  return deploySkillDir(workspacePath, skill, '.volta', options);
}
export const IDE_ID = 'volta';
export const SKILLS_PATH = '.volta/skills';
```

### Step 2 — Register in the IDE skills generator

`lib/generate/ide-skills.js`:

```javascript
const TRANSFORMER_MAP = {
  // ...existing...
  volta: '../transform/volta.js',
};
```

### Step 3 — Add IDE detection

`lib/detect/ide.js`:

```javascript
IDE_CHECKS.push({ id: 'volta', name: 'Volta', configDir: '.volta', binary: 'volta' });
```

### Step 4 — Create a dispatch adapter

`squad-method/tools/dispatch/adapter-volta.cjs`:

```javascript
var BaseAdapter = require('./adapter-base.cjs');
function VoltaAdapter(config) { BaseAdapter.call(this, 'volta', config); }
VoltaAdapter.prototype = Object.create(BaseAdapter.prototype);
// Implement: dispatchAgent, dispatchParallel, buildMultiModelPlan
```

### Step 5 — Add to provider mapping

`providers.cjs`:

```javascript
volta: {
  primary: ANTHROPIC,
  secondary: [OPENAI],
  supports_parallel: false,
  parallel_mechanism: 'sequential',
  max_parallel: 1,
}
```

### Step 6 — Update hooks and parity test

```bash
# Add detection in hooks.sh
# Add to ide-parity-test.sh
bash squad-method/tools/ide-parity-test.sh
```

---

## Security & Privacy

### Zero-Footprint Design

- **Zero network calls** — SQUAD never phones home, no telemetry, no analytics
- **Zero dependencies** — `package.json` has 0 runtime dependencies
- **Local-only tracking** — `tracking.jsonl` stays on your machine
- **No API keys stored** — environment variables only, never written to files
- **Git exclude** — SQUAD artifacts use `.git/info/exclude` (never modifies `.gitignore`)

### 5-Layer Safety Hooks

`squad-method/tools/hooks.sh` runs at skill boundaries:

| Layer | Hook | What It Checks |
|---|---|---|
| 1 | Skills Gate | SQUAD installed, config present, base-agent present |
| 2 | Pre-Edit Guard | Blocks edits to auto-generated files (`dist/`, lock files, `*.generated.*`) |
| 3 | Secret Detection | Scans for API keys, AWS keys, private keys before commits |
| 4 | Progress Save | Forces progress doc update when context window fills (~40 messages) |
| 5 | Gate Ledger | Verifies all phase gates passed before advancing |

In Claude Code, hooks fire automatically at the harness level (impossible to bypass). In all other IDEs, hooks fire when the skill calls `hooks.sh`.

### Destructive Action Guard

Before any destructive action (delete, drop, force push), agents:
1. State exactly what will be destroyed
2. Ask for explicit confirmation
3. Wait for approval before proceeding
4. Never combine destructive actions

---

## Testing

```bash
# Unit tests
node --test test/*.test.js

# Full suite (unit + e2e)
npm run test:all

# IDE parity check
bash squad-method/tools/ide-parity-test.sh
```

Current: **156 unit tests + 62 e2e assertions, 0 failures**.

Test coverage includes:
- Stack / cloud / IDE / tracker detection
- IDE skill deployment (all 7 IDEs)
- Knowledge graph: language patterns (15 languages), dot-dir fix, Go import regex
- KG prioritization, incremental updates, query API
- AST extraction (JS/TS, Python, Go, Java)
- Compression pipeline (all handlers, mask integrity, end-to-end)
- Transform base (MDC frontmatter, frontier stripping)
- Provider routing, dispatch adapters

---

## FAQ

### How is SQUAD different from just using an AI IDE?

AI IDEs give you one model in a chat. SQUAD adds:
- **32 specialized agents** with distinct review lenses
- **Pre-computed knowledge** via the knowledge graph — agents check dependency data before grepping
- **Conditional fragment loading** — only project-relevant knowledge is loaded
- **Phase-gated workflows** — complex tasks have user approval at each gate
- **Cross-IDE portability** — same agents, skills, and config across 7 IDEs
- **Self-evolution** — `/evolve` improves skills from execution history

### Do I need all 7 IDEs?

No. SQUAD auto-detects installed IDEs and deploys skills only to those. When you run `init` again after updating the package, new skills are synced to all detected IDEs automatically.

### What does "zero dependencies" mean?

`package.json` has literally `"dependencies": {}`. No npm packages. No supply chain risk. Every line of code is in the repo. The tradeoff: regex-based YAML handling instead of a library, and regex-based import parsing in the KG (with AST as an opt-in via `--ast`).

### How do agents find context without loading everything?

1. **Always loaded:** `CONTEXT.md` + `context/index.md` (~500 tokens)
2. **Per skill:** the skill declares which agents and fragments it needs
3. **Per config:** fragments auto-load based on detected stack/cloud/tracker
4. **Queried on demand:** `graph.json` is queried for specific files, never loaded in full

Target: < 8,000 tokens for agent + fragment loading per skill invocation.

### Why check the knowledge graph before grepping?

The KG pre-computes answers to the most common agent questions:
- "What depends on this file?" → graph edges (instant, one read)
- "Is this high-risk?" → god node flag + hotspot score (instant)
- "What tests cover this?" → test edges (instant)
- "What's the blast radius?" → 2-hop reachability query (instant)

Without the KG: 3–10 grep commands across the entire codebase. With the KG: one JSON read. Saves ~80% exploration tokens in typical workflows.

### What are god nodes?

Any file with more than 30 dependency connections (imports + importers). When an agent detects it's modifying a god node:
- Model router **auto-upgrades** to heavy tier
- Review requires **extra approval**
- KG report flags the full blast radius

### What's in `tracking.jsonl`?

Every skill run appends one JSON line with: skill name, agents dispatched, phases completed, review findings (critical/major/minor), outcome, assumptions count. This feeds:
- `/health` — agent effectiveness analysis, skill utility grades (A–D)
- `/evolve` — evidence-backed skill improvement proposals
- Quality gate (V2) — re-dispatches on low-quality output
- Learned classifier (V3 stub) — will predict optimal model tier

### Can I add custom agents?

Yes. Create a `.md` file in `squad-method/agents/` following the frontmatter format of existing agents. Add the agent name to `config.yaml → agents.custom`. The agent is then available to any skill that declares it.

### What are the financial agents useful for?

The six financial agents (`/financial-analysis`, `/market-research`, `/consulting-brief`) apply quant-fund grade methods — Beneish M-Score, Benford's Law, Granger causality, Kelly criterion, EVT tail risk, Dutch Book coherence — to produce analysis with explicit confidence intervals and falsifiable claims. Every conclusion includes a verification summary (VERIFIED-4 through UNVERIFIED) and a mandatory disclaimer.

### How does `/evolve` work safely?

Edits proposed by `/evolve` always land on a branch (`evolve/YYYY-MM-DD`), never main. The quality rubric requires specificity ≥ 3, actionability ≥ 3, and grounding ≥ 3 — vague rules fail and are rejected. Maximum 3 edits per cycle. User must explicitly accept each edit. After N runs on the branch, if outcomes improve, you merge; if not, you revert.

---

## Contributing

### Quick contributions
- **Bug reports** — open an issue with steps to reproduce
- **Feature suggestions** — open an issue with the use case
- **Typos / docs** — PR directly

### Code contributions

1. Fork and clone the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Follow existing patterns (look at similar files first)
4. Add tests — every new feature needs tests
5. Run: `npm run test:all`
6. Run parity check: `bash squad-method/tools/ide-parity-test.sh`
7. Submit PR with what and why

### What we're looking for

- New IDE adapters — see [Adding Support for a New IDE](#adding-support-for-a-new-ide)
- New model providers — see [Adding Support for a New Language Model](#adding-support-for-a-new-language-model)
- New language detection for KG (add to `LANGUAGE_PATTERNS` in `build.js`)
- Stack / cloud / tracker detection fragments
- Rubric modules for additional frameworks
- Bug fixes and test improvements

### Code style

- Use existing patterns — look at similar files before writing new ones
- Zero dependencies — don't add npm packages
- Tests required — if it's testable, test it
- ESM for `lib/` — CommonJS (`.cjs`) for `squad-method/tools/`

---

## Credits & Acknowledgments

### Direct Inspirations

| Source | What We Took | How SQUAD Uses It |
|---|---|---|
| **[Graphify (Karpathy)](https://github.com/karpathy)** | Knowledge graph extraction approach | KG builder: AST/import extraction, community detection, god nodes, git co-change coupling |
| **[Headroom (chopratejas)](https://github.com/chopratejas/headroom)** | Tool output compression pipeline | Inspired `squad-method/tools/compress/`: content-type detection → domain handlers → universal compression |
| **[SkillLens (Microsoft)](https://microsoft.github.io/SkillLens/)** | Skill quality rubric + utility scoring | `/evolve` quality gate: specificity × actionability × grounding. `/health` utility grades (A–D) |
| **[SkillOpt (Microsoft)](https://microsoft.github.io/SkillOpt/)** | Rollout → Reflect → Bounded Update | `/evolve` evolution loop: max 3 edits per cycle, slow-update on branch, meta-skill memory |
| **[RouteLLM (2024)](https://arxiv.org/abs/2406.18665)** | Learned model routing | 3-tier routing: rule-based → quality gate → classifier stub trained from `tracking.jsonl` |
| **[HyperAgentMeta (Meta 2026)](https://arxiv.org/abs/2602.00000)** | Self-improving agent loops | `/evolve` structure: tracking data → failure analysis → surgical skill diffs → human approval |

### Core Concepts

- **Multi-Agent Systems** — Multi-agent debate (Du et al., 2023), mixture-of-agents (Wang et al., 2024)
- **Agentic Coding** — Patterns from Claude Code, Devin, SWE-Agent, OpenHands
- **Knowledge Graphs for Code** — Graph-based dependency analysis inspired by Sourcegraph, CodeQL
- **TDD & Agile** — Review rubrics grounded in Martin, Fowler, Beck, Nygard, OWASP

### Financial Analysis Methodology

Academic citations for quantitative methods used by financial agents:

- Beneish (1999) — M-Score for earnings manipulation detection
- Sloan (1996) — Accrual anomaly: earnings persistence vs cash
- Lev & Thiagarajan (1993) — 12 fundamental signals predicting future returns
- Altman (1968, 2020) — Z-Score for bankruptcy prediction
- Benford (1938), Nigrini (2012) — Benford's Law for fraud detection
- Bass (1969) — Diffusion model for technology adoption
- Peters (2019) — Ergodicity economics
- Tetlock (2015) — Superforecasting and calibrated probability
- Pearl (2009) — Causal inference with DAGs
- Embrechts et al. (1997) — Extreme value theory for tail risk
- Kelly (1956) — Capital allocation criterion

### Model Providers

- **[Anthropic](https://anthropic.com)** — Claude Opus 4 & Sonnet 4
- **[OpenAI](https://openai.com)** — GPT-4o and o3
- **[Google DeepMind](https://deepmind.google)** — Gemini 2.5 Pro (1M context)
- **[Amazon AWS](https://aws.amazon.com/bedrock/)** — Bedrock, Titan, Amazon Q
- **[Meta AI](https://ai.meta.com)** — Llama models via Bedrock

### IDE Platforms

- **[Anthropic Claude Code](https://docs.anthropic.com/en/docs/claude-code)** — Native Agent() API for true parallel execution
- **[OpenAI Codex CLI](https://github.com/openai/codex)** — CLI subprocess dispatch
- **[AWS Kiro](https://kiro.dev)** — Bedrock multi-provider gateway
- **[Google Gemini CLI](https://github.com/google-gemini/gemini-cli)** — Vertex AI integration
- **[Cursor](https://cursor.com)** — Multi-model IDE, `.mdc` rule format
- **[Windsurf](https://codeium.com/windsurf)** — Cascade AI with skill/workflow system
- **[Antigravity](https://antigravity.dev)** — AI-native development environment

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built for developer experience, not vendor lock-in.**

[npm](https://www.npmjs.com/package/squad-public) · [Issues](https://github.com/adityashubham1997/sqad-public/issues) · [Contribute](#contributing)

</div>
