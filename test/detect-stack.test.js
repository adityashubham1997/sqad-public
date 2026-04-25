/**
 * Tests for lib/detect/stack.js
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { detectStack } from '../lib/detect/stack.js';

describe('detectStack', () => {
  let tempDir;

  before(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'sqad-test-stack-'));
  });

  after(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('detects JavaScript from package.json', () => {
    const dir = join(tempDir, 'js-project');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'package.json'), JSON.stringify({
      name: 'test',
      scripts: { test: 'jest', build: 'tsc' },
      dependencies: { express: '^4.0.0' },
      devDependencies: { jest: '^29.0.0' },
    }));

    const result = detectStack(dir);
    assert.ok(result.languages.includes('javascript'));
    assert.ok(result.frameworks.includes('express'));
    assert.ok(result.test_frameworks.includes('jest'));
    assert.equal(result.test_command, 'npm test');
    assert.equal(result.build_command, 'npm run build');
  });

  it('detects TypeScript from tsconfig.json', () => {
    const dir = join(tempDir, 'ts-project');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'tsconfig.json'), '{}');
    writeFileSync(join(dir, 'package.json'), JSON.stringify({
      name: 'test',
      devDependencies: { typescript: '^5.0.0' },
    }));

    const result = detectStack(dir);
    assert.ok(result.languages.includes('typescript'));
  });

  it('detects Python from requirements.txt', () => {
    const dir = join(tempDir, 'py-project');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'requirements.txt'), 'flask==2.0\n');

    const result = detectStack(dir);
    assert.ok(result.languages.includes('python'));
  });

  it('detects Go from go.mod', () => {
    const dir = join(tempDir, 'go-project');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'go.mod'), 'module example.com/test\ngo 1.21\n');

    const result = detectStack(dir);
    assert.ok(result.languages.includes('go'));
    assert.equal(result.test_command, 'go test ./...');
    assert.equal(result.build_command, 'go build ./...');
  });

  it('detects Rust from Cargo.toml', () => {
    const dir = join(tempDir, 'rust-project');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'Cargo.toml'), '[package]\nname = "test"\n');

    const result = detectStack(dir);
    assert.ok(result.languages.includes('rust'));
    assert.ok(result.build_tools.includes('cargo'));
    assert.equal(result.test_command, 'cargo test');
  });

  it('detects Ruby from Gemfile', () => {
    const dir = join(tempDir, 'ruby-project');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'Gemfile'), 'source "https://rubygems.org"\n');

    const result = detectStack(dir);
    assert.ok(result.languages.includes('ruby'));
  });

  it('detects React framework from dependencies', () => {
    const dir = join(tempDir, 'react-project');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'package.json'), JSON.stringify({
      name: 'test',
      dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' },
    }));

    const result = detectStack(dir);
    assert.ok(result.frameworks.includes('react'));
  });

  it('returns empty arrays for empty directory', () => {
    const dir = join(tempDir, 'empty-project');
    mkdirSync(dir, { recursive: true });

    const result = detectStack(dir);
    assert.deepEqual(result.languages, []);
    assert.deepEqual(result.frameworks, []);
    assert.deepEqual(result.build_tools, []);
    assert.deepEqual(result.test_frameworks, []);
  });

  it('detects Java with Maven', () => {
    const dir = join(tempDir, 'java-maven');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'pom.xml'), '<project></project>');

    const result = detectStack(dir);
    assert.ok(result.languages.includes('java'));
    assert.ok(result.build_tools.includes('maven'));
    assert.equal(result.build_command, 'mvn clean install');
  });
});
