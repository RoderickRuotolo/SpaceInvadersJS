/**
 * @author Rodrigo Ruotolo <roderickruotolo@gmail.com>
 */

import { cv } from './context.js';
import {
  arePlayerProjectilesInactive,
  renderPlayerProjectiles,
  updatePlayerProjectiles,
} from './systems/projectile-system.js';
import { resolvePlayerProjectileCollisions } from './systems/collision-system.js';
import { applyCollisionScoring } from './systems/scoring-system.js';
import { renderStageEffects, updateStageEffects } from './systems/effects-system.js';

export const ObjectsOnStage = { currentLineInvaders: 4, directionInvaders: 1 };

ObjectsOnStage.animateInvaders = function (toggle) {
  for (let i = 0; i < this.alienInvaders.length; i += 1) {
    for (let j = 0; j < this.alienInvaders[i].length; j += 1) {
      this.alienInvaders[i][j].alternateMap(toggle);
    }
  }

  for (let i = 0; i < this.ufo.length; i += 1) {
    this.ufo[i].alternateMap(toggle);
  }
};

ObjectsOnStage.renderInvaders = function () {
  for (let i = 0; i < this.alienInvaders.length; i += 1) {
    for (let j = 0; j < this.alienInvaders[i].length; j += 1) {
      this.alienInvaders[i][j].render();
    }
  }
};

// Compatibility wrappers while systems are extracted
ObjectsOnStage.moveLaserCannon = function () {
  updatePlayerProjectiles(this);
};

ObjectsOnStage.renderLaserCannon = function () {
  renderPlayerProjectiles(this);
};

ObjectsOnStage.lasersAreDead = function () {
  return arePlayerProjectilesInactive(this);
};

ObjectsOnStage.updateCannonShoot = function (session) {
  updatePlayerProjectiles(this);
  const events = resolvePlayerProjectileCollisions(this);
  applyCollisionScoring(session, this, events);
};

ObjectsOnStage.verifyCannonShoot = function (session) {
  this.updateCannonShoot(session);
};

ObjectsOnStage.updateEffects = function () {
  updateStageEffects(this);
};

ObjectsOnStage.renderEffects = function () {
  renderStageEffects(this);
};

ObjectsOnStage.moveInvadersTroopers = function (x, y) {
  let stepY = 0;
  const condition = this.alienInvaders[0][10].x > cv.width - 60 || this.alienInvaders[0][0].x < 15;

  if (condition) {
    this.directionInvaders *= -1;
    stepY = y;
  }

  for (let i = 0; i < this.alienInvaders[this.currentLineInvaders].length; i += 1) {
    if (this.currentLineInvaders % 2 > 0 && condition) {
      this.alienInvaders[this.currentLineInvaders][i].move(x * this.directionInvaders * -1, stepY);
    } else {
      this.alienInvaders[this.currentLineInvaders][i].move(x * this.directionInvaders, stepY);
    }
  }

  if (this.currentLineInvaders === 0) {
    this.currentLineInvaders = 4;
  } else {
    this.currentLineInvaders -= 1;
  }
};
