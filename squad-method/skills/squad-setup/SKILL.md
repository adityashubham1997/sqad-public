---
name: squad-setup
description: >
  Initialize SQUAD-Public for a new team/workspace. Detects installation status,
  asks 3 required + 5 optional configuration questions, auto-detects workspace
  details, generates config.yaml, and runs /refresh. Captures company, project,
  industry, and team context so every agent has full grounding.
  Use when user says "setup", "initialize squad", "configure squad", or runs /setup.
---

# SQUAD-Public Setup

You are **Tempo** (Scrum Master). Read `squad-method/agents/tempo.md`.
Read `squad-method/agents/_base-agent.md` for base protocols.
Read `squad-method/config.yaml` for current state.

## Step 1 — Detect Installation Status

```bash
ls squad-method/config.yaml 2>/dev/null && echo "INSTALLED" || echo "NOT_INSTALLED"
```

### If NOT_INSTALLED:
"SQUAD-Public is not installed in this workspace. Run `npx squad-public init` first."
→ STOP.

### If INSTALLED:
Read `squad-method/config.yaml`. Check if `user.name` is empty — if so, this is
a fresh install needing configuration. If `user.name` is populated but other key
fields are empty (company.name, project.name), offer to fill them: "Some config
fields are empty. Want to run setup again to fill them? [Yes/Skip]"

## Step 2 — Required Questions (3 — MUST be answered)

Ask these ONE AT A TIME. Wait for each answer before asking the next.

**Q1:** "What is your name? (used for git attribution, standups, and agent communication)"
→ Store as `user.name`

**Q2:** "What is your role? (e.g., Senior Engineer, Tech Lead, Architect, PM, Intern)"
→ Store as `user.role`

**Q3:** "What is your team name? (used for tracker queries and agent context)"
→ Store as `team.name`

## Step 3 — Project & Company Context (5 — optional but recommended)

After the required questions, say:

"Great — core identity is set. Now a few optional questions to give agents better
context about your project. These help agents tailor their output to your domain.
You can skip any question by saying 'skip'."

Ask ONE AT A TIME. If the user says "skip" or "skip all", move to the next question
(or to Step 4 if "skip all").

**Q4:** "What is your company or organization name?"
→ Store as `company.name`. If skipped, leave empty.

**Q5:** "What industry or domain does your project belong to? (e.g., fintech, healthcare, e-commerce, saas, gaming, edtech, logistics, social, media, devtools)"
→ Store as `company.domain`. If skipped, leave empty.

**Q6:** "What is the project name? (e.g., 'Widget Platform', 'Payment Gateway')"
→ Store as `project.name`. If skipped, leave empty.

**Q7:** "Give a one-line description of the project:"
→ Store as `project.description`. If skipped, leave empty.

**Q8:** "What type of project is this? (web-app | api | library | cli | mobile | infra | monorepo | game | ai-ml | data-pipeline)"
→ Store as `project.type`. If skipped, leave empty.

**Q9:** "Do you use a sprint/project board? If yes, paste the board URL (e.g., Jira board, Linear project, GitHub project URL, or skip):"
→ If URL provided:
  - Auto-detect tracker type from URL pattern:
    - `*.atlassian.net*` → `jira`
    - `linear.app/*` → `linear`
    - `github.com/*/projects/*` → `github-issues`
    - `app.shortcut.com/*` → `shortcut`
    - `*.notion.so/*` → `notion`
  - Store URL as `tracker.board_url`
  - Store detected type as `tracker.type` (if not already set)
  - Extract project key from URL if possible (e.g., Jira project key from board path)
  - Store as `tracker.project_key`
  - Extract base API URL (e.g., `https://acme.atlassian.net`) → `tracker.api_url`
→ If skipped, leave empty.

### Optional follow-ups (ask ONLY if relevant based on answers above):

**Q9a** (if `tracker.type` was detected or provided):
"Does your IDE have an MCP (Model Context Protocol) server configured for [tracker_type]?
MCP lets agents query your board directly. Check your IDE's MCP settings. (yes | no | not sure)"
→ If **yes**: Store `tracker.mcp_available: true`
→ If **no** or **not sure**: Store `tracker.mcp_available: false` and display:

```
ℹ️  MCP Integration Available

SQUAD agents work best when they can query your tracker directly.
To enable this, configure an MCP server for {{tracker_type}} in your IDE:

  Claude Code:   Add to .claude/mcp.json
  Cursor:        Add to .cursor/mcp.json
  Windsurf:      Add to .windsurf/mcp.json
  Kiro:          Add to .kiro/mcp.json
  Codex:         Add to .codex/mcp.json
  Gemini:        Add to .gemini/mcp.json

Popular MCP servers:
  Jira:          @anthropic/mcp-jira or atlassian-mcp-server
  Linear:        @anthropic/mcp-linear or linear-mcp-server
  GitHub Issues: Built into Claude Code, or @modelcontextprotocol/server-github
  Shortcut:      shortcut-mcp-server
  Notion:        @modelcontextprotocol/server-notion

After configuring, re-run /setup and answer 'yes' to this question.
```

**Q9b** (if `company.domain` suggests regulated industry — healthcare, fintech, government):
"Any compliance requirements? (soc2, hipaa, pci-dss, gdpr, iso27001 — comma-separated, or skip)"
→ Store as `company.compliance[]`. If skipped, leave empty.

**Q9c** (if `project.type` is provided):
"What is the project maturity? (greenfield | brownfield | migration)"
→ Store as `project.maturity`. If skipped, leave empty.

## Step 4 — Auto-Detect Workspace

### 4a. Git Configuration
```bash
git remote get-url origin 2>/dev/null
git config user.name 2>/dev/null
git config user.email 2>/dev/null
```
Extract: GitHub host, org, default branch.

### 4b. Repository Scan
```bash
# Find all git repos in workspace
for dir in */; do [ -d "$dir/.git" ] && echo "$dir"; done
# Also check if root is a repo
[ -d ".git" ] && echo ". (root)"
```

### 4c. Stack Detection
The CLI already detected this during `init`. Read from config.yaml:
- Languages, frameworks, build tools, test frameworks
- Build/test/lint commands

### 4d. Cloud Detection
Read from config.yaml (auto-detected during `init`):
- Cloud providers, IaC tools, container orchestration, CI/CD, monitoring

### 4e. Tracker Detection
Read `tracker.type` from config.yaml. If empty:
- Check for `.jira`, `.linear` config files
- Check for `JIRA_*`, `LINEAR_*`, `SHORTCUT_*` environment variables
- Check for GitHub Issues (`.github/ISSUE_TEMPLATE/`)

Show auto-detected results:
```
🎯 Tempo — Workspace Scan Complete

Identity:
  User: [name] ([role])
  Team: [team_name]
  Company: [company_name] ([domain]) — or "not set" if skipped
  Project: [project_name] — [project_description] — or "not set" if skipped
  Type: [project_type] | Maturity: [maturity] — or "not set" if skipped
  Compliance: [compliance] — or "none"

Technical:
  GitHub: [host]/[org] (branch: [default_branch])
  Repos found: [N]
    [repo-1] — [type]
    [repo-2] — [type]
  Stack: [languages] + [frameworks]
  Build: [build_command] | Test: [test_command] | Lint: [lint_command]
  Tracker: [type] — or "none detected"
  Cloud: [providers] | IaC: [iac] | CI/CD: [ci_cd]
```

### Setup Quality Score
Calculate and display how many config sections are populated:
```
Config completeness: [N]/10 sections populated
  ✅ user    ✅ team    ✅ stack    ✅ cloud
  ✅ company ✅ project ❌ tracker  ✅ github
  ℹ️  Tip: populate missing sections with /setup or edit config.yaml directly
```

**USER GATE:** "Is this correct? [Continue/Adjust]"

- If **Adjust**: ask which section to change, update, and re-display.
- If **Continue**: proceed to Step 5.

## Step 5 — Update config.yaml

Write ALL collected values to `squad-method/config.yaml`:
- `user.name`, `user.role`
- `team.name`
- `company.name`, `company.domain`, `company.compliance`
- `project.name`, `project.description`, `project.type`, `project.maturity`
- `github.host`, `github.org`, `github.default_branch`
- Stack, cloud, tracker values (preserve auto-detected if already populated)

**IMPORTANT:** When writing to config.yaml:
- Preserve comments and structure — only replace value portions
- Use regex-safe replacements (escape user input for quotes)
- Do NOT overwrite auto-detected values (stack, cloud) unless user explicitly adjusted them

## Step 6 — Check for Knowledge Graph Tool

```bash
which node 2>/dev/null && echo "Node available" || echo "No Node"
```

If Node is available, inform user:
"Knowledge graph generation is available. /refresh will build dependency
graphs for each repo. This helps agents understand code relationships."

## Step 7 — Run /refresh

"Running /refresh to scan workspace and generate context files..."

Execute the /refresh workflow to:
- Generate CONTEXT.md and IDE copies
- Build per-repo DEEP-CONTEXT.md files
- Build knowledge graphs (if enabled)

## Step 8 — Offer /git-learn

"Want me to learn from your team's git history? This extracts patterns from
PR reviews and enriches CONTEXT.md. [Yes/Skip]"

If yes → execute /git-learn workflow.

## Step 9 — Complete

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎯 Tempo — SQUAD-Public Setup Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Config: squad-method/config.yaml ✓
  Company: [company_name] ([domain])
  Project: [project_name] — [type]
  User: [user_name] ([role]) on [team_name]

Context: CONTEXT.md ✓
Agents: 26 loaded
Skills: [N] commands available

Config completeness: [N]/10 ✓

Quick start:
  /dev-task [story]  — implement a story end-to-end
  /review-code       — quick pre-commit review
  /brainstorm [topic] — multi-agent brainstorm
  /standup           — auto-generate daily standup
  /assemble          — bring the whole squad

Type /help for full command list.
```

## Behavioral Rules

- Ask questions ONE AT A TIME — no walls of questions
- Auto-detect everything possible — minimize user input
- NEVER skip the /refresh step — context files are critical
- If git remote fails, ask for GitHub host/org manually
- If no repos found, note it — single-file workspace is valid
- Optional questions (Q4-Q8) can be skipped — never block setup for them
- If user says "skip all", jump to Step 4 immediately
- Show the config completeness score — motivate filling optional fields
- Re-running /setup on an already-configured workspace should show current
  values and offer to update — NEVER overwrite existing values with empty ones
