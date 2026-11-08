# space-invaders-js
Space Invaders is a 1978 arcade game created by Tomohiro Nishikado. This script is an attempt to recreate the classic game in JS and canvas.

## Run the game locally

Prerequisite: Node.js with npm installed. The local server requires no dependency installation.

1. Open a terminal in the project folder.
2. Start the server:

   ```bash
   npm start
   ```

3. Open [http://localhost:8080](http://localhost:8080) in your browser.

Keep the terminal open while playing. Press `Ctrl+C` to stop the server.

If port 8080 is busy, use another port on Linux/macOS:

```bash
PORT=8081 npm start
```

Then open [http://localhost:8081](http://localhost:8081).

Opening `index.html` directly (`file://`) does not load the game's JavaScript modules;
use the local server's HTTP address instead.

## Controls and restarting

- Menu: use Up/Down to select an option and Enter to start.
- Gameplay: use Left/Right to move and Space to shoot.
- Results: press Enter to return to the menu, then Enter again to start a new match.

New matches reset both players' scores and lives and recreate all gameplay objects,
including barriers. The high score is retained between matches while the page is
open; reloading the page resets it to the initial value of 5000.

## Two-player mode

Select **2 PLAYERS** in the menu. Players share the same controls and take complete
turns in order: player 1 plays until losing the game or clearing the formation,
then player 2 starts with four lives and a fresh stage. Losing a single life does
not switch players. A start message and the lives display identify the active player.

After both turns, the results screen shows both scores and highlights the player
with the higher score, or a tie. The shared high score tracks points from either
player. Press Enter to return to the menu and start another match in either mode.

## Docs
- Documentation index: `docs/README.md`
- Session handoff: `docs/handoff/SESSION_HANDOFF.md`
- Roadmap: `docs/planning/ROADMAP.md`
- Documentation manifesto: `docs/MANIFESTO.md`

## AI Context Files
- Canonical agent guide: `.codex/context/AGENTS.md`
- Canonical Codex guide: `.codex/context/CODEX.md`
- Root compatibility files: `AGENTS.md`, `CODEX.md`
