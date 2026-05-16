# Security Policy

## Supported Versions

| Version | Supported          |
|---------|-------------------|
| 1.x     | ✅ Active support  |

## Reporting a Vulnerability

If you discover a security vulnerability in SQUAD-Public, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. Email: **aditya.shubham1997@gmail.com** with subject `[SQUAD-Public Security]`
3. Include: description, reproduction steps, impact assessment
4. You will receive a response within 48 hours

## Security Design

SQUAD-Public is designed with security as a first-class concern:

### Zero Dependencies
- **0 npm dependencies** — eliminates supply chain attack vectors entirely
- Only uses Node.js built-in modules: `node:fs`, `node:path`, `node:os`, `node:child_process`

### No Network Access
- Detection engines are purely filesystem-based
- No telemetry, analytics, or phone-home behavior
- No external API calls during init, update, or uninstall

### No Credentials Required
- No API keys, tokens, or secrets needed to operate
- LLM communication is handled by your AI IDE, not by SQUAD

### Read-Only Detection
- `squad-public init` only reads marker files (package.json, Gemfile, etc.)
- Source code is never read during initialization
- Only writes to `squad-method/` and IDE config directories

### npm Provenance
- All published versions include npm provenance attestation
- Packages are built and published via GitHub Actions (not local machines)
- Verify: `npm audit signatures`

### Agent Safety Guards
- File scope protection — agents cannot modify files outside current task
- Secret scanning — agents scan for API keys before any commit
- Destructive action guards — delete/drop/force-push require explicit confirmation
- No auto-push — agents never push to remote without user approval
