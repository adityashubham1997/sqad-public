/**
 * Domain schema learner for SQUAD compression pipeline.
 * Scans workspace during /refresh, builds frequency tables of common patterns.
 * Saves as squad-method/output/compress-schemas.json.
 */

import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'out', '.venv', 'venv', 'vendor']);
const MAX_FILES = 200;

/**
 * Scan workspace and build compression schemas.
 * @param {string} workspacePath
 * @param {string} outputPath - Where to write compress-schemas.json
 */
export function learnSchemas(workspacePath, outputPath) {
  const importFreq = new Map();
  const patternFreq = new Map();
  const extCount = new Map();
  let fileCount = 0;

  scanDir(workspacePath, workspacePath, importFreq, patternFreq, extCount, { count: 0 }, MAX_FILES);

  const abbreviations = buildAbbreviations(importFreq);

  const schemas = {
    generated_at: new Date().toISOString(),
    repo: workspacePath.split('/').pop(),
    file_count: fileCount,
    abbreviations,
    file_type_summary: [...extCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ext, n]) => `${n} ${ext}`)
      .join(', '),
    common_patterns: [...patternFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([pattern, freq]) => ({ pattern, freq })),
  };

  mkdirSync(outputPath.split('/').slice(0, -1).join('/'), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(schemas, null, 2), 'utf8');
  return schemas;
}

function scanDir(dir, root, importFreq, patternFreq, extCount, state, maxFiles) {
  if (state.count >= maxFiles) return;
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath, root, importFreq, patternFreq, extCount, state, maxFiles);
      } else if (entry.isFile() && state.count < maxFiles) {
        const ext = extname(entry.name).toLowerCase();
        extCount.set(ext, (extCount.get(ext) || 0) + 1);
        state.count++;

        if (['.js', '.ts', '.tsx', '.jsx'].includes(ext)) {
          try {
            const content = readFileSync(fullPath, 'utf8');
            extractPatterns(content, importFreq, patternFreq);
          } catch (e) { /* ignore */ }
        }
      }
    }
  } catch (e) { /* ignore */ }
}

function extractPatterns(content, importFreq, patternFreq) {
  // Count import sources
  const importMatches = content.matchAll(/(?:import|from)\s+['"]([^'"]+)['"]/g);
  for (const m of importMatches) {
    importFreq.set(m[1], (importFreq.get(m[1]) || 0) + 1);
  }

  // Count common code patterns
  const patterns = [
    /console\.log\(/g,
    /export default function/g,
    /export const\s+\w+/g,
    /async function/g,
    /React\.useState/g,
    /useEffect\(/g,
  ];
  for (const regex of patterns) {
    const matches = content.match(regex) || [];
    if (matches.length > 0) {
      const key = regex.source.replace(/\\s\+|\\w\+|\(|\\|g/g, '').trim();
      patternFreq.set(key, (patternFreq.get(key) || 0) + matches.length);
    }
  }
}

function buildAbbreviations(importFreq) {
  const abbr = {
    'node_modules': 'nm/',
  };

  // Auto-abbreviate highly-repeated imports
  for (const [imp, freq] of importFreq) {
    if (freq >= 5 && imp.length > 15) {
      const parts = imp.split('/');
      const short = `⟨${parts[parts.length - 1].slice(0, 8)}⟩`;
      abbr[`from '${imp}'`] = `from '${short}'`;
    }
  }

  return abbr;
}
