/**
 * SQAD-Public Uninstall
 *
 * Removes SQAD-Public files from workspace.
 * Preserves user data (output/, custom-agents/) with confirmation.
 */

import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

/**
 * Uninstall SQAD-Public from a workspace.
 * @param {string} workspacePath - Absolute path to workspace root
 */
export async function uninstall(workspacePath) {
  const methodDir = join(workspacePath, 'sqad-method');

  if (!existsSync(methodDir)) {
    console.log('ℹ️  sqad-method/ not found — nothing to uninstall.');
    return;
  }

  console.log('\n⚠️  SQAD-Public — Uninstall\n');
  console.log('This will remove:');
  console.log('  - sqad-method/agents/');
  console.log('  - sqad-method/fragments/');
  console.log('  - sqad-method/templates/');
  console.log('  - sqad-method/context/');
  console.log('  - sqad-method/config.yaml');
  console.log('');
  console.log('This will PRESERVE:');
  console.log('  - sqad-method/output/ (tracking data)');
  console.log('  - sqad-method/custom-agents/');
  console.log('  - sqad-method/plugins/');
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

  console.log('\n✅ SQAD-Public uninstalled.');
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
