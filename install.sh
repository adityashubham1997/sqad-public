#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# SQAD-Public Installer (git-based, no npm required)
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/adityashubham1997/sqad-public/main/install.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/adityashubham1997/sqad-public/main/install.sh | bash -s -- --ide claude,windsurf
#
# What it does:
#   1. Checks git and Node.js >= 18 are installed
#   2. Clones (or pulls latest) sqad-public from GitHub
#   3. Runs sqad-public init/update/uninstall via node directly
#
# No npm, npx, or package manager required.
#
# Flags:
#   --ide <list>     Comma-separated IDEs (claude,windsurf,cursor,codex,kiro,gemini,antigravity,all)
#   --update         Update existing SQAD-Public installation
#   --uninstall      Remove SQAD-Public from workspace
#   --help           Show usage
# ─────────────────────────────────────────────────────────────

REPO_URL="https://github.com/adityashubham1997/sqad-public.git"
CACHE_DIR="${SQAD_CACHE_DIR:-${HOME}/.sqad-public}"
NODE_MIN=18

BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}ℹ${NC}  $1"; }
ok()    { echo -e "${GREEN}✅${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠️${NC}  $1"; }
fail()  { echo -e "${RED}❌${NC} $1"; exit 1; }

usage() {
  cat <<EOF

${BOLD}SQAD-Public Installer${NC}  (git-based — no npm required)
26-agent AI development framework — any stack, any IDE, any cloud

${BOLD}Usage:${NC}
  curl -fsSL https://raw.githubusercontent.com/adityashubham1997/sqad-public/main/install.sh | bash
  curl -fsSL https://raw.githubusercontent.com/adityashubham1997/sqad-public/main/install.sh | bash -s -- --ide claude,windsurf

${BOLD}Options:${NC}
  --ide <list>     Comma-separated IDEs to configure
  --update         Update existing installation (pulls latest first)
  --uninstall      Remove SQAD-Public from workspace
  --help           Show this help

${BOLD}Requirements:${NC}
  - git
  - Node.js >= 18.0.0 (no npm/npx needed)
  - An AI-powered IDE (Claude Code, Windsurf, Cursor, etc.)

${BOLD}Cache:${NC}
  Repo is cloned to ~/.sqad-public and reused on subsequent runs.
  Set SQAD_CACHE_DIR to override. Delete to force a fresh clone.

EOF
  exit 0
}

# ── Parse arguments ──────────────────────────────────────────
MODE="init"
IDE_FLAG=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ide)
      IDE_FLAG="--ide $2"
      shift 2
      ;;
    --update)
      MODE="update"
      shift
      ;;
    --uninstall)
      MODE="uninstall"
      shift
      ;;
    --help|-h)
      usage
      ;;
    *)
      warn "Unknown option: $1 (ignored)"
      shift
      ;;
  esac
done

# ── Preflight checks ────────────────────────────────────────
echo ""
echo -e "${BOLD}━━━ SQAD-Public Installer ━━━${NC}"
echo ""

# Check git
if ! command -v git &>/dev/null; then
  fail "git is not installed. Please install git: https://git-scm.com"
fi
ok "git $(git --version | awk '{print $3}') detected"

# Check Node.js
if ! command -v node &>/dev/null; then
  fail "Node.js is not installed. Please install Node.js >= ${NODE_MIN} from https://nodejs.org"
fi

NODE_VERSION=$(node -v | sed 's/^v//' | cut -d. -f1)
if [[ "$NODE_VERSION" -lt "$NODE_MIN" ]]; then
  fail "Node.js v${NODE_VERSION} found — requires >= ${NODE_MIN}. Upgrade: https://nodejs.org"
fi
ok "Node.js v$(node -v | sed 's/^v//') detected"

# ── Clone or pull latest ─────────────────────────────────────
if [[ -d "${CACHE_DIR}/.git" ]]; then
  info "Pulling latest from GitHub..."
  git -C "${CACHE_DIR}" fetch origin main --quiet
  LOCAL=$(git -C "${CACHE_DIR}" rev-parse HEAD)
  REMOTE=$(git -C "${CACHE_DIR}" rev-parse origin/main)
  if [[ "$LOCAL" != "$REMOTE" ]]; then
    git -C "${CACHE_DIR}" reset --hard origin/main --quiet
    ok "Updated to latest ($(git -C "${CACHE_DIR}" log -1 --format='%h %s'))"
  else
    ok "Already up to date ($(git -C "${CACHE_DIR}" log -1 --format='%h'))"
  fi
else
  info "Cloning sqad-public from GitHub..."
  git clone --depth 1 "${REPO_URL}" "${CACHE_DIR}" --quiet
  ok "Cloned v$(node -e "console.log(JSON.parse(require('fs').readFileSync('${CACHE_DIR}/package.json','utf8')).version)")"
fi

CLI="${CACHE_DIR}/bin/sqad-public.js"

# ── Run the command ──────────────────────────────────────────
echo ""
WORKSPACE="$(pwd)"

case "$MODE" in
  init)
    info "Initializing SQAD-Public in ${WORKSPACE}..."
    echo ""
    node "${CLI}" init ${IDE_FLAG}
    ;;
  update)
    info "Updating SQAD-Public in ${WORKSPACE}..."
    echo ""
    node "${CLI}" update
    ;;
  uninstall)
    info "Removing SQAD-Public from ${WORKSPACE}..."
    echo ""
    node "${CLI}" uninstall
    ;;
esac

echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD} SQAD-Public ${MODE} complete!${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
