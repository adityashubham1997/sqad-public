import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { detectStack } from '../lib/detect/stack.js';

let TMP;

function setup() {
  TMP = mkdtempSync(join(tmpdir(), 'sqad-mobile-ai-'));
}

function teardown() {
  rmSync(TMP, { recursive: true, force: true });
}

describe('Android detection', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('detects Android from AndroidManifest.xml', () => {
    const appDir = join(TMP, 'app', 'src', 'main');
    mkdirSync(appDir, { recursive: true });
    writeFileSync(join(appDir, 'AndroidManifest.xml'), '<manifest package="com.example" />');
    writeFileSync(join(TMP, 'build.gradle'), `
plugins {
  id 'com.android.application'
  id 'org.jetbrains.kotlin.android'
}
`);
    const result = detectStack(TMP);
    assert.ok(result.frameworks.includes('android'), 'should detect android framework');
    assert.ok(result.languages.includes('kotlin'), 'should detect kotlin from gradle plugin');
    assert.ok(result.build_tools.includes('gradle'));
  });
});

describe('iOS detection', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('detects iOS from Podfile', () => {
    writeFileSync(join(TMP, 'Podfile'), "platform :ios, '15.0'\npod 'Alamofire'");
    const result = detectStack(TMP);
    assert.ok(result.frameworks.includes('ios'), 'should detect ios framework');
    assert.ok(result.languages.includes('swift'), 'should detect swift language');
    assert.ok(result.build_tools.includes('cocoapods'));
  });

  it('detects iOS from Package.swift', () => {
    writeFileSync(join(TMP, 'Package.swift'), '// swift-tools-version: 5.9\nimport PackageDescription');
    const result = detectStack(TMP);
    assert.ok(result.languages.includes('swift'), 'should detect swift from Package.swift');
    assert.ok(result.build_tools.includes('spm'), 'should detect Swift Package Manager');
  });
});

describe('Ionic detection', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('detects Ionic from ionic.config.json', () => {
    writeFileSync(join(TMP, 'ionic.config.json'), '{"name":"myapp","type":"angular"}');
    const result = detectStack(TMP);
    assert.ok(result.frameworks.includes('ionic'), 'should detect ionic from config');
  });

  it('detects Ionic from @ionic/angular dependency', () => {
    writeFileSync(join(TMP, 'package.json'), JSON.stringify({
      dependencies: { '@ionic/angular': '^7.0.0', '@angular/core': '^17.0.0' },
      scripts: { test: 'ng test' },
    }));
    const result = detectStack(TMP);
    assert.ok(result.frameworks.includes('ionic'), 'should detect ionic from dependency');
    assert.ok(result.frameworks.includes('angular'), 'should also detect angular');
  });

  it('detects Ionic from @capacitor/core dependency', () => {
    writeFileSync(join(TMP, 'package.json'), JSON.stringify({
      dependencies: { '@capacitor/core': '^5.0.0', 'react': '^18.0.0' },
      scripts: {},
    }));
    const result = detectStack(TMP);
    assert.ok(result.frameworks.includes('ionic'), 'should detect ionic from capacitor');
  });
});

describe('Generative AI framework detection', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('detects LangChain from JS package.json', () => {
    writeFileSync(join(TMP, 'package.json'), JSON.stringify({
      dependencies: { '@langchain/core': '^0.3.0', 'openai': '^4.0.0' },
      scripts: {},
    }));
    const result = detectStack(TMP);
    assert.ok(result.frameworks.includes('langchain'), 'should detect langchain');
    assert.ok(result.frameworks.includes('openai'), 'should detect openai');
  });

  it('detects CrewAI from Python requirements.txt', () => {
    writeFileSync(join(TMP, 'requirements.txt'), 'crewai==0.30.0\nlangchain==0.2.0\nopenai==1.30.0\n');
    const result = detectStack(TMP);
    assert.ok(result.frameworks.includes('crewai'), 'should detect crewai');
    assert.ok(result.frameworks.includes('langchain'), 'should detect langchain');
    assert.ok(result.frameworks.includes('openai'), 'should detect openai');
  });

  it('detects LlamaIndex from Python pyproject.toml', () => {
    writeFileSync(join(TMP, 'pyproject.toml'), `[project]
dependencies = ["llama-index>=0.10", "anthropic>=0.25"]
`);
    const result = detectStack(TMP);
    assert.ok(result.frameworks.includes('llamaindex'), 'should detect llamaindex');
    assert.ok(result.frameworks.includes('anthropic'), 'should detect anthropic');
  });

  it('detects AutoGen from Python requirements', () => {
    writeFileSync(join(TMP, 'requirements.txt'), 'pyautogen==0.2.0\n');
    const result = detectStack(TMP);
    assert.ok(result.frameworks.includes('autogen'), 'should detect autogen');
  });
});
