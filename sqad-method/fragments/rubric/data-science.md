---
rubric: data-science
description: ML, data science, and analytics review checks
load_when: "stack.frameworks includes pandas OR sklearn OR pytorch OR tensorflow OR mlflow OR dbt"
---

# Data Science & Analytics Review Rubric

## ML Pipeline Checks

| ID | Check | Rule | Severity |
|---|---|---|---|
| ML-1 | **Data leakage** | Training data contains information from test/validation set (temporal, user, feature) | CRITICAL |
| ML-2 | **No experiment tracking** | Model training without logging parameters, metrics, and artifacts | MAJOR |
| ML-3 | **Non-reproducible training** | Random seeds not set for Python, NumPy, PyTorch/TF, or data shuffling | MAJOR |
| ML-4 | **No baseline model** | Complex model without comparison to simple baseline (logistic regression, mean predictor) | MAJOR |
| ML-5 | **Single metric evaluation** | Model evaluated on accuracy only — ignoring precision, recall, F1, AUC for imbalanced data | MAJOR |
| ML-6 | **Hardcoded paths** | Data paths hardcoded instead of parameterized via config or environment | MINOR |
| ML-7 | **No data validation** | Data ingested without schema, range, or distribution checks | MAJOR |
| ML-8 | **Train-serve skew** | Different preprocessing logic in training vs serving code | CRITICAL |
| ML-9 | **No model monitoring** | Production model without drift detection, performance tracking, or alerting | MAJOR |
| ML-10 | **Notebook in production** | Jupyter notebook used as production pipeline instead of proper Python modules | MAJOR |
| ML-11 | **No bias analysis** | Model deployed without fairness evaluation across protected attributes | MAJOR |
| ML-12 | **Unversioned data** | Dataset used for training without version tag, hash, or DVC tracking | MINOR |

## Analytics / dbt Checks

| ID | Check | Rule | Severity |
|---|---|---|---|
| DA-1 | **Full table scan** | Query without partition filter on large table — cost and latency impact | MAJOR |
| DA-2 | **Duplicate metric definitions** | Same business metric defined differently across models/dashboards | CRITICAL |
| DA-3 | **Missing data tests** | dbt model without `not_null`, `unique`, or `accepted_values` tests | MAJOR |
| DA-4 | **No freshness check** | Source data consumed without `loaded_at_field` freshness monitoring | MAJOR |
| DA-5 | **SELECT \*** | Query selects all columns instead of explicit column list | MINOR |
| DA-6 | **PII in analytics** | Raw PII (email, SSN, phone) exposed in analytics models without masking | CRITICAL |
| DA-7 | **Hardcoded table names** | Direct table references instead of `{{ ref('model') }}` or `{{ source() }}` | MAJOR |
| DA-8 | **No documentation** | Model or column without description in schema.yml | MINOR |
