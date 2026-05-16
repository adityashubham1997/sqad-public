---
name: squad-brainstorm
description: >
  Multi-agent brainstorming session with all SQUAD-Public agents. Each agent
  contributes from their unique role and perspective. Use when user says
  "brainstorm", "ideate", "help me think about", or runs /brainstorm.
---

# SQUAD-Public Brainstorm — Multi-Agent Ideation

All 14 agents contribute from their unique perspectives. This is a structured
diverge → converge process with the user driving direction.

**Bootstrap (read now):**
- `squad-method/config.yaml` — team config
- `squad-method/agents/_base-agent.md` — base protocols
- All agent files in `squad-method/agents/` — each agent's persona and lens

## Step 1 — Frame the Problem

Parse `$ARGUMENTS` for the brainstorm topic.

If no topic: "What would you like to brainstorm about?"

Once topic is clear, frame it:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SQUAD-Public Brainstorm
  Topic: [topic]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Agents participating:
📊 Nova · 🏗️ Atlas · 💻 Forge · 🧪 Cipher · 🎯 Tempo
🔍 Raven · 🚀 Catalyst · 🔬 Oracle · 📋 Compass · 📚 Scribe
🧪 Sentinel · 🛡️ Aegis · ☁️ Stratos · 🔥 Phoenix
```

## Step 2 — Research Grounding (Oracle)

Before agents brainstorm, Oracle provides context:
- What exists in the codebase related to this topic?
- What prior art or patterns are relevant?
- Any external references worth considering?

This grounds the brainstorm in reality, not fantasy.

## Step 3 — Divergent Round (All Agents)

Each agent contributes 1-2 ideas from their unique lens.
No criticism in this round — pure idea generation.

| Agent | Lens | What They Contribute |
|---|---|---|
| **Compass** | Product | Customer value, market fit, user experience |
| **Nova** | Analysis | Requirements implications, acceptance criteria |
| **Atlas** | Architecture | System design, scalability, technical approach |
| **Forge** | Implementation | Simplest path, code patterns, effort estimate |
| **Cipher** | Testing | Testability, quality risks, edge cases |
| **Sentinel** | Test Strategy | Test layers, automation approach |
| **Raven** | Adversarial | What could go wrong, hidden risks, second-order effects |
| **Catalyst** | Release | Deployment strategy, rollback, release risk |
| **Oracle** | Research | Prior art, industry patterns, competitive analysis |
| **Tempo** | Process | Sprint fit, team capacity, dependencies |
| **Scribe** | Documentation | Knowledge capture, communication plan |
| **Aegis** | Security | Attack surface, compliance, data protection |
| **Stratos** | Cloud | Infrastructure needs, cost, cloud-native patterns |
| **Phoenix** | DevOps | CI/CD impact, observability, deployment |

Present all ideas in a numbered list.

**USER GATE:** "Which ideas interest you? [Pick numbers/All/Refine topic]"

## Step 4 — Convergent Round

For user-selected ideas, agents evaluate feasibility:

**Forge:** "Here's the simplest way to build [idea]."
**Atlas:** "Architecture impact: [assessment]."
**Cipher:** "Testing strategy for [idea]: [approach]."
**Raven:** "The risk nobody's mentioning: [risk]."
**Tempo:** "This fits in [N] sprints with [dependencies]."

Agents may **discuss and challenge** each other.

## Step 5 — Recommendation

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SQUAD-Public Brainstorm — Recommendation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Top recommendation: [idea]
  Why: [combined agent reasoning]
  Effort: [estimate]
  Risk: [key risks]

Alternative: [idea]
  Why: [reasoning]

Next steps:
  → /create-prd to formalize requirements
  → /dev-analyst to deep-dive feasibility
  → /dev-task to start building
```

## Behavioral Rules

- **Divergent round = no criticism.** All ideas are valid. Evaluation comes later.
- **Every agent speaks from their lens** — not generic thoughts
- **Oracle grounds first** — no brainstorming in a vacuum
- **Raven MUST participate** — the adversarial lens prevents groupthink
- **User drives convergence** — agents don't decide which ideas win
- **Never fabricate research** — if Oracle finds nothing, say so
- **Keep it focused** — this is a 20-minute exercise, not a 2-hour meeting
