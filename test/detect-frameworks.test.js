import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { detectStack } from '../lib/detect/stack.js';

let TMP;

function setup() {
  TMP = mkdtempSync(join(tmpdir(), 'squad-frameworks-'));
}

function teardown() {
  rmSync(TMP, { recursive: true, force: true });
}

describe('React Native detection', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('detects React Native from package.json', () => {
    writeFileSync(join(TMP, 'package.json'), JSON.stringify({
      dependencies: { 'react': '^18.0.0', 'react-native': '^0.73.0' },
      devDependencies: { 'jest': '^29.0.0' },
      scripts: { test: 'jest', build: 'react-native build' },
    }));
    const result = detectStack(TMP);
    assert.ok(result.frameworks.includes('react-native'), 'should detect react-native');
    assert.ok(result.frameworks.includes('react'), 'should also detect react as parent');
    assert.ok(result.test_frameworks.includes('jest'));
  });
});

describe('Angular detection', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('detects Angular from @angular/core dependency', () => {
    writeFileSync(join(TMP, 'package.json'), JSON.stringify({
      dependencies: { '@angular/core': '^17.0.0', '@angular/common': '^17.0.0' },
      devDependencies: { 'cypress': '^13.0.0' },
      scripts: { test: 'ng test', build: 'ng build' },
    }));
    const result = detectStack(TMP);
    assert.ok(result.frameworks.includes('angular'), 'should detect angular');
    assert.ok(result.test_frameworks.includes('cypress'));
  });
});

describe('Python framework detection', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('detects Django from requirements.txt', () => {
    writeFileSync(join(TMP, 'requirements.txt'), 'Django==4.2\npsycopg2==2.9.0\n');
    const result = detectStack(TMP);
    assert.ok(result.languages.includes('python'));
    assert.ok(result.frameworks.includes('django'), 'should detect django from requirements.txt');
  });

  it('detects FastAPI from pyproject.toml', () => {
    writeFileSync(join(TMP, 'pyproject.toml'), `[project]
dependencies = ["fastapi>=0.100", "uvicorn"]

[tool.pytest.ini_options]
testpaths = ["tests"]
`);
    const result = detectStack(TMP);
    assert.ok(result.languages.includes('python'));
    assert.ok(result.frameworks.includes('fastapi'), 'should detect fastapi');
    assert.ok(result.test_frameworks.includes('pytest'), 'should detect pytest from pyproject.toml');
  });

  it('detects Flask from requirements.txt', () => {
    writeFileSync(join(TMP, 'requirements.txt'), 'flask==3.0.0\nsqlalchemy==2.0\n');
    const result = detectStack(TMP);
    assert.ok(result.frameworks.includes('flask'));
  });
});

describe('Ruby framework detection', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('detects Rails from Gemfile', () => {
    writeFileSync(join(TMP, 'Gemfile'), `source 'https://rubygems.org'
gem 'rails', '~> 7.1'
gem 'rspec'
`);
    const result = detectStack(TMP);
    assert.ok(result.languages.includes('ruby'));
    assert.ok(result.frameworks.includes('rails'), 'should detect rails');
    assert.ok(result.test_frameworks.includes('rspec'), 'should detect rspec');
  });
});

describe('Java/Spring detection', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('detects Spring Boot from pom.xml', () => {
    writeFileSync(join(TMP, 'pom.xml'), `<project>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
  </parent>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
  </dependencies>
</project>`);
    const result = detectStack(TMP);
    assert.ok(result.languages.includes('java'));
    assert.ok(result.frameworks.includes('spring'), 'should detect Spring Boot from pom.xml');
    assert.ok(result.build_tools.includes('maven'));
  });

  it('detects Spring Boot from build.gradle', () => {
    writeFileSync(join(TMP, 'build.gradle'), `plugins {
  id 'org.springframework.boot' version '3.2.0'
  id 'io.spring.dependency-management' version '1.1.4'
}

dependencies {
  implementation 'org.springframework.boot:spring-boot-starter-web'
}
`);
    const result = detectStack(TMP);
    assert.ok(result.languages.includes('java'));
    assert.ok(result.frameworks.includes('spring'), 'should detect Spring Boot from build.gradle');
  });
});

describe('NestJS and Express detection', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('detects NestJS from package.json', () => {
    writeFileSync(join(TMP, 'package.json'), JSON.stringify({
      dependencies: { '@nestjs/core': '^10.0.0', '@nestjs/common': '^10.0.0' },
      scripts: { test: 'jest' },
    }));
    const result = detectStack(TMP);
    assert.ok(result.frameworks.includes('nestjs'));
  });

  it('detects Express from package.json', () => {
    writeFileSync(join(TMP, 'package.json'), JSON.stringify({
      dependencies: { 'express': '^4.18.0' },
      scripts: { test: 'jest' },
    }));
    const result = detectStack(TMP);
    assert.ok(result.frameworks.includes('express'));
  });
});

describe('Vue and Svelte detection', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('detects Vue from package.json', () => {
    writeFileSync(join(TMP, 'package.json'), JSON.stringify({
      dependencies: { 'vue': '^3.4.0' },
      devDependencies: { 'vitest': '^1.0.0' },
      scripts: { test: 'vitest' },
    }));
    const result = detectStack(TMP);
    assert.ok(result.frameworks.includes('vue'));
    assert.ok(result.test_frameworks.includes('vitest'));
  });

  it('detects Svelte from package.json', () => {
    writeFileSync(join(TMP, 'package.json'), JSON.stringify({
      devDependencies: { 'svelte': '^4.0.0', '@sveltejs/kit': '^2.0.0' },
      scripts: { test: 'vitest' },
    }));
    const result = detectStack(TMP);
    assert.ok(result.frameworks.includes('svelte'));
    assert.ok(result.frameworks.includes('sveltekit'));
  });
});
