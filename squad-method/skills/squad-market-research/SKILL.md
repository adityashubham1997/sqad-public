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

## Phase 5.5 — Divergent-Convergent Multi-Agent Consensus Loop

When executed by an IDE that supports spawning parallel subagents or concurrent tool runs (Path A/B):
1. **Divergent Phase:** The IDE Agent should spawn/simulate 8 distinct virtual agents in parallel (Sovereign Policy, Macro Interest Rates, Related Parties, Growth & Scale, Technical, Fundamental, Quantitative Risk, and Adversarial). Each agent evaluates the target industry data using its unique investigative lens and writes a draft memo.
2. **Convergent Phase:** A virtual Moderator Agent consolidates the 8 drafts into a unified cohesive report.
3. **Auditing Gate:** A virtual Pro Red Team Auditor reviews the unified report, compiling an adversarial critique log of all assumptions.
4. **Fact Hardening Refinement:** A virtual Refiner Agent addresses the critique log to fact-harden all statements, outputting the final hardened synthesis.

**Path C (sequential IDEs):** Run each of the 8 investigative lenses sequentially as persona-switching prompts. Each lens reads all prior memos before producing its own. Then run Moderator → Red Team → Refiner in order.

---

## Phase 6 — AUTOMATED SLIDE-DECK DASHBOARD & SOCIAL SHARE BUILDER

To support interactive visual reviews, the agent must programmatically compile and write a structured presentation database and an interactive HTML/CSS slide viewer under `output/dashboard/[MARKET_NAME]/`.

### 1. Compile Structured Database (`forensic_report.json`)
Write a valid, minified JSON object with the following schema:
```json
{
  "subject": "[MARKET_NAME]",
  "forensic_case_study": {
    "headline": "[High-impact market study title]",
    "editorial_verdict": "[Final quality verdict / industry outlook rating]",
    "side_by_side_comparison": {
      "column_headers": {
        "standard_label": "Mainstream Reported Metrics",
        "target_label": "Forensic Audited Metrics"
      },
      "rows": [
        {
          "metric": "[e.g., TAM, CAGR, S-Curve Maturity, Power Law Consolidation]",
          "standard_value": "[Value reported by industry sources]",
          "target_value": "[Audited forensic value]",
          "mismatch_percentage": "[Variance delta percentage]"
        }
      ]
    },
    "conclusion_question": "[Thought-provoking forward-looking market dynamic query]"
  },
  "forensic_trust_gap": {
    "standard_sources_coverage": "[Mainstream consensus industry reports narrative]",
    "our_forensic_exposure": "[Hidden barriers, regulatory shifts, or consolidation pivots uncovered]",
    "unique_trust_rationale": "[Why this specific analysis provides an informational edge]"
  },
  "anomalies": [
    {
      "source_claim": "[Claim from industry association, report, or prospectus]",
      "counter_claim": "[Reality found via cross-referencing and auditing]",
      "verdict": "[Label: e.g. TAM Discrepancy, Moat Decay, Regulatory Risk]",
      "severity": "[High / Medium / Low]",
      "type": "[Fundamental / Technical / Regulatory / Operational]",
      "citations": [
        { "name": "[Source Name]", "url": "[Source URL]" }
      ]
    }
  ],
  "tracks": {
    "corporate": "[Corporate/industry consolidation dynamics, mergers, and cost structures]",
    "policy": "[Macro regulations, taxation rails, or infrastructure bottlenecks]",
    "sovereign": "[Global macro risks, supply chain dependencies, and Fx exposures]"
  },
  "socioeconomic": [
    {
      "area": "[Segment or demographic affected]",
      "impact": "[Structural and operational impact description]",
      "outcome": "[Trend vector or strategic direction]"
    }
  ],
  "regional_growth_story": {
    "title": "Slide 8: Regional Digital Infrastructure & Growth Outlook",
    "region": "[Target region, e.g. India, Southeast Asia, EMEA]",
    "narrative": "[Detailed analysis of regional digital infrastructure, regulatory frameworks, and their impact on market growth]",
    "outlook": "[Favorable / Unfavorable / Neutral]"
  },
  "strategic_benchmarks": [
    {
      "model_project": "[Precedent market/industry case]",
      "what_they_did_well": "[Best practices implemented]",
      "our_target_shortfall": "[Gap/shortfall observed in our target sector]",
      "strategic_learning": "[Key takeaway for capital allocation]"
    }
  ],
  "citations": [
    { "name": "[Source Name]", "url": "[Source URL]" }
  ],
  "social_share_post": {
    "skeptical": "[Twitter/LinkedIn post from a skeptical, high-conviction bear angle]",
    "macro": "[Twitter/LinkedIn post highlighting macro interest rates and structural shifts]",
    "question": "[Twitter/LinkedIn post posing an open, analytical question on TAM/unit economics]",
    "short": "[1-sentence micro-thesis bullet point suitable for quick reading]"
  },
  "api_usage": {
    "total_input_tokens": 0,
    "total_output_tokens": 0,
    "total_cost_usd": 0.0,
    "total_cost_inr": 0.0,
    "usd_to_inr_rate": 84.0
  }
}
```

### 2. Load Data Safely in HTML
The HTML file must load `forensic_report.json` using a safe inline approach. Do NOT use `window.*` globals with raw JS insertion. Instead, embed the JSON in a `<script type="application/json" id="forensic-data">` tag and parse it with `JSON.parse(document.getElementById('forensic-data').textContent)`. This prevents XSS from unescaped field values.

### 3. Compile Premium Interactive HTML Slides (`index.html`)
Write a single-page HTML application (`index.html`) with styling (`style.css`) incorporating modern dark glassmorphism (vibrant gradient backdrops, frosted-glass frames, and premium typography). 
* The interface must parse the embedded JSON data and display a premium 8-slide presentation deck.
* Include keyboard navigation (arrow keys), visual dot indicators, and an interactive side-by-side mismatch matrix table.
* **Slide 1:** Title, Market Name, Editorial Verdict, and live token-to-Rupee HUD cost tracker footer.
* **Slide 2:** Forensic Trust Gap (Mainstream Narrative vs. Exposure).
* **Slide 3:** Variance Matrix (Side-by-side comparison table).
* **Slide 4:** Deconstructed Anomalies (tabbed or paginated layout).
* **Slide 5:** Multi-Track Auditing (Corporate, Policy, Sovereign views).
* **Slide 6:** Strategic Benchmarks & Precedents.
* **Slide 7:** Copyable Social Post Builder UI.
* **Slide 8:** Regional Growth Story Panel (digital infrastructure, regulatory outlook).

---


## Behavioral Rules

- NEVER use TAM as growth justification without SAM conversion evidence
- ALWAYS provide the time dimension for every structural claim
- Fermi cross-check on every TAM > $10B
- Every structural claim cites a historical parallel
