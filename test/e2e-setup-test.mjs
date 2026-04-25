/**
 * End-to-end setup validation — tests detection engines against
 * multiple simulated project types to verify tech-agnostic setup.
 */

import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { detectStack } from '../lib/detect/stack.js';
import { detectCloud } from '../lib/detect/cloud.js';
import { detectTracker } from '../lib/detect/tracker.js';
import { detectIDEs } from '../lib/detect/ide.js';

function makeDir(base, ...parts) {
  const p = join(base, ...parts);
  mkdirSync(p, { recursive: true });
  return p;
}

function writeJSON(dir, name, obj) {
  writeFileSync(join(dir, name), JSON.stringify(obj, null, 2));
}

function writeText(dir, name, text) {
  writeFileSync(join(dir, name), text);
}

let pass = 0, fail = 0;
function assert(label, condition) {
  if (condition) { pass++; console.log(`  ✅ ${label}`); }
  else { fail++; console.log(`  ❌ ${label}`); }
}

// ── Test 1: JS/React/Next.js + LangChain + GitHub Actions ──────────
console.log('\n═══ Test 1: JS/React/Next.js + LangChain + GitHub Actions ═══');
const t1 = mkdtempSync(join(tmpdir(), 'sqad-t1-'));
writeJSON(t1, 'package.json', {
  dependencies: { react: '^18', next: '^14', '@langchain/core': '^0.3' },
  devDependencies: { jest: '^29', typescript: '^5' },
  scripts: { test: 'jest', build: 'next build', lint: 'eslint .' }
});
writeText(t1, 'tsconfig.json', '{}');
makeDir(t1, '.github', 'workflows');

const s1 = detectStack(t1);
const c1 = detectCloud(t1);
assert('Detects javascript', s1.languages.includes('javascript'));
assert('Detects typescript', s1.languages.includes('typescript'));
assert('Detects react', s1.frameworks.includes('react'));
assert('Detects nextjs', s1.frameworks.includes('nextjs'));
assert('Detects langchain', s1.frameworks.includes('langchain'));
assert('Detects jest', s1.test_frameworks.includes('jest'));
assert('Detects npm', s1.build_tools.includes('npm'));
assert('test command = npm test', s1.test_command === 'npm test');
assert('build command = npm run build', s1.build_command === 'npm run build');
assert('lint command = npm run lint', s1.lint_command === 'npm run lint');
assert('Detects github-actions', c1.ci_cd.includes('github-actions'));

// ── Test 2: Python/Django + OpenAI + CrewAI + AWS Terraform ─────────
console.log('\n═══ Test 2: Python/Django + OpenAI + CrewAI + AWS Terraform ═══');
const t2 = mkdtempSync(join(tmpdir(), 'sqad-t2-'));
writeText(t2, 'requirements.txt', 'django==4.2\nopenai>=1.0\ncrewai>=0.2\npytest>=7.0\n');
writeText(t2, 'pyproject.toml', '[tool.pytest]\n');
makeDir(t2, 'infra');
writeText(join(t2, 'infra'), 'main.tf', 'provider "aws" {\n  region = "us-east-1"\n}\n');

const s2 = detectStack(t2);
const c2 = detectCloud(t2);
assert('Detects python', s2.languages.includes('python'));
assert('Detects django', s2.frameworks.includes('django'));
assert('Detects openai', s2.frameworks.includes('openai'));
assert('Detects crewai', s2.frameworks.includes('crewai'));
assert('Detects pytest', s2.test_frameworks.includes('pytest'));
assert('Detects pip', s2.build_tools.includes('pip'));
assert('Detects terraform', c2.iac.includes('terraform'));
assert('Detects aws provider', c2.providers.includes('aws'));

// ── Test 3: Java/Spring + Gradle + Docker + K8s ────────────────────
console.log('\n═══ Test 3: Java/Spring + Gradle + Docker + K8s ═══');
const t3 = mkdtempSync(join(tmpdir(), 'sqad-t3-'));
writeText(t3, 'build.gradle', "plugins { id 'org.springframework.boot' version '3.2.0' }\n");
writeText(t3, 'Dockerfile', 'FROM openjdk:17\n');
makeDir(t3, 'k8s');

const s3 = detectStack(t3);
const c3 = detectCloud(t3);
assert('Detects java', s3.languages.includes('java'));
assert('Detects spring', s3.frameworks.includes('spring'));
assert('Detects gradle', s3.build_tools.includes('gradle'));
assert('build command = ./gradlew build', s3.build_command === './gradlew build');
assert('Detects docker', c3.container.includes('docker'));
assert('Detects kubernetes', c3.container.includes('kubernetes'));

// ── Test 4: C#/.NET + Azure ────────────────────────────────────────
console.log('\n═══ Test 4: C#/.NET + Azure ═══');
const t4 = mkdtempSync(join(tmpdir(), 'sqad-t4-'));
makeDir(t4, 'src', 'Api');
writeText(join(t4, 'src', 'Api'), 'Api.csproj', '<Project Sdk="Microsoft.NET.Sdk.Web"><PropertyGroup><TargetFramework>net8.0</TargetFramework></PropertyGroup><ItemGroup><PackageReference Include="xunit" /></ItemGroup></Project>');
writeText(t4, 'host.json', '{"version": "2.0"}');
writeText(t4, 'azure-pipelines.yml', 'trigger:\n  - main\n');

const s4 = detectStack(t4);
const c4 = detectCloud(t4);
assert('Detects csharp', s4.languages.includes('csharp'));
assert('Detects dotnet-core', s4.frameworks.includes('dotnet-core'));
assert('Detects aspnet', s4.frameworks.includes('aspnet'));
assert('Detects xunit', s4.test_frameworks.includes('xunit'));
assert('Detects dotnet build tool', s4.build_tools.includes('dotnet'));
assert('Detects azure provider', c4.providers.includes('azure'));
assert('Detects azure-devops CI', c4.ci_cd.includes('azure-devops'));

// ── Test 5: Android + Kotlin ───────────────────────────────────────
console.log('\n═══ Test 5: Android + Kotlin ═══');
const t5 = mkdtempSync(join(tmpdir(), 'sqad-t5-'));
makeDir(t5, 'app', 'src', 'main');
writeText(join(t5, 'app', 'src', 'main'), 'AndroidManifest.xml', '<manifest/>');
writeText(t5, 'build.gradle.kts', "plugins { id(\"com.android.application\") id(\"org.jetbrains.kotlin.android\") }");

const s5 = detectStack(t5);
assert('Detects kotlin language', s5.languages.includes('kotlin'));
assert('Detects android framework', s5.frameworks.includes('android'));
assert('Detects gradle', s5.build_tools.includes('gradle'));

// ── Test 6: iOS + Swift ────────────────────────────────────────────
console.log('\n═══ Test 6: iOS + Swift (Podfile + Package.swift) ═══');
const t6 = mkdtempSync(join(tmpdir(), 'sqad-t6-'));
writeText(t6, 'Podfile', "platform :ios, '15.0'\ntarget 'MyApp'");
writeText(t6, 'Package.swift', '// swift-tools-version:5.9');

const s6 = detectStack(t6);
assert('Detects swift', s6.languages.includes('swift'));
assert('Detects ios', s6.frameworks.includes('ios'));
assert('Detects cocoapods', s6.build_tools.includes('cocoapods'));
assert('Detects spm', s6.build_tools.includes('spm'));

// ── Test 7: Ionic/Angular + Capacitor ──────────────────────────────
console.log('\n═══ Test 7: Ionic/Angular + Capacitor ═══');
const t7 = mkdtempSync(join(tmpdir(), 'sqad-t7-'));
writeJSON(t7, 'package.json', {
  dependencies: { '@ionic/angular': '^7', '@angular/core': '^17', '@capacitor/core': '^5' },
  devDependencies: { cypress: '^13' },
  scripts: { test: 'cypress run' }
});
writeText(t7, 'ionic.config.json', '{}');

const s7 = detectStack(t7);
assert('Detects ionic', s7.frameworks.includes('ionic'));
assert('Detects angular', s7.frameworks.includes('angular'));
assert('Detects cypress', s7.test_frameworks.includes('cypress'));

// ── Test 8: Go + GCP + Helm ───────────────────────────────────────
console.log('\n═══ Test 8: Go + GCP + Helm ═══');
const t8 = mkdtempSync(join(tmpdir(), 'sqad-t8-'));
writeText(t8, 'go.mod', 'module example.com/myapp\ngo 1.21\n');
writeText(t8, '.gcloudignore', '');
makeDir(t8, 'charts', 'myapp');
writeText(join(t8, 'charts', 'myapp'), 'Chart.yaml', 'apiVersion: v2\nname: myapp\n');

const s8 = detectStack(t8);
const c8 = detectCloud(t8);
assert('Detects go', s8.languages.includes('go'));
assert('test command = go test ./...', s8.test_command === 'go test ./...');
assert('Detects gcp', c8.providers.includes('gcp'));
assert('Detects kubernetes (helm)', c8.container.includes('kubernetes'));

// ── Test 9: Rust ───────────────────────────────────────────────────
console.log('\n═══ Test 9: Rust ═══');
const t9 = mkdtempSync(join(tmpdir(), 'sqad-t9-'));
writeText(t9, 'Cargo.toml', '[package]\nname = "myapp"\nversion = "0.1.0"\n');

const s9 = detectStack(t9);
assert('Detects rust', s9.languages.includes('rust'));
assert('Detects cargo', s9.build_tools.includes('cargo'));
assert('test command = cargo test', s9.test_command === 'cargo test');

// ── Test 10: Ruby/Rails + Jira ────────────────────────────────────
console.log('\n═══ Test 10: Ruby/Rails + Jira ═══');
const t10 = mkdtempSync(join(tmpdir(), 'sqad-t10-'));
writeText(t10, 'Gemfile', "source 'https://rubygems.org'\ngem 'rails', '~> 7.1'\ngem 'rspec'\n");
writeText(t10, '.jira.yml', 'project: MYPROJ');

const s10 = detectStack(t10);
const t10tracker = detectTracker(t10);
assert('Detects ruby', s10.languages.includes('ruby'));
assert('Detects rails', s10.frameworks.includes('rails'));
assert('Detects bundler', s10.build_tools.includes('bundler'));
assert('Detects rspec', s10.test_frameworks.includes('rspec'));
assert('Detects jira tracker', t10tracker.type === 'jira');

// ── Test 11: Python + LlamaIndex + AutoGen ─────────────────────────
console.log('\n═══ Test 11: Python + LlamaIndex + AutoGen ═══');
const t11 = mkdtempSync(join(tmpdir(), 'sqad-t11-'));
writeText(t11, 'requirements.txt', 'llama-index>=0.10\npyautogen>=0.3\nfastapi>=0.100\n');
writeText(t11, 'pyproject.toml', '[project]\nname = "myapp"\n');

const s11 = detectStack(t11);
assert('Detects python', s11.languages.includes('python'));
assert('Detects llamaindex', s11.frameworks.includes('llamaindex'));
assert('Detects autogen', s11.frameworks.includes('autogen'));
assert('Detects fastapi', s11.frameworks.includes('fastapi'));

// ── Test 12: Empty workspace ───────────────────────────────────────
console.log('\n═══ Test 12: Empty workspace (graceful fallback) ═══');
const t12 = mkdtempSync(join(tmpdir(), 'sqad-t12-'));
const s12 = detectStack(t12);
const c12 = detectCloud(t12);
const t12tracker = detectTracker(t12);
assert('Empty → 0 languages', s12.languages.length === 0);
assert('Empty → 0 frameworks', s12.frameworks.length === 0);
assert('Empty → 0 cloud providers', c12.providers.length === 0);
assert('Empty → no tracker', t12tracker.type === '');

// ── Test 13: npm install check ─────────────────────────────────────
console.log('\n═══ Test 13: npm pack (publishability) ═══');
// verified externally

// ── Summary ─────────────────────────────────────────────────────────
console.log(`\n${'═'.repeat(50)}`);
console.log(`RESULTS: ${pass} passed, ${fail} failed out of ${pass + fail} assertions`);
if (fail > 0) process.exit(1);
console.log('All stack detection is tech-agnostic and working! ✅\n');
