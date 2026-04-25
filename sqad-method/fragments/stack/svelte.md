---
fragment: stack/svelte
description: Svelte/SvelteKit framework patterns and best practices
load_when: "stack.frameworks includes svelte"
token_estimate: 240
---

# Svelte / SvelteKit Stack Context

## Core Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| Reactivity | Runes (`$state`, `$derived`) in Svelte 5 | `$:` reactive statements (legacy) |
| State | `$state()` for component state | Writable stores for local state |
| Derived | `$derived()` for computed values | Manual state synchronization |
| Effects | `$effect()` with cleanup | Uncontrolled side effects |
| Props | `$props()` with TypeScript | `export let` (Svelte 4 style) |
| Stores | Svelte stores for shared state | Props drilling across many levels |
| Routing | SvelteKit file-based routing | Custom routing solutions |

## SvelteKit Patterns

```svelte
<!-- +page.svelte -->
<script lang="ts">
  let { data } = $props();
</script>

<!-- +page.server.ts (server-side data loading) -->
export async function load({ params }) {
  const user = await db.user.findUnique({ where: { id: params.id } });
  return { user };
}

<!-- +page.server.ts (form actions) -->
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    // process form
  }
};
```

## Performance Rules

- Svelte compiles to vanilla JS — no virtual DOM overhead
- Use `{#key}` blocks for forced re-creation of components
- Use `{#await}` blocks for async data in templates
- Lazy load components with `import()` in SvelteKit routes
- Use `prerender` for static pages, `ssr` for dynamic

## Testing Patterns

- **Vitest** + `@testing-library/svelte`
- SvelteKit: test `load` functions as pure functions
- E2E: Playwright (SvelteKit default) or Cypress

## Anti-Patterns to Flag

- Mutating `$state` objects deeply without reassignment (Svelte 5 tracks top-level)
- Using `document.querySelector` instead of `bind:this`
- Missing form validation in SvelteKit actions
- Not handling loading/error states in `{#await}` blocks
