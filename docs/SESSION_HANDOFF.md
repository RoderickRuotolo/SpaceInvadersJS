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
- Gameplay update/render separation partially completed and validated.

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

### 4) Update/render split (in progress but stable)
- `LaserCannon.move()` and `LaserInvaders.move()` now only update position (no draw side effects).
- `ObjectsOnStage` gained:
  - `updateCannonShoot(session)`
  - `renderLaserCannon()`
  - `updateEffects()`
  - `renderEffects()`
- `verifyCannonShoot(session)` kept as compatibility alias to `updateCannonShoot(session)`.
- Mask object gained `step(removalsPerTick)` and still supports legacy `run()`.

## Key Files (Current Architecture)
- Entry: `js/main.js`
- Scene orchestration: `js/scenes.js`
- Stage state/systems (still coupled): `js/stage.js`
- Entities: `js/invaders.js`, `js/game.js`
- Drawing helpers/animations: `js/draw-functions.js`
- Factories/spawn/mask: `js/factory.js`
- Session/config/context: `js/session.js`, `js/config.js`, `js/context.js`

## Known Technical Debt
- `ObjectsOnStage` still central/global-like state and heavily coupled.
- Collision/scoring/effects logic still concentrated in `stage.js`.
- No automated tests yet.
- No package tooling (`package.json`, lint, format, tests) yet.

## Next Recommended Stage (Potentially Breaking)
Extract gameplay systems from `stage.js` into dedicated modules, e.g.:
- `js/systems/collision-system.js`
- `js/systems/scoring-system.js`
- `js/systems/projectile-system.js`

Then adapt `SceneGame.update/render` to call systems explicitly.

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

