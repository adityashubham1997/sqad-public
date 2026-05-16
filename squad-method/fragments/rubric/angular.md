---
rubric: angular
description: Angular-specific review checks
load_when: "stack.frameworks includes angular"
---

# Angular Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| NG-1 | **Subscribe leak** | Observable subscribed without `takeUntilDestroyed()`, `async` pipe, or manual unsubscribe in `ngOnDestroy` → fail | CRITICAL |
| NG-2 | **Change detection** | Component using Default when OnPush is viable (no mutable shared state) → fail | MAJOR |
| NG-3 | **Untyped HTTP** | `HttpClient.get()` without type parameter — returns `any` → fail | MAJOR |
| NG-4 | **Missing trackBy** | `@for` or `*ngFor` on dynamic list without `track` / `trackBy` function → fail | MAJOR |
| NG-5 | **Template complexity** | Complex expressions or method calls in template (should be `computed()` or pipe) → fail | MINOR |
| NG-6 | **Barrel re-export** | Large barrel `index.ts` re-exporting everything — defeats tree-shaking → fail | MINOR |
| NG-7 | **Direct DOM access** | `ElementRef.nativeElement` manipulation instead of Renderer2 or template binding → fail | MINOR |
