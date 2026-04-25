---
rubric: game-dev
description: Game development review checks for engines, performance, and networking
load_when: "stack.frameworks includes unity OR unreal OR godot OR monogame"
---

# Game Development Review Rubric

## Performance Checks

| ID | Check | Rule | Severity |
|---|---|---|---|
| GD-1 | **Runtime allocation in hot path** | `new`, `Instantiate()`, string concat in Update/Tick | CRITICAL |
| GD-2 | **Physics in variable timestep** | Physics updates in Update() instead of FixedUpdate() | MAJOR |
| GD-3 | **Find/GetComponent in loop** | `GameObject.Find()` or `GetComponent()` called every frame | MAJOR |
| GD-4 | **No object pooling** | Frequent Instantiate/Destroy without pooling pattern | MAJOR |
| GD-5 | **Unoptimized draw calls** | >500 draw calls without batching, atlasing, or instancing | MAJOR |
| GD-6 | **No frame budget check** | Performance-critical code added without profiler verification | MINOR |

## Architecture Checks

| ID | Check | Rule | Severity |
|---|---|---|---|
| GA-1 | **Monolithic Update** | Single Update() method with 100+ lines handling multiple concerns | MAJOR |
| GA-2 | **No state machine** | Complex character/AI behavior without state machine pattern | MAJOR |
| GA-3 | **Hardcoded input** | Direct key checks instead of input system with rebinding | MINOR |
| GA-4 | **Game state in presentation** | Game logic mixed with rendering/UI code | MAJOR |
| GA-5 | **Missing events** | Direct references between systems instead of event/observer pattern | MINOR |

## Networking Checks

| ID | Check | Rule | Severity |
|---|---|---|---|
| GN-1 | **No server authority** | Client-trusted game state without server validation | CRITICAL |
| GN-2 | **Full state sync** | Sending entire game state every tick instead of delta compression | MAJOR |
| GN-3 | **No lag compensation** | Player actions processed without accounting for network latency | MAJOR |
| GN-4 | **Missing interpolation** | Networked objects teleporting instead of smooth interpolation | MINOR |

## Asset & Build Checks

| ID | Check | Rule | Severity |
|---|---|---|---|
| GB-1 | **Blocking asset load** | Synchronous asset loading during gameplay (causes hitches) | MAJOR |
| GB-2 | **Missing platform test** | Code/assets not tested on target platform (mobile, console) | MAJOR |
| GB-3 | **Uncompressed assets** | Large textures/audio not compressed for target platform | MINOR |
| GB-4 | **No build automation** | Manual build process instead of CI/CD pipeline | MINOR |
