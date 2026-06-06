/**
 * SQUAD-Public Devin Transformer
 *
 * Deploys skills to .devin/skills/skill-name/SKILL.md
 * Devin (by Cognition) is the successor to Windsurf, with parallel
 * execution and multi-model support.
 *
 * Devin uses the canonical SKILL.md format directly.
 * Also supports .devin/workflows/ for slash commands.
 */

import { deploySkillDir } from './base.js';

/**
 * Deploy a canonical skill to Devin format.
 * @param {string} workspacePath
 * @param {object} skill - { name, dir, content, frontmatter }
 * @param {object} options - { force }
 * @returns {string|null}
 */
export function deploy(workspacePath, skill, options = {}) {
  return deploySkillDir(workspacePath, skill, '.devin', options);
}

export const IDE_ID = 'devin';
export const SKILLS_PATH = '.devin/skills';
