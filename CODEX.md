# CODEX.md

## SpaceInvadersJS Contributor Guide

### Quick Start
- `npm install`
- `npm test`
- `npm run lint`
- Open `index.html` in a browser to run the game.

### Commands
- Test once: `npm test`
- Test watch: `npm run test:watch`
- Lint: `npm run lint`
- Format: `npm run format`
- Format check: `npm run format:check`

### Code Layout
- `index.html`: canvas host + SoundJS CDN + module entry
- `js/main.js`: app bootstrap
- `js/scenes.js`: scene classes + `ScenesManager`
- `js/systems/`: gameplay systems (collision/scoring/projectiles/effects/invaders)
- `js/runtime-state.js`: game runtime object factory
- `js/invaders.js`: entities and projectiles
- `js/factory.js`: invader/mask creation utilities
- `tests/`: Vitest unit tests for systems and scene manager transitions

### Implementation Patterns
- Use scene lifecycle methods for setup/teardown:
  - `enter()` for listeners and initialization
  - `update(deltaMs)` for game state
  - `render()` for draw calls
  - `exit()` for cleanup
- Keep game mechanics in system modules when possible.
- Keep rendering side effects out of update-only operations.
- Prefer explicit state objects passed as function args.

### Testing Expectations
- Add or update tests for behavior changes in `js/systems/*`.
- For scene transition changes, update `tests/scenes/scenes-manager.test.js`.
- Keep tests deterministic and fast (no browser dependency).

### Quality Bar
- No new lint violations.
- Existing tests must stay green.
- Avoid introducing implicit globals or framework dependencies.
- Preserve canvas/SoundJS runtime assumptions unless requested.

### Notes
Current docs in `docs/SESSION_HANDOFF.md` describe the recent modernization and remaining technical debt. Update it when making significant architecture changes.
