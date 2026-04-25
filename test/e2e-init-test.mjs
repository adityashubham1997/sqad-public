/**
 * End-to-end init test — simulates `npx sqad-public init` in a fresh workspace.
 */

import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI = join(__dirname, '..', 'bin', 'sqad-public.js');

let pass = 0, fail = 0;
function assert(label, condition) {
  if (condition) { pass++; console.log(`  ✅ ${label}`); }
  else { fail++; console.log(`  ❌ ${label}`); }
}

// ── Test: Full init in a JS/React/Next.js/LangChain + Terraform/AWS workspace ──
console.log('\n═══ E2E Init: JS/React/Next.js + LangChain + Terraform/AWS ═══\n');

const ws = mkdtempSync(join(tmpdir(), 'sqad-init-'));
writeFileSync(join(ws, 'package.json'), JSON.stringify({
  dependencies: { react: '^18', next: '^14', '@langchain/core': '^0.3' },
  devDependencies: { jest: '^29', typescript: '^5' },
  scripts: { test: 'jest', build: 'next build', lint: 'eslint .' }
}));
writeFileSync(join(ws, 'tsconfig.json'), '{}');
mkdirSync(join(ws, '.github', 'workflows'), { recursive: true });
mkdirSync(join(ws, 'infra'), { recursive: true });
writeFileSync(join(ws, 'infra', 'main.tf'), 'provider "aws" {\n  region = "us-east-1"\n}');
writeFileSync(join(ws, 'Dockerfile'), 'FROM node:20\n');

console.log(`Workspace: ${ws}`);
console.log('Running: sqad-public init --ide claude,windsurf\n');

const output = execSync(`node ${CLI} init --ide claude,windsurf`, {
  cwd: ws,
  encoding: 'utf8',
  timeout: 15000,
});

console.log(output);
console.log('── Verifying results ──\n');

// Check that sqad-method/ was created
assert('sqad-method/ exists', existsSync(join(ws, 'sqad-method')));
assert('config.yaml exists', existsSync(join(ws, 'sqad-method', 'config.yaml')));
assert('agents/ exists', existsSync(join(ws, 'sqad-method', 'agents')));
assert('skills/ exists', existsSync(join(ws, 'sqad-method', 'skills')));
assert('fragments/ exists', existsSync(join(ws, 'sqad-method', 'fragments')));
assert('output/ exists', existsSync(join(ws, 'sqad-method', 'output')));
assert('output/specs/ exists', existsSync(join(ws, 'sqad-method', 'output', 'specs')));
assert('output/reviews/ exists', existsSync(join(ws, 'sqad-method', 'output', 'reviews')));
assert('output/releases/ exists', existsSync(join(ws, 'sqad-method', 'output', 'releases')));

// Read config and verify detection results
const config = readFileSync(join(ws, 'sqad-method', 'config.yaml'), 'utf8');
assert('config has javascript', config.includes('"javascript"'));
assert('config has typescript', config.includes('"typescript"'));
assert('config has react', config.includes('"react"'));
assert('config has nextjs', config.includes('"nextjs"'));
assert('config has langchain', config.includes('"langchain"'));
assert('config has jest', config.includes('"jest"'));
assert('config has npm', config.includes('"npm"'));
assert('config has terraform', config.includes('"terraform"'));
assert('config has aws', config.includes('"aws"'));
assert('config has docker', config.includes('"docker"'));
assert('config has github-actions', config.includes('"github-actions"'));
assert('config has claude IDE', config.includes('"claude"'));
assert('config has windsurf IDE', config.includes('"windsurf"'));
assert('config has 26 agents', config.includes('built_in: 26'));

// Verify agent count
const agents = execSync(`ls ${join(ws, 'sqad-method', 'agents')}`, { encoding: 'utf8' }).trim().split('\n');
assert(`Has 29 agent files (26 + 3 bases)`, agents.length === 29);

// Verify skill count
const skills = execSync(`ls ${join(ws, 'sqad-method', 'skills')}`, { encoding: 'utf8' }).trim().split('\n');
assert(`Has 29 skills`, skills.length === 29);

// Verify output
assert('Init output shows "Configured ✅"', output.includes('Configured ✅'));
assert('Init output shows react', output.includes('react'));
assert('Init output shows terraform', output.includes('terraform') || output.includes('Terraform'));
assert('Init output shows 26 agents', output.includes('26 built-in'));

// ── Summary ──
console.log(`\n${'═'.repeat(50)}`);
console.log(`RESULTS: ${pass} passed, ${fail} failed out of ${pass + fail} assertions`);
if (fail > 0) process.exit(1);
console.log('Init is smooth, tech-agnostic, and detects everything! ✅\n');
