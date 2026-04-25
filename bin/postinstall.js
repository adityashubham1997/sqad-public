#!/usr/bin/env node

/**
 * SQAD-Public Post-Install Hook
 *
 * Automatically runs `sqad-public init` after `npm install sqad-public`.
 * - Only runs on local installs (not global)
 * - Skips if sqad-method/ already exists (idempotent)
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
  console.log('ℹ️  SQAD-Public installed globally. Run `sqad-public init` in your project to set up.');
  process.exit(0);
}

// Skip if we're inside the sqad-public package itself (dev install)
if (projectRoot === join(__dirname, '..')) {
  process.exit(0);
}

// Skip if sqad-method/ already exists (already initialized)
const sqadMethodDir = join(projectRoot, 'sqad-method');
if (existsSync(sqadMethodDir)) {
  console.log('ℹ️  SQAD-Public already initialized (sqad-method/ exists). Run `npx sqad-public init` to re-detect.');
  process.exit(0);
}

// Run init
try {
  console.log('');
  const { init } = await import('../lib/init.js');
  await init(projectRoot, { ide: null });
  console.log('');
  console.log('✅ SQAD-Public auto-initialized! Edit sqad-method/config.yaml to add your team details.');
  console.log('   Run `npx sqad-public doctor` to verify, or `npx sqad-public list` to see all skills.');
  console.log('');
} catch (e) {
  // Non-fatal — don't break npm install
  console.log('');
  console.log(`⚠️  Auto-init skipped: ${e.message}`);
  console.log('   Run \`npx sqad-public init\` manually to set up.');
  console.log('');
  process.exit(0);
}
