---
rubric: cpp
description: C/C++ review checks for systems code
load_when: "stack.languages includes cpp OR stack.languages includes c"
---

# C/C++ Review Rubric

| ID | Check | Rule | Severity |
|---|---|---|---|
| CPP-1 | **Buffer overflow** | Array access without bounds checking, `strcpy`/`sprintf` into fixed buffers | CRITICAL |
| CPP-2 | **Use-after-free** | Raw pointer used after `delete`/`free`, dangling reference returned | CRITICAL |
| CPP-3 | **Uninitialized memory** | Variable used before initialization, uninitialized struct fields | CRITICAL |
| CPP-4 | **Memory leak** | `new` without `delete`, `malloc` without `free`, missing RAII wrapper | MAJOR |
| CPP-5 | **Data race** | Shared mutable state accessed from multiple threads without synchronization | CRITICAL |
| CPP-6 | **Signed overflow** | Arithmetic on signed integers without overflow check (UB in C/C++) | MAJOR |
| CPP-7 | **Raw `new`/`delete`** | Manual memory management instead of `std::unique_ptr`/`std::shared_ptr` | MAJOR |
| CPP-8 | **`system()` injection** | `system()` or `popen()` called with user-influenced string | CRITICAL |
| CPP-9 | **Exception in destructor** | Destructor that throws — can cause `std::terminate` | MAJOR |
| CPP-10 | **`using namespace std`** | In a header file — pollutes every includer's namespace | MINOR |
| CPP-11 | **Missing `virtual` destructor** | Base class with virtual methods but non-virtual destructor | MAJOR |
| CPP-12 | **Implicit conversion** | Constructors without `explicit`, lossy narrowing conversions | MINOR |
