---
name: squad-consulting-brief
description: >
  Strategic problem architecture with decision science rigor. Produces consulting-grade
  strategy briefs with mandatory pre-mortem, inversion analysis, expected utility
  computation, and adversarial challenge. Goes beyond McKinsey frameworks to Bayesian
  decision theory and mechanism design.
  Use when user asks for strategic analysis, strategy brief, business case, decision
  framework, or consulting recommendation.
---

# SQUAD Consulting Brief — Strategic Problem Architecture

**Not a consulting report. A decision-science document.**
Every recommendation is falsifiable. Every claim has a confidence interval.
Every strategy includes a kill criterion.

**Load now:**
- `squad-method/agents/maven.md` — quantitative strategic architect
- `squad-method/agents/sage.md` — structural quantitative researcher
- `squad-method/agents/prism-adversarial.md` — adversarial epistemics
- `squad-method/agents/quant.md` — chief risk & mathematical analyst
- `squad-method/fragments/quant-verification-gates.md`
- `squad-method/fragments/source-verification.md`

## Phase 0 — Problem Architecture

**Define the decision being made (NOT the analysis being done):**
```
Decision: [What specific choice must be made by [whom] by [when]]
Decision maker: [who]
Deadline: [date]
Stakes: [what's at risk if wrong?]
Success criteria: [what does "right decision" look like in 2 years?]
Data available: [what user has provided]
```

Ask: "What is the actual decision you need to make? Not the analysis — the choice."

**USER GATE:** "Decision defined. Proceed? [Yes/Refine]"

---

## Phase 1 — Situation Assessment (Maven + Sage)

**Maven** runs:
- Strategy forensics: capital allocation vs stated strategy
- Organizational debt assessment
- Strategic inflection point detection
- ⚡ Contrarian signal: the uncomfortable question

**Sage** provides:
- Industry structure phase and moat velocity
- S-curve positioning
- Causal inference for key strategic assumptions (method stated)
- Ergodicity check on growth projections

---

## Phase 2 — Options Generation

Maven generates exactly 3 strategic options (never 1, never more than 5):
- Each option must be genuinely different (not just fast/medium/slow)
- Each includes: what you're betting on, key assumption, kill criterion
- Kelly criterion: f* for each option

Prism-Adversarial challenges each option:
- What's the strongest argument against this option?
- What evidence would prove this option wrong?
- Reference class: what % of companies in similar situation that chose this option succeeded?

---

## Phase 3 — Decision Analysis (Quant + Maven)

**Expected Utility Computation:**
- Define states of the world with probabilities
- Compute EU for each option
- EVPI: "The value of knowing [X] before deciding is approximately [Y]"
- If EVPI is high: "More research recommended before deciding"
- If EVPI is low: "Decision is robust — more research won't change it"

**DMDU (when genuine uncertainty, not risk):**
- If probabilities can't be reliably assigned → use Robust Decision Making
- Find the option that performs "well enough" across widest scenario range
- Minimax regret analysis

**Ruin Analysis:**
- For each option: P(ruin|1yr), P(ruin|5yr)
- A positive expected value does not guarantee survival

---

## Phase 4 — Pre-Mortem (MANDATORY, Maven)

"It's 2 years from now. This strategy failed completely. Why?"

Generate 7-10 specific, concrete failure paths:
```
Failure Path 1: [specific, concrete, with trigger] — P=[X%]
...
Failure Path 7+: [specific, concrete, with trigger] — P=[X%]
Blind Spot: "Which of these would we NOT see coming?"
Perfect Storm: [PRIM scenario discovery — which combination is most dangerous?]
```

---

## Phase 5 — Recommendation Brief

```
━━━ STRATEGIC RECOMMENDATION BRIEF ━━━

Decision: [restated]
Deadline: [date]

RECOMMENDATION: Option [X]
Rationale: [why this option, not the others]
Key bet: [what must be true for this to work]
Confidence: [calibrated X%] (equivalent bet: would bet $[X] to win $[Y])

Expected Utility: EU=[X] vs alternatives EU=[Y],[Z]
EVPI: [amount] — [more research warranted? Y/N]
Kelly fraction: [X]%, fractional Kelly=[Y]%
Ruin probability: P(ruin|1yr)=[X%], P(ruin|5yr)=[Y%]

Kill Criteria: "Abandon if: [specific observable triggers]"
Review Triggers: "Revisit if: [specific events]"

Pre-Mortem: [top 3 failure paths with probabilities]
⚡ Contrarian Challenge: [Prism's strongest objection]

What we don't know: [explicit blind spots]

Verification: VERIFIED-4: [N] | ... | UNVERIFIED: [N]
```

---

## Behavioral Rules

- Always define the decision before the analysis — analysis without a decision is decoration
- NEVER present a single option — always 3
- Pre-mortem is MANDATORY — never skip
- EVPI tells you when more research is valuable vs when to just decide
- Kelly criterion applied to every option — negative Kelly = don't proceed
- Prism always challenges the leading option — consensus without challenge is dangerous
- Falsifiability certification on every major recommendation
