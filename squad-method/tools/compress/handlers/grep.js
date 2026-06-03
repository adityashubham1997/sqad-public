/**
 * Grep output handler for SQUAD compression pipeline.
 * Groups matches by file, deduplicates near-identical lines, collapses patterns.
 */

/**
 * Compress grep output.
 * @param {string} text
 * @returns {string}
 */
export function compressGrep(text) {
  if (!text) return text;
  const lines = text.split('\n').filter(l => l.trim());

  // Group by file
  const byFile = new Map();
  for (const line of lines) {
    const match = line.match(/^([^:]+):(\d+):(.*)$/) || line.match(/^([^:]+):(.*)$/);
    if (!match) continue;

    const file = match[1];
    const content = match[3] || match[2];

    if (!byFile.has(file)) byFile.set(file, []);
    byFile.get(file).push(content.trim());
  }

  if (byFile.size === 0) return text;

  const result = [];
  for (const [file, matches] of byFile) {
    // Deduplicate near-identical matches (same content after trimming)
    const unique = [...new Set(matches)];
    const truncated = unique.slice(0, 5);
    const extra = unique.length - truncated.length;

    result.push(`${file}:`);
    for (const m of truncated) {
      result.push(`  ${m}`);
    }
    if (extra > 0) result.push(`  [+${extra} similar matches]`);
  }

  return result.join('\n');
}
