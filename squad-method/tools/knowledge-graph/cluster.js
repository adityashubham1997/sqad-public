#!/usr/bin/env node

/**
 * SQUAD-Public Knowledge Graph — Community Detection
 *
 * Groups tightly-connected nodes into communities using label propagation.
 * Replaces the simple directory-based grouping with a graph-aware algorithm.
 *
 * Ported from SQUAD Internal — adapted for Public's graph format.
 */

/**
 * Detect communities using label propagation.
 * @param {object} graph - Graph with nodes[] and edges[]
 * @param {object} options
 * @returns {Array<{id: string, members: string[], keyNode: string, size: number, cohesion: number}>}
 */
export function detectCommunities(graph, options = {}) {
  const maxIterations = options.maxIterations || 50;
  const nodes = graph.nodes;
  const edges = graph.edges;

  if (nodes.length === 0) return [];

  // Build adjacency list
  const adj = new Map();
  for (const node of nodes) {
    adj.set(node.path, []);
  }
  for (const edge of edges) {
    if (adj.has(edge.source)) adj.get(edge.source).push(edge.target);
    if (adj.has(edge.target)) adj.get(edge.target).push(edge.source);
  }

  // Initialize: each node in its own community
  const labels = new Map();
  nodes.forEach((n, i) => labels.set(n.path, i));

  // Label propagation iterations
  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;

    // Shuffle nodes for non-deterministic ordering
    const shuffled = [...nodes].sort(() => Math.random() - 0.5);

    for (const node of shuffled) {
      const neighbors = adj.get(node.path) || [];
      if (neighbors.length === 0) continue;

      // Count neighbor labels (weighted by edge type)
      const labelCounts = new Map();
      for (const nb of neighbors) {
        const lbl = labels.get(nb);
        if (lbl !== undefined) {
          // Give co-change edges extra weight (they indicate real coupling)
          const edgeToNb = edges.find(e =>
            (e.source === node.path && e.target === nb) ||
            (e.target === node.path && e.source === nb)
          );
          const weight = edgeToNb?.type === 'co-change' ? 2 : 1;
          labelCounts.set(lbl, (labelCounts.get(lbl) || 0) + weight);
        }
      }

      // Pick most common label
      let maxCount = 0;
      let bestLabel = labels.get(node.path);
      for (const [lbl, count] of labelCounts.entries()) {
        if (count > maxCount) {
          maxCount = count;
          bestLabel = lbl;
        }
      }

      if (bestLabel !== labels.get(node.path)) {
        labels.set(node.path, bestLabel);
        changed = true;
      }
    }

    if (!changed) break; // Converged
  }

  // Group by label
  const groups = new Map();
  for (const [path, label] of labels.entries()) {
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(path);
  }

  // Build community objects
  const communities = [];
  for (const [, members] of groups.entries()) {
    if (members.length === 0) continue;

    // Find the key node (highest degree in community)
    const memberSet = new Set(members);
    let keyNode = members[0];
    let maxDegree = 0;
    for (const m of members) {
      const degree = (adj.get(m) || []).filter(n => memberSet.has(n)).length;
      if (degree > maxDegree) {
        maxDegree = degree;
        keyNode = m;
      }
    }

    // Compute cohesion: ratio of internal edges to possible edges
    let internalEdges = 0;
    for (const edge of edges) {
      if (memberSet.has(edge.source) && memberSet.has(edge.target)) {
        internalEdges++;
      }
    }
    const possibleEdges = members.length * (members.length - 1) / 2;
    const cohesion = possibleEdges > 0 ? Math.round((internalEdges / possibleEdges) * 100) / 100 : 0;

    // Derive community name from common directory prefix
    const dirs = members.map(m => m.split('/').slice(0, 2).join('/'));
    const dirCounts = new Map();
    for (const d of dirs) dirCounts.set(d, (dirCounts.get(d) || 0) + 1);
    const topDir = [...dirCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '.';

    communities.push({
      id: topDir,
      size: members.length,
      keyNode,
      members,
      cohesion,
    });
  }

  return communities.sort((a, b) => b.size - a.size);
}
