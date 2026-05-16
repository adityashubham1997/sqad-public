/**
 * Tests for lib/generate/config.js
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, rmSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { generateConfig, readConfig } from '../lib/generate/config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('generateConfig', () => {
  let tempDir;
  let configPath;

  before(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'squad-test-config-'));
    // Copy the real config.yaml template
    const srcConfig = join(__dirname, '..', 'squad-method', 'config.yaml');
    configPath = join(tempDir, 'config.yaml');
    copyFileSync(srcConfig, configPath);
  });

  after(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('writes user name and role', () => {
    const result = generateConfig(configPath, {
      user: { name: 'Alice', role: 'developer' },
    });
    assert.ok(result.success);
    const content = readFileSync(configPath, 'utf8');
    assert.ok(content.includes('"Alice"'));
    assert.ok(content.includes('"developer"'));
  });

  it('writes stack detection results', () => {
    const result = generateConfig(configPath, {
      stack: {
        languages: ['javascript', 'typescript'],
        frameworks: ['react', 'express'],
        build_tools: ['npm'],
        test_frameworks: ['jest'],
        test_command: 'npm test',
        build_command: 'npm run build',
        lint_command: 'npm run lint',
      },
    });
    assert.ok(result.success);
    const content = readFileSync(configPath, 'utf8');
    assert.ok(content.includes('"javascript"'));
    assert.ok(content.includes('"react"'));
    assert.ok(content.includes('"jest"'));
  });

  it('writes cloud detection results', () => {
    const result = generateConfig(configPath, {
      cloud: {
        providers: ['aws', 'gcp'],
        iac: ['terraform'],
        container: ['docker', 'kubernetes'],
        ci_cd: ['github-actions'],
        monitoring: ['datadog'],
      },
    });
    assert.ok(result.success);
    const content = readFileSync(configPath, 'utf8');
    assert.ok(content.includes('"aws"'));
    assert.ok(content.includes('"terraform"'));
  });
});

describe('readConfig', () => {
  it('returns null for non-existent file', () => {
    const result = readConfig('/non/existent/config.yaml');
    assert.equal(result, null);
  });

  it('parses basic config structure', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'squad-test-readcfg-'));
    const configPath = join(tempDir, 'config.yaml');
    writeFileSync(configPath, `
user:
  name: "Bob"
  role: "architect"
stack:
  languages: ["go", "python"]
`);
    const result = readConfig(configPath);
    assert.ok(result);
    assert.equal(result.user.name, 'Bob');
    assert.equal(result.user.role, 'architect');
    rmSync(tempDir, { recursive: true, force: true });
  });
});
