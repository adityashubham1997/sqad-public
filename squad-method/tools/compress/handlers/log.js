/**
 * Log/error content handler for SQUAD compression pipeline.
 * Collapses repeated log lines, summarizes stack traces, groups by time.
 */

/**
 * Compress log content.
 * @param {string} text
 * @returns {string}
 */
export function compressLog(text) {
  if (!text) return text;
  const lines = text.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Collapse repeated identical log lines
    let count = 1;
    while (i + count < lines.length && lines[i + count] === line) count++;
    if (count >= 3) {
      result.push(line);
      result.push(`[×${count} repeated]`);
      i += count;
      continue;
    }

    // Summarize stack traces (keep first 3 frames + origin)
    if (/^\s+at\s/.test(line)) {
      const frames = [line];
      let j = i + 1;
      while (j < lines.length && /^\s+at\s/.test(lines[j])) {
        frames.push(lines[j]);
        j++;
      }
      if (frames.length > 3) {
        result.push(frames[0]);
        result.push(frames[1]);
        result.push(frames[frames.length - 1]); // keep origin
        if (frames.length > 3) result.push(`  [+${frames.length - 3} frames omitted]`);
      } else {
        result.push(...frames);
      }
      i = j;
      continue;
    }

    result.push(line);
    i++;
  }

  return result.join('\n');
}
