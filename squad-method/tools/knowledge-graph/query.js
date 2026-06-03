/**
 * Graph Query API for SQUAD agents.
 * Provides typed query functions over graph.json so agents don't need to
 * parse raw JSON manually.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Load graph.json for a repo.
 * @param {string} repoPath
 * @returns {object|null} graph or null if not found
 */
export function loadGraph(repoPath) {
  const graphPath = join(repoPath, 'knowledge-graph-out', 'graph.json');
  if (!existsSync(graphPath)) return null;
  try {
    return JSON.parse(readFileSync(graphPath, 'utf8'));
  } catch (e) {
    return null;
  }
}

/**
 * Get all files that import (directly or indirectly) a given file.
 * @param {object} graph
 * @param {string} filePath - relative path
 * @returns {string[]}
 */
export function reverseDeps(graph, filePath) {
  return (graph.edges || [])
    .filter(e => e.target === filePath)
    .map(e => e.source);
}

/**
 * Get all god nodes (degree > threshold).
 * @param {object} graph
 * @param {number} [threshold=30]
 * @returns {Array<{path: string, degree: number}>}
 */
export function godNodes(graph, threshold = 30) {
  return (graph.nodes || [])
    .filter(n => (n.degree || 0) > threshold)
    .map(n => ({ path: n.path, degree: n.degree || 0 }))
    .sort((a, b) => b.degree - a.degree);
}

/**
 * Get all source files with no test coverage.
 * @param {object} graph
 * @returns {string[]}
 */
export function untestedFiles(graph) {
  const testedIds = new Set(
    (graph.edges || []).filter(e => e.type === 'tests').map(e => e.target)
  );
  return (graph.nodes || [])
    .filter(n => !n.isTest && !testedIds.has(n.path))
    .map(n => n.path);
}

/**
 * Get the community a file belongs to.
 * @param {object} graph
 * @param {string} filePath
 * @returns {string|null} community id or null
 */
export function community(graph, filePath) {
  const communities = graph.communities || [];
  for (const c of communities) {
    if ((c.members || []).includes(filePath)) return c.id || c.name;
  }
  return null;
}

/**
 * Get all files within N hops of a given file (ripple analysis).
 * @param {object} graph
 * @param {string} filePath
 * @param {number} [hops=2]
 * @returns {string[]}
 */
export function ripple(graph, filePath, hops = 2) {
  const visited = new Set([filePath]);
  let frontier = [filePath];

  for (let i = 0; i < hops; i++) {
    const next = [];
    for (const f of frontier) {
      for (const e of (graph.edges || [])) {
        if ((e.source === f || e.target === f) && !visited.has(e.source === f ? e.target : e.source)) {
          const neighbor = e.source === f ? e.target : e.source;
          visited.add(neighbor);
          next.push(neighbor);
        }
      }
    }
    frontier = next;
    if (frontier.length === 0) break;
  }

  visited.delete(filePath);
  return [...visited];
}

/**
 * Find the shortest path between two files.
 * @param {object} graph
 * @param {string} from
 * @param {string} to
 * @returns {string[]|null} path array or null if not reachable
 */
export function shortestPath(graph, from, to) {
  if (from === to) return [from];

  const queue = [[from]];
  const visited = new Set([from]);

  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];

    for (const e of (graph.edges || [])) {
      const neighbor = e.source === current ? e.target : e.source;
      if (!visited.has(neighbor)) {
        const newPath = [...path, neighbor];
        if (neighbor === to) return newPath;
        visited.add(neighbor);
        queue.push(newPath);
      }
    }
  }

  return null;
}

/**
 * Get the top hotspot files (high degree + high churn).
 * @param {object} graph
 * @param {number} [limit=10]
 * @returns {Array<{path: string, degree: number, churn: number}>}
 */
export function hotspots(graph, limit = 10) {
  return (graph.hotspots || [])
    .slice(0, limit)
    .map(h => ({ path: h.path, degree: h.degree || 0, churn: h.churn || 0, risk: h.risk }));
}

/**
 * Get a summary of graph stats for display.
 * @param {object} graph
 * @returns {object}
 */
export function summary(graph) {
  return {
    nodes: graph.stats?.nodes || 0,
    edges: graph.stats?.edges || 0,
    source: graph.stats?.source_files || 0,
    tests: graph.stats?.test_files || 0,
    godNodes: graph.stats?.god_nodes || 0,
    communities: (graph.communities || []).length,
    complexityGrade: graph.stats?.complexity_grade || '?',
  };
}
