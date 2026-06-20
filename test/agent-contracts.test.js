import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';

const AGENTS_DIR = join(import.meta.dirname, '..', 'squad-method', 'agents');

// Parse YAML frontmatter from markdown
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = {};
  const lines = match[1].split('\n');
  let currentKey = null;
  let currentArray = null;

  for (const line of lines) {
    // Simple key: value (or key: with no value for array headers)
    const kvMatch = line.match(/^(\w[\w_]*)\s*:\s*(.*)/);
    if (kvMatch && !line.startsWith('  ')) {
      currentKey = kvMatch[1];
      const val = (kvMatch[2] || '').trim();
      if (val === '') {
        fm[currentKey] = [];
      } else if (val === '>') {
        fm[currentKey] = '';
      } else if (val.startsWith('[')) {
        try {
          fm[currentKey] = JSON.parse(val.replace(/'/g, '"'));
        } catch {
          fm[currentKey] = val;
        }
      } else if (val === 'true') {
        fm[currentKey] = true;
      } else if (val === 'false') {
        fm[currentKey] = false;
      } else {
        fm[currentKey] = val.replace(/^["']|["']$/g, '');
      }
      currentArray = null;
    }
    // Array item
    if (line.match(/^\s+-\s+/) && currentKey) {
      if (!Array.isArray(fm[currentKey])) fm[currentKey] = [];
      fm[currentKey].push(line.replace(/^\s+-\s+/, '').trim());
    }
  }
  return fm;
}

// Get all agent files (excluding base/abstract)
function getAgentFiles() {
  return readdirSync(AGENTS_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('_') && f !== 'CATALOG.md')
    .map(f => ({
      name: basename(f, '.md'),
      path: join(AGENTS_DIR, f),
      content: readFileSync(join(AGENTS_DIR, f), 'utf8'),
    }));
}

describe('Agent Contract Validation', () => {
  const agents = getAgentFiles();

  test('should have at least 50 agent files', () => {
    assert.ok(agents.length >= 50, `Expected at least 50 agents, found ${agents.length}`);
  });

  test('every agent file should have valid YAML frontmatter', () => {
    for (const agent of agents) {
      const fm = parseFrontmatter(agent.content);
      assert.ok(fm, `${agent.name}: Missing or invalid frontmatter`);
    }
  });

  test('every agent should have required identity fields', () => {
    const requiredFields = ['name', 'agent_id', 'role'];
    for (const agent of agents) {
      const fm = parseFrontmatter(agent.content);
      if (!fm) continue;
      for (const field of requiredFields) {
        assert.ok(fm[field], `${agent.name}: Missing required field '${field}'`);
      }
    }
  });

  test('every agent should have an icon', () => {
    for (const agent of agents) {
      const fm = parseFrontmatter(agent.content);
      if (!fm) continue;
      assert.ok(fm.icon, `${agent.name}: Missing icon`);
    }
  });

  test('every agent should have capabilities array', () => {
    for (const agent of agents) {
      const fm = parseFrontmatter(agent.content);
      if (!fm) continue;
      assert.ok(fm.capabilities, `${agent.name}: Missing capabilities`);
    }
  });

  test('every agent should have a review_lens', () => {
    for (const agent of agents) {
      const fm = parseFrontmatter(agent.content);
      if (!fm) continue;
      assert.ok(fm.review_lens, `${agent.name}: Missing review_lens`);
    }
  });

  test('every agent should have deterministic flag', () => {
    for (const agent of agents) {
      const fm = parseFrontmatter(agent.content);
      if (!fm) continue;
      assert.ok(fm.deterministic !== undefined, `${agent.name}: Missing deterministic flag`);
    }
  });

  test('no two agents should share the same agent_id', () => {
    const ids = new Map();
    for (const agent of agents) {
      const fm = parseFrontmatter(agent.content);
      if (!fm || !fm.agent_id) continue;
      if (ids.has(fm.agent_id)) {
        assert.fail(`Duplicate agent_id '${fm.agent_id}': ${ids.get(fm.agent_id)} and ${agent.name}`);
      }
      ids.set(fm.agent_id, agent.name);
    }
  });

  test('every agent should have a ## Identity section or **Background:**', () => {
    for (const agent of agents) {
      assert.ok(
        agent.content.includes('## Identity') || agent.content.includes('**Background:**'),
        `${agent.name}: Missing ## Identity section or **Background:** block`
      );
    }
  });

  test('every agent should have a ## Review Instinct or ## Behavioral Rules section', () => {
    for (const agent of agents) {
      assert.ok(
        agent.content.includes('## Review Instinct') || agent.content.includes('## Review ') || agent.content.includes('## Behavioral Rules') || agent.content.includes('## Output Format'),
        `${agent.name}: Missing ## Review Instinct or ## Behavioral Rules section`
      );
    }
  });

  test('every agent should have a ## Principles or ## Hard Rules or ## Behavioral Rules section', () => {
    for (const agent of agents) {
      const hasPrinciples = agent.content.includes('## Principles');
      const hasHardRules = agent.content.includes('## Hard Rules');
      const hasPatterns = agent.content.includes('## Patterns') || agent.content.includes('## Communication Style');
      const hasBehavioral = agent.content.includes('## Behavioral Rules');
      assert.ok(
        hasPrinciples || hasHardRules || hasPatterns || hasBehavioral,
        `${agent.name}: Missing ## Principles or ## Hard Rules or ## Behavioral Rules section`
      );
    }
  });
});

describe('Agent Pack Validation', () => {
  const agents = getAgentFiles();
  const agentNames = new Set(agents.map(a => a.name));

  test('extended core agents should all exist', () => {
    const pack = ['krishna', 'otis', 'trinity'];
    for (const name of pack) {
      assert.ok(agentNames.has(name), `Extended core agent '${name}' not found`);
    }
  });

  test('math pack agents should all exist', () => {
    const pack = ['tao', 'knuth', 'ramanujan', 'hardy', 'pearl', 'gelman'];
    for (const name of pack) {
      assert.ok(agentNames.has(name), `Math pack agent '${name}' not found`);
    }
  });

  test('AI/ML pack agents should all exist', () => {
    const pack = ['andrej', 'yann', 'scott', 'woz', 'percy'];
    for (const name of pack) {
      assert.ok(agentNames.has(name), `AI/ML pack agent '${name}' not found`);
    }
  });

  test('systems pack agents should all exist', () => {
    const pack = ['jeff', 'sanjay', 'stonebraker', 'reynold', 'kyle'];
    for (const name of pack) {
      assert.ok(agentNames.has(name), `Systems pack agent '${name}' not found`);
    }
  });

  test('startup pack agents should all exist', () => {
    const pack = ['richard', 'monica', 'jared'];
    for (const name of pack) {
      assert.ok(agentNames.has(name), `Startup pack agent '${name}' not found`);
    }
  });

  test('financial pack agents should all exist', () => {
    const pack = ['charts', 'ledger', 'herald', 'sage', 'maven', 'quant'];
    for (const name of pack) {
      assert.ok(agentNames.has(name), `Financial pack agent '${name}' not found`);
    }
  });
});
