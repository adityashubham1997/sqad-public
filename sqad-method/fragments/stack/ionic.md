---
fragment: stack/ionic
description: Ionic cross-platform framework patterns and best practices
load_when: "stack.frameworks includes ionic"
token_estimate: 260
---

# Ionic Stack Context

## Core Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| Framework | Ionic + Angular / React / Vue (pick one) | Mixing UI frameworks |
| Native access | Capacitor plugins | Cordova plugins for new projects |
| Navigation | Ionic Router (Angular) / IonReactRouter | Custom routing |
| State | Framework-native (NgRx, Zustand, Pinia) | Global mutable state |
| Storage | `@capacitor/preferences` (small), SQLite plugin (large) | localStorage for sensitive data |
| HTTP | Framework-native (HttpClient, fetch, axios) | XMLHttpRequest |
| UI | Ionic components + CSS custom properties | Raw HTML bypassing Ionic components |
| Build | Capacitor CLI (`npx cap sync`, `npx cap run`) | Manual native project edits |

## Project Structure

```
src/
├── app/
│   ├── pages/              # Feature pages (lazy-loaded)
│   │   ├── home/
│   │   ├── login/
│   │   └── settings/
│   ├── components/         # Shared components
│   ├── services/           # API, auth, storage services
│   ├── guards/             # Route guards
│   └── models/             # TypeScript interfaces
├── assets/
├── theme/
│   └── variables.css       # Ionic CSS custom properties
├── environments/
android/                    # Capacitor Android project
ios/                        # Capacitor iOS project
capacitor.config.ts
ionic.config.json
```

## Capacitor Plugin Pattern

```typescript
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Preferences } from '@capacitor/preferences';

// Camera access
const photo = await Camera.getPhoto({
  quality: 90,
  resultType: CameraResultType.Uri,
  allowEditing: false,
});

// Geolocation
const position = await Geolocation.getCurrentPosition();

// Preferences storage
await Preferences.set({ key: 'user', value: JSON.stringify(user) });
const { value } = await Preferences.get({ key: 'user' });
```

## Platform-Specific Code

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  // Native-only code (iOS/Android)
} else {
  // Web fallback
}

// Platform-specific
if (Capacitor.getPlatform() === 'ios') { /* iOS-specific */ }
if (Capacitor.getPlatform() === 'android') { /* Android-specific */ }
```

## Performance Rules

- Lazy load page modules/components
- Use `ion-virtual-scroll` or framework virtual scroll for long lists
- Minimize DOM manipulation — let Ionic handle animations
- Use `trackBy` (Angular) or stable keys (React/Vue) in lists
- Preload critical data during splash screen
- Use Capacitor `SplashScreen` API for controlled launch

## Security Considerations

- Use `@capacitor/preferences` with encryption for sensitive data
- Never store tokens in localStorage/sessionStorage on native
- Enable SSL pinning via Capacitor HTTP plugin
- Validate deep links and custom URL schemes
- Use biometric auth via `capacitor-native-biometric`
- Set `allowNavigation` carefully in `capacitor.config.ts`

## Testing Patterns

- Framework-native testing (Jasmine/Karma for Angular, Jest for React)
- E2E with Cypress or Playwright (web mode)
- **Appium** or **Detox** for native E2E testing
- Test Capacitor plugins with mock implementations
- Use `@testing-library` variants per framework

## Anti-Patterns to Flag

- Using Cordova plugins when Capacitor equivalents exist
- Manually editing `android/` or `ios/` native projects without Capacitor plugin
- Missing `ion-content` wrapper causing scroll issues
- Not handling platform differences (keyboard, safe area, back button)
- Hardcoded `http://` URLs (use environment configs)
- Missing offline handling for mobile-first apps
