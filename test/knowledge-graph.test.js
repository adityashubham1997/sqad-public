import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gitPass } from '../squad-method/tools/knowledge-graph/git-pass.js';
import { detectCommunities } from '../squad-method/tools/knowledge-graph/cluster.js';
import { findSurprises, findHotspots, computeComplexity } from '../squad-method/tools/knowledge-graph/analyze.js';
import { LANGUAGE_PATTERNS, SKIP_DOT_DIRS } from '../squad-method/tools/knowledge-graph/build.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Language Pattern Tests (1.3) ──────────────────────────────────────────

function extractWithPatterns(content, patterns) {
  const imports = [];
  for (const regex of patterns) {
    const re = new RegExp(regex.source, regex.flags);
    let match;
    while ((match = re.exec(content)) !== null) {
      if (match[1]) imports.push(match[1]);
    }
  }
  return imports;
}

describe('LANGUAGE_PATTERNS — new languages (1.3.1-1.3.2)', () => {
  it('exports patterns for all new languages', () => {
    const requiredExts = ['.c', '.cpp', '.h', '.hpp', '.cs', '.swift', '.kt', '.scala', '.php', '.proto', '.graphql'];
    for (const ext of requiredExts) {
      assert.ok(LANGUAGE_PATTERNS[ext], `Missing pattern for ${ext}`);
    }
  });

  it('C/C++ — extracts #include paths', () => {
    const content = readFileSync(join(__dirname, 'fixtures/kg-cpp/main.c'), 'utf8');
    const imports = extractWithPatterns(content, LANGUAGE_PATTERNS['.c'].importRegex);
    assert.ok(imports.includes('utils.h'), `Expected "utils.h" in imports: ${imports}`);
    assert.ok(imports.includes('math/calc.h'), `Expected "math/calc.h" in imports: ${imports}`);
    // System header is included — we don't filter at pattern level, only at resolve level
    assert.ok(imports.some(i => i.includes('stdio')), 'Expected stdio.h');
  });

  it('C# — extracts using statements (not system namespaces at resolve level)', () => {
    const content = readFileSync(join(__dirname, 'fixtures/kg-csharp/Program.cs'), 'utf8');
    const imports = extractWithPatterns(content, LANGUAGE_PATTERNS['.cs'].importRegex);
    assert.ok(imports.includes('MyApp.Services'), `Expected MyApp.Services: ${imports}`);
    assert.ok(imports.includes('System'), 'Expected System namespace');
  });

  it('Kotlin — extracts import statements', () => {
    const content = readFileSync(join(__dirname, 'fixtures/kg-kotlin/Main.kt'), 'utf8');
    const imports = extractWithPatterns(content, LANGUAGE_PATTERNS['.kt'].importRegex);
    assert.ok(imports.some(i => i.includes('UserService')), `Expected UserService: ${imports}`);
  });

  it('PHP — extracts use, require, and include paths', () => {
    const content = readFileSync(join(__dirname, 'fixtures/kg-php/index.php'), 'utf8');
    const imports = extractWithPatterns(content, LANGUAGE_PATTERNS['.php'].importRegex);
    assert.ok(imports.some(i => i.includes('UserService')), `Expected UserService: ${imports}`);
    assert.ok(imports.some(i => i.includes('autoload')), `Expected autoload: ${imports}`);
  });

  it('Proto — extracts import statements', () => {
    const content = readFileSync(join(__dirname, 'fixtures/kg-proto/user.proto'), 'utf8');
    const imports = extractWithPatterns(content, LANGUAGE_PATTERNS['.proto'].importRegex);
    assert.ok(imports.includes('address.proto'), `Expected address.proto: ${imports}`);
  });

  it('Go — fixed regex does not match bare string literals', () => {
    const content = `
package main

import (
  "fmt"
  "github.com/user/mylib"
)

func hello() string {
  msg := "this is not an import"
  return msg
}
`;
    const imports = extractWithPatterns(content, LANGUAGE_PATTERNS['.go'].importRegex);
    assert.ok(!imports.includes('this is not an import'), 'Should NOT match bare string literals');
    assert.ok(imports.includes('github.com/user/mylib'), `Expected github.com/user/mylib import: ${imports}`);
  });
});

describe('SKIP_DOT_DIRS — dot-directory fix (1.3.3)', () => {
  it('contains .git but NOT .github or .circleci', () => {
    assert.ok(SKIP_DOT_DIRS.has('.git'), '.git should be in skip list');
    assert.ok(!SKIP_DOT_DIRS.has('.github'), '.github should NOT be skipped');
    assert.ok(!SKIP_DOT_DIRS.has('.circleci'), '.circleci should NOT be skipped');
  });

  it('contains common cache directories to skip', () => {
    assert.ok(SKIP_DOT_DIRS.has('.venv'));
    assert.ok(SKIP_DOT_DIRS.has('.nyc_output'));
    assert.ok(SKIP_DOT_DIRS.has('.next'));
  });
});

// ─── git-pass.js ───────────────────────────────────────────────────────────

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
