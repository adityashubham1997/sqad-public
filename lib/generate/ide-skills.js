/**
 * SQAD-Public IDE Skill Generator
 *
 * Deploys canonical skills from sqad-method/skills/ to IDE-specific
 * locations using the appropriate transformer for each IDE.
 */

import { existsSync, readdirSync, mkdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';

// IDE transformer registry — lazy-loaded
const TRANSFORMER_MAP = {
  windsurf:     '../transform/windsurf.js',
  claude:       '../transform/claude.js',
  cursor:       '../transform/cursor.js',
  codex:        '../transform/codex.js',
  kiro:         '../transform/kiro.js',
  gemini:       '../transform/gemini.js',
  antigravity:  '../transform/antigravity.js',
};

/**
 * Deploy all canonical skills to detected IDEs.
 * @param {string} workspacePath - Workspace root
 * @param {object} options
 * @param {string[]} [options.ides] - Specific IDEs to target (default: all detected)
 * @param {string[]} [options.skills] - Specific skills to deploy (default: all)
 * @param {boolean} [options.force=false] - Overwrite existing skill files
 * @returns {{ deployed: object[], errors: string[] }}
 */
export async function deploySkills(workspacePath, options = {}) {
  const skillsDir = join(workspacePath, 'sqad-method', 'skills');
  const result = { deployed: [], errors: [] };

  // Find canonical skills
  const canonicalSkills = discoverSkills(skillsDir);
  if (canonicalSkills.length === 0) {
    result.errors.push('No canonical skills found in sqad-method/skills/');
    return result;
  }

  // Determine target IDEs
  const targetIdes = options.ides || detectInstalledIdes(workspacePath);
  if (targetIdes.length === 0) {
    result.errors.push('No IDEs detected. Use --ide flag or install an AI IDE.');
    return result;
  }

  // Deploy to each IDE
  for (const ide of targetIdes) {
    const transformerPath = TRANSFORMER_MAP[ide];
    if (!transformerPath) {
      result.errors.push(`No transformer for IDE: ${ide}`);
      continue;
    }

    try {
      const transformer = await import(transformerPath);
      const skillsToProcess = options.skills
        ? canonicalSkills.filter(s => options.skills.includes(s.name))
        : canonicalSkills;

      for (const skill of skillsToProcess) {
        try {
          const deployed = transformer.deploy(workspacePath, skill, { force: options.force });
          if (deployed) {
            result.deployed.push({ ide, skill: skill.name, path: deployed });
          }
        } catch (e) {
          result.errors.push(`${ide}/${skill.name}: ${e.message}`);
        }
      }
    } catch (e) {
      result.errors.push(`Failed to load transformer for ${ide}: ${e.message}`);
    }
  }

  return result;
}

/**
 * Discover canonical skill definitions in sqad-method/skills/.
 * Each skill is a directory containing SKILL.md.
 * @param {string} skillsDir
 * @returns {Array<{ name: string, dir: string, content: string, frontmatter: object }>}
 */
export function discoverSkills(skillsDir) {
  if (!existsSync(skillsDir)) return [];

  const skills = [];
  try {
    const entries = readdirSync(skillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillDir = join(skillsDir, entry.name);
      const skillFile = join(skillDir, 'SKILL.md');
      if (existsSync(skillFile)) {
        const content = readFileSync(skillFile, 'utf8');
        const frontmatter = parseFrontmatter(content);
        skills.push({
          name: entry.name,
          dir: skillDir,
          content,
          frontmatter,
        });
      }
    }
  } catch (e) { /* ignore */ }

  return skills;
}

/**
 * Parse simple YAML frontmatter from a skill markdown file.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  let currentKey = null;
  for (const line of match[1].split('\n')) {
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      let val = kvMatch[2].trim();
      // Handle multi-line value start (>)
      if (val === '>') {
        fm[currentKey] = '';
      } else {
        fm[currentKey] = val.replace(/^["']|["']$/g, '');
      }
    } else if (currentKey && line.startsWith('  ')) {
      // Continuation of multi-line value
      fm[currentKey] = ((fm[currentKey] || '') + ' ' + line.trim()).trim();
    }
  }
  return fm;
}

/**
 * Detect installed IDEs by checking for their config directories.
 */
function detectInstalledIdes(workspacePath) {
  const ideChecks = [
    { id: 'windsurf', dirs: ['.windsurf'] },
    { id: 'claude', dirs: ['.claude'] },
    { id: 'cursor', dirs: ['.cursor'] },
    { id: 'codex', dirs: ['.codex'] },
    { id: 'kiro', dirs: ['.kiro'] },
    { id: 'gemini', dirs: ['.gemini'] },
    { id: 'antigravity', dirs: ['.antigravity'] },
  ];

  const detected = [];
  for (const { id, dirs } of ideChecks) {
    for (const dir of dirs) {
      if (existsSync(join(workspacePath, dir))) {
        detected.push(id);
        break;
      }
    }
  }
  return detected;
}

/**
 * Get the list of all available skill names.
 * @param {string} workspacePath
 * @returns {string[]}
 */
export function listSkillNames(workspacePath) {
  const skillsDir = join(workspacePath, 'sqad-method', 'skills');
  return discoverSkills(skillsDir).map(s => s.name);
}
