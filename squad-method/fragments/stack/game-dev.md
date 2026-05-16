---
fragment: stack/game-dev
description: Game development patterns for Unity, Unreal, Godot, and custom engines
load_when: "stack.frameworks includes unity OR unreal OR godot OR monogame OR sdl OR raylib"
token_estimate: 900
---

# Game Development Stack Context

## Engine Comparison

| Engine | Language | Strengths | Best For |
|---|---|---|---|
| **Unity** | C# | Huge ecosystem, mobile, 2D/3D, XR | Indie, mobile, VR/AR |
| **Unreal Engine** | C++/Blueprints | AAA graphics, Nanite, Lumen | AAA, realistic 3D, shooters |
| **Godot** | GDScript/C#/C++ | Open source, lightweight, node-based | Indie, 2D, rapid prototyping |
| **MonoGame** | C# | Low-level, framework-style | Retro, custom engine builders |
| **SDL/Raylib** | C/C++ | Minimal, educational, custom engines | Learning, custom engines |

## Game Loop Architecture

### Fixed Timestep (Recommended for Physics)
```
accumulator = 0
while running:
    currentTime = getTime()
    deltaTime = currentTime - previousTime
    previousTime = currentTime
    accumulator += deltaTime
    
    while accumulator >= FIXED_STEP:
        updatePhysics(FIXED_STEP)
        accumulator -= FIXED_STEP
    
    alpha = accumulator / FIXED_STEP
    render(interpolate(previousState, currentState, alpha))
```

### Unity Execution Order
1. `Awake()` → `OnEnable()` → `Start()`
2. `FixedUpdate()` → Physics
3. `Update()` → `LateUpdate()`
4. Rendering → `OnGUI()`
5. `OnDisable()` → `OnDestroy()`

## Common Patterns

| Pattern | Purpose | Example |
|---|---|---|
| **Object Pooling** | Avoid GC from Instantiate/Destroy | Bullet pools, particle pools |
| **Component (ECS)** | Decouple behavior from objects | Unity ECS, Bevy, EnTT |
| **State Machine** | Character states, AI, UI flow | Idle→Run→Jump→Fall |
| **Observer/Event** | Decouple systems | Health changed → update UI + play sound |
| **Command** | Input buffering, undo/redo | Input queue, replay systems |
| **Singleton/Service Locator** | Global access (use carefully) | AudioManager, InputManager |
| **Flyweight** | Shared data for many instances | Tile types, bullet configs |
| **Spatial Partitioning** | Efficient collision/neighbor queries | Quadtree, octree, spatial hash |

## Performance Budgets

| Platform | Target FPS | Frame Budget | Notes |
|---|---|---|---|
| PC (high) | 60-144 | 6.9-16.67ms | GPU usually bottleneck |
| Console | 30-60 | 16.67-33.3ms | Fixed hardware, predictable |
| Mobile | 30-60 | 16.67-33.3ms | Thermal throttling, battery |
| VR | 90+ | <11ms | Motion sickness below 90fps |

## Networking Patterns

| Pattern | Use Case | Latency Tolerance |
|---|---|---|
| **Authoritative Server** | Competitive multiplayer | Low — server validates all actions |
| **Client Prediction** | FPS, action games | Medium — predict locally, reconcile |
| **Rollback Netcode** | Fighting games | Very low — rollback on misprediction |
| **Lockstep** | RTS, deterministic sim | High — all clients in sync |
| **Relay/P2P** | Co-op, casual | Medium — direct connection |

## Anti-Patterns

- **Allocating in Update** — `new List()`, `new Vector3()`, string concatenation in hot paths
- **Physics in Update** — Use FixedUpdate with fixed timestep for deterministic simulation
- **Find in Update** — `GameObject.Find()`, `GetComponent()` every frame
- **No object pooling** — Instantiate/Destroy every bullet, particle, enemy
- **Premature optimization** — Optimizing before profiling. Always profile first
- **Monolithic Update** — One giant Update() method instead of separate systems
- **Hardcoded input** — `Input.GetKey(KeyCode.W)` instead of input system with rebinding
