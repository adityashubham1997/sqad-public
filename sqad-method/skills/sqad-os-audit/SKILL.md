---
name: sqad-os-audit
description: >
  Audit OS-level code, process management, systems architecture, and C/C++
  patterns in the codebase. Identifies resource leaks, unsafe subprocess handling,
  concurrency bugs, and portability issues across Linux, Unix, and Windows.
  Use when user says "audit systems code", "review OS patterns",
  "check process management", or runs /os-audit.
---

# SQAD-Public OS & Systems Audit — Kernel

Comprehensive audit of all systems-level code: process management, IPC, memory,
file I/O, networking, concurrency, and cross-platform portability.

**Bootstrap (read now):**
- `sqad-method/config.yaml` — team config
- `sqad-method/agents/_base-agent.md` — base protocols
- `sqad-method/agents/kernel.md` — OS/Systems Architect lens
- `sqad-method/fragments/stack/cpp.md` — C/C++ patterns (if detected)
- `sqad-method/fragments/rubric/cpp.md` — C/C++ review checks (if detected)
- `sqad-method/fragments/rubric/systems.md` — systems review checks

**Phase-gated loading:**
- Phase 3: `sqad-method/agents/aegis.md` — security lens on systems code
- Phase 3: `sqad-method/agents/raven.md` — adversarial review

Track progress with TodoWrite.

---

## Phase 1 — DISCOVERY (Kernel)

### 1a. Detect Systems Footprint

Scan the codebase for systems-level patterns:

```
Search for: fork, exec, spawn, waitpid, kill, signal, sigaction,
  pipe, dup2, socketpair, mmap, shm_open, shmget, pthread, mutex,
  semaphore, epoll, kqueue, iocp, select, poll, io_uring,
  CreateProcess, WaitForSingleObject, HANDLE, _beginthreadex,
  child_process, subprocess, os.fork, Process, ProcessBuilder,
  system(), popen(), execve, posix_spawn
```

Catalog findings:
- **Languages** — C, C++, Rust, Go, Python, Node.js, Java (systems interaction layer)
- **Process spawning patterns** — fork/exec, posix_spawn, CreateProcess, child_process, subprocess
- **IPC mechanisms** — pipes, sockets, shared memory, message queues, signals
- **Concurrency model** — threads, async/await, event loop, actor, coroutines
- **I/O model** — blocking, non-blocking, multiplexed, async (io_uring/IOCP)
- **Platform targets** — Linux-only, POSIX, cross-platform, Windows-specific

### 1b. Map Process Architecture

For each subprocess/process interaction:
1. Trace lifecycle: spawn → communicate → wait → cleanup
2. Identify: who spawns, what args, stdin/stdout/stderr handling, exit code checking
3. Map parent-child relationships and process trees
4. Identify signal handling strategy (or lack thereof)

**USER GATE:** "Here's the systems inventory. Review it. [Continue/Adjust scope]"

---

## Phase 2 — ANALYSIS (Kernel)

### 2a. Resource Safety Audit

Check every process/resource acquisition point:
- **Processes** — Is every `fork`/`spawn` matched with `wait`? Zombie risk?
- **File descriptors** — Are all fds closed on every code path (including errors)?
- **Memory** — Are allocations freed? RAII used? Leak under error paths?
- **Locks** — Are mutexes released on all paths? Lock ordering consistent?
- **Sockets** — Proper shutdown sequence? `SO_LINGER` set appropriately?
- **Temporary files** — Created securely with `mkstemp`? Cleaned up?

### 2b. Rubric Check

Run every check from:
- `systems.md` rubric (SYS-1 through SYS-12) against all systems code
- `cpp.md` rubric (CPP-1 through CPP-12) if C/C++ detected

### 2c. Concurrency Analysis

Identify:
- Shared mutable state between threads/processes
- Lock contention hotspots
- Potential deadlocks (lock ordering violations)
- Data races (unsynchronized access to shared data)
- Atomics usage correctness (memory ordering)

### 2d. Portability Assessment

Check:
- Linux-specific APIs used without abstraction (`epoll`, `/proc`, `inotify`)
- Windows-specific APIs without POSIX fallback
- Hardcoded paths (`/tmp`, `/dev/null`, `C:\`)
- Byte order assumptions (endianness)
- Struct packing and alignment assumptions
- `sizeof` assumptions (pointer size, `int` size)

---

## Phase 3 — SECURITY REVIEW (Kernel + Aegis)

### 3a. Systems Security

- **Command injection** — `system()`, `popen()`, shell=True with user input
- **Path traversal** — `../` in file operations, symlink following
- **Privilege escalation** — setuid binaries, capability handling, dropping privileges
- **Race conditions** — TOCTOU in file operations, PID reuse attacks
- **Buffer overflow** — stack/heap overflow in C/C++ code
- **Cryptographic misuse** — weak random (`rand()`), hardcoded seeds, broken crypto

### 3b. Container Security (if detected)

- Namespace isolation completeness
- Seccomp profile coverage
- Capability dropping
- Read-only filesystem enforcement
- Resource limits via cgroups

---

## Phase 4 — REPORT (Kernel)

### Consolidated Report Structure

```markdown
# OS & Systems Audit Report

## Executive Summary
- Total systems interaction points: [N]
- Critical findings: [N]
- Resource leak risks: [N]
- Portability issues: [N]

## Systems Inventory
[Table: Component | Language | Process Model | IPC | Platform Target]

## Findings
### Critical
[Resource leaks, race conditions, injection vulnerabilities with file:line]

### Major
[Concurrency issues, portability gaps, missing error handling]

### Process Architecture Diagram
[Parent-child process tree, IPC channels, signal flows]

## Recommendations
[Prioritized fixes with effort/impact and code examples]
```

**USER GATE:** "Report complete. [Export/Discuss findings/Create stories]"

---

## Behavioral Rules

1. **NEVER fabricate findings.** Every claim must cite a file path and line.
2. **Show the unsafe code AND the fix.** Before/after with explanation.
3. **Platform-specific findings cite the platform.** "Linux-only: uses `epoll`"
4. **Race conditions must show the interleaving.** Thread A does X, Thread B does Y → bug.
5. **Track the operation** — log to `sqad-method/output/tracking.jsonl`.
