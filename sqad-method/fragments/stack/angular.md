---
fragment: stack/angular
description: Angular framework patterns and best practices
load_when: "stack.frameworks includes angular"
token_estimate: 300
---

# Angular Stack Context

## Core Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| Components | Standalone components (Angular 14+) | NgModule-heavy architecture in new code |
| State | Signals (Angular 16+), NgRx for complex | Mutable shared state via services |
| HTTP | `HttpClient` + interceptors + typed responses | Raw `fetch()`, untyped responses |
| Forms | Reactive forms (`FormBuilder`) | Template-driven for complex forms |
| Routing | Lazy-loaded feature routes | Eager loading all modules |
| DI | `inject()` function (Angular 14+) | Constructor injection in new code |
| Change detection | `OnPush` + signals | Default change detection everywhere |

## Component Structure

```typescript
// Preferred: standalone component, OnPush, typed inputs
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div (click)="onSelect.emit(user().id)">
      <h3>{{ user().name }}</h3>
    </div>
  `,
})
export class UserCardComponent {
  user = input.required<User>();
  onSelect = output<string>();
}
```

## Angular Signals (16+)

```typescript
// Signals for fine-grained reactivity
count = signal(0);
doubled = computed(() => this.count() * 2);

// Effects for side effects
effect(() => console.log('Count:', this.count()));
```

## Performance Rules

- Use `OnPush` change detection for all components
- Lazy load feature modules/routes with `loadComponent` / `loadChildren`
- Use `trackBy` in `@for` loops (or `*ngFor`)
- Avoid complex expressions in templates — use `computed()` signals
- Use `@defer` blocks (Angular 17+) for below-fold content
- Profile with Angular DevTools

## Testing Patterns

- **Jasmine + Karma** (default) or **Jest** (community)
- `TestBed.configureTestingModule()` for component tests
- Use `ComponentFixture` with `detectChanges()`
- Prefer testing inputs/outputs over internal state
- Use `HttpClientTestingModule` for HTTP tests
- E2E: Playwright or Cypress (Protractor is deprecated)

## Security Considerations

- Angular auto-sanitizes HTML bindings — never bypass with `bypassSecurityTrustHtml()` unless validated
- Use `HttpInterceptor` for auth tokens — never hardcode
- Enable CSP headers compatible with Angular (inline styles may need `nonce`)
- Use `@angular/forms` validators for input validation
- Set `HttpOnly`, `Secure`, `SameSite` on auth cookies

## Anti-Patterns to Flag

- Subscribing in components without `takeUntilDestroyed()` or `async` pipe
- Using `any` type with `HttpClient` responses
- Default change detection when `OnPush` is viable
- Direct DOM access with `ElementRef.nativeElement` instead of Renderer2
- Circular dependency between services
- Large barrel files (`index.ts`) that defeat tree-shaking
