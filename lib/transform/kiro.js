/**
 * SQAD-Public Kiro Transformer
 *
 * Deploys skills to .kiro/skills/skill-name/SKILL.md
 * AWS Kiro uses the same directory-based skill format.
 */

import { deploySkillDir } from './base.js';

/**
 * Deploy a canonical skill to Kiro format.
 * @param {string} workspacePath
 * @param {object} skill
 * @param {object} options
 * @returns {string|null}
 */
export function deploy(workspacePath, skill, options = {}) {
  return deploySkillDir(workspacePath, skill, '.kiro', options);
}

export const IDE_ID = 'kiro';
export const SKILLS_PATH = '.kiro/skills';
