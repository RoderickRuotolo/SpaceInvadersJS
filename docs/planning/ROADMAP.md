# Space Invaders JS — Roadmap

Last reviewed: 2026-11-07

## Assessment
The previous roadmap was directionally good, but outdated for this repository. Core architecture refactors (ES modules, scenes lifecycle, fixed-step loop, and core gameplay systems separation) are already done. The next roadmap should focus on missing gameplay rules and completion quality.

## Current Status (Already Done)
- [x] ES module structure without framework/bundler.
- [x] Scene lifecycle (`enter/update/render/exit`) and centralized scene manager.
- [x] Fixed-step main loop using `requestAnimationFrame`.
- [x] Separated systems for projectiles, collision, scoring, effects, and invader movement.
- [x] Basic menu/instructions/game/win/lose scene structure.
- [x] Tooling baseline with ESLint + Prettier + Vitest.
- [x] Unit tests for systems + scene manager transitions.

## Phase 1 — Gameplay Completion (Highest Priority)
Goal: make single-player gameplay rules complete and finishable.

### 1. Win/Lose Rules in `SceneGame`
- [x] Trigger win when all standard invaders are dead.
- [x] Trigger lose when aliens reach the player boundary.
- [x] Trigger lose when player lives reach 0.
- [x] Wire `SceneGame` outcomes to `ScenesManager` winner/loser routing.

Implemented in `outcome-system.js`: living invaders reaching the cannon's top edge
cause defeat regardless of horizontal position; the bonus UFO does not prevent victory.
Zero lives takes precedence over victory.

### 2. Player Damage and Lives
- [x] Implement player hit detection (alien laser -> player).
- [x] Implement player death feedback (short animation or hit state).
- [x] Disable controls while resolving death/respawn.
- [x] Keep HUD score/lives synchronized with session player state.

Hits remove one life and clear both projectile pools. Gameplay pauses for a 900 ms
explosion; surviving players respawn at x=50 with 1200 ms of blinking protection.
The last-life explosion finishes before the defeat screen appears.

### 3. Alien Shooting System
- [x] Activate alien projectile spawning (prefer bottom-most alive invaders).
- [x] Limit simultaneous alien projectiles.
- [x] Update/render alien projectiles in the main game update/render cycle.
- [x] Remove off-screen alien projectiles safely.

Shooting starts after the formation reveal: one shot every 900 ms, up to three
active shots, selected from the lowest living invaders in each column. Shot speed
is 6 pixels per fixed update. Manual browser playthrough and difficulty tuning pending.

### 4. Barriers/Shelters
- [x] Add barrier entities to stage initialization.
- [x] Implement destructible barrier segments.
- [x] Handle collisions: player shots vs barriers, alien shots vs barriers.
- [x] Prevent barriers from persisting incorrectly across new matches.

Four shelters at y=500 use 6x6 destructible segments with arched openings. Each
shot is absorbed by the first intact segment along its swept path; holes let
subsequent shots pass. Living invaders crush overlapping segments. Damage persists
across player respawns; each new gameplay initialization creates intact shelters.
Barrier hits do not award points. Manual browser playthrough pending.

Completion criteria:
- [x] Full single-player loop: start -> play -> win/lose -> return flow works.
- [ ] No runtime errors during a full manual playthrough.

## Phase 2 — Match Flow and Session Correctness
Goal: ensure clean resets and deterministic progression.

### 1. Clean Match Reset
- [x] Reset cannon, invaders, UFO, projectiles, effects, timers, masks.
- [x] Ensure no objects from prior run leak into a new game.
- [x] Keep hi-score logic and current score behavior explicit.

Result scenes display score/record and return to the menu on Enter. Starting from
the menu resets players in place and gameplay entry creates a fresh runtime.
The record updates immediately on scoring and survives new matches within the
current page session (initial value 5000; no persistence across page reloads).
Repeated Enter key events are ignored in menu/result scenes to avoid accidental starts.

### 2. Scene/State Reliability
- [x] Remove or gate debug logs in production path.
- [x] Add guardrails for invalid scene transitions.
- [x] Document scene transition contract in code comments/docs.

Transitions validate indices and lifecycle hooks before exiting. Inactive/stale
callbacks, nested transitions, duplicate activations and sequential navigation
from results are rejected. Routine logs are removed; transition logging is opt-in
with `new ScenesManager(gameScenes, { debug: true })`. See `docs/SCENE_TRANSITIONS.md`.

### 3. Integration-Oriented Tests
- [x] Add tests for `SceneGame` outcome transitions (win/lose).
- [x] Add tests for gameplay reset behavior.
- [x] Add tests for lives decrement and game-over trigger.

Completion criteria:
- [x] Game can be played repeatedly without stale state bugs.
- [x] New transition tests pass consistently.

Automated coverage exercises three successive matches through the real menu,
instructions, gameplay, and each result scene, including listener cleanup and
fresh timers, masks, barriers, projectiles, entities, effects and player state.
Manual browser playthrough remains pending.

## Phase 3 — Two-Player Alternating Mode
Goal: implement classic alternating turns (not simultaneous).

### 1. Player Session Model
- [ ] Use menu selection (`1` vs `2` players) to configure session flow.
- [ ] Track score/lives independently for player 1 and player 2.
- [ ] Define active player index and turn lifecycle.

### 2. Turn Switching
- [ ] After player 1 game-over, reset gameplay state for player 2.
- [ ] Show transition messaging (e.g., `PLAYER 2 START`).
- [ ] Continue until both players complete turns.

### 3. Results Screen
- [ ] Display both player scores.
- [ ] Highlight winner or tie.
- [ ] Allow restart to menu/new match.

Completion criteria:
- [ ] Two players can complete alternating matches end-to-end.

## Phase 4 — Quality, Tooling, and Polish
Goal: improve maintainability and player experience.

### 1. CI and Automation
- [ ] Add GitHub Actions workflow for `npm test` and `npm run lint`.
- [ ] Optionally add `npm run format:check` in CI.

### 2. Gameplay and UX Polish
- [ ] Tune invader speed progression and shot cadence.
- [ ] Improve visual feedback for explosions/hits.
- [ ] Review sound mix and trigger timings.

### 3. Documentation Maintenance
- [ ] Keep `docs/handoff/SESSION_HANDOFF.md` and this roadmap synchronized after major changes.
- [ ] Add a short contributor section in `README.md` with run/test commands.

Completion criteria:
- [ ] CI is green on push/PR.
- [ ] Manual smoke checklist passes with no major issues.

## Suggested Implementation Order
1. Win/lose rules and scene transitions.
2. Alien shooting + player damage/lives.
3. Barriers.
4. Reset correctness + integration tests.
5. Two-player alternating mode.
6. CI and polish.
