#!/bin/bash
# hooks.sh — Safety Hook Layer for IDEs without harness-level enforcement
# Version: 1.0.0
# Purpose: Provides safety hooks for all IDEs without harness-level enforcement:
#          Windsurf, Cursor, Codex, Kiro, Gemini, Antigravity
#          (Claude Code has automatic enforcement via settings.json).
#
# In Claude Code, hooks fire automatically (harness-enforced, impossible to bypass).
# In Windsurf/Cursor/Codex/Kiro/Gemini/Antigravity, this script is called by skills at phase boundaries.
#
# HONEST CAVEAT: This is "hard to bypass" not "impossible to bypass".
# The LLM could theoretically skip calling this script. But the alternative — zero
# enforcement — is worse. Every skill MUST call this at Step 0.
#
# Usage:
#   bash squad-method/tools/hooks.sh [check-type] [args...]
#
# Check types:
#   session-start        — Verify SQUAD skills/config are loaded
#   pre-edit <path>      — Block auto-generated file edits
#   pre-write <path>     — Check requirements gates
#   progress-save        — Save progress doc before context loss
#   all                  — Run all session-start checks
#
# Exit codes:
#   0 — all checks passed
#   1 — blocked (with reason on stderr)

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

pass() { echo -e "${GREEN}✅ PASS${NC}: $1"; }
fail() { echo -e "${RED}❌ BLOCK${NC}: $1" >&2; }
warn() { echo -e "${YELLOW}⚠️  WARN${NC}: $1"; }

# --- Hook 1: Session Skills Gate ---
check_session_start() {
  local config_yaml="$PROJECT_ROOT/squad-method/config.yaml"
  local base_agent="$PROJECT_ROOT/squad-method/agents/_base-agent.md"
  local skills_dir=""

  local failures=0

  # Detect which IDE skill directory exists (all 7 supported IDEs)
  for dir in "$PROJECT_ROOT/.claude/skills" \
             "$PROJECT_ROOT/.windsurf/skills" \
             "$PROJECT_ROOT/.cursor/rules" \
             "$PROJECT_ROOT/.codex/skills" \
             "$PROJECT_ROOT/.kiro/skills" \
             "$PROJECT_ROOT/.gemini/skills" \
             "$PROJECT_ROOT/.antigravity/skills"; do
    if [ -d "$dir" ] && ls "$dir"/squad-*/* >/dev/null 2>&1; then
      skills_dir="$dir"
      break
    fi
  done

  if [ -z "$skills_dir" ]; then
    fail "SQUAD skills not found in any IDE directory (.claude/, .windsurf/, .cursor/, .codex/, .kiro/, .gemini/, .antigravity/)"
    echo "  Fix: run installer to install SQUAD skills" >&2
    failures=$((failures + 1))
  else
    local count
    count=$(ls "$skills_dir"/squad-*/SKILL.md 2>/dev/null | wc -l | tr -d ' ')
    pass "SQUAD skills loaded ($count skills in $(basename "$(dirname "$skills_dir")"))"
  fi

  if [ ! -f "$config_yaml" ]; then
    fail "squad-method/config.yaml not found"
    failures=$((failures + 1))
  else
    pass "config.yaml present"
  fi

  if [ ! -f "$base_agent" ]; then
    fail "squad-method/agents/_base-agent.md not found"
    failures=$((failures + 1))
  else
    pass "_base-agent.md present"
  fi

  # Check for required directories
  mkdir -p "$PROJECT_ROOT/squad-method/output/progress" 2>/dev/null || true
  mkdir -p "$PROJECT_ROOT/squad-method/output/reports" 2>/dev/null || true
  mkdir -p "$PROJECT_ROOT/squad-method/output/.run" 2>/dev/null || true

  return $failures
}

# --- Hook 2: Pre-Edit Guard (auto-generated files) ---
check_pre_edit() {
  local target_path="${1:-}"

  if [ -z "$target_path" ]; then
    return 0
  fi

  # Block editing common auto-generated patterns
  local blocked_patterns=(
    "dist/"
    "build/"
    ".next/"
    "target/"
    "node_modules/"
    "*.generated.*"
    "*.pb.go"
    "*_pb2.py"
  )

  for pattern in "${blocked_patterns[@]}"; do
    if echo "$target_path" | grep -qE "$pattern" 2>/dev/null; then
      fail "File appears auto-generated: $target_path (matches pattern: $pattern)"
      echo "  Fix: modify the source that generates this file, not the output" >&2
      return 1
    fi
  done

  pass "File OK to edit: $target_path"
  return 0
}

# --- Hook 3: Pre-Write Requirements Gate ---
check_pre_write() {
  local target_path="${1:-}"

  # Check if project has requirements when creating new source files
  # This is a soft check — warn but don't block
  if [ ! -f "$PROJECT_ROOT/REQUIREMENTS.md" ] && [ ! -f "$PROJECT_ROOT/requirements.md" ] && [ ! -f "$PROJECT_ROOT/docs/requirements.md" ]; then
    warn "No REQUIREMENTS.md found — consider creating one with /create-prd"
  fi

  return 0
}

# --- Hook 4: Progress Save ---
check_progress_save() {
  local progress_dir="$PROJECT_ROOT/squad-method/output/progress"

  if [ -d "$progress_dir" ]; then
    local active_docs
    active_docs=$(ls "$progress_dir"/progress-*.md 2>/dev/null | wc -l | tr -d ' ')
    if [ "$active_docs" -gt 0 ]; then
      pass "Progress docs found ($active_docs active) — context preserved"
    else
      warn "No active progress docs — long conversations may lose context"
    fi
  else
    mkdir -p "$progress_dir"
    warn "Created progress directory"
  fi

  return 0
}

# --- Hook 5: Secret Detection (pre-commit check) ---
check_secrets() {
  local target_path="${1:-}"

  if [ -z "$target_path" ] || [ ! -f "$target_path" ]; then
    return 0
  fi

  local findings=0

  # AWS Access Keys
  if grep -qE 'AKIA[0-9A-Z]{16}' "$target_path" 2>/dev/null; then
    fail "Potential AWS access key found in $target_path"
    findings=$((findings + 1))
  fi

  # Private keys
  if grep -q '-----BEGIN.*PRIVATE KEY' "$target_path" 2>/dev/null; then
    fail "Private key found in $target_path"
    findings=$((findings + 1))
  fi

  # Generic secrets (high-confidence patterns only)
  if grep -qEi '(password|secret|token)\s*[:=]\s*["\x27][^"\x27]{8,}' "$target_path" 2>/dev/null; then
    warn "Potential secret/credential pattern in $target_path — verify before committing"
  fi

  if [ $findings -eq 0 ]; then
    pass "No secrets detected in $target_path"
  fi

  return $findings
}

# --- Hook 6: Gate Ledger Check ---
check_gate_ledger() {
  local ledger="$PROJECT_ROOT/squad-method/output/.gate-ledger.json"

  if [ -f "$ledger" ]; then
    if command -v jq >/dev/null 2>&1; then
      local pending
      pending=$(jq '[.gates | to_entries[] | select(.value.status == "PENDING")] | length' "$ledger" 2>/dev/null || echo 0)
      if [ "$pending" -gt 0 ]; then
        warn "$pending gate(s) still PENDING in gate ledger"
      else
        pass "All gates passed in ledger"
      fi
    else
      pass "Gate ledger exists (install jq for detailed check)"
    fi
  fi

  return 0
}

# --- Main Dispatch ---
case "${1:-all}" in
  session-start)
    check_session_start
    ;;
  pre-edit)
    check_pre_edit "${2:-}"
    ;;
  pre-write)
    check_pre_write "${2:-}"
    ;;
  progress-save)
    check_progress_save
    ;;
  secrets)
    check_secrets "${2:-}"
    ;;
  gate-ledger)
    check_gate_ledger
    ;;
  all)
    echo "Running all session-start checks..."
    echo ""
    check_session_start
    echo ""
    check_progress_save
    echo ""
    check_gate_ledger
    echo ""
    echo "All checks complete."
    ;;
  *)
    echo "Usage: $0 {session-start|pre-edit|pre-write|progress-save|secrets|gate-ledger|all} [args...]" >&2
    exit 1
    ;;
esac
