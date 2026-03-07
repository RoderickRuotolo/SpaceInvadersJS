# SpaceInvadersJS - Session Handoff

Last update: 2026-03-07
Project path: `/home/roderick/Projetos/javascript/SpaceInvadersJS`

## Goal
Modernize the project with **vanilla JavaScript only** (no framework), preserving gameplay behavior.

## Current Status
- Smoke tests passed by user after each major step.
- App running in browser with ES Modules.
- Main loop migrated to `requestAnimationFrame`.
- Scene lifecycle implemented (`enter/update/render/exit`) with centralized `ScenesManager`.
- Gameplay update/render separation completed for projectiles/collision/scoring/effects and validated by smoke test.
- Runtime state is now explicit in `SceneGame` (`createGameRuntime`) instead of direct `ObjectsOnStage` coupling.
- Legacy `stage.js` compatibility layer removed.

## What Was Already Modernized

### 1) ES Modules (no bundler)
- `index.html` now loads:
  - `SoundJS` CDN
  - `js/main.js` as `type="module"`
- Files migrated to `import/export`.
- New modules created:
  - `js/context.js`
  - `js/config.js`
  - `js/session.js`
  - `js/menu.js`
  - `js/factory.js`

### 2) Loop and timing
- `SceneGame` no longer uses `setInterval` for the main game loop.
- Main loop uses `requestAnimationFrame` with fixed-step behavior (`60ms`) to preserve original pacing.
- `typeWriter` and `turnThePage` migrated from `setInterval` to RAF.

### 3) Scene lifecycle
- `Scene` base now supports:
  - `enter()`
  - `update(deltaMs)`
  - `render()`
  - `exit()`
- `ScenesManager` now:
  - controls transitions with cleanup
  - runs a central fixed-step loop
  - assigns callbacks (`onNextScene`, `onSceneChange`)

### 4) Update/render split (implemented)
- `LaserCannon.move()` and `LaserInvaders.move()` now only update position (no draw side effects).
- `ObjectsOnStage` gained:
  - `updateCannonShoot(session)`
  - `renderLaserCannon()`
  - `updateEffects()`
  - `renderEffects()`
- `verifyCannonShoot(session)` kept as compatibility alias to `updateCannonShoot(session)`.
- Mask object gained `step(removalsPerTick)` and still supports legacy `run()`.

### 5) Systems extraction (`BREAKING STAGE` item 1)
- New systems folder:
  - `js/systems/projectile-system.js`
  - `js/systems/collision-system.js`
  - `js/systems/scoring-system.js`
  - `js/systems/effects-system.js`
- `SceneGame` now calls systems directly in update/render pipeline.
- `stage.js` now acts mainly as stage object + compatibility wrappers.

### 6) Runtime decoupling (`BREAKING STAGE` item 2)
- New runtime factory:
  - `js/runtime-state.js`
- New invader system module:
  - `js/systems/invader-system.js`
- `SceneGame` now owns a local `gameRuntime` and passes it explicitly to systems.
- `SceneInstructions` no longer uses global stage state for temporary avatars.
- `CoreCannon.shoot()` now accepts explicit `stageState` (and supports `this.stageState`).
- `js/stage.js` removed (no remaining imports/usages).

### 7) Tooling and tests (`non-breaking`)
- Added Node tooling:
  - `package.json` (`type: module`, scripts for `lint`, `test`, `format`)
  - `eslint.config.js`
  - `.prettierrc.json`
  - `.prettierignore`
  - `.gitignore` (`node_modules`, `coverage`)
- Added test suite (Vitest):
  - `tests/systems/collision-system.test.js`
  - `tests/systems/scoring-system.test.js`
  - `tests/systems/projectile-system.test.js`
  - `tests/systems/effects-system.test.js`
  - `tests/systems/invader-system.test.js`
  - `tests/scenes/scenes-manager.test.js`
- Validation status:
  - `npm run lint` passes
  - `npm run test` passes

## Key Files (Current Architecture)
- Entry: `js/main.js`
- Scene orchestration: `js/scenes.js`
- Runtime factory: `js/runtime-state.js`
- Gameplay systems: `js/systems/*.js`
- Entities: `js/invaders.js`, `js/game.js`
- Drawing helpers/animations: `js/draw-functions.js`
- Factories/spawn/mask: `js/factory.js`
- Session/config/context: `js/session.js`, `js/config.js`, `js/context.js`

## Known Technical Debt
- Some gameplay behavior still relies on mutable shared runtime object patterns.
- Test coverage is minimal and focused on systems only (no scene-flow automation yet).
- Scene-flow coverage exists at manager transition level, but no DOM/canvas integration tests yet.

## Next Recommended Stage
1. Add CI workflow (`lint` + `test`) on push/PR.
2. Add lightweight integration tests around `SceneGame` runtime initialization.
3. Reduce debug logs or gate them behind a debug flag.

## Breaking-Stage Protocol (agreed)
Before any risky refactor:
1. Assistant writes: `BREAKING STAGE START`
2. User commits current state
3. User replies `ok`
4. Assistant executes breaking stage
5. Assistant writes: `BREAKING STAGE END` + validation checklist

## Quick Resume Checklist (new session)
1. Read this file first.
2. Confirm browser smoke test still passes.
3. Start from "Next Recommended Stage".
4. Follow the Breaking-Stage Protocol before structural refactors.

## Smoke Test Checklist (manual)
- Menu input works (up/down + enter).
- Instructions scene renders and transitions.
- Gameplay starts after intro delay.
- Cannon moves and shoots.
- Laser collision with aliens updates score.
- UFO hit updates score and popup appears.
- No duplicated shot rendering artifacts.
