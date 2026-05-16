/**
 * SQUAD-Public Cursor Transformer
 *
 * Deploys skills to .cursor/rules/skill-name.mdc
 * Cursor uses .mdc (markdown config) files with specific frontmatter.
 */

import { deployAsRuleFile, toMdcFrontmatter, stripFrontmatter } from './base.js';

/**
 * Deploy a canonical skill to Cursor .mdc format.
 * @param {string} workspacePath
 * @param {object} skill
 * @param {object} options
 * @returns {string|null}
 */
export function deploy(workspacePath, skill, options = {}) {
  return deployAsRuleFile(workspacePath, skill, '.cursor/rules', options, transformToMdc);
}

/**
 * Transform canonical SKILL.md to Cursor .mdc format.
 */
function transformToMdc(content, frontmatter) {
  const mdcFrontmatter = toMdcFrontmatter(frontmatter);
  const body = stripFrontmatter(content);
  return mdcFrontmatter + body;
}

export const IDE_ID = 'cursor';
export const SKILLS_PATH = '.cursor/rules';
