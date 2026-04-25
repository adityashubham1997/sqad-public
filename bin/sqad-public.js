#!/usr/bin/env node

/**
 * SQAD-Public CLI
 *
 * Usage:
 *   npx sqad-public init               — Initialize SQAD-Public in current workspace
 *   npx sqad-public init --ide all      — Initialize with all 7 IDE support
 *   npx sqad-public update              — Update existing installation
 *   npx sqad-public uninstall           — Remove SQAD-Public from workspace
 *   npx sqad-public --version           — Show version
 */

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const VERSION = '1.0.0';

const args = process.argv.slice(2);
const command = args[0];

function printUsage() {
  console.log(`
SQAD-Public v${VERSION} — 14-agent AI development framework

Usage:
  sqad-public init [options]     Initialize in current workspace
  sqad-public update             Update existing installation
  sqad-public uninstall          Remove from workspace
  sqad-public --version          Show version

Options:
  --ide <list>    Comma-separated IDEs: claude,windsurf,cursor,codex,kiro,gemini,antigravity,all
  --help          Show this help

Examples:
  npx sqad-public init
  npx sqad-public init --ide claude,windsurf,cursor
  npx sqad-public init --ide all
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
    console.log(`sqad-public v${VERSION}`);
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
    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
