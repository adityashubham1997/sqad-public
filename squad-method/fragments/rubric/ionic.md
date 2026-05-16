---
rubric: ionic
description: Ionic cross-platform review checks
load_when: "stack.frameworks includes ionic"
---

# Ionic Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| ION-1 | **Cordova plugin** | Using Cordova plugin when Capacitor equivalent exists → fail | MAJOR |
| ION-2 | **Native project edit** | Manual edit to `android/` or `ios/` that should be a Capacitor plugin/config → fail | MAJOR |
| ION-3 | **Missing platform check** | Native API call without `Capacitor.isNativePlatform()` guard (web crash) → fail | CRITICAL |
| ION-4 | **Sensitive localStorage** | Tokens or secrets stored in `localStorage`/`sessionStorage` on native → fail | CRITICAL |
| ION-5 | **Missing ion-content** | Page without `ion-content` wrapper (scroll/layout issues) → fail | MAJOR |
| ION-6 | **Missing safe area** | Content not respecting safe area insets (notch/home indicator overlap) → fail | MAJOR |
| ION-7 | **Hardcoded URLs** | API URLs hardcoded instead of using environment configuration → fail | MINOR |
