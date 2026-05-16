/**
 * SQUAD-Public Codex Transformer
 *
 * Deploys skills to .codex/skills/skill-name/SKILL.md
 * OpenAI Codex CLI uses the same directory-based skill format.
 */

import { deploySkillDir } from './base.js';

/**
 * Deploy a canonical skill to Codex format.
 * @param {string} workspacePath
 * @param {object} skill
 * @param {object} options
 * @returns {string|null}
 */
export function deploy(workspacePath, skill, options = {}) {
  return deploySkillDir(workspacePath, skill, '.codex', options);
}

export const IDE_ID = 'codex';
export const SKILLS_PATH = '.codex/skills';
