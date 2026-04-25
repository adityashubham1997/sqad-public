/**
 * Cloud & Infrastructure Detection Engine
 *
 * Scans workspace for IaC files, container configs, CI/CD pipelines,
 * and cloud provider markers.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

// Max depth for recursive scanning
const MAX_SCAN_DEPTH = 4;

// Directories to skip during recursive scanning
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', 'bin', 'obj',
  '.next', '.nuxt', '__pycache__', '.venv', 'venv', 'vendor',
  'target', 'coverage', '.terraform',
]);

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
  if (existsSync(join(workspacePath, 'host.json'))) {
    // Azure Functions marker
    if (!result.providers.includes('azure')) result.providers.push('azure');
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

/**
 * Recursively find files by extension up to a max depth.
 * @param {string} dir - Directory to scan
 * @param {string[]} extensions - File extensions to match
 * @param {number} maxDepth - Maximum recursion depth
 * @param {number} [currentDepth=0]
 * @returns {string[]} - Array of absolute file paths
 */
function deepFindByExtension(dir, extensions, maxDepth, currentDepth = 0) {
  const results = [];
  if (currentDepth > maxDepth) return results;
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry)) continue;
      const fullPath = join(dir, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isFile() && extensions.includes(extname(entry).toLowerCase())) {
          results.push(fullPath);
        } else if (stat.isDirectory()) {
          results.push(...deepFindByExtension(fullPath, extensions, maxDepth, currentDepth + 1));
        }
      } catch (e) { /* skip inaccessible */ }
    }
  } catch (e) { /* skip unreadable dirs */ }
  return results;
}

/**
 * Recursively find files by exact name up to a max depth.
 * @param {string} dir - Directory to scan
 * @param {string[]} names - File names to match
 * @param {number} maxDepth - Maximum recursion depth
 * @param {number} [currentDepth=0]
 * @returns {string[]} - Array of absolute file paths
 */
function deepFindByName(dir, names, maxDepth, currentDepth = 0) {
  const results = [];
  if (currentDepth > maxDepth) return results;
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry)) continue;
      const fullPath = join(dir, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isFile() && names.includes(entry)) {
          results.push(fullPath);
        } else if (stat.isDirectory()) {
          results.push(...deepFindByName(fullPath, names, maxDepth, currentDepth + 1));
        }
      } catch (e) { /* skip inaccessible */ }
    }
  } catch (e) { /* skip unreadable dirs */ }
  return results;
}
