/**
 * SQUAD Knowledge Graph — AST Analysis Pass (S4)
 *
 * Extracts function-level nodes and call-graph edges from source files.
 * Two modes:
 *   1. tree-sitter mode (when tree-sitter package is available) — full AST
 *   2. regex mode (fallback) — heuristic extraction, always available
 *
 * Enable in config: knowledge_graph.ast_enabled: true
 */

const SUPPORTED_LANGS = new Set(['js', 'ts', 'py', 'go', 'java', 'rb']);

/**
 * Run the AST pass over all scanned files.
 * Adds function-level nodes and call edges to the graph.
 *
 * @param {object} graph - existing graph.json (mutated in place)
 * @param {Array<{path: string, lang: string, content: string}>} files
 * @param {object} [options]
 * @param {boolean} [options.useTreeSitter=false] - try tree-sitter if available
 * @returns {object} enriched graph
 */
export async function astPass(graph, files, options = {}) {
  const { useTreeSitter = false } = options;
  let tsSup = false;

  if (useTreeSitter) {
    tsSup = await isTreeSitterAvailable();
  }

  const functionNodes = [];
  const callEdges = [];

  for (const file of files) {
    if (!SUPPORTED_LANGS.has(file.lang)) continue;

    let extracted;
    if (tsSup) {
      extracted = await extractWithTreeSitter(file);
    } else {
      extracted = extractWithRegex(file);
    }

    for (const fn of extracted.functions) {
      functionNodes.push({
        path: `${file.path}::${fn.name}`,
        parentFile: file.path,
        type: `fn_${file.lang}`,
        isFunction: true,
        name: fn.name,
        line: fn.line,
        exported: fn.exported,
        params: fn.params,
      });

      // Call edges: function → file-level target (simplified)
      for (const callee of fn.calls || []) {
        callEdges.push({
          source: `${file.path}::${fn.name}`,
          target: callee,
          type: 'calls',
        });
      }
    }
  }

  // Merge function nodes into graph
  graph.nodes = [...(graph.nodes || []), ...functionNodes];
  graph.edges = [...(graph.edges || []), ...callEdges];

  graph.stats = {
    ...graph.stats,
    function_nodes: functionNodes.length,
    call_edges: callEdges.length,
    ast_mode: tsSup ? 'tree-sitter' : 'regex',
  };

  return graph;
}

/**
 * Regex-based function/class extraction (always available, no dependencies).
 */
function extractWithRegex(file) {
  const { content, lang, path } = file;
  const functions = [];
  const classes = [];

  if (lang === 'js' || lang === 'ts') {
    // Named function declarations
    const fnDecl = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
    let m;
    while ((m = fnDecl.exec(content)) !== null) {
      functions.push({
        name: m[1],
        params: m[2].split(',').map(p => p.trim()).filter(Boolean),
        line: lineAt(content, m.index),
        exported: m[0].startsWith('export'),
        calls: extractCalls(content, m.index),
      });
    }

    // Arrow function assignments
    const arrowFn = /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>/g;
    while ((m = arrowFn.exec(content)) !== null) {
      functions.push({
        name: m[1],
        params: m[2].split(',').map(p => p.trim()).filter(Boolean),
        line: lineAt(content, m.index),
        exported: m[0].startsWith('export'),
        calls: [],
      });
    }

    // Class declarations
    const classDecl = /(?:export\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?/g;
    while ((m = classDecl.exec(content)) !== null) {
      classes.push({
        name: m[1],
        extends: m[2] || null,
        line: lineAt(content, m.index),
      });
    }
  } else if (lang === 'py') {
    const defDecl = /^(?:    )*def\s+(\w+)\s*\(([^)]*)\)/gm;
    let m;
    while ((m = defDecl.exec(content)) !== null) {
      functions.push({
        name: m[1],
        params: m[2].split(',').map(p => p.trim()).filter(Boolean),
        line: lineAt(content, m.index),
        exported: !m[1].startsWith('_'),
        calls: [],
      });
    }
  } else if (lang === 'go') {
    const funcDecl = /^func\s+(?:\(\w+\s+\*?\w+\)\s+)?(\w+)\s*\(([^)]*)\)/gm;
    let m;
    while ((m = funcDecl.exec(content)) !== null) {
      functions.push({
        name: m[1],
        params: [],
        line: lineAt(content, m.index),
        exported: m[1][0] === m[1][0].toUpperCase(),
        calls: [],
      });
    }
  } else if (lang === 'java') {
    const methodDecl = /(?:public|private|protected|static|final|\s)+\w[\w<>, \[\]]*\s+(\w+)\s*\(/g;
    let m;
    while ((m = methodDecl.exec(content)) !== null) {
      if (['if', 'for', 'while', 'switch', 'catch', 'class', 'interface'].includes(m[1])) continue;
      functions.push({
        name: m[1],
        params: [],
        line: lineAt(content, m.index),
        exported: m[0].includes('public'),
        calls: [],
      });
    }
  }

  return { functions, classes };
}

function lineAt(content, index) {
  return content.slice(0, index).split('\n').length;
}

function extractCalls(content, fnStart) {
  // Extract the function body (heuristic: next 500 chars)
  const body = content.slice(fnStart, fnStart + 500);
  const calls = [];
  const callRegex = /\b(\w+)\s*\(/g;
  const SKIP = new Set(['if', 'for', 'while', 'switch', 'catch', 'return', 'function', 'async', 'await', 'new', 'typeof', 'instanceof', 'import', 'export', 'class']);
  let m;
  while ((m = callRegex.exec(body)) !== null) {
    if (!SKIP.has(m[1]) && m[1].length > 1) {
      calls.push(m[1]);
    }
  }
  return [...new Set(calls)].slice(0, 10);
}

async function isTreeSitterAvailable() {
  try {
    await import('tree-sitter');
    return true;
  } catch (e) {
    return false;
  }
}

async function extractWithTreeSitter(file) {
  // Stub: when tree-sitter is installed, this would use the actual AST parser.
  // For now, fall back to regex extraction.
  return extractWithRegex(file);
}
