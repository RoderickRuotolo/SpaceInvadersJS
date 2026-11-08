# Scene transition contract

`ScenesManager` owns scene activation and the fixed 60 ms update/render loop.
The scene list supplied by `main.js` uses these indices:

| Index | Scene | Navigation |
| --- | --- | --- |
| 0 | Menu | `requestNextScene()` opens instructions. |
| 1 | Instructions | `requestNextScene()` opens gameplay. |
| 2 | Gameplay | `requestNextScene(true)` wins; `requestNextScene(false)` loses. |
| 3 | Winner | `requestSceneChange(0)` returns to the menu. |
| 4 | Loser | `requestSceneChange(0)` returns to the menu. |

In two-player mode, `SceneGame` stays active between turns. `finishPlayerTurn`
records the first player's outcome and advances `activePlayerIndex`; an internal
turn initializer creates a fresh runtime and repeats the two-second start message
for player 2. The existing controls remain attached once and ignore input during
the start message. No same-scene manager transition is requested.

Only the final player's completed turn requests a result scene using the table
above. Both result scenes show the same multiplayer standings, based on scores;
`manager.won` still reflects the final turn's stage outcome rather than the match
standings. Single-player navigation is unchanged. Starting from the menu calls
`resetMatch(session, Menu.option)` and resets the active index and completion flags.

## Lifecycle and requests

- Each destination must provide `enter`, `exit`, `update` and `render` functions
  (inherited methods are supported).
- An accepted transition calls the previous scene's `exit()` before the target's
  `enter()`. Controls and animations belong in `enter()` and must be cleaned up in
  `exit()`. Rendering stays in `render()` and state changes in `update(deltaMs)`.
- Scene code uses `requestNextScene(won)` or `requestSceneChange(index)` rather than
  holding a manager reference. These forward through `onNextScene` / `onSceneChange`.
- Manager transition methods and configured callbacks return `true` when accepted
  and `false` when rejected. Scene request helpers forward that result.
- Requests are accepted only from the active scene and its current activation.
  Captured callbacks from earlier activations are invalid even if that scene is
  entered again. Scenes must still cancel their own scheduled work on exit; a
  delayed function that looks up a new callback is not an old captured callback.
- Requests during `enter()` / `exit()` are rejected, not queued. Make navigation
  requests from input handlers or `update()` after activation completes.
- Duplicate requests for the already active scene are ignored. To start another
  match, return to the menu and start through the normal flow.

## Validation and results

Indices must be integers within the scene list. Non-numbers, fractions, `NaN`,
infinities, missing entries and incomplete scenes are rejected before calling
`exit()`, leaving the active scene and result untouched.

Sequential navigation is supported only from menu, instructions and gameplay;
result scenes require an explicit destination. A supplied gameplay result must be
boolean. Omitting it retains compatibility with `manager.won`. A rejected result
destination preserves the previous `won` value. Returning to the menu clears it.

Direct `manager.changeScene(index)` may activate any valid, different scene; it is
used for startup and tests. It does not enforce the gameplay navigation graph.
Gameplay initialization/reset belongs to the scene/session lifecycle.

Hook exceptions propagate to the caller; they are not swallowed or rolled back.
The transition lock is released even if a hook throws.

## Loop and diagnostics

When `update()` changes scenes, the loop renders the new active scene. Calling
`stop()` cancels the scheduled frame, exits the active scene and invalidates its
callbacks. Stopping inside `update()` skips rendering and prevents a new frame
from being scheduled; an already delivered frame callback becomes a no-op.

Routine gameplay, sound and animation logs are removed. Transition logging is
disabled by default. Developers can opt in when constructing the manager:

```js
const manager = new ScenesManager(gameScenes, { debug: true });
```

This emits one `console.debug` message per accepted transition.
