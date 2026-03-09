# AGENTS.md

## Purpose
This file gives coding agents a fast, repo-specific operating guide for SpaceInvadersJS.

## Project Snapshot
- Stack: vanilla JavaScript (ES Modules), HTML5 canvas, SoundJS (CDN in `index.html`)
- Entry point: `js/main.js`
- Runtime loop: `requestAnimationFrame` with fixed-step updates managed by `ScenesManager`
- Tests: Vitest (`tests/`)
- Lint/format: ESLint + Prettier

## Setup and Validation
- Install dependencies: `npm install`
- Run tests: `npm test`
- Run lint: `npm run lint`
- Format check: `npm run format:check`

Always run at least `npm test` and `npm run lint` after behavior changes.

## Architecture Map
- `js/main.js`: bootstraps canvas, sounds, session, scenes manager
- `js/scenes.js`: scene lifecycle (`enter/update/render/exit`) and game flow
- `js/runtime-state.js`: explicit per-game runtime state factory
- `js/systems/*.js`: isolated game systems
  - `projectile-system.js`
  - `collision-system.js`
  - `scoring-system.js`
  - `effects-system.js`
  - `invader-system.js`
- `js/invaders.js`: actor/entity definitions (cannon, invaders, lasers)
- `js/factory.js`: invader formation + intro mask animation
- `js/context.js`: shared canvas/context holder
- `js/session.js`: players/session state

## Working Rules for Agents
- Preserve gameplay behavior unless user explicitly requests behavior changes.
- Prefer adding/refining system functions in `js/systems` over growing `SceneGame` logic.
- Keep update and render concerns separated.
- Prefer explicit runtime state (`createGameRuntime`) over hidden globals.
- Maintain ES Module style (`import/export`), no framework adoption.
- Keep changes small and easy to review; avoid broad refactors unless requested.

## Known Footguns
- `SceneGame` still contains debug logs and some legacy-style counters.
- Sounds depend on global `createjs` from CDN script load order.
- Several modules rely on mutable shared objects; avoid accidental shape changes.
- Tests focus mostly on systems; scene integration coverage is minimal.

## When Editing Scenes
1. Ensure key listeners are attached in `enter` and removed in `exit`.
2. Keep `ScenesManager` transition hooks (`onNextScene`, `onSceneChange`) intact.
3. Preserve fixed-step loop behavior (`loopStepMs = 60`) unless explicitly requested.

## Definition of Done
- Behavior matches intent.
- `npm test` passes.
- `npm run lint` passes.
- Any architectural or workflow changes are reflected in docs (`README.md`, `docs/SESSION_HANDOFF.md`, and/or this file).
