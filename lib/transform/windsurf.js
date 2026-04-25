/**
 * SQAD-Public Windsurf Transformer
 *
 * Deploys skills to .windsurf/skills/skill-name/SKILL.md
 * Windsurf uses the canonical SKILL.md format directly.
 */

import { deploySkillDir } from './base.js';

/**
 * Deploy a canonical skill to Windsurf format.
 * @param {string} workspacePath
 * @param {object} skill - { name, dir, content, frontmatter }
 * @param {object} options - { force }
 * @returns {string|null}
 */
export function deploy(workspacePath, skill, options = {}) {
  return deploySkillDir(workspacePath, skill, '.windsurf', options);
}

export const IDE_ID = 'windsurf';
export const SKILLS_PATH = '.windsurf/skills';
