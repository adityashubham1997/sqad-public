---
rubric: ios
description: iOS/macOS-specific review checks (Swift/SwiftUI)
load_when: "stack.frameworks includes ios"
---

# iOS Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| IOS-1 | **Force unwrap** | Force unwrap `!` without guard/if-let check → fail | CRITICAL |
| IOS-2 | **Retain cycle** | Strong `self` capture in closure without `[weak self]` (memory leak) → fail | CRITICAL |
| IOS-3 | **Main thread violation** | UI update from background thread without `@MainActor` or `DispatchQueue.main` → fail | CRITICAL |
| IOS-4 | **ATS disabled** | App Transport Security disabled globally in Info.plist → fail | MAJOR |
| IOS-5 | **Missing accessibility** | Interactive element without `accessibilityLabel` → fail | MAJOR |
| IOS-6 | **Massive view** | SwiftUI View body or ViewController exceeding 300 lines → fail | MAJOR |
| IOS-7 | **Hardcoded strings** | User-facing strings not using `LocalizedStringKey` or `NSLocalizedString` → fail | MINOR |
| IOS-8 | **Sendable violation** | Passing non-Sendable type across concurrency boundaries → fail | MAJOR |
