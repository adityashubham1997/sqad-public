---
name: squad-refresh
description: >
  Scan workspace, rebuild knowledge graphs, regenerate CONTEXT.md and
  DEEP-CONTEXT.md. The fast code-scan operation — no API calls. Use when
  user says "refresh", "scan workspace", "rebuild context", "update context",
  or runs /refresh.
---

# SQUAD-Public Refresh — Workspace Scan & Context Generation

Scans all repos, detects patterns, builds knowledge graphs, and generates
context markdown files for agents.

Read `squad-method/config.yaml` for workspace configuration.

## Step 1 — Find All Git Boundaries

`.git` is the signal. Every directory with `.git` is a context boundary.

```bash
GIT_ROOTS=""
[ -d ".git" ] && GIT_ROOTS=". "
for dir in */; do
  [ -d "$dir/.git" ] && GIT_ROOTS="$GIT_ROOTS$dir "
done
echo "Git boundaries found: $GIT_ROOTS"
```

Also find non-git directories at workspace root:
```bash
for dir in */; do
  [ ! -d "$dir/.git" ] && [ "$dir" != "node_modules/" ] && echo "non-git: $dir"
done
```

## Step 2 — Per-Repo Analysis

For EACH git boundary found:

### 2a. Identity
```bash
cd [repo]
REMOTE=$(git remote get-url origin 2>/dev/null)
BRANCH=$(git branch --show-current)
LAST_COMMIT=$(git log --oneline -1)
CONTRIBUTORS=$(git log --format="%aN" | sort -u | head -10)
```

### 2b. Type Detection
Read package.json, pom.xml, go.mod, Cargo.toml, pyproject.toml etc. to
determine project type, language, framework.

### 2c. Key Artifacts
```bash
# Source structure
ls -d src/ lib/ app/ pages/ components/ 2>/dev/null

# Config files
ls *.json *.yaml *.yml *.toml 2>/dev/null

# Test files
find . -name "*.test.*" -o -name "*.spec.*" -o -name "*_test.*" 2>/dev/null | wc -l
```

### 2d. Architecture Analysis
Read key source files to understand:
- Entry points
- Module structure
- Data models
- API surface
- Key abstractions

### 2e. Build/Test Commands
Detect from package.json scripts, Makefile, build.gradle, etc.

## Step 3 — Cross-Repo Relationships

Look for relationships between repos:
- Shared dependencies (same package in multiple repos)
- Import references across repos
- Shared test infrastructure
- Common configuration patterns

## Step 4 — Knowledge Graph (if enabled)

Check `squad-method/config.yaml → knowledge_graph.enabled`:

If enabled, for each repo:
```bash
# Run knowledge graph generation (non-blocking)
node squad-method/tools/knowledge-graph/build.js [repo-path] &
```

The KG builds a dependency graph (`graph.json`) showing:
- File → file edges (imports, requires)
- Test → source edges (test coverage)
- God nodes (high-degree files)
- Communities (clustered modules)

**Do NOT block refresh on KG generation.** It runs in the background.
Note: "Knowledge graph building for [N] repos. Results available shortly."

## Step 5 — Generate CONTEXT.md

Build the root CONTEXT.md with:
- Identity section (team, user, project)
- Repository map (all repos with types and key files)
- Build commands
- Cross-repo relationships
- Knowledge graph summary (if available)
- Rules for agents

Write to: `CONTEXT.md` (canonical) + IDE copies (CLAUDE.md, GEMINI.md, etc.)

**Preserve `<!-- SQUAD:KEEP -->` blocks** — user-written content must survive refresh.

### CONTEXT.md line limit: 200 lines (root), 100 lines (per-repo)

## Step 6 — Generate Per-Repo DEEP-CONTEXT.md

For EACH repo, generate `[repo]/DEEP-CONTEXT.md`:
- Capabilities (what this repo does)
- Data model (tables, schemas, types)
- Implementation flows (key workflows)
- Dependencies (what this repo depends on)
- Test coverage summary
- Key files and entry points

**If DEEP-CONTEXT.md already exists, UPDATE — don't replace.**
Merge new findings with existing content. Preserve `<!-- SQUAD:KEEP -->` blocks.

## Step 7 — Generate complete-flow.md (if multi-repo)

If workspace has 2+ repos, generate `complete-flow.md` at workspace root:
- Cross-repo data flows
- Integration points
- Shared patterns
- Deployment dependencies

## Step 8 — Report

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SQUAD-Public Refresh Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Repos scanned: [N]
Context files: [list of generated/updated files]
Knowledge graph: [building/complete/disabled]

Changes since last refresh:
  [new repos, new files, updated sections]

Suggestion: Run /refresh-git to enrich context with PR learnings.
```

## Step 9 — Track Operation

```bash
echo '{"ts":"[ISO_DATE]","command":"refresh","repo":"workspace","outcome":"completed","repos_scanned":[N],"context_files_generated":[N]}' >> squad-method/output/tracking.jsonl
```

## Behavioral Rules

- **Fast operation.** No API calls (no tracker, no GitHub API). Code-only scan.
- **Preserve `<!-- SQUAD:KEEP -->` blocks.** User content survives refresh.
- **Line limits are real.** Root <200, per-repo <100. Prune least useful info first.
- **Don't block on KG.** Knowledge graph builds in background.
- **Wherever `.git` exists, context must exist.** Create missing files.
- **Never fabricate code analysis.** If unsure about a repo's purpose, note uncertainty.
