---
name: squad-ai-ideate
description: >
  Brainstorm and design agentic workflow ideas, AI automation opportunities,
  and intelligent features using the project's detected tech stack.
  Use when user says "ai ideas", "brainstorm ai features", "agentic workflow ideas",
  "automate with ai", or runs /ai-ideate.
---

# SQUAD-Public AI Ideation — Muse + Spark

Generate and evaluate AI/agentic automation ideas tailored to the project's stack.

**Bootstrap (read now):**
- `squad-method/config.yaml` — team config + detected stack
- `squad-method/agents/_base-agent.md` — base protocols
- `squad-method/agents/muse.md` — AI Researcher lens (leads)
- `squad-method/agents/spark.md` — AI Developer lens (feasibility)
- `squad-method/fragments/stack/generative-ai.md` — AI patterns

Track progress with TodoWrite.

---

## Phase 1 — CONTEXT GATHERING (Muse)

### 1a. Stack Analysis

Read and internalize the detected stack:
- Languages: `{{detected_languages}}`
- Frameworks: `{{detected_frameworks}}`
- Cloud: `{{detected_cloud}}`
- CI/CD: `{{detected_ci_cd}}`

### 1b. Codebase Scan

Scan for patterns that indicate automation opportunities:
- Repetitive code patterns (boilerplate, CRUD, transformations)
- Manual processes mentioned in README, CONTRIBUTING, docs
- Test coverage gaps
- Documentation staleness
- Complex business rules that could benefit from AI classification
- User-facing features where intelligence adds value

### 1c. Existing AI Footprint

Identify what AI tools/patterns already exist (if any).

**USER GATE:** "Here's what I found about your stack and opportunities. [Continue/Focus area]"

---

## Phase 2 — IDEATION (Muse)

### 2a. Developer Workflow Automation

Ideas for automating the development process itself:

| Category | Idea | Tech Stack Fit |
|---|---|---|
| **Code Generation** | Generate boilerplate from patterns in `{{detected_frameworks}}` | LLM + codebase context |
| **Test Generation** | Auto-generate tests from AC using `{{detected_test_frameworks}}` patterns | LLM + test framework |
| **Code Review** | AI-powered review using project rubrics and patterns | LLM + git diff |
| **Documentation** | Auto-generate/update docs from code changes | LLM + AST parsing |
| **PR Description** | Generate PR descriptions from commit history | LLM + git |
| **Release Notes** | Auto-generate release notes from merged PRs | LLM + git/tracker |
| **Incident Triage** | Auto-classify and route alerts from `{{detected_monitoring}}` | LLM + monitoring APIs |
| **Dependency Updates** | Intelligent dependency update with impact analysis | LLM + package manager |

### 2b. Product Feature Ideas

Ideas for AI-powered product features:

| Category | Idea | Architecture |
|---|---|---|
| **Smart Search** | Semantic search across product data | Embeddings + vector DB + RAG |
| **Content Generation** | User-facing content creation/editing | LLM with guardrails |
| **Classification** | Auto-categorize user input/data | Fine-tuned classifier or prompt |
| **Summarization** | Summarize long content for users | LLM with chunking |
| **Recommendations** | Personalized suggestions | Embeddings + similarity |
| **Chat Interface** | Conversational assistant for product | RAG + chat agent |
| **Data Extraction** | Extract structured data from unstructured input | LLM + structured output |
| **Anomaly Detection** | Flag unusual patterns in user data | ML model or LLM-based |

### 2c. Agentic Workflow Ideas

Multi-agent system designs for the project:

| Workflow | Agents | Orchestration |
|---|---|---|
| **Autonomous QA** | Test Writer → Runner → Fixer → Reporter | Sequential pipeline |
| **Smart Deployment** | Risk Analyzer → Deployer → Monitor → Rollback | Event-driven |
| **Knowledge Builder** | Scraper → Summarizer → Indexer → Validator | Batch pipeline |
| **Support Agent** | Classifier → Researcher → Responder → Escalator | Hierarchical |
| **Code Modernizer** | Analyzer → Planner → Refactorer → Reviewer | Human-in-the-loop |
| **Data Pipeline** | Ingester → Transformer → Validator → Loader | DAG orchestration |

**USER GATE:** "Here are the ideas organized by category. Which areas interest you? [Select/Explore all]"

---

## Phase 3 — FEASIBILITY (Spark)

For each selected idea, Spark provides:

### Technical Assessment

```markdown
## [Idea Name]

### Feasibility: [HIGH | MEDIUM | LOW]

**Architecture:**
- Model: [recommended model + fallback]
- Framework: [LangChain / CrewAI / custom / none needed]
- Infrastructure: [vector DB, caching, queue]
- Integration: [how it connects to existing {{detected_frameworks}} stack]

**Effort Estimate:**
- POC: [hours/days]
- Production: [days/weeks]
- Ongoing: [maintenance cost]

**Cost Projection:**
- Model cost: $[N]/month at [volume] requests
- Infrastructure: $[N]/month
- Total: $[N]/month

**Risks:**
- [Hallucination risk level]
- [Data privacy considerations]
- [Latency impact]
- [Vendor lock-in]

**Quick Start:**
[Minimal code snippet showing the integration with the project's stack]
```

**USER GATE:** "Feasibility assessed. [Create stories/Prototype/Explore more]"

---

## Phase 4 — OUTPUT (Muse + Spark)

Based on user choice:

### Option A: Create Stories
Generate tracker-ready stories for selected ideas:
- Epic: AI Automation — [Category]
- Story: As a [developer/user], I want [AI feature], so that [benefit]
- AC: GIVEN/WHEN/THEN with measurable criteria
- Technical notes from Spark's feasibility assessment

### Option B: Prototype
Spark creates a minimal proof-of-concept:
- Integration with detected stack
- Eval test for correctness
- Cost monitoring hook
- README with setup instructions

### Option C: Research Deep Dive
Muse provides detailed research on specific ideas:
- Model comparison benchmarks
- Open-source alternatives
- Industry case studies
- Reference architectures

---

## Behavioral Rules

1. **Ideas must be grounded in the detected stack.** No suggesting Rust for a Python project.
2. **Cost estimates must show math.** Not "it's cheap" — show tokens × price × volume.
3. **Every idea has a risk section.** AI optimism without risk awareness is dangerous.
4. **Rank by impact/effort.** Quick wins first, moonshots labeled clearly.
5. **Track the operation** — log to `squad-method/output/tracking.jsonl`.
