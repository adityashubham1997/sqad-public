/**
 * SQUAD-Public Uninstall
 *
 * Removes SQUAD-Public files from workspace.
 * Preserves user data (output/, custom-agents/) with confirmation.
 */

import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

/**
 * Uninstall SQUAD-Public from a workspace.
 * @param {string} workspacePath - Absolute path to workspace root
 */
export async function uninstall(workspacePath) {
  const methodDir = join(workspacePath, 'squad-method');

  if (!existsSync(methodDir)) {
    console.log('ℹ️  squad-method/ not found — nothing to uninstall.');
    return;
  }

  console.log('\n⚠️  SQUAD-Public — Uninstall\n');
  console.log('This will remove:');
  console.log('  - squad-method/agents/');
  console.log('  - squad-method/fragments/');
  console.log('  - squad-method/templates/');
  console.log('  - squad-method/context/');
  console.log('  - squad-method/config.yaml');
  console.log('');
  console.log('This will PRESERVE:');
  console.log('  - squad-method/output/ (tracking data)');
  console.log('  - squad-method/custom-agents/');
  console.log('  - squad-method/plugins/');
  console.log('  - CONTEXT.md, CLAUDE.md, etc.');
  console.log('');

  const confirm = await askQuestion('Proceed with uninstall? (y/N) ');

  if (confirm.toLowerCase() !== 'y') {
    console.log('Cancelled.');
    return;
  }

  // Remove framework directories
  const removeDirs = ['agents', 'fragments', 'templates', 'context', 'tools'];
  for (const dir of removeDirs) {
    const path = join(methodDir, dir);
    if (existsSync(path)) {
      rmSync(path, { recursive: true });
      console.log(`  🗑️  Removed ${dir}/`);
    }
  }

  // Remove config
  const configPath = join(methodDir, 'config.yaml');
  if (existsSync(configPath)) {
    rmSync(configPath);
    console.log('  🗑️  Removed config.yaml');
  }

  console.log('\n✅ SQUAD-Public uninstalled.');
  console.log('   Preserved: output/, custom-agents/, plugins/\n');
}

function askQuestion(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}
