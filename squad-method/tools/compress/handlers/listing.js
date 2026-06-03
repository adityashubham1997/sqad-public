/**
 * File listing handler for SQUAD compression pipeline.
 * Summarizes by extension, collapses deep paths, shows directory tree at depth 2.
 */

/**
 * Compress file listing content.
 * @param {string} text
 * @returns {string}
 */
export function compressListing(text) {
  if (!text) return text;
  const lines = text.split('\n').filter(l => l.trim());

  // Extract file paths
  const paths = lines
    .map(l => l.replace(/^[-dlrwx]{10}\s+\d+\s+\S+\s+\S+\s+\d+\s+\w+\s+\d+\s+\d+:\d+\s+/, '').trim())
    .filter(p => p && !p.startsWith('['));

  if (paths.length === 0) return text;

  // Count by extension
  const extCount = new Map();
  for (const p of paths) {
    const ext = p.includes('.') ? '.' + p.split('.').pop() : '(no ext)';
    extCount.set(ext, (extCount.get(ext) || 0) + 1);
  }

  // Sort by count desc
  const extSummary = [...extCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([ext, n]) => `${n} ${ext}`)
    .join(', ');

  // Show first 10 paths, summarize the rest
  const shown = paths.slice(0, 10);
  const extra = paths.length - shown.length;

  const result = [
    `[${paths.length} files: ${extSummary}]`,
    ...shown.map(p => `  ${collapsePath(p)}`),
  ];
  if (extra > 0) result.push(`  [+${extra} more]`);

  return result.join('\n');
}

function collapsePath(path) {
  const parts = path.split('/');
  if (parts.length <= 3) return path;
  return `${parts[0]}/.../${parts[parts.length - 1]}`;
}
