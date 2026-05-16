#!/bin/bash
# ide-parity-test.sh — CI-enforceable IDE parity check
# Version: 2.0.0
# Purpose: Verifies that all supported IDE skill directories remain in sync.
#          Run in CI or pre-commit to catch drift before it ships.
#
# Supports: Claude Code (.claude/skills/), Windsurf (.windsurf/skills/), Cursor (.cursor/rules/),
#           Codex (.codex/skills/), Kiro (.kiro/skills/), Gemini (.gemini/skills/),
#           Antigravity (.antigravity/skills/)
#
# Exit codes:
#   0 — all parity checks passed
#   1 — one or more parity violations found

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# IDE skill directories (all 7 supported IDEs)
CLAUDE_SKILLS="$PROJECT_ROOT/.claude/skills"
WINDSURF_SKILLS="$PROJECT_ROOT/.windsurf/skills"
CURSOR_SKILLS="$PROJECT_ROOT/.cursor/rules"
CODEX_SKILLS="$PROJECT_ROOT/.codex/skills"
KIRO_SKILLS="$PROJECT_ROOT/.kiro/skills"
GEMINI_SKILLS="$PROJECT_ROOT/.gemini/skills"
ANTIGRAVITY_SKILLS="$PROJECT_ROOT/.antigravity/skills"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

FAILURES=0
WARNINGS=0
CHECKS=0

pass() { CHECKS=$((CHECKS + 1)); echo -e "  ${GREEN}✅${NC} $1"; }
fail() { CHECKS=$((CHECKS + 1)); FAILURES=$((FAILURES + 1)); echo -e "  ${RED}❌${NC} $1"; }
warn() { WARNINGS=$((WARNINGS + 1)); echo -e "  ${YELLOW}⚠️${NC}  $1"; }

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SQUAD-Public IDE Parity Test Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# --- Test 1: Skill count across IDEs ---
echo "## 1. Skill Count Across IDEs"

CLAUDE_COUNT=0
WINDSURF_COUNT=0
CURSOR_COUNT=0
CODEX_COUNT=0
KIRO_COUNT=0
GEMINI_COUNT=0
ANTIGRAVITY_COUNT=0

[ -d "$CLAUDE_SKILLS" ] && CLAUDE_COUNT=$(ls -d "$CLAUDE_SKILLS"/squad-*/SKILL.md 2>/dev/null | wc -l | tr -d ' ')
[ -d "$WINDSURF_SKILLS" ] && WINDSURF_COUNT=$(ls -d "$WINDSURF_SKILLS"/squad-*/SKILL.md 2>/dev/null | wc -l | tr -d ' ')
[ -d "$CURSOR_SKILLS" ] && CURSOR_COUNT=$(ls "$CURSOR_SKILLS"/squad-*.mdc 2>/dev/null | wc -l | tr -d ' ')
[ -d "$CODEX_SKILLS" ] && CODEX_COUNT=$(ls -d "$CODEX_SKILLS"/squad-*/SKILL.md 2>/dev/null | wc -l | tr -d ' ')
[ -d "$KIRO_SKILLS" ] && KIRO_COUNT=$(ls -d "$KIRO_SKILLS"/squad-*/SKILL.md 2>/dev/null | wc -l | tr -d ' ')
[ -d "$GEMINI_SKILLS" ] && GEMINI_COUNT=$(ls -d "$GEMINI_SKILLS"/squad-*/SKILL.md 2>/dev/null | wc -l | tr -d ' ')
[ -d "$ANTIGRAVITY_SKILLS" ] && ANTIGRAVITY_COUNT=$(ls -d "$ANTIGRAVITY_SKILLS"/squad-*/SKILL.md 2>/dev/null | wc -l | tr -d ' ')

echo "  Claude=$CLAUDE_COUNT | Windsurf=$WINDSURF_COUNT | Cursor=$CURSOR_COUNT | Codex=$CODEX_COUNT | Kiro=$KIRO_COUNT | Gemini=$GEMINI_COUNT | Antigravity=$ANTIGRAVITY_COUNT"

# Use the highest count as reference
REF_COUNT=$CLAUDE_COUNT
for cnt in $WINDSURF_COUNT $CURSOR_COUNT $CODEX_COUNT $KIRO_COUNT $GEMINI_COUNT $ANTIGRAVITY_COUNT; do
  [ "$cnt" -gt "$REF_COUNT" ] && REF_COUNT=$cnt
done

if [ "$REF_COUNT" -eq 0 ]; then
  fail "No skills found in ANY IDE directory"
else
  pass "At least one IDE has $REF_COUNT skills installed"
fi

# --- Test 2: Cross-IDE coverage ---
echo ""
echo "## 2. Cross-IDE Skill Coverage"

# Collect all unique skill names across all IDEs
ALL_SKILLS=""
for dir in "$CLAUDE_SKILLS" "$WINDSURF_SKILLS" "$CODEX_SKILLS" "$KIRO_SKILLS" "$GEMINI_SKILLS" "$ANTIGRAVITY_SKILLS"; do
  [ -d "$dir" ] || continue
  for skill_dir in "$dir"/squad-*/; do
    [ -d "$skill_dir" ] || continue
    skill_name=$(basename "$skill_dir")
    ALL_SKILLS="$ALL_SKILLS $skill_name"
  done
done
# Cursor uses .mdc files, not dirs
if [ -d "$CURSOR_SKILLS" ]; then
  for mdc in "$CURSOR_SKILLS"/squad-*.mdc; do
    [ -f "$mdc" ] || continue
    skill_name=$(basename "$mdc" .mdc)
    ALL_SKILLS="$ALL_SKILLS $skill_name"
  done
fi

UNIQUE_SKILLS=$(echo "$ALL_SKILLS" | tr ' ' '\n' | sort -u | grep -v '^$')

for skill_name in $UNIQUE_SKILLS; do
  PRESENT_IN=""
  [ -f "$CLAUDE_SKILLS/$skill_name/SKILL.md" ] 2>/dev/null && PRESENT_IN="${PRESENT_IN}claude,"
  [ -f "$WINDSURF_SKILLS/$skill_name/SKILL.md" ] 2>/dev/null && PRESENT_IN="${PRESENT_IN}windsurf,"
  ( [ -f "$CURSOR_SKILLS/$skill_name.mdc" ] || [ -f "$CURSOR_SKILLS/$skill_name/SKILL.md" ] ) 2>/dev/null && PRESENT_IN="${PRESENT_IN}cursor,"
  [ -f "$CODEX_SKILLS/$skill_name/SKILL.md" ] 2>/dev/null && PRESENT_IN="${PRESENT_IN}codex,"
  [ -f "$KIRO_SKILLS/$skill_name/SKILL.md" ] 2>/dev/null && PRESENT_IN="${PRESENT_IN}kiro,"
  [ -f "$GEMINI_SKILLS/$skill_name/SKILL.md" ] 2>/dev/null && PRESENT_IN="${PRESENT_IN}gemini,"
  [ -f "$ANTIGRAVITY_SKILLS/$skill_name/SKILL.md" ] 2>/dev/null && PRESENT_IN="${PRESENT_IN}antigravity,"
  PRESENT_IN="${PRESENT_IN%,}"

  IDE_COUNT=$(echo "$PRESENT_IN" | tr ',' '\n' | wc -l | tr -d ' ')
  INSTALLED_IDES=0
  [ -d "$CLAUDE_SKILLS" ] && INSTALLED_IDES=$((INSTALLED_IDES + 1))
  [ -d "$WINDSURF_SKILLS" ] && INSTALLED_IDES=$((INSTALLED_IDES + 1))
  [ -d "$CURSOR_SKILLS" ] && INSTALLED_IDES=$((INSTALLED_IDES + 1))
  [ -d "$CODEX_SKILLS" ] && INSTALLED_IDES=$((INSTALLED_IDES + 1))
  [ -d "$KIRO_SKILLS" ] && INSTALLED_IDES=$((INSTALLED_IDES + 1))
  [ -d "$GEMINI_SKILLS" ] && INSTALLED_IDES=$((INSTALLED_IDES + 1))
  [ -d "$ANTIGRAVITY_SKILLS" ] && INSTALLED_IDES=$((INSTALLED_IDES + 1))

  if [ "$IDE_COUNT" -ge "$INSTALLED_IDES" ]; then
    pass "$skill_name: present in all installed IDEs ($PRESENT_IN)"
  else
    fail "$skill_name: MISSING in some IDEs (present in: $PRESENT_IN)"
  fi
done

# --- Test 3: Hook enforcement (non-Claude IDEs must call hooks) ---
echo ""
echo "## 3. Hook Enforcement (6 non-Claude IDEs)"

for dir in "$WINDSURF_SKILLS" "$CODEX_SKILLS" "$KIRO_SKILLS" "$GEMINI_SKILLS" "$ANTIGRAVITY_SKILLS"; do
  [ -d "$dir" ] || continue
  IDE_NAME=$(basename "$(dirname "$dir")" | sed 's/^\.//') 
  for skill in "$dir"/squad-*/SKILL.md; do
    [ -f "$skill" ] || continue
    skill_name=$(basename "$(dirname "$skill")")
    if grep -q 'hooks.sh\|hook-check\|safety-check' "$skill" 2>/dev/null; then
      pass "[$IDE_NAME] $skill_name has hook enforcement"
    else
      warn "[$IDE_NAME] $skill_name may lack explicit hook call"
    fi
  done
done

# Cursor uses .mdc files
if [ -d "$CURSOR_SKILLS" ]; then
  for skill in "$CURSOR_SKILLS"/squad-*.mdc; do
    [ -f "$skill" ] || continue
    skill_name=$(basename "$skill" .mdc)
    if grep -q 'hooks.sh\|hook-check\|safety-check' "$skill" 2>/dev/null; then
      pass "[cursor] $skill_name has hook enforcement"
    else
      warn "[cursor] $skill_name may lack explicit hook call"
    fi
  done
fi

# --- Test 4: Base infrastructure ---
echo ""
echo "## 4. Base Infrastructure"

BASE_AGENT="$PROJECT_ROOT/squad-method/agents/_base-agent.md"
CONFIG="$PROJECT_ROOT/squad-method/config.yaml"
ORCHESTRATOR="$PROJECT_ROOT/squad-method/fragments/agent-orchestrator.md"

if [ -f "$BASE_AGENT" ]; then
  pass "_base-agent.md present"
else
  fail "_base-agent.md MISSING"
fi

if [ -f "$CONFIG" ]; then
  pass "config.yaml present"
else
  fail "config.yaml MISSING"
fi

if [ -f "$ORCHESTRATOR" ]; then
  if head -10 "$ORCHESTRATOR" | grep -q '^fragment: agent-orchestrator' 2>/dev/null; then
    pass "agent-orchestrator.md has proper frontmatter"
  else
    fail "agent-orchestrator.md MISSING fragment: frontmatter"
  fi
else
  fail "agent-orchestrator.md MISSING"
fi

# --- Test 5: Orchestrator wired into base agent ---
echo ""
echo "## 5. Orchestrator Protocol"

if grep -q 'Multi-Agent Orchestration Protocol\|agent-orchestrator' "$BASE_AGENT" 2>/dev/null; then
  pass "_base-agent.md references orchestrator"
else
  fail "_base-agent.md does NOT reference agent-orchestrator"
fi

# --- Test 6: Fragment frontmatter completeness ---
echo ""
echo "## 6. Fragment Frontmatter"

for frag in "$PROJECT_ROOT"/squad-method/fragments/*.md; do
  [ -f "$frag" ] || continue
  fname=$(basename "$frag")
  if head -10 "$frag" | grep -q '^fragment:\|^# ' 2>/dev/null; then
    pass "fragments/$fname has proper header"
  else
    fail "fragments/$fname MISSING proper header"
  fi
done

# --- Test 7: Agent inheritance (extends: _base-agent) ---
echo ""
echo "## 7. Agent Inheritance Chain"

for agent in "$PROJECT_ROOT"/squad-method/agents/*.md; do
  aname=$(basename "$agent")
  [ "$aname" = "_base-agent.md" ] && continue
  [ "$aname" = "_base-architect.md" ] && continue
  [ "$aname" = "_base-developer.md" ] && continue
  [ "$aname" = "index.md" ] && continue
  if head -10 "$agent" | grep -q 'extends: _base-agent\|extends: _base' 2>/dev/null; then
    pass "agents/$aname extends base"
  else
    warn "agents/$aname may not declare extends (check manually)"
  fi
done

# --- Test 8: Router tools exist ---
echo ""
echo "## 8. Model Router"

ROUTER_DIR="$PROJECT_ROOT/squad-method/tools/router"
if [ -f "$ROUTER_DIR/index.js" ]; then
  pass "router/index.js present"
else
  fail "router/index.js MISSING"
fi
if [ -f "$ROUTER_DIR/quality-gate.js" ]; then
  pass "router/quality-gate.js present"
else
  fail "router/quality-gate.js MISSING"
fi
if [ -f "$ROUTER_DIR/classifier.js" ]; then
  pass "router/classifier.js present"
else
  fail "router/classifier.js MISSING"
fi

# --- Test 9: Dispatch runtime ---
echo ""
echo "## 9. Dispatch Runtime"

DISPATCH="$PROJECT_ROOT/squad-method/tools/dispatch.sh"
if [ -f "$DISPATCH" ]; then
  pass "dispatch.sh exists"
  if [ -x "$DISPATCH" ]; then
    pass "dispatch.sh is executable"
  else
    fail "dispatch.sh is NOT executable (chmod +x needed)"
  fi
else
  fail "dispatch.sh MISSING"
fi

# --- Test 10: Knowledge Graph tools ---
echo ""
echo "## 10. Knowledge Graph"

KG_DIR="$PROJECT_ROOT/squad-method/tools/knowledge-graph"
if [ -d "$KG_DIR" ]; then
  KG_FILES=$(ls "$KG_DIR"/*.js 2>/dev/null | wc -l | tr -d ' ')
  pass "Knowledge Graph tools: $KG_FILES JS files"
else
  fail "Knowledge Graph directory MISSING"
fi

# --- Summary ---
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Results: $CHECKS checks | $FAILURES failures | $WARNINGS warnings"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILURES -eq 0 ]; then
  echo -e "${GREEN}  ALL PARITY CHECKS PASSED${NC}"
  exit 0
else
  echo -e "${RED}  $FAILURES PARITY VIOLATION(S) FOUND${NC}"
  exit 1
fi
