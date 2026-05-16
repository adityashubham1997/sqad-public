/**
 * SQUAD-Public Antigravity Transformer
 *
 * Deploys skills to .antigravity/skills/skill-name/SKILL.md
 * Antigravity AI uses the same directory-based skill format.
 */

import { deploySkillDir } from './base.js';

/**
 * Deploy a canonical skill to Antigravity format.
 * @param {string} workspacePath
 * @param {object} skill
 * @param {object} options
 * @returns {string|null}
 */
export function deploy(workspacePath, skill, options = {}) {
  return deploySkillDir(workspacePath, skill, '.antigravity', options);
}

export const IDE_ID = 'antigravity';
export const SKILLS_PATH = '.antigravity/skills';
