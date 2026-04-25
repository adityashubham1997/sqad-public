# Agent Loading Protocol

## Principles

1. **Lazy loading** — agents load only when a skill needs them
2. **Base always loaded** — `_base-agent.md` is read by every skill
3. **Phase-gated** — complex skills load agents per phase to minimize context
4. **Fragment-conditional** — fragments load based on detected config

## Loading Order

```
1. _base-agent.md          (always — base protocols)
2. config.yaml             (always — team context)
3. Primary agent(s)        (per skill — the driving agent)
4. Phase-specific agents   (when that phase begins)
5. Fragments               (conditional on config)
```

## Skill Declaration Pattern

Skills declare their agent dependencies in the skill header:

```markdown
**Bootstrap (read now):**
- `sqad-method/agents/_base-agent.md`
- `sqad-method/config.yaml`
- `sqad-method/agents/forge.md`         ← primary agent

**Phase-gated loading:**
- Phase 2: `sqad-method/agents/raven.md`
- Phase 3: `sqad-method/agents/cipher.md`, `sqad-method/fragments/tdd-workflow.md`
```

## Fragment Loading Rules

| Fragment Type | Load When |
|---|---|
| `rubric/base.md` | Always (any review skill) |
| `rubric/[lang].md` | `config.stack.languages` includes that language |
| `rubric/security.md` | Always (any review skill) |
| `stack/[lang].md` | `config.stack.languages` includes that language |
| `cloud/[provider].md` | `config.cloud.providers` includes that provider |
| `cloud/monitoring.md` | Any cloud provider detected |
| `tracker/[type].md` | `config.tracker.type` matches |
| `kg-query-protocol.md` | `graph.json` exists for repo being analyzed |

## Agent Roster

| Agent | File | Typical Skills |
|---|---|---|
| Nova | `agents/nova.md` | dev-task (Phase 1), review-story, dev-analyst, qa-task |
| Atlas | `agents/atlas.md` | dev-task (Phase 1), review-pr, dev-analyst, create-prd |
| Forge | `agents/forge.md` | dev-task (Phase 2-3,6), review-code, review-pr, test-story |
| Cipher | `agents/cipher.md` | dev-task (Phase 4), review-code, review-pr, qa-task, test-* |
| Sentinel | `agents/sentinel.md` | dev-task (Phase 5), qa-task |
| Tempo | `agents/tempo.md` | setup, current-sprint, standup, retro |
| Raven | `agents/raven.md` | dev-task (Phase 5), review-code, review-pr, brainstorm |
| Catalyst | `agents/catalyst.md` | review-pr |
| Oracle | `agents/oracle.md` | brainstorm, dev-analyst, product-researcher, health |
| Scribe | `agents/scribe.md` | retro |
| Compass | `agents/compass.md` | dev-task (Phase 2), create-prd, create-story, review-story |
| Aegis | `agents/aegis.md` | brainstorm, review-pr (security lens) |
| Stratos | `agents/stratos.md` | brainstorm (cloud lens) |
| Phoenix | `agents/phoenix.md` | brainstorm (devops lens) |
| Kernel | `agents/kernel.md` | os-audit, dev-task (systems review), review-pr (systems lens) |
| Neuron | `agents/neuron.md` | data-audit (ML lens), dev-task (ML review), review-pr (data science lens) |
| Prism | `agents/prism.md` | data-audit (analytics lens), dev-task (data review), review-pr (SQL/data lens) |
| Dynamo | `agents/dynamo.md` | db-audit (schema design), dev-task (DB review), review-pr (schema lens) |
| Index | `agents/index.md` | db-audit (query optimization), dev-task (query review), review-pr (performance lens) |
| Pixel | `agents/pixel.md` | game-review (code), dev-task (game dev), review-pr (game engine lens) |
| Quest | `agents/quest.md` | game-review (design), brainstorm (game mechanics) |
| Lore | `agents/lore.md` | game-review (narrative), brainstorm (storytelling lens) |
| Flux | `agents/flux.md` | brainstorm (all), dev-task (creative alternatives), review-pr (simplification lens) |
| Titan | `agents/titan.md` | review-code (quality gate), review-pr (strict standards), dev-task (Phase 5) |

## Context Budget

Skills should be mindful of context window limits:
- Load only the agents needed for the current phase
- Load fragments conditionally — not everything for every skill
- Use `token_estimate` in fragment frontmatter to budget
- Total context target: <8000 tokens for agent + fragment loading
