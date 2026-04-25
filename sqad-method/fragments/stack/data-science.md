---
fragment: stack/data-science
description: ML, data science, and analytics stack patterns
load_when: "stack.frameworks includes pandas OR sklearn OR pytorch OR tensorflow OR mlflow OR dbt OR spark"
token_estimate: 900
---

# Data Science & Analytics Stack Context

## ML Framework Patterns

| Framework | Pattern | Avoid |
|---|---|---|
| **scikit-learn** | Pipelines, ColumnTransformer, cross_validate | Fit on full data then split (leakage) |
| **PyTorch** | DataLoader, Lightning modules, checkpointing | Manual training loops without gradient clipping |
| **TensorFlow/Keras** | tf.data pipelines, callbacks, SavedModel | `model.predict()` in a for loop |
| **Hugging Face** | AutoModel, Trainer, tokenizer alignment | Loading full model for inference (use quantized) |
| **XGBoost/LightGBM** | Early stopping, feature importance, SHAP | Training without validation set |

## Data Stack Patterns

| Tool | Pattern | Avoid |
|---|---|---|
| **pandas** | Vectorized ops, `pipe()` chains, `assign()` | Iterating with `iterrows()` |
| **polars** | Lazy frames, expression API, streaming | Collecting too early, breaking lazy chain |
| **dbt** | Staging → intermediate → mart, ref(), tests | Hardcoded table names, missing tests |
| **Spark** | Partitioned reads, broadcast joins, caching | `collect()` on large DataFrames |
| **Airflow/Prefect** | Idempotent tasks, XComs, retry policies | Fat tasks, missing SLAs |

## Project Structures

### ML Project
```
ml-project/
├── data/                    # Data versioned with DVC
│   ├── raw/
│   └── processed/
├── notebooks/               # Exploration only — not production
├── src/
│   ├── data/                # Data loading and preprocessing
│   ├── features/            # Feature engineering
│   ├── models/              # Model training and evaluation
│   └── serving/             # Inference API
├── configs/                 # Hyperparameters, experiment configs
├── tests/                   # Unit + integration tests
├── MLproject                # MLflow project file
├── dvc.yaml                 # Data pipeline
└── pyproject.toml
```

### Analytics/dbt Project
```
analytics/
├── models/
│   ├── staging/             # 1:1 with sources
│   ├── intermediate/        # Business logic transforms
│   └── marts/               # Consumer-ready models
├── seeds/                   # Static lookup tables
├── snapshots/               # SCD Type 2 history
├── tests/                   # Data quality tests
├── macros/                  # Reusable SQL macros
├── profiles.yml             # Connection config
└── dbt_project.yml
```

## Key Libraries by Domain

| Domain | Libraries |
|---|---|
| **ML Core** | scikit-learn, xgboost, lightgbm, catboost |
| **Deep Learning** | pytorch, tensorflow, keras, jax, flax |
| **NLP** | transformers, spacy, nltk, sentence-transformers |
| **Computer Vision** | torchvision, opencv, albumentations, ultralytics |
| **Experiment Tracking** | mlflow, wandb, neptune, comet, dvc |
| **Data Validation** | great_expectations, pandera, pydantic, cerberus |
| **Feature Store** | feast, tecton, hopsworks |
| **Orchestration** | airflow, prefect, dagster, metaflow, kubeflow |
| **Data Processing** | pandas, polars, dask, modin, vaex, pyspark |
| **Visualization** | matplotlib, seaborn, plotly, altair, bokeh |
| **BI/Dashboards** | tableau, looker, metabase, superset, powerbi |
| **Data Modeling** | dbt, sqlmesh, dataform |

## Anti-Patterns

- **Train-serve skew** — different preprocessing in training vs inference
- **Notebook-as-pipeline** — production code locked in .ipynb cells
- **No experiment tracking** — "the model from last Tuesday" is not versioning
- **Accuracy-only evaluation** — ignoring precision/recall/F1 for imbalanced data
- **Hardcoded paths** — `/home/user/data/train.csv` in committed code
- **No data validation** — assuming schema and distributions are stable
- **Overfitting to offline metrics** — no online A/B test before rollout
