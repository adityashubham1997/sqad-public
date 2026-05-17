<div align="center">

# SQUAD

### AI Development Framework — Multi-Agent, Multi-Model, Multi-IDE

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js >=18](https://img.shields.io/badge/Node.js-%3E%3D18.0-green.svg)](https://nodejs.org)
[![Tests](https://img.shields.io/badge/Tests-89%20passing-brightgreen.svg)](#testing)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success.svg)](#security--privacy)
[![IDEs](https://img.shields.io/badge/IDEs-7%20supported-blueviolet.svg)](#supported-ides)
[![Models](https://img.shields.io/badge/Models-5%20providers-ff69b4.svg)](#supported-model-providers)

</div>

---

## What is SQUAD?

**SQUAD** is an open-source framework that makes your AI coding assistant smarter by giving it a team of specialized agents, each with a different expertise.

Think of it like this: instead of one general-purpose AI trying to do everything, SQUAD gives you a **squad of specialists** — an architect, a security expert, a code reviewer, a test writer, a documentation specialist — all working together on your code.

You type one command. SQUAD figures out which agents to dispatch, which AI model each agent should use, runs them in parallel where possible, and presents you with a consolidated result. You approve at every step.

```
You:     "Implement the user authentication story"

SQUAD:   Dispatches 6 agents across 6 phases:
         → Nova analyses requirements (finds 2 missing acceptance criteria)
         → Atlas assesses architecture impact (flags rate-limiting needed)
         → Forge writes code matching YOUR patterns (not generic boilerplate)
         → Cipher generates tests following YOUR test framework
         → Raven + Sentinel review for logic bugs + security issues
         → You approve at every phase before proceeding
```

**No vendor lock-in. No cloud dependency. Works offline. Zero npm dependencies.**

---

## Table of Contents

- [What is SQUAD?](#what-is-squad)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [How SQUAD Works — The Orchestrators](#how-squad-works--the-orchestrators)
  - [Agent Orchestrator](#1-agent-orchestrator)
  - [Model Orchestrator](#2-model-orchestrator-multi-model-routing)
  - [Dispatch Orchestrator](#3-dispatch-orchestrator-parallel-execution)
- [Supported IDEs](#supported-ides)
- [Supported Model Providers](#supported-model-providers)
- [Agents](#agents)
- [Skills (Slash Commands)](#skills-slash-commands)
- [Adding Support for a New Language Model](#adding-support-for-a-new-language-model)
- [Adding Support for a New IDE](#adding-support-for-a-new-ide)
- [Setup Flow](#setup-flow)
- [Knowledge Graph](#knowledge-graph)
- [How SQUAD Thinks — Internal Architecture](#how-squad-thinks--internal-architecture)
  - [The Grounding Waterfall](#the-grounding-waterfall)
  - [Project Knowledge Structure](#project-knowledge-structure)
  - [Generated Artifacts](#generated-artifacts)
  - [Fragment System](#fragment-system--conditional-knowledge-loading)
- [Configuration](#configuration)
- [Security & Privacy](#security--privacy)
- [Testing](#testing)
- [FAQ](#faq)
- [Contributing](#contributing)
- [Credits & Acknowledgments](#credits--acknowledgments)
- [License](#license)

---

## Installation

```bash
# One-line install (clones from GitHub, no npm required)
curl -fsSL https://raw.githubusercontent.com/adityashubham1997/squad-public/main/install.sh | bash

# Or with specific IDEs
curl -fsSL https://raw.githubusercontent.com/adityashubham1997/squad-public/main/install.sh | bash -s -- --ide claude,cursor,kiro
```

**Requirements:** Git + Node.js >= 18. No npm/npx needed.

**What it does:**
1. Clones SQUAD to `~/.squad-public` (cached, reused on updates)
2. Detects your tech stack (languages, frameworks, cloud, CI/CD)
3. Deploys skills to your installed IDEs
4. Generates a `config.yaml` with your detected setup

---

## Quick Start

After installation, open your IDE and try:

| Command | What it does |
|---|---|
| `/squad-dev-task` | Full 6-phase implementation pipeline |
| `/squad-review-code` | Multi-agent code review of uncommitted changes |
| `/squad-brainstorm` | Group brainstorming with multiple agent perspectives |
| `/squad-create-prd` | Multi-agent PRD creation |
| `/squad-refresh` | Scan workspace, rebuild context files |

Every skill pauses at **user gates** — you always approve before the next phase runs.

---

## How SQUAD Works — The Orchestrators

SQUAD has three orchestration layers that work together:

```
┌─────────────────────────────────────────────────────┐
│                 SKILL (e.g. /dev-task)               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────┐  │
│  │    AGENT      │  │    MODEL     │  │DISPATCH │  │
│  │ ORCHESTRATOR  │──│ ORCHESTRATOR │──│ORCHESTR.│  │
│  │               │  │              │  │         │  │
│  │ WHO runs?     │  │ WHICH model? │  │ HOW?    │  │
│  │ In what order?│  │ Which provider│  │ Parallel│  │
│  │ Dependencies? │  │ What effort? │  │ or seq? │  │
│  └───────────────┘  └──────────────┘  └─────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 1. Agent Orchestrator

**What it does:** Decides WHICH agents run, in WHAT order, with WHAT dependencies.

Every skill declares the agents it needs. The orchestrator:
1. Builds a **dependency graph** (DAG) — some agents need other agents' output first
2. Identifies **parallel layers** — agents with no dependencies can run simultaneously
3. Enforces **completion verification** — every declared agent MUST run (no skipping)
4. Validates **output contracts** — each agent produces a specific structured output

**Example — Review Phase (5 agents):**

```
Layer 1 (parallel):  Raven + Atlas + Sentinel + Forge + Cipher
                     ↓ sync barrier — all 5 must finish
Layer 2 (sequential): Phoenix (synthesizes all findings into verdict)
                     ↓
User Gate:           YOU approve/reject
```

**Key rules:**
- **R1: Three Axes** — Every agent invocation must have model + effort + dispatch plan decided BEFORE execution
- **R3: Output Contracts** — Agents declare inputs/outputs. Output is validated against schema.
- **R8: Anti-Skip** — NEVER skip an agent because "it's faster". Every declared agent runs.
- **R9: Gate Ledger** — Phase transitions are blocked until all prior gates pass.

> Full protocol: `squad-method/fragments/agent-orchestrator.md`

---

### 2. Model Orchestrator (Multi-Model Routing)

**What it does:** Decides WHICH AI model each agent uses, from WHICH provider.

Not every task needs the most expensive model. A commit message doesn't need the same reasoning power as an architecture review. The model orchestrator assigns the right model to each agent:

```
Agent    Task                    Model Assigned       Why
─────    ────                    ──────────────       ───
Raven    Adversarial review      Claude Opus 4        Heavy reasoning needed
Oracle   Research + long docs    Gemini 2.5 Pro       1M context window
Forge    Code generation         Claude Sonnet 4      Good balance
Scribe   Format documentation   GPT-4o-mini          Fast structured output
Sentinel Security analysis      OpenAI o3            Deep reasoning
```

**How tier routing works:**

```
Priority chain: workspace_mode > phase_override > blast_radius > budget_cap > agent_override > default

Mode "quality"  → everything gets HEAVY models
Mode "budget"   → everything gets FAST models
Mode "balanced" → smart per-agent assignment (default)
```

**Multi-model diversity:** When your IDE supports multiple providers, SQUAD automatically routes agents to the BEST provider for their task:
- **Research agents** → Google Gemini (1M token context)
- **Reasoning agents** → Anthropic Claude Opus / OpenAI o3
- **Fast structured output** → GPT-4o-mini / Gemini Flash
- **Security analysis** → OpenAI o-series (reasoning effort)

> Full implementation: `squad-method/tools/router/`

---

### 3. Dispatch Orchestrator (Parallel Execution)

**What it does:** Decides HOW agents actually execute — in parallel or sequentially — based on your IDE's capabilities.

SQUAD detects your IDE and picks the best execution path:

| Path | Mechanism | IDEs | Parallelism |
|---|---|---|---|
| **A** | Native subagent tool | Claude Code | True parallel (max 5) |
| **B** | CLI subprocess / API calls | Codex, Kiro, Gemini | True parallel (max 3) |
| **C** | Sequential simulation | Windsurf, Cursor, Antigravity | One at a time |

**Path B details by IDE:**

| IDE | How parallel works |
|---|---|
| **Kiro** | AWS Bedrock `InvokeModel` API — spawns parallel model calls across Claude/Titan/Llama + direct OpenAI/Google API calls |
| **Codex** | OpenAI CLI subprocess — background `codex --model ... &` processes with wait barrier |
| **Gemini** | Vertex AI batch prediction + direct API calls to other providers |

**Path C guarantee:** Even sequential IDEs get ALL the same correctness guarantees (dependency ordering, output validation, anti-skip, gate enforcement). Only wall-clock time differs.

> Full implementation: `squad-method/tools/dispatch/`

---

## Supported IDEs

| IDE | Parallel | Multi-Model | Hook Enforcement | Skill Format |
|---|---|---|---|---|
| **Claude Code** | ✅ Max 5 | ✅ Anthropic + OpenAI + Google | Automatic (settings.json) | `.claude/skills/` |
| **Codex** (OpenAI) | ✅ Max 3 | ✅ OpenAI + Anthropic | Script (hooks.sh) | `.codex/skills/` |
| **Kiro** (AWS) | ✅ Max 3 | ✅ Bedrock + Q + OpenAI + Google + Anthropic | Script (hooks.sh) | `.kiro/skills/` |
| **Gemini** (Google) | ✅ Max 3 | ✅ Google + Anthropic (Vertex) + OpenAI | Script (hooks.sh) | `.gemini/skills/` |
| **Cursor** | ❌ Sequential | ✅ Anthropic + OpenAI + Google | Script (hooks.sh) | `.cursor/rules/*.mdc` |
| **Windsurf** | ❌ Sequential | ❌ Single model | Script (hooks.sh) | `.windsurf/skills/` |
| **Antigravity** | ❌ Sequential | ✅ Anthropic + OpenAI | Script (hooks.sh) | `.antigravity/skills/` |

---

## Supported Model Providers

| Provider | Models | IDEs that use it | Best for |
|---|---|---|---|
| **Anthropic** | Claude Opus 4, Claude Sonnet 4 | All 7 | Reasoning, code generation |
| **OpenAI** | o3, GPT-4o, GPT-4o-mini | Claude, Codex, Kiro, Gemini, Cursor, Antigravity | Security reasoning, fast output |
| **Google** | Gemini 2.5 Pro, Gemini 2.0 Flash | Claude, Kiro, Gemini, Cursor | Long-context research (1M tokens) |
| **Amazon Bedrock** | Claude via Bedrock, Titan, Llama 3 | Kiro | AWS-native, multi-model gateway |
| **Amazon Q** | Q Developer | Kiro | AWS-specific knowledge |

---

## Agents

SQUAD ships with **27 specialized agents**, each with a distinct professional lens:

| Agent | Role | Dispatched for |
|---|---|---|
| **Nova** | Requirements Analyst | Analysis, gap detection, AC validation |
| **Atlas** | Solution Architect | Architecture impact, blast radius, threat modeling |
| **Forge** | Senior Engineer | Code implementation, pattern compliance |
| **Cipher** | Test Engineer | Test generation, coverage analysis |
| **Sentinel** | QA Architect | Test strategy, risk-based test planning |
| **Shadow** | Security Engineer | Cloud/code/infra/E2E security, pen-test mindset |
| **Raven** | Adversarial Reviewer | Logic bugs, edge cases, second-order effects |
| **Catalyst** | Performance Engineer | Perf review, N+1 detection, scalability |
| **Oracle** | Research Analyst | Domain research, precedent analysis |
| **Scribe** | Technical Writer | Documentation, changelog, API docs |
| **Compass** | Product Manager | Value framing, story validation |
| **Tempo** | Delivery Manager | Sprint status, velocity, risk tracking |
| **Phoenix** | Synthesis Agent | Consolidates multi-agent findings into verdicts |
| **Aegis** | Security Architect | Threat modeling, encryption, auth patterns |
| **Stratos** | Cloud Architect | Cloud infra, IaC, cost optimization |
| **Kernel** | Systems Engineer | OS-level, memory, concurrency |
| **Neuron** | ML Engineer | ML pipelines, model evaluation |
| **Prism** | Data Analyst | SQL, analytics, data quality |
| **Dynamo** | Database Engineer | Schema design, migrations, indexing |
| **Index** | Query Optimizer | Query performance, explain plans |
| **Pixel** | Game Developer | Game engine code, render pipelines |
| **Quest** | Game Designer | Mechanics, balance, progression |
| **Lore** | Narrative Designer | Dialogue, world-building |
| **Flux** | Creative Problem Solver | Alternative approaches, simplification |
| **Titan** | Quality Gate | Strict standards enforcement |
| **Spark** | AI Developer | AI/ML framework integration |
| **Muse** | AI Researcher | Research synthesis, paper analysis |

Agents are **lazy-loaded** — only the agents needed for a skill are read into context.

---

## Skills (Slash Commands)

| Skill | Agents Involved | Description |
|---|---|---|
| `/squad-dev-task` | Nova, Atlas, Forge, Cipher, Raven, Phoenix | Full 6-phase implementation |
| `/squad-review-code` | Forge, Raven, Sentinel | Quick pre-commit review |
| `/squad-review-pr` | Raven, Atlas, Sentinel, Forge, Cipher, Catalyst | Full PR review |
| `/squad-brainstorm` | Oracle, Raven, Flux, Compass, Atlas | Multi-perspective ideation |
| `/squad-create-prd` | Compass, Nova, Atlas, Oracle | Product requirements |
| `/squad-create-story` | Compass, Nova | Story with acceptance criteria |
| `/squad-qa-task` | Cipher, Sentinel, Raven | Test strategy + generation |
| `/squad-dev-analyst` | Nova, Atlas, Oracle, Forge | Deep story analysis |
| `/squad-refresh` | All | Rebuild workspace context |
| `/squad-standup` | Tempo | Auto-generate standup |
| `/squad-retro` | Tempo, Compass, Scribe | Sprint retrospective |

...and more. Run `squad-public --list-skills` to see all available skills.

---

## Adding Support for a New Language Model

To add a new model provider (e.g., Mistral, Cohere, xAI):

### Step 1: Add provider to the registry

Edit `squad-method/tools/router/providers.cjs`:

```javascript
var MISTRAL = {
  id: 'mistral',
  models: {
    fast:    'mistral-small-latest',
    default: 'mistral-large-latest',
    heavy:   'mistral-large-latest',
  },
  supports_effort: false,
  supports_thinking: false,
  max_context: 128000,
};
```

### Step 2: Add to IDE provider mapping

In the same file, add Mistral to the IDE(s) that support it:

```javascript
cursor: {
  primary: ANTHROPIC,
  secondary: [OPENAI, GOOGLE, MISTRAL],  // ← add here
  ...
}
```

### Step 3: (Optional) Add agent affinity rules

If the new model excels at specific tasks:

```javascript
var AGENT_PROVIDER_AFFINITY = {
  // ...existing...
  scribe: { prefer: 'mistral', tier: 'fast', reason: 'structured_output' },
};
```

### Step 4: Add dispatch support

If the model needs a custom API call format, add a method in the relevant adapter:

```javascript
// In adapter-cursor.cjs or a new adapter
KiroAdapter.prototype._buildMistralInvocation = function(task) { ... };
```

### Step 5: Run tests

```bash
node test/providers.test.js
```

---

## Adding Support for a New IDE

To add a new IDE (e.g., "Volta"):

### Step 1: Create a transformer

Create `lib/transform/volta.js`:

```javascript
import { deploySkillDir } from './base.js';

export function deploy(workspacePath, skill, options = {}) {
  return deploySkillDir(workspacePath, skill, '.volta', options);
}

export const IDE_ID = 'volta';
export const SKILLS_PATH = '.volta/skills';
```

### Step 2: Register in the IDE skills generator

Edit `lib/generate/ide-skills.js`:

```javascript
const TRANSFORMER_MAP = {
  // ...existing...
  volta: '../transform/volta.js',
};
```

### Step 3: Add IDE detection

Edit `lib/detect/ide.js`:

```javascript
IDE_CHECKS.push({
  id: 'volta',
  name: 'Volta',
  configDir: '.volta',
  binary: 'volta',
});
```

### Step 4: Create a dispatch adapter

Create `squad-method/tools/dispatch/adapter-volta.cjs`:

```javascript
var BaseAdapter = require('./adapter-base.cjs');

function VoltaAdapter(config) {
  BaseAdapter.call(this, 'volta', config);
}
VoltaAdapter.prototype = Object.create(BaseAdapter.prototype);
// Implement dispatchAgent, dispatchParallel, buildMultiModelPlan
```

### Step 5: Add to provider mapping

In `providers.cjs`:

```javascript
volta: {
  primary: ANTHROPIC,
  secondary: [OPENAI],
  supports_parallel: false,  // or true if Volta has subagent API
  parallel_mechanism: 'sequential',
  max_parallel: 1,
  supports_multi_model: true,
}
```

### Step 6: Update hooks and parity test

- Add detection in `squad-method/tools/hooks.sh`
- Add to `squad-method/tools/ide-parity-test.sh`
- Update `squad-method/config.yaml` IDEs list

### Step 7: Run the parity test

```bash
bash squad-method/tools/ide-parity-test.sh
```

---

## Setup Flow

SQUAD uses a **two-path setup** — automated detection first, then conversational refinement:

```
┌─────────────────────────────────────────────────────────┐
│  Path 1: npx squad-public init  (programmatic)          │
│  ─────────────────────────────────────────────────────── │
│  1. Copy squad-method/ → workspace                      │
│  2. detectStack() → languages/frameworks/tools           │
│  3. detectCloud() → providers/IaC/containers/CI          │
│  4. detectTracker() → jira/linear/shortcut/etc           │
│  5. detectIDEs() → 7 IDEs                                │
│  6. updateConfig() → write detected values               │
│  7. Create output dirs                                   │
│  8. Scan repos                                           │
│  9. Build knowledge graphs                               │
│  10. Generate context files                              │
│  11. Deploy IDE skills                                   │
│  → Result: Config populated with TECH details            │
│    BUT company/project/user still EMPTY                  │
│    Summary tells user to run /setup                      │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Path 2: /squad-setup  (conversational, in-IDE)         │
│  ─────────────────────────────────────────────────────── │
│  Step 1: Check installation                             │
│  Step 2: Required (3 Q):                                │
│    Q1: user.name                                        │
│    Q2: user.role                                        │
│    Q3: team.name                                        │
│  Step 3: Optional (6 Q):                                │
│    Q4: company.name                                     │
│    Q5: company.domain (industry)                        │
│    Q6: project.name                                     │
│    Q7: project.description                              │
│    Q8: project.type                                     │
│    Q9: sprint board URL → auto-detects tracker type     │
│    Q9a: MCP integration (connects tracker to IDE)       │
│    Q9b: company.compliance (if regulated)               │
│    Q9c: project.maturity                                │
│  Step 4: Auto-detect (git, repos, show summary)         │
│  Step 5: Write ALL to config.yaml                       │
│  Step 6: KG check                                       │
│  Step 7: /refresh                                       │
│  Step 8: Offer /git-learn                               │
│  Step 9: Complete with config completeness score         │
│  → Result: FULL config populated                        │
└─────────────────────────────────────────────────────────┘
```

### MCP Integration

If you use a sprint board (Jira, Linear, etc.), setup will guide you through connecting an MCP server so agents can query your tracker directly. Supported across all 7 IDEs:

| Tracker | MCP Server | Config Location |
|---|---|---|
| Jira | `@anthropic/mcp-jira` | `.{ide}/mcp.json` |
| Linear | `@anthropic/mcp-linear` | `.{ide}/mcp.json` |
| GitHub Issues | Built-in (Claude Code) | `.{ide}/mcp.json` |
| Shortcut | `shortcut-mcp-server` | `.{ide}/mcp.json` |
| Notion | `@modelcontextprotocol/server-notion` | `.{ide}/mcp.json` |

---

## Knowledge Graph

SQUAD includes a built-in knowledge graph builder that analyzes your codebase:

```bash
node squad-method/tools/knowledge-graph/build.js <repo-path>
```

**4-pass analysis pipeline:**

| Pass | Module | What it does |
|---|---|---|
| 1 | `build.js` | Scans source files, extracts imports, builds dependency edges |
| 2 | `git-pass.js` | Analyzes git history: co-change patterns, churn hotspots, author count |
| 3 | `cluster.js` | Label propagation community detection (graph-aware, not just directories) |
| 4 | `analyze.js` | Surprise edges, hotspot scoring, complexity grading (A-F) |

**Output:** `knowledge-graph-out/` with:
- `graph.json` — full graph with nodes, edges, communities, surprises, hotspots, complexity score
- `graph.html` — interactive force-directed visualization
- `KG_REPORT.md` — human-readable report for agents

**Supports:** JavaScript, TypeScript, Python, Go, Rust, Java, Ruby.

**Agents use it for:** blast radius estimation, impact analysis, test coverage gaps, and auto-upgrading to heavy models when touching god nodes.

---

## How SQUAD Thinks — Internal Architecture

### The Grounding Waterfall

Every SQUAD skill follows a strict **evidence-first** protocol before doing any work. Agents check pre-computed artifacts before falling back to raw search:

```
┌──────────────────────────────────────────────────┐
│  1. CONTEXT.md / CLAUDE.md                       │
│     → Identity, rules, repo map, build commands  │
│     → Always loaded. ~300 tokens.                │
├──────────────────────────────────────────────────┤
│  2. graph.json (Knowledge Graph)                 │
│     → Pre-computed dependencies, god nodes,      │
│       hotspots, communities, blast radius        │
│     → Loaded if exists. Replaces most grep.      │
├──────────────────────────────────────────────────┤
│  3. KG_REPORT.md                                 │
│     → Human-readable summary of graph analysis   │
│     → Quick scan before deep graph queries       │
├──────────────────────────────────────────────────┤
│  4. DEEP-CONTEXT.md                              │
│     → Architecture from KG, module communities   │
│     → Loaded for cross-repo or design work       │
├──────────────────────────────────────────────────┤
│  5. squad-method/context/{node}.md               │
│     → Tree-indexed context (identity, stack,     │
│       architecture, per-repo detail)             │
│     → Loaded on-demand per task type             │
├──────────────────────────────────────────────────┤
│  6. Fragments (rubric, stack, cloud, tracker)    │
│     → Conditional on detected config             │
│     → Only loaded when config matches            │
├──────────────────────────────────────────────────┤
│  7. grep / file search (LAST RESORT)             │
│     → Only when KG doesn't cover the question    │
│     → Agents state why KG was insufficient       │
└──────────────────────────────────────────────────┘
```

**Why this matters:** A traditional AI coding assistant greps the entire codebase for every question. SQUAD agents check the knowledge graph first — pre-computed dependency data that answers "what depends on X?" in one read instead of scanning thousands of files.

### Project Knowledge Structure

SQUAD organizes project knowledge into a **tree of context files**, each loaded only when relevant:

```
workspace/
├── CONTEXT.md              ← Root context (always loaded, ~300 tokens)
│                              Identity, rules, repo map, build commands
├── CLAUDE.md               ← IDE copy of CONTEXT.md (for Claude Code)
├── GEMINI.md               ← IDE copy (for Gemini CLI)
├── AGENTS.md               ← IDE copy (for Windsurf/Cursor)
├── DEEP-CONTEXT.md         ← Architecture from KG (single-repo workspaces)
│
├── squad-method/
│   ├── config.yaml         ← All detected + user-provided config
│   ├── context/
│   │   ├── index.md        ← Context tree navigator (~200 tokens, always loaded)
│   │   ├── identity.md     ← Company, project, team, critical rules
│   │   ├── architecture.md ← System architecture (template → filled by /refresh)
│   │   ├── stack.md        ← Detected languages, frameworks, tools
│   │   └── repos/          ← Per-repo detail files
│   ├── agents/             ← 27 agent personas (loaded per-skill)
│   └── fragments/          ← Conditional knowledge modules
│
├── knowledge-graph-out/    ← Per-repo KG output
│   ├── graph.json          ← Full dependency graph (queried by agents)
│   ├── graph.html          ← Interactive force-directed visualization
│   └── KG_REPORT.md        ← Human-readable analysis report
│
└── repo-A/
    ├── CLAUDE.md           ← Per-repo context with KG summary
    └── knowledge-graph-out/
        └── graph.json      ← Repo-specific dependency graph
```

**Key principle: agents never load everything at once.** The context tree has `load_when` rules:

| File | Loaded When | Tokens |
|---|---|---|
| `CONTEXT.md` | Always | ~300 |
| `context/index.md` | Always (navigation) | ~200 |
| `context/identity.md` | Always (via root) | ~250 |
| `context/architecture.md` | Cross-repo work, design, `/dev-analyst` | ~300 |
| `context/stack.md` | Implementation, `/dev-task`, `/review-code` | ~200 |
| `context/repos/{name}.md` | Working in that specific repo | ~400 |
| `graph.json` | Before any file modification or review | queried |
| Fragments | When `config.yaml` matches `load_when` condition | ~100-500 each |
| Agent `.md` | When a skill names that agent | ~400-800 each |

### Generated Artifacts

SQUAD generates these artifacts during setup and ongoing use:

| Artifact | Generated By | Purpose |
|---|---|---|
| `config.yaml` | `npx squad-public init` + `/squad-setup` | Single source of truth for all config |
| `CONTEXT.md` / `CLAUDE.md` / `AGENTS.md` | `/refresh` | IDE-readable project context |
| `DEEP-CONTEXT.md` | `/refresh` | Extended architecture context from KG |
| Per-repo `CLAUDE.md` | `/refresh` | Repo-specific context with KG summary |
| `graph.json` | KG `build.js` | Dependency graph for agent queries |
| `graph.html` | KG `build.js` | Interactive visualization |
| `KG_REPORT.md` | KG `build.js` | Human-readable analysis |
| `tracking.jsonl` | Every skill run | Learning data for quality gate + `/evolve` |
| `squad-system-overview.html` | One-time install | Visual system architecture map |

### Fragment System — Conditional Knowledge Loading

Fragments are modular knowledge files that load based on your project's detected config:

```
squad-method/fragments/
├── rubric/
│   ├── base.md              ← Always loaded for reviews
│   ├── security.md          ← Always loaded for reviews
│   ├── javascript.md        ← Loaded if stack.languages includes "javascript"
│   ├── python.md            ← Loaded if stack.languages includes "python"
│   └── ...
├── stack/
│   ├── javascript.md        ← Loaded if stack.languages includes "javascript"
│   ├── python.md            ← Loaded if stack.languages includes "python"
│   └── ...
├── cloud/
│   ├── aws.md               ← Loaded if cloud.providers includes "aws"
│   ├── gcp.md               ← Loaded if cloud.providers includes "gcp"
│   └── monitoring.md        ← Loaded if any cloud provider detected
├── tracker/
│   ├── _tracker-base.md     ← Abstract tracker interface
│   ├── jira.md              ← Loaded if tracker.type == "jira"
│   └── linear.md            ← Loaded if tracker.type == "linear"
├── agent-loading-protocol.md
├── agent-orchestrator.md
├── kg-query-protocol.md
├── review-protocol.md
├── safety-guards.md
├── tdd-workflow.md
└── tracking-protocol.md
```

This means: a Python/AWS/Jira project loads Python rubric + Python stack + AWS cloud + Jira tracker fragments. A JavaScript/no-cloud/GitHub-Issues project loads a completely different set. Agents never load irrelevant knowledge.

---

## Configuration

SQUAD auto-generates `squad-method/config.yaml` during install. Key sections:

```yaml
# Model routing — controls which models agents use
model_routing:
  default: "default"              # fast | default | heavy
  mode: "balanced"                # balanced | quality | budget
  execution_path: "auto"          # auto | agent_tool | cli | sequential
  agent_overrides: {}             # e.g., { raven: heavy }
  complexity_upgrade:
    enabled: true
    blast_radius_threshold: 20    # KG degree above which → auto-upgrade

# Quality gate — re-dispatches on low-quality output
quality_gate:
  enabled: false                  # Enable after ~30 completions
  min_signals_to_escalate: 2

# IDEs
ides:
  installed: ["claude", "windsurf", "cursor", "codex", "kiro", "gemini", "antigravity"]
```

See `squad-method/config.yaml` for the full reference with all 15 sections.

---

## Security & Privacy

### Zero-Footprint Design

- **Zero network calls** — SQUAD never phones home, no telemetry, no analytics
- **Zero dependencies** — `package.json` has 0 runtime dependencies (nothing to supply-chain attack)
- **Local-only tracking** — `tracking.jsonl` stays on your machine
- **No API keys stored** — environment variables only, never written to files
- **Git exclude** — SQUAD artifacts use `.git/info/exclude` (never touches your `.gitignore`)

### Safety Hooks (5-Layer Protection)

SQUAD enforces safety via `squad-method/tools/hooks.sh`, which runs at skill boundaries:

| # | Hook | What It Checks | When |
|---|---|---|---|
| 1 | **Skills Gate** | SQUAD installed, config present, base-agent present | Skill start |
| 2 | **Pre-Edit Guard** | Blocks edits to auto-generated files (`dist/`, lock files, `*.generated.*`) | Before every file edit |
| 3 | **Secret Detection** | Scans for API keys, AWS keys, private keys, connection strings | Before commits |
| 4 | **Progress Save** | Forces progress doc update when context window is filling (~40 messages) | Long operations |
| 5 | **Gate Ledger** | Verifies all phase gates are PASSED before advancing | Phase transitions |

In **Claude Code**, hooks fire automatically at the harness level (impossible to bypass). In all other IDEs, hooks fire when the skill calls `hooks.sh` — enforcement relies on skill compliance.

### Destructive Action Guard

Before any destructive action (delete, drop, truncate, force push):
1. Agent states exactly what will be destroyed
2. Asks for explicit confirmation
3. Waits for approval
4. Never combines destructive actions — one at a time

---

## Testing

```bash
# Run all tests
node --test test/*.test.js

# Run provider/dispatch tests specifically
node test/providers.test.js

# Verify IDE parity
bash squad-method/tools/ide-parity-test.sh

# Check hook syntax
bash -n squad-method/tools/hooks.sh
```

Current test count: **89 unit tests + 62 e2e assertions, 0 failures**.

---

## FAQ

### How is SQUAD different from just using an AI IDE?

AI IDEs give you a single model in a chat window. SQUAD adds:
- **27 specialized agents** with distinct review lenses (security, performance, QA, architecture, etc.)
- **Pre-computed knowledge** via the knowledge graph — agents check dependency data before grepping
- **Conditional fragment loading** — only project-relevant knowledge is loaded (your stack, cloud, tracker)
- **Phase-gated workflows** — complex tasks are broken into phases with user approval at each gate
- **Cross-IDE portability** — same agents, skills, and config work across 7 IDEs

### Do I need all 7 IDEs installed?

No. SQUAD auto-detects which IDEs are installed and deploys skills only to those. You can use SQUAD with a single IDE. The multi-IDE support means you can switch IDEs without losing your agent configuration.

### How does the two-path setup work?

**Path 1** (`npx squad-public init`) is programmatic — it copies files, runs detection engines, and writes technical config. It runs in your terminal and takes ~10 seconds.

**Path 2** (`/squad-setup`) is conversational — it runs inside your IDE and asks you questions that can't be auto-detected (your name, team, company, project context). It enriches the config that Path 1 created.

You need both: Path 1 for tech detection, Path 2 for human context.

### What does "zero dependencies" mean?

SQUAD's `package.json` has literally `"dependencies": {}`. No npm packages. No supply chain risk. Every line of code is in the repo. The tradeoff: we use regex-based YAML handling instead of a YAML library, and regex-based import parsing in the KG instead of a full AST parser.

### How do agents find the right context without loading everything?

SQUAD uses a **tree-indexed context system** (see [Project Knowledge Structure](#project-knowledge-structure)). Each context file has a `load_when` rule in its YAML frontmatter. The agent loading protocol works like this:

1. **Always loaded:** `CONTEXT.md` + `context/index.md` + `context/identity.md` (~750 tokens total)
2. **Loaded per task:** The skill declares which agents and context nodes it needs
3. **Loaded per config:** Fragments auto-load based on detected stack/cloud/tracker
4. **Queried on demand:** `graph.json` is queried for specific files, not loaded in full

Total context budget target: **<8,000 tokens** for agent + fragment loading per skill invocation.

### Why does SQUAD check the knowledge graph before grepping?

The knowledge graph contains pre-computed answers to the most common agent questions:
- "What depends on this file?" → `graph.json` edges (instant)
- "Is this a high-risk file?" → god node flag + hotspot score (instant)
- "What tests cover this?" → test edges in graph (instant)
- "What's the blast radius?" → 2-hop reachability query (instant)

Without the KG, each of these requires 3-10 grep/find commands across the entire codebase. With the KG, it's a single JSON read. This saves ~80% of exploration tokens in typical workflows.

### What are "god nodes" and why do they matter?

A god node is any file with more than 30 dependency connections (imports + importers). Changing a god node affects many parts of the codebase. When an agent detects it's modifying a god node:
- The model router **auto-upgrades** to the heavy tier (if `complexity_upgrade.enabled`)
- The review protocol requires **extra review** and user approval
- The KG report flags the blast radius

### How does model routing work?

SQUAD has 3 tiers: **fast** (cheap, quick), **default** (balanced), **heavy** (most capable). The router decides per-agent:

1. **Rule-based** (V1, always active): Agent overrides in `config.yaml`, phase-specific routing
2. **Quality gate** (V2, after ~30 completions): Detects low-quality output and re-dispatches at a higher tier
3. **Learned classifier** (V3, stub): Will use `tracking.jsonl` data to predict optimal tier — not yet trained

### What's in tracking.jsonl?

Every skill run appends a line with: skill name, agents dispatched, model tier used, duration, outcome (approve/block/iterate). This data feeds the quality gate (V2) and will eventually train the learned classifier (V3). It also powers `/evolve` (agent self-improvement) and `/health` (agent effectiveness analysis).

### Can I add custom agents?

Yes. Create a new `.md` file in `squad-method/agents/` following the same format as existing agents. Add the agent to `config.yaml` → `agents.custom` array. Custom agents are loaded by skills the same way built-in agents are.

### What happens if I don't run /squad-setup?

SQUAD still works — all detection (stack, cloud, tracker, IDEs) runs during `npx squad-public init`. But agents won't know your name, team, company, or project context. They'll show a warning: "ℹ️ Some config fields are empty — run `/setup` to fill them." Functionality is not blocked, but agent responses are less contextual.

### How does SQUAD compare to SQUAD Internal?

| Capability | SQUAD Internal | SQUAD Public |
|---|---|---|
| Agents | 13 (ServiceNow-specific) | 27 (tech-agnostic) |
| KG modules | 15 (incl. dashboard, merge, validate) | 5 (build, git-pass, cluster, analyze, summary) |
| Stack detection | ServiceNow + JavaScript | 14 languages, 40+ frameworks |
| Tracker | ServiceNow BT1 only | Jira, Linear, GitHub Issues, Shortcut, Notion |
| Scanning | ServiceNow artifact scanner (5 passes) | Import-based dependency scan |
| Platform | ServiceNow-only | Any tech stack |
| IDEs | 7 | 7 |

SQUAD Public is designed for general-purpose software teams. Internal is purpose-built for ServiceNow development.

---

## Contributing

We welcome contributions! Here's how:

### Quick contributions
- **Report a bug** — open an issue with steps to reproduce
- **Suggest a feature** — open an issue with the use case
- **Fix a typo** — PR directly

### Larger contributions

1. **Fork and clone** the repo
2. **Create a branch** — `git checkout -b feature/my-feature`
3. **Make changes** — follow existing code style
4. **Add tests** — every new feature needs tests
5. **Run the test suite** — `node --test test/*.test.js`
6. **Run parity check** — `bash squad-method/tools/ide-parity-test.sh`
7. **Submit PR** — describe what and why

### What we're looking for
- New IDE adapters (see [Adding Support for a New IDE](#adding-support-for-a-new-ide))
- New model providers (see [Adding Support for a New Language Model](#adding-support-for-a-new-language-model))
- New stack/cloud detection fragments
- Rubric modules for additional frameworks
- Knowledge graph enhancements
- Bug fixes and test improvements
- Documentation improvements

### Code style
- Use existing patterns — look at similar files before writing new ones
- Zero dependencies — don't add npm packages
- Tests required — if it's testable, test it
- ESM for `lib/` — CommonJS (`.cjs`) for `squad-method/tools/`

---

## Credits & Acknowledgments

SQUAD builds on the shoulders of giants:

### Direct Inspirations

| Source | What We Took | How SQUAD Uses It |
|---|---|---|
| **[Graphify](https://github.com/graphify)** | Knowledge graph extraction from code | SQUAD's KG builder is a Node.js adaptation of Graphify's approach — AST extraction, community detection, god nodes, confidence tags. We added git co-change coupling and CLAUDE.md integration. Backward compatible with `.graphifyignore`. |
| **[Caveman](https://github.com/cavemanai/caveman)** | Token compression for AI agents | Inspired SQUAD's Logical Mode — compress words, never compress logic. Caveman proves ~65-75% output token reduction is achievable without losing technical accuracy. |
| **[HyperAgentMeta](https://arxiv.org/abs/2602.00000) (DGM-H, Meta 2026)** | Self-improving agent loops | SQUAD's `/evolve` command: reads tracking data → identifies recurring failures → proposes surgical diffs to agent `.md` files → human approves on branch. The improvement mechanism itself is editable. |
| **[RouteLLM](https://arxiv.org/abs/2406.18665) (2024)** | Learned model routing | SQUAD's 3-tier routing: rule-based → quality gate → classifier stub. The learned classifier (`squad-method/tools/router/classifier.js`) is a V3 stub ready for training data from `tracking.jsonl`. |

### Core Concepts

- **Multi-Agent Systems** — Inspired by research on collaborative AI agents, multi-agent debate (Du et al., 2023), and mixture-of-agents architectures (Wang et al., 2024)
- **Agentic Coding Patterns** — Drawn from patterns in Claude Code, Devin, SWE-Agent, and OpenHands demonstrating effective AI-assisted development workflows
- **Knowledge Graphs for Code** — Graph-based dependency analysis inspired by tools like Sourcegraph, CodeQL, and academic work on program analysis
- **TDD & Agile Practices** — Review rubrics and quality gates grounded in decades of software engineering best practices (Martin, Fowler, Beck)

### Model Providers

- **[Anthropic](https://anthropic.com)** — Claude Opus 4 & Sonnet 4 models powering core reasoning
- **[OpenAI](https://openai.com)** — GPT-4o and o3 models for security reasoning and fast output
- **[Google DeepMind](https://deepmind.google)** — Gemini 2.5 Pro for long-context research (1M tokens)
- **[Amazon Web Services](https://aws.amazon.com/bedrock/)** — Bedrock for multi-model gateway, Titan, and Amazon Q
- **[Meta AI](https://ai.meta.com)** — Llama models available via Bedrock

### IDE Platforms

- **[Anthropic Claude Code](https://docs.anthropic.com/en/docs/claude-code)** — Native Agent() subagent API enabling true parallel execution
- **[OpenAI Codex CLI](https://github.com/openai/codex)** — CLI subprocess dispatch
- **[AWS Kiro](https://kiro.dev)** — Amazon Bedrock integration for multi-provider access
- **[Google Gemini CLI](https://github.com/google-gemini/gemini-cli)** — Vertex AI integration
- **[Cursor](https://cursor.com)** — Multi-model IDE with `.mdc` rule format
- **[Windsurf](https://codeium.com/windsurf)** — Cascade AI with skill/workflow system
- **[Antigravity](https://antigravity.dev)** — AI-native development environment

### Tools & Libraries

- **Node.js** — Runtime (>=18, zero npm dependencies)
- **Bash** — Shell scripts for hooks, dispatch, and parity testing
- **Git** — Version control integration and learning from PR history
- **SHA-256** — Content hashing for deterministic dispatch manifests

### Methodology References

- Robert C. Martin — *Clean Code*, *Clean Architecture*
- Martin Fowler — *Refactoring*, *Patterns of Enterprise Application Architecture*
- Kent Beck — *Test-Driven Development*, *Extreme Programming*
- Michael Nygard — *Release It!* (stability patterns in review rubrics)
- OWASP — Security review checks (Top 10, ASVS)

### Open Source

- This project is MIT licensed. Use it, fork it, extend it.
- Contributions from the community make SQUAD better for everyone.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with focus on developer experience, not vendor lock-in.**

[Report Bug](https://github.com/adityashubham1997/squad-public/issues) · [Request Feature](https://github.com/adityashubham1997/squad-public/issues) · [Contribute](#contributing)

</div>
