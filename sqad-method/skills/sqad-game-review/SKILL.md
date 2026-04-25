---
name: sqad-game-review
description: >
  Review game code for performance, architecture, networking, and design
  quality. Covers Unity, Unreal, Godot, and custom engines. Identifies
  runtime allocations, physics issues, networking anti-patterns, and
  design problems.
  Use when user says "review game code", "audit game project",
  "check game performance", or runs /game-review.
---

# SQAD-Public Game Review — Pixel + Quest + Lore + Titan

Comprehensive review of game code, architecture, performance, networking,
narrative integration, and quality standards.

**Bootstrap (read now):**
- `sqad-method/config.yaml` — team config
- `sqad-method/agents/_base-agent.md` — base protocols
- `sqad-method/agents/pixel.md` — Game Developer lens
- `sqad-method/agents/quest.md` — Game Designer lens
- `sqad-method/fragments/stack/game-dev.md` — game dev patterns
- `sqad-method/fragments/rubric/game-dev.md` — game dev review checks

**Phase-gated loading:**
- Phase 3: `sqad-method/agents/lore.md` — Narrative review
- Phase 4: `sqad-method/agents/titan.md` — Quality enforcement
- Phase 4: `sqad-method/agents/flux.md` — Creative alternatives

Track progress with TodoWrite.

---

## Phase 1 — DISCOVERY (Pixel)

### 1a. Detect Game Stack

Scan for game development indicators:

```
Search for: UnityEngine, UObject, Godot, MonoGame, SDL, Raylib,
  .unity, .uproject, .uasset, project.godot, .csproj (Unity),
  Update(), FixedUpdate(), _Process(), Tick(),
  Rigidbody, Collider, CharacterController,
  NetworkManager, Photon, Mirror, Netcode,
  AudioSource, AudioClip, SoundManager
```

Catalog findings:
- **Engine** — Unity, Unreal, Godot, custom
- **Rendering** — 2D/3D, shader pipeline, draw call count
- **Physics** — Engine physics, custom physics, timestep model
- **Networking** — Authoritative, P2P, library (Photon, Mirror, Netcode)
- **Audio** — Audio system, spatial audio, event-driven
- **Input** — Input system, rebinding support

### 1b. Map Game Architecture

1. Identify game loop structure (fixed vs variable timestep)
2. Map major systems (rendering, physics, input, audio, networking, UI)
3. Identify state management (game states, scene management)
4. Check asset pipeline and build configuration

**USER GATE:** "Here's the game stack inventory. [Continue/Adjust scope]"

---

## Phase 2 — CODE REVIEW (Pixel)

### 2a. Performance Review

- Runtime allocations in Update/Tick hot paths
- Object pooling usage for spawned/destroyed objects
- Draw call optimization (batching, instancing, LOD)
- Physics timestep correctness (FixedUpdate vs Update)
- Asset loading strategy (async vs sync)
- Frame budget compliance per target platform

### 2b. Architecture Review

- State machine usage for character/AI behavior
- Event/observer pattern for system decoupling
- Input system abstraction (rebinding, multi-platform)
- Game state vs presentation separation
- Scene/level management

### 2c. Networking Review (if multiplayer)

- Server authority model
- Delta compression for state sync
- Lag compensation and prediction
- Interpolation for remote entities

### 2d. Run Game Dev Rubric

Run all checks from `game-dev.md` rubric (GD-*, GA-*, GN-*, GB-*).

---

## Phase 3 — DESIGN & NARRATIVE REVIEW (Quest + Lore)

### 3a. Game Design Review (Quest)

- Core loop clarity — is the primary gameplay loop evident?
- Feedback systems — does every action have visual/audio response?
- Difficulty curve — smooth progression or unexpected spikes?
- Player onboarding — tutorial integrated into gameplay?

### 3b. Narrative Integration Review (Lore)

- Story-gameplay alignment — does narrative motivate actions?
- Dialogue quality — concise, in-character, localization-ready?
- World consistency — lore consistent across all sources?
- Environmental storytelling — show don't tell?

---

## Phase 4 — QUALITY ENFORCEMENT (Titan + Flux)

### 4a. Standards Check (Titan)

- Test coverage for game systems
- Build pipeline automation
- Code documentation (public APIs, complex systems)
- Performance test benchmarks

### 4b. Creative Alternatives (Flux)

- Are there simpler approaches to complex systems?
- Assumptions in the design that should be questioned?
- Cross-domain patterns that could improve the game?

---

## Phase 5 — REPORT (All agents)

```markdown
# Game Review Report

## Executive Summary
- Engine: [name + version]
- Target platforms: [list]
- Critical findings: [N]
- Performance: [within budget / over budget]

## Performance Profile
[Table: System | Frame Time | Budget | Status]

## Architecture Review
[Table: System | Pattern | Quality | Issues]

## Networking (if applicable)
[Table: Feature | Pattern | Latency | Issues]

## Design & Narrative
[Key findings from Quest and Lore]

## Findings
### Critical
[Runtime allocations, client-trusted state, blocking loads]

### Major
[Missing pooling, monolithic update, hardcoded input]

## Recommendations
[Prioritized fixes with effort/impact]
```

**USER GATE:** "Report complete. [Export/Discuss/Create stories]"

---

## Behavioral Rules

1. **NEVER fabricate findings.** Every claim cites file path and line.
2. **Performance claims must reference profiler data or frame budget analysis.**
3. **Networking issues must describe the exploit or degradation scenario.**
4. **Design feedback must be actionable, not subjective ("feels wrong").**
5. **Track the operation** — log to `sqad-method/output/tracking.jsonl`.
