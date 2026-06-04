/**
 * SQUAD-Public Antigravity Transformer
 *
 * Deploys skills to .agent/skills/skill-name/SKILL.md
 * Antigravity AI natively scans .agent/skills for slash commands.
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
  return deploySkillDir(workspacePath, skill, '.agent', options);
}

export const IDE_ID = 'antigravity';
export const SKILLS_PATH = '.agent/skills';
