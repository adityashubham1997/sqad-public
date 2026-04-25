#!/usr/bin/env node

/**
 * SQAD-Public Knowledge Graph Builder
 *
 * Builds a dependency graph (graph.json) for any project by scanning
 * source files for imports/requires/includes. Stack-agnostic — detects
 * JavaScript, TypeScript, Python, Go, Rust, Java, Ruby.
 *
 * Usage:
 *   node build.js <repo-path> [--output <dir>]
 *
 * Output:
 *   <repo-path>/knowledge-graph-out/graph.json
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname, basename, dirname, resolve } from 'node:path';

const LANGUAGE_PATTERNS = {
  // JavaScript/TypeScript
  '.js':   { type: 'js', importRegex: [/require\(['"]([^'"]+)['"]\)/g, /from\s+['"]([^'"]+)['"]/g] },
  '.mjs':  { type: 'js', importRegex: [/from\s+['"]([^'"]+)['"]/g] },
  '.cjs':  { type: 'js', importRegex: [/require\(['"]([^'"]+)['"]\)/g] },
  '.ts':   { type: 'ts', importRegex: [/from\s+['"]([^'"]+)['"]/g, /require\(['"]([^'"]+)['"]\)/g] },
  '.tsx':  { type: 'ts', importRegex: [/from\s+['"]([^'"]+)['"]/g] },
  '.jsx':  { type: 'js', importRegex: [/from\s+['"]([^'"]+)['"]/g, /require\(['"]([^'"]+)['"]\)/g] },
  // Python
  '.py':   { type: 'py', importRegex: [/^import\s+(\S+)/gm, /^from\s+(\S+)\s+import/gm] },
  // Go
  '.go':   { type: 'go', importRegex: [/"\s*([^"]+)\s*"/g] },  // inside import blocks
  // Rust
  '.rs':   { type: 'rs', importRegex: [/use\s+([\w:]+)/g, /mod\s+(\w+)/g] },
  // Java
  '.java': { type: 'java', importRegex: [/^import\s+([\w.]+)/gm] },
  // Ruby
  '.rb':   { type: 'rb', importRegex: [/require\s+['"]([^'"]+)['"]/g, /require_relative\s+['"]([^'"]+)['"]/g] },
};

const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', '.next', '__pycache__',
  'target', 'vendor', '.venv', 'venv', 'coverage', '.nyc_output',
  'knowledge-graph-out', '.sqad', 'sqad-method',
]);

const TEST_PATTERNS = [
  /\.test\./i, /\.spec\./i, /_test\./i, /test_/i,
  /\/test\//i, /\/tests\//i, /\/__tests__\//i, /\/spec\//i,
];

/**
 * Main entry point.
 */
function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node build.js <repo-path> [--output <dir>]');
    process.exit(1);
  }

  const repoPath = resolve(args[0]);
  const outputIdx = args.indexOf('--output');
  const outputDir = outputIdx !== -1 && args[outputIdx + 1]
    ? resolve(args[outputIdx + 1])
    : join(repoPath, 'knowledge-graph-out');

  if (!existsSync(repoPath)) {
    console.error(`Path not found: ${repoPath}`);
    process.exit(1);
  }

  console.log(`📊 Building knowledge graph for: ${repoPath}`);

  // Scan source files
  const files = scanFiles(repoPath);
  console.log(`   Found ${files.length} source files`);

  // Build edges
  const edges = [];
  const nodes = new Map();

  for (const file of files) {
    const relPath = relative(repoPath, file.path);
    const isTest = TEST_PATTERNS.some(p => p.test(relPath));

    nodes.set(relPath, {
      path: relPath,
      type: file.lang,
      isTest,
      lines: file.lines,
    });

    // Extract imports
    const imports = extractImports(file.path, file.lang);
    for (const imp of imports) {
      const resolved = resolveImport(repoPath, file.path, imp, file.lang);
      if (resolved) {
        const targetRel = relative(repoPath, resolved);
        edges.push({
          source: relPath,
          target: targetRel,
          type: isTest ? 'tests' : 'imports',
        });
      }
    }
  }

  // Compute node degrees
  const degreeMap = new Map();
  for (const edge of edges) {
    degreeMap.set(edge.source, (degreeMap.get(edge.source) || 0) + 1);
    degreeMap.set(edge.target, (degreeMap.get(edge.target) || 0) + 1);
  }

  // Build graph JSON
  const graph = {
    version: 1,
    generated: new Date().toISOString(),
    repo: basename(repoPath),
    stats: {
      nodes: nodes.size,
      edges: edges.length,
      source_files: [...nodes.values()].filter(n => !n.isTest).length,
      test_files: [...nodes.values()].filter(n => n.isTest).length,
      god_nodes: [...degreeMap.entries()].filter(([, d]) => d > 30).length,
    },
    nodes: [...nodes.entries()].map(([path, node]) => ({
      ...node,
      degree: degreeMap.get(path) || 0,
      god_node: (degreeMap.get(path) || 0) > 30,
    })),
    edges,
  };

  // Write output
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, 'graph.json');
  writeFileSync(outputPath, JSON.stringify(graph, null, 2), 'utf8');

  console.log(`   Nodes: ${graph.stats.nodes} | Edges: ${graph.stats.edges}`);
  console.log(`   Source: ${graph.stats.source_files} | Tests: ${graph.stats.test_files}`);
  console.log(`   God nodes: ${graph.stats.god_nodes}`);
  console.log(`   Output: ${outputPath}`);
}

/**
 * Recursively scan for source files.
 */
function scanFiles(dir, files = []) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      if (entry.name.startsWith('.')) continue;

      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        scanFiles(fullPath, files);
      } else if (entry.isFile()) {
        const ext = extname(entry.name);
        if (LANGUAGE_PATTERNS[ext]) {
          try {
            const content = readFileSync(fullPath, 'utf8');
            files.push({
              path: fullPath,
              lang: LANGUAGE_PATTERNS[ext].type,
              ext,
              lines: content.split('\n').length,
              content,
            });
          } catch (e) { /* skip unreadable files */ }
        }
      }
    }
  } catch (e) { /* skip unreadable dirs */ }
  return files;
}

/**
 * Extract import/require references from a source file.
 */
function extractImports(filePath, lang) {
  const ext = extname(filePath);
  const patterns = LANGUAGE_PATTERNS[ext]?.importRegex;
  if (!patterns) return [];

  const content = readFileSync(filePath, 'utf8');
  const imports = [];

  for (const regex of patterns) {
    // Reset regex state
    const re = new RegExp(regex.source, regex.flags);
    let match;
    while ((match = re.exec(content)) !== null) {
      const imp = match[1];
      if (imp && !imp.startsWith('.') && lang === 'go') continue; // skip stdlib Go imports
      if (imp) imports.push(imp);
    }
  }

  return imports;
}

/**
 * Resolve an import string to an actual file path.
 */
function resolveImport(repoPath, sourceFile, importStr, lang) {
  const sourceDir = dirname(sourceFile);

  // Skip external/npm packages (no relative path)
  if (lang === 'js' || lang === 'ts') {
    if (!importStr.startsWith('.') && !importStr.startsWith('/')) return null;
  }

  // Try direct resolution
  const candidates = [];

  if (lang === 'js' || lang === 'ts') {
    const base = join(sourceDir, importStr);
    candidates.push(
      base,
      base + '.js', base + '.ts', base + '.tsx', base + '.jsx', base + '.mjs',
      join(base, 'index.js'), join(base, 'index.ts'), join(base, 'index.tsx'),
    );
  } else if (lang === 'py') {
    const parts = importStr.replace(/\./g, '/');
    candidates.push(
      join(repoPath, parts + '.py'),
      join(repoPath, parts, '__init__.py'),
      join(sourceDir, parts + '.py'),
    );
  } else if (lang === 'rb') {
    if (importStr.startsWith('.') || importStr.startsWith('/')) {
      candidates.push(join(sourceDir, importStr + '.rb'));
    } else {
      candidates.push(join(repoPath, 'lib', importStr + '.rb'));
    }
  } else if (lang === 'rs') {
    candidates.push(
      join(sourceDir, importStr.replace(/::/g, '/') + '.rs'),
      join(sourceDir, importStr.replace(/::/g, '/'), 'mod.rs'),
    );
  } else if (lang === 'java') {
    const parts = importStr.replace(/\./g, '/');
    candidates.push(join(repoPath, 'src', 'main', 'java', parts + '.java'));
  }

  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

main();
