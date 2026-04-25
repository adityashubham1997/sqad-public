/**
 * Stack Detection Engine
 *
 * Scans workspace for marker files and dependency manifests
 * to detect languages, frameworks, build tools, and test frameworks.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const LANGUAGE_MARKERS = [
  { file: 'package.json', language: 'javascript' },
  { file: 'tsconfig.json', language: 'typescript' },
  { file: 'pom.xml', language: 'java' },
  { file: 'build.gradle', language: 'java' },
  { file: 'build.gradle.kts', language: 'kotlin' },
  { file: 'requirements.txt', language: 'python' },
  { file: 'pyproject.toml', language: 'python' },
  { file: 'setup.py', language: 'python' },
  { file: 'go.mod', language: 'go' },
  { file: 'Cargo.toml', language: 'rust' },
  { file: 'Gemfile', language: 'ruby' },
  { file: 'Package.swift', language: 'swift' },
  { file: 'Podfile', language: 'swift' },
  { file: 'CMakeLists.txt', language: 'cpp' },
  { file: 'Makefile', language: 'c' },
  { file: 'meson.build', language: 'cpp' },
];

// Extensions that indicate C/C++ projects (deep scan)
const CPP_EXTENSIONS = ['.cpp', '.cc', '.cxx', '.hpp', '.hxx', '.c', '.h'];

// Extensions/directories that indicate iOS/Android native projects (deep scan)
const IOS_MARKERS = ['.xcodeproj', '.xcworkspace'];
const ANDROID_MARKERS = ['AndroidManifest.xml'];

// Extensions that indicate C# / .NET projects (detected via deep scan)
const CSHARP_EXTENSIONS = ['.csproj', '.sln', '.fsproj'];

// Extensions that indicate iOS projects (deep scan)
const IOS_EXTENSIONS = ['.xcodeproj', '.xcworkspace', '.swift'];

// Max depth for recursive scanning
const MAX_SCAN_DEPTH = 4;

// Directories to skip during recursive scanning
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', 'bin', 'obj',
  '.next', '.nuxt', '__pycache__', '.venv', 'venv', 'vendor',
  'target', 'coverage', '.angular', '.svelte-kit',
]);

const FRAMEWORK_DETECTORS = {
  javascript: [
    { dep: 'react', framework: 'react' },
    { dep: 'react-native', framework: 'react-native' },
    { dep: 'next', framework: 'nextjs' },
    { dep: 'vue', framework: 'vue' },
    { dep: '@angular/core', framework: 'angular' },
    { dep: 'svelte', framework: 'svelte' },
    { dep: '@sveltejs/kit', framework: 'sveltekit' },
    { dep: 'express', framework: 'express' },
    { dep: '@nestjs/core', framework: 'nestjs' },
    { dep: '@ionic/angular', framework: 'ionic' },
    { dep: '@ionic/react', framework: 'ionic' },
    { dep: '@ionic/vue', framework: 'ionic' },
    { dep: '@capacitor/core', framework: 'ionic' },
    { dep: 'langchain', framework: 'langchain' },
    { dep: '@langchain/core', framework: 'langchain' },
    { dep: 'openai', framework: 'openai' },
    { dep: '@anthropic-ai/sdk', framework: 'anthropic' },
  ],
  python: [
    { dep: 'django', framework: 'django' },
    { dep: 'Django', framework: 'django' },
    { dep: 'flask', framework: 'flask' },
    { dep: 'Flask', framework: 'flask' },
    { dep: 'fastapi', framework: 'fastapi' },
    { dep: 'FastAPI', framework: 'fastapi' },
    { dep: 'langchain', framework: 'langchain' },
    { dep: 'llama-index', framework: 'llamaindex' },
    { dep: 'llama_index', framework: 'llamaindex' },
    { dep: 'openai', framework: 'openai' },
    { dep: 'anthropic', framework: 'anthropic' },
    { dep: 'crewai', framework: 'crewai' },
    { dep: 'autogen', framework: 'autogen' },
    { dep: 'pyautogen', framework: 'autogen' },
  ],
  ruby: [
    { dep: 'rails', framework: 'rails' },
    { dep: 'sinatra', framework: 'sinatra' },
  ],
  java: [
    { dep: 'spring-boot', framework: 'spring' },
    { dep: 'spring-boot-starter', framework: 'spring' },
    { dep: 'quarkus', framework: 'quarkus' },
    { dep: 'micronaut', framework: 'micronaut' },
  ],
};

const TEST_FRAMEWORK_DETECTORS = {
  javascript: [
    { dep: 'jest', framework: 'jest' },
    { dep: 'mocha', framework: 'mocha' },
    { dep: 'vitest', framework: 'vitest' },
    { dep: '@playwright/test', framework: 'playwright' },
    { dep: 'cypress', framework: 'cypress' },
  ],
  python: [
    { dep: 'pytest', framework: 'pytest' },
  ],
  java: [
    { dep: 'junit', framework: 'junit' },
  ],
};

/**
 * Detect the tech stack in a workspace directory.
 * @param {string} workspacePath - Absolute path to workspace root
 * @returns {{ languages: string[], frameworks: string[], build_tools: string[], test_frameworks: string[] }}
 */
export function detectStack(workspacePath) {
  const result = {
    languages: [],
    frameworks: [],
    build_tools: [],
    test_frameworks: [],
    test_command: '',
    build_command: '',
    lint_command: '',
  };

  // Detect languages from marker files (top-level)
  for (const { file, language } of LANGUAGE_MARKERS) {
    if (existsSync(join(workspacePath, file))) {
      if (!result.languages.includes(language)) {
        result.languages.push(language);
      }
    }
  }

  // Deep scan for C/C++ source files
  const cppFiles = deepFindByExtension(workspacePath, CPP_EXTENSIONS, 2);
  if (cppFiles.length > 0) {
    const hasC = cppFiles.some(f => f.endsWith('.c'));
    const hasCpp = cppFiles.some(f => f.endsWith('.cpp') || f.endsWith('.cc') || f.endsWith('.cxx') || f.endsWith('.hpp') || f.endsWith('.hxx'));
    if (hasC && !result.languages.includes('c')) result.languages.push('c');
    if (hasCpp && !result.languages.includes('cpp')) result.languages.push('cpp');
    if (!hasC && !hasCpp && !result.languages.includes('c')) result.languages.push('c');
  }

  // Deep scan for C#/.NET project files (*.csproj, *.sln, *.fsproj)
  const csharpFiles = deepFindByExtension(workspacePath, CSHARP_EXTENSIONS, MAX_SCAN_DEPTH);
  if (csharpFiles.length > 0) {
    if (!result.languages.includes('csharp')) {
      result.languages.push('csharp');
    }
    // Detect .NET frameworks from csproj content
    detectDotnetFrameworks(csharpFiles, result);
  }

  // Deep scan for Android native projects (AndroidManifest.xml, build.gradle with android plugin)
  detectAndroidNative(workspacePath, result);

  // Deep scan for iOS native projects (*.xcodeproj, *.xcworkspace, Podfile)
  detectIOSNative(workspacePath, result);

  // Ionic detection from ionic.config.json
  if (existsSync(join(workspacePath, 'ionic.config.json'))) {
    if (!result.frameworks.includes('ionic')) {
      result.frameworks.push('ionic');
    }
  }

  // Parse package.json for JS/TS frameworks and tools
  const pkgPath = join(workspacePath, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };

      // Detect frameworks
      const jsDetectors = [
        ...(FRAMEWORK_DETECTORS.javascript || []),
      ];
      for (const { dep, framework } of jsDetectors) {
        if (allDeps[dep]) {
          if (!result.frameworks.includes(framework)) {
            result.frameworks.push(framework);
          }
        }
      }

      // React Native detection: if react-native detected, also ensure react is listed
      if (result.frameworks.includes('react-native') && !result.frameworks.includes('react')) {
        result.frameworks.push('react');
      }

      // Detect test frameworks
      const testDetectors = [
        ...(TEST_FRAMEWORK_DETECTORS.javascript || []),
      ];
      for (const { dep, framework } of testDetectors) {
        if (allDeps[dep]) {
          if (!result.test_frameworks.includes(framework)) {
            result.test_frameworks.push(framework);
          }
        }
      }

      // Detect build tools
      if (allDeps['typescript'] || existsSync(join(workspacePath, 'tsconfig.json'))) {
        if (!result.languages.includes('typescript')) {
          result.languages.push('typescript');
        }
      }

      // Detect commands from scripts
      if (pkg.scripts) {
        if (pkg.scripts.test) result.test_command = `npm test`;
        if (pkg.scripts.build) result.build_command = `npm run build`;
        if (pkg.scripts.lint) result.lint_command = `npm run lint`;
      }

      // Build tool detection
      result.build_tools.push('npm');
      if (existsSync(join(workspacePath, 'yarn.lock'))) result.build_tools.push('yarn');
      if (existsSync(join(workspacePath, 'pnpm-lock.yaml'))) result.build_tools.push('pnpm');
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Python framework detection from requirements.txt
  if (result.languages.includes('python')) {
    detectPythonFrameworks(workspacePath, result);
    if (existsSync(join(workspacePath, 'pyproject.toml'))) {
      result.build_tools.push('pip');
      result.test_command = result.test_command || 'pytest';
    }
  }

  // Java/Kotlin build tools
  if (existsSync(join(workspacePath, 'pom.xml'))) {
    result.build_tools.push('maven');
    result.build_command = result.build_command || 'mvn clean install';
    result.test_command = result.test_command || 'mvn test';
  }
  if (existsSync(join(workspacePath, 'build.gradle')) || existsSync(join(workspacePath, 'build.gradle.kts'))) {
    result.build_tools.push('gradle');
    result.build_command = result.build_command || './gradlew build';
    result.test_command = result.test_command || './gradlew test';
  }

  // Go
  if (result.languages.includes('go')) {
    result.test_command = result.test_command || 'go test ./...';
    result.build_command = result.build_command || 'go build ./...';
  }

  // Rust
  if (result.languages.includes('rust')) {
    result.build_tools.push('cargo');
    result.test_command = result.test_command || 'cargo test';
    result.build_command = result.build_command || 'cargo build';
  }

  // C/C++ build tools
  if (result.languages.includes('cpp') || result.languages.includes('c')) {
    if (existsSync(join(workspacePath, 'CMakeLists.txt'))) {
      if (!result.build_tools.includes('cmake')) result.build_tools.push('cmake');
      result.build_command = result.build_command || 'cmake --build build';
      result.test_command = result.test_command || 'ctest --test-dir build';
    }
    if (existsSync(join(workspacePath, 'meson.build'))) {
      if (!result.build_tools.includes('meson')) result.build_tools.push('meson');
      result.build_command = result.build_command || 'meson compile -C build';
      result.test_command = result.test_command || 'meson test -C build';
    }
    if (existsSync(join(workspacePath, 'Makefile'))) {
      if (!result.build_tools.includes('make')) result.build_tools.push('make');
      result.build_command = result.build_command || 'make';
      result.test_command = result.test_command || 'make test';
    }
  }

  // Ruby
  if (result.languages.includes('ruby')) {
    result.build_tools.push('bundler');
    result.test_command = result.test_command || 'bundle exec rspec';
    result.lint_command = result.lint_command || 'bundle exec rubocop';
    detectRubyFrameworks(workspacePath, result);
  }

  // Java/Kotlin framework detection from build files
  if (result.languages.includes('java') || result.languages.includes('kotlin')) {
    detectJavaFrameworks(workspacePath, result);
  }

  // C# / .NET
  if (result.languages.includes('csharp')) {
    result.build_tools.push('dotnet');
    result.test_command = result.test_command || 'dotnet test';
    result.build_command = result.build_command || 'dotnet build';
    result.lint_command = result.lint_command || 'dotnet format';
  }

  // Swift / iOS
  if (result.languages.includes('swift')) {
    result.build_command = result.build_command || 'xcodebuild';
    result.test_command = result.test_command || 'xcodebuild test';
  }

  return result;
}

/**
 * Detect Android native projects via deep scan.
 */
function detectAndroidNative(workspacePath, result) {
  // Check for Android Gradle plugin markers
  const manifestFiles = deepFindByName(workspacePath, ['AndroidManifest.xml'], MAX_SCAN_DEPTH);
  if (manifestFiles.length > 0) {
    if (!result.frameworks.includes('android')) {
      result.frameworks.push('android');
    }
    // Check if Kotlin is used (build.gradle with kotlin-android)
    const gradleFiles = deepFindByName(workspacePath, ['build.gradle', 'build.gradle.kts'], 3);
    for (const gf of gradleFiles) {
      try {
        const content = readFileSync(gf, 'utf8');
        if (content.includes('kotlin-android') || content.includes('org.jetbrains.kotlin.android')) {
          if (!result.languages.includes('kotlin')) result.languages.push('kotlin');
        }
        if (content.includes('com.android.application') || content.includes('com.android.library')) {
          if (!result.build_tools.includes('gradle')) result.build_tools.push('gradle');
          result.build_command = result.build_command || './gradlew assembleDebug';
          result.test_command = result.test_command || './gradlew testDebugUnitTest';
        }
      } catch (e) { /* ignore */ }
    }
    return;
  }
}

/**
 * Detect iOS native projects via deep scan.
 */
function detectIOSNative(workspacePath, result) {
  // Check for Xcode project files
  const xcFiles = deepFindByExtension(workspacePath, ['.xcodeproj', '.xcworkspace'], 3);
  if (xcFiles.length > 0) {
    if (!result.frameworks.includes('ios')) {
      result.frameworks.push('ios');
    }
    if (!result.languages.includes('swift')) {
      result.languages.push('swift');
    }
  }
  // Podfile indicates CocoaPods
  if (existsSync(join(workspacePath, 'Podfile'))) {
    if (!result.frameworks.includes('ios')) {
      result.frameworks.push('ios');
    }
    if (!result.languages.includes('swift')) {
      result.languages.push('swift');
    }
    if (!result.build_tools.includes('cocoapods')) {
      result.build_tools.push('cocoapods');
    }
  }
  // Swift Package Manager
  if (existsSync(join(workspacePath, 'Package.swift'))) {
    if (!result.build_tools.includes('spm')) {
      result.build_tools.push('spm');
    }
  }
}

/**
 * Recursively find files by extension up to a max depth.
 * @param {string} dir - Directory to scan
 * @param {string[]} extensions - File extensions to match (e.g. ['.csproj', '.sln'])
 * @param {number} maxDepth - Maximum recursion depth
 * @param {number} [currentDepth=0]
 * @returns {string[]} - Array of absolute file paths
 */
export function deepFindByExtension(dir, extensions, maxDepth, currentDepth = 0) {
  const results = [];
  if (currentDepth > maxDepth) return results;
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry)) continue;
      const fullPath = join(dir, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isFile() && extensions.includes(extname(entry).toLowerCase())) {
          results.push(fullPath);
        } else if (stat.isDirectory()) {
          results.push(...deepFindByExtension(fullPath, extensions, maxDepth, currentDepth + 1));
        }
      } catch (e) { /* skip inaccessible */ }
    }
  } catch (e) { /* skip unreadable dirs */ }
  return results;
}

/**
 * Detect .NET frameworks from csproj file content.
 */
function detectDotnetFrameworks(csprojFiles, result) {
  for (const filePath of csprojFiles) {
    if (!filePath.endsWith('.csproj')) continue;
    try {
      const content = readFileSync(filePath, 'utf8');
      // Detect .NET Core / .NET 5+ (modern .NET)
      if (content.includes('net6.0') || content.includes('net7.0') || content.includes('net8.0') ||
          content.includes('net9.0') || content.includes('netcoreapp')) {
        if (!result.frameworks.includes('dotnet-core')) {
          result.frameworks.push('dotnet-core');
        }
      }
      // Detect .NET Framework (legacy)
      if (content.includes('net4') || content.includes('net48') || content.includes('net472')) {
        if (!result.frameworks.includes('dotnet-framework')) {
          result.frameworks.push('dotnet-framework');
        }
      }
      // Detect ASP.NET Core
      if (content.includes('Microsoft.AspNetCore') || content.includes('Microsoft.NET.Sdk.Web')) {
        if (!result.frameworks.includes('aspnet')) {
          result.frameworks.push('aspnet');
        }
      }
      // Detect Entity Framework Core
      if (content.includes('Microsoft.EntityFrameworkCore')) {
        if (!result.frameworks.includes('ef-core')) {
          result.frameworks.push('ef-core');
        }
      }
      // Detect test frameworks
      if (content.includes('xunit')) {
        if (!result.test_frameworks.includes('xunit')) result.test_frameworks.push('xunit');
      }
      if (content.includes('NUnit')) {
        if (!result.test_frameworks.includes('nunit')) result.test_frameworks.push('nunit');
      }
      if (content.includes('MSTest')) {
        if (!result.test_frameworks.includes('mstest')) result.test_frameworks.push('mstest');
      }
    } catch (e) { /* ignore read errors */ }
  }
}

/**
 * Detect Python frameworks from requirements.txt and pyproject.toml.
 */
function detectPythonFrameworks(workspacePath, result) {
  const pyDetectors = FRAMEWORK_DETECTORS.python || [];
  const reqFiles = ['requirements.txt', 'requirements-dev.txt', 'requirements/base.txt'];

  // Check requirements files
  for (const reqFile of reqFiles) {
    const reqPath = join(workspacePath, reqFile);
    if (existsSync(reqPath)) {
      try {
        const content = readFileSync(reqPath, 'utf8').toLowerCase();
        for (const { dep, framework } of pyDetectors) {
          if (content.includes(dep.toLowerCase()) && !result.frameworks.includes(framework)) {
            result.frameworks.push(framework);
          }
        }
      } catch (e) { /* ignore */ }
    }
  }

  // Check pyproject.toml
  const pyprojectPath = join(workspacePath, 'pyproject.toml');
  if (existsSync(pyprojectPath)) {
    try {
      const content = readFileSync(pyprojectPath, 'utf8').toLowerCase();
      for (const { dep, framework } of pyDetectors) {
        if (content.includes(dep.toLowerCase()) && !result.frameworks.includes(framework)) {
          result.frameworks.push(framework);
        }
      }
      // Detect pytest
      if (content.includes('pytest') && !result.test_frameworks.includes('pytest')) {
        result.test_frameworks.push('pytest');
      }
    } catch (e) { /* ignore */ }
  }
}

/**
 * Detect Ruby frameworks from Gemfile.
 */
function detectRubyFrameworks(workspacePath, result) {
  const gemfilePath = join(workspacePath, 'Gemfile');
  if (existsSync(gemfilePath)) {
    try {
      const content = readFileSync(gemfilePath, 'utf8').toLowerCase();
      const rubyDetectors = FRAMEWORK_DETECTORS.ruby || [];
      for (const { dep, framework } of rubyDetectors) {
        if (content.includes(`'${dep}'`) || content.includes(`"${dep}"`)) {
          if (!result.frameworks.includes(framework)) {
            result.frameworks.push(framework);
          }
        }
      }
      // Detect test frameworks
      if (content.includes("'rspec'") || content.includes('"rspec"')) {
        if (!result.test_frameworks.includes('rspec')) result.test_frameworks.push('rspec');
      }
      if (content.includes("'minitest'") || content.includes('"minitest"')) {
        if (!result.test_frameworks.includes('minitest')) result.test_frameworks.push('minitest');
      }
    } catch (e) { /* ignore */ }
  }
}

/**
 * Recursively find files by exact name up to a max depth (for stack detection).
 */
function deepFindByName(dir, names, maxDepth, currentDepth = 0) {
  const results = [];
  if (currentDepth > maxDepth) return results;
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry)) continue;
      const fullPath = join(dir, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isFile() && names.includes(entry)) {
          results.push(fullPath);
        } else if (stat.isDirectory()) {
          // For .xcodeproj/.xcworkspace which are directories
          if (names.some(n => entry.endsWith(n))) {
            results.push(fullPath);
          } else {
            results.push(...deepFindByName(fullPath, names, maxDepth, currentDepth + 1));
          }
        }
      } catch (e) { /* skip inaccessible */ }
    }
  } catch (e) { /* skip unreadable dirs */ }
  return results;
}

/**
 * Detect Java/Kotlin frameworks from build files (pom.xml, build.gradle).
 */
function detectJavaFrameworks(workspacePath, result) {
  // Check pom.xml
  const pomPath = join(workspacePath, 'pom.xml');
  if (existsSync(pomPath)) {
    try {
      const content = readFileSync(pomPath, 'utf8').toLowerCase();
      if (content.includes('spring-boot') || content.includes('spring-boot-starter')) {
        if (!result.frameworks.includes('spring')) result.frameworks.push('spring');
      }
      if (content.includes('quarkus')) {
        if (!result.frameworks.includes('quarkus')) result.frameworks.push('quarkus');
      }
    } catch (e) { /* ignore */ }
  }

  // Check build.gradle / build.gradle.kts
  for (const gradleFile of ['build.gradle', 'build.gradle.kts']) {
    const gradlePath = join(workspacePath, gradleFile);
    if (existsSync(gradlePath)) {
      try {
        const content = readFileSync(gradlePath, 'utf8').toLowerCase();
        if (content.includes('spring-boot') || content.includes('org.springframework.boot')) {
          if (!result.frameworks.includes('spring')) result.frameworks.push('spring');
        }
        if (content.includes('quarkus')) {
          if (!result.frameworks.includes('quarkus')) result.frameworks.push('quarkus');
        }
        if (content.includes('micronaut')) {
          if (!result.frameworks.includes('micronaut')) result.frameworks.push('micronaut');
        }
      } catch (e) { /* ignore */ }
    }
  }
}
