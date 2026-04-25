---
fragment: stack/spring
description: Spring Boot / Spring Framework patterns and best practices
load_when: "stack.frameworks includes spring"
token_estimate: 280
---

# Spring Boot / Spring Framework Stack Context

## Core Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| DI | Constructor injection (`@RequiredArgsConstructor`) | Field injection (`@Autowired` on fields) |
| Config | `@ConfigurationProperties` with typed beans | Scattered `@Value` annotations |
| Validation | Bean Validation (`@Valid`) + custom validators | Manual validation in service layer |
| Data access | Spring Data JPA repositories | Manual JDBC for standard CRUD |
| Error handling | `@ControllerAdvice` + `@ExceptionHandler` | Try/catch in every controller |
| Security | Spring Security with SecurityFilterChain | Custom auth filters from scratch |
| Profiles | `application-{profile}.yml` for env config | Hardcoded environment checks |

## Controller Structure

```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
        return userService.findById(id)
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto createUser(@Valid @RequestBody CreateUserRequest request) {
        return userService.create(request);
    }
}
```

## Spring Security (6.x)

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/public/**").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated())
        .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
        .build();
}
```

## Testing Patterns

- **JUnit 5** + **Mockito** for unit tests
- `@SpringBootTest` for integration tests (sparingly — slow)
- `@WebMvcTest` for controller layer only
- `@DataJpaTest` for repository layer with embedded DB
- Use `Testcontainers` for real database integration tests
- Use `MockMvc` for controller tests without full context

## Performance Patterns

- Use `@Cacheable` with cache abstraction (Redis, Caffeine)
- Enable connection pooling (HikariCP — default)
- Use `@Async` for fire-and-forget operations
- Virtual threads (Spring Boot 3.2+ / Java 21+) for blocking I/O

## Anti-Patterns to Flag

- Field injection — makes testing harder, hides dependencies
- `@Transactional` on private methods (proxy-based AOP won't intercept)
- N+1 queries — use `@EntityGraph` or JPQL `JOIN FETCH`
- Returning JPA entities directly from controllers (use DTOs)
- Missing `@Transactional(readOnly = true)` on read operations
- Catching generic `Exception` in service layer
