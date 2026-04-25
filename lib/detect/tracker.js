/**
 * Issue Tracker Detection Engine
 *
 * Detects configured issue tracker from marker files,
 * environment variables, and config files.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Detect issue tracker in a workspace directory.
 * @param {string} workspacePath - Absolute path to workspace root
 * @returns {{ type: string, project_key: string, api_url: string, mcp_available: boolean }}
 */
export function detectTracker(workspacePath) {
  const result = {
    type: '',
    project_key: '',
    api_url: '',
    mcp_available: false,
  };

  // Jira
  if (
    existsSync(join(workspacePath, '.jira.yml')) ||
    existsSync(join(workspacePath, '.jira.yaml')) ||
    process.env.JIRA_URL ||
    process.env.JIRA_API_TOKEN
  ) {
    result.type = 'jira';
    result.api_url = process.env.JIRA_URL || '';
    return result;
  }

  // Linear
  if (
    existsSync(join(workspacePath, '.linear')) ||
    process.env.LINEAR_API_KEY
  ) {
    result.type = 'linear';
    return result;
  }

  // Shortcut
  if (process.env.SHORTCUT_API_TOKEN) {
    result.type = 'shortcut';
    return result;
  }

  // Notion (as issue tracker)
  if (process.env.NOTION_API_KEY || process.env.NOTION_TOKEN) {
    result.type = 'notion';
    return result;
  }

  // GitHub Issues (check for issue templates)
  if (
    existsSync(join(workspacePath, '.github', 'ISSUE_TEMPLATE')) ||
    existsSync(join(workspacePath, '.github', 'ISSUE_TEMPLATE.md'))
  ) {
    result.type = 'github-issues';
    return result;
  }

  // None detected — will ask user during /setup
  return result;
}
