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
import { ObjectsOnStage } from './stage.js';

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

Scene.prototype.requestNextScene = function () {
  this.onNextScene();
};

Scene.prototype.requestSceneChange = function (index) {
  this.onSceneChange(index);
};

export const SceneMenu = function (session) {
  Scene.call(this, session);
  this.sceneName = 'sceneMenu';

  let initGameListener = null;

  this.enter = function () {
    Scene.prototype.enter.call(this);

    initGameListener = (e) => {
      const key = e.which || e.keyCode;

      if (key === 13) {
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
      this.session.hiScore,
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

    ObjectsOnStage.avatars = [ufo, small, medium, large];
    ctx.fillText('*SCORE   ADVANCE   TABLE*', cv.width / 3.9, cv.height / 2.1);
  };

  const startAnimationSequence = () => {
    const playCancel = typeWriter(ctx, session.definitions, 'PLAY', cv.width / 2.4, cv.height / 3.3, () => {
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

          for (let i = 0; i < ObjectsOnStage.avatars.length; i += 1) {
            ObjectsOnStage.avatars[i].render();
          }

          const mysteryCancel = typeWriter(
            ctx,
            session.definitions,
            '= ? MISTERY',
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
                            null,
                          );
                          trackAnimation(pageTurnCancel);
                        },
                      );
                      trackAnimation(p10Cancel);
                    },
                  );
                  trackAnimation(p20Cancel);
                },
              );
              trackAnimation(p30Cancel);
            },
          );
          trackAnimation(mysteryCancel);
        },
      );
      trackAnimation(titleCancel);
    });

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
    Scene.prototype.exit.call(this);
  };
};
SceneInstructions.prototype = Object.create(Scene.prototype);

export const SceneGame = function (session) {
  Scene.call(this, session);
  this.sceneName = 'sceneGame';

  const timeScene = 14;
  const introDelayMs = 2000;
  let count = 0;
  let introElapsedMs = 0;
  let gameplayStarted = false;
  let masks = null;
  let controlsCannon = null;

  const initializeGameplay = () => {
    ObjectsOnStage.stageIsOver = false;

    const ufo1 = new UfoInvader(50, 90);
    ObjectsOnStage.ufo = [ufo1];
    ObjectsOnStage.cannon = new CoreCannon(50, 580);
    ObjectsOnStage.alienInvaders = createSpaceInvaders();
    ObjectsOnStage.laserCannon = [];
    ObjectsOnStage.shotEffects = [];
    ObjectsOnStage.scorePopups = [];

    masks = createSpaceInvadersMask(ObjectsOnStage.alienInvaders);
    masks.create();

    gameplayStarted = true;
  };

  const updateGameplayState = () => {
    const toggle = count % timeScene === 0;

    if (ObjectsOnStage.ufo[0].x > cv.width + 100 || ObjectsOnStage.ufo[0].x < -100) {
      ObjectsOnStage.ufo[0].direction *= -1;
    }

    ObjectsOnStage.ufo[0].move(ObjectsOnStage.ufo[0].velocity, 0);
    ObjectsOnStage.animateInvaders(count % 10 === 0);
    ObjectsOnStage.updateCannonShoot(this.session);
    ObjectsOnStage.updateEffects();

    if (masks.animatedFinished) {
      if (count % 2 === 0) {
        ObjectsOnStage.moveInvadersTroopers(8, 8);
      }

      if (count % 2 === 0) {
        if (toggle) {
          // SoundsManager.playSoundTrack();
        }
        if (ObjectsOnStage.ufo[0].isAlive && count % 5 === 0) {
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

    if (count > 500) {
      console.log('agora o jogo começou');
    }

    count += 1;
  };

  this.enter = function () {
    Scene.prototype.enter.call(this);

    count = 0;
    introElapsedMs = 0;
    gameplayStarted = false;
    masks = null;

    controlsCannon = (e) => {
      if (!gameplayStarted || !ObjectsOnStage.cannon) {
        return;
      }

      const key = e.which || e.keyCode;

      if (key === 32) {
        if (ObjectsOnStage.lasersAreDead()) {
          ObjectsOnStage.cannon.shoot();
          SoundsManager.playSound('invaderKilled');
        }
      } else if (key === 37) {
        ObjectsOnStage.cannon.move(ObjectsOnStage.cannon.x - ObjectsOnStage.cannon.velocity, 0);
      } else if (key === 39) {
        ObjectsOnStage.cannon.move(ObjectsOnStage.cannon.x + ObjectsOnStage.cannon.velocity, 0);
      }
    };

    window.addEventListener('keydown', controlsCannon);
  };

  this.update = function (deltaMs) {
    if (!gameplayStarted) {
      introElapsedMs += deltaMs;
      if (introElapsedMs >= introDelayMs) {
        initializeGameplay();
      }
      return;
    }

    updateGameplayState();
  };

  this.render = function () {
    clearScreen(cv, ctx, this.session.definitions.backgroundColor);
    drawHeader(
      ctx,
      this.session.definitions,
      this.session.players[0],
      this.session.players[1],
      this.session.hiScore,
    );
    drawFooter(ctx, this.session.definitions);

    if (!gameplayStarted) {
      ctx.fillText('PLAY  PLAYER <1>', cv.width / 3, cv.height / 2.1);
      return;
    }

    ObjectsOnStage.ufo[0].render();
    ObjectsOnStage.cannon.render();
    ObjectsOnStage.renderInvaders();
    ObjectsOnStage.renderLaserCannon();
    ObjectsOnStage.renderEffects();

    if (!masks.animatedFinished) {
      masks.render();
    }
  };

  this.exit = function () {
    if (controlsCannon) {
      window.removeEventListener('keydown', controlsCannon);
      controlsCannon = null;
    }

    Scene.prototype.exit.call(this);
  };
};
SceneGame.prototype = Object.create(Scene.prototype);

export const SceneWinner = function (session) {
  Scene.call(this, session);
  this.sceneName = 'sceneWinner';

  this.render = function () {
    clearScreen(cv, ctx, this.session.definitions.backgroundColor);
    ctx.font = this.session.definitions.fontProperties;
    ctx.fillText('Thanks for Playing!', 10, 50);
  };
};
SceneWinner.prototype = Object.create(Scene.prototype);

export const SceneLoser = function (session) {
  Scene.call(this, session);
  this.sceneName = 'sceneLoser';

  this.render = function () {
    clearScreen(cv, ctx, this.session.definitions.backgroundColor);
    ctx.font = this.session.definitions.fontProperties;
    ctx.fillText('You Lose!', 10, 50);
  };
};
SceneLoser.prototype = Object.create(Scene.prototype);

export const ScenesManager = function (gameScenes) {
  this.currentScene = 0;
  this.won = false;
  this.gameScenes = gameScenes;

  this.activeScene = null;
  this.animationFrameId = null;
  this.loopStepMs = 60;
  this.lastTimestamp = 0;
  this.accumulatedMs = 0;

  const configureSceneCallbacks = (scene) => {
    scene.onNextScene = () => {
      this.nextScene();
    };

    scene.onSceneChange = (index) => {
      this.changeScene(index);
    };
  };

  for (let i = 0; i < this.gameScenes.length; i += 1) {
    configureSceneCallbacks(this.gameScenes[i]);
  }

  this.changeScene = function (sceneIndex) {
    if (sceneIndex < 0 || sceneIndex >= this.gameScenes.length) {
      return;
    }

    if (this.activeScene) {
      this.activeScene.exit();
    }

    this.currentScene = sceneIndex;
    this.activeScene = this.gameScenes[this.currentScene];
    this.activeScene.enter();

    console.log(`Cena atual: ${this.currentScene} ${new Date()}`);
  };

  this.nextScene = function () {
    if (this.currentScene === 2) {
      this.changeScene(this.won ? 3 : 4);
      return;
    }

    this.changeScene(this.currentScene + 1);
  };

  this.loop = (timestamp) => {
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
    }

    const deltaMs = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    this.accumulatedMs += deltaMs;

    while (this.accumulatedMs >= this.loopStepMs) {
      if (this.activeScene) {
        this.activeScene.update(this.loopStepMs);
        this.activeScene.render();
      }
      this.accumulatedMs -= this.loopStepMs;
    }

    this.animationFrameId = window.requestAnimationFrame(this.loop);
  };

  this.run = function () {
    this.lastTimestamp = 0;
    this.accumulatedMs = 0;

    if (this.animationFrameId !== null) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.changeScene(0);
    this.animationFrameId = window.requestAnimationFrame(this.loop);
  };

  this.stop = function () {
    if (this.animationFrameId !== null) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.activeScene) {
      this.activeScene.exit();
      this.activeScene = null;
    }
  };
};
