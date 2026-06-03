/**
 * Tests for knowledge-graph/incremental.js (S3.3)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { applyIncrementalUpdate } from '../squad-method/tools/knowledge-graph/incremental.js';

const BASE_GRAPH = {
  nodes: [
    { path: 'lib/a.js', type: 'js', degree: 2, isTest: false, god_node: false },
    { path: 'lib/b.js', type: 'js', degree: 1, isTest: false, god_node: false },
    { path: 'lib/c.js', type: 'js', degree: 1, isTest: false, god_node: false },
  ],
  edges: [
    { source: 'lib/a.js', target: 'lib/b.js', type: 'imports' },
    { source: 'lib/a.js', target: 'lib/c.js', type: 'imports' },
  ],
  stats: { nodes: 3, edges: 2, source_files: 3, test_files: 0, god_nodes: 0 },
};

describe('applyIncrementalUpdate', () => {
  it('updates nodes for changed files', () => {
    const graph = JSON.parse(JSON.stringify(BASE_GRAPH));
    const newData = {
      'lib/a.js': { imports: ['lib/b.js'], isTest: false },
    };

    const updated = applyIncrementalUpdate(graph, ['lib/a.js'], newData);
    assert.ok(updated.nodes.some(n => n.path === 'lib/a.js'), 'a.js should still exist');
  });

  it('removes old edges for changed files and adds new ones', () => {
    const graph = JSON.parse(JSON.stringify(BASE_GRAPH));
    // Change a.js to only import b.js (drop c.js dependency)
    const newData = {
      'lib/a.js': { imports: ['lib/b.js'], isTest: false },
    };

    const updated = applyIncrementalUpdate(graph, ['lib/a.js'], newData);
    const aEdges = updated.edges.filter(e => e.source === 'lib/a.js');
    assert.equal(aEdges.length, 1, 'a.js should have 1 edge after update');
    assert.equal(aEdges[0].target, 'lib/b.js');
  });

  it('recalculates degrees after update', () => {
    const graph = JSON.parse(JSON.stringify(BASE_GRAPH));
    const newData = {
      'lib/a.js': { imports: ['lib/b.js'], isTest: false },
    };

    const updated = applyIncrementalUpdate(graph, ['lib/a.js'], newData);
    const aNode = updated.nodes.find(n => n.path === 'lib/a.js');
    const cNode = updated.nodes.find(n => n.path === 'lib/c.js');
    assert.equal(aNode.degree, 1, 'a.js degree should be 1 (only imports b.js)');
    assert.equal(cNode.degree, 0, 'c.js degree should be 0 (a.js no longer imports it)');
  });

  it('marks god nodes correctly (degree > 30)', () => {
    const graph = { nodes: [{ path: 'core.js', type: 'js', isTest: false }], edges: [], stats: {} };
    const imports = Array.from({ length: 35 }, (_, i) => `lib/dep${i}.js`);
    // Add dep nodes
    for (let i = 0; i < 35; i++) {
      graph.nodes.push({ path: `lib/dep${i}.js`, type: 'js', isTest: false });
    }

    const newData = { 'core.js': { imports, isTest: false } };
    const updated = applyIncrementalUpdate(graph, ['core.js'], newData);
    const coreNode = updated.nodes.find(n => n.path === 'core.js');
    assert.ok(coreNode.god_node, 'core.js should be a god node with degree 35');
  });

  it('updates stats correctly', () => {
    const graph = JSON.parse(JSON.stringify(BASE_GRAPH));
    const newData = { 'lib/a.js': { imports: [], isTest: false } };
    const updated = applyIncrementalUpdate(graph, ['lib/a.js'], newData);
    assert.equal(updated.stats.nodes, 3, 'Node count should remain 3');
    assert.equal(updated.stats.edges, 0, 'Edge count should be 0 after removing all a.js edges');
    assert.ok(updated.stats.incremental_update, 'Should have incremental_update timestamp');
  });

  it('handles unchanged files correctly', () => {
    const graph = JSON.parse(JSON.stringify(BASE_GRAPH));
    // Update only b.js — a.js edges should remain
    const newData = { 'lib/b.js': { imports: [], isTest: false } };
    const updated = applyIncrementalUpdate(graph, ['lib/b.js'], newData);
    // a.js → c.js edge should survive (a.js didn't change)
    const acEdge = updated.edges.find(e => e.source === 'lib/a.js' && e.target === 'lib/c.js');
    assert.ok(acEdge, 'a.js → c.js edge should survive unchanged update to b.js');
  });
});
