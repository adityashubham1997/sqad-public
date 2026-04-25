import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { detectCloud } from '../lib/detect/cloud.js';

let TMP;

function setup() {
  TMP = mkdtempSync(join(tmpdir(), 'sqad-cloud-deep-'));
}

function teardown() {
  rmSync(TMP, { recursive: true, force: true });
}

describe('Deep recursive cloud detection', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('detects Terraform in nested infra/ directory', () => {
    const infraDir = join(TMP, 'infra', 'modules', 'vpc');
    mkdirSync(infraDir, { recursive: true });
    writeFileSync(join(infraDir, 'main.tf'), `
provider "aws" {
  region = "us-east-1"
}
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}
`);
    const result = detectCloud(TMP);
    assert.ok(result.iac.includes('terraform'), 'should detect terraform from nested .tf files');
    assert.ok(result.providers.includes('aws'), 'should detect AWS provider from nested .tf');
  });

  it('detects Dockerfile in nested service directories', () => {
    const svcDir = join(TMP, 'services', 'api');
    mkdirSync(svcDir, { recursive: true });
    writeFileSync(join(svcDir, 'Dockerfile'), 'FROM node:20\nCOPY . .\nCMD ["node", "index.js"]');
    const result = detectCloud(TMP);
    assert.ok(result.container.includes('docker'), 'should detect Docker from nested Dockerfile');
  });

  it('detects Kubernetes from YAML manifests', () => {
    const deployDir = join(TMP, 'deploy');
    mkdirSync(deployDir, { recursive: true });
    writeFileSync(join(deployDir, 'deployment.yaml'), `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
`);
    const result = detectCloud(TMP);
    assert.ok(result.container.includes('kubernetes'), 'should detect K8s from manifest content');
  });

  it('detects Helm charts', () => {
    const chartDir = join(TMP, 'charts', 'myapp');
    mkdirSync(chartDir, { recursive: true });
    writeFileSync(join(chartDir, 'Chart.yaml'), 'apiVersion: v2\nname: myapp\nversion: 1.0.0');
    const result = detectCloud(TMP);
    assert.ok(result.container.includes('kubernetes'), 'should detect K8s from Helm Chart.yaml');
  });

  it('detects Pulumi', () => {
    writeFileSync(join(TMP, 'Pulumi.yaml'), 'name: myproject\nruntime: nodejs');
    const result = detectCloud(TMP);
    assert.ok(result.iac.includes('pulumi'), 'should detect Pulumi');
  });

  it('detects multiple monitoring tools', () => {
    writeFileSync(join(TMP, 'prometheus.yml'), 'global:\n  scrape_interval: 15s');
    writeFileSync(join(TMP, '.sentryclirc'), '[defaults]\norg=myorg');
    const result = detectCloud(TMP);
    assert.ok(result.monitoring.includes('prometheus'), 'should detect Prometheus');
    assert.ok(result.monitoring.includes('sentry'), 'should detect Sentry');
  });

  it('detects GCP and Azure providers from nested Terraform', () => {
    const gcpDir = join(TMP, 'terraform', 'gcp');
    const azureDir = join(TMP, 'terraform', 'azure');
    mkdirSync(gcpDir, { recursive: true });
    mkdirSync(azureDir, { recursive: true });
    writeFileSync(join(gcpDir, 'main.tf'), 'provider "google" { project = "my-proj" }');
    writeFileSync(join(azureDir, 'main.tf'), 'provider "azurerm" { features {} }');
    const result = detectCloud(TMP);
    assert.ok(result.providers.includes('gcp'), 'should detect GCP from nested TF');
    assert.ok(result.providers.includes('azure'), 'should detect Azure from nested TF');
  });
});
