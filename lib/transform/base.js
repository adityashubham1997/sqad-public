/**
 * SQAD-Public Base Transformer
 *
 * Shared logic for transforming canonical skills into IDE-specific formats.
 * All IDE transformers extend this base.
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, copyFileSync } from 'node:fs';
import { join, basename } from 'node:path';

/**
 * Base deploy function for IDEs that use .ide/skills/skill-name/SKILL.md structure.
 * @param {string} workspacePath
 * @param {object} skill - { name, dir, content, frontmatter }
 * @param {string} ideDir - e.g. '.windsurf'
 * @param {object} options
 * @param {function} [contentTransform] - Optional content transform function
 * @returns {string|null} Path to deployed skill, or null if skipped
 */
export function deploySkillDir(workspacePath, skill, ideDir, options = {}, contentTransform = null) {
  const targetDir = join(workspacePath, ideDir, 'skills', skill.name);
  const targetFile = join(targetDir, 'SKILL.md');

  if (existsSync(targetFile) && !options.force) {
    return null; // already exists
  }

  mkdirSync(targetDir, { recursive: true });

  // Transform content or use canonical
  const content = contentTransform ? contentTransform(skill.content, skill.frontmatter) : skill.content;
  writeFileSync(targetFile, content, 'utf8');

  // Copy reference files (anything in skill dir besides SKILL.md)
  copyReferenceFiles(skill.dir, targetDir);

  return targetFile;
}

/**
 * Deploy as a single rules file (for Cursor .mdc format).
 * @param {string} workspacePath
 * @param {object} skill - { name, dir, content, frontmatter }
 * @param {string} rulesDir - e.g. '.cursor/rules'
 * @param {object} options
 * @param {function} contentTransform - Required content transform
 * @returns {string|null}
 */
export function deployAsRuleFile(workspacePath, skill, rulesDir, options = {}, contentTransform) {
  const targetDir = join(workspacePath, rulesDir);
  const targetFile = join(targetDir, `${skill.name}.mdc`);

  if (existsSync(targetFile) && !options.force) {
    return null;
  }

  mkdirSync(targetDir, { recursive: true });

  const content = contentTransform(skill.content, skill.frontmatter);
  writeFileSync(targetFile, content, 'utf8');

  return targetFile;
}

/**
 * Copy any reference files from canonical skill dir to target dir.
 */
function copyReferenceFiles(sourceDir, targetDir) {
  try {
    const entries = readdirSync(sourceDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'SKILL.md') continue;
      const srcPath = join(sourceDir, entry.name);
      const dstPath = join(targetDir, entry.name);
      if (entry.isFile()) {
        copyFileSync(srcPath, dstPath);
      } else if (entry.isDirectory()) {
        mkdirSync(dstPath, { recursive: true });
        // Recursively copy subdirectories
        copyReferenceFiles(srcPath, dstPath);
      }
    }
  } catch (e) { /* ignore */ }
}

/**
 * Convert markdown frontmatter to Cursor MDC frontmatter format.
 */
export function toMdcFrontmatter(frontmatter) {
  const desc = frontmatter.description || '';
  const name = frontmatter.name || '';
  return `---
description: ${desc}
globs:
alwaysApply: false
---
`;
}

/**
 * Strip YAML frontmatter from markdown content.
 */
export function stripFrontmatter(content) {
  return content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
}
