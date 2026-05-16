/**
 * SQUAD-Public Update
 *
 * Updates framework files while preserving user configuration.
 */

import { existsSync, cpSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PACKAGE_ROOT = join(__dirname, '..');

/**
 * Update SQUAD-Public in a workspace.
 * @param {string} workspacePath - Absolute path to workspace root
 * @param {object} options - CLI options
 */
export async function update(workspacePath, options = {}) {
  const methodDest = join(workspacePath, 'squad-method');

  if (!existsSync(methodDest)) {
    console.error('❌ squad-method/ not found. Run `squad-public init` first.');
    process.exit(1);
  }

  console.log('\n🔄 SQUAD-Public — Updating...\n');

  // Backup config.yaml
  const configPath = join(methodDest, 'config.yaml');
  let configBackup = null;
  if (existsSync(configPath)) {
    configBackup = readFileSync(configPath, 'utf8');
    console.log('💾 Backed up config.yaml');
  }

  // Update agents, fragments, templates (not output/, custom-agents/, plugins/)
  const methodSrc = join(PACKAGE_ROOT, 'squad-method');
  const updateDirs = ['agents', 'fragments', 'templates', 'context'];

  for (const dir of updateDirs) {
    const src = join(methodSrc, dir);
    const dest = join(methodDest, dir);
    if (existsSync(src)) {
      cpSync(src, dest, { recursive: true });
      console.log(`  ✅ Updated ${dir}/`);
    }
  }

  // Restore config.yaml
  if (configBackup) {
    writeFileSync(configPath, configBackup, 'utf8');
    console.log('💾 Restored config.yaml');
  }

  console.log('\n✅ SQUAD-Public updated successfully.');
  console.log('   Preserved: config.yaml, output/, custom-agents/, plugins/');
  console.log('   Updated: agents/, fragments/, templates/, context/\n');
}
