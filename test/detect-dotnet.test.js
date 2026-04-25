import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { detectStack, deepFindByExtension } from '../lib/detect/stack.js';

let TMP;

function setup() {
  TMP = mkdtempSync(join(tmpdir(), 'sqad-dotnet-'));
}

function teardown() {
  rmSync(TMP, { recursive: true, force: true });
}

describe('C#/.NET detection', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('detects C# from top-level .csproj', () => {
    writeFileSync(join(TMP, 'MyApp.csproj'), `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" />
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
  </ItemGroup>
</Project>`);
    const result = detectStack(TMP);
    assert.ok(result.languages.includes('csharp'), 'should detect csharp language');
    assert.ok(result.frameworks.includes('dotnet-core'), 'should detect dotnet-core framework');
    assert.ok(result.frameworks.includes('aspnet'), 'should detect ASP.NET Core');
    assert.ok(result.frameworks.includes('ef-core'), 'should detect Entity Framework Core');
    assert.ok(result.build_tools.includes('dotnet'), 'should detect dotnet build tool');
    assert.equal(result.test_command, 'dotnet test');
    assert.equal(result.build_command, 'dotnet build');
  });

  it('detects C# from nested .csproj (deep scan)', () => {
    const nested = join(TMP, 'src', 'MyApp.Api');
    mkdirSync(nested, { recursive: true });
    writeFileSync(join(nested, 'MyApp.Api.csproj'), `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
</Project>`);
    const result = detectStack(TMP);
    assert.ok(result.languages.includes('csharp'), 'should detect csharp from nested csproj');
    assert.ok(result.frameworks.includes('dotnet-core'));
  });

  it('detects .NET Framework (legacy) from csproj', () => {
    writeFileSync(join(TMP, 'LegacyApp.csproj'), `<Project>
  <PropertyGroup>
    <TargetFrameworkVersion>net48</TargetFrameworkVersion>
  </PropertyGroup>
</Project>`);
    const result = detectStack(TMP);
    assert.ok(result.languages.includes('csharp'));
    assert.ok(result.frameworks.includes('dotnet-framework'), 'should detect legacy .NET Framework');
  });

  it('detects C# from .sln file', () => {
    writeFileSync(join(TMP, 'MyApp.sln'), 'Microsoft Visual Studio Solution File');
    const result = detectStack(TMP);
    assert.ok(result.languages.includes('csharp'), 'should detect csharp from .sln');
  });

  it('detects xUnit test framework from csproj', () => {
    writeFileSync(join(TMP, 'Tests.csproj'), `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="xunit" Version="2.6.0" />
    <PackageReference Include="xunit.runner.visualstudio" />
  </ItemGroup>
</Project>`);
    const result = detectStack(TMP);
    assert.ok(result.test_frameworks.includes('xunit'));
  });

  it('detects NUnit test framework from csproj', () => {
    writeFileSync(join(TMP, 'Tests.csproj'), `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup><TargetFramework>net8.0</TargetFramework></PropertyGroup>
  <ItemGroup>
    <PackageReference Include="NUnit" Version="3.14.0" />
  </ItemGroup>
</Project>`);
    const result = detectStack(TMP);
    assert.ok(result.test_frameworks.includes('nunit'));
  });
});

describe('deepFindByExtension', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('finds files at multiple levels', () => {
    mkdirSync(join(TMP, 'a', 'b'), { recursive: true });
    writeFileSync(join(TMP, 'top.csproj'), '');
    writeFileSync(join(TMP, 'a', 'mid.csproj'), '');
    writeFileSync(join(TMP, 'a', 'b', 'deep.csproj'), '');
    const files = deepFindByExtension(TMP, ['.csproj'], 4);
    assert.equal(files.length, 3);
  });

  it('respects max depth', () => {
    mkdirSync(join(TMP, 'a', 'b', 'c', 'd'), { recursive: true });
    writeFileSync(join(TMP, 'a', 'b', 'c', 'd', 'tooDeep.csproj'), '');
    const files = deepFindByExtension(TMP, ['.csproj'], 2);
    assert.equal(files.length, 0, 'should not find file beyond max depth');
  });

  it('skips node_modules', () => {
    mkdirSync(join(TMP, 'node_modules', 'pkg'), { recursive: true });
    writeFileSync(join(TMP, 'node_modules', 'pkg', 'fake.csproj'), '');
    const files = deepFindByExtension(TMP, ['.csproj'], 4);
    assert.equal(files.length, 0);
  });
});
