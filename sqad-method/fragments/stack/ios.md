---
fragment: stack/ios
description: iOS/macOS native development patterns and best practices (Swift/SwiftUI)
load_when: "stack.frameworks includes ios"
token_estimate: 300
---

# iOS / macOS Stack Context

## Core Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| UI | SwiftUI (declarative) | UIKit Storyboards for new projects |
| Architecture | MVVM + Coordinator, TCA (The Composable Architecture) | Massive View Controllers |
| Navigation | NavigationStack / NavigationSplitView (SwiftUI) | Manual segue chains |
| Networking | URLSession + async/await, Alamofire if complex | Completion handler nesting |
| State | @Observable (iOS 17+), @StateObject/@ObservedObject | Singleton state managers |
| Persistence | SwiftData (iOS 17+) or Core Data | UserDefaults for complex data |
| Concurrency | Swift Concurrency (async/await, actors) | GCD for new code |
| DI | Swift Package plugin or manual constructor injection | Service Locator singletons |

## Project Structure

```
MyApp/
├── App/
│   └── MyAppApp.swift          # @main entry point
├── Features/
│   ├── Auth/
│   │   ├── AuthView.swift
│   │   ├── AuthViewModel.swift
│   │   └── AuthService.swift
│   └── Home/
│       ├── HomeView.swift
│       └── HomeViewModel.swift
├── Core/
│   ├── Models/                 # Domain models
│   ├── Services/               # API clients, persistence
│   └── Extensions/
├── Resources/
│   └── Assets.xcassets
└── Tests/
    ├── UnitTests/
    └── UITests/
```

## SwiftUI Patterns

```swift
struct UserCard: View {
    let user: User
    var onSelect: (String) -> Void

    var body: some View {
        VStack(alignment: .leading) {
            Text(user.name)
                .font(.headline)
            Text(user.email)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .padding()
        .onTapGesture { onSelect(user.id) }
    }
}

// Observable ViewModel (iOS 17+)
@Observable
final class UserViewModel {
    var users: [User] = []
    var isLoading = false
    var error: Error?

    private let service: UserService

    init(service: UserService) { self.service = service }

    func loadUsers() async {
        isLoading = true
        defer { isLoading = false }
        do {
            users = try await service.fetchUsers()
        } catch {
            self.error = error
        }
    }
}
```

## Performance Rules

- Use `LazyVStack`/`LazyHStack` for large scrollable content
- Minimize view body complexity — extract subviews
- Use `.task` modifier for async work (auto-cancels)
- Profile with Instruments (Time Profiler, Allocations, Leaks)
- Use `@MainActor` only where needed — don't block the main thread
- Enable Link-Time Optimization (LTO) for release builds

## Security Considerations

- Use Keychain for tokens and secrets (KeychainAccess library)
- Enable App Transport Security (ATS) — never disable globally
- Use certificate pinning for sensitive API endpoints
- Enable Data Protection (`NSFileProtectionComplete`)
- Use biometric auth via `LocalAuthentication` framework
- Never log sensitive data (tokens, PII)

## Testing Patterns

- **XCTest** for unit and integration tests
- **Swift Testing** framework (Xcode 16+) with `@Test` macro
- Use `XCUITest` for UI automation
- Mock with protocols + dependency injection
- Use `ViewInspector` for SwiftUI view testing
- Snapshot testing with `swift-snapshot-testing`

## Anti-Patterns to Flag

- Force unwrapping (`!`) without safety check
- Retain cycles from strong `self` capture in closures — use `[weak self]`
- Massive ViewControllers/Views (>300 lines)
- Using `DispatchQueue.main.async` instead of `@MainActor`
- Ignoring `Sendable` conformance warnings
- Hardcoded strings instead of `LocalizedStringKey`
- Missing accessibility labels on interactive elements
