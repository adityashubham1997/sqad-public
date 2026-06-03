/**
 * Code content handler for SQUAD compression pipeline.
 * Strips comments, collapses import blocks, removes excess blank lines.
 */

/**
 * Compress code content.
 * @param {string} text
 * @returns {string}
 */
export function compressCode(text) {
  if (!text) return text;
  let result = text;

  // Strip standalone // comment lines
  result = result.replace(/^[ \t]*\/\/[^\n]*\n/gm, '');
  // Strip inline // comments after code (but not URLs like http://)
  result = result.replace(/(?<![:/])[ \t]+\/\/[^\n]*/g, '');
  // Strip standalone # comment lines (not shebang)
  result = result.replace(/^(?!#!)[ \t]*#[^\n]*\n/gm, '');

  // Strip multi-line comments /* ... */
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');

  // Collapse multiple consecutive import/require lines into a summary
  result = collapseImportBlocks(result);

  // Collapse 2+ blank lines between functions to 1
  result = result.replace(/\n{3,}/g, '\n\n');

  return result.trim();
}

/**
 * Collapse a block of consecutive import lines into a one-liner summary.
 */
function collapseImportBlocks(text) {
  const lines = text.split('\n');
  const result = [];
  let importBuffer = [];

  const flushImports = () => {
    if (importBuffer.length >= 4) {
      const sources = importBuffer
        .map(l => l.match(/from\s+['"]([^'"]+)['"]/)?.[1] || l.match(/require\(['"]([^'"]+)['"]\)/)?.[1])
        .filter(Boolean);
      const unique = [...new Set(sources)];
      result.push(`/* imports: ${unique.slice(0, 5).join(', ')}${unique.length > 5 ? ` +${unique.length - 5} more` : ''} */`);
    } else {
      result.push(...importBuffer);
    }
    importBuffer = [];
  };

  for (const line of lines) {
    const isImport = /^\s*(import\s|from\s|const\s+\w+\s*=\s*require)/.test(line);
    if (isImport) {
      importBuffer.push(line);
    } else {
      if (importBuffer.length > 0) flushImports();
      result.push(line);
    }
  }
  if (importBuffer.length > 0) flushImports();

  return result.join('\n');
}
