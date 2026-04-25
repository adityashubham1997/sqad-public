/**
 * SQAD-Public Config Generator
 *
 * Generates and updates sqad-method/config.yaml with detected values.
 * Called by init.js and /setup to populate configuration.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Generate a fresh config.yaml from template values.
 * @param {string} configPath - Absolute path to config.yaml
 * @param {object} values - Detected and user-provided values
 * @param {object} values.stack - Stack detection result
 * @param {object} values.cloud - Cloud detection result
 * @param {object} values.tracker - Tracker detection result
 * @param {Array} values.ides - Detected IDEs
 * @param {object} [values.user] - User-provided config (name, role, etc.)
 * @param {object} [values.company] - Company info (name, domain, compliance)
 * @param {object} [values.project] - Project info (name, description, type)
 * @param {object} [values.github] - GitHub config (host, org, default_branch)
 */
export function generateConfig(configPath, values = {}) {
  try {
    let content = readFileSync(configPath, 'utf8');

    const { stack, cloud, tracker, ides, user, company, project, github } = values;

    // --- Company ---
    if (company) {
      if (company.name) content = replaceYaml(content, /^  name: "".*$/m, `  name: "${company.name}"`);
      if (company.domain) content = replaceYaml(content, /^  domain: "".*$/m, `  domain: "${company.domain}"`);
      if (company.compliance?.length) {
        content = replaceYaml(content, /^  compliance: \[\].*$/m,
          `  compliance: [${company.compliance.map(c => `"${c}"`).join(', ')}]`);
      }
    }

    // --- Project ---
    if (project) {
      if (project.name) content = replaceYaml(content, /^  name: "".*$/m, `  name: "${project.name}"`);
      if (project.description) content = replaceYaml(content, /^  description: "".*$/m, `  description: "${project.description}"`);
      if (project.type) content = replaceYaml(content, /^  type: "".*$/m, `  type: "${project.type}"`);
    }

    // --- User ---
    if (user) {
      if (user.name) {
        content = content.replace(/^(user:\s*\n  name: )"".*$/m, `$1"${user.name}"`);
      }
      if (user.role) {
        content = content.replace(/^  role: "".*$/m, `  role: "${user.role}"`);
      }
    }

    // --- GitHub ---
    if (github) {
      if (github.host) content = content.replace(/^  host: "github.com".*$/m, `  host: "${github.host}"`);
      if (github.org) content = content.replace(/^  org: "".*$/m, `  org: "${github.org}"`);
      if (github.default_branch) content = content.replace(/^  default_branch: "main".*$/m, `  default_branch: "${github.default_branch}"`);
    }

    // --- Stack ---
    if (stack) {
      content = replaceYaml(content, /^  languages: \[\].*$/m,
        `  languages: [${stack.languages.map(l => `"${l}"`).join(', ')}]`);
      content = replaceYaml(content, /^  frameworks: \[\].*$/m,
        `  frameworks: [${stack.frameworks.map(f => `"${f}"`).join(', ')}]`);
      content = replaceYaml(content, /^  build_tools: \[\].*$/m,
        `  build_tools: [${stack.build_tools.map(b => `"${b}"`).join(', ')}]`);
      content = replaceYaml(content, /^  test_frameworks: \[\].*$/m,
        `  test_frameworks: [${stack.test_frameworks.map(t => `"${t}"`).join(', ')}]`);
      if (stack.test_command) {
        content = replaceYaml(content, /^  test_command: "".*$/m, `  test_command: "${stack.test_command}"`);
      }
      if (stack.build_command) {
        content = replaceYaml(content, /^  build_command: "".*$/m, `  build_command: "${stack.build_command}"`);
      }
      if (stack.lint_command) {
        content = replaceYaml(content, /^  lint_command: "".*$/m, `  lint_command: "${stack.lint_command}"`);
      }
    }

    // --- Cloud ---
    if (cloud) {
      content = replaceYaml(content, /^  providers: \[\].*$/m,
        `  providers: [${cloud.providers.map(p => `"${p}"`).join(', ')}]`);
      content = replaceYaml(content, /^  iac: \[\].*$/m,
        `  iac: [${cloud.iac.map(i => `"${i}"`).join(', ')}]`);
      content = replaceYaml(content, /^  container: \[\].*$/m,
        `  container: [${cloud.container.map(c => `"${c}"`).join(', ')}]`);
      content = replaceYaml(content, /^  ci_cd: \[\].*$/m,
        `  ci_cd: [${cloud.ci_cd.map(c => `"${c}"`).join(', ')}]`);
      if (cloud.monitoring?.length) {
        content = replaceYaml(content, /^  monitoring: \[\].*$/m,
          `  monitoring: [${cloud.monitoring.map(m => `"${m}"`).join(', ')}]`);
      }
    }

    // --- Tracker ---
    if (tracker?.type) {
      content = replaceYaml(content, /^  type: "".*$/m, `  type: "${tracker.type}"`);
      if (tracker.project_key) {
        content = content.replace(/^  project_key: "".*$/m, `  project_key: "${tracker.project_key}"`);
      }
      if (tracker.api_url) {
        content = content.replace(/^  api_url: "".*$/m, `  api_url: "${tracker.api_url}"`);
      }
      if (tracker.mcp_available) {
        content = content.replace(/^  mcp_available: false.*$/m, `  mcp_available: true`);
      }
    }

    // --- IDEs ---
    if (ides?.length) {
      content = replaceYaml(content, /^  installed: \[\].*$/m,
        `  installed: [${ides.map(i => `"${typeof i === 'string' ? i : i.id}"`).join(', ')}]`);
    }

    writeFileSync(configPath, content, 'utf8');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Read and parse config.yaml into a JS object (simple YAML parsing).
 * @param {string} configPath - Absolute path to config.yaml
 * @returns {object} Parsed config
 */
export function readConfig(configPath) {
  if (!existsSync(configPath)) return null;
  const content = readFileSync(configPath, 'utf8');
  return parseSimpleYaml(content);
}

/**
 * Replace a YAML line if pattern matches. If not, return unchanged.
 */
function replaceYaml(content, pattern, replacement) {
  if (pattern.test(content)) {
    return content.replace(pattern, replacement);
  }
  return content;
}

/**
 * Simple YAML parser for config.yaml — handles the flat structure used.
 * Not a full YAML parser — covers the specific schema.
 */
function parseSimpleYaml(content) {
  const config = {};
  let currentSection = null;

  for (const line of content.split('\n')) {
    const trimmed = line.replace(/#.*$/, '').trimEnd();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Top-level key with nested content
    const sectionMatch = trimmed.match(/^(\w[\w_]*):$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      config[currentSection] = {};
      continue;
    }

    // Key: value pair (possibly nested)
    const kvMatch = trimmed.match(/^(\s+)(\w[\w_]*):\s*(.*)$/);
    if (kvMatch) {
      const indent = kvMatch[1].length;
      const key = kvMatch[2];
      let value = kvMatch[3].trim();

      // Parse value
      value = parseYamlValue(value);

      if (indent === 2 && currentSection) {
        config[currentSection][key] = value;
      } else if (indent === 0) {
        currentSection = key;
        config[key] = value;
      }
    }
  }

  return config;
}

/**
 * Parse a YAML scalar value.
 */
function parseYamlValue(raw) {
  if (!raw || raw === '""' || raw === "''") return '';
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw === '[]') return [];
  if (raw.startsWith('[') && raw.endsWith(']')) {
    // Parse inline array
    const inner = raw.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
  }
  if (/^\d+$/.test(raw)) return parseInt(raw, 10);
  return raw.replace(/^["']|["']$/g, '');
}
