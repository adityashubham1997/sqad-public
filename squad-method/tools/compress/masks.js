/**
 * Mask engine for SQUAD compression pipeline.
 * Protects critical content from compression by replacing with __MASK_N__ placeholders
 * and restoring them verbatim after compression.
 */

const MASK_PREFIX = '__SQUAD_MASK_';
const MASK_SUFFIX = '__';

/**
 * Apply masks to protect critical content regions.
 * Returns { masked: string, regions: Map<string, string> }
 */
export function applyMasks(text) {
  const regions = new Map();
  let counter = 0;
  let result = text;

  const protect = (str, matched) => {
    const key = `${MASK_PREFIX}${counter++}${MASK_SUFFIX}`;
    regions.set(key, matched);
    return str.replace(matched, key);
  };

  // Protect error messages (Error:... lines and stack traces)
  result = result.replace(/((?:Error|TypeError|ReferenceError|SyntaxError|RangeError)[^\n]*(?:\n\s+at[^\n]*)*)/g, (match) => {
    const key = `${MASK_PREFIX}${counter++}${MASK_SUFFIX}`;
    regions.set(key, match);
    return key;
  });

  // Protect test assertions (assert.*, expect.*, should.*)
  result = result.replace(/((?:assert|expect|should)\s*[.(][^\n]*)/g, (match) => {
    const key = `${MASK_PREFIX}${counter++}${MASK_SUFFIX}`;
    regions.set(key, match);
    return key;
  });

  // Protect KG graph data (JSON objects with "nodes" or "edges" keys)
  result = result.replace(/(\{[^{}]*"(?:nodes|edges)"[^{}]*\})/gs, (match) => {
    if (match.length > 50) {
      const key = `${MASK_PREFIX}${counter++}${MASK_SUFFIX}`;
      regions.set(key, match);
      return key;
    }
    return match;
  });

  // Protect quoted user input (lines starting with > like markdown quotes)
  result = result.replace(/(^(?:>[^\n]*\n)+)/gm, (match) => {
    const key = `${MASK_PREFIX}${counter++}${MASK_SUFFIX}`;
    regions.set(key, match);
    return key;
  });

  return { masked: result, regions };
}

/**
 * Restore all masked regions verbatim.
 */
export function restoreMasks(text, regions) {
  let result = text;
  for (const [key, value] of regions) {
    result = result.replaceAll(key, value);
  }
  return result;
}
