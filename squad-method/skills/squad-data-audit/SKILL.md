---
name: squad-data-audit
description: >
  Audit ML pipelines, data science code, analytics models, and data quality
  practices. Identifies data leakage, reproducibility issues, model governance
  gaps, and analytics anti-patterns.
  Use when user says "audit data pipeline", "review ML code",
  "check data quality", or runs /data-audit.
---

# SQUAD-Public Data & ML Audit — Neuron + Prism

Comprehensive audit of ML pipelines, data science code, analytics engineering,
and data quality practices.

**Bootstrap (read now):**
- `squad-method/config.yaml` — team config
- `squad-method/agents/_base-agent.md` — base protocols
- `squad-method/agents/neuron.md` — ML/Data Science lens
- `squad-method/agents/prism.md` — Data Analyst lens
- `squad-method/fragments/stack/data-science.md` — ML/analytics patterns
- `squad-method/fragments/rubric/data-science.md` — ML/analytics review checks

Track progress with TodoWrite.

---

## Phase 1 — DISCOVERY (Neuron + Prism)

### 1a. Detect Data/ML Stack

Scan the codebase for data and ML indicators:

```
Search for: pandas, polars, numpy, scipy, sklearn, scikit-learn, pytorch,
  torch, tensorflow, keras, xgboost, lightgbm, catboost, transformers,
  mlflow, wandb, neptune, dvc, feast, great_expectations, pandera,
  airflow, prefect, dagster, kubeflow, metaflow,
  dbt, sqlmesh, dataform, pyspark, delta, iceberg,
  jupyter, notebook, .ipynb,
  matplotlib, seaborn, plotly, altair, streamlit, gradio
```

Catalog findings:
- **ML frameworks** — scikit-learn, PyTorch, TensorFlow, XGBoost, Hugging Face
- **Data processing** — pandas, polars, Spark, Dask
- **Experiment tracking** — MLflow, W&B, Neptune, DVC
- **Orchestration** — Airflow, Prefect, Dagster, Kubeflow
- **Data modeling** — dbt, sqlmesh, raw SQL
- **Visualization** — matplotlib, plotly, Streamlit, Grafana dashboards
- **Data validation** — Great Expectations, Pandera, custom checks

### 1b. Map Data Pipelines

For each data/ML pipeline:
1. Trace data flow: source → ingestion → transformation → model/dashboard
2. Identify: data sources, transformations, feature engineering, model training
3. Map notebook vs production code boundaries
4. Identify experiment tracking (or lack thereof)

**USER GATE:** "Here's the data/ML inventory. Review it. [Continue/Adjust scope]"

---

## Phase 2 — ML ANALYSIS (Neuron)

### 2a. Data Leakage Audit

Check for the #1 ML silent killer:
- **Temporal leakage** — future data in training features
- **Target leakage** — features derived from the target variable
- **Group leakage** — same user/entity in train and test splits
- **Preprocessing leakage** — fit scaler on full data before split

### 2b. Reproducibility Check

- Are random seeds set? (Python, NumPy, PyTorch/TF, CUDA)
- Are experiments tracked with parameters, metrics, artifacts?
- Is training data versioned? (DVC, Delta Lake, git-lfs)
- Can training be re-run from a commit hash and produce the same model?

### 2c. ML Rubric Check

Run every check from `data-science.md` rubric (ML-1 through ML-12).

---

## Phase 3 — ANALYTICS ANALYSIS (Prism)

### 3a. Data Quality Audit

- Are there schema tests on source data?
- Are freshness/volume checks in place?
- Is PII handled (masked, hashed, excluded)?
- Are metric definitions consistent across dashboards?

### 3b. SQL & dbt Review

- Query performance: partition filters, join strategies, CTEs
- Model structure: staging → intermediate → mart separation
- Test coverage: not_null, unique, relationships, accepted_values
- Documentation: schema.yml descriptions for all models

### 3c. Analytics Rubric Check

Run every check from `data-science.md` rubric (DA-1 through DA-8).

---

## Phase 4 — REPORT (Neuron + Prism)

```markdown
# Data & ML Audit Report

## Executive Summary
- Total ML pipelines: [N]
- Total analytics models: [N]
- Critical findings: [N] (data leakage, PII exposure)
- Reproducibility score: [reproducible/partially/not reproducible]

## ML Pipeline Inventory
[Table: Pipeline | Framework | Tracking | Data Versioning | Monitoring]

## Analytics Model Inventory
[Table: Model | Layer | Tests | Freshness | Documentation]

## Findings
### Critical
[Data leakage, PII in analytics, train-serve skew — with file:line]

### Major
[Missing tracking, no validation, metric inconsistency]

## Recommendations
[Prioritized fixes with effort/impact]
```

**USER GATE:** "Report complete. [Export/Discuss findings/Create stories]"

---

## Behavioral Rules

1. **NEVER fabricate findings.** Every claim cites a file path and line.
2. **Data leakage must show the exact leaking feature/split.**
3. **Query performance claims must reference the query plan or table size.**
4. **Metric inconsistencies must show the conflicting definitions side by side.**
5. **Track the operation** — log to `squad-method/output/tracking.jsonl`.
