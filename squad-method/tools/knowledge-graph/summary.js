#!/usr/bin/env node

/**
 * SQUAD-Public Knowledge Graph Summary
 *
 * Reads graph.json and produces a human-readable summary for agents.
 * Used by /refresh, /dev-task, /review-pr and other skills.
 *
 * Usage:
 *   node summary.js <repo-path>          — per-repo summary
 *   node summary.js --root <r1> <r2> ... — cross-repo summary
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node summary.js <repo-path> | --root <r1> <r2> ...');
    process.exit(1);
  }

  if (args[0] === '--root') {
    crossRepoSummary(args.slice(1).map(a => resolve(a)));
  } else {
    repoSummary(resolve(args[0]));
  }
}

/**
 * Per-repo summary.
 */
function repoSummary(repoPath) {
  const graphPath = join(repoPath, 'knowledge-graph-out', 'graph.json');
  if (!existsSync(graphPath)) {
    console.log(`No knowledge graph found for ${basename(repoPath)}.`);
    console.log(`Run: node squad-method/tools/knowledge-graph/build.js ${repoPath}`);
    return;
  }

  const graph = JSON.parse(readFileSync(graphPath, 'utf8'));

  console.log(`\n📊 Knowledge Graph — ${graph.repo}`);
  console.log(`   Generated: ${graph.generated}`);
  console.log(`   Nodes: ${graph.stats.nodes} | Edges: ${graph.stats.edges}`);
  console.log(`   Source: ${graph.stats.source_files} | Tests: ${graph.stats.test_files}`);
  console.log(`   God nodes: ${graph.stats.god_nodes}`);
  if (graph.stats.complexity_grade) {
    console.log(`   Complexity: ${graph.stats.complexity_grade} (${graph.stats.complexity_score})`);
  }
  if (graph.stats.co_change_edges) {
    console.log(`   Co-change edges: ${graph.stats.co_change_edges} | Authors: ${graph.stats.authors || 'N/A'}`);
  }

  // Top god nodes
  const godNodes = graph.nodes
    .filter(n => n.god_node)
    .sort((a, b) => b.degree - a.degree)
    .slice(0, 10);

  if (godNodes.length > 0) {
    console.log(`\n   ⚠️  God Nodes (degree > 30):`);
    for (const node of godNodes) {
      const testEdges = graph.edges.filter(e => e.target === node.path && e.type === 'tests').length;
      console.log(`     ${node.path}: degree=${node.degree}, tests=${testEdges}`);
    }
  }

  // Untested source files
  const sourceFiles = graph.nodes.filter(n => !n.isTest);
  const testedFiles = new Set(graph.edges.filter(e => e.type === 'tests').map(e => e.target));
  const untested = sourceFiles.filter(n => !testedFiles.has(n.path));

  if (untested.length > 0) {
    console.log(`\n   📋 Untested source files: ${untested.length}/${sourceFiles.length}`);
    for (const node of untested.slice(0, 5)) {
      console.log(`     ${node.path} (${node.lines} lines)`);
    }
    if (untested.length > 5) {
      console.log(`     ... and ${untested.length - 5} more`);
    }
  }

  // Communities — use graph-detected communities if available, else fall back to directory
  if (graph.communities && graph.communities.length > 0) {
    console.log(`\n   📁 Communities (label propagation): ${graph.communities.length}`);
    const sorted = [...graph.communities].sort((a, b) => b.size - a.size);
    for (const c of sorted.slice(0, 8)) {
      const cohesion = c.cohesion !== undefined ? ` (cohesion: ${c.cohesion})` : '';
      console.log(`     ${c.id}: ${c.size} files, key: ${c.keyNode}${cohesion}`);
    }
  } else {
    const communities = new Map();
    for (const node of graph.nodes) {
      const dir = node.path.split('/').slice(0, 2).join('/') || '.';
      if (!communities.has(dir)) communities.set(dir, []);
      communities.get(dir).push(node);
    }
    if (communities.size > 1) {
      console.log(`\n   📁 Communities (by directory):`);
      const sorted = [...communities.entries()].sort((a, b) => b[1].length - a[1].length);
      for (const [dir, nodes] of sorted.slice(0, 8)) {
        const tests = nodes.filter(n => n.isTest).length;
        console.log(`     ${dir}: ${nodes.length} files (${tests} tests)`);
      }
    }
  }

  // Hotspots
  if (graph.hotspots && graph.hotspots.length > 0) {
    console.log(`\n   🔥 Hotspots (high coupling + high churn): ${graph.hotspots.length}`);
    for (const h of graph.hotspots.slice(0, 5)) {
      console.log(`     ${h.path}: degree=${h.degree}, churn=${h.churn}, risk=${h.risk}`);
    }
  }

  // Surprise edges
  if (graph.surprises && graph.surprises.length > 0) {
    console.log(`\n   ⚡ Surprise edges (cross-community coupling): ${graph.surprises.length}`);
    for (const s of graph.surprises.slice(0, 5)) {
      console.log(`     ${s.source} → ${s.target}: ${s.reason}`);
    }
  }
}

/**
 * Cross-repo summary.
 */
function crossRepoSummary(repoPaths) {
  console.log(`\n📊 Cross-Repo Knowledge Graph Summary`);
  console.log(`   Repos: ${repoPaths.length}`);

  const allGraphs = [];
  for (const repoPath of repoPaths) {
    const graphPath = join(repoPath, 'knowledge-graph-out', 'graph.json');
    if (existsSync(graphPath)) {
      const graph = JSON.parse(readFileSync(graphPath, 'utf8'));
      allGraphs.push({ repo: basename(repoPath), graph });
    } else {
      console.log(`   ⚠️  No graph: ${basename(repoPath)}`);
    }
  }

  if (allGraphs.length === 0) {
    console.log('   No knowledge graphs found. Run build.js on each repo first.');
    return;
  }

  let totalNodes = 0, totalEdges = 0, totalGodNodes = 0, totalHotspots = 0, totalSurprises = 0;
  for (const { repo, graph } of allGraphs) {
    totalNodes += graph.stats.nodes;
    totalEdges += graph.stats.edges;
    totalGodNodes += graph.stats.god_nodes;
    totalHotspots += graph.stats.hotspots || 0;
    totalSurprises += graph.stats.surprises || 0;
    const grade = graph.stats.complexity_grade ? ` | grade: ${graph.stats.complexity_grade}` : '';
    console.log(`\n   ${repo}: ${graph.stats.nodes} nodes, ${graph.stats.edges} edges, ${graph.stats.god_nodes} god nodes${grade}`);
  }

  console.log(`\n   Total: ${totalNodes} nodes, ${totalEdges} edges, ${totalGodNodes} god nodes, ${totalHotspots} hotspots, ${totalSurprises} surprises`);
}

main();
