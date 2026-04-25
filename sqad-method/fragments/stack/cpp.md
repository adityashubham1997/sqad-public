---
fragment: stack/cpp
description: C/C++ systems programming patterns and best practices
load_when: "stack.languages includes cpp OR stack.languages includes c"
token_estimate: 800
---

# C/C++ Stack Context

## Core Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| **Memory management** | RAII, `std::unique_ptr`, `std::shared_ptr` | Raw `new`/`delete`, `malloc`/`free` without wrapper |
| **String handling** | `std::string`, `std::string_view` | C-style `char*` with manual length tracking |
| **Containers** | `std::vector`, `std::array`, `std::unordered_map` | Raw arrays, hand-rolled linked lists |
| **Error handling** | `std::expected` (C++23), `std::optional`, exceptions | Error codes without checking, `errno` silently ignored |
| **Concurrency** | `std::thread`, `std::mutex`, `std::atomic`, `std::jthread` | Raw pthreads (unless interfacing with C), `volatile` for sync |
| **I/O** | `std::filesystem`, POSIX I/O with RAII wrappers | `system()`, `popen()` with string concat |
| **Build** | CMake (modern targets), Meson | Recursive Makefiles, hand-written build scripts |
| **Formatting** | `std::format` (C++20), `fmt::format` | `sprintf` into fixed buffers |

## Project Structure

```
project/
├── CMakeLists.txt          # Top-level build
├── src/                    # Implementation files (.cpp)
├── include/project/        # Public headers (.h/.hpp)
├── tests/                  # Test files
├── benchmarks/             # Performance benchmarks
├── third_party/            # Vendored dependencies
├── cmake/                  # CMake modules
└── docs/                   # Documentation
```

## Modern C++ Guidelines

- **Use `const` aggressively** — `const` references, `const` methods, `constexpr`
- **Prefer `auto`** for complex types, but spell out types at API boundaries
- **Move semantics** — implement move constructors for resource-owning types
- **Rule of Zero/Five** — if you manage resources, implement all five; otherwise, zero
- **`constexpr` everything** — compile-time computation where possible
- **Avoid `#define`** — use `constexpr`, `enum class`, `inline` instead
- **Namespaces** — no `using namespace std;` in headers, ever
- **Include guards** — `#pragma once` or traditional guards
- **Forward declarations** — minimize header dependencies

## Dangerous Patterns

- **Buffer overflow** — always bounds-check array access, prefer `std::span`
- **Use-after-free** — RAII prevents this; raw pointers don't
- **Double-free** — `std::unique_ptr` makes this impossible
- **Signed integer overflow** — undefined behavior in C/C++; use unsigned or check
- **Dangling references** — returning reference to local, lambda capturing by reference
- **Uninitialized variables** — always initialize; use `= {}` for zero-init
- **Data races** — shared mutable state without synchronization
- **Exception in destructor** — mark destructors `noexcept`

## Testing Patterns

| Framework | Use Case |
|---|---|
| **Google Test** | Unit testing, mocking (gtest + gmock) |
| **Catch2** | Header-only, BDD-style, simpler setup |
| **doctest** | Ultra-lightweight, header-only |
| **CTest** | CMake-integrated test runner |
| **ASan/TSan/UBSan** | Sanitizers for memory/thread/UB bugs |
| **Valgrind** | Memory leak detection, cache profiling |

## Performance Rules

- Profile with `perf`, `VTune`, or `Instruments` before optimizing
- Cache locality matters — `std::vector` beats `std::list` almost always
- Avoid virtual dispatch in hot loops — use CRTP or `std::variant`
- Minimize allocations — arena allocators, `std::pmr`, pre-reserved containers
- Use `[[likely]]`/`[[unlikely]]` for branch prediction hints (C++20)
- Inline small functions — but let the compiler decide via LTO
