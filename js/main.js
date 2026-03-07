/**
 * Space Invaders Classic in Canvas
 * @author Rodrigo Ruotolo <roderickruotolo@gmail.com>
 */

import { Definitions } from './config.js';
import { setCanvasContext } from './context.js';
import {
  SceneGame,
  SceneInstructions,
  SceneLoser,
  SceneMenu,
  ScenesManager,
  SceneWinner,
} from './scenes.js';
import { createPlayer, createSession } from './session.js';
import { SoundsManager } from './sounds-manager.js';

const setup = () => {
  const cv = document.getElementById('cv');
  cv.width = Definitions.widthScreen;
  cv.height = Definitions.heightScreen;
  const ctx = cv.getContext('2d');
  setCanvasContext(cv, ctx);
};

const initSpaceInvaders = () => {
  setup();

  SoundsManager.loadSounds();

  const gameSession = createSession(Definitions);

  const gamePlayer1 = createPlayer();
  const gamePlayer2 = createPlayer();

  gameSession.includePlayers(gamePlayer1);
  gameSession.includePlayers(gamePlayer2);

  const gameScenes = [
    new SceneMenu(gameSession),
    new SceneInstructions(gameSession),
    new SceneGame(gameSession),
    new SceneWinner(gameSession),
    new SceneLoser(gameSession),
  ];

  const scenesManager = new ScenesManager(gameScenes);
  scenesManager.run();
};

window.addEventListener('load', () => {
  initSpaceInvaders();
});
