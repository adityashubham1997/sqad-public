/**
 * Tests for lib/detect/tracker.js
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { detectTracker } from '../lib/detect/tracker.js';

describe('detectTracker', () => {
  let tempDir;

  before(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'sqad-test-tracker-'));
  });

  after(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('detects Jira from .jira.yml', () => {
    const dir = join(tempDir, 'jira-project');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, '.jira.yml'), 'board: 1\n');

    const result = detectTracker(dir);
    assert.equal(result.type, 'jira');
  });

  it('detects GitHub Issues from ISSUE_TEMPLATE', () => {
    const dir = join(tempDir, 'gh-issues');
    mkdirSync(join(dir, '.github', 'ISSUE_TEMPLATE'), { recursive: true });

    const result = detectTracker(dir);
    assert.equal(result.type, 'github-issues');
  });

  it('returns empty type for unknown workspace', () => {
    const dir = join(tempDir, 'unknown');
    mkdirSync(dir, { recursive: true });

    const result = detectTracker(dir);
    assert.equal(result.type, '');
  });
});
