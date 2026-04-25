---
fragment: stack/nextjs
description: Next.js framework patterns and best practices
load_when: "stack.frameworks includes nextjs"
token_estimate: 280
---

# Next.js Stack Context

## App Router (Next.js 13+)

| Pattern | Preferred | Avoid |
|---|---|---|
| Routing | App Router (`app/`) with file-based routing | Pages Router for new projects |
| Data fetching | Server Components + `fetch()` with caching | `getServerSideProps` in App Router |
| Server actions | `'use server'` functions for mutations | API routes for simple form submissions |
| Client state | `'use client'` only when needed (interactivity) | Making every component a Client Component |
| Layouts | `layout.tsx` for shared UI per route segment | Re-rendering shared layout on navigation |
| Loading | `loading.tsx` + Suspense boundaries | Custom loading spinners without Suspense |
| Error handling | `error.tsx` boundaries per route segment | Global try/catch only |

## Server vs Client Components

```tsx
// Server Component (default) — runs on server, no bundle cost
export default async function UsersPage() {
  const users = await db.user.findMany(); // Direct DB access
  return <UserList users={users} />;
}

// Client Component — only when interactivity needed
'use client';
export function SearchInput({ onSearch }: Props) {
  const [query, setQuery] = useState('');
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

## Caching & Revalidation

- `fetch()` caches by default in Server Components
- Use `revalidate` option: `fetch(url, { next: { revalidate: 3600 } })`
- Use `revalidatePath()` / `revalidateTag()` for on-demand revalidation
- Avoid over-caching: set appropriate `revalidate` intervals

## Performance Rules

- Use `next/image` for automatic optimization (WebP, lazy loading, sizing)
- Use `next/font` for zero-layout-shift font loading
- Use `dynamic()` imports for heavy client components
- Enable Partial Prerendering (PPR) for hybrid static/dynamic
- Minimize `'use client'` boundary — push it as low as possible

## Security Considerations

- Validate Server Action inputs — they're public HTTP endpoints
- Never expose secrets in Client Components (`NEXT_PUBLIC_` prefix = client-visible)
- Use middleware for auth checks before rendering
- Set security headers via `next.config.js` `headers()` or middleware

## Anti-Patterns to Flag

- `'use client'` at page level (defeats Server Components)
- Fetching in Client Components when Server Component can prefetch
- Not using `Suspense` boundaries for streaming
- Missing `alt` text on `next/image`
- Hardcoded URLs instead of environment variables
