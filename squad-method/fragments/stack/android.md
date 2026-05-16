---
fragment: stack/android
description: Android native development patterns and best practices
load_when: "stack.frameworks includes android"
token_estimate: 300
---

# Android Stack Context

## Core Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| Architecture | MVVM + Clean Architecture | God Activities/Fragments |
| UI | Jetpack Compose (declarative) | XML layouts for new projects |
| Navigation | Navigation Component / Compose Navigation | Manual Fragment transactions |
| DI | Hilt (standard) or Koin | Manual DI / Service Locator |
| Networking | Retrofit + OkHttp + kotlinx.serialization | Volley, manual HttpURLConnection |
| State | StateFlow / SharedFlow / Compose State | LiveData in new Compose-first projects |
| Storage | Room (SQLite), DataStore (preferences) | SharedPreferences for complex data |
| Async | Kotlin Coroutines + Flow | AsyncTask, RxJava for new projects |
| Images | Coil (Compose-first) or Glide | Picasso, manual bitmap loading |

## Project Structure (Clean Architecture)

```
app/
├── data/
│   ├── local/          # Room DAOs, DataStore
│   ├── remote/         # Retrofit services, DTOs
│   └── repository/     # Repository implementations
├── domain/
│   ├── model/          # Domain entities
│   ├── repository/     # Repository interfaces
│   └── usecase/        # Use case classes
├── presentation/
│   ├── ui/             # Compose screens / Activities
│   ├── viewmodel/      # ViewModels
│   └── navigation/     # Nav graph
└── di/                 # Hilt modules
```

## Jetpack Compose Patterns

```kotlin
@Composable
fun UserCard(
    user: User,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Card(modifier = modifier.clickable { onSelect(user.id) }) {
        Text(text = user.name, style = MaterialTheme.typography.titleMedium)
    }
}

// ViewModel with StateFlow
@HiltViewModel
class UserViewModel @Inject constructor(
    private val getUsersUseCase: GetUsersUseCase,
) : ViewModel() {
    private val _uiState = MutableStateFlow<UserUiState>(UserUiState.Loading)
    val uiState: StateFlow<UserUiState> = _uiState.asStateFlow()

    init { loadUsers() }

    private fun loadUsers() {
        viewModelScope.launch {
            getUsersUseCase().collect { result ->
                _uiState.value = when (result) {
                    is Result.Success -> UserUiState.Success(result.data)
                    is Result.Error -> UserUiState.Error(result.message)
                }
            }
        }
    }
}
```

## Performance Rules

- Use `LazyColumn`/`LazyRow` instead of `Column`/`Row` with `items` for lists
- Minimize recomposition: use `remember`, `derivedStateOf`, stable keys
- Use `Baseline Profiles` for startup optimization
- Enable R8/ProGuard for release builds (code shrinking + obfuscation)
- Use `WorkManager` for background tasks (not raw coroutines/threads)
- Profile with Android Studio Profiler, Systrace, Macrobenchmark

## Security Considerations

- Use `EncryptedSharedPreferences` / `EncryptedFile` for sensitive data
- Certificate pinning with OkHttp `CertificatePinner`
- Use Android Keystore for cryptographic keys
- Enable `android:networkSecurityConfig` for cleartext restrictions
- Obfuscate with R8 and consider DexGuard for sensitive apps
- Never hardcode API keys — use `BuildConfig` fields or Secrets Gradle Plugin

## Testing Patterns

- **JUnit 5** + **MockK** for unit tests
- **Turbine** for Flow testing
- **Compose Test** rules for UI tests
- **Espresso** for view-based UI tests
- **Robolectric** for faster unit tests without emulator
- **Hilt Testing** with `@HiltAndroidTest`
- **Screenshot testing** with Paparazzi or Roborazzi

## Anti-Patterns to Flag

- Business logic in Activities/Fragments
- `GlobalScope.launch` instead of `viewModelScope`
- Blocking the main thread with synchronous I/O
- Hardcoded pixel dimensions instead of `dp`/`sp`
- Missing `android:exported` attribute on components (required API 31+)
- Not handling process death (save/restore state)
- Missing ProGuard/R8 rules for production builds
