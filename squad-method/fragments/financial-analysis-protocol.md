---
fragment: financial-analysis-protocol
description: >
  Master protocol for quant-grade financial analysis. Defines the 5-phase
  pipeline (Diverge → Debate → Converge → Recommend → Verify), 12-lens format,
  confidence scoring, disclaimer requirements, and red flag escalation protocol.
  Required by all financial skills.
included_by: squad-financial-analysis, squad-market-research, squad-consulting-brief
---

# Financial Analysis Protocol

## Required Fragments

Load before any financial analysis:
- `squad-method/fragments/quant-verification-gates.md`
- `squad-method/fragments/source-verification.md`
- `squad-method/fragments/forensic-checklist.md`

## Design Philosophy: Quant Fund, Not Consulting Firm

> McKinsey gives you frameworks. Renaissance Technologies gives you edge.
> These agents think like quant researchers. Every claim is falsifiable.
> Every conclusion has a confidence interval. Every insight is tested against base rates.
> If you can't quantify it, you can't trust it.

## Analysis Pipeline

### PHASE 0 — Data Freshness & Jurisdiction Declaration

**MANDATORY before ANY analysis.**
```
⚠️ DATA FRESHNESS DECLARATION
  LLM training cutoff: [date]
  User-provided documents: [list with dates, or "none provided"]
  Data gaps: [what we don't have access to]
  Jurisdiction: [US/EU/India/other]
  Accounting standard: [US GAAP / IFRS / Ind AS]
  Reference class: "[Entity] compared against [class]. Base rate: [X%]"
```
→ Ask user to provide recent filings/transcripts if available.

### PHASE 1 — Forensic Diverge

Each agent analyses independently using their full 3-layer capability matrix.
Load agents: Ledger → Herald → Sage → Quant → Maven → Prism (in this order).

Ledger runs `forensic-checklist.md` pre-flight before any analysis.

Each agent output includes:
- Layer 1 findings (standard analysis)
- Layer 2 findings (deep, what most miss)
- Layer 3 findings (quant-grade methods)
- Verification tag for each major claim: `[VERIFIED-N]` or `[UNVERIFIED]`

### PHASE 2 — 12-Lens Application (Prism)

Prism applies all 12 lenses with:
- Explicit % confidence (not H/M/L)
- Quant method used per lens
- Time horizon
- Contrarian score (1-10, how much this differs from consensus)
- Source with date

12 Lenses: Optimistic | Pessimistic | Base Case | Geopolitical | Regulatory |
Tech Disruption | ESG/Sustainability | Behavioral | Contrarian | Second-Order |
Temporal | Structural

### PHASE 3 — Adversarial Debate

Each agent challenges the WEAKEST assumption in every other agent's analysis.
Minimum 6 cross-agent challenges. Format:
```
[Agent A] challenges [Agent B]: Your [conclusion] depends on [assumption].
  Counter-evidence: [data]. Statistical basis: [test, p-value].
  Impact if wrong: [quantified]. Gate failed: [which of 4 gates].
```

Prism runs formal red team:
```
RED TEAM: "Here's specifically why someone would SHORT this thesis..."
  3 strongest arguments against, with data
  Kill shot: the single fact that would flip all agents
  Timeline: "If [X] hasn't happened by [date], thesis is dead"
```

### PHASE 4 — Converge (Maven)

Maven synthesizes convergence/divergence points using decision science:
- Expected Utility computation (Bayesian)
- EVPI: Expected Value of Perfect Information
- Pre-mortem: 7+ concrete failure paths with probabilities
- Scenario discovery: which parameter combinations produce failure?

### PHASE 5 — Recommendation

Three options presented (NEVER single recommendation):
- Option A, B, C — each with CVaR, CI range, calibrated conviction %, Kelly fraction, ruin probability

## Confidence Scoring

Translate vague confidence to calibrated percentages.
Use the equivalent bet test: "Would you bet $X to win $Y on this?"

Never use HIGH/MEDIUM/LOW alone — always include explicit %.

## Red Flag Escalation

| Score | Action |
|---|---|
| Beneish M-Score > -1.78 | Flag in headline. Recommend forensic deep dive. |
| Altman Z-Score < 1.81 | Distress zone. Prominent warning. |
| 5+ forensic screens triggered | HIGH ALERT. Escalate before recommendation. |
| Auditor change + cluster insider selling | IMMEDIATE RED FLAG. Note in every section. |

## Mandatory Disclaimer

Every financial analysis output MUST end with:
```
⚠️ DISCLAIMER: This analysis is for informational and educational purposes
only and does not constitute financial, investment, legal, or tax advice.
Past performance and historical patterns do not guarantee future results.
Statistical models cited are simplified representations; real-world outcomes
involve factors no model can fully capture. All probabilities are estimates,
not guarantees. LLMs cannot run actual computations — for precise numerical
results, implement in Python/R with the cited libraries.
Always consult qualified financial professionals before making investment decisions.
```
