/**
 * SQUAD-Public Claude Transformer
 *
 * Deploys skills to .claude/skills/skill-name/SKILL.md (SQUAD skill format).
 * If frontmatter has deploy_as_command: true, also deploys to .claude/commands/
 * so the skill appears as a native slash command in Claude Code.
 */

import { deploySkillDir, deployAsRuleFile, stripFrontmatter } from './base.js';

/**
 * Deploy a canonical skill to Claude Code format.
 * Default: .claude/skills/ (SQUAD plugin format)
 * Optional: .claude/commands/ (native slash command format, when deploy_as_command: true)
 * @param {string} workspacePath
 * @param {object} skill
 * @param {object} options
 * @returns {string|null}
 */
export function deploy(workspacePath, skill, options = {}) {
  const deployAsCommand = skill.frontmatter?.deploy_as_command === 'true' ||
    skill.frontmatter?.deploy_as_command === true;

  if (deployAsCommand) {
    // Deploy to .claude/commands/ as a flat .md file (native Claude Code command)
    return deployAsRuleFile(workspacePath, skill, '.claude/commands', options,
      (content) => stripFrontmatter(content));
  }
  // Default: deploy to .claude/skills/ (SQUAD plugin format)
  return deploySkillDir(workspacePath, skill, '.claude', options);
}

export const IDE_ID = 'claude';
export const SKILLS_PATH = '.claude/skills';
export const COMMANDS_PATH = '.claude/commands';
