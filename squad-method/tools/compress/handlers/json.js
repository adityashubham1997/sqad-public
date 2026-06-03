/**
 * JSON content handler for SQUAD compression pipeline.
 * Minifies, truncates large arrays, collapses deeply nested objects.
 */

const MAX_ARRAY_ITEMS = 10;
const MAX_DEPTH = 3;

/**
 * Compress JSON content.
 * @param {string} text
 * @returns {string}
 */
export function compressJson(text) {
  if (!text) return text;
  try {
    const parsed = JSON.parse(text);
    const compressed = compressValue(parsed, 0);
    return JSON.stringify(compressed, null, 1);
  } catch (e) {
    // Not valid JSON — return as-is
    return text;
  }
}

function compressValue(val, depth) {
  if (Array.isArray(val)) {
    const truncated = val.slice(0, MAX_ARRAY_ITEMS).map(item => compressValue(item, depth + 1));
    if (val.length > MAX_ARRAY_ITEMS) {
      truncated.push(`... ${val.length - MAX_ARRAY_ITEMS} more items`);
    }
    return truncated;
  }

  if (val !== null && typeof val === 'object') {
    if (depth >= MAX_DEPTH) return '{...}';
    const result = {};
    for (const [k, v] of Object.entries(val)) {
      if (v === null || v === undefined) continue; // strip nulls
      result[k] = compressValue(v, depth + 1);
    }
    return result;
  }

  // Truncate very long strings
  if (typeof val === 'string' && val.length > 200) {
    return val.slice(0, 200) + `...[${val.length - 200} chars truncated]`;
  }

  return val;
}
