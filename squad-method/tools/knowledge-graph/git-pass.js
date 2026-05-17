#!/usr/bin/env node

/**
 * SQUAD-Public Knowledge Graph — Git Pass
 *
 * Pass 2: Enriches the graph with git history analysis.
 * Detects co-change patterns, hotspot files, and author coupling.
 *
 * Ported from SQUAD Internal — adapted for Public's graph format.
 */

import { execSync } from 'node:child_process';

/**
 * Run git pass on a repo: extract co-change patterns and enrich the graph.
 * @param {object} graph - Graph object with nodes[] and edges[]
 * @param {string} repoPath - Path to the git repo
 * @param {object} options
 * @returns {{ coChanges: number, hotspots: number, authors: number, churnFiles: number }}
 */
export function gitPass(graph, repoPath, options = {}) {
  const maxCommits = options.maxCommits || 500;
  const coChangeThreshold = options.coChangeThreshold || 3;
  const stats = { coChanges: 0, hotspots: 0, authors: 0, churnFiles: 0 };

  try {
    // Get recent commits with file lists
    const log = execSync(
      `git log --name-only --pretty=format:"---COMMIT---%H---%an" -n ${maxCommits}`,
      { cwd: repoPath, encoding: 'utf8', timeout: 30000 }
    );

    const commits = parseGitLog(log);
    const authorSet = new Set();
    const fileChangeCount = new Map(); // file -> number of commits touching it

    // Co-change detection: files that change together frequently
    const coChangeMap = new Map(); // "fileA::fileB" -> count

    for (const commit of commits) {
      authorSet.add(commit.author);
      const files = commit.files.filter(f => f && !f.startsWith('.'));

      // Track per-file change frequency (churn)
      for (const file of files) {
        fileChangeCount.set(file, (fileChangeCount.get(file) || 0) + 1);
      }

      // Track co-changes (pairs of files in same commit)
      for (let i = 0; i < files.length && i < 50; i++) { // cap pairs to avoid O(n^2) on huge commits
        for (let j = i + 1; j < files.length && j < 50; j++) {
          const pair = [files[i], files[j]].sort().join('::');
          coChangeMap.set(pair, (coChangeMap.get(pair) || 0) + 1);
        }
      }
    }

    // Build a node path lookup
    const nodePathSet = new Set(graph.nodes.map(n => n.path));

    // Add co-change edges to graph (threshold: changed together N+ times)
    for (const [pair, count] of coChangeMap.entries()) {
      if (count >= coChangeThreshold) {
        const [fileA, fileB] = pair.split('::');
        if (nodePathSet.has(fileA) && nodePathSet.has(fileB)) {
          graph.edges.push({
            source: fileA,
            target: fileB,
            type: 'co-change',
            weight: count,
          });
          stats.coChanges++;
        }
      }
    }

    // Enrich nodes with churn data
    for (const node of graph.nodes) {
      const churn = fileChangeCount.get(node.path) || 0;
      node.churn = churn;
      if (churn > 20) {
        node.hotspot = true;
        stats.hotspots++;
      }
    }

    // Count high-churn files
    stats.churnFiles = [...fileChangeCount.entries()].filter(([, c]) => c > 10).length;
    stats.authors = authorSet.size;

  } catch (err) {
    // Git not available or not a git repo — skip silently
    if (options.verbose) {
      console.error(`  Git pass warning: ${err.message}`);
    }
  }

  return stats;
}

/**
 * Parse git log output into structured commits.
 */
function parseGitLog(log) {
  const commits = [];
  const blocks = log.split('---COMMIT---').filter(Boolean);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length === 0) continue;

    const headerParts = lines[0].split('---');
    const hash = headerParts[0] || '';
    const author = headerParts[1] || 'unknown';

    const files = lines.slice(1)
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('---'));

    commits.push({ hash, author, files });
  }

  return commits;
}
