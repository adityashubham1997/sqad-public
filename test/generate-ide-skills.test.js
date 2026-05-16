/**
 * Tests for lib/generate/ide-skills.js
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { discoverSkills, listSkillNames } from '../lib/generate/ide-skills.js';

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
