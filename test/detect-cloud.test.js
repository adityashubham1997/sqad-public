/**
 * Tests for lib/detect/cloud.js
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { detectCloud } from '../lib/detect/cloud.js';

describe('detectCloud', () => {
  let tempDir;

  before(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'squad-test-cloud-'));
  });

  after(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('detects Docker from Dockerfile', () => {
    const dir = join(tempDir, 'docker-project');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'Dockerfile'), 'FROM node:18\n');

    const result = detectCloud(dir);
    assert.ok(result.container.includes('docker'));
  });

  it('detects GitHub Actions from .github/workflows', () => {
    const dir = join(tempDir, 'gh-actions-project');
    mkdirSync(join(dir, '.github', 'workflows'), { recursive: true });
    writeFileSync(join(dir, '.github', 'workflows', 'ci.yml'), 'name: CI\n');

    const result = detectCloud(dir);
    assert.ok(result.ci_cd.includes('github-actions'));
  });

  it('detects Kubernetes from k8s directory', () => {
    const dir = join(tempDir, 'k8s-project');
    mkdirSync(join(dir, 'k8s'), { recursive: true });

    const result = detectCloud(dir);
    assert.ok(result.container.includes('kubernetes'));
  });

  it('detects AWS from CDK config', () => {
    const dir = join(tempDir, 'cdk-project');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'cdk.json'), '{}');

    const result = detectCloud(dir);
    assert.ok(result.providers.includes('aws'));
    assert.ok(result.iac.includes('cdk'));
  });

  it('detects Terraform with AWS provider', () => {
    const dir = join(tempDir, 'tf-aws');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'main.tf'), 'provider "aws" {\n  region = "us-east-1"\n}\n');

    const result = detectCloud(dir);
    assert.ok(result.iac.includes('terraform'));
    assert.ok(result.providers.includes('aws'));
  });

  it('detects Terraform with GCP provider', () => {
    const dir = join(tempDir, 'tf-gcp');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'main.tf'), 'provider "google" {\n  project = "my-project"\n}\n');

    const result = detectCloud(dir);
    assert.ok(result.iac.includes('terraform'));
    assert.ok(result.providers.includes('gcp'));
  });

  it('detects Terraform with Azure provider', () => {
    const dir = join(tempDir, 'tf-azure');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'main.tf'), 'provider "azurerm" {\n  features {}\n}\n');

    const result = detectCloud(dir);
    assert.ok(result.iac.includes('terraform'));
    assert.ok(result.providers.includes('azure'));
  });

  it('detects GitLab CI', () => {
    const dir = join(tempDir, 'gitlab-project');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, '.gitlab-ci.yml'), 'stages:\n  - test\n');

    const result = detectCloud(dir);
    assert.ok(result.ci_cd.includes('gitlab-ci'));
  });

  it('returns empty arrays for empty directory', () => {
    const dir = join(tempDir, 'empty');
    mkdirSync(dir, { recursive: true });

    const result = detectCloud(dir);
    assert.deepEqual(result.providers, []);
    assert.deepEqual(result.iac, []);
    assert.deepEqual(result.container, []);
    assert.deepEqual(result.ci_cd, []);
  });
});
