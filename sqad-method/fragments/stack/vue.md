---
fragment: stack/vue
description: Vue.js framework patterns and best practices
load_when: "stack.frameworks includes vue"
token_estimate: 250
---

# Vue.js Stack Context

## Core Patterns (Vue 3)

| Pattern | Preferred | Avoid |
|---|---|---|
| API style | Composition API (`<script setup>`) | Options API in new code |
| State | `ref()`, `reactive()`, Pinia stores | Vuex for new projects |
| Computed | `computed()` for derived state | Watchers for derivable values |
| Props | `defineProps<T>()` with TypeScript | Runtime prop validation only |
| Events | `defineEmits<T>()` with typed events | `this.$emit()` (Options API) |
| Provide/Inject | `provide()`/`inject()` with typed keys | Deep prop drilling |
| Async | `<Suspense>` + async setup | Manual loading state management |

## Component Structure

```vue
<script setup lang="ts">
interface Props {
  user: User;
}
const props = defineProps<Props>();
const emit = defineEmits<{ select: [id: string] }>();
const fullName = computed(() => `${props.user.first} ${props.user.last}`);
</script>

<template>
  <div @click="emit('select', user.id)">
    <h3>{{ fullName }}</h3>
  </div>
</template>
```

## Pinia Store Pattern

```typescript
export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([]);
  const activeUser = computed(() => users.value.find(u => u.active));
  async function fetchUsers() { users.value = await api.getUsers(); }
  return { users, activeUser, fetchUsers };
});
```

## Performance Rules

- Use `v-once` for static content that never changes
- Use `v-memo` for expensive list items with selective re-render
- Lazy load routes: `component: () => import('./views/Dashboard.vue')`
- Use `shallowRef()` for large objects where deep reactivity isn't needed
- Avoid `v-if` + `v-for` on same element — use computed to filter first

## Testing Patterns

- **Vitest** (recommended) or **Jest** with `@vue/test-utils`
- Mount with `mount()` / `shallowMount()` from `@vue/test-utils`
- Test component behavior through DOM queries and events
- Use `pinia` testing utilities for store tests
- E2E: Playwright or Cypress

## Anti-Patterns to Flag

- Mutating props directly
- Using `v-html` with unsanitized user input (XSS)
- Reactive state outside of `<script setup>` or composables
- Missing `key` on `v-for` dynamic lists
- Watchers that can be replaced with `computed()`
