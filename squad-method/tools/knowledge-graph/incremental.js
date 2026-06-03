/**
 * Incremental Knowledge Graph Updater.
 * Updates only affected nodes/edges instead of full rebuild for small diffs.
 * Falls back to full rebuild if >30% of files changed.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const FULL_REBUILD_THRESHOLD = 0.30; // 30% files changed → full rebuild

/**
 * Determine whether incremental update is feasible and return changed files.
 * @param {string} repoPath
 * @returns {{ canIncremental: boolean, changedFiles: string[], reason: string }}
 */
export function analyzeChanges(repoPath) {
  try {
    const output = execSync('git diff --name-only HEAD~1', {
      cwd: repoPath,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000,
    }).toString().trim();

    const changedFiles = output ? output.split('\n').filter(Boolean) : [];

    // Load existing graph to check ratio
    const graphPath = join(repoPath, 'knowledge-graph-out', 'graph.json');
    if (!existsSync(graphPath)) {
      return { canIncremental: false, changedFiles, reason: 'no existing graph' };
    }

    const graph = JSON.parse(readFileSync(graphPath, 'utf8'));
    const totalNodes = (graph.nodes || []).length;

    if (totalNodes === 0) {
      return { canIncremental: false, changedFiles, reason: 'empty graph' };
    }

    const changeRatio = changedFiles.length / totalNodes;
    if (changeRatio > FULL_REBUILD_THRESHOLD) {
      return {
        canIncremental: false,
        changedFiles,
        reason: `${Math.round(changeRatio * 100)}% files changed (threshold: ${FULL_REBUILD_THRESHOLD * 100}%)`,
      };
    }

    return { canIncremental: true, changedFiles, reason: 'incremental feasible' };
  } catch (e) {
    return { canIncremental: false, changedFiles: [], reason: `git error: ${e.message}` };
  }
}

/**
 * Apply incremental updates to an existing graph.json for a set of changed files.
 * Only updates edges for changed files; recalculates degrees for affected nodes.
 * @param {object} graph - existing graph.json content (mutated in place)
 * @param {string[]} changedFiles - relative paths of changed files
 * @param {object} newNodeData - Map<path, {imports: string[], isTest: boolean}> for changed files
 * @returns {object} updated graph
 */
export function applyIncrementalUpdate(graph, changedFiles, newNodeData) {
  const changedSet = new Set(changedFiles);

  // Remove old edges for changed files
  graph.edges = (graph.edges || []).filter(e =>
    !changedSet.has(e.source) && !changedSet.has(e.target)
  );

  // Update/add nodes for changed files
  const nodeMap = new Map((graph.nodes || []).map(n => [n.path, n]));
  for (const [path, data] of Object.entries(newNodeData || {})) {
    const existing = nodeMap.get(path) || { path };
    nodeMap.set(path, { ...existing, ...data });

    // Add new edges
    for (const imp of (data.imports || [])) {
      graph.edges.push({
        source: path,
        target: imp,
        type: data.isTest ? 'tests' : 'imports',
      });
    }
  }

  graph.nodes = [...nodeMap.values()];

  // Recompute degrees
  const degreeMap = new Map();
  for (const e of graph.edges) {
    degreeMap.set(e.source, (degreeMap.get(e.source) || 0) + 1);
    degreeMap.set(e.target, (degreeMap.get(e.target) || 0) + 1);
  }
  for (const node of graph.nodes) {
    node.degree = degreeMap.get(node.path) || 0;
    node.god_node = node.degree > 30;
  }

  // Update stats
  graph.stats = {
    ...graph.stats,
    nodes: graph.nodes.length,
    edges: graph.edges.length,
    source_files: graph.nodes.filter(n => !n.isTest).length,
    test_files: graph.nodes.filter(n => n.isTest).length,
    god_nodes: graph.nodes.filter(n => n.god_node).length,
    incremental_update: new Date().toISOString(),
    files_updated: changedFiles.length,
  };

  return graph;
}

/**
 * Save updated graph back to disk.
 */
export function saveGraph(repoPath, graph) {
  const graphPath = join(repoPath, 'knowledge-graph-out', 'graph.json');
  writeFileSync(graphPath, JSON.stringify(graph, null, 2), 'utf8');
}
