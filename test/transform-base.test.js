/**
 * Tests for lib/transform/base.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { toMdcFrontmatter, stripFrontmatter } from '../lib/transform/base.js';

describe('stripFrontmatter', () => {
  it('removes YAML frontmatter from markdown', () => {
    const input = '---\nname: test\ndescription: hello\n---\n# Title\nBody text.';
    const result = stripFrontmatter(input);
    assert.equal(result, '# Title\nBody text.');
  });

  it('returns unchanged content if no frontmatter', () => {
    const input = '# Title\nBody text.';
    const result = stripFrontmatter(input);
    assert.equal(result, '# Title\nBody text.');
  });
});

describe('toMdcFrontmatter', () => {
  it('generates Cursor MDC frontmatter', () => {
    const fm = { name: 'squad-test', description: 'Test skill for testing.' };
    const result = toMdcFrontmatter(fm);
    assert.ok(result.includes('description: Test skill for testing.'));
    assert.ok(result.includes('alwaysApply: false'));
    assert.ok(result.startsWith('---'));
    assert.ok(result.endsWith('---\n'));
  });

  it('handles empty frontmatter', () => {
    const result = toMdcFrontmatter({});
    assert.ok(result.includes('description: '));
  });
});
