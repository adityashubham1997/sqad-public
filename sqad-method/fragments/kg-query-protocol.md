# Knowledge Graph Query Protocol

## When to Use

Query `<repo>/knowledge-graph-out/graph.json` when you need to:
- **Impact analysis** — what depends on a file/class you're changing?
- **Blast radius** — how far do changes ripple?
- **Test coverage mapping** — which test files cover a given module?
- **God node awareness** — is this a high-degree component requiring extra care?
- **Cross-community detection** — surprising edges between unrelated subsystems

## Availability Check

```bash
# Check if KG data exists for a repo
[ -f "<repo>/knowledge-graph-out/graph.json" ] && echo "KG available" || echo "KG not available — fall back to grep"
```

If `graph.json` does not exist, fall back to grep-based analysis. KG is a bonus,
not a blocker.

## graph.json Structure

```json
{
  "nodes": [
    { "id": "UserService", "type": "class", "label": "UserService", "file": "...", ... }
  ],
  "edges": [
    { "source": "UserService", "target": "AuthProvider", "type": "calls", ... }
  ],
  "stats": { "nodes": 3224, "edges": 1995 },
  "generated": "2026-04-25T...",
  "version": "1.0"
}
```

Node types: `class`, `file`, `function`, `module`, `interface`, `table`, `test`
Edge types: `calls`, `imports`, `extends`, `references`, `tests`

## Query Recipes

### 1. Impact Analysis — "What depends on X?"

Find all nodes that have edges pointing TO the target (reverse dependencies):

```bash
# Find everything that depends on UserService
node -e "
const g = require('./<repo>/knowledge-graph-out/graph.json');
const target = 'UserService';
const deps = g.edges.filter(e => e.target === target).map(e => ({from: e.source, type: e.type}));
console.log('Reverse dependencies of ' + target + ':');
deps.forEach(d => console.log('  ' + d.from + ' (' + d.type + ')'));
console.log('Total: ' + deps.length);
"
```

### 2. Blast Radius — "What does X depend on?" (forward deps)

```bash
node -e "
const g = require('./<repo>/knowledge-graph-out/graph.json');
const source = 'UserService';
const deps = g.edges.filter(e => e.source === source).map(e => ({to: e.target, type: e.type}));
console.log('Forward dependencies of ' + source + ':');
deps.forEach(d => console.log('  ' + d.to + ' (' + d.type + ')'));
console.log('Total: ' + deps.length);
"
```

### 3. Two-Hop Ripple — "What's affected transitively?"

```bash
node -e "
const g = require('./<repo>/knowledge-graph-out/graph.json');
const seed = 'UserService';
const hop1 = g.edges.filter(e => e.target === seed).map(e => e.source);
const hop2 = g.edges.filter(e => hop1.includes(e.target)).map(e => e.source);
const all = [...new Set([...hop1, ...hop2])];
console.log('2-hop ripple from ' + seed + ': ' + all.length + ' nodes');
all.forEach(n => console.log('  ' + n));
"
```

### 4. God Node Check — "Is this a high-coupling component?"

```bash
node -e "
const g = require('./<repo>/knowledge-graph-out/graph.json');
const target = 'UserService';
const inDeg = g.edges.filter(e => e.target === target).length;
const outDeg = g.edges.filter(e => e.source === target).length;
const total = inDeg + outDeg;
console.log(target + ': degree=' + total + ' (in=' + inDeg + ', out=' + outDeg + ')');
if (total > 30) console.log('⚠️  GOD NODE — extra review required');
"
```

### 5. Test Coverage — "Which tests cover this module?"

```bash
node -e "
const g = require('./<repo>/knowledge-graph-out/graph.json');
const mod = 'UserService';
const testEdges = g.edges.filter(e => e.target === mod && e.type === 'tests');
const testNodes = g.nodes.filter(n => n.type === 'test' && g.edges.some(e => e.source === n.id && e.target === mod));
const directTests = testEdges.map(e => e.source);
console.log('Tests covering ' + mod + ': ' + directTests.length);
directTests.forEach(t => console.log('  ' + t));
if (directTests.length === 0) console.log('⚠️  NO TEST COVERAGE — flag as gap');
"
```

### 6. Cross-Community Detection — "Surprising dependencies?"

```bash
node -e "
const g = require('./<repo>/knowledge-graph-out/graph.json');
const nodeMap = Object.fromEntries(g.nodes.map(n => [n.id, n]));
const surprises = g.edges.filter(e => {
  const s = nodeMap[e.source], t = nodeMap[e.target];
  return s && t && s.type !== t.type;
});
console.log('Cross-community edges: ' + surprises.length);
surprises.slice(0, 10).forEach(e => {
  const s = nodeMap[e.source], t = nodeMap[e.target];
  console.log('  ' + e.source + ' (' + (s||{}).type + ') → ' + e.target + ' (' + (t||{}).type + ')');
});
"
```

## Integrating KG into Skills

When a skill loads context for a repo:
1. Read `CONTEXT.md` (always — god nodes summary is here)
2. Read `DEEP-CONTEXT.md` (if exists — architecture, data model)
3. **Query `graph.json`** (if exists) for the specific files being changed/reviewed
4. Fall back to grep if KG not available

Present KG findings in a structured block:
```
📊 Knowledge Graph — [repo]
  Target: [file/module being changed]
  Degree: [N] (in=[N], out=[N])
  God node: YES/NO
  Reverse deps: [list — what breaks if this changes]
  Test coverage: [list — test files covering this]
  Cross-community: [any surprising edges]
```
