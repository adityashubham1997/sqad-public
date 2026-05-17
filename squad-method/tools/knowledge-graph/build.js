#!/usr/bin/env node

/**
 * SQUAD-Public Knowledge Graph Builder
 *
 * Builds a dependency graph (graph.json) for any project by scanning
 * source files for imports/requires/includes. Stack-agnostic — detects
 * JavaScript, TypeScript, Python, Go, Rust, Java, Ruby.
 *
 * Usage:
 *   node build.js <repo-path> [--output <dir>]
 *
 * Output:
 *   <repo-path>/knowledge-graph-out/graph.json
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname, basename, dirname, resolve } from 'node:path';
import { gitPass } from './git-pass.js';
import { detectCommunities } from './cluster.js';
import { findSurprises, findHotspots, computeComplexity } from './analyze.js';

const LANGUAGE_PATTERNS = {
  // JavaScript/TypeScript
  '.js':   { type: 'js', importRegex: [/require\(['"]([^'"]+)['"]\)/g, /from\s+['"]([^'"]+)['"]/g] },
  '.mjs':  { type: 'js', importRegex: [/from\s+['"]([^'"]+)['"]/g] },
  '.cjs':  { type: 'js', importRegex: [/require\(['"]([^'"]+)['"]\)/g] },
  '.ts':   { type: 'ts', importRegex: [/from\s+['"]([^'"]+)['"]/g, /require\(['"]([^'"]+)['"]\)/g] },
  '.tsx':  { type: 'ts', importRegex: [/from\s+['"]([^'"]+)['"]/g] },
  '.jsx':  { type: 'js', importRegex: [/from\s+['"]([^'"]+)['"]/g, /require\(['"]([^'"]+)['"]\)/g] },
  // Python
  '.py':   { type: 'py', importRegex: [/^import\s+(\S+)/gm, /^from\s+(\S+)\s+import/gm] },
  // Go
  '.go':   { type: 'go', importRegex: [/"\s*([^"]+)\s*"/g] },  // inside import blocks
  // Rust
  '.rs':   { type: 'rs', importRegex: [/use\s+([\w:]+)/g, /mod\s+(\w+)/g] },
  // Java
  '.java': { type: 'java', importRegex: [/^import\s+([\w.]+)/gm] },
  // Ruby
  '.rb':   { type: 'rb', importRegex: [/require\s+['"]([^'"]+)['"]/g, /require_relative\s+['"]([^'"]+)['"]/g] },
};

const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', '.next', '__pycache__',
  'target', 'vendor', '.venv', 'venv', 'coverage', '.nyc_output',
  'knowledge-graph-out', '.squad', 'squad-method',
]);

const TEST_PATTERNS = [
  /\.test\./i, /\.spec\./i, /_test\./i, /test_/i,
  /\/test\//i, /\/tests\//i, /\/__tests__\//i, /\/spec\//i,
];

/**
 * Main entry point.
 */
function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node build.js <repo-path> [--output <dir>]');
    process.exit(1);
  }

  const repoPath = resolve(args[0]);
  const outputIdx = args.indexOf('--output');
  const outputDir = outputIdx !== -1 && args[outputIdx + 1]
    ? resolve(args[outputIdx + 1])
    : join(repoPath, 'knowledge-graph-out');

  if (!existsSync(repoPath)) {
    console.error(`Path not found: ${repoPath}`);
    process.exit(1);
  }

  console.log(`📊 Building knowledge graph for: ${repoPath}`);

  // Scan source files
  const files = scanFiles(repoPath);
  console.log(`   Found ${files.length} source files`);

  // Build edges
  const edges = [];
  const nodes = new Map();

  for (const file of files) {
    const relPath = relative(repoPath, file.path);
    const isTest = TEST_PATTERNS.some(p => p.test(relPath));

    nodes.set(relPath, {
      path: relPath,
      type: file.lang,
      isTest,
      lines: file.lines,
    });

    // Extract imports
    const imports = extractImports(file.path, file.lang);
    for (const imp of imports) {
      const resolved = resolveImport(repoPath, file.path, imp, file.lang);
      if (resolved) {
        const targetRel = relative(repoPath, resolved);
        edges.push({
          source: relPath,
          target: targetRel,
          type: isTest ? 'tests' : 'imports',
        });
      }
    }
  }

  // Compute node degrees
  const degreeMap = new Map();
  for (const edge of edges) {
    degreeMap.set(edge.source, (degreeMap.get(edge.source) || 0) + 1);
    degreeMap.set(edge.target, (degreeMap.get(edge.target) || 0) + 1);
  }

  // Build graph JSON
  const graph = {
    version: 1,
    generated: new Date().toISOString(),
    repo: basename(repoPath),
    stats: {
      nodes: nodes.size,
      edges: edges.length,
      source_files: [...nodes.values()].filter(n => !n.isTest).length,
      test_files: [...nodes.values()].filter(n => n.isTest).length,
      god_nodes: [...degreeMap.entries()].filter(([, d]) => d > 30).length,
    },
    nodes: [...nodes.entries()].map(([path, node]) => ({
      ...node,
      degree: degreeMap.get(path) || 0,
      god_node: (degreeMap.get(path) || 0) > 30,
    })),
    edges,
  };

  // Pass 2: Git history enrichment (co-change edges, churn data)
  let gitStats = { coChanges: 0, hotspots: 0, authors: 0, churnFiles: 0 };
  if (existsSync(join(repoPath, '.git'))) {
    console.log('   Running git pass (co-change + churn analysis)...');
    gitStats = gitPass(graph, repoPath, { maxCommits: 500, verbose: true });
    console.log(`   Co-changes: ${gitStats.coChanges} | Hotspots: ${gitStats.hotspots} | Authors: ${gitStats.authors}`);
  }

  // Pass 3: Community detection via label propagation
  console.log('   Detecting communities (label propagation)...');
  const communities = detectCommunities(graph, { maxIterations: 50 });
  graph.communities = communities;

  // Pass 4: Surprise edges + hotspot analysis
  const surprises = findSurprises(graph, communities);
  const hotspots = findHotspots(graph);
  const complexity = computeComplexity(graph, communities, surprises);
  graph.stats.surprises = surprises.length;
  graph.stats.hotspots = hotspots.length;
  graph.stats.complexity_score = complexity.score;
  graph.stats.complexity_grade = complexity.grade;
  graph.stats.co_change_edges = gitStats.coChanges;
  graph.stats.authors = gitStats.authors;
  graph.surprises = surprises;
  graph.hotspots = hotspots;
  graph.complexity = complexity;

  // Write graph.json
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, 'graph.json');
  writeFileSync(outputPath, JSON.stringify(graph, null, 2), 'utf8');

  // Write graph.html — interactive visualization
  const htmlPath = join(outputDir, 'graph.html');
  writeFileSync(htmlPath, generateGraphHTML(graph, communities), 'utf8');

  // Write KG_REPORT.md
  const reportPath = join(outputDir, 'KG_REPORT.md');
  writeFileSync(reportPath, generateReport(graph, communities, degreeMap), 'utf8');

  console.log(`   Nodes: ${graph.stats.nodes} | Edges: ${graph.stats.edges}`);
  console.log(`   Source: ${graph.stats.source_files} | Tests: ${graph.stats.test_files}`);
  console.log(`   God nodes: ${graph.stats.god_nodes} | Communities: ${communities.length}`);
  console.log(`   Surprises: ${surprises.length} | Hotspots: ${hotspots.length} | Complexity: ${complexity.grade} (${complexity.score})`);
  console.log(`   Output: ${outputDir}/ (graph.json, graph.html, KG_REPORT.md)`);
}

/**
 * Recursively scan for source files.
 */
function scanFiles(dir, files = []) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      if (entry.name.startsWith('.')) continue;

      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        scanFiles(fullPath, files);
      } else if (entry.isFile()) {
        const ext = extname(entry.name);
        if (LANGUAGE_PATTERNS[ext]) {
          try {
            const content = readFileSync(fullPath, 'utf8');
            files.push({
              path: fullPath,
              lang: LANGUAGE_PATTERNS[ext].type,
              ext,
              lines: content.split('\n').length,
              content,
            });
          } catch (e) { /* skip unreadable files */ }
        }
      }
    }
  } catch (e) { /* skip unreadable dirs */ }
  return files;
}

/**
 * Extract import/require references from a source file.
 */
function extractImports(filePath, lang) {
  const ext = extname(filePath);
  const patterns = LANGUAGE_PATTERNS[ext]?.importRegex;
  if (!patterns) return [];

  const content = readFileSync(filePath, 'utf8');
  const imports = [];

  for (const regex of patterns) {
    // Reset regex state
    const re = new RegExp(regex.source, regex.flags);
    let match;
    while ((match = re.exec(content)) !== null) {
      const imp = match[1];
      if (imp && !imp.startsWith('.') && lang === 'go') continue; // skip stdlib Go imports
      if (imp) imports.push(imp);
    }
  }

  return imports;
}

/**
 * Resolve an import string to an actual file path.
 */
function resolveImport(repoPath, sourceFile, importStr, lang) {
  const sourceDir = dirname(sourceFile);

  // Skip external/npm packages (no relative path)
  if (lang === 'js' || lang === 'ts') {
    if (!importStr.startsWith('.') && !importStr.startsWith('/')) return null;
  }

  // Try direct resolution
  const candidates = [];

  if (lang === 'js' || lang === 'ts') {
    const base = join(sourceDir, importStr);
    candidates.push(
      base,
      base + '.js', base + '.ts', base + '.tsx', base + '.jsx', base + '.mjs',
      join(base, 'index.js'), join(base, 'index.ts'), join(base, 'index.tsx'),
    );
  } else if (lang === 'py') {
    const parts = importStr.replace(/\./g, '/');
    candidates.push(
      join(repoPath, parts + '.py'),
      join(repoPath, parts, '__init__.py'),
      join(sourceDir, parts + '.py'),
    );
  } else if (lang === 'rb') {
    if (importStr.startsWith('.') || importStr.startsWith('/')) {
      candidates.push(join(sourceDir, importStr + '.rb'));
    } else {
      candidates.push(join(repoPath, 'lib', importStr + '.rb'));
    }
  } else if (lang === 'rs') {
    candidates.push(
      join(sourceDir, importStr.replace(/::/g, '/') + '.rs'),
      join(sourceDir, importStr.replace(/::/g, '/'), 'mod.rs'),
    );
  } else if (lang === 'java') {
    const parts = importStr.replace(/\./g, '/');
    candidates.push(join(repoPath, 'src', 'main', 'java', parts + '.java'));
  }

  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

/**
 * Generate an interactive HTML visualization of the knowledge graph.
 */
function generateGraphHTML(graph, communities) {
  const palette = [
    '#4285f4', '#ea4335', '#fbbc04', '#34a853', '#ff6d01',
    '#46bdc6', '#7baaf7', '#f07b72', '#fcd04f', '#67c27c',
    '#ff9e40', '#78d9e0', '#a1c4fd', '#f5a3a0', '#fde68a',
  ];
  const memberToColor = new Map();
  for (let i = 0; i < communities.length; i++) {
    const color = palette[i % palette.length];
    for (const m of communities[i].members) {
      memberToColor.set(m, color);
    }
  }

  const nodesWithColor = graph.nodes.map(n => ({
    id: n.path,
    type: n.type,
    isTest: n.isTest,
    color: memberToColor.get(n.path) || '#999',
    radius: Math.max(4, Math.min(20, (n.degree || 0) * 2)),
    degree: n.degree || 0,
    lines: n.lines,
    god_node: n.god_node,
  }));

  const edgesSimple = graph.edges.map(e => ({ source: e.source, target: e.target, type: e.type || '' }));

  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>Knowledge Graph — ${graph.repo}</title>
<style>
  body { margin: 0; font-family: system-ui, sans-serif; background: #1a1a2e; color: #eee; }
  #info { position: fixed; top: 10px; left: 10px; background: rgba(0,0,0,0.7); padding: 12px; border-radius: 8px; font-size: 13px; z-index: 10; max-width: 300px; }
  canvas { display: block; }
  #tooltip { position: fixed; display: none; background: rgba(0,0,0,0.9); color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 12px; pointer-events: none; z-index: 20; max-width: 400px; }
  #legend { position: fixed; bottom: 10px; left: 10px; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 8px; font-size: 11px; z-index: 10; }
  .legend-item { display: flex; align-items: center; gap: 6px; margin: 2px 0; }
  .legend-dot { width: 10px; height: 10px; border-radius: 50%; }
</style>
</head><body>
<div id="info">
  <strong>Knowledge Graph — ${graph.repo}</strong><br>
  Nodes: ${graph.stats.nodes} | Edges: ${graph.stats.edges}<br>
  Source: ${graph.stats.source_files} | Tests: ${graph.stats.test_files}<br>
  God nodes: ${graph.stats.god_nodes} | Communities: ${communities.length}<br>
  <small>Hover for details. Node size = degree.</small>
</div>
<div id="tooltip"></div>
<div id="legend">
  <strong>Communities</strong>
  ${communities.slice(0, 10).map((c, i) => `<div class="legend-item"><div class="legend-dot" style="background:${palette[i % palette.length]}"></div>${c.id} (${c.size})</div>`).join('\n  ')}
</div>
<canvas id="canvas"></canvas>
<script>
const nodes = ${JSON.stringify(nodesWithColor)};
const edges = ${JSON.stringify(edgesSimple)};

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('tooltip');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => { canvas.width = innerWidth; canvas.height = innerHeight; draw(); });

const positions = new Map();
nodes.forEach(n => {
  positions.set(n.id, {
    x: Math.random() * canvas.width * 0.8 + canvas.width * 0.1,
    y: Math.random() * canvas.height * 0.8 + canvas.height * 0.1,
    vx: 0, vy: 0
  });
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 0.5;
  for (const e of edges) {
    const s = positions.get(e.source), t = positions.get(e.target);
    if (s && t) { ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y); ctx.stroke(); }
  }
  for (const n of nodes) {
    const p = positions.get(n.id);
    if (!p) continue;
    ctx.fillStyle = n.color;
    ctx.globalAlpha = n.god_node ? 1 : 0.8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, n.radius || 4, 0, Math.PI * 2);
    ctx.fill();
    if (n.god_node) { ctx.strokeStyle = '#ff0'; ctx.lineWidth = 2; ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
}

function simulate() {
  const posArr = Array.from(positions.entries());
  for (let i = 0; i < 120; i++) {
    for (let a = 0; a < posArr.length; a++) {
      for (let b = a + 1; b < posArr.length; b++) {
        const [, pa] = posArr[a], [, pb] = posArr[b];
        const dx = pa.x - pb.x, dy = pa.y - pb.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 500 / (dist * dist);
        pa.vx += (dx/dist)*force; pa.vy += (dy/dist)*force;
        pb.vx -= (dx/dist)*force; pb.vy -= (dy/dist)*force;
      }
    }
    for (const e of edges) {
      const pa = positions.get(e.source), pb = positions.get(e.target);
      if (!pa || !pb) continue;
      const dx = pb.x - pa.x, dy = pb.y - pa.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = dist * 0.01;
      pa.vx += (dx/dist)*force; pa.vy += (dy/dist)*force;
      pb.vx -= (dx/dist)*force; pb.vy -= (dy/dist)*force;
    }
    for (const [, p] of positions) {
      p.x += p.vx*0.1; p.y += p.vy*0.1;
      p.vx *= 0.9; p.vy *= 0.9;
      p.x = Math.max(50, Math.min(canvas.width-50, p.x));
      p.y = Math.max(50, Math.min(canvas.height-50, p.y));
    }
  }
  draw();
}

simulate();

canvas.addEventListener('mousemove', (e) => {
  for (const n of nodes) {
    const p = positions.get(n.id);
    if (!p) continue;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    if (Math.sqrt(dx*dx + dy*dy) < (n.radius||4) + 3) {
      tooltip.style.display = 'block';
      tooltip.style.left = (e.clientX+15)+'px';
      tooltip.style.top = (e.clientY+15)+'px';
      tooltip.innerHTML = '<strong>'+n.id+'</strong><br>Type: '+n.type+'<br>Lines: '+n.lines+'<br>Degree: '+n.degree+(n.god_node?' ⚠️ GOD NODE':'')+(n.isTest?' 🧪 Test':'');
      return;
    }
  }
  tooltip.style.display = 'none';
});
</script></body></html>`;
}

/**
 * Generate KG_REPORT.md from graph analysis.
 */
function generateReport(graph, communities, degreeMap) {
  const lines = [];
  const date = new Date().toISOString().split('T')[0];

  lines.push(`# Knowledge Graph Report — ${graph.repo}`);
  lines.push('');
  lines.push(`Generated: ${date}`);
  lines.push(`Nodes: ${graph.stats.nodes} | Edges: ${graph.stats.edges} | Communities: ${communities.length}`);
  lines.push('');

  // God Nodes
  const godNodes = graph.nodes.filter(n => n.god_node).sort((a, b) => b.degree - a.degree);
  lines.push('## God Nodes (degree > 30)');
  lines.push('');
  if (godNodes.length > 0) {
    lines.push('| File | Type | Degree | Lines | Tests |');
    lines.push('|---|---|---|---|---|');
    for (const n of godNodes.slice(0, 15)) {
      const testCount = graph.edges.filter(e => e.target === n.path && e.type === 'tests').length;
      lines.push(`| ${n.path} | ${n.type} | ${n.degree} | ${n.lines} | ${testCount} |`);
    }
  } else {
    lines.push('No god nodes detected (all files have degree <= 30).');
  }
  lines.push('');

  // Communities
  lines.push('## Communities (by directory)');
  lines.push('');
  const sortedCommunities = [...communities].sort((a, b) => b.size - a.size);
  lines.push('| Directory | Files | Key File | Tests |');
  lines.push('|---|---|---|---|');
  for (const c of sortedCommunities.slice(0, 20)) {
    const tests = c.members.filter(m => graph.nodes.find(n => n.path === m)?.isTest).length;
    lines.push(`| ${c.id} | ${c.size} | ${c.keyNode} | ${tests} |`);
  }
  lines.push('');

  // Untested files
  const sourceNodes = graph.nodes.filter(n => !n.isTest);
  const testedFiles = new Set(graph.edges.filter(e => e.type === 'tests').map(e => e.target));
  const untested = sourceNodes.filter(n => !testedFiles.has(n.path));
  lines.push('## Untested Source Files');
  lines.push('');
  lines.push(`${untested.length} of ${sourceNodes.length} source files have no direct test coverage.`);
  lines.push('');
  if (untested.length > 0) {
    lines.push('| File | Type | Lines | Degree |');
    lines.push('|---|---|---|---|');
    for (const n of untested.sort((a, b) => b.degree - a.degree).slice(0, 20)) {
      lines.push(`| ${n.path} | ${n.type} | ${n.lines} | ${n.degree} |`);
    }
    if (untested.length > 20) lines.push(`| ... | | | | _(${untested.length - 20} more)_ |`);
  }
  lines.push('');

  // High-degree files (top 10 by degree, not necessarily god nodes)
  lines.push('## Highest Coupling (top 10 by degree)');
  lines.push('');
  const topDegree = [...graph.nodes].sort((a, b) => b.degree - a.degree).slice(0, 10);
  lines.push('| File | Degree | In | Out | Tests |');
  lines.push('|---|---|---|---|---|');
  for (const n of topDegree) {
    const inDeg = graph.edges.filter(e => e.target === n.path).length;
    const outDeg = graph.edges.filter(e => e.source === n.path).length;
    const testCount = graph.edges.filter(e => e.target === n.path && e.type === 'tests').length;
    lines.push(`| ${n.path} | ${n.degree} | ${inDeg} | ${outDeg} | ${testCount} |`);
  }
  lines.push('');

  // Git History / Co-Change
  if (graph.stats.co_change_edges > 0) {
    lines.push('## Git History Analysis');
    lines.push('');
    lines.push(`Authors: ${graph.stats.authors || 'N/A'} | Co-change edges: ${graph.stats.co_change_edges}`);
    lines.push('');
    const coChangeEdges = graph.edges.filter(e => e.type === 'co-change').sort((a, b) => (b.weight || 0) - (a.weight || 0));
    if (coChangeEdges.length > 0) {
      lines.push('| File A | File B | Co-changed (commits) |');
      lines.push('|---|---|---|');
      for (const e of coChangeEdges.slice(0, 15)) {
        lines.push(`| ${e.source} | ${e.target} | ${e.weight || 0} |`);
      }
    }
    lines.push('');
  }

  // Surprise Edges
  if (graph.surprises && graph.surprises.length > 0) {
    lines.push('## Surprise Edges (cross-community coupling)');
    lines.push('');
    lines.push('| Source | Target | Why |');
    lines.push('|---|---|---|');
    for (const s of graph.surprises.slice(0, 15)) {
      lines.push(`| ${s.source} | ${s.target} | ${s.reason} |`);
    }
    lines.push('');
  }

  // Hotspots
  if (graph.hotspots && graph.hotspots.length > 0) {
    lines.push('## Hotspots (high coupling + high churn)');
    lines.push('');
    lines.push('| File | Degree | Churn | Risk |');
    lines.push('|---|---|---|---|');
    for (const h of graph.hotspots.slice(0, 15)) {
      lines.push(`| ${h.path} | ${h.degree} | ${h.churn} | ${h.risk} |`);
    }
    lines.push('');
  }

  // Complexity Score
  if (graph.complexity) {
    lines.push('## Complexity Score');
    lines.push('');
    lines.push(`**Grade: ${graph.complexity.grade}** (score: ${graph.complexity.score})`);
    lines.push('');
    lines.push('| Factor | Score |');
    lines.push('|---|---|');
    for (const [factor, score] of Object.entries(graph.complexity.factors)) {
      lines.push(`| ${factor} | ${score} |`);
    }
    lines.push('');
  }

  lines.push('## Summary for Agents');
  lines.push('');
  lines.push('When implementing changes in this repo:');
  lines.push(`- **${godNodes.length} god nodes** require extra review and user approval before modification`);
  lines.push(`- **${untested.length}/${sourceNodes.length}** source files lack test coverage — add tests before modifying`);
  lines.push(`- **${communities.length} communities** — cross-community changes have higher blast radius`);
  if (graph.surprises?.length > 0) lines.push(`- **${graph.surprises.length} surprise edges** — unexpected cross-module coupling detected`);
  if (graph.hotspots?.length > 0) lines.push(`- **${graph.hotspots.length} hotspots** — frequently-changed, highly-coupled files need extra care`);
  if (graph.complexity) lines.push(`- **Complexity grade: ${graph.complexity.grade}** — ${graph.complexity.grade === 'A' ? 'well-structured' : graph.complexity.grade === 'B' ? 'manageable' : 'needs attention'}`);
  lines.push(`- Read \`knowledge-graph-out/graph.json\` for impact analysis before any change`);
  lines.push('');

  return lines.join('\n');
}

main();
