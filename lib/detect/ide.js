/**
 * IDE Detection Engine
 *
 * Detects which AI-powered IDEs are installed by checking
 * for config directories and CLI binaries.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const IDE_CHECKS = [
  {
    id: 'claude',
    name: 'Claude Code',
    configDir: '.claude',
    binary: 'claude',
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    configDir: '.windsurf',
    binary: null,
  },
  {
    id: 'cursor',
    name: 'Cursor',
    configDir: '.cursor',
    binary: null,
  },
  {
    id: 'codex',
    name: 'Codex',
    configDir: '.codex',
    binary: 'codex',
  },
  {
    id: 'kiro',
    name: 'Kiro',
    configDir: '.kiro',
    binary: null,
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    configDir: '.gemini',
    binary: 'gemini',
  },
  {
    id: 'antigravity',
    name: 'Antigravity',
    configDir: '.antigravity',
    binary: null,
  },
];

/**
 * Detect installed IDEs in the workspace and system.
 * @param {string} workspacePath - Absolute path to workspace root
 * @returns {Array<{ id: string, name: string }>}
 */
export function detectIDEs(workspacePath) {
  const detected = [];

  for (const ide of IDE_CHECKS) {
    // Check for config directory in workspace
    if (existsSync(join(workspacePath, ide.configDir))) {
      detected.push({ id: ide.id, name: ide.name });
      continue;
    }

    // Check for binary in PATH
    if (ide.binary) {
      try {
        execSync(`which ${ide.binary} 2>/dev/null`, { stdio: 'pipe' });
        detected.push({ id: ide.id, name: ide.name });
      } catch (e) {
        // Binary not found
      }
    }
  }

  return detected;
}

/**
 * Get the skills directory path for a given IDE.
 * @param {string} ideId - IDE identifier
 * @returns {string} Path pattern for skills
 */
export function getSkillsPath(ideId) {
  const paths = {
    claude: '.claude/skills/sqad-*/SKILL.md',
    windsurf: '.windsurf/skills/sqad-*/SKILL.md',
    cursor: '.cursor/rules/sqad-*.mdc',
    codex: '.codex/skills/sqad-*/SKILL.md',
    kiro: '.kiro/skills/sqad-*/SKILL.md',
    gemini: '.gemini/skills/sqad-*/SKILL.md',
    antigravity: '.antigravity/skills/sqad-*/SKILL.md',
  };
  return paths[ideId] || '';
}
