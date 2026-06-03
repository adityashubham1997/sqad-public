/**
 * SQUAD Compression Pipeline Orchestrator
 *
 * compress(text, options) → { compressed, stats }
 *
 * Pipeline: detect → mask → handle → universal → unmask
 */

import { detect } from './detect.js';
import { applyMasks, restoreMasks } from './masks.js';
import { universalCompress } from './universal.js';
import { compressCode } from './handlers/code.js';
import { compressJson } from './handlers/json.js';
import { compressGrep } from './handlers/grep.js';
import { compressLog } from './handlers/log.js';
import { compressListing } from './handlers/listing.js';

const HANDLERS = {
  code:         compressCode,
  json:         compressJson,
  grep:         compressGrep,
  log:          compressLog,
  error:        compressLog,   // error uses same handler as log
  'file-listing': compressListing,
  markdown:     null,          // no domain handler — universal only
  config:       null,
  unknown:      null,
};

/**
 * Compress text through the full pipeline.
 *
 * @param {string} text - Input text to compress
 * @param {object} [options]
 * @param {string} [options.type] - Force content type instead of auto-detecting
 * @param {object} [options.schemas] - Learned domain schemas from learn.js
 * @returns {{ compressed: string, stats: { original: number, compressed: number, ratio: number, type: string } }}
 */
export function compress(text, options = {}) {
  if (!text || typeof text !== 'string') {
    return { compressed: text, stats: { original: 0, compressed: 0, ratio: 1, type: 'empty' } };
  }

  const original = text.length;

  // Step 1: Detect content type
  const contentType = options.type || detect(text);

  // Step 2: Apply masks to protect critical content
  const { masked, regions } = applyMasks(text);

  // Step 3: Apply domain-specific handler
  const handler = HANDLERS[contentType];
  let handled = handler ? handler(masked) : masked;

  // Step 4: Universal compression
  const universaled = universalCompress(handled, options.schemas);

  // Step 5: Restore masked regions
  const compressed = restoreMasks(universaled, regions);

  const compressedLen = compressed.length;
  const ratio = original > 0 ? compressedLen / original : 1;

  return {
    compressed,
    stats: {
      original,
      compressed: compressedLen,
      ratio: Math.round(ratio * 100) / 100,
      type: contentType,
    },
  };
}

export { detect } from './detect.js';
export { learnSchemas } from './learn.js';
