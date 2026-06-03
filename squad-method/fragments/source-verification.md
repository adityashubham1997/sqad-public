---
fragment: source-verification
description: >
  Source citation and freshness rules for financial analysis agents.
  Every claim must cite a source with date. Unverified claims tagged [UNVERIFIED].
  Stale data (>90 days) tagged [STALE].
included_by: financial-analysis-protocol, ledger, herald, sage, maven, quant, prism
---

# Source Verification Protocol

## Source Hierarchy (descending credibility)

1. **Primary sources** — actual filings, patents, court documents, regulatory submissions
   - SEC filings (10-K, 10-Q, 8-K, DEF 14A, Form 4)
   - SEBI/MCA filings (for Indian entities)
   - EU regulatory submissions
   - Patent filings and court documents
2. **Structured data providers** — Bloomberg, Refinitiv, FactSet, Compustat, EDGAR
3. **Industry data** — Statista, IBISWorld, government census, central bank data
4. **Analyst reports** — sell-side, buy-side research (cite firm + date)
5. **News articles** — Reuters, FT, WSJ, Bloomberg News (last resort, use with caution)

## Citation Format

Every quantitative claim: `[NUMBER] — [Source, Date]`

Example: `Revenue grew 23% YoY to $4.2B — 10-K FY2025, filed 2025-02-15`

## Tags

| Tag | Meaning | Action |
|---|---|---|
| `[UNVERIFIED]` | Claim not backed by a cited source | Do NOT use in recommendation |
| `[STALE]` | Source is > 90 days old | Flag prominently; verify current state |
| `[LLM-TRAINING]` | From LLM training data, not user-provided | Treat as background context only |
| `[THEORETICAL]` | No empirical data available | Label clearly, never state as fact |
| `[USER-PROVIDED]` | From documents provided by user | Most current available data |

## Data Freshness Declaration (Phase 0 — MANDATORY)

Every financial analysis MUST begin with:
```
⚠️ DATA FRESHNESS DECLARATION
  LLM training cutoff: [date]
  User-provided documents: [list with dates, or "none"]
  Data gaps: [what we don't have access to]
  Jurisdiction: [US/EU/India/other]
  Accounting standard: [US GAAP / IFRS / Ind AS]

  → Ask user: "Do you have recent filings, earnings transcripts, or
     news articles to provide? My analysis is only as good as my data."
  → Reference class: "[Entity] is being compared against [reference class].
     Base rate for [key outcome]: [X%]."
```

## Rules

- NEVER state a ratio without context: industry median, 5-year trend, and peer comparison
- NEVER extrapolate from single data points — minimum 3 confirming signals for any alert
- ALWAYS distinguish between: what the CREDIT market says vs equity market vs options
- ALWAYS check data recency: if the most recent filing is > 6 months old, flag it
- Source hierarchy is strict — never use news articles when filing data is available
