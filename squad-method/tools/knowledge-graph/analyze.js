#!/usr/bin/env node

/**
 * SQUAD-Public Knowledge Graph — Analysis
 *
 * Graph analysis: surprise edges, hotspots, and complexity scoring.
 * Ported from SQUAD Internal — adapted for Public's graph format.
 */

/**
 * Find surprise edges — connections between nodes in different communities
 * that indicate unexpected cross-module coupling.
 * @param {object} graph - Graph with nodes[] and edges[]
 * @param {Array} communities - Community detection results
 * @returns {Array<{source: string, target: string, reason: string}>}
 */
export function findSurprises(graph, communities) {
  const surprises = [];

  // Build community membership map
  const memberOf = new Map();
  for (const c of communities) {
    for (const m of c.members) {
      memberOf.set(m, c.id);
    }
  }

  // Find edges that cross community boundaries
  for (const edge of graph.edges) {
    if (edge.type === 'co-change') continue; // co-change edges are expected to cross

    const srcCom = memberOf.get(edge.source);
    const tgtCom = memberOf.get(edge.target);

    if (srcCom && tgtCom && srcCom !== tgtCom) {
      const srcNode = graph.nodes.find(n => n.path === edge.source);
      const tgtNode = graph.nodes.find(n => n.path === edge.target);

      // Flag cross-community imports as surprises
      surprises.push({
        source: edge.source,
        target: edge.target,
        reason: `Cross-community: ${srcCom} → ${tgtCom} (${srcNode?.type || '?'} → ${tgtNode?.type || '?'})`,
      });
    }
  }

  // Limit to top surprises by sorting by degree impact
  return surprises.slice(0, 20);
}

/**
 * Identify hotspot files — files with unusually high coupling or churn.
 * @param {object} graph - Graph with nodes[] and edges[]
 * @returns {Array<{path: string, degree: number, churn: number, risk: string}>}
 */
export function findHotspots(graph) {
  if (graph.nodes.length === 0) return [];

  // Calculate mean and stddev of degree
  const degrees = graph.nodes.map(n => n.degree || 0);
  const mean = degrees.reduce((s, d) => s + d, 0) / degrees.length;
  const variance = degrees.reduce((s, d) => s + (d - mean) ** 2, 0) / degrees.length;
  const stddev = Math.sqrt(variance);
  const threshold = mean + 2 * stddev; // 2 sigma above mean

  const hotspots = [];
  for (const node of graph.nodes) {
    const degree = node.degree || 0;
    const churn = node.churn || 0;

    let risk = 'LOW';
    if (degree > threshold && churn > 10) risk = 'CRITICAL'; // high coupling + high churn
    else if (degree > threshold) risk = 'HIGH'; // high coupling only
    else if (churn > 20) risk = 'MEDIUM'; // high churn only
    else continue; // not a hotspot

    hotspots.push({ path: node.path, degree, churn, risk });
  }

  return hotspots.sort((a, b) => {
    const riskOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return (riskOrder[a.risk] || 3) - (riskOrder[b.risk] || 3) || b.degree - a.degree;
  });
}

/**
 * Compute complexity score for the overall codebase.
 * Higher score = harder to maintain. Used for agent effort decisions.
 * @param {object} graph
 * @param {Array} communities
 * @param {Array} surprises
 * @returns {{ score: number, grade: string, factors: object }}
 */
export function computeComplexity(graph, communities, surprises) {
  const nodeCount = graph.nodes.length;
  const edgeCount = graph.edges.length;
  const godNodeCount = graph.nodes.filter(n => n.god_node).length;
  const communityCount = communities.length;
  const surpriseCount = surprises.length;
  const hotspotCount = graph.nodes.filter(n => n.hotspot).length;

  // Weighted scoring
  const factors = {
    size: Math.min(nodeCount / 100, 5),           // up to 5 points for size
    coupling: Math.min(edgeCount / nodeCount, 5),  // density ratio
    godNodes: godNodeCount * 2,                     // 2 points per god node
    surprises: Math.min(surpriseCount * 0.5, 5),   // cross-module coupling
    hotspots: Math.min(hotspotCount, 5),            // churn hotspots
    fragmentation: communityCount > 20 ? 3 : communityCount > 10 ? 2 : communityCount > 5 ? 1 : 0,
  };

  const score = Math.round(
    Object.values(factors).reduce((s, v) => s + v, 0) * 10
  ) / 10;

  let grade = 'A'; // 0-5
  if (score > 20) grade = 'F';
  else if (score > 15) grade = 'D';
  else if (score > 10) grade = 'C';
  else if (score > 5) grade = 'B';

  return { score, grade, factors };
}
