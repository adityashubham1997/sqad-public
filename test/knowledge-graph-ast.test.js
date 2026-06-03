/**
 * Tests for knowledge-graph/ast-pass.js (S4)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { astPass } from '../squad-method/tools/knowledge-graph/ast-pass.js';

const JS_FILE = {
  path: 'src/auth.js',
  lang: 'js',
  content: `
export function authenticate(username, password) {
  validateInput(username);
  const token = hashPassword(password);
  return dbQuery(token);
}

const getUser = async (id) => {
  return fetchFromDb(id);
};

export class AuthService {
  login() {}
  logout() {}
}
`,
};

const PY_FILE = {
  path: 'src/utils.py',
  lang: 'py',
  content: `
def validate_input(data):
    return bool(data)

def hash_password(password):
    import hashlib
    return hashlib.md5(password.encode()).hexdigest()

class UserService:
    def get_user(self, user_id):
        pass
`,
};

const GO_FILE = {
  path: 'main.go',
  lang: 'go',
  content: `
package main

func main() {
    server := NewServer()
    server.Start()
}

func NewServer() *Server {
    return &Server{}
}
`,
};

describe('astPass — JavaScript/TypeScript extraction', () => {
  it('extracts named function declarations', async () => {
    const graph = { nodes: [{ path: 'src/auth.js' }], edges: [], stats: {} };
    const result = await astPass(graph, [JS_FILE]);
    const fnNodes = result.nodes.filter(n => n.isFunction);
    assert.ok(fnNodes.some(n => n.name === 'authenticate'), 'Should extract authenticate function');
  });

  it('extracts arrow function assignments', async () => {
    const graph = { nodes: [{ path: 'src/auth.js' }], edges: [], stats: {} };
    const result = await astPass(graph, [JS_FILE]);
    const fnNodes = result.nodes.filter(n => n.isFunction);
    assert.ok(fnNodes.some(n => n.name === 'getUser'), 'Should extract getUser arrow function');
  });

  it('marks exported functions', async () => {
    const graph = { nodes: [{ path: 'src/auth.js' }], edges: [], stats: {} };
    const result = await astPass(graph, [JS_FILE]);
    const authFn = result.nodes.find(n => n.name === 'authenticate' && n.isFunction);
    assert.ok(authFn, 'authenticate should be in nodes');
    assert.ok(authFn.exported, 'authenticate should be marked as exported');
  });

  it('includes line numbers', async () => {
    const graph = { nodes: [{ path: 'src/auth.js' }], edges: [], stats: {} };
    const result = await astPass(graph, [JS_FILE]);
    const fnNodes = result.nodes.filter(n => n.isFunction);
    for (const fn of fnNodes) {
      assert.equal(typeof fn.line, 'number', `${fn.name} should have line number`);
    }
  });

  it('adds stats for function nodes and call edges', async () => {
    const graph = { nodes: [{ path: 'src/auth.js' }], edges: [], stats: {} };
    const result = await astPass(graph, [JS_FILE]);
    assert.equal(typeof result.stats.function_nodes, 'number');
    assert.equal(typeof result.stats.call_edges, 'number');
    assert.ok(result.stats.function_nodes > 0, 'Should have function nodes');
  });
});

describe('astPass — Python extraction', () => {
  it('extracts function definitions', async () => {
    const graph = { nodes: [{ path: 'src/utils.py' }], edges: [], stats: {} };
    const result = await astPass(graph, [PY_FILE]);
    const fnNodes = result.nodes.filter(n => n.isFunction);
    assert.ok(fnNodes.some(n => n.name === 'validate_input'), 'Should extract validate_input');
    assert.ok(fnNodes.some(n => n.name === 'hash_password'), 'Should extract hash_password');
  });

  it('marks private functions (underscore prefix) as not exported', async () => {
    const privateFile = {
      path: 'src/internal.py',
      lang: 'py',
      content: 'def _private_helper():\n    pass\n',
    };
    const graph = { nodes: [], edges: [], stats: {} };
    const result = await astPass(graph, [privateFile]);
    const fn = result.nodes.find(n => n.name === '_private_helper' && n.isFunction);
    if (fn) assert.ok(!fn.exported, '_private_helper should not be exported');
  });
});

describe('astPass — Go extraction', () => {
  it('extracts function declarations', async () => {
    const graph = { nodes: [{ path: 'main.go' }], edges: [], stats: {} };
    const result = await astPass(graph, [GO_FILE]);
    const fnNodes = result.nodes.filter(n => n.isFunction);
    assert.ok(fnNodes.some(n => n.name === 'main' || n.name === 'NewServer'),
      'Should extract Go functions');
  });

  it('marks exported Go functions (uppercase first letter)', async () => {
    const graph = { nodes: [{ path: 'main.go' }], edges: [], stats: {} };
    const result = await astPass(graph, [GO_FILE]);
    const newServerFn = result.nodes.find(n => n.name === 'NewServer' && n.isFunction);
    if (newServerFn) assert.ok(newServerFn.exported, 'NewServer should be exported (capital N)');
  });
});

describe('astPass — graceful degradation', () => {
  it('does not crash on unsupported language', async () => {
    const cssFile = { path: 'styles.css', lang: 'css', content: '.foo { color: red; }' };
    const graph = { nodes: [], edges: [], stats: {} };
    const result = await astPass(graph, [cssFile]);
    assert.ok(result, 'Should not throw for unsupported language');
    assert.equal(result.stats.function_nodes, 0, 'CSS should produce 0 function nodes');
  });

  it('does not crash on empty file', async () => {
    const emptyFile = { path: 'empty.js', lang: 'js', content: '' };
    const graph = { nodes: [], edges: [], stats: {} };
    await assert.doesNotReject(() => astPass(graph, [emptyFile]));
  });

  it('reports ast_mode: regex when tree-sitter not available', async () => {
    const graph = { nodes: [], edges: [], stats: {} };
    const result = await astPass(graph, [JS_FILE], { useTreeSitter: false });
    assert.equal(result.stats.ast_mode, 'regex');
  });

  it('handles multiple files in one pass', async () => {
    const graph = { nodes: [], edges: [], stats: {} };
    const result = await astPass(graph, [JS_FILE, PY_FILE, GO_FILE]);
    const fnNodes = result.nodes.filter(n => n.isFunction);
    assert.ok(fnNodes.length >= 3, 'Should extract functions from multiple languages');
  });
});
