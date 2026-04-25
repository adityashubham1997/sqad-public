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
const VERSION = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8')).version;

/**
 * Initialize SQAD-Public in a workspace.
 * @param {string} workspacePath - Absolute path to workspace root
 * @param {object} options - CLI options
 */
export async function init(workspacePath, options = {}) {
  console.log(`\n🚀 SQAD-Public v${VERSION} — Initializing...\n`);

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
  let stack = { languages: [], frameworks: [], build_tools: [], test_frameworks: [], test_command: '', build_command: '', lint_command: '' };
  try {
    console.log('🔍 Detecting tech stack...');
    stack = detectStack(workspacePath);
    console.log(`   Languages: ${stack.languages.join(', ') || 'none detected'}`);
    console.log(`   Frameworks: ${stack.frameworks.join(', ') || 'none detected'}`);
    console.log(`   Build tools: ${stack.build_tools.join(', ') || 'none detected'}`);
    console.log(`   Test frameworks: ${stack.test_frameworks.join(', ') || 'none detected'}`);
  } catch (e) {
    console.error(`   ⚠️  Stack detection failed: ${e.message} — using defaults`);
  }

  // Step 3: Auto-detect cloud
  let cloud = { providers: [], iac: [], container: [], ci_cd: [], monitoring: [] };
  try {
    console.log('☁️  Detecting cloud infrastructure...');
    cloud = detectCloud(workspacePath);
    console.log(`   Providers: ${cloud.providers.join(', ') || 'none detected'}`);
    console.log(`   IaC: ${cloud.iac.join(', ') || 'none detected'}`);
    console.log(`   Containers: ${cloud.container.join(', ') || 'none detected'}`);
    console.log(`   CI/CD: ${cloud.ci_cd.join(', ') || 'none detected'}`);
  } catch (e) {
    console.error(`   ⚠️  Cloud detection failed: ${e.message} — using defaults`);
  }

  // Step 4: Auto-detect tracker
  let tracker = { type: '', project_key: '', api_url: '', mcp_available: false };
  try {
    console.log('📋 Detecting issue tracker...');
    tracker = detectTracker(workspacePath);
    console.log(`   Tracker: ${tracker.type || 'none detected — configure in config.yaml'}`);
  } catch (e) {
    console.error(`   ⚠️  Tracker detection failed: ${e.message} — using defaults`);
  }

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
 SQAD-Public v${VERSION} — Configured ✅

 Stack:      ${stack.languages.join(', ')} | ${stack.frameworks.join(', ') || 'no frameworks'} | ${stack.test_frameworks.join(', ') || 'no test frameworks'}
 Cloud:      ${cloud.providers.join(', ') || 'none'} (${cloud.iac.join(', ') || 'no IaC'})
 Tracker:    ${tracker.type || 'none — configure in config.yaml'}
 Agents:     26 built-in
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

    // Idempotent replacer: matches both empty [] and populated [...] arrays on the same key
    function replaceArray(key, values) {
      const formatted = values.map(v => `"${v}"`).join(', ');
      const pattern = new RegExp(`^(  ${key}: )\\[.*?\\](.*)$`, 'm');
      content = content.replace(pattern, `$1[${formatted}]$2`);
    }

    function replaceString(key, value) {
      if (!value) return;
      const pattern = new RegExp(`^(  ${key}: )".*?"(.*)$`, 'm');
      content = content.replace(pattern, `$1"${value}"$2`);
    }

    // Update stack
    replaceArray('languages', stack.languages);
    replaceArray('frameworks', stack.frameworks);
    replaceArray('build_tools', stack.build_tools);
    replaceArray('test_frameworks', stack.test_frameworks);
    replaceString('test_command', stack.test_command);
    replaceString('build_command', stack.build_command);
    replaceString('lint_command', stack.lint_command);

    // Update cloud
    replaceArray('providers', cloud.providers);
    replaceArray('iac', cloud.iac);
    replaceArray('container', cloud.container);
    replaceArray('ci_cd', cloud.ci_cd);

    // Update tracker
    replaceString('type', tracker.type);

    // Update IDEs
    const ideValues = ides.map(i => i.id);
    replaceArray('installed', ideValues);

    writeFileSync(configPath, content, 'utf8');
  } catch (e) {
    console.error('\u26a0\ufe0f  Warning: Could not update config.yaml:', e.message);
  }
}
