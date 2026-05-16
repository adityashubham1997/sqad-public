---
rubric: react
description: React-specific review checks
load_when: "stack.frameworks includes react"
---

# React Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| RX-1 | **Hook called conditionally** | Hook inside if/loop/nested function → fail | CRITICAL |
| RX-2 | **List key** | List rendering without stable `key` prop → fail | MAJOR |
| RX-3 | **useEffect deps** | useEffect with missing or extra dependencies → fail | MAJOR |
| RX-4 | **No inline objects in JSX** | Object/array literal as prop (re-render every cycle) → fail | MINOR |
| RX-5 | **Prop types** | Component props without TypeScript interface or PropTypes → fail | MINOR |
