---
fragment: token-compression
description: >
  Compression protocol for agents. When to compress tool outputs, what to never
  compress, and how to read compressed content. Requires token_budget.compression: native
  in config.yaml to be active.
included_by: _base-agent (when compression enabled)
---

# Token Compression Protocol

## When Compression Is Active

Check `squad-method/config.yaml → token_budget.compression`.
- `none` (default): No compression. This fragment is informational only.
- `native`: SQUAD native compression is active. Follow the rules below.

## When to Compress

Apply compression to tool outputs when:
1. **File reads** > 500 lines — compress before adding to context
2. **Grep results** > 20 matches — compress to grouped format
3. **Directory listings** > 20 files — compress to extension summary
4. **Log/command output** > 100 lines — compress to key events
5. **JSON responses** > 5KB — compress to essential fields

Use the compress pipeline:
```javascript
import { compress } from 'squad-method/tools/compress/index.js';
const { compressed, stats } = compress(toolOutput);
```

## What to NEVER Compress

Items in `token_budget.never_compress[]`:

| Content | Why |
|---|---|
| Test output | Must be exact to diagnose failures |
| Error messages | Must be exact for debugging |
| KG graph data | Must be exact for structural analysis |
| User input | Never modify user's words |
| Security findings | Must be verbatim — truncation hides vulnerabilities |
| Stack traces | Must be complete — truncating hides origin |

## How to Read Compressed Output

Compressed content uses markers:

| Marker | Meaning |
|---|---|
| `[×N identical lines]` | N duplicate lines were collapsed |
| `[+N more]` | N additional items were omitted |
| `[N files: ...]` | File listing summarized by extension |
| `nm/` | `node_modules/` abbreviated |
| `/* imports: a, b, c */` | Multiple import lines collapsed |
| `{...}` | Nested object collapsed beyond depth 3 |
| `...[N chars truncated]` | Long string truncated |

## Compression Targets (from config)

| Target | Handler | Expected Ratio |
|---|---|---|
| `file_reads` | code/markdown | 40-60% |
| `grep_results` | grep | 50-70% |
| `context_files` | markdown | 30-50% |
| `file_listings` | listing | 60-80% |
| `log_output` | log | 50-70% |
| `json_responses` | json | 60-80% |

## Domain Schema Learner

After running `/refresh`, the learner builds `squad-method/output/compress-schemas.json`
with workspace-specific abbreviations. These are automatically used by handlers.

Enable:
```yaml
# in squad-method/config.yaml
token_budget:
  compression: native
  learned_schemas_path: squad-method/output/compress-schemas.json
```
