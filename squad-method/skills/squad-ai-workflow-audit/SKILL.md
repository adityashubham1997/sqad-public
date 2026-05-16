---
name: squad-ai-workflow-audit
description: >
  Audit current agentic workflows, LLM integrations, and AI automation points
  in the codebase. Produces a findings report with improvement recommendations.
  Use when user says "audit ai workflows", "review ai integration",
  "check agentic patterns", or runs /ai-audit.
---

# SQUAD-Public AI Workflow Audit — Spark + Muse

Comprehensive audit of all AI/LLM/agentic integration points in the project.

**Bootstrap (read now):**
- `squad-method/config.yaml` — team config
- `squad-method/agents/_base-agent.md` — base protocols
- `squad-method/agents/spark.md` — AI Developer lens
- `squad-method/agents/muse.md` — AI Researcher lens
- `squad-method/fragments/stack/generative-ai.md` — patterns context
- `squad-method/fragments/rubric/generative-ai.md` — review checks

Track progress with TodoWrite.

---

## Phase 1 — DISCOVERY (Spark + Muse)

### 1a. Detect AI Stack

Scan the codebase for AI/ML integration indicators:

```
Search for: openai, anthropic, langchain, llamaindex, crewai, autogen,
  @google/generative-ai, @aws-sdk/client-bedrock, transformers, huggingface,
  pinecone, chroma, weaviate, qdrant, pgvector, embeddings, vector,
  llm, chat.completions, claude, gpt, prompt, agent, tool_call
```

Catalog findings:
- **LLM providers** in use (OpenAI, Anthropic, Bedrock, Vertex, local)
- **Frameworks** (LangChain, LlamaIndex, CrewAI, AutoGen, custom)
- **Vector stores** (Pinecone, Chroma, Weaviate, pgvector, in-memory)
- **Observability** (LangSmith, Langfuse, Arize, Helicone, none)
- **Eval tools** (DeepEval, Ragas, custom, none)

### 1b. Map Agentic Workflows

For each AI integration point found:
1. Trace the data flow: user input → preprocessing → LLM call → postprocessing → output
2. Identify: model used, temperature, tools/functions, system prompt location
3. Map dependencies between agents/chains/tools
4. Identify human-in-the-loop decision points (or lack thereof)

**USER GATE:** "Here's what I found. Review the inventory. [Continue/Adjust scope]"

---

## Phase 2 — ANALYSIS (Spark)

### 2a. Architecture Assessment

For each workflow, assess:
- **Reliability**: retry logic, error handling, fallback models
- **Cost**: model choice vs task complexity, caching, batching
- **Security**: prompt injection defenses, API key management, PII handling
- **Observability**: tracing, logging, metrics on LLM calls
- **Eval coverage**: automated tests for AI features

### 2b. Rubric Check

Run every check from `generative-ai.md` rubric (GAI-1 through GAI-10) against each integration point.

### 2c. Pattern Analysis

Identify:
- Duplicated prompt logic (should be shared templates)
- Inconsistent error handling across AI calls
- Missing guardrails on user-facing outputs
- Opportunities for model downgrade (cheaper model, same quality)
- Missing caching layers for repeated queries

---

## Phase 3 — RESEARCH (Muse)

### 3a. Alternative Assessment

For each workflow, research:
- Is there a newer/better model available?
- Could an open-source model replace the commercial one?
- Are there framework improvements since this was built?
- What do industry benchmarks say about the chosen approach?

### 3b. Automation Opportunities

Scan the project's tech stack and identify NEW automation points:
- Code review automation using the project's own patterns
- Test generation from acceptance criteria
- Documentation generation from code
- Deployment decision intelligence
- Alert triage and incident response automation
- Knowledge base maintenance and updates
- Release notes generation from git history

Map each opportunity to the project's actual tech stack:
`{{detected_languages}}`, `{{detected_frameworks}}`, `{{detected_cloud}}`

---

## Phase 4 — REPORT (Spark + Muse)

### Consolidated Report Structure

```markdown
# AI Workflow Audit Report

## Executive Summary
- Total AI integration points: [N]
- Critical findings: [N]
- Estimated monthly LLM cost: $[N]
- Automation opportunities identified: [N]

## Current AI Inventory
[Table: Integration point | Provider | Model | Framework | Eval coverage | Cost/req]

## Findings
### Critical
[GAI rubric violations with file paths and line numbers]

### Major
[Architecture improvements, missing observability, cost optimization]

### Opportunities
[New automation points mapped to project tech stack]

## Recommendations
[Prioritized action items with effort/impact matrix]
```

**USER GATE:** "Report complete. [Export/Discuss findings/Create stories]"

---

## Behavioral Rules

1. **NEVER fabricate findings.** Every claim must cite a file path and line.
2. **Cost estimates must show math.** tokens × price × projected volume.
3. **Research claims cite sources.** Model comparisons reference benchmarks.
4. **Recommendations are actionable.** Include specific code/config changes.
5. **Track the operation** — log to `squad-method/output/tracking.jsonl`.
