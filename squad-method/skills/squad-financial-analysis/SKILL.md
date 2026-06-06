---
name: squad-financial-analysis
description: >
  Full-spectrum financial analysis by ticker symbol. Seven specialized agents
  run four parallel streams — Technical (Charts), Fundamental (Ledger),
  Quantitative (Quant + Herald), and Research (Sage). Adapts to your data
  subscriptions: free (yfinance), professional (Bloomberg/Reuters/FactSet),
  or documents you paste. Every claim verified through 4-gate protocol.
  Use when user says "analyze [TICKER]", "research [stock]", "should I buy/sell",
  "financial analysis", "stock research", or runs /financial-analysis.
---

# SQUAD Financial Analysis — Full-Spectrum by Ticker

Seven specialized agents across four analysis streams. All stay loaded throughout
the session. Progress report updated after every phase.

## SKILL BOOTSTRAP (execute before Phase 0 — non-negotiable)

### B1 — Load agents and fragments

```
squad-method/agents/_base-agent.md          ← ALWAYS (grounding waterfall + progress doc + orchestrator)
squad-method/agents/charts.md               ← technical & quantitative market analyst
squad-method/agents/ledger.md               ← forensic quantitative analyst
squad-method/agents/herald.md               ← intelligence & signal analyst
squad-method/agents/sage.md                 ← structural quantitative researcher
squad-method/agents/maven.md                ← quantitative strategic architect
squad-method/agents/quant.md                ← chief risk & mathematical analyst
squad-method/agents/prism-adversarial.md    ← adversarial epistemics (speaks LAST)
squad-method/fragments/agent-orchestrator.md
squad-method/fragments/context-injection-protocol.md
squad-method/fragments/financial-analysis-protocol.md
squad-method/fragments/quant-verification-gates.md
squad-method/fragments/source-verification.md
squad-method/fragments/forensic-checklist.md
```

### B2 — Check for existing progress report (anti-amnesia)

```bash
ls squad-method/output/progress/progress-financial-analysis-* 2>/dev/null
```

- **If found:** "Found in-progress analysis: [ticker] from [date]. Resume from Phase [N]? [Yes/Restart]"
- **If not found:** Create `squad-method/output/progress/progress-financial-analysis-[TICKER]-[date].md` NOW, before Phase 0.
- **Update the progress report at the END of every phase, BEFORE the user gate.** It is the anti-amnesia record.

### B3 — Run grounding waterfall (from _base-agent.md)

```
Level 0: CONTEXT.md + CLAUDE.md + DEEP-CONTEXT.md     ← always read first
Level 1a: graph.json KG                                ← if this is codebase analysis (skip for pure financial analysis)
Level 1b: grep / code search                           ← skip for pure financial analysis
Level 2:  fragments (financial-analysis-protocol, quant-verification-gates, source-verification)
Level 3:  tracker / KB artifacts                       ← skip unless the entity is in your tracker
Level 4:  nothing found → declare [DESIGN-N] assumptions and wait for user approval
```

### B4 — Detect dispatch path (auto)

```
Agent() tool in toolbox?  → PATH A — Claude Code, max 5 parallel subagents
claude CLI on PATH?       → PATH B — CLI subprocess, max 3 parallel
Neither?                  → PATH C — Sequential simulation (Windsurf/Cursor/Kiro/Gemini/Antigravity)
```

Write to progress report: `dispatch_path: [A/B/C]`

### B5 — Model routing for this skill

Resolve BEFORE dispatching any agent. Check `config.yaml → model_routing.mode` first:
- `mode: quality` → upgrade ALL to **heavy**
- `mode: budget` → downgrade ALL to **fast**
- `mode: balanced` (default) → use per-agent assignments below

| Agent | Default Tier | Reason | God-node auto-upgrade? |
|---|---|---|---|
| **Charts** | default | Pattern recognition, indicator math — no max reasoning needed | No |
| **Ledger** | **heavy** | Forensic accounting requires deep reasoning across many metrics | Yes — complex filings |
| **Herald** | default | Signal detection + NLP on transcripts | No |
| **Sage** | **heavy** | Industry structural research, causal inference | Yes |
| **Maven** | **heavy** | Decision theory, pre-mortem, EVPI — synthesis requires heavy | Yes |
| **Quant** | **heavy** | Mathematical modeling, EVT, copulas, ruin probability | Yes |
| **Prism-Adversarial** | **heavy** | Adversarial challenge requires strong reasoning to break prior analysis | Yes |

Record resolved routing in progress report:
```yaml
model_routing:
  mode: [balanced/quality/budget]
  charts: [fast/default/heavy]
  ledger: [heavy]
  herald: [default/heavy]
  sage: [heavy]
  maven: [heavy]
  quant: [heavy]
  prism_adversarial: [heavy]
```

### B6 — Parallel dispatch plan

PATH A/B (Claude Code, Codex):
```
Phase 1 (Technical): Charts alone — serial (no dependencies)
Phase 2 (Fundamental): Ledger alone — serial
Phase 3 (Quantitative): Quant + Herald — PARALLEL (independent)
Phase 4 (Research): Sage + Maven — PARALLEL (independent)
Phase 5 (Adversarial): Prism-Adversarial — serial, consumes ALL prior output
Phase 6 (Synthesis): Maven re-synthesizes — serial, consumes Phase 5
```

PATH C (Sequential simulation / Agentic IDE Concurrency):
```
Run in order: Charts → Ledger → Quant → Herald → Sage → Maven → Prism-Adversarial → Maven(synthesis)
Each agent reads all prior outputs before producing its own.
Phase completion table emitted after each agent (R6 C4).
```

### B6.5 — Divergent-Convergent Multi-Agent Consensus Loop
When executed by a Paid/Pro Agentic IDE that supports spawning parallel subagents or concurrent tool runs:
1. **Divergent Phase:** The IDE Agent should spawn/simulate 8 distinct virtual agents in parallel (Sovereign Policy, Macro Interest Rates, Related Parties, Growth & Scale, Technical, Fundamental, Quantitative Risk, and Adversarial). Each agent evaluates the data using its unique investigative lens and writes a draft memo.
2. **Convergent Phase:** A virtual Moderator Agent consolidates the 8 drafts into a unified cohesive report.
3. **Auditing Gate:** A virtual Pro Red Team Auditor reviews the unified report, compiling an adversarial critique log of all assumptions.
4. **Fact Hardening Refinement:** A virtual Refiner Agent addresses the critique log to fact-harden all statements, outputting the final hardened synthesis.


### B7 — Emit bootstrap confirmation before Phase 0

```
━━━ SQUAD FINANCIAL ANALYSIS — BOOTSTRAP COMPLETE ━━━
Dispatch path:    [A / B / C]
Agents loaded:    7 (Charts, Ledger, Herald, Sage, Maven, Quant, Prism-Adversarial)
Model routing:    [summary — e.g., "heavy ×5, default ×2"]
Progress report:  [path — created / resumed from Phase N]
Grounding:        [CONTEXT.md loaded / KG skipped (financial analysis) / fragments loaded]
Context injected: [paths or "none"]
━━━ Proceeding to Phase 0 — Intake ━━━
```

---

## PHASE 0 — INTAKE: Ticker, Subscriptions & Data Collection

**This phase runs before any analysis. Do not skip any step.**

### Step 0a — Get the Ticker

Ask the user:
```
What would you like to analyze?
  → Enter a ticker symbol (e.g., AAPL, RELIANCE.NS, TSLA, NIFTY50.NS, BTC-USD)
  → Or describe the entity: "analyze Apple" / "research Reliance Industries"

For Indian markets use: SYMBOL.NS (NSE) or SYMBOL.BO (BSE)
Examples: RELIANCE.NS, TCS.NS, HDFCBANK.NS, INFY.NS
```

Once the ticker is confirmed, print the header:
```
━━━ SQUAD FINANCIAL ANALYSIS: [TICKER] ━━━
Exchange:   [NSE/BSE/NYSE/NASDAQ/LSE/other]
Currency:   [INR/USD/GBP/EUR]
Sector:     [if known from LLM training data — flag as [LLM-TRAINING]]
Analysis:   Technical + Fundamental + Quantitative + Research
```

### Step 0b — Subscription & Data Source Discovery

Ask:
```
What data sources do you have access to? (select all that apply)

FREE SOURCES (no cost):
  [ ] Yahoo Finance / yfinance (I'll provide a Python snippet)
  [ ] TradingView (browser charts — paste key levels)
  [ ] Screener.in / Tickertape (India fundamentals)
  [ ] SEC EDGAR / NSE/BSE filings (I'll read documents you paste)

PROFESSIONAL (paid):
  [ ] Bloomberg Terminal or Bloomberg API (BQL/BLPAPI)
  [ ] Reuters Eikon / LSEG Workspace
  [ ] FactSet
  [ ] Capital IQ / S&P Global
  [ ] Quandl / Nasdaq Data Link
  [ ] Koyfin Pro
  [ ] Unusual Whales (options flow)

BROKERAGE API:
  [ ] Interactive Brokers (IBKR TWS API)
  [ ] Zerodha Kite API (India)
  [ ] Alpaca / Polygon.io
  [ ] Robinhood / Schwab

NONE — use LLM training data only (analysis will be as of training cutoff)
```

Based on the answer, display:
```
📊 DATA PLAN:
  Technical:    [data source + freshness]
  Fundamental:  [data source + freshness]
  Options flow: [available / not available — need: Unusual Whales / Bloomberg]
  Insider data: [available / not available — need: SEC Form 4 / NSE insider feed]
  Earnings call:[available / not available — need: transcript URL or paste]
```

### Step 0c — Data Collection (provide snippets, wait for user to run & paste)

**If user has yfinance (free):** Provide this snippet and ask them to run it and paste the output:

```python
# Run this and paste the output into the conversation
import yfinance as yf
import pandas as pd

ticker = "AAPL"  # ← change this

t = yf.Ticker(ticker)
hist = t.history(period="1y", interval="1d")
info = t.info

print(f"\n{'='*60}")
print(f"TICKER: {ticker}")
print(f"{'='*60}")

print("\n--- PRICE (last 252 trading days) ---")
print(hist[['Open','High','Low','Close','Volume']].to_string())

print("\n--- VALUATION & KEY METRICS ---")
keys = [
    'currentPrice','marketCap','enterpriseValue',
    'trailingPE','forwardPE','priceToBook','priceToSalesTrailingFY',
    'enterpriseToEbitda','enterpriseToRevenue',
    'trailingEps','forwardEps','pegRatio',
    'revenueGrowth','earningsGrowth','profitMargins','operatingMargins',
    'returnOnEquity','returnOnAssets','debtToEquity','currentRatio',
    'totalCash','totalDebt','freeCashflow','operatingCashflow',
    'beta','52WeekChange','SandP52WeekChange',
    'fiftyTwoWeekHigh','fiftyTwoWeekLow',
    'fiftyDayAverage','twoHundredDayAverage',
    'shortRatio','shortPercentOfFloat','sharesShort',
    'dividendYield','payoutRatio','exDividendDate',
    'heldPercentInstitutions','heldPercentInsiders',
    'recommendationMean','numberOfAnalystOpinions','targetMeanPrice'
]
for k in keys:
    if k in info and info[k] is not None:
        print(f"  {k}: {info[k]}")

print("\n--- OPTIONS (nearest 3 expiries) ---")
try:
    for exp in t.options[:3]:
        chain = t.option_chain(exp)
        spot = info.get('currentPrice', 0)
        calls = chain.calls[(chain.calls['strike'] > spot*0.9) & (chain.calls['strike'] < spot*1.1)]
        puts  = chain.puts[(chain.puts['strike'] > spot*0.9)  & (chain.puts['strike'] < spot*1.1)]
        print(f"\n  Expiry: {exp}")
        print(f"  Calls (ATM ±10%):")
        print(calls[['strike','bid','ask','volume','openInterest','impliedVolatility']].to_string())
        print(f"  Puts (ATM ±10%):")
        print(puts[['strike','bid','ask','volume','openInterest','impliedVolatility']].to_string())
except:
    print("  Options not available for this ticker")
```

For Indian markets (NSEpy):
```python
from nsepy import get_history
from datetime import date, timedelta
import yfinance as yf

symbol = "RELIANCE"  # without .NS for nsepy
end = date.today()
start = end - timedelta(days=365)

# Price history
data = get_history(symbol=symbol, start=start, end=end)
print("--- PRICE ---")
print(data[['Open','High','Low','Close','Volume','Turnover']].to_string())

# Also fetch fundamentals via yfinance
t = yf.Ticker(f"{symbol}.NS")
print("\n--- METRICS ---")
for k,v in t.info.items():
    if v is not None and k in ['trailingPE','priceToBook','debtToEquity',
                                'returnOnEquity','profitMargins','marketCap']:
        print(f"  {k}: {v}")
```

**If user has Bloomberg:** Ask them to pull and paste:
- `BDH([TICKER], "PX_LAST,VOLUME,RSI_14D,MACD_SIGNAL_LINE", [start], [end])`
- `BDP([TICKER], "PE_RATIO,PX_TO_BOOK_RATIO,EV_TO_EBITDA,RETURN_ON_EQY,NET_DEBT_TO_EBITDA")`
- Latest earnings call transcript

**If user has NO data sources:**
```
⚠️ No live data available.
Analysis will use LLM training data (cutoff: [date]).
All outputs tagged [LLM-TRAINING].
Confidence is reduced — treat as directional context, not current data.
```

### Step 0d — Data Freshness Declaration

After receiving user data, print:
```
⚠️ DATA FRESHNESS DECLARATION: [TICKER]
  Price data:      [date range provided] — [FRESH / STALE / LLM-TRAINING]
  Financials:      [most recent filing date] — [FRESH / STALE / LLM-TRAINING]
  Options data:    [date] — [FRESH / STALE / NOT AVAILABLE]
  Insider activity:[source + date] — [FRESH / STALE / NOT AVAILABLE]
  Jurisdiction:    [US/India/UK/other]
  Accounting std:  [US GAAP / Ind AS / IFRS]
  Reference class: [Sector peers — e.g., "Large-cap US tech, median PE=[X]"]
```

**USER GATE:** "Data collected. Ready to run all four analysis streams? [Yes/Add more data/Skip a stream]"

---

## PHASE 1 — TECHNICAL ANALYSIS (Charts)

**Charts runs first** — price is the most current, objective signal.

Charts analyzes ALL provided price data and produces:

```
📉 CHARTS — Technical Analysis: [TICKER]

TREND (Multi-Timeframe):
  Weekly (macro):  [BULL/BEAR/SIDEWAYS] — price is [above/below] 200-week MA
  Daily (tactical):[BULL/BEAR/SIDEWAYS] — [key level in focus]
  4h/1h (entry):   [BULL/BEAR/SIDEWAYS] — [setup trigger]

SUPPORT & RESISTANCE:
  Resistance: [price] | [price] | [price]
  Support:    [price] | [price] | [price]
  52-week H/L: [high] / [low] — currently [X]% from 52wk high

MOMENTUM:
  RSI (14):  [value] — [condition] | Divergence: [YES/NO]
  MACD:      [signal] | Histogram: [expanding/contracting]

VOLUME & FLOW:
  OBV:       [rising/falling/flat] — [agrees/disagrees with price]
  Short interest: [X]% of float — [HIGH/MODERATE/LOW]
  Institutional ownership: [X]% — [change from prior quarter: +/-]

VOLATILITY:
  BB width:  [SQUEEZE/NORMAL/EXPANSION]
  ATR (14):  [value] — [X]% daily range
  IV vs HV:  [IV] vs [HV] — [IV PREMIUM / IV DISCOUNT]

OPTIONS FLOW (if available):
  P/C ratio: [value] | Max pain: [price] | GEX: [positive/negative]
  Unusual activity: [description or "none detected"]

ACTIVE PATTERNS:
  [Pattern name] → [BULLISH/BEARISH] | Target: [price] | Stop: [price]
  Historical hit rate: [X]% (n=[N])

TECHNICAL VERDICT:
  Bias: [BULLISH / BEARISH / NEUTRAL — conviction: HIGH/MEDIUM/LOW]
  Entry zone: [range] | Target: [price] (+[X]%) | Stop: [price] (-[Y]%)
  Risk/Reward: [ratio] | Time horizon: [estimate]
  Hurst Exponent: [H] — [trending/mean-reverting]
```

---

## PHASE 2 — FUNDAMENTAL ANALYSIS (Ledger)

Ledger runs forensic pre-flight checklist, then produces:

```
📊 LEDGER — Fundamental Analysis: [TICKER]

VALUATION:
  P/E (trailing/forward): [X]x / [Y]x — sector median: [Z]x
  EV/EBITDA:  [X]x | P/B: [X]x | P/FCF: [X]x
  PEG ratio:  [X] — [CHEAP (<1) / FAIR (1-1.5) / EXPENSIVE (>1.5)]
  DCF implied fair value: [range] — current price [X]% [above/below]

EARNINGS QUALITY:
  Revenue CAGR (3y): [X]% | Earnings CAGR: [X]%
  Operating margin: [X]% — [expanding/contracting] vs prior year
  FCF margin: [X]% | FCF conversion: [X]% of net income
  Beneish M-Score: [X] — [SAFE / MANIPULATION RISK]
  Sloan Ratio: [X]% — [LOW / MODERATE / HIGH] accruals
  Cash-accrual gap: [description]

BALANCE SHEET:
  Net debt/EBITDA: [X]x — [SAFE / MODERATE / LEVERAGED]
  Interest coverage: [X]x | Current ratio: [X]x
  Debt maturity wall: [describe key maturities]

FORENSIC FLAGS:
  Auditor changed: [YES/NO] | Opinion: [Unqualified/Qualified]
  RPTs: [none/describe] | Off-BS items: [none/describe]
  [N]/25 forensic screens triggered — [LOW/MEDIUM/HIGH ALERT]
  Red Flag Score: [0-100]

MANAGEMENT & GOVERNANCE:
  Insider ownership: [X]% | Insider buying/selling trend: [describe]
  Capital allocation: [buybacks/dividends/reinvestment split]
  ROE (DuPont): [X]% — driven by [margin/leverage/turnover]

FUNDAMENTAL VERDICT:
  Quality: [HIGH / MEDIUM / LOW]
  Valuation: [UNDERVALUED / FAIRLY VALUED / OVERVALUED]
  Key risk: [single biggest fundamental concern]
```

---

## PHASE 3 — QUANTITATIVE ANALYSIS (Quant + Herald)

**Quant** provides risk-adjusted math:

```
📈 QUANT — Quantitative Risk Analysis: [TICKER]

RETURN DISTRIBUTION:
  Expected return (1yr): [X]% ± [CI]
  Historical vol (1yr): [X]% annualized
  Sharpe ratio (1yr): [X] — [POOR (<0) / OK (0-0.5) / GOOD (0.5-1) / EXCELLENT (>1)]
  Sortino ratio: [X] — [downside vol adjusted]

TAIL RISK:
  VaR (95%, 1d): [X]% — normal distribution assumption
  CVaR (95%, 1d): [X]% — expected loss beyond VaR
  EVT estimate (99%, 1d): [X]% — fat-tail model (more realistic)
  Normal underestimates tail risk by: ~[N]x for this asset

FACTOR DECOMPOSITION (Fama-French 5):
  Market (beta): [value] | Size (SMB): [X] | Value (HML): [X]
  Profitability (RMW): [X] | Investment (CMA): [X]
  Idiosyncratic (alpha): [X]% — [statistically significant? p=[value]]

SCENARIO ANALYSIS:
  Bull case ([prob]%): [trigger] → [price target] (+[X]%)
  Base case ([prob]%): [trigger] → [price target] (+/-[X]%)
  Bear case ([prob]%): [trigger] → [price target] (-[X]%)
  Tail risk ([prob]%): [trigger] → [price target] (-[X]%)
  Expected value (probability-weighted): [price]

POSITION SIZING (Kelly Criterion):
  Estimated win probability: [X]%
  Expected gain / loss ratio: [X]:[Y]
  Kelly fraction: f*=[X]% — recommended fractional Kelly: [X/4]%
  Ruin probability (1yr at fractional Kelly): [X]%

OPTIONS-IMPLIED VIEW (if available):
  Market-implied 1-month move: ±[X]% (from ATM straddle)
  Skew: [positive/negative] — [market pricing more [upside/downside] risk]
  Term structure: [contango/backwardation] — [interpretation]
```

**Herald** provides signal intelligence:

```
📡 HERALD — Market Intelligence: [TICKER]

SMART MONEY SIGNALS:
  Insider activity (90d): [describe cluster buys/sells or "no unusual activity"]
  Institutional flow (13F delta): [adds/trims by notable funds — top 3]
  Short interest trend: [X]% float — [rising/falling — covering/building]

CREDIT MARKET:
  Bond/CDS spread: [X]bps — [widening/tightening] — [credit vs equity divergence?]
  Credit rating: [rating / watch status]

EARNINGS CALL SIGNALS (if transcript provided):
  Shannon entropy delta: [interpretation]
  Hedging language trend: [increasing/decreasing]
  Dodged questions: [describe or "none identified"]
  Tone shift vs prior call: [positive/negative/neutral]

ANALYST CONSENSUS:
  Ratings: [X] Buy / [Y] Hold / [Z] Sell | Mean target: [price]
  Consensus bias: [generally too [bullish/bearish] — street tends to lag by ~3 months]
  Target vs current: [+/-X]%

BAYESIAN COMPOSITE SIGNAL:
  P(outperform market 1yr): [X]%
  P(underperform market 1yr): [Y]%
  P(±10% from here within 3m): [Z]%
  Signal classification: [list each signal as SIGNAL / CORRELATION-ONLY]
```

---

## PHASE 4 — RESEARCH ANALYSIS (Sage + Maven)

**Sage** provides structural and industry context:

```
🔬 SAGE — Structural Research: [TICKER]

INDUSTRY STRUCTURE:
  Phase: [fragmented/consolidating/oligopoly/disrupting]
  Market share: [X]% — [gaining/losing/stable]
  Moat velocity: [widening/narrowing] — [evidence]
  Profit pool migration: [where is margin moving in this industry?]

COMPETITIVE POSITION:
  S-curve position: [early adoption/growth/maturity/decline]
  Reinvestment runway: [~N years] at current ROIC ([X]%)
  Technology risk: [what platform shift could disrupt this position?]
  Moat type: [network effects / switching costs / cost advantages / intangibles]

STRUCTURAL RISKS:
  Regulatory pipeline: [key risks]
  Technology disruption: [probability × timeline]
  Macro exposure: [rate sensitivity / FX exposure / commodity inputs]
  Second-order effects: [what 2-3 things does the market not yet price?]

INDUSTRY COMPS:
  Peer median PE: [X]x | Peer median EV/EBITDA: [X]x
  Relative growth: [Company] vs peers — [faster/slower/inline]
  Profitability vs peers: margins [above/below/inline] median

LONG-TERM THESIS:
  Bull case (5yr): [describe structural tailwind]
  Bear case (5yr): [describe structural headwind]
  Inflection point: [what would change the long-term outlook?]
```

**Maven** provides the strategic synthesis:

```
📐 MAVEN — Strategic Synthesis: [TICKER]

STRATEGY FORENSICS:
  Capital allocation (stated vs actual): [match/mismatch + evidence]
  Management incentive alignment: [comp structure → does mgmt win when shareholders win?]
  Organizational debt signals: [describe or "none identified"]

PRE-MORTEM (MANDATORY):
  "It's 18 months from now. This position lost 40%+. Why?"
  Failure Path 1: [specific, concrete] — P=[X]%
  Failure Path 2: [specific, concrete] — P=[Y]%
  Failure Path 3: [specific, concrete] — P=[Z]%
  ...
  Failure Path 7+: [specific, concrete] — P=[N]%
  Blind spot: "Which of these would NOT be visible before it happened?"

STRATEGIC INFLECTION:
  Is a 10x change in competitive dynamics underway? [YES/NO/UNCERTAIN]
  Evidence: [describe]

DECISION FRAMEWORK:
  Expected utility (Option A: buy / B: hold / C: sell):
    EU(A) = [X] | EU(B) = [Y] | EU(C) = [Z]
  EVPI: "The value of knowing [key uncertainty] before deciding ≈ [amount]"
```

---

## PHASE 5 — ADVERSARIAL CHALLENGE (Prism-Adversarial)

Prism speaks LAST. Applies 12-lens analysis and challenges every bullish/bearish claim.

```
⚡ PRISM — Adversarial Analysis: [TICKER]

12-LENS SUMMARY:
  | # | Lens | Finding | Confidence | Contrarian Score |
  (complete table across all 12 lenses)

BEHAVIORAL BIAS AUDIT:
  Which biases may be affecting this analysis? [list]
  Narrative risk: Is there a crowded consensus story? [YES/NO — describe]

REFERENCE CLASS:
  "Companies with similar profile at similar valuation have historically:
   [X]% produced >15% returns in 12m | [Y]% produced negative returns"

RED TEAM — BULL CASE CHALLENGES:
  "Here's why this analysis might be wrong..."
  Challenge 1: [strongest counter-argument] — evidence: [data]
  Challenge 2: [second counter-argument] — evidence: [data]
  Challenge 3: [third counter-argument] — evidence: [data]
  Kill shot: "If [X] is true, the entire bullish thesis collapses"

RED TEAM — BEAR CASE CHALLENGES (if consensus is bearish):
  [mirror structure]

FALSIFIABILITY:
  Bull thesis fails if: [specific, observable, within [timeframe]]
  Bear thesis fails if: [specific, observable, within [timeframe]]

DUTCH BOOK CHECK:
  Probability sum across all scenarios: [X]% — [coherent / exceeds 100% — flag]
  Largest inconsistency: [describe]

ANTI-FRAGILITY:
  Classification: [FRAGILE / ROBUST / ANTI-FRAGILE]
  Evidence: [does this company benefit from volatility or break under it?]
```

---

## PHASE 6 — SYNTHESIS & RECOMMENDATION (Maven + Quant + All)

```
━━━ SYNTHESIS: [TICKER] ━━━

STREAM VERDICTS:
  📉 Technical:    [BULLISH/BEARISH/NEUTRAL] — [key level / pattern / conviction]
  📊 Fundamental:  [UNDERVALUED/FAIRLY VALUED/OVERVALUED] — [key metric]
  📈 Quantitative: [FAVORABLE/NEUTRAL/UNFAVORABLE] — [Sharpe / tail risk]
  🔬 Research:     [MOAT WIDENING/STABLE/NARROWING] — [key structural factor]

ALIGNMENT CHECK:
  All 4 streams agree: [YES — high conviction / NO — describe disagreement]
  Biggest disagreement: [Technical bullish but Fundamental expensive — example]

THREE OPTIONS (never one):

Option A — [e.g., BUY at current levels]
  Conviction: [X]% | Time horizon: [months]
  Entry: [price/zone] | Target: [price] (+[X]%) | Stop: [price] (-[Y]%)
  Kelly: f*=[X]%, fractional Kelly=[Y]%
  CVaR (95%): [X]% | P(ruin|1yr): [X]%

Option B — [e.g., WAIT for pullback to [level]]
  Conviction: [X]% | Watch level: [price] | Trigger: [event or level]
  If trigger hits: entry [price], target [price], stop [price]

Option C — [e.g., AVOID / SHORT]
  Conviction: [X]% | Rationale: [key reason]
  If shorting: entry [price], cover [price], stop [price]

KILL CRITERIA: "Exit immediately if: [observable triggers]"
REVIEW TRIGGERS: "Revisit analysis if: [specific events — earnings, guidance, sector event]"
WHAT WE DON'T KNOW: [explicit data gaps and blind spots]

VERIFICATION SUMMARY:
  VERIFIED-4: [N] | VERIFIED-3: [N] | VERIFIED-2: [N] | VERIFIED-1: [N] | UNVERIFIED: [N]
  [UNVERIFIED claims do NOT appear in recommendations above]
```

---

## PHASE 7 — AUTOMATED SLIDE-DECK DASHBOARD & SOCIAL SHARE BUILDER

To support interactive visual reviews, the agent must programmatically compile and write a structured presentation database and an interactive HTML/CSS slide viewer under `squad-method/output/dashboard/[TICKER]/`.

### 1. Compile Structured Database (`forensic_report.json`)
Write a valid, minified JSON object with the following schema:
```json
{
  "subject": "[TICKER]",
  "forensic_case_study": {
    "headline": "[High-impact investigative title]",
    "editorial_verdict": "[Final quality verdict / overall investment rating]",
    "side_by_side_comparison": {
      "column_headers": {
        "standard_label": "Standard Reported Metrics",
        "target_label": "Forensic Audited Metrics"
      },
      "rows": [
        {
          "metric": "[e.g., EBITDA Margin, Sloan Accruals, Valuation PEG]",
          "standard_value": "[Value reported by management]",
          "target_value": "[Audited forensic value]",
          "mismatch_percentage": "[Variance delta percentage]"
        }
      ]
    },
    "conclusion_question": "[Thought-provoking forward-looking macro query]"
  },
  "forensic_trust_gap": {
    "standard_sources_coverage": "[Sell-side consensus and mainstream consensus narrative]",
    "our_forensic_exposure": "[Hidden risks, controls failures, or structural pivots uncovered]",
    "unique_trust_rationale": "[Why this specific analysis provides an informational edge]"
  },
  "anomalies": [
    {
      "source_claim": "[Claim from financial report, filing, or PR]",
      "counter_claim": "[Reality found via cross-referencing and auditing]",
      "verdict": "[Label: e.g. Accrual Divergence, Underreported Cost, Policy Bottleneck]",
      "severity": "[High / Medium / Low]",
      "type": "[Fundamental / Technical / Regulatory / Operational]",
      "citations": [
        { "name": "[Source Name]", "url": "[Source URL]" }
      ]
    }
  ],
  "tracks": {
    "corporate": "[Corporate governance, capital allocation, and internal control findings]",
    "policy": "[Macro regulations, taxation rails, or policy constraints]",
    "sovereign": "[Global macro risks, trade dependencies, and currency exposures]"
  },
  "socioeconomic": [
    {
      "area": "[Segment or demographic affected]",
      "impact": "[Structural and operational impact description]",
      "outcome": "[Trend vector or strategic direction]"
    }
  ],
  "india_growth_story": {
    "title": "Slide 8: India Digital Public Infrastructure & Growth Outlook",
    "narrative": "[Detailed analysis of UPI, DPDP Act, ONDC, NITI policy rails, and their impact on target's model]",
    "outlook": "[Favorable / Unfavorable / Neutral]"
  },
  "strategic_benchmarks": [
    {
      "model_project": "[Peer or precedent entity/project]",
      "what_they_did_well": "[Best practices implemented]",
      "our_target_shortfall": "[Gap/shortfall observed in our target entity]",
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

### 2. Export Javascript Config (`forensic_data.js`)
Write a file `forensic_data.js` containing:
```javascript
window.forensicData = [Insert the completed forensic_report.json object here];
```

### 3. Compile Premium Interactive HTML Slides (`index.html`)
Write a single-page HTML application (`index.html`) with styling (`style.css`) incorporating modern dark glassmorphism (vibrant gradient backdrops, frosted-glass frames, and premium typography). 
* The interface must parse `window.forensicData` and display a premium 8-slide presentation deck.
* Include keyboard navigation (arrow keys), visual dot indicators, and an interactive side-by-side mismatch matrix table.
* **Slide 1:** Title, Ticker, Editorial Verdict, and live token-to-Rupee HUD cost tracker footer.
* **Slide 2:** Forensic Trust Gap (Mainstream Narrative vs. Exposure).
* **Slide 3:** Variance Matrix (Side-by-side comparison table).
* **Slide 4:** Deconstructed Anomalies (tabbed or paginated layout).
* **Slide 5:** Multi-Track Auditing (Corporate, Policy, Sovereign views).
* **Slide 6:** Strategic Benchmarks & Precedents.
* **Slide 7:** Copyable Social Post Builder UI.
* **Slide 8:** India Growth Story Panel (DPI, DPDP, ONDC audit).

---

## PHASE 8 — ONGOING MONITORING (Optional)

If user wants to track the position:

```
MONITORING CHECKLIST: [TICKER]

Weekly:
  [ ] Price vs key S/R levels (from Phase 1)
  [ ] RSI — still in expected range?
  [ ] Short interest change
  [ ] Options P/C ratio shift

Monthly:
  [ ] Earnings estimate revisions
  [ ] Insider activity (Form 4 / NSE insider feed)
  [ ] Institutional 13F changes (quarterly lag)
  [ ] Credit spread movement

On events:
  [ ] Earnings call — run Shannon entropy check
  [ ] Guidance change — re-run DCF
  [ ] Sector news — re-assess moat velocity
  [ ] Macro data — re-run scenario matrix
```

---

## Behavioral Rules

- ALL 7 agents stay loaded throughout the session
- Charts ALWAYS speaks first in Phase 1 (price is the most objective, current signal)
- Prism ALWAYS speaks last (adversarial challenge after all other analysis is done)
- No single-point estimates — every number has a confidence interval or range
- Every quantitative claim cites formula + inputs + data source
- `[UNVERIFIED]` claims never appear in recommendations
- `[LLM-TRAINING]` tag required when using training data without user-provided current data
- If a data source is missing, say so explicitly — never estimate what can't be computed
- Disclaimer appears on ALL output (from `financial-analysis-protocol.md`)
- The 4-gate verification protocol applies to every major claim
- Phase 0 is NOT optional — ticker + data source must be established before analysis begins
