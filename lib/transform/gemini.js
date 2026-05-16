/**
 * SQUAD-Public Gemini Transformer
 *
 * Deploys skills to .gemini/skills/skill-name/SKILL.md
 * Google Gemini uses the same directory-based skill format.
 */

import { deploySkillDir } from './base.js';

/**
 * Deploy a canonical skill to Gemini format.
 * @param {string} workspacePath
 * @param {object} skill
 * @param {object} options
 * @returns {string|null}
 */
export function deploy(workspacePath, skill, options = {}) {
  return deploySkillDir(workspacePath, skill, '.gemini', options);
}

export const IDE_ID = 'gemini';
export const SKILLS_PATH = '.gemini/skills';
