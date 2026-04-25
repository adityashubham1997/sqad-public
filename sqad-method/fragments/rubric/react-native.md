---
rubric: react-native
description: React Native-specific review checks
load_when: "stack.frameworks includes react-native"
---

# React Native Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| RN-1 | **ScrollView for long list** | `ScrollView` wrapping dynamic list that should use `FlatList`/`SectionList` → fail | CRITICAL |
| RN-2 | **Sensitive data storage** | Sensitive token stored in AsyncStorage without encryption (should use Keychain/Secure Enclave) → fail | CRITICAL |
| RN-3 | **Inline styles** | Style objects created inline instead of `StyleSheet.create()` (re-creates every render) → fail | MAJOR |
| RN-4 | **Missing safe area** | Layout doesn't account for notch/home indicator (missing `SafeAreaView` or `useSafeAreaInsets`) → fail | MAJOR |
| RN-5 | **Bridge-heavy animation** | Animated values without `useNativeDriver: true` on animatable properties → fail | MAJOR |
| RN-6 | **Hardcoded dimensions** | Fixed pixel values instead of responsive layout (Dimensions, flexbox, or percentage) → fail | MINOR |
| RN-7 | **Missing platform check** | Platform-specific code without `Platform.OS` check or platform file extension → fail | MINOR |
