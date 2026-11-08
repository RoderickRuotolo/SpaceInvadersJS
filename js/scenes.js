/**
 * @author Rodrigo Ruotolo Barbosa <roderickruotolo@gmail.com>
 * Game Scenes
 */

import { cv, ctx } from './context.js';
import {
  clearScreen,
  drawFooter,
  drawHeader,
  drawTextMenu,
  turnThePage,
  typeWriter,
} from './draw-functions.js';
import { createSpaceInvaders, createSpaceInvadersMask } from './factory.js';
import { CoreCannon, LargeInvader, MediumInvader, SmallInvader, UfoInvader } from './invaders.js';
import { Menu } from './menu.js';
import { SoundsManager } from './sounds-manager.js';
import { resolvePlayerProjectileCollisions } from './systems/collision-system.js';
import { renderStageEffects, updateStageEffects } from './systems/effects-system.js';
import { animateInvaders, moveInvadersTroopers, renderInvaders } from './systems/invader-system.js';
import {
  arePlayerProjectilesInactive,
  renderPlayerProjectiles,
  updatePlayerProjectiles,
} from './systems/projectile-system.js';
import { applyCollisionScoring } from './systems/scoring-system.js';
import { createGameRuntime } from './runtime-state.js';
import { getGameOutcome } from './systems/outcome-system.js';
import { finishPlayerTurn, getActivePlayer, getMatchWinner, resetMatch } from './session.js';
import { renderAlienProjectiles, updateAlienProjectiles } from './systems/alien-shooting-system.js';
import { resolvePlayerDamage, updatePlayerRecovery } from './systems/player-damage-system.js';
import {
  createBarriers,
  crushBarriers,
  renderBarriers,
  resolveBarrierCollisions,
} from './systems/barrier-system.js';

export const Scene = function (session) {
  this.sceneName = '';
  this.session = session;
  this.isActive = false;
  this.onNextScene = () => {};
  this.onSceneChange = () => {};
};

Scene.prototype.enter = function () {
  this.isActive = true;
};

Scene.prototype.update = function () {};

Scene.prototype.render = function () {};

Scene.prototype.exit = function () {
  this.isActive = false;
};

Scene.prototype.requestNextScene = function (won) {
  return this.onNextScene(won);
};

Scene.prototype.requestSceneChange = function (index) {
  return this.onSceneChange(index);
};

export const SceneMenu = function (session) {
  Scene.call(this, session);
  this.sceneName = 'sceneMenu';

  let initGameListener = null;

  this.enter = function () {
    Scene.prototype.enter.call(this);

    initGameListener = (e) => {
      if (!this.isActive || e.repeat) return;
      const key = e.which || e.keyCode;

      if (key === 13) {
        resetMatch(this.session, Menu.option);
        this.requestNextScene();
      } else if (key === 38 || key === 40) {
        Menu.altOption();
      }
    };

    window.addEventListener('keydown', initGameListener);
  };

  this.render = function () {
    clearScreen(cv, ctx, this.session.definitions.backgroundColor);

    drawHeader(
      ctx,
      this.session.definitions,
      this.session.players[0],
      this.session.players[1],
      this.session.hiScore
    );

    drawFooter(ctx, this.session.definitions);
    drawTextMenu(ctx, this.session.definitions);

    if (Menu.option === 2) {
      Menu.drawTwoPlayers();
    } else {
      Menu.drawOnePlayer();
    }
  };

  this.exit = function () {
    if (initGameListener) {
      window.removeEventListener('keydown', initGameListener);
      initGameListener = null;
    }
    Scene.prototype.exit.call(this);
  };
};
SceneMenu.prototype = Object.create(Scene.prototype);

export const SceneInstructions = function (session) {
  Scene.call(this, session);
  this.sceneName = 'sceneInstructions';

  let elapsedMs = 0;
  let hasRequestedNextScene = false;
  let instructionAvatars = [];
  const animationCancels = [];

  const trackAnimation = (cancelFn) => {
    if (typeof cancelFn === 'function') {
      animationCancels.push(cancelFn);
    }
  };

  const cancelAnimations = () => {
    while (animationCancels.length > 0) {
      const cancel = animationCancels.pop();
      cancel();
    }
  };

  const drawStaticLayout = () => {
    clearScreen(cv, ctx, session.definitions.backgroundColor);
    drawHeader(ctx, session.definitions, session.players[0], session.players[1], session.hiScore);
    drawFooter(ctx, session.definitions);

    const ufo = new UfoInvader(cv.width / 3.3, cv.height / 1.95);
    const small = new SmallInvader(cv.width / 3.14, cv.height / 1.79);
    const medium = new MediumInvader(cv.width / 3.18, cv.height / 1.63);
    const large = new LargeInvader(cv.width / 3.2, cv.height / 1.47);

    instructionAvatars = [ufo, small, medium, large];
    ctx.fillText('*SCORE   ADVANCE   TABLE*', cv.width / 3.9, cv.height / 2.1);
  };

  const startAnimationSequence = () => {
    const playCancel = typeWriter(
      ctx,
      session.definitions,
      'PLAY',
      cv.width / 2.4,
      cv.height / 3.3,
      () => {
        if (!this.isActive) {
          return;
        }

        const titleCancel = typeWriter(
          ctx,
          session.definitions,
          'SPACE    INVADERS!',
          cv.width / 3.1,
          cv.height / 2.7,
          () => {
            if (!this.isActive) {
              return;
            }

            for (let i = 0; i < instructionAvatars.length; i += 1) {
              instructionAvatars[i].render();
            }

            const mysteryCancel = typeWriter(
              ctx,
              session.definitions,
              '= ? MYSTERY',
              cv.width / 2.5,
              cv.height / 1.85,
              () => {
                if (!this.isActive) {
                  return;
                }

                const p30Cancel = typeWriter(
                  ctx,
                  session.definitions,
                  '= 30 POINTS',
                  cv.width / 2.5,
                  cv.height / 1.7,
                  () => {
                    if (!this.isActive) {
                      return;
                    }

                    const p20Cancel = typeWriter(
                      ctx,
                      session.definitions,
                      '= 20 POINTS',
                      cv.width / 2.5,
                      cv.height / 1.55,
                      () => {
                        if (!this.isActive) {
                          return;
                        }

                        const p10Cancel = typeWriter(
                          ctx,
                          session.definitions,
                          '= 10 POINTS',
                          cv.width / 2.5,
                          cv.height / 1.4,
                          () => {
                            if (!this.isActive) {
                              return;
                            }

                            const pageTurnCancel = turnThePage(
                              ctx,
                              session.definitions,
                              'right',
                              null
                            );
                            trackAnimation(pageTurnCancel);
                          }
                        );
                        trackAnimation(p10Cancel);
                      }
                    );
                    trackAnimation(p20Cancel);
                  }
                );
                trackAnimation(p30Cancel);
              }
            );
            trackAnimation(mysteryCancel);
          }
        );
        trackAnimation(titleCancel);
      }
    );

    trackAnimation(playCancel);
  };

  this.enter = function () {
    Scene.prototype.enter.call(this);
    elapsedMs = 0;
    hasRequestedNextScene = false;
    drawStaticLayout();
    startAnimationSequence();
  };

  this.update = function (deltaMs) {
    elapsedMs += deltaMs;

    if (!hasRequestedNextScene && elapsedMs >= 10000) {
      hasRequestedNextScene = true;
      this.requestNextScene();
    }
  };

  // No per-frame render here. Animation functions render directly.
  this.render = function () {};

  this.exit = function () {
    cancelAnimations();
    instructionAvatars = [];
    Scene.prototype.exit.call(this);
  };
};
SceneInstructions.prototype = Object.create(Scene.prototype);

export const SceneGame = function (session) {
  Scene.call(this, session);
  this.sceneName = 'sceneGame';

  const timeScene = 14;
  const introDelayMs = 2000;
  let gameRuntime = null;
  let count = 0;
  let introElapsedMs = 0;
  let gameplayStarted = false;
  let masks = null;
  let controlsCannon = null;

  const startTurn = () => {
    gameRuntime = createGameRuntime();
    count = 0;
    introElapsedMs = 0;
    gameplayStarted = false;
    masks = null;
    getActivePlayer(this.session).won = false;
  };

  const finishIfOver = () => {
    const outcome = getGameOutcome(gameRuntime, getActivePlayer(this.session));
    if (!outcome) return false;

    gameRuntime.stageIsOver = true;
    if (finishPlayerTurn(this.session, outcome === 'won')) {
      startTurn();
      return true;
    }
    this.requestNextScene(outcome === 'won');
    return true;
  };

  const initializeGameplay = () => {
    gameRuntime.stageIsOver = false;

    const ufo1 = new UfoInvader(50, 90);
    gameRuntime.ufo = [ufo1];
    gameRuntime.cannon = new CoreCannon(50, 580);
    gameRuntime.cannon.stageState = gameRuntime;
    gameRuntime.alienInvaders = createSpaceInvaders();
    gameRuntime.barriers = createBarriers(cv.width);
    gameRuntime.laserCannon = [];
    gameRuntime.shotEffects = [];
    gameRuntime.scorePopups = [];

    masks = createSpaceInvadersMask(gameRuntime.alienInvaders);
    masks.create();

    gameplayStarted = true;
  };

  const updateGameplayState = (deltaMs) => {
    const toggle = count % timeScene === 0;

    if (gameRuntime.ufo[0].x > cv.width + 100 || gameRuntime.ufo[0].x < -100) {
      gameRuntime.ufo[0].direction *= -1;
    }

    gameRuntime.ufo[0].move(gameRuntime.ufo[0].velocity, 0);
    animateInvaders(gameRuntime, count % 10 === 0);
    updatePlayerProjectiles(gameRuntime);
    resolveBarrierCollisions(gameRuntime, gameRuntime.laserCannon, -1);
    const collisionEvents = resolvePlayerProjectileCollisions(gameRuntime);
    applyCollisionScoring(this.session, gameRuntime, collisionEvents);
    updateStageEffects(gameRuntime);

    if (masks.animatedFinished) {
      updateAlienProjectiles(gameRuntime, deltaMs, cv.height);
      if (count % 2 === 0) {
        moveInvadersTroopers(gameRuntime, 8, 8);
      }
      crushBarriers(gameRuntime);
      resolveBarrierCollisions(gameRuntime, gameRuntime.laserInvaders, 1);

      if (count % 2 === 0) {
        if (toggle) {
          // SoundsManager.playSoundTrack();
        }
        if (gameRuntime.ufo[0].isAlive && count % 5 === 0) {
          // SoundsManager.playSound('ufoHighpitch');
        }
      }
    }

    if (!masks.animatedFinished) {
      masks.step(2);
    }

    if (count > 6000) {
      count = 0;
    }

    count += 1;
  };

  this.enter = function () {
    Scene.prototype.enter.call(this);

    startTurn();

    controlsCannon = (e) => {
      if (
        !this.isActive ||
        !gameplayStarted ||
        !gameRuntime?.cannon ||
        gameRuntime.stageIsOver ||
        gameRuntime.playerDeathRemainingMs > 0
      ) {
        return;
      }

      const key = e.which || e.keyCode;

      if (key === 32) {
        if (arePlayerProjectilesInactive(gameRuntime)) {
          gameRuntime.cannon.shoot(gameRuntime);
          SoundsManager.playSound('invaderKilled');
        }
      } else if (key === 37) {
        gameRuntime.cannon.move(gameRuntime.cannon.x - gameRuntime.cannon.velocity, 0);
      } else if (key === 39) {
        gameRuntime.cannon.move(gameRuntime.cannon.x + gameRuntime.cannon.velocity, 0);
      }
    };

    window.addEventListener('keydown', controlsCannon);
  };

  this.update = function (deltaMs) {
    if (!this.isActive || gameRuntime.stageIsOver) return;

    if (!gameplayStarted) {
      introElapsedMs += deltaMs;
      if (introElapsedMs >= introDelayMs) {
        initializeGameplay();
      }
      return;
    }

    const recovering = gameRuntime.playerDeathRemainingMs > 0;
    updatePlayerRecovery(gameRuntime, getActivePlayer(this.session), deltaMs);
    if (recovering) {
      if (gameRuntime.playerDeathRemainingMs === 0) finishIfOver();
      return;
    }
    if (finishIfOver()) return;
    updateGameplayState(deltaMs);
    if (resolvePlayerDamage(gameRuntime, getActivePlayer(this.session))) return;
    finishIfOver();
  };

  this.render = function () {
    clearScreen(cv, ctx, this.session.definitions.backgroundColor);
    drawHeader(
      ctx,
      this.session.definitions,
      this.session.players[0],
      this.session.players[1],
      this.session.hiScore
    );
    drawFooter(ctx, this.session.definitions);

    if (!gameplayStarted) {
      ctx.fillText(
        `PLAYER ${this.session.activePlayerIndex + 1} START`,
        cv.width / 3,
        cv.height / 2.1
      );
      return;
    }

    gameRuntime.ufo[0].render();
    ctx.fillStyle = this.session.definitions.primaryColor;
    ctx.fillText(`LIVES ${getActivePlayer(this.session).lives}`, 20, 670);
    if (this.session.playerCount === 2) {
      ctx.fillText(`PLAYER <${this.session.activePlayerIndex + 1}>`, 230, 670);
    }
    if (
      gameRuntime.playerInvulnerableMs === 0 ||
      Math.floor(gameRuntime.playerInvulnerableMs / 120) % 2 === 0
    ) {
      gameRuntime.cannon.render();
    }
    renderInvaders(gameRuntime);
    renderBarriers(gameRuntime, ctx, this.session.definitions.secondaryColor);
    renderPlayerProjectiles(gameRuntime);
    renderAlienProjectiles(gameRuntime);
    renderStageEffects(gameRuntime);

    if (!masks.animatedFinished) {
      masks.render();
    }
  };

  this.exit = function () {
    if (controlsCannon) {
      window.removeEventListener('keydown', controlsCannon);
      controlsCannon = null;
    }
    gameRuntime = null;

    Scene.prototype.exit.call(this);
  };
};
SceneGame.prototype = Object.create(Scene.prototype);

const configureResultNavigation = (scene) => {
  let returnListener = null;
  scene.enter = function () {
    Scene.prototype.enter.call(this);
    returnListener = (event) => {
      if (!this.isActive || event.repeat) return;
      if ((event.which || event.keyCode) === 13) this.requestSceneChange(0);
    };
    window.addEventListener('keydown', returnListener);
  };
  scene.exit = function () {
    window.removeEventListener('keydown', returnListener);
    returnListener = null;
    Scene.prototype.exit.call(this);
  };
};

const drawResultDetails = (session) => {
  if (session.playerCount === 2) {
    ctx.fillText(`PLAYER 1 SCORE ${session.players[0].score}`, 10, 100);
    ctx.fillText(`PLAYER 2 SCORE ${session.players[1].score}`, 10, 150);
    const winner = getMatchWinner(session);
    ctx.fillStyle = session.definitions.secondaryColor;
    ctx.fillText(winner === null ? 'TIE GAME!' : `PLAYER ${winner + 1} WINS!`, 10, 210);
    ctx.fillStyle = session.definitions.primaryColor;
    ctx.fillText(`HI-SCORE ${session.hiScore}`, 10, 260);
    ctx.fillText('Press ENTER to return to the menu', 10, 330);
    return;
  }
  ctx.fillText(`SCORE ${session.players[0].score}`, 10, 100);
  ctx.fillText(`HI-SCORE ${session.hiScore}`, 10, 150);
  ctx.fillText('Press ENTER to return to the menu', 10, 220);
};

export const SceneWinner = function (session) {
  Scene.call(this, session);
  this.sceneName = 'sceneWinner';
  configureResultNavigation(this);

  this.render = function () {
    clearScreen(cv, ctx, this.session.definitions.backgroundColor);
    ctx.font = this.session.definitions.fontProperties;
    ctx.fillStyle = this.session.definitions.primaryColor;
    ctx.fillText(
      this.session.playerCount === 2 ? 'MATCH RESULTS' : 'You Win! Thanks for Playing!',
      10,
      50
    );
    drawResultDetails(this.session);
  };
};
SceneWinner.prototype = Object.create(Scene.prototype);

export const SceneLoser = function (session) {
  Scene.call(this, session);
  this.sceneName = 'sceneLoser';
  configureResultNavigation(this);

  this.render = function () {
    clearScreen(cv, ctx, this.session.definitions.backgroundColor);
    ctx.font = this.session.definitions.fontProperties;
    ctx.fillStyle = this.session.definitions.primaryColor;
    ctx.fillText(this.session.playerCount === 2 ? 'MATCH RESULTS' : 'You Lose!', 10, 50);
    drawResultDetails(this.session);
  };
};
SceneLoser.prototype = Object.create(Scene.prototype);

export const ScenesManager = function (gameScenes, { debug = false } = {}) {
  this.currentScene = 0;
  this.won = false;
  this.gameScenes = gameScenes;

  this.activeScene = null;
  this.animationFrameId = null;
  this.loopStepMs = 60;
  this.lastTimestamp = 0;
  this.accumulatedMs = 0;
  let transitioning = false;
  let activationId = 0;
  let running = false;

  const configureSceneCallbacks = (scene) => {
    const currentActivation = activationId;
    const canRequest = () =>
      !transitioning && this.activeScene === scene && activationId === currentActivation;
    scene.onNextScene = (won) => {
      return canRequest() ? this.nextScene(won) : false;
    };

    scene.onSceneChange = (index) => {
      return canRequest() ? this.changeScene(index) : false;
    };
  };

  for (let i = 0; i < this.gameScenes.length; i += 1) {
    if (this.gameScenes[i] && typeof this.gameScenes[i] === 'object') {
      configureSceneCallbacks(this.gameScenes[i]);
    }
  }

  this.changeScene = function (sceneIndex) {
    // Validate before leaving the current scene; rejected requests have no side effects.
    if (
      transitioning ||
      !Number.isInteger(sceneIndex) ||
      sceneIndex < 0 ||
      sceneIndex >= this.gameScenes.length
    ) {
      return false;
    }
    const target = this.gameScenes[sceneIndex];
    if (
      !target ||
      !['enter', 'exit', 'update', 'render'].every((hook) => typeof target[hook] === 'function') ||
      this.activeScene === target
    ) {
      return false;
    }

    transitioning = true;
    try {
      const previous = this.activeScene;
      this.activeScene = null;
      activationId += 1;
      if (previous) previous.exit();
      this.currentScene = sceneIndex;
      if (sceneIndex === 0) this.won = false;
      this.activeScene = target;
      configureSceneCallbacks(target);
      target.enter();
      if (debug) console.debug(`Current scene: ${this.currentScene}`);
      return true;
    } finally {
      transitioning = false;
    }
  };

  // SceneGame supplies its result; other scenes request a sequential transition.
  this.nextScene = function (won) {
    if (transitioning || !this.activeScene) return false;
    if (this.currentScene === 2) {
      if (won !== undefined && typeof won !== 'boolean') return false;
      const outcome = won ?? this.won;
      const previousOutcome = this.won;
      this.won = outcome;
      if (!this.changeScene(outcome ? 3 : 4)) {
        this.won = previousOutcome;
        return false;
      }
      return true;
    }

    if (this.currentScene !== 0 && this.currentScene !== 1) return false;
    return this.changeScene(this.currentScene + 1);
  };

  this.loop = (timestamp) => {
    if (!running) return;
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
    }

    const deltaMs = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    this.accumulatedMs += deltaMs;

    while (running && this.accumulatedMs >= this.loopStepMs) {
      if (this.activeScene) {
        this.activeScene.update(this.loopStepMs);
        if (running && this.activeScene) this.activeScene.render();
      }
      this.accumulatedMs -= this.loopStepMs;
    }

    if (running) this.animationFrameId = window.requestAnimationFrame(this.loop);
  };

  this.run = function () {
    running = true;
    this.lastTimestamp = 0;
    this.accumulatedMs = 0;

    if (this.animationFrameId !== null) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.changeScene(0);
    if (running) this.animationFrameId = window.requestAnimationFrame(this.loop);
  };

  this.stop = function () {
    running = false;
    activationId += 1;
    if (this.animationFrameId !== null) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.activeScene) {
      const previous = this.activeScene;
      this.activeScene = null;
      const wasTransitioning = transitioning;
      transitioning = true;
      try {
        previous.exit();
      } finally {
        transitioning = wasTransitioning;
      }
    }
  };
};
