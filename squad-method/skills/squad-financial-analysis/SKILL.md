---
name: squad-financial-analysis
description: >
  Quant-grade forensic financial analysis pipeline. 6 specialized agents perform
  deep forensic analysis across 5 phases: Diverge, 12-Lens, Debate, Converge,
  Recommend. Every claim verified through 4-gate protocol. Academic-quality methods.
  Use when user asks for financial analysis, stock research, earnings analysis,
  M&A assessment, or investment thesis evaluation.
---

# SQUAD Financial Analysis — Quant-Grade Forensic Pipeline

Six specialized financial agents. All stay loaded throughout the session.
Progress report updated after every round.

**Load now:**
- `squad-method/agents/ledger.md` — forensic quantitative analyst
- `squad-method/agents/herald.md` — intelligence & signal analyst
- `squad-method/agents/sage.md` — structural quantitative researcher
- `squad-method/agents/maven.md` — quantitative strategic architect
- `squad-method/agents/quant.md` — chief risk & mathematical analyst
- `squad-method/agents/prism-adversarial.md` — adversarial epistemics
- `squad-method/fragments/financial-analysis-protocol.md`
- `squad-method/fragments/quant-verification-gates.md`
- `squad-method/fragments/source-verification.md`
- `squad-method/fragments/forensic-checklist.md`

## PHASE 0 — Data Freshness & Jurisdiction Declaration

**MANDATORY FIRST STEP — do not skip.**

```
⚠️ DATA FRESHNESS DECLARATION
  LLM training cutoff: [date]
  User-provided documents: [list with dates, or "none provided"]
  Data gaps: [what we don't have access to]
  Jurisdiction: [US/EU/India/other] — ask user if unclear
  Accounting standard: [US GAAP / IFRS / Ind AS]
  Reference class: "[Entity] compared against [class]. Base rate: [X%]"
```

→ Ask user: "Do you have recent filings, earnings transcripts, or news to provide?
My analysis is only as good as my data."

**USER GATE:** "I have the following data: [list]. Proceed with analysis? [Yes/Add more]"

---

## PHASE 1 — FORENSIC DIVERGE

Each agent analyses INDEPENDENTLY using full 3-layer depth.
Order: Ledger → Herald → Sage → Quant → Maven

**Ledger** runs `forensic-checklist.md` pre-flight first, then produces:
- Red Flag Score (0-100) with Beneish, Altman, Piotroski backing
- Earnings quality, footnote findings, capital structure risk
- DuPont 5-factor decomposition
- Quant layer: Benford's Law, LT-12 signals, accrual anomaly, tax forensics, PIN estimate

**Herald** produces:
- Insider activity, institutional flow, credit vs equity divergence, earnings call tone
- Signal vs noise classification per item (Granger causality)
- Quant layer: Shannon entropy, options-implied distribution, Bayesian composite P(decline/advance)

**Sage** produces:
- Moat velocity, industry structure phase, S-curve position, reinvestment runway
- Quant layer: CAS analysis, power law test, causal inference method, Bass model

**Quant** produces:
- Scenario matrix (5+ scenarios, probability-weighted)
- Tail risk: CVaR, EVT estimates, copula tail dependence
- Factor decomposition, sensitivity tornado
- Quant layer: bootstrap CI, model selection by AIC/BIC, ruin probability

**Maven** produces:
- Strategy forensics, pre-mortem (7+ failure paths)
- Decision options (3, never 1) with Kelly fractions
- Quant layer: expected utility, EVPI, scenario discovery

Apply `quant-verification-gates.md` to every major claim.
Apply `source-verification.md` tagging: [VERIFIED-N], [UNVERIFIED], [STALE], [LLM-TRAINING].

---

## PHASE 2 — 12-LENS APPLICATION (Prism-Adversarial)

Prism applies all 12 lenses with explicit % confidence, quant method, time horizon,
contrarian score, and dated source.

Also runs:
- Behavioral bias checklist on combined Phase 1 analysis
- Anti-fragility scoring
- Reflexive loop status

---

## PHASE 3 — ADVERSARIAL DEBATE

Each agent identifies the WEAKEST assumption in every other agent's analysis.
Minimum 6 cross-agent challenges. Format per `financial-analysis-protocol.md`.

Fermi cross-checks: each major quantitative claim gets independent Fermi estimate.
If model vs Fermi differ by >3x → flag for investigation.

Prism-Adversarial formal red team:
- 3 strongest arguments against the thesis
- Kill shot: single fact that would flip all agents
- Timeline: "If [X] hasn't happened by [date], thesis is dead"

---

## PHASE 4 — CONVERGE (Maven synthesizes)

- Convergence points: where all lenses agree (highest conviction, VERIFIED-4)
- Divergence points: where lenses disagree (mapped to testable assumptions)
- Risk matrix: 5×5 probability × impact

**Expected Utility Computation:**
```
| State of World | Probability | Option A | Option B | Option C |
→ Decision: Option [X] maximizes expected utility
→ EVPI: "Value of knowing [key uncertainty] ≈ [amount]"
```

**Pre-Mortem (MANDATORY):**
"It's 2 years from now. This [investment/strategy] failed completely."
7+ concrete failure paths with probabilities.

---

## PHASE 5 — RECOMMENDATION (Maven + Quant + Prism)

Three options (NEVER one):
```
Option A: [description]
  Risk: [CVaR] | Return: [CI range] | Conviction: [X%]
  Kelly: f*=[X%], fractional Kelly=[Y%] | P(ruin|1yr): [Z%]
Option B: ... | Option C: ...
```

Kill Criteria: "Abandon if: [specific observable triggers]"
Review Triggers: "Revisit if: [specific events]"
What We Don't Know: [explicit blind spots and data gaps]

Verification Summary:
```
VERIFIED-4: [N] | VERIFIED-3: [N] | VERIFIED-2: [N] | VERIFIED-1: [N] | UNVERIFIED: [N]
```

**Mandatory Disclaimer** (from `financial-analysis-protocol.md`) — always included.

---

## Behavioral Rules

- ALL 6 agents stay loaded throughout the session
- Prism speaks LAST in every round
- No single-point estimates — always include confidence intervals
- Every quantitative claim cites formula + inputs
- `[UNVERIFIED]` claims never appear in recommendations
- Disclaimer appears on ALL financial output
- Ask user for data at Phase 0 — analysis quality depends on data freshness
