---
rubric: android
description: Android-specific review checks
load_when: "stack.frameworks includes android"
---

# Android Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| AND-1 | **Main thread I/O** | Synchronous network/disk I/O on main thread (ANR risk) → fail | CRITICAL |
| AND-2 | **GlobalScope usage** | `GlobalScope.launch` instead of `viewModelScope`/`lifecycleScope` (leak risk) → fail | CRITICAL |
| AND-3 | **Hardcoded secrets** | API keys or secrets in source code or `BuildConfig` without Secrets plugin → fail | CRITICAL |
| AND-4 | **Missing exported** | Component (Activity, Service, Receiver) without explicit `android:exported` (API 31+ crash) → fail | MAJOR |
| AND-5 | **Force unwrap** | Kotlin `!!` operator without preceding null check → fail | MAJOR |
| AND-6 | **Missing ProGuard** | Release build without R8/ProGuard shrinking enabled → fail | MAJOR |
| AND-7 | **Hardcoded dp/sp** | Pixel values instead of `dp`/`sp` units or Compose `Dp`/`Sp` → fail | MINOR |
| AND-8 | **Process death** | ViewModel state not surviving process death (missing `SavedStateHandle`) → fail | MAJOR |
