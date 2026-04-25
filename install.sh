#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# SQAD-Public Installer
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/adityashubham1997/sqad-public/main/install.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/adityashubham1997/sqad-public/main/install.sh | bash -s -- --ide claude,windsurf
#
# What it does:
#   1. Checks Node.js >= 18 is installed
#   2. Installs/updates sqad-public from npm (always latest)
#   3. Runs sqad-public init in the current directory
#
# Flags:
#   --ide <list>     Comma-separated IDEs (claude,windsurf,cursor,codex,kiro,gemini,antigravity,all)
#   --update         Update an existing SQAD-Public installation
#   --uninstall      Remove SQAD-Public from workspace
#   --global         Install sqad-public globally instead of using npx
#   --help           Show usage
# ─────────────────────────────────────────────────────────────

VERSION_REQUIRED=18
BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

info()  { echo -e "${CYAN}ℹ${NC}  $1"; }
ok()    { echo -e "${GREEN}✅${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠️${NC}  $1"; }
fail()  { echo -e "${RED}❌${NC} $1"; exit 1; }

usage() {
  cat <<EOF

${BOLD}SQAD-Public Installer${NC}
16-agent AI development framework — any stack, any IDE, any cloud

${BOLD}Usage:${NC}
  curl -fsSL https://raw.githubusercontent.com/adityashubham1997/sqad-public/main/install.sh | bash
  curl -fsSL https://raw.githubusercontent.com/adityashubham1997/sqad-public/main/install.sh | bash -s -- --ide claude,windsurf

${BOLD}Options:${NC}
  --ide <list>     Comma-separated IDEs to configure
  --update         Update existing installation (pulls latest from npm)
  --uninstall      Remove SQAD-Public from workspace
  --global         Install globally via npm instead of using npx
  --help           Show this help

${BOLD}Requirements:${NC}
  - Node.js >= 18.0.0
  - An AI-powered IDE (Claude Code, Windsurf, Cursor, etc.)

EOF
  exit 0
}

# ── Parse arguments ──────────────────────────────────────────
MODE="init"
IDE_FLAG=""
GLOBAL=false

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
    --global)
      GLOBAL=true
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

# ── Check Node.js ────────────────────────────────────────────
echo ""
echo -e "${BOLD}━━━ SQAD-Public Installer ━━━${NC}"
echo ""

if ! command -v node &>/dev/null; then
  fail "Node.js is not installed. Please install Node.js >= ${VERSION_REQUIRED} from https://nodejs.org"
fi

NODE_VERSION=$(node -v | sed 's/^v//' | cut -d. -f1)
if [[ "$NODE_VERSION" -lt "$VERSION_REQUIRED" ]]; then
  fail "Node.js v${NODE_VERSION} found — SQAD-Public requires >= ${VERSION_REQUIRED}. Please upgrade: https://nodejs.org"
fi

ok "Node.js v$(node -v | sed 's/^v//') detected"

# ── Check npm ────────────────────────────────────────────────
if ! command -v npm &>/dev/null; then
  fail "npm is not installed. It should come with Node.js — try reinstalling Node."
fi

ok "npm v$(npm -v) detected"

# ── Install / update sqad-public from npm ────────────────────
info "Checking for latest sqad-public on npm..."

INSTALLED_VERSION=$(npm ls -g sqad-public --json 2>/dev/null | node -e "
  let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
    try{const j=JSON.parse(d);console.log(j.dependencies?.['sqad-public']?.version||'')}
    catch{console.log('')}
  })
" 2>/dev/null || echo "")

LATEST_VERSION=$(npm view sqad-public version --registry=https://registry.npmjs.org/ 2>/dev/null || echo "")

if [[ -z "$LATEST_VERSION" ]]; then
  warn "Could not fetch latest version from npm — will use npx which auto-fetches"
fi

if [[ "$GLOBAL" == true ]]; then
  if [[ -n "$INSTALLED_VERSION" && "$INSTALLED_VERSION" == "$LATEST_VERSION" ]]; then
    ok "sqad-public@${INSTALLED_VERSION} is already up to date"
  else
    if [[ -n "$INSTALLED_VERSION" ]]; then
      info "Updating sqad-public ${INSTALLED_VERSION} → ${LATEST_VERSION}..."
    else
      info "Installing sqad-public@${LATEST_VERSION} globally..."
    fi
    npm install -g sqad-public@latest --registry=https://registry.npmjs.org/
    ok "sqad-public@$(sqad-public --version 2>/dev/null | sed 's/sqad-public v//') installed globally"
  fi
fi

# ── Run the command ──────────────────────────────────────────
echo ""

case "$MODE" in
  init)
    info "Initializing SQAD-Public in $(pwd)..."
    echo ""
    if [[ "$GLOBAL" == true ]]; then
      sqad-public init $IDE_FLAG
    else
      npx sqad-public@latest init $IDE_FLAG
    fi
    ;;
  update)
    info "Updating SQAD-Public in $(pwd)..."
    echo ""
    if [[ "$GLOBAL" == true ]]; then
      sqad-public update
    else
      npx sqad-public@latest update
    fi
    ;;
  uninstall)
    info "Removing SQAD-Public from $(pwd)..."
    echo ""
    if [[ "$GLOBAL" == true ]]; then
      sqad-public uninstall
    else
      npx sqad-public@latest uninstall
    fi
    ;;
esac

echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD} SQAD-Public ${MODE} complete!${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
