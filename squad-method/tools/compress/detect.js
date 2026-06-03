/**
 * Content-type detector for SQUAD compression pipeline.
 * Classifies input text as: code, json, markdown, log, error, grep, file-listing, config, unknown.
 */

const CONTENT_TYPES = ['code', 'json', 'markdown', 'log', 'error', 'grep', 'file-listing', 'config', 'unknown'];

/**
 * Detect the content type of input text.
 * @param {string} text
 * @returns {'code'|'json'|'markdown'|'log'|'error'|'grep'|'file-listing'|'config'|'unknown'}
 */
export function detect(text) {
  if (!text || typeof text !== 'string') return 'unknown';
  const trimmed = text.trim();
  if (!trimmed) return 'unknown';

  const lines = trimmed.split('\n');
  const firstLine = lines[0].trim();
  const sample = lines.slice(0, Math.min(20, lines.length)).join('\n');

  // JSON: starts with { or [ and is parseable
  if ((firstLine.startsWith('{') || firstLine.startsWith('[')) && isJson(trimmed)) {
    return 'json';
  }

  // Error: starts with Error: or contains stack trace patterns
  if (/^Error:/m.test(sample) || /^\s+at\s+\w/m.test(sample) || /Traceback \(most recent call last\)/.test(sample)) {
    return 'error';
  }

  // Grep output: lines matching pattern "filename:linenum:content" or "filename:content"
  const grepLines = lines.filter(l => /^[^\s:]+:\d+:/.test(l) || /^[^\s:]+:[^\n]+/.test(l));
  if (grepLines.length > lines.length * 0.6 && lines.length > 3) {
    return 'grep';
  }

  // File listing: lots of lines that look like file paths or directory entries
  const listingLines = lines.filter(l => /^\s*[-dlrwx]{1,10}\s+|^\s*\d+\s+|^\s*[./~]/.test(l) || /\.(js|ts|py|go|rs|java|rb|md|json|yaml|yml|sh|css|html)$/.test(l));
  if (listingLines.length > lines.length * 0.5 && lines.length > 5) {
    return 'file-listing';
  }

  // Log: timestamp patterns or log level prefixes
  if (/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/.test(sample) ||
      /\[(INFO|WARN|ERROR|DEBUG|TRACE|FATAL)\]/i.test(sample) ||
      /^(INFO|WARN|ERROR|DEBUG)\s/m.test(sample)) {
    return 'log';
  }

  // Markdown: starts with # heading or has markdown patterns
  if (/^#{1,6}\s/.test(firstLine) || /^\*\*|^__|^-\s|^\d\.\s/.test(sample)) {
    return 'markdown';
  }

  // Config: YAML/TOML/ENV patterns
  if (/^[\w-]+:\s/m.test(sample) || /^[\w_]+=/.test(firstLine) || /^\[[\w.]+\]/.test(firstLine)) {
    return 'config';
  }

  // Code: import/require, function defs, class defs, common code patterns
  if (/^(import|export|const|let|var|function|class|def|pub fn|fn |#include)\s/m.test(sample) ||
      /^\s*(return|if|for|while|switch)\s/m.test(sample)) {
    return 'code';
  }

  return 'unknown';
}

function isJson(text) {
  try {
    JSON.parse(text);
    return true;
  } catch (e) {
    return false;
  }
}

export { CONTENT_TYPES };
