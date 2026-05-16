<!-- SQUAD:auto-generated per-repo context on 2026-05-16 -->
# sqad-public

**Type:** Node.js | **Tests:** test/ present
**Workspace:** openSource
**SQUAD Config:** ../squad-method/config.yaml

## Knowledge Graph

Nodes: 111 | Edges: 87 | Source: 97 | Tests: 14 | God nodes: 0

### Highest Coupling

| File | Degree | Test Coverage |
|---|---|---|
| lib/generate/context-files.js | 11 | ⚠️ UNTESTED |
| lib/detect/stack.js | 8 | ⚠️ UNTESTED |
| squad-method/tools/knowledge-graph/build.js | 8 | ⚠️ UNTESTED |
| bin/squad-public.js | 5 | ⚠️ UNTESTED |
| lib/generate/config.js | 5 | ⚠️ UNTESTED |
| lib/generate/ide-skills.js | 5 | ⚠️ UNTESTED |
| lib/init.js | 5 | ⚠️ UNTESTED |
| lib/transform/base.js | 5 | ⚠️ UNTESTED |

### Untested Files (97/97)

- lib/generate/context-files.js (degree 11)
- lib/detect/stack.js (degree 8)
- squad-method/tools/knowledge-graph/build.js (degree 8)
- bin/squad-public.js (degree 5)
- lib/generate/config.js (degree 5)
- lib/generate/ide-skills.js (degree 5)
- lib/init.js (degree 5)
- lib/transform/base.js (degree 5)
- lib/init.js::init (degree 4)
- lib/detect/cloud.js::detectCloud (degree 3)
- ... and 87 more

> Full KG report: `sqad-public/knowledge-graph-out/KG_REPORT.md`
> Interactive graph: `sqad-public/knowledge-graph-out/graph.html`

## Agent Instructions

When working in this repo:
1. **Read `knowledge-graph-out/graph.json` BEFORE grepping** — it has pre-computed dependency data
2. Query reverse dependencies for any file you plan to change
3. Check god nodes — changes to high-degree files need user approval
4. Check untested files — add tests before modifying untested code
5. Reference `../CONTEXT.md` for workspace-wide context
