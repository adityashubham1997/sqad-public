---
fragment: stack/react
description: React framework patterns and best practices
load_when: "stack.frameworks includes react"
token_estimate: 300
---

# React Stack Context

## Core Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| State management | `useState`, `useReducer`, Zustand/Jotai | Class components, Redux for simple state |
| Side effects | `useEffect` with cleanup | Uncontrolled side effects, missing deps |
| Data fetching | React Query / SWR / `use()` | `useEffect` + `useState` for fetch |
| Component design | Composition over inheritance | Deep prop drilling, God components |
| Memoization | `useMemo`/`useCallback` when measured | Premature memoization everywhere |
| Refs | `useRef` for DOM access, previous values | Direct DOM manipulation |
| Context | Colocate near consumers, split read/write | Single global context for everything |

## Component Structure

```tsx
// Preferred: named export, props interface, early returns
interface UserCardProps {
  user: User;
  onSelect?: (id: string) => void;
}

export function UserCard({ user, onSelect }: UserCardProps) {
  if (!user) return null;

  return (
    <div onClick={() => onSelect?.(user.id)}>
      <h3>{user.name}</h3>
    </div>
  );
}
```

## Hook Rules

1. Only call hooks at the **top level** — never inside conditions, loops, or nested functions
2. Only call hooks from **React function components** or **custom hooks**
3. Custom hooks must start with `use` prefix
4. `useEffect` dependencies must be exhaustive — use ESLint rule `react-hooks/exhaustive-deps`

## Performance Patterns

- **Code splitting:** `React.lazy()` + `Suspense` for route-level splitting
- **Virtualization:** `react-window` or `@tanstack/virtual` for large lists
- **Stable keys:** Use unique IDs, never array index for dynamic lists
- **Avoid inline objects/arrays as props** — creates new reference every render

## Testing Patterns

- **React Testing Library** — test behavior, not implementation
- Query priority: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
- Avoid testing implementation details (state, lifecycle)
- Use `userEvent` over `fireEvent` for realistic interactions
- Mock API calls with MSW (Mock Service Worker)

## Anti-Patterns to Flag

- `useEffect` as an event handler (should be in the handler function)
- State that can be derived from other state (compute instead)
- Copying props into state (unnecessary sync)
- Direct DOM manipulation instead of React state
- `dangerouslySetInnerHTML` without sanitization
- Missing `key` prop on list items or using index as key for dynamic lists
