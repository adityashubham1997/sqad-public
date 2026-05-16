#!/usr/bin/env node

/**
 * SQUAD-Public CLI
 *
 * Usage:
 *   npx squad-public init               — Initialize SQUAD-Public in current workspace
 *   npx squad-public init --ide all      — Initialize with all 7 IDE support
 *   npx squad-public update              — Update existing installation
 *   npx squad-public uninstall           — Remove SQUAD-Public from workspace
 *   npx squad-public --version           — Show version
 */

import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const VERSION = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8')).version;

const args = process.argv.slice(2);
const command = args[0];

function printUsage() {
  console.log(`
SQUAD-Public v${VERSION} — 26-agent AI development framework

Usage:
  squad-public init [options]     Initialize in current workspace
  squad-public update             Update existing installation
  squad-public uninstall          Remove from workspace
  squad-public list               Show available skills/commands
  squad-public doctor             Validate installation health
  squad-public --version          Show version

Options:
  --ide <list>    Comma-separated IDEs: claude,windsurf,cursor,codex,kiro,gemini,antigravity,all
  --help          Show this help

Examples:
  npx squad-public init
  npx squad-public init --ide claude,windsurf,cursor
  npx squad-public init --ide all
`);
}

function parseArgs(args) {
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ide' && args[i + 1]) {
      options.ides = args[i + 1].split(',').map(s => s.trim().toLowerCase());
      i++;
    }
    if (args[i] === '--help') {
      options.help = true;
    }
  }
  return options;
}

async function main() {
  if (!command || command === '--help') {
    printUsage();
    process.exit(0);
  }

  if (command === '--version') {
    console.log(`squad-public v${VERSION}`);
    process.exit(0);
  }

  const options = parseArgs(args.slice(1));

  if (options.help) {
    printUsage();
    process.exit(0);
  }

  switch (command) {
    case 'init': {
      const { init } = await import('../lib/init.js');
      await init(process.cwd(), options);
      break;
    }
    case 'update': {
      const { update } = await import('../lib/update.js');
      await update(process.cwd(), options);
      break;
    }
    case 'uninstall': {
      const { uninstall } = await import('../lib/uninstall.js');
      await uninstall(process.cwd());
      break;
    }
    case 'list': {
      listSkills(process.cwd());
      break;
    }
    case 'doctor': {
      runDoctor(process.cwd());
      break;
    }
    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

/**
 * List all available skills from squad-method/skills/.
 */
function listSkills(workspacePath) {
  const skillsDir = join(workspacePath, 'squad-method', 'skills');
  if (!existsSync(skillsDir)) {
    console.error('\n❌ squad-method/skills/ not found. Run `squad-public init` first.\n');
    process.exit(1);
  }

  const skills = readdirSync(skillsDir)
    .filter(d => d.startsWith('squad-'))
    .sort();

  console.log(`\n📋 SQUAD-Public v${VERSION} — ${skills.length} Available Skills\n`);
  console.log('  Command               Description');
  console.log('  ─────────────────────  ──────────────────────────────────────');

  for (const skill of skills) {
    const skillPath = join(skillsDir, skill, 'SKILL.md');
    let description = '';
    if (existsSync(skillPath)) {
      try {
        const content = readFileSync(skillPath, 'utf8');
        const descMatch = content.match(/^description:\s*["']?(.+?)["']?\s*$/m);
        if (descMatch) description = descMatch[1];
      } catch (e) { /* ignore */ }
    }
    const cmd = '/' + skill.replace('squad-', '');
    console.log(`  ${cmd.padEnd(23)} ${description}`);
  }
  console.log('');
}

/**
 * Validate installation health.
 */
function runDoctor(workspacePath) {
  console.log(`\n🩺 SQUAD-Public v${VERSION} — Doctor\n`);
  let issues = 0;

  // Check squad-method exists
  const methodDir = join(workspacePath, 'squad-method');
  if (existsSync(methodDir)) {
    console.log('  ✅ squad-method/ directory exists');
  } else {
    console.log('  ❌ squad-method/ directory missing — run `squad-public init`');
    issues++;
  }

  // Check config.yaml
  const configPath = join(methodDir, 'config.yaml');
  if (existsSync(configPath)) {
    console.log('  ✅ config.yaml exists');
    try {
      const content = readFileSync(configPath, 'utf8');
      if (content.includes('user:') && !content.match(/^\s+name:\s*""\s*$/m)) {
        console.log('  ✅ user.name is configured');
      } else {
        console.log('  ⚠️  user.name is empty — edit squad-method/config.yaml');
        issues++;
      }
    } catch (e) {
      console.log('  ❌ config.yaml could not be read');
      issues++;
    }
  } else {
    console.log('  ❌ config.yaml missing');
    issues++;
  }

  // Check agents
  const agentsDir = join(methodDir, 'agents');
  if (existsSync(agentsDir)) {
    const agents = readdirSync(agentsDir).filter(f => f.endsWith('.md') && !f.startsWith('_'));
    console.log(`  ✅ ${agents.length} agent definitions found`);
  } else {
    console.log('  ❌ agents/ directory missing');
    issues++;
  }

  // Check skills
  const skillsDir = join(methodDir, 'skills');
  if (existsSync(skillsDir)) {
    const skills = readdirSync(skillsDir).filter(d => d.startsWith('squad-'));
    console.log(`  ✅ ${skills.length} skills found`);
  } else {
    console.log('  ❌ skills/ directory missing');
    issues++;
  }

  // Check fragments
  const fragDir = join(methodDir, 'fragments');
  if (existsSync(fragDir)) {
    console.log('  ✅ fragments/ directory exists');
  } else {
    console.log('  ❌ fragments/ directory missing');
    issues++;
  }

  // Check IDE configs
  const ideChecks = [
    { dir: '.claude', name: 'Claude Code' },
    { dir: '.windsurf', name: 'Windsurf' },
    { dir: '.cursor', name: 'Cursor' },
  ];
  for (const ide of ideChecks) {
    if (existsSync(join(workspacePath, ide.dir))) {
      console.log(`  ✅ ${ide.name} config (${ide.dir}/) detected`);
    }
  }

  console.log('');
  if (issues === 0) {
    console.log('  🎉 All checks passed — SQUAD-Public is healthy!\n');
  } else {
    console.log(`  ⚠️  ${issues} issue(s) found — see above for details\n`);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
