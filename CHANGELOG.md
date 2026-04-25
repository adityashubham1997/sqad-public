# Changelog

All notable changes to SQAD-Public will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] — 2026-04-25

### Added
- **10 new agents** (Kernel, Neuron, Prism, Dynamo, Index, Pixel, Quest, Lore, Flux, Titan) — total now 26
- **4 new skills** (os-audit, data-audit, infra-audit, db-audit, game-review) — total now 29
- **CLI subcommands**: `sqad-public list` (show available skills) and `sqad-public doctor` (validate installation health)
- Game engine detection: Unity, Unreal Engine, Godot, MonoGame
- Database detection: Prisma, TypeORM, Sequelize, Knex, Drizzle, Mongoose, PostgreSQL, MySQL, Redis, Elasticsearch, SQLAlchemy
- ML/Data Science detection: scikit-learn, PyTorch, TensorFlow, XGBoost, MLflow, W&B, dbt, Airflow, Spark
- Infrastructure monitoring detection: Datadog, New Relic, Prometheus, Grafana, Sentry, OpenTelemetry
- Ansible configuration management detection
- Azure DevOps pipeline detection

### Changed
- Detection engine utilities extracted to shared `lib/detect/utils.js` (DRY refactor)
- `updateConfig()` is now idempotent — safe to run `init` multiple times
- Version is now read from `package.json` at runtime (single source of truth)
- All detection engines wrapped in error boundaries — graceful degradation on failure
- `host.json` Azure detection now validates content for Azure Functions markers (reduced false positives)
- Fixed C/C++ header-only detection logic — `.h` files alone no longer blindly tagged as C

### Fixed
- Stale agent/skill counts in README (16→26 agents, 27→29 skills in multiple locations)
- Version string no longer hardcoded in 3 separate files

## [1.2.0] — 2026-04-25

### Added
- **2 new agents**: Spark (AI Developer), Muse (AI Researcher) — total 16 built-in
- **2 new skills**: `/ai-audit` and `/ai-ideate` — total 27
- Android native detection (AndroidManifest.xml deep scan, Gradle Kotlin plugin detection)
- iOS native detection (.xcodeproj, Podfile, Package.swift, CocoaPods/SPM)
- Ionic/Capacitor detection (ionic.config.json, @ionic/\* deps, @capacitor/core)
- AI framework detection (LangChain, LlamaIndex, OpenAI, Anthropic, CrewAI, AutoGen)
- 4 stack fragments (android, ios, ionic, generative-ai)
- 4 rubric modules (android, ios, ionic, generative-ai)
- Interactive system overview HTML visualization (`sqad-system-overview.html`)
- 10 new tests for mobile/AI detection (73 total, all passing)

## [1.1.0] — 2026-04-26

### Added
- **25 skills** ported from SQAD to canonical SKILL.md format
- Knowledge Graph tools: `build.js` (graph builder), `summary.js` (report generator)
- 3 generator modules: config.js, context-files.js, ide-skills.js
- 8 IDE transformers: base.js + 7 IDE-specific (Windsurf, Claude, Cursor, Codex, Kiro, Gemini, Antigravity)
- Cloud fragments: GCP, Azure, monitoring
- Tracker adapters: Linear, Shortcut, Notion
- Rubric modules: Go, Rust, Ruby
- Stack fragment: Ruby
- Core fragments: review-rubric.md, agent-loading-protocol.md
- CONTRIBUTING.md with architecture and extension guides
- Deep recursive scanning in stack.js and cloud.js (up to 4 levels)
- C#/.NET deep scan detection (csproj, sln, fsproj)
- React, React Native, Angular, Vue, Svelte, Next.js, Express, NestJS stack fragments
- Spring, Django, Flask, FastAPI, Rails stack fragments
- Cloud-specific rubric modules (AWS, Azure, GCP, Kubernetes, Docker)
- 28 new unit tests, 35 total (63 total, all passing)
- E2E test suite: 91 assertions across 12 simulated projects

## [1.0.0] — 2026-04-25

### Added
- Initial release — 14 agents + base agent
- 7 core fragments, 8 rubric modules, 6 stack fragments, 5 cloud fragments, 3 tracker fragments
- 4 context files, 6 templates
- CLI with `init`, `update`, `uninstall` commands
- Stack detection engine (JavaScript, TypeScript, Python, Java, Go, Rust, Ruby, C/C++)
- Cloud detection engine (AWS, Terraform, Docker, Kubernetes, GitHub Actions, GitLab CI, Jenkins, CircleCI)
- Tracker detection engine (Jira, GitHub Issues)
- IDE detection engine (Claude Code, Windsurf, Cursor, Codex, Kiro, Gemini CLI, Antigravity)
- Zero dependencies — only Node.js built-in modules
- `README.md`, `LICENSE` (MIT), `.gitignore`
