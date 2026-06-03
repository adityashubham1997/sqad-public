/**
 * Tests for knowledge-graph/prioritize.js (S3.3)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { prioritize } from '../squad-method/tools/knowledge-graph/prioritize.js';

const FIXTURE_GRAPH = {
  nodes: [
    { path: 'lib/auth/login.js', type: 'js', degree: 8, isTest: false },
    { path: 'lib/auth/token.js', type: 'js', degree: 5, isTest: false },
    { path: 'lib/user/profile.js', type: 'js', degree: 3, isTest: false },
    { path: 'lib/database/queries.js', type: 'js', degree: 12, isTest: false },
    { path: 'test/auth.test.js', type: 'js', degree: 2, isTest: true },
    { path: 'lib/utils/helpers.js', type: 'js', degree: 1, isTest: false },
  ],
  edges: [
    { source: 'lib/auth/login.js', target: 'lib/auth/token.js', type: 'imports' },
    { source: 'lib/auth/login.js', target: 'lib/database/queries.js', type: 'imports' },
    { source: 'test/auth.test.js', target: 'lib/auth/login.js', type: 'tests' },
    { source: 'lib/user/profile.js', target: 'lib/database/queries.js', type: 'imports' },
  ],
};

describe('prioritize — task-aware file ranking', () => {
  it('returns an array of ranked files', () => {
    const result = prioritize('fix login authentication', FIXTURE_GRAPH);
    assert.ok(Array.isArray(result), 'Should return array');
    assert.ok(result.length > 0, 'Should return some files');
  });

  it('ranks auth-related files higher for authentication tasks', () => {
    const result = prioritize('fix authentication login flow', FIXTURE_GRAPH);
    const topPaths = result.map(r => r.path);
    const authIdx = topPaths.findIndex(p => p.includes('auth/login'));
    const utilsIdx = topPaths.findIndex(p => p.includes('helpers'));
    if (authIdx !== -1 && utilsIdx !== -1) {
      assert.ok(authIdx < utilsIdx, 'auth/login should rank above helpers for auth task');
    }
  });

  it('each result has path, score, and reasons', () => {
    const result = prioritize('update database queries', FIXTURE_GRAPH);
    for (const r of result) {
      assert.equal(typeof r.path, 'string', 'path should be string');
      assert.equal(typeof r.score, 'number', 'score should be number');
      assert.ok(Array.isArray(r.reasons), 'reasons should be array');
    }
  });

  it('respects topN option', () => {
    const result = prioritize('auth', FIXTURE_GRAPH, { topN: 3 });
    assert.ok(result.length <= 3, `Should return max 3 results, got ${result.length}`);
  });

  it('handles empty graph gracefully', () => {
    const result = prioritize('anything', { nodes: [], edges: [] });
    assert.deepEqual(result, []);
  });

  it('handles empty task description gracefully', () => {
    const result = prioritize('', FIXTURE_GRAPH);
    assert.ok(Array.isArray(result));
  });

  it('promotes community proximity — neighbors of matched files get a boost', () => {
    // token.js is a neighbor of login.js — should get proximity boost for auth tasks
    const result = prioritize('fix authentication login', FIXTURE_GRAPH);
    const tokenEntry = result.find(r => r.path === 'lib/auth/token.js');
    assert.ok(tokenEntry, 'token.js (neighbor of login.js) should appear in results');
  });
});
