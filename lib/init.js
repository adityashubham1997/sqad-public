/**
 * SQAD-Public Init — /setup orchestrator
 *
 * Copies sqad-method/ to workspace, runs detection engines,
 * generates config.yaml, and sets up IDE-specific files.
 */

import { existsSync, mkdirSync, cpSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectStack } from './detect/stack.js';
import { detectCloud } from './detect/cloud.js';
import { detectTracker } from './detect/tracker.js';
import { detectIDEs } from './detect/ide.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PACKAGE_ROOT = join(__dirname, '..');

/**
 * Initialize SQAD-Public in a workspace.
 * @param {string} workspacePath - Absolute path to workspace root
 * @param {object} options - CLI options
 */
export async function init(workspacePath, options = {}) {
  console.log('\n🚀 SQAD-Public v1.0.0 — Initializing...\n');

  // Step 1: Copy sqad-method/ if not present
  const methodDest = join(workspacePath, 'sqad-method');
  const methodSrc = join(PACKAGE_ROOT, 'sqad-method');

  if (!existsSync(methodDest)) {
    console.log('📁 Copying sqad-method/ to workspace...');
    cpSync(methodSrc, methodDest, { recursive: true });
  } else {
    console.log('📁 sqad-method/ already exists — preserving config.yaml and output/');
  }

  // Step 2: Auto-detect stack
  console.log('🔍 Detecting tech stack...');
  const stack = detectStack(workspacePath);
  console.log(`   Languages: ${stack.languages.join(', ') || 'none detected'}`);
  console.log(`   Frameworks: ${stack.frameworks.join(', ') || 'none detected'}`);
  console.log(`   Build tools: ${stack.build_tools.join(', ') || 'none detected'}`);
  console.log(`   Test frameworks: ${stack.test_frameworks.join(', ') || 'none detected'}`);

  // Step 3: Auto-detect cloud
  console.log('☁️  Detecting cloud infrastructure...');
  const cloud = detectCloud(workspacePath);
  console.log(`   Providers: ${cloud.providers.join(', ') || 'none detected'}`);
  console.log(`   IaC: ${cloud.iac.join(', ') || 'none detected'}`);
  console.log(`   Containers: ${cloud.container.join(', ') || 'none detected'}`);
  console.log(`   CI/CD: ${cloud.ci_cd.join(', ') || 'none detected'}`);

  // Step 4: Auto-detect tracker
  console.log('📋 Detecting issue tracker...');
  const tracker = detectTracker(workspacePath);
  console.log(`   Tracker: ${tracker.type || 'none detected — configure in config.yaml'}`);

  // Step 5: Detect IDEs
  console.log('💻 Detecting IDEs...');
  let ides = detectIDEs(workspacePath);
  if (options.ides) {
    if (options.ides.includes('all')) {
      ides = [
        { id: 'claude', name: 'Claude Code' },
        { id: 'windsurf', name: 'Windsurf' },
        { id: 'cursor', name: 'Cursor' },
        { id: 'codex', name: 'Codex' },
        { id: 'kiro', name: 'Kiro' },
        { id: 'gemini', name: 'Gemini CLI' },
        { id: 'antigravity', name: 'Antigravity' },
      ];
    } else {
      ides = options.ides.map(id => ({ id, name: id }));
    }
  }
  console.log(`   IDEs: ${ides.map(i => i.name).join(', ') || 'none detected'}`);

  // Step 6: Update config.yaml with detected values
  console.log('⚙️  Generating config.yaml...');
  const configPath = join(methodDest, 'config.yaml');
  updateConfig(configPath, { stack, cloud, tracker, ides });

  // Step 7: Create output directories
  const outputDir = join(methodDest, 'output');
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
  const specsDir = join(outputDir, 'specs');
  if (!existsSync(specsDir)) mkdirSync(specsDir, { recursive: true });
  const reviewsDir = join(outputDir, 'reviews');
  if (!existsSync(reviewsDir)) mkdirSync(reviewsDir, { recursive: true });
  const releasesDir = join(outputDir, 'releases');
  if (!existsSync(releasesDir)) mkdirSync(releasesDir, { recursive: true });

  // Print summary
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SQAD-Public v1.0.0 — Configured ✅

 Stack:      ${stack.languages.join(', ')} | ${stack.frameworks.join(', ') || 'no frameworks'} | ${stack.test_frameworks.join(', ') || 'no test frameworks'}
 Cloud:      ${cloud.providers.join(', ') || 'none'} (${cloud.iac.join(', ') || 'no IaC'})
 Tracker:    ${tracker.type || 'none — configure in config.yaml'}
 Agents:     16 built-in
 IDEs:       ${ides.map(i => i.name).join(', ') || 'none'}

 Next steps:
 1. Edit sqad-method/config.yaml to set company, project, team, user
 2. Run /setup in your IDE for interactive configuration
 3. Try /dev-task or /brainstorm
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

/**
 * Update config.yaml with detected values.
 */
function updateConfig(configPath, { stack, cloud, tracker, ides }) {
  try {
    let content = readFileSync(configPath, 'utf8');

    // Update stack
    content = content.replace(
      /^  languages: \[\]$/m,
      `  languages: [${stack.languages.map(l => `"${l}"`).join(', ')}]`
    );
    content = content.replace(
      /^  frameworks: \[\]$/m,
      `  frameworks: [${stack.frameworks.map(f => `"${f}"`).join(', ')}]`
    );
    content = content.replace(
      /^  build_tools: \[\]$/m,
      `  build_tools: [${stack.build_tools.map(b => `"${b}"`).join(', ')}]`
    );
    content = content.replace(
      /^  test_frameworks: \[\]$/m,
      `  test_frameworks: [${stack.test_frameworks.map(t => `"${t}"`).join(', ')}]`
    );
    if (stack.test_command) {
      content = content.replace(/^  test_command: ""$/m, `  test_command: "${stack.test_command}"`);
    }
    if (stack.build_command) {
      content = content.replace(/^  build_command: ""$/m, `  build_command: "${stack.build_command}"`);
    }
    if (stack.lint_command) {
      content = content.replace(/^  lint_command: ""$/m, `  lint_command: "${stack.lint_command}"`);
    }

    // Update cloud
    content = content.replace(
      /^  providers: \[\]\s+# \[aws, gcp, azure\]$/m,
      `  providers: [${cloud.providers.map(p => `"${p}"`).join(', ')}]`
    );
    content = content.replace(
      /^  iac: \[\]\s+# \[terraform, cdk, pulumi\]$/m,
      `  iac: [${cloud.iac.map(i => `"${i}"`).join(', ')}]`
    );
    content = content.replace(
      /^  container: \[\]\s+# \[docker, kubernetes\]$/m,
      `  container: [${cloud.container.map(c => `"${c}"`).join(', ')}]`
    );
    content = content.replace(
      /^  ci_cd: \[\]\s+# \[github-actions, gitlab-ci, jenkins, circleci\]$/m,
      `  ci_cd: [${cloud.ci_cd.map(c => `"${c}"`).join(', ')}]`
    );

    // Update tracker
    if (tracker.type) {
      content = content.replace(
        /^  type: ""\s+# jira.*$/m,
        `  type: "${tracker.type}"`
      );
    }

    // Update IDEs
    content = content.replace(
      /^  installed: \[\]\s+# \[claude.*$/m,
      `  installed: [${ides.map(i => `"${i.id}"`).join(', ')}]`
    );

    writeFileSync(configPath, content, 'utf8');
  } catch (e) {
    console.error('Warning: Could not update config.yaml:', e.message);
  }
}
