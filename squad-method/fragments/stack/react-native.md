---
fragment: stack/react-native
description: React Native mobile framework patterns and best practices
load_when: "stack.frameworks includes react-native"
token_estimate: 300
---

# React Native Stack Context

## Core Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| Navigation | React Navigation (stack, tab, drawer) | Custom navigation from scratch |
| State management | Zustand, Jotai, React Query | Heavy Redux for simple apps |
| Styling | StyleSheet.create(), NativeWind | Inline style objects (perf) |
| Lists | `FlatList`/`SectionList` with `keyExtractor` | `ScrollView` for long lists |
| Images | `Image` with `resizeMode`, FastImage | Unoptimized large images |
| Storage | MMKV, AsyncStorage (small data) | Sync storage for large datasets |
| Animations | Reanimated 3 + Gesture Handler | Animated API for complex gestures |

## Platform-Specific Code

```tsx
// Platform module for branching
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    ...Platform.select({ ios: { shadowOpacity: 0.2 }, android: { elevation: 4 } }),
  },
});

// Platform-specific files: Component.ios.tsx / Component.android.tsx
```

## Performance Rules

- Use `FlatList` with `getItemLayout` for fixed-height items
- Enable Hermes engine for faster JS execution
- Avoid bridge-heavy operations in scroll handlers — use `useNativeDriver: true`
- Memoize list items with `React.memo` and stable `keyExtractor`
- Use `InteractionManager.runAfterInteractions()` for deferred heavy work
- Enable RAM bundles / inline requires for startup optimization
- Profile with Flipper, React DevTools, and Systrace

## Architecture Patterns

- **Feature-based folder structure** — `features/auth/`, `features/profile/`
- **Shared hooks** for cross-feature logic
- **API layer** with React Query for cache + offline
- **Navigation** typed with TypeScript (`RootStackParamList`)
- **Environment config** via `react-native-config`

## Testing Patterns

- **React Native Testing Library** — same philosophy as web RTL
- **Detox** for E2E testing on device/simulator
- **Jest** with `@testing-library/react-native` for component tests
- Mock native modules with `jest.mock('react-native-*')`

## Security Considerations

- Never store sensitive tokens in AsyncStorage unencrypted
- Use `react-native-keychain` or Secure Enclave for secrets
- Certificate pinning for API requests
- Code obfuscation for release builds (ProGuard/R8 for Android)
- Disable JavaScript debugging in production builds

## Anti-Patterns to Flag

- `ScrollView` wrapping a long dynamic list (use `FlatList`)
- Inline styles instead of `StyleSheet.create()`
- Bridge-heavy operations during animations
- Hardcoded dimensions instead of responsive layout
- Missing safe area handling (notch, home indicator)
- Storing sensitive data in AsyncStorage without encryption
