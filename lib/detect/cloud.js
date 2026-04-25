/**
 * Cloud & Infrastructure Detection Engine
 *
 * Scans workspace for IaC files, container configs, CI/CD pipelines,
 * and cloud provider markers.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { deepFindByExtension, deepFindByName, MAX_SCAN_DEPTH } from './utils.js';

/**
 * Detect cloud infrastructure in a workspace directory.
 * @param {string} workspacePath - Absolute path to workspace root
 * @returns {{ providers: string[], iac: string[], container: string[], ci_cd: string[], monitoring: string[] }}
 */
export function detectCloud(workspacePath) {
  const result = {
    providers: [],
    iac: [],
    container: [],
    ci_cd: [],
    monitoring: [],
  };

  // Terraform (deep recursive scan)
  const tfFiles = deepFindByExtension(workspacePath, ['.tf'], MAX_SCAN_DEPTH);
  if (tfFiles.length > 0) {
    result.iac.push('terraform');
    // Detect cloud providers from all Terraform files found
    detectTerraformProvidersFromFiles(tfFiles, result);
  }

  // AWS CDK
  if (existsSync(join(workspacePath, 'cdk.json'))) {
    result.iac.push('cdk');
    if (!result.providers.includes('aws')) result.providers.push('aws');
  }

  // Docker (deep recursive scan for Dockerfiles)
  const dockerFiles = deepFindByName(workspacePath, ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml'], MAX_SCAN_DEPTH);
  if (dockerFiles.length > 0) {
    result.container.push('docker');
  }

  // Kubernetes (check for k8s directories and deep scan for manifests)
  if (existsSync(join(workspacePath, 'k8s')) || existsSync(join(workspacePath, 'kubernetes')) || existsSync(join(workspacePath, 'helm'))) {
    result.container.push('kubernetes');
  } else {
    // Deep scan for Kubernetes manifests (kind: Deployment, kind: Service, etc.)
    const yamlFiles = deepFindByExtension(workspacePath, ['.yaml', '.yml'], 3);
    for (const yamlFile of yamlFiles) {
      try {
        const content = readFileSync(yamlFile, 'utf8');
        if (content.includes('kind: Deployment') || content.includes('kind: Service') ||
            content.includes('kind: StatefulSet') || content.includes('kind: DaemonSet') ||
            content.includes('kind: Ingress') || content.includes('kind: ConfigMap')) {
          if (!result.container.includes('kubernetes')) result.container.push('kubernetes');
          break;
        }
      } catch (e) { /* ignore */ }
    }
  }

  // Helm charts
  const chartFiles = deepFindByName(workspacePath, ['Chart.yaml'], MAX_SCAN_DEPTH);
  if (chartFiles.length > 0 && !result.container.includes('kubernetes')) {
    result.container.push('kubernetes');
  }

  // Pulumi
  if (existsSync(join(workspacePath, 'Pulumi.yaml')) || existsSync(join(workspacePath, 'Pulumi.yml'))) {
    result.iac.push('pulumi');
  }

  // CI/CD
  if (existsSync(join(workspacePath, '.github', 'workflows'))) {
    result.ci_cd.push('github-actions');
  }
  if (existsSync(join(workspacePath, '.gitlab-ci.yml'))) {
    result.ci_cd.push('gitlab-ci');
  }
  if (existsSync(join(workspacePath, 'Jenkinsfile'))) {
    result.ci_cd.push('jenkins');
  }
  if (existsSync(join(workspacePath, '.circleci'))) {
    result.ci_cd.push('circleci');
  }
  if (existsSync(join(workspacePath, 'azure-pipelines.yml')) || existsSync(join(workspacePath, 'azure-pipelines.yaml'))) {
    result.ci_cd.push('azure-devops');
    if (!result.providers.includes('azure')) result.providers.push('azure');
  }

  // Ansible
  if (existsSync(join(workspacePath, 'ansible.cfg')) || existsSync(join(workspacePath, 'playbook.yml')) || existsSync(join(workspacePath, 'playbook.yaml'))) {
    if (!result.iac.includes('ansible')) result.iac.push('ansible');
  } else {
    const ansibleFiles = deepFindByName(workspacePath, ['playbook.yml', 'playbook.yaml', 'site.yml', 'site.yaml'], 3);
    if (ansibleFiles.length > 0 && !result.iac.includes('ansible')) result.iac.push('ansible');
    const inventoryDirs = deepFindByName(workspacePath, ['hosts.yml', 'hosts.yaml', 'hosts.ini'], 3);
    if (inventoryDirs.length > 0 && !result.iac.includes('ansible')) result.iac.push('ansible');
  }

  // Monitoring tools
  if (existsSync(join(workspacePath, 'datadog.yaml')) || existsSync(join(workspacePath, 'datadog.yml'))) {
    result.monitoring.push('datadog');
  }
  // Prometheus
  if (existsSync(join(workspacePath, 'prometheus.yml')) || existsSync(join(workspacePath, 'prometheus.yaml'))) {
    result.monitoring.push('prometheus');
  }
  // Grafana
  if (existsSync(join(workspacePath, 'grafana')) || existsSync(join(workspacePath, 'grafana.ini'))) {
    result.monitoring.push('grafana');
  }
  // New Relic
  if (existsSync(join(workspacePath, 'newrelic.yml')) || existsSync(join(workspacePath, 'newrelic.js'))) {
    result.monitoring.push('newrelic');
  }
  // Sentry
  if (existsSync(join(workspacePath, '.sentryclirc'))) {
    result.monitoring.push('sentry');
  }

  // Detect monitoring from package.json dependencies
  const pkgPath = join(workspacePath, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (allDeps['dd-trace'] || allDeps['datadog-metrics']) {
        if (!result.monitoring.includes('datadog')) result.monitoring.push('datadog');
      }
      if (allDeps['newrelic'] || allDeps['@newrelic/native-metrics']) {
        if (!result.monitoring.includes('newrelic')) result.monitoring.push('newrelic');
      }
      if (allDeps['@sentry/node'] || allDeps['@sentry/browser'] || allDeps['@sentry/react']) {
        if (!result.monitoring.includes('sentry')) result.monitoring.push('sentry');
      }
      if (allDeps['prom-client']) {
        if (!result.monitoring.includes('prometheus')) result.monitoring.push('prometheus');
      }
      if (allDeps['@opentelemetry/sdk-node'] || allDeps['@opentelemetry/api']) {
        if (!result.monitoring.includes('opentelemetry')) result.monitoring.push('opentelemetry');
      }
    } catch (e) { /* ignore */ }
  }

  // Detect monitoring from Python requirements
  const reqFiles = ['requirements.txt', 'pyproject.toml'];
  for (const reqFile of reqFiles) {
    const reqPath = join(workspacePath, reqFile);
    if (existsSync(reqPath)) {
      try {
        const content = readFileSync(reqPath, 'utf8').toLowerCase();
        if (content.includes('ddtrace') || content.includes('datadog')) {
          if (!result.monitoring.includes('datadog')) result.monitoring.push('datadog');
        }
        if (content.includes('newrelic') || content.includes('new-relic')) {
          if (!result.monitoring.includes('newrelic')) result.monitoring.push('newrelic');
        }
        if (content.includes('sentry-sdk') || content.includes('sentry_sdk')) {
          if (!result.monitoring.includes('sentry')) result.monitoring.push('sentry');
        }
        if (content.includes('opentelemetry')) {
          if (!result.monitoring.includes('opentelemetry')) result.monitoring.push('opentelemetry');
        }
        if (content.includes('prometheus-client') || content.includes('prometheus_client')) {
          if (!result.monitoring.includes('prometheus')) result.monitoring.push('prometheus');
        }
      } catch (e) { /* ignore */ }
    }
  }

  // GCP markers (beyond Terraform)
  if (existsSync(join(workspacePath, 'app.yaml'))) {
    // Could be App Engine
    try {
      const content = readFileSync(join(workspacePath, 'app.yaml'), 'utf8');
      if (content.includes('runtime:')) {
        if (!result.providers.includes('gcp')) result.providers.push('gcp');
      }
    } catch (e) { /* ignore */ }
  }
  if (existsSync(join(workspacePath, '.gcloudignore'))) {
    if (!result.providers.includes('gcp')) result.providers.push('gcp');
  }

  // Azure markers (beyond Terraform)
  // host.json alone is ambiguous (also used by ASP.NET Core), so verify Azure-specific content
  if (existsSync(join(workspacePath, 'host.json'))) {
    try {
      const hostContent = readFileSync(join(workspacePath, 'host.json'), 'utf8');
      if (hostContent.includes('extensionBundle') || hostContent.includes('functionTimeout') ||
          hostContent.includes('Microsoft.Azure')) {
        if (!result.providers.includes('azure')) result.providers.push('azure');
      }
    } catch (e) { /* ignore */ }
  }

  // AWS markers (beyond Terraform)
  if (existsSync(join(workspacePath, 'samconfig.toml')) || existsSync(join(workspacePath, 'template.yaml'))) {
    if (!result.providers.includes('aws')) result.providers.push('aws');
  }

  return result;
}

/**
 * Scan Terraform files for provider blocks to identify cloud providers.
 * Operates on pre-found file list from deep recursive scan.
 */
function detectTerraformProvidersFromFiles(tfFiles, result) {
  for (const filePath of tfFiles) {
    try {
      const content = readFileSync(filePath, 'utf8');
      if (content.includes('"aws"') || content.includes('provider "aws"')) {
        if (!result.providers.includes('aws')) result.providers.push('aws');
      }
      if (content.includes('"google"') || content.includes('provider "google"')) {
        if (!result.providers.includes('gcp')) result.providers.push('gcp');
      }
      if (content.includes('"azurerm"') || content.includes('provider "azurerm"')) {
        if (!result.providers.includes('azure')) result.providers.push('azure');
      }
    } catch (e) {
      // Ignore read errors
    }
  }
}

