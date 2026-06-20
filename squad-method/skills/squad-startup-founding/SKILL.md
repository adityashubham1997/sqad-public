---
name: squad-startup-founding
description: Startup founding analysis — scans the project to build founding context, then Richard (CEO), Monica (CMO), and Jared (CFO) produce a comprehensive startup strategy grounded in the actual codebase, docs, and project structure.
trigger: ["startup founding", "startup analysis", "founding vision", "startup strategy", "business plan", "startup pack"]
agents: [richard, monica, jared, oracle, compass, atlas, nova]
type: continuous-conversation
deterministic: true
---

# /startup-founding — Startup Founding Analysis

**Purpose:** Scan the project workspace to build deep founding context, then produce a comprehensive startup strategy document covering vision, go-to-market, financial model, and OKRs — all grounded in what the team is actually building.

**What makes this skill unique:** Unlike generic business planning, this skill reads the ACTUAL codebase, README, config files, git history, and project structure. The strategy is grounded in reality, not aspiration.

---

## Agents Required

| Agent | Role | Phase |
|---|---|---|
| **Oracle** | Research — scans codebase, docs, competitors | Phase 1 |
| **Compass** | Value framing — what problem does this solve? | Phase 1 |
| **Richard** | CEO — founding vision, strategic priorities, OKRs | Phase 2-3 |
| **Monica** | CMO — go-to-market, growth loops, user personas | Phase 2 |
| **Jared** | CFO — financial model, unit economics, runway | Phase 2 |
| **Wendy** | PM — story validation, feature prioritization | Phase 3 |
| **Elliot** | Architecture — technical feasibility, scaling strategy | Phase 3 |

---

## Phase 1 — Context Mining (Oracle + Compass)

**Goal:** Build comprehensive founding context from the project itself.

### Step 1.1 — Project Deep Scan (Oracle)

Oracle performs a systematic scan of the workspace:

1. **Project structure** — `ls`, directory tree, identify key modules
2. **README and docs** — extract stated purpose, target users, value prop
3. **Package/config files** — tech stack, dependencies, deployment targets
4. **Git history** — active files, velocity, contributor count, age
5. **Tests** — coverage maturity, test framework, what's tested vs not
6. **Deployment config** — CI/CD, hosting, environments
7. **Existing users/metrics** — any analytics, usage data, or feedback

**Output:** `project_context_brief` (structured YAML)

### Step 1.2 — Value Framing (Compass)

Based on Oracle's scan:
1. What problem does this project solve?
2. Who experiences this problem?
3. How are they solving it today (alternatives)?
4. What's the unique advantage of this solution?
5. What's the single metric that proves this is working?

**Output:** `value_framing` (structured YAML)

### USER GATE: Review context and value framing. Correct any misunderstandings.

---

## Phase 2 — Strategy Formation (Richard + Monica + Jared — parallel)

**Goal:** Each C-level produces their domain strategy grounded in Phase 1 context.

### Step 2.1 — CEO Strategy (Richard)

Richard reads the project context and value framing, then produces:
1. **Founding Vision** — one-paragraph narrative of what this company/project is
2. **Strategic Priorities** — top 3 priorities for the next 90 days
3. **Assumptions to validate** — what must be true for this to work?
4. **OKRs** — 3 objectives with 3 key results each
5. **Pivot triggers** — what signals would cause a strategy change?

### Step 2.2 — CMO Strategy (Monica)

Monica reads the project context and produces:
1. **User Personas** — 2-3 detailed personas with pain points
2. **Go-to-Market Strategy** — primary and secondary acquisition channels
3. **Growth Loops** — which loops are available for this product type
4. **Launch Plan** — pre-launch, launch day, post-launch (30/60/90)
5. **Messaging Framework** — headline, subhead, 3 proof points
6. **Competitive Positioning** — how we're different, in one sentence

### Step 2.3 — CFO Strategy (Jared)

Jared reads the project context and produces:
1. **Revenue Model** — how does this make money? SaaS / usage / freemium?
2. **Unit Economics** — estimated CAC, LTV, payback period, margins
3. **Financial Model** — 12-month projection (revenue, costs, burn, runway)
4. **Pricing Strategy** — tiers, pricing basis, competitive pricing analysis
5. **Fundraising Readiness** — what stage, how much, what terms to expect

### USER GATE: Review all three strategies. Provide feedback.

---

## Phase 3 — Convergence & Execution Plan (Richard leads)

**Goal:** Synthesize all strategies into a single actionable plan.

### Step 3.1 — Cross-Strategy Alignment (Richard)

Richard reviews Monica's and Jared's outputs for conflicts:
- Does the growth plan fit within the financial constraints?
- Are the user personas aligned with the revenue model?
- Are the OKRs achievable with current resources?

### Step 3.2 — Technical Feasibility (Elliot)

Elliot reviews the strategy against the actual codebase:
- Can the product roadmap be built with the current architecture?
- What technical debt blocks the strategy?
- What's the engineering effort for the next 90 days of priorities?

### Step 3.3 — Feature Prioritization (Wendy)

Wendy maps strategic priorities to concrete features:
- What ships in week 1-2 (MVP polish)?
- What ships in month 1 (core value)?
- What ships in month 2-3 (growth features)?

### Step 3.4 — Final Founding Document (Richard)

Richard produces the consolidated **Founding Strategy Document**:

```markdown
# [Project Name] — Founding Strategy

## Vision
[one paragraph]

## Problem & Solution
[from Compass value framing]

## Target Users
[from Monica's personas]

## Go-to-Market
[from Monica's GTM strategy]

## Financial Model
[from Jared's model]

## 90-Day OKRs
[from Richard's OKRs]

## Feature Roadmap
[from Wendy's prioritization]

## Technical Architecture
[from Elliot's feasibility]

## Assumptions & Pivot Triggers
[from Richard's assumption list]

## Open Questions
[aggregated from all agents]
```

### USER GATE: Approve final document or request revisions.

---

## Behavioral Rules

1. **Ground everything in the codebase** — no generic advice. Every claim must reference something found in the project scan.
2. **No fabricated metrics** — if usage data doesn't exist, say "unknown, needs instrumentation" not a made-up number.
3. **Disagree productively** — if Monica's growth plan conflicts with Jared's financial constraints, surface it explicitly.
4. **Startup realism** — assume limited resources. Every recommendation must be achievable by a small team.
5. **Action-oriented** — every section ends with concrete next steps, not vague aspirations.

---

```yaml
rule_manifest:
  fragment_id: squad-startup-founding
  rules:
    - { id: R1, name: ground_in_codebase, severity: HARD, fires_in: [phase_1, phase_2, phase_3] }
    - { id: R2, name: no_fabricated_metrics, severity: HARD, fires_in: [phase_2, phase_3] }
    - { id: R3, name: surface_conflicts, severity: HARD, fires_in: [phase_3] }
    - { id: R4, name: startup_realism, severity: HARD, fires_in: [phase_2, phase_3] }
    - { id: R5, name: action_oriented, severity: HARD, fires_in: [phase_3] }
  gates:
    - { id: G_CONTEXT, name: project_context_reviewed, blocks: phase_2 }
    - { id: G_STRATEGY, name: strategies_reviewed, blocks: phase_3 }
    - { id: G_FINAL, name: founding_doc_approved, blocks: completion }
```
