---
rubric: systems
description: OS and systems programming review checks
load_when: "stack.languages includes cpp OR stack.languages includes c OR stack.languages includes rust OR stack.languages includes go"
---

# Systems Programming Review Rubric

| ID | Check | Rule | Severity |
|---|---|---|---|
| SYS-1 | **Zombie processes** | Child process spawned without `waitpid`/`wait` — zombies accumulate | CRITICAL |
| SYS-2 | **File descriptor leak** | `open()`/`socket()` without corresponding `close()` on all paths including errors | CRITICAL |
| SYS-3 | **Signal handler unsafe** | Signal handler calls `malloc`, `printf`, `mutex_lock`, or other non-async-signal-safe functions | CRITICAL |
| SYS-4 | **Unchecked syscall** | System call return value ignored — `write`, `read`, `close`, `fork` can all fail | MAJOR |
| SYS-5 | **Shell injection** | `system()`, `popen()`, or `exec` with shell interpolation of untrusted input | CRITICAL |
| SYS-6 | **Pipe deadlock** | Parent reads from child stdout without draining stderr (or vice versa) — pipe buffer fills, process blocks | MAJOR |
| SYS-7 | **TOCTOU race** | `stat()` then `open()` — file state can change between check and use | MAJOR |
| SYS-8 | **Hardcoded `/tmp`** | Temporary files in `/tmp` without `mkstemp` or unique naming — symlink attack risk | MAJOR |
| SYS-9 | **Fork in multithreaded** | `fork()` in a multithreaded process — only calling thread survives, mutexes may be locked | CRITICAL |
| SYS-10 | **Missing `O_CLOEXEC`** | File descriptors opened without `O_CLOEXEC` leak into child processes | MINOR |
| SYS-11 | **Blocking DNS** | `gethostbyname` or synchronous `getaddrinfo` in event loop — blocks entire server | MAJOR |
| SYS-12 | **Missing resource limits** | Long-running daemon without `setrlimit`/cgroup constraints — can exhaust system resources | MINOR |
