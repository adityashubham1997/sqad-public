/**
 * Shared Detection Utilities
 *
 * Common filesystem scanning helpers used by stack, cloud,
 * and other detection engines. Extracted to avoid duplication.
 */

import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

// Directories to skip during recursive scanning
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', 'bin', 'obj',
  '.next', '.nuxt', '__pycache__', '.venv', 'venv', 'vendor',
  'target', 'coverage', '.angular', '.svelte-kit', '.terraform',
]);

// Max depth for recursive scanning
export const MAX_SCAN_DEPTH = 4;

/**
 * Recursively find files by extension up to a max depth.
 * @param {string} dir - Directory to scan
 * @param {string[]} extensions - File extensions to match (e.g. ['.csproj', '.sln'])
 * @param {number} maxDepth - Maximum recursion depth
 * @param {number} [currentDepth=0]
 * @returns {string[]} - Array of absolute file paths
 */
export function deepFindByExtension(dir, extensions, maxDepth, currentDepth = 0) {
  const results = [];
  if (currentDepth > maxDepth) return results;
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry)) continue;
      const fullPath = join(dir, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isFile() && extensions.includes(extname(entry).toLowerCase())) {
          results.push(fullPath);
        } else if (stat.isDirectory()) {
          results.push(...deepFindByExtension(fullPath, extensions, maxDepth, currentDepth + 1));
        }
      } catch (e) { /* skip inaccessible */ }
    }
  } catch (e) { /* skip unreadable dirs */ }
  return results;
}

/**
 * Recursively find files by exact name up to a max depth.
 * @param {string} dir - Directory to scan
 * @param {string[]} names - File names to match
 * @param {number} maxDepth - Maximum recursion depth
 * @param {number} [currentDepth=0]
 * @returns {string[]} - Array of absolute file paths
 */
export function deepFindByName(dir, names, maxDepth, currentDepth = 0) {
  const results = [];
  if (currentDepth > maxDepth) return results;
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry)) continue;
      const fullPath = join(dir, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isFile() && names.includes(entry)) {
          results.push(fullPath);
        } else if (stat.isDirectory()) {
          // For .xcodeproj/.xcworkspace which are directories
          if (names.some(n => entry.endsWith(n))) {
            results.push(fullPath);
          } else {
            results.push(...deepFindByName(fullPath, names, maxDepth, currentDepth + 1));
          }
        }
      } catch (e) { /* skip inaccessible */ }
    }
  } catch (e) { /* skip unreadable dirs */ }
  return results;
}
