/**
 * SQAD-Public Claude Transformer
 *
 * Deploys skills to .claude/skills/skill-name/SKILL.md
 * Claude Code uses the same SKILL.md format.
 */

import { deploySkillDir } from './base.js';

/**
 * Deploy a canonical skill to Claude Code format.
 * @param {string} workspacePath
 * @param {object} skill
 * @param {object} options
 * @returns {string|null}
 */
export function deploy(workspacePath, skill, options = {}) {
  return deploySkillDir(workspacePath, skill, '.claude', options);
}

export const IDE_ID = 'claude';
export const SKILLS_PATH = '.claude/skills';
