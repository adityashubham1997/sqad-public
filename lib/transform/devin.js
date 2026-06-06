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

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deploySkillDir } from './base.js';

/**
 * Deploy a canonical skill to Devin format.
 * Deploys both .devin/skills/ (SKILL.md) and .devin/workflows/ (slash command).
 * @param {string} workspacePath
 * @param {object} skill - { name, dir, content, frontmatter }
 * @param {object} options - { force }
 * @returns {string|null}
 */
export function deploy(workspacePath, skill, options = {}) {
  const result = deploySkillDir(workspacePath, skill, '.devin', options);

  // Also generate a workflow file for Devin slash commands
  const wfDir = join(workspacePath, '.devin', 'workflows');
  const wfFile = join(wfDir, skill.name + '.md');

  if (!existsSync(wfFile) || options.force) {
    mkdirSync(wfDir, { recursive: true });

    const desc = (skill.frontmatter?.description || '').replace(/\n\s*/g, ' ').trim();
    // Truncate to ~2 sentences for frontmatter
    const sentences = desc.match(/[^.!?]+[.!?]+/g);
    const shortDesc = sentences && sentences.length > 2
      ? sentences.slice(0, 2).join('').trim()
      : desc;

    const slashCmd = '/' + skill.name.replace('squad-', '');
    const wfContent = `---
description: ${shortDesc}
---

# ${slashCmd} — SQUAD Workflow

## Steps

1. Read the full skill definition:
   - Read \`squad-method/skills/${skill.name}/SKILL.md\` completely

2. Load required agent personas:
   - Read agent files as specified in the SKILL.md agents list

3. Read the base protocols:
   - Read \`squad-method/agents/_base-agent.md\`
   - Read \`squad-method/fragments/agent-orchestrator.md\`

4. Load project context:
   - Read \`CONTEXT.md\` (root context)
   - Read \`squad-method/config.yaml\` (project configuration)

5. Execute the skill following all phases, gates, and rules defined in SKILL.md.
`;
    writeFileSync(wfFile, wfContent, 'utf8');
  }

  return result;
}

export const IDE_ID = 'devin';
export const SKILLS_PATH = '.devin/skills';
