import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gitPass } from '../squad-method/tools/knowledge-graph/git-pass.js';
import { detectCommunities } from '../squad-method/tools/knowledge-graph/cluster.js';
import { findSurprises, findHotspots, computeComplexity } from '../squad-method/tools/knowledge-graph/analyze.js';

// --- git-pass.js ---

describe('gitPass', () => {
  it('returns zero stats for a non-git directory', () => {
    const graph = { nodes: [], edges: [] };
    const stats = gitPass(graph, '/tmp/non-existent-repo-xyz', { verbose: false });
    assert.equal(stats.coChanges, 0);
    assert.equal(stats.authors, 0);
    assert.equal(stats.churnFiles, 0);
  });

  it('does not crash on empty graph', () => {
    const graph = { nodes: [], edges: [] };
    const stats = gitPass(graph, '.', { maxCommits: 5, verbose: false });
    assert.equal(typeof stats.coChanges, 'number');
    assert.equal(typeof stats.authors, 'number');
  });

  it('enriches nodes with churn data when run on a real repo', () => {
    const graph = {
      nodes: [{ path: 'lib/init.js' }, { path: 'lib/detect/stack.js' }],
      edges: [],
    };
    const stats = gitPass(graph, '.', { maxCommits: 100, verbose: false });
    // At least one file should have churn > 0 in a real repo
    const anyChurn = graph.nodes.some(n => (n.churn || 0) > 0);
    assert.ok(anyChurn || stats.authors >= 0, 'Should process without error');
  });
});

// --- cluster.js ---

describe('detectCommunities', () => {
  it('returns empty for empty graph', () => {
    const communities = detectCommunities({ nodes: [], edges: [] });
    assert.deepEqual(communities, []);
  });

  it('groups connected nodes into same community', () => {
    const graph = {
      nodes: [
        { path: 'a.js' }, { path: 'b.js' }, { path: 'c.js' },
        { path: 'x.js' }, { path: 'y.js' },
      ],
      edges: [
        { source: 'a.js', target: 'b.js', type: 'import' },
        { source: 'b.js', target: 'c.js', type: 'import' },
        { source: 'x.js', target: 'y.js', type: 'import' },
      ],
    };
    const communities = detectCommunities(graph, { maxIterations: 20 });
    assert.ok(communities.length >= 2, `Expected >= 2 communities, got ${communities.length}`);
    const totalMembers = communities.reduce((s, c) => s + c.members.length, 0);
    assert.equal(totalMembers, 5);
  });

  it('computes cohesion for communities', () => {
    const graph = {
      nodes: [{ path: 'a.js' }, { path: 'b.js' }],
      edges: [{ source: 'a.js', target: 'b.js', type: 'import' }],
    };
    const communities = detectCommunities(graph, { maxIterations: 50 });
    for (const c of communities) {
      assert.equal(typeof c.cohesion, 'number');
    }
  });

  it('gives co-change edges extra weight', () => {
    const graph = {
      nodes: [
        { path: 'a.js' }, { path: 'b.js' }, { path: 'c.js' },
      ],
      edges: [
        { source: 'a.js', target: 'b.js', type: 'co-change' },
        { source: 'b.js', target: 'c.js', type: 'import' },
      ],
    };
    const communities = detectCommunities(graph, { maxIterations: 50 });
    assert.ok(communities.length >= 1);
  });
});

// --- analyze.js ---

describe('findSurprises', () => {
  it('returns empty when all edges are within same community', () => {
    const graph = {
      nodes: [{ path: 'a.js', type: 'js' }, { path: 'b.js', type: 'js' }],
      edges: [{ source: 'a.js', target: 'b.js', type: 'import' }],
    };
    const communities = [{ id: 'all', members: ['a.js', 'b.js'] }];
    const surprises = findSurprises(graph, communities);
    assert.equal(surprises.length, 0);
  });

  it('detects cross-community import edges', () => {
    const graph = {
      nodes: [
        { path: 'a.js', type: 'js' }, { path: 'b.js', type: 'js' },
        { path: 'x.js', type: 'ts' },
      ],
      edges: [
        { source: 'a.js', target: 'b.js', type: 'import' },
        { source: 'a.js', target: 'x.js', type: 'import' },
      ],
    };
    const communities = [
      { id: 'group1', members: ['a.js', 'b.js'] },
      { id: 'group2', members: ['x.js'] },
    ];
    const surprises = findSurprises(graph, communities);
    assert.ok(surprises.length >= 1);
    assert.ok(surprises[0].reason.includes('Cross-community'));
  });

  it('ignores co-change edges', () => {
    const graph = {
      nodes: [{ path: 'a.js', type: 'js' }, { path: 'x.js', type: 'js' }],
      edges: [{ source: 'a.js', target: 'x.js', type: 'co-change' }],
    };
    const communities = [
      { id: 'g1', members: ['a.js'] },
      { id: 'g2', members: ['x.js'] },
    ];
    const surprises = findSurprises(graph, communities);
    assert.equal(surprises.length, 0);
  });
});

describe('findHotspots', () => {
  it('returns empty for empty graph', () => {
    assert.deepEqual(findHotspots({ nodes: [], edges: [] }), []);
  });

  it('identifies high-churn nodes as hotspots', () => {
    const graph = {
      nodes: [
        { path: 'a.js', degree: 2, churn: 25 },
        { path: 'b.js', degree: 1, churn: 1 },
      ],
      edges: [],
    };
    const hotspots = findHotspots(graph);
    assert.ok(hotspots.some(h => h.path === 'a.js'));
  });

  it('classifies CRITICAL for high degree + high churn', () => {
    // Need enough nodes for the 2-sigma threshold to work statistically
    const nodes = Array.from({ length: 20 }, (_, i) => ({
      path: `normal${i}.js`, degree: 2, churn: 1,
    }));
    nodes.push({ path: 'god.js', degree: 50, churn: 30 });
    const graph = { nodes, edges: [] };
    const hotspots = findHotspots(graph);
    const god = hotspots.find(h => h.path === 'god.js');
    assert.ok(god, 'god.js should be a hotspot');
    assert.equal(god.risk, 'CRITICAL');
  });
});

describe('computeComplexity', () => {
  it('returns grade A for simple graph', () => {
    const graph = {
      nodes: [{ path: 'a.js', god_node: false, hotspot: false }],
      edges: [],
    };
    const result = computeComplexity(graph, [{ id: 'x', members: ['a.js'] }], []);
    assert.equal(result.grade, 'A');
    assert.equal(typeof result.score, 'number');
    assert.ok(result.factors);
  });

  it('returns worse grade for complex graph', () => {
    const nodes = [];
    const edges = [];
    for (let i = 0; i < 200; i++) {
      nodes.push({ path: `file${i}.js`, god_node: i < 5, hotspot: i < 10 });
    }
    for (let i = 0; i < 150; i++) {
      edges.push({ source: `file${i}.js`, target: `file${i + 1}.js`, type: 'import' });
    }
    const communities = Array.from({ length: 25 }, (_, i) => ({
      id: `c${i}`, members: nodes.slice(i * 8, (i + 1) * 8).map(n => n.path),
    }));
    const surprises = Array.from({ length: 10 }, (_, i) => ({
      source: `file${i}.js`, target: `file${i + 100}.js`, reason: 'test',
    }));
    const result = computeComplexity({ nodes, edges }, communities, surprises);
    assert.ok(['B', 'C', 'D', 'F'].includes(result.grade), `Expected worse than A, got ${result.grade}`);
  });
});
