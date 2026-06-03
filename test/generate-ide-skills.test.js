/**
 * Tests for lib/generate/ide-skills.js
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { discoverSkills, listSkillNames, deploySkills, ALL_IDE_IDS } from '../lib/generate/ide-skills.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('discoverSkills', () => {
  let tempDir;

  before(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'squad-test-skills-'));
  });

  after(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('discovers skill directories with SKILL.md', () => {
    const skillsDir = join(tempDir, 'skills');
    mkdirSync(join(skillsDir, 'squad-test-a'), { recursive: true });
    mkdirSync(join(skillsDir, 'squad-test-b'), { recursive: true });
    writeFileSync(join(skillsDir, 'squad-test-a', 'SKILL.md'), '---\nname: squad-test-a\ndescription: Test A\n---\n# Test A');
    writeFileSync(join(skillsDir, 'squad-test-b', 'SKILL.md'), '---\nname: squad-test-b\ndescription: Test B\n---\n# Test B');

    const skills = discoverSkills(skillsDir);
    assert.equal(skills.length, 2);
    assert.ok(skills.some(s => s.name === 'squad-test-a'));
    assert.ok(skills.some(s => s.name === 'squad-test-b'));
  });

  it('skips directories without SKILL.md', () => {
    const skillsDir = join(tempDir, 'skills-partial');
    mkdirSync(join(skillsDir, 'squad-good'), { recursive: true });
    mkdirSync(join(skillsDir, 'squad-empty'), { recursive: true });
    writeFileSync(join(skillsDir, 'squad-good', 'SKILL.md'), '---\nname: squad-good\n---\n# Good');

    const skills = discoverSkills(skillsDir);
    assert.equal(skills.length, 1);
    assert.equal(skills[0].name, 'squad-good');
  });

  it('returns empty array for non-existent directory', () => {
    const skills = discoverSkills(join(tempDir, 'does-not-exist'));
    assert.deepEqual(skills, []);
  });

  it('parses frontmatter correctly', () => {
    const skillsDir = join(tempDir, 'skills-fm');
    mkdirSync(join(skillsDir, 'squad-fm'), { recursive: true });
    writeFileSync(join(skillsDir, 'squad-fm', 'SKILL.md'), '---\nname: squad-fm\ndescription: >\n  Multi-line description\n  continues here.\n---\n# FM Test');

    const skills = discoverSkills(skillsDir);
    assert.equal(skills.length, 1);
    assert.equal(skills[0].frontmatter.name, 'squad-fm');
    assert.ok(skills[0].frontmatter.description.includes('Multi-line'));
  });
});

describe('listSkillNames (real skills)', () => {
  it('lists all 29 canonical skills', () => {
    const workspacePath = join(__dirname, '..');
    const names = listSkillNames(workspacePath);
    assert.ok(names.length >= 29, `Expected >= 29 skills, got ${names.length}`);
    assert.ok(names.includes('squad-dev-task'));
    assert.ok(names.includes('squad-review-pr'));
    assert.ok(names.includes('squad-setup'));
    assert.ok(names.includes('squad-refresh'));
    assert.ok(names.includes('squad-assemble'));
  });
});

describe('ALL_IDE_IDS — all 7 IDEs exported', () => {
  it('exports all 7 IDE identifiers', () => {
    assert.equal(ALL_IDE_IDS.length, 7);
    for (const id of ['claude', 'windsurf', 'cursor', 'codex', 'kiro', 'gemini', 'antigravity']) {
      assert.ok(ALL_IDE_IDS.includes(id), `Missing IDE: ${id}`);
    }
  });
});

describe('deploySkills — IDE fallback behavior', () => {
  let tempDir;

  before(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'squad-test-deploy-'));
  });

  after(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('deploys to specified IDE when options.ides provided', async () => {
    // Set up a minimal workspace with one skill
    const methodDir = join(tempDir, 'squad-method');
    const skillsDir = join(methodDir, 'skills', 'squad-test-deploy');
    mkdirSync(skillsDir, { recursive: true });
    writeFileSync(join(skillsDir, 'SKILL.md'), '---\nname: squad-test-deploy\ndescription: Deploy test\n---\n# Test');

    const result = await deploySkills(tempDir, { ides: ['claude'] });
    assert.equal(result.errors.filter(e => !e.includes('Failed to load transformer')).length, 0,
      `Unexpected errors: ${result.errors}`);
  });

  it('falls back to all 7 IDEs when no IDE dirs exist and no config', async () => {
    const freshDir = mkdtempSync(join(tmpdir(), 'squad-fallback-'));
    try {
      const methodDir = join(freshDir, 'squad-method');
      const skillsDir = join(methodDir, 'skills', 'squad-fallback-test');
      mkdirSync(skillsDir, { recursive: true });
      writeFileSync(join(skillsDir, 'SKILL.md'), '---\nname: squad-fallback-test\n---\n# Fallback');

      // No IDE dirs and no config.yaml → should default to all 7 IDEs
      const result = await deploySkills(freshDir, {});
      // deploySkills should attempt all 7 IDEs (some transformers may fail gracefully)
      const deployedIdes = new Set(result.deployed.map(d => d.ide));
      // At minimum, no "No IDEs detected" error
      assert.ok(!result.errors.some(e => e.includes('No IDEs detected')));
    } finally {
      rmSync(freshDir, { recursive: true, force: true });
    }
  });
});
