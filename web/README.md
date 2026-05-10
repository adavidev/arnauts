# Arnauts (web)

Phaser 3 + Vite + TypeScript port of the original libGDX/Java game living in
`../core` and `../desktop`. Same gameplay (small ship of corridor / hull tiles,
A* pathfinding characters, ladders) — just running in the browser.

## Run

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle into dist/
```

## Controls

- Left click an empty tile cell next to the ship -> place a corridor
- `L` (with mouse over a corridor tile) -> drop a ladder
- `Q` / `E` -> rotate the whole ship
- Arrow keys -> pan the camera

## Layout

```
src/
  main.ts                # Phaser.Game config (BootScene -> TestScene)
  scenes/
    BootScene.ts         # asset preload + Phaser animation defs
    TestScene.ts         # mirrors core/.../scenes/TestScene.java
  core/
    GameNode.ts          # Phaser.Container subclass with logical Y-up coords
    Random.ts, Tickable.ts
  ship/                  # Tile, Corridor, CleanCorridor, Hull, Space,
                         # Ship, Interactable, Ladder, NoInteraction
  characters/
    GameCharacter.ts, Captain.ts, Engineer.ts, Hunter.ts
    state/               # Stand, RunningLeft/Right, ClimbingUp/Down, ...
    ai/                  # AI, Astar, RandomWalkAI, RandomTravelAI
public/assets/           # spritesheets copied from ../core/assets/
```

## Coordinate convention

Original Java uses libGDX's Y-up coordinates. We track that as `lx`/`ly` on
`GameNode` (Y-up, ship-local) and translate to Phaser's Y-down container
position via `setLogicalPos(lx, ly)` (sets `container.y = -ly`). All the
ported game math (hull neighbor lookups, AI thresholds, climb deltas) stays
identical to the Java.
