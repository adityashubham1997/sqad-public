/**
 * Universal compressor — language-agnostic compression applied after handlers.
 * Runs on all content types.
 */

/**
 * Apply universal compression to text.
 * @param {string} text
 * @param {object} [schemas] - Learned domain schemas from learn.js
 * @returns {string}
 */
export function universalCompress(text, schemas = null) {
  if (!text) return text;
  let result = text;

  // Strip line number prefixes (e.g., "   1\t", "  42→ ", " 123: ")
  result = result.replace(/^\s*\d+[→:\t]\s?/gm, '');

  // Remove trailing whitespace on each line
  result = result.replace(/[ \t]+$/gm, '');

  // Collapse runs of 3+ blank lines into 2
  result = result.replace(/\n{3,}/g, '\n\n');

  // Abbreviate common long paths
  result = result.replace(/\bnode_modules\//g, 'nm/');
  result = result.replace(/\/__pycache__\//g, '/pyc/');

  // Deduplicate identical blocks (3+ identical lines in sequence)
  result = deduplicateBlocks(result);

  // Apply learned schema abbreviations if available
  if (schemas?.abbreviations) {
    for (const [full, abbr] of Object.entries(schemas.abbreviations)) {
      result = result.replaceAll(full, abbr);
    }
  }

  return result;
}

/**
 * Collapse sequences of 3+ identical lines to: first_line [×N]
 */
function deduplicateBlocks(text) {
  const lines = text.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    let count = 1;
    while (i + count < lines.length && lines[i + count] === line) {
      count++;
    }
    if (count >= 3) {
      result.push(line);
      result.push(`[×${count} identical lines]`);
    } else {
      for (let j = 0; j < count; j++) result.push(line);
    }
    i += count;
  }

  return result.join('\n');
}
