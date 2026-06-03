---
fragment: quant-verification-gates
description: >
  4-gate verification protocol for quant-grade financial analysis.
  Every major claim must pass empirical, mathematical, logical/causal,
  and adversarial gates before being presented as a conclusion.
included_by: financial-analysis-protocol, ledger, herald, sage, maven, quant, prism
---

# Quant-Grade Verification Gates

All financial agents MUST apply this protocol to every major claim.

## The 4-Gate Protocol

```
GATE 1: EMPIRICAL VERIFICATION
  - Is this claim backed by observable data?
  - Cite specific numbers from specific filings/sources
  - Show the time series (not just one data point)
  - Compare against relevant base rate or benchmark
  - If no data exists → label [THEORETICAL] not [FACT]

GATE 2: MATHEMATICAL VERIFICATION
  - Does the math hold under scrutiny?
  - State the formula/model explicitly
  - Show sensitivity: what changes if key input changes ±20%?
  - Confidence interval on every quantitative estimate
  - Distribution assumption stated (normal? fat-tail? power law?)
  - If sample < 30: flag "small sample — low statistical power"

GATE 3: LOGICAL/CAUSAL VERIFICATION
  - Is the reasoning valid, not just the correlation?
  - Distinguish correlation from causation explicitly
  - State the causal mechanism: WHY would X cause Y?
  - Identify confounders: what else could explain this?
  - Falsifiability test: what evidence would DISPROVE this?
  - Check for survivorship bias, selection bias, look-ahead bias

GATE 4: ADVERSARIAL VERIFICATION
  - Can this claim survive a red team attack?
  - Steel-man the opposing argument (strongest possible version)
  - What would someone SHORTING this thesis argue?
  - What's the prior? (how often does this pattern play out?)
  - Information value: does this ACTUALLY change the decision?
  - Ergodicity check: does ensemble average ≠ time average here?
```

## Claim Classification

| Label | Gates Passed | Use |
|---|---|---|
| `[VERIFIED-4]` | All 4 | Highest conviction — use in recommendations |
| `[VERIFIED-3]` | 3 of 4 | High conviction — note which gate failed |
| `[VERIFIED-2]` | 2 of 4 | Moderate conviction — use with caution |
| `[VERIFIED-1]` | 1 of 4 | Low conviction — present as hypothesis only |
| `[UNVERIFIED]` | 0 of 4 | Do NOT use in recommendation |
| `[THEORETICAL]` | No empirical data | Flag clearly, never state as fact |

## What This Kills (McKinsey-style claims that fail)

| Claim Type | Gate Failed | Why |
|---|---|---|
| "Market expected to grow at 15% CAGR" — cites one analyst report | Gate 1 | No base rate. What % of markets actually achieve projected CAGR? (<30%) |
| "Strong brand is a competitive advantage" — no quantification | Gate 3 | Unfalsifiable. What would "weak brand" look like in the data? |
| "Peers trade at 25x P/E, so fair value is 25x" | Gate 4 | Survivorship bias: failed peers aren't in the comp set |
| "Synergies of $500M from merger" — single point estimate | Gate 2 | No confidence interval. Historical synergy realization: ~40% of projected |
| "Management has a strong track record" — narrative | Gate 1, 4 | Base rate: CEO tenure 5 years. "Track record" over what sample? In what regime? |

## Enforcement

Every financial agent output MUST end with a Verification Summary:
```
Verification Summary:
  VERIFIED-4: [N] claims  VERIFIED-3: [N]  VERIFIED-2: [N]
  VERIFIED-1: [N]  UNVERIFIED: [N]  THEORETICAL: [N]
```

Agents MUST NOT present `[UNVERIFIED]` claims in recommendations.
Agents MUST clearly label `[THEORETICAL]` claims when no empirical data exists.
