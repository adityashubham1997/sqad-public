---
name: squad-market-research
description: >
  Deep structural market and industry research using quant-grade methods.
  Four agents produce industry lifecycle analysis, moat assessment, competitive dynamics,
  and structural shift detection. Goes far beyond surface-level TAM/SAM analysis.
  Use when user asks for market research, industry analysis, competitive landscape,
  sector deep-dive, or TAM assessment.
---

# SQUAD Market Research — Structural Deep Dive

Deep structural analysis using quant-grade methods. Not your typical consultant market
report — every claim is empirically grounded, every TAM is stress-tested.

**Load now:**
- `squad-method/agents/oracle.md` — research and synthesis
- `squad-method/agents/sage.md` — structural quantitative researcher
- `squad-method/agents/herald.md` — intelligence & signal analyst
- `squad-method/agents/prism-adversarial.md` — adversarial epistemics
- `squad-method/fragments/quant-verification-gates.md`
- `squad-method/fragments/source-verification.md`

## Phase 0 — Scope & Data Declaration

```
⚠️ DATA FRESHNESS DECLARATION
  Research scope: [specific market/industry/segment]
  Jurisdiction: [US/EU/India/global]
  Time horizon: [3-month / 1-year / 5-year / 10-year]
  User-provided data: [list or "none"]
  LLM training cutoff: [date]
```

Ask: "Which time horizon matters most for your decision?"

---

## Phase 1 — Market Sizing (Oracle + Sage)

**Oracle** researches:
- TAM, SAM, SOM with methodology stated
- Historical market size time series (not single-point estimates)
- Growth rate with confidence interval

**Sage** stress-tests:
- TAM via Fermi estimation cross-check (if model vs Fermi differ >3x → investigate)
- SAM conversion analysis: evidence of actual market penetration rates from comparable industries
- Bass diffusion model (p, q parameters) for adoption curve positioning
- Ergodicity check: arithmetic vs geometric growth expectation

---

## Phase 2 — Industry Structure Analysis (Sage)

- Value chain mapping: who captures what margin at each stage
- Consolidation wave phase identification
- Barrier-to-entry reality test (claimed vs actual new entrant success rate over 10 years)
- Profit pool migration over last decade
- Power law test: winner-take-all degree (α exponent)
- Industry lifecycle quantification via Gompertz function

---

## Phase 3 — Competitive Intelligence (Herald + Oracle)

**Herald** provides:
- Institutional flow intelligence (smart money positioning in sector)
- Patent citation network: foundational IP vs derivative patents (PageRank)
- Job posting analysis: which competitors are hiring for what?
- Regulatory pipeline affecting the sector

**Oracle** provides:
- Competitive landscape map with market share estimates
- Strategic group analysis
- M&A activity patterns and consolidation signals

---

## Phase 4 — Contrarian Assessment (Prism-Adversarial)

- 12-lens analysis with explicit % confidence per lens
- Reference class forecasting: what % of markets with these characteristics succeeded?
- Behavioral bias audit on market consensus
- Falsifiability certification for key market assumptions
- Red team: strongest arguments that this market is overestimated

---

## Phase 5 — Synthesis & Report

```
━━━ MARKET RESEARCH REPORT ━━━
Market: [name] | Jurisdiction: [X] | Time horizon: [Y]

Market Size:
  TAM: [X] (Fermi cross-check: [Y] — [within 3x / discrepancy — investigate])
  Growth rate: [X]% ± [CI] | Bass model: maturation in ~[N] years

Industry Structure:
  Phase: [fragmented/consolidating/oligopoly/disrupting]
  Moat velocity: [widening/narrowing]
  Winner-take-all degree: α=[X] — [interpretation]

Key Signals: [Herald's top 3]
Contrarian View: [Prism's main challenge]
Reference Class: [base rate — [X]% of similar markets achieved [Y]]

Verification Summary: VERIFIED-4: [N] | ... | UNVERIFIED: [N]
```

---

## Behavioral Rules

- NEVER use TAM as growth justification without SAM conversion evidence
- ALWAYS provide the time dimension for every structural claim
- Fermi cross-check on every TAM > $10B
- Every structural claim cites a historical parallel
