/**
 * Tests for SQUAD Native Compression Pipeline (S3.2)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { compress, detect } from '../squad-method/tools/compress/index.js';
import { applyMasks, restoreMasks } from '../squad-method/tools/compress/masks.js';
import { universalCompress } from '../squad-method/tools/compress/universal.js';
import { compressCode } from '../squad-method/tools/compress/handlers/code.js';
import { compressJson } from '../squad-method/tools/compress/handlers/json.js';
import { compressGrep } from '../squad-method/tools/compress/handlers/grep.js';
import { compressLog } from '../squad-method/tools/compress/handlers/log.js';
import { compressListing } from '../squad-method/tools/compress/handlers/listing.js';

// ─── detect.js ─────────────────────────────────────────────────────────────

describe('detect — content-type detection', () => {
  it('detects JSON correctly', () => {
    assert.equal(detect('{"key": "value", "num": 42}'), 'json');
    assert.equal(detect('["a", "b", "c"]'), 'json');
  });

  it('detects error/stack trace', () => {
    assert.equal(detect('Error: Cannot find module\n  at Object.<anonymous> (foo.js:10:5)'), 'error');
  });

  it('detects code', () => {
    assert.equal(detect('import React from "react";\nconst foo = () => {};'), 'code');
    assert.equal(detect('def main():\n  pass'), 'code');
  });

  it('detects log with timestamp', () => {
    assert.equal(detect('2026-01-01T12:00:00 [INFO] Server started\n2026-01-01T12:00:01 [WARN] High load'), 'log');
  });

  it('returns unknown for empty or short text', () => {
    assert.equal(detect(''), 'unknown');
    assert.equal(detect('hello'), 'unknown');
  });
});

// ─── masks.js ──────────────────────────────────────────────────────────────

describe('masks — protect critical content', () => {
  it('masks and restores error messages verbatim', () => {
    const text = 'Some output\nError: TypeError: x is not defined\nMore output';
    const { masked, regions } = applyMasks(text);
    const restored = restoreMasks(masked, regions);
    assert.equal(restored, text, 'Content must be identical after mask/restore cycle');
  });

  it('does not lose any content through mask/restore cycle', () => {
    const text = 'assert.equal(1, 2) // test assertion\nnormal line\n> user quoted text\n';
    const { masked, regions } = applyMasks(text);
    const restored = restoreMasks(masked, regions);
    assert.equal(restored, text);
  });

  it('replaces masks with placeholder keys', () => {
    const text = 'Error: something went wrong\nat foo.js:10';
    const { masked } = applyMasks(text);
    assert.ok(masked.includes('__SQUAD_MASK_'), 'Should contain mask placeholder');
  });
});

// ─── universal.js ──────────────────────────────────────────────────────────

describe('universalCompress', () => {
  it('strips line number prefixes', () => {
    const input = '   1\tconst x = 1;\n   2\tconst y = 2;';
    const result = universalCompress(input);
    assert.ok(!result.includes('   1\t'), 'Should strip line number prefix');
    assert.ok(result.includes('const x = 1'), 'Should keep content');
  });

  it('abbreviates node_modules', () => {
    const result = universalCompress('Error in node_modules/express/index.js');
    assert.ok(result.includes('nm/'), 'Should abbreviate node_modules');
  });

  it('collapses 3+ identical lines', () => {
    const input = 'line\nline\nline\nline\nother';
    const result = universalCompress(input);
    assert.ok(result.includes('[×4 identical lines]'), 'Should collapse repeated lines');
    assert.ok(!result.includes('line\nline\nline\nline'), 'Should not repeat 4 times');
  });

  it('collapses multiple blank lines', () => {
    const result = universalCompress('a\n\n\n\n\nb');
    assert.equal(result.split('\n').filter(l => !l.trim()).length, 1,
      'Should collapse to max 1 blank line');
  });
});

// ─── handlers/code.js ──────────────────────────────────────────────────────

describe('compressCode', () => {
  it('strips single-line comments', () => {
    const result = compressCode('const x = 1; // this is a comment\nconst y = 2;');
    assert.ok(!result.includes('// this is a comment'), 'Should remove comment');
    assert.ok(result.includes('const y = 2'), 'Should keep code');
  });

  it('does not strip shebang lines', () => {
    const result = compressCode('#!/usr/bin/env node\nconst x = 1;');
    assert.ok(result.includes('#!/usr/bin/env node'), 'Should preserve shebang');
  });

  it('collapses 4+ import lines into a summary', () => {
    const input = [
      "import React from 'react';",
      "import { useState } from 'react';",
      "import { useEffect } from 'react';",
      "import { useCallback } from 'react';",
      "import axios from 'axios';",
      'const x = 1;',
    ].join('\n');
    const result = compressCode(input);
    assert.ok(result.includes('/* imports:'), 'Should collapse imports to summary');
    assert.ok(result.includes('const x = 1'), 'Should keep non-import code');
  });
});

// ─── handlers/json.js ──────────────────────────────────────────────────────

describe('compressJson', () => {
  it('minifies and truncates large arrays', () => {
    const input = JSON.stringify({ items: Array.from({ length: 20 }, (_, i) => i) });
    const result = compressJson(input);
    const parsed = JSON.parse(result);
    assert.ok(parsed.items.length <= 11, 'Should truncate array to 10 + message');
    assert.ok(typeof parsed.items[parsed.items.length - 1] === 'string', 'Last item should be truncation note');
  });

  it('strips null fields', () => {
    const input = JSON.stringify({ a: 1, b: null, c: 'value' });
    const result = compressJson(input);
    const parsed = JSON.parse(result);
    assert.ok(!('b' in parsed), 'Should strip null fields');
    assert.equal(parsed.a, 1);
  });

  it('collapses deeply nested objects', () => {
    const input = JSON.stringify({ a: { b: { c: { d: { e: 'deep' } } } } });
    const result = compressJson(input);
    assert.ok(result.includes('{...}') || result.length < input.length, 'Should reduce deep nesting');
  });

  it('returns original text if not valid JSON', () => {
    const text = 'not json at all';
    assert.equal(compressJson(text), text);
  });
});

// ─── handlers/grep.js ──────────────────────────────────────────────────────

describe('compressGrep', () => {
  it('groups matches by file', () => {
    const input = [
      'src/auth.js:10:const token = getToken();',
      'src/auth.js:25:return token;',
      'src/user.js:5:const token = null;',
    ].join('\n');
    const result = compressGrep(input);
    assert.ok(result.includes('src/auth.js:'), 'Should group auth.js matches');
    assert.ok(result.includes('src/user.js:'), 'Should include user.js');
  });

  it('deduplicates identical matches', () => {
    const input = Array.from({ length: 10 }, (_, i) =>
      `src/file.js:${i}:const x = getConfig();`
    ).join('\n');
    const result = compressGrep(input);
    // Should collapse similar matches
    assert.ok(result.length < input.length, 'Should reduce duplicate matches');
  });
});

// ─── handlers/log.js ───────────────────────────────────────────────────────

describe('compressLog', () => {
  it('collapses repeated log lines', () => {
    const line = '2026-01-01 INFO: Heartbeat OK';
    const input = Array.from({ length: 5 }, () => line).join('\n');
    const result = compressLog(input);
    assert.ok(result.includes('[×5 repeated]'), 'Should collapse 5 identical lines');
    assert.equal(result.split(line).length - 1, 1, 'Should only appear once');
  });

  it('summarizes long stack traces', () => {
    const input = [
      'Error: something failed',
      '    at foo (foo.js:10:5)',
      '    at bar (bar.js:20:3)',
      '    at baz (baz.js:30:1)',
      '    at qux (qux.js:40:1)',
      '    at quux (quux.js:50:1)',
    ].join('\n');
    const result = compressLog(input);
    assert.ok(result.includes('frames omitted'), 'Should note omitted frames');
    assert.ok(result.includes('quux.js'), 'Should keep origin frame');
    assert.ok(result.includes('foo.js'), 'Should keep first frame');
  });
});

// ─── handlers/listing.js ───────────────────────────────────────────────────

describe('compressListing', () => {
  it('summarizes by extension', () => {
    const files = [
      'src/a.js', 'src/b.js', 'src/c.ts', 'lib/d.ts',
      'test/e.test.js', 'README.md', 'package.json',
    ];
    const result = compressListing(files.join('\n'));
    assert.ok(result.includes('.js') || result.includes('.ts'), 'Should include extensions in summary');
    assert.ok(result.includes('['), 'Should have file count summary');
  });

  it('collapses deep paths', () => {
    const result = compressListing('src/components/ui/buttons/PrimaryButton.tsx');
    assert.ok(result.includes('.../'), 'Should collapse deep path');
  });
});

// ─── compress pipeline (end-to-end) ────────────────────────────────────────

describe('compress — end-to-end pipeline', () => {
  it('reduces size of repetitive code content', () => {
    const code = Array.from({ length: 10 }, (_, i) =>
      `import module${i} from './module${i}';`
    ).join('\n') + '\n\nconst x = 1;';

    const { stats } = compress(code, { type: 'code' });
    assert.ok(stats.ratio < 1, `Expected compression, got ratio ${stats.ratio}`);
  });

  it('does not lose error messages through pipeline', () => {
    const text = 'Processing...\nError: ENOENT: no such file or directory\nDone.';
    const { compressed } = compress(text);
    assert.ok(compressed.includes('Error: ENOENT'), 'Error message must survive compression');
  });

  it('returns stats with original/compressed/ratio/type', () => {
    const { stats } = compress('{"key": "value"}');
    assert.equal(typeof stats.original, 'number');
    assert.equal(typeof stats.compressed, 'number');
    assert.equal(typeof stats.ratio, 'number');
    assert.equal(typeof stats.type, 'string');
  });

  it('handles empty input gracefully', () => {
    const { compressed, stats } = compress('');
    assert.equal(compressed, '');
    assert.equal(stats.ratio, 1);
  });
});
