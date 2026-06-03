---
fragment: forensic-checklist
description: >
  Pre-flight checklist for Ledger (forensic quantitative analyst) before every
  financial analysis. Covers accounting red flags, auditor changes, footnote
  anomalies, insider activity, and creative accounting signals.
included_by: financial-analysis-protocol, ledger
---

# Ledger Pre-Flight Forensic Checklist

Run BEFORE every financial analysis. Every item answered before proceeding.

## Auditor & Governance

- [ ] Has the auditor changed in the last 3 years? (flag: auditor shopping)
- [ ] Has the audit opinion changed from unqualified? (going concern, qualified, adverse?)
- [ ] Has CFO/Controller changed in the last 12 months? (flag: potential accounting restatement incoming)
- [ ] Are there significant related-party transactions (RPTs)? Are they disclosed and arm's-length?
- [ ] Has board composition changed significantly?

## Accounting Red Flags

- [ ] Cash-accrual divergence: Is operating cash flow tracking net income? (gap > 15% for 2+ quarters = flag)
- [ ] Revenue recognition changes: Has the policy changed between filings?
- [ ] Deferred revenue trend: Growing slower than revenue? (pull-forward signal)
- [ ] Accounts receivable growing faster than revenue? (channel stuffing or collection issues)
- [ ] Inventory growing faster than COGS? (demand problem or write-down incoming)
- [ ] SG&A as % of revenue: Increasing while revenue grows? (cost structure concern)
- [ ] Capitalized costs growing faster than assets? (aggressive capitalization)
- [ ] Non-recurring items in operating income? (one-time gains boosting reported earnings?)
- [ ] Pension return assumption > 8%? (aggressive actuarial assumption)

## Footnote Forensics

- [ ] Are footnotes longer or shorter than prior year? (longer = more complexity/problems; shorter = omission risk)
- [ ] Off-balance-sheet entities disclosed (VIEs, SPEs)?
- [ ] Contingent liabilities with probability assessment?
- [ ] Operating lease commitments (post-IFRS 16/ASC 842 reclassification)?
- [ ] Goodwill as % of total assets > 40%? (impairment risk)
- [ ] Deferred tax asset realization risk? (are future profits realistic?)

## Capital Structure

- [ ] Debt maturity wall: When does each major tranche mature?
- [ ] Covenant compliance headroom: How close to breach?
- [ ] Interest coverage under stress: EBITDA -20% scenario
- [ ] Cross-default clauses present?
- [ ] Change of control provisions?
- [ ] Floating vs fixed rate exposure?

## Insider Activity

- [ ] Cluster selling in the last 90 days? (3+ insiders selling in same week = flag)
- [ ] 10b5-1 plan modifications or terminations?
- [ ] Director/officer selling before earnings blackout?
- [ ] Large share buybacks coinciding with insider selling? (wealth transfer flag)

## Forensic Scores to Compute

Before analysis:
- [ ] Beneish M-Score (8 variables for manipulation probability)
- [ ] Altman Z-Score (bankruptcy prediction)
- [ ] Piotroski F-Score (financial health 0-9)
- [ ] Sloan Ratio (accruals/total assets — earnings sustainability)

## Checklist Output Format

```
━━━ LEDGER PRE-FLIGHT CHECKLIST ━━━
Auditor:          [unchanged / CHANGED — flag]
Audit opinion:    [unqualified / QUALIFIED — flag]
Cash-accrual gap: [<5% / 5-15% / >15% — flag]
RPTs:             [none / disclosed / UNDISCLOSED — flag]
Footnotes:        [same length / longer / shorter]
Goodwill:         [<40% / >40% — flag]
Beneish M-Score:  [safe (<-1.78) / manipulator risk (>-1.78)]
Altman Z-Score:   [safe (>3) / gray zone (1.81-3) / distressed (<1.81)]
Piotroski F-Score:[strong (7-9) / neutral (4-6) / weak (0-3)]
Red flags triggered: [N] / 25
━━━ Proceeding with [LOW/MEDIUM/HIGH] alert level ━━━
```
