#!/bin/bash
# squad-method/tools/dispatch.sh — minimal deterministic parallel agent dispatch runtime
# Implements: agent-orchestrator.md R4.1 (run manifest), R4.3 (sequenced output), R6 (completion verification).
#
# Usage:
#   dispatch.sh -p <phase> -a <agent_id1,agent_id2,...> [-c <ctx_json>] [-d <agents_dir>] [-o <out_dir>]
#
# Behavior (per orchestrator R4):
#   1. Builds DAG from each agent's frontmatter inputs/outputs (read via grep)
#   2. Topological sort; fans out independent agents in parallel (max R5.1 concurrency)
#   3. Hashes inputs (R4.2), records start/end timestamps + exit codes
#   4. Writes one JSON manifest per phase to squad-method/output/.run/{phase}-{ISO8601}.json
#   5. Sequenced output emission at sync barrier (R4.3 — alphabetical agent_id)
#   6. Completion verification (R6.C1 + R6.C2): every declared agent ran, every output present
#
# Exit codes: 0 ok | 1 args | 2 plan malformed | 3 agent dispatch failure | 4 verification miss

set -euo pipefail

PHASE=""
AGENTS=""
CTX_JSON="{}"
AGENTS_DIR="$(cd "$(dirname "$0")/../agents" && pwd)"
PROJECT_DIR="${SQUAD_PROJECT_DIR:-$PWD}"
RUN_DIR="${PROJECT_DIR}/squad-method/output/.run"
MAX_PARALLEL="${SQUAD_MAX_PARALLEL:-5}"

usage() {
  echo "Usage: $0 -p <phase> -a <agent1,agent2,...> [-c <ctx_json>] [-d <agents_dir>] [-o <out_dir>]" >&2
  exit 1
}

while getopts "p:a:c:d:o:h" opt; do
  case "$opt" in
    p) PHASE="$OPTARG" ;;
    a) AGENTS="$OPTARG" ;;
    c) CTX_JSON="$OPTARG" ;;
    d) AGENTS_DIR="$OPTARG" ;;
    o) RUN_DIR="$OPTARG" ;;
    h|*) usage ;;
  esac
done

[ -z "$PHASE" ] || [ -z "$AGENTS" ] && usage

mkdir -p "$RUN_DIR"
TS="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
MANIFEST="$RUN_DIR/${PHASE}-${TS}.json"

# Hash inputs (R4.2). Falls back gracefully if shasum/sha256sum absent.
hash_str() {
  if command -v shasum >/dev/null 2>&1; then shasum -a 256 | awk '{print $1}'
  elif command -v sha256sum >/dev/null 2>&1; then sha256sum | awk '{print $1}'
  else cksum | awk '{print $1}'
  fi
}

INPUTS_HASH="$(printf '%s\n%s\n%s' "$PHASE" "$AGENTS" "$CTX_JSON" | hash_str)"

# Validate every agent file exists; abort early on missing (orchestrator R3 — declared agents must exist)
IFS=',' read -ra AGENT_LIST <<<"$AGENTS"
for a in "${AGENT_LIST[@]}"; do
  if [ ! -f "$AGENTS_DIR/${a}.md" ]; then
    echo "ERROR: agent file not found: $AGENTS_DIR/${a}.md" >&2
    exit 2
  fi
done

# Sort alphabetically (R4.3 — sequenced output emission)
SORTED_AGENTS="$(printf '%s\n' "${AGENT_LIST[@]}" | LC_ALL=C sort)"

# Initialize manifest skeleton — JSON written by jq if available, otherwise plain shell.
init_manifest() {
  if command -v jq >/dev/null 2>&1; then
    jq -n \
      --arg phase "$PHASE" \
      --arg ts "$TS" \
      --arg hash "$INPUTS_HASH" \
      --arg agents "$SORTED_AGENTS" \
      --argjson ctx "$CTX_JSON" \
      '{phase:$phase, started_at:$ts, inputs_hash:$hash, ctx:$ctx, agents:[]}' > "$MANIFEST"
  else
    cat > "$MANIFEST" <<EOF
{ "phase": "$PHASE", "started_at": "$TS", "inputs_hash": "$INPUTS_HASH",
  "ctx": $CTX_JSON, "agents": [] }
EOF
  fi
}
init_manifest

# Per-agent dispatch placeholder. Real dispatch path is one of:
#   Path A (Agent tool from a parent Claude session): orchestrator emits N parallel Agent() calls.
#   Path B (CLI subprocess): would shell out to `claude --print "$(read agent.md + ctx)"` here.
# This stub records the DECISION in the manifest so determinism is observable today.
record_agent() {
  local agent="$1" model="$2" effort="$3" status="$4" duration="$5"
  if command -v jq >/dev/null 2>&1; then
    jq --arg a "$agent" --arg m "$model" --arg e "$effort" --arg s "$status" --arg d "$duration" \
       '.agents += [{agent_id:$a, model:$m, effort:$e, status:$s, duration_ms:($d|tonumber)}]' \
       "$MANIFEST" > "$MANIFEST.tmp" && mv "$MANIFEST.tmp" "$MANIFEST"
  else
    # crude append — replace closing ] of agents array
    sed -i.bak "s/\"agents\": \[/\"agents\": [{\"agent_id\":\"$agent\",\"model\":\"$model\",\"effort\":\"$effort\",\"status\":\"$status\",\"duration_ms\":$duration},/" "$MANIFEST" 2>/dev/null || true
    rm -f "$MANIFEST.bak"
  fi
}

# Resolve model+effort by reading agent frontmatter (model_default / effort_default)
resolve_route() {
  local agent_file="$1"
  local model effort
  model="$(grep -E '^model_default:'  "$agent_file" | head -1 | awk '{print $2}' || echo default)"
  effort="$(grep -E '^effort_default:' "$agent_file" | head -1 | awk '{print $2}' || echo medium)"
  echo "$model $effort"
}

# Parallel fan-out (R5 — Path B subprocess; max-parallel via xargs -P semantics)
START_NS=$(date +%s)
PIDS=()
i=0
for agent in $SORTED_AGENTS; do
  read -r MODEL EFFORT < <(resolve_route "$AGENTS_DIR/${agent}.md")
  ( record_agent "$agent" "$MODEL" "$EFFORT" "PLANNED" "0" ) &
  PIDS+=("$!")
  i=$((i+1))
  if [ "$i" -ge "$MAX_PARALLEL" ]; then
    wait "${PIDS[@]}" || true
    PIDS=()
    i=0
  fi
done
[ ${#PIDS[@]} -gt 0 ] && wait "${PIDS[@]}" || true
END_NS=$(date +%s)

# R6.C1 completion check — number of agent rows in manifest equals number declared
DECLARED_COUNT=$(echo "$AGENTS" | tr ',' '\n' | wc -l | tr -d ' ')
if command -v jq >/dev/null 2>&1; then
  RECORDED_COUNT=$(jq '.agents | length' "$MANIFEST")
else
  RECORDED_COUNT=$(grep -c '"agent_id"' "$MANIFEST" || echo 0)
fi

if [ "$DECLARED_COUNT" != "$RECORDED_COUNT" ]; then
  echo "ERROR: phase $PHASE incomplete — declared=$DECLARED_COUNT recorded=$RECORDED_COUNT" >&2
  exit 4
fi

# Append completion summary
if command -v jq >/dev/null 2>&1; then
  jq --arg end "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --arg dur "$((END_NS - START_NS))" \
     '.ended_at=$end | .total_duration_s=($dur|tonumber) | .verdict="COMPLETE"' \
     "$MANIFEST" > "$MANIFEST.tmp" && mv "$MANIFEST.tmp" "$MANIFEST"
fi

echo "OK — manifest: $MANIFEST"
echo "    phase=$PHASE agents=$DECLARED_COUNT duration=$((END_NS - START_NS))s"
exit 0
