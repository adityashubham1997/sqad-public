#!/usr/bin/env node

/**
 * SQUAD-Public Post-Install Hook
 *
 * Automatically runs `squad-public init` after `npm install squad-public`.
 * - Only runs on local installs (not global)
 * - Skips if squad-method/ already exists (idempotent)
 * - Non-fatal — install succeeds even if init fails
 * - Uses INIT_CWD to find the user's project root
 */

import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// INIT_CWD is set by npm to the directory where `npm install` was run
const projectRoot = process.env.INIT_CWD;

// Skip if no INIT_CWD (shouldn't happen, but be safe)
if (!projectRoot) {
  process.exit(0);
}

// Skip if this is a global install
const isGlobal = !projectRoot || process.env.npm_config_global === 'true';
if (isGlobal) {
  console.log('ℹ️  SQUAD-Public installed globally. Run `squad-public init` in your project to set up.');
  process.exit(0);
}

// Skip if we're inside the squad-public package itself (dev install)
if (projectRoot === join(__dirname, '..')) {
  process.exit(0);
}

// Run init — always runs the full pipeline (detection, KG build, context files, skills).
// The init function handles idempotency: it preserves existing squad-method/config.yaml
// and only overwrites context files when --force is used.
try {
  console.log('');
  const { init } = await import('../lib/init.js');
  await init(projectRoot, { ide: null });
  console.log('');
  console.log('✅ SQUAD-Public initialized! Edit squad-method/config.yaml to add your team details.');
  console.log('   Run `npx squad-public doctor` to verify, or `npx squad-public list` to see all skills.');
  console.log('');
} catch (e) {
  // Non-fatal — don't break npm install
  console.log('');
  console.log(`⚠️  Auto-init skipped: ${e.message}`);
  console.log('   Run \`npx squad-public init\` manually to set up.');
  console.log('');
  process.exit(0);
}
