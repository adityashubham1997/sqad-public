/**
 * Context Prioritization Engine for SQUAD dev-task.
 * Given a task description + graph.json, ranks files by relevance to the task.
 * Agents load high-relevance files first, skip low-relevance ones.
 */

/**
 * Rank files by relevance to a task description.
 * @param {string} taskDescription
 * @param {object} graph - graph.json content
 * @param {object} [options]
 * @param {number} [options.topN=20] - Return top N files
 * @returns {Array<{path: string, score: number, reasons: string[]}>}
 */
export function prioritize(taskDescription, graph, options = {}) {
  const { topN = 20 } = options;
  if (!graph || !graph.nodes) return [];

  const keywords = extractKeywords(taskDescription);
  const scores = new Map();
  const reasons = new Map();

  for (const node of graph.nodes) {
    if (!node.path) continue;
    let score = 0;
    const nodeReasons = [];

    // 1. Name/path keyword match (highest signal)
    const pathScore = keywordMatchScore(node.path, keywords);
    if (pathScore > 0) {
      score += pathScore * 10;
      nodeReasons.push(`keyword match (${pathScore.toFixed(1)})`);
    }

    // 2. Degree centrality (highly-connected files are likely relevant)
    const degreeBoost = Math.log2((node.degree || 0) + 1) * 2;
    if (degreeBoost > 0) score += degreeBoost;

    // 3. Test coverage gap (untested files need more attention)
    if (!node.hasTests && !node.isTest) {
      score += 3;
      nodeReasons.push('untested');
    }

    // 4. Not a test file itself
    if (node.isTest) score -= 2;

    if (score > 0) {
      scores.set(node.path, score);
      reasons.set(node.path, nodeReasons);
    }
  }

  // 5. Community proximity boost: boost neighbors of high-score files
  const topNodes = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path]) => path);

  for (const path of topNodes) {
    const neighbors = getNeighbors(graph, path, 2);
    for (const neighbor of neighbors) {
      if (!scores.has(neighbor)) {
        scores.set(neighbor, 0);
        reasons.set(neighbor, []);
      }
      scores.set(neighbor, scores.get(neighbor) + 2);
      reasons.get(neighbor).push('community proximity');
    }
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([path, score]) => ({
      path,
      score: Math.round(score * 100) / 100,
      reasons: reasons.get(path) || [],
    }));
}

/**
 * Extract keywords from a task description (simple tokenization).
 */
function extractKeywords(text) {
  const STOPWORDS = new Set(['the', 'a', 'an', 'is', 'it', 'to', 'of', 'in', 'for',
    'and', 'or', 'that', 'this', 'with', 'should', 'need', 'want', 'add', 'fix',
    'update', 'change', 'make', 'when', 'how', 'what', 'where', 'do', 'be', 'as']);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w))
    .flatMap(w => [w, ...camelSplit(w)]);
}

function camelSplit(word) {
  return word.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().split(' ');
}

function keywordMatchScore(path, keywords) {
  const normalPath = path.toLowerCase();
  const parts = normalPath.replace(/[/_.-]/g, ' ').split(' ');
  let score = 0;
  for (const kw of keywords) {
    if (normalPath.includes(kw)) score += 1;
    if (parts.some(p => p === kw)) score += 0.5; // exact segment match bonus
  }
  return score;
}

function getNeighbors(graph, filePath, maxHops) {
  const visited = new Set([filePath]);
  let frontier = [filePath];
  const result = [];

  for (let i = 0; i < maxHops; i++) {
    const next = [];
    for (const f of frontier) {
      for (const e of (graph.edges || [])) {
        const neighbor = e.source === f ? e.target : (e.target === f ? e.source : null);
        if (neighbor && !visited.has(neighbor)) {
          visited.add(neighbor);
          next.push(neighbor);
          result.push(neighbor);
        }
      }
    }
    frontier = next;
    if (!frontier.length) break;
  }

  return result;
}
