/**
 * SQUAD-Public Init — /setup orchestrator
 *
 * Copies squad-method/ to workspace, runs detection engines,
 * generates config.yaml, and sets up IDE-specific files.
 */

import { existsSync, mkdirSync, cpSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { detectStack } from './detect/stack.js';
import { detectCloud } from './detect/cloud.js';
import { detectTracker } from './detect/tracker.js';
import { detectIDEs } from './detect/ide.js';
import { generateContextFiles } from './generate/context-files.js';
import { generateConfig } from './generate/config.js';
import { deploySkills } from './generate/ide-skills.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PACKAGE_ROOT = join(__dirname, '..');
const VERSION = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8')).version;

/**
 * Initialize SQUAD-Public in a workspace.
 * @param {string} workspacePath - Absolute path to workspace root
 * @param {object} options - CLI options
 */
export async function init(workspacePath, options = {}) {
  console.log(`\n🚀 SQUAD-Public v${VERSION} — Initializing...\n`);

  // Step 1: Copy squad-method/ if not present
  const methodDest = join(workspacePath, 'squad-method');
  const methodSrc = join(PACKAGE_ROOT, 'squad-method');

  if (!existsSync(methodDest)) {
    console.log('📁 Copying squad-method/ to workspace...');
    cpSync(methodSrc, methodDest, { recursive: true });
  } else {
    console.log('📁 squad-method/ already exists — preserving config.yaml and output/');
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

  // Step 6: Update config.yaml with detected values (single path via generateConfig)
  console.log('⚙️  Generating config.yaml...');
  const configPath = join(methodDest, 'config.yaml');
  generateConfig(configPath, { stack, cloud, tracker, ides });

  // Step 7: Create output directories
  const outputDir = join(methodDest, 'output');
  for (const sub of ['specs', 'reviews', 'releases']) {
    mkdirSync(join(outputDir, sub), { recursive: true });
  }

  // Step 8: Detect git repos in workspace
  console.log('\ud83d\udcc2 Scanning workspace repos...');
  const repos = scanWorkspaceRepos(workspacePath);
  console.log(`   Found ${repos.length} repo(s): ${repos.map(r => r.name).join(', ') || 'none'}`);

  // Step 9: Build knowledge graphs FIRST (before context files, so per-repo CLAUDE.md includes KG data)
  console.log('\ud83d\udcca Building knowledge graphs...');
  const kgBuildScript = join(methodDest, 'tools', 'knowledge-graph', 'build.js');
  let kgCount = 0;
  if (existsSync(kgBuildScript)) {
    const kgTargets = repos.length > 0
      ? repos.map(r => ({ name: r.name, path: r.path }))
      : existsSync(join(workspacePath, '.git'))
        ? [{ name: basename(workspacePath), path: workspacePath }]
        : [];

    for (const target of kgTargets) {
      try {
        console.log(`   Building KG: ${target.name}...`);
        execSync(`node "${kgBuildScript}" "${target.path}"`, {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 60000,
        });
        const graphPath = join(target.path, 'knowledge-graph-out', 'graph.json');
        if (existsSync(graphPath)) {
          const graph = JSON.parse(readFileSync(graphPath, 'utf8'));
          console.log(`   \u2705 ${target.name}: ${graph.stats.nodes} nodes, ${graph.stats.edges} edges (graph.json + graph.html + KG_REPORT.md)`);
          kgCount++;
        }
      } catch (e) {
        console.error(`   \u26a0\ufe0f  KG build failed for ${target.name}: ${e.message.split('\\n')[0]}`);
      }
    }
    if (kgTargets.length === 0) {
      console.log('   No .git repos found \u2014 skipping KG build');
    }
  } else {
    console.log('   \u26a0\ufe0f  KG build script not found');
  }

  // Step 10: Generate context files AFTER KG (so per-repo CLAUDE.md includes KG data)
  try {
    console.log('\ud83d\udcdd Generating context files...');
    const ctxResult = generateContextFiles(workspacePath, { force: false, repos });
    if (ctxResult.generated.length > 0) {
      console.log(`   Generated: ${ctxResult.generated.join(', ')}`);
    }
    if (ctxResult.skipped.length > 0) {
      console.log(`   Skipped: ${ctxResult.skipped.join(', ')}`);
    }
  } catch (e) {
    console.error(`   \u26a0\ufe0f  Context file generation failed: ${e.message}`);
  }

  // Step 11: Deploy skills to detected IDEs
  if (ides.length > 0) {
    try {
      console.log('\ud83d\udd27 Deploying skills to IDEs...');
      const skillResult = await deploySkills(workspacePath, {
        ides: ides.map(i => i.id),
        force: false,
      });
      if (skillResult.deployed.length > 0) {
        const byIde = {};
        for (const d of skillResult.deployed) {
          byIde[d.ide] = (byIde[d.ide] || 0) + 1;
        }
        for (const [ide, count] of Object.entries(byIde)) {
          console.log(`   ${ide}: ${count} skills deployed`);
        }
      }
      if (skillResult.errors.length > 0) {
        for (const err of skillResult.errors.slice(0, 3)) {
          console.error(`   \u26a0\ufe0f  ${err}`);
        }
      }
    } catch (e) {
      console.error(`   \u26a0\ufe0f  Skill deployment failed: ${e.message}`);
    }
  }

  // Print summary
  console.log(`
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
 SQUAD-Public v${VERSION} \u2014 Configured \u2705

 Stack:      ${stack.languages.join(', ') || 'none'} | ${stack.frameworks.join(', ') || 'no frameworks'} | ${stack.test_frameworks.join(', ') || 'no test frameworks'}
 Cloud:      ${cloud.providers.join(', ') || 'none'} (${cloud.iac.join(', ') || 'no IaC'})
 Tracker:    ${tracker.type || 'none \u2014 configure in config.yaml'}
 Agents:     27 built-in
 IDEs:       ${ides.map(i => i.name).join(', ') || 'none'}
 Context:    CONTEXT.md + per-repo CLAUDE.md generated
 KG:         ${kgCount} repo(s) indexed (graph.json + graph.html + KG_REPORT.md)

 Next steps:
 1. Run /squad-setup in your IDE to set company, project, team, user
 2. Try /dev-task or /brainstorm in your IDE
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`);
}

/**
 * Scan for git repos in workspace (1 level deep).
 */
function scanWorkspaceRepos(workspacePath) {
  const repos = [];
  try {
    const entries = readdirSync(workspacePath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'squad-method') continue;
      const repoDir = join(workspacePath, entry.name);
      if (existsSync(join(repoDir, '.git'))) {
        repos.push({ name: entry.name, path: repoDir });
      }
    }
  } catch (e) { /* ignore */ }
  return repos;
}
