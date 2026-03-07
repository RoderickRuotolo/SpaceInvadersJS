/**
 * @author Rodrigo Ruotolo <roderickruotolo@gmail.com>
 */

import { cv, ctx } from './context.js';
import { drawEllipseByCenter } from './draw-functions.js';
import { SoundsManager } from './sounds-manager.js';

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

ObjectsOnStage.moveLaserCannon = function () {
  if (this.laserCannon.length > 0) {
    for (let i = 0; i < this.laserCannon.length; i += 1) {
      this.laserCannon[i].move();
    }
  }
};

ObjectsOnStage.renderLaserCannon = function () {
  if (this.laserCannon.length > 0) {
    for (let i = 0; i < this.laserCannon.length; i += 1) {
      if (this.laserCannon[i].isAlive === 1) {
        this.laserCannon[i].render();
      }
    }
  }
};

ObjectsOnStage.lasersAreDead = function () {
  if (this.laserCannon.length > 0) {
    for (let i = 0; i < this.laserCannon.length; i += 1) {
      if (this.laserCannon[i].isAlive) {
        return false;
      }
    }
  }
  return true;
};

ObjectsOnStage.updateCannonShoot = function (session) {
  if (!this.shotEffects) {
    this.shotEffects = [];
  }
  if (!this.scorePopups) {
    this.scorePopups = [];
  }

  if (this.laserCannon.length > 0) {
    for (let i = 0; i < this.laserCannon.length; i += 1) {
      if (this.laserCannon[i].isAlive === 1) {
        this.laserCannon[i].move();

        if (this.laserCannon[i].y < 0) {
          this.shotEffects.push({ x: this.laserCannon[i].x, y: 3, w: 20, h: 10, life: 3 });
          this.laserCannon[i].isAlive = 0;
        }

        for (let j = 0; j < this.alienInvaders.length; j += 1) {
          for (let k = 0; k < this.alienInvaders[j].length; k += 1) {
            if (this.laserCannon[i].isAlive === 1 && this.alienInvaders[j][k].isAlive === 1) {
              if (this.laserCannon[i].collisionWasDetected(this.alienInvaders[j][k])) {
                this.alienInvaders[j][k].currentMap = 2;
                this.alienInvaders[j][k].isAlive = 0;
                this.laserCannon[i].isAlive = 0;
                SoundsManager.playSound('shoot');
                session.players[0].score += this.alienInvaders[j][k].points;
              }
            }
          }
        }

        for (let u = 0; u < this.ufo.length; u += 1) {
          if (this.laserCannon[i].isAlive === 1 && this.ufo[u].isAlive === 1) {
            if (this.laserCannon[i].collisionWasDetected(this.ufo[u])) {
              this.ufo[u].currentMap = 2;
              this.ufo[u].isAlive = 0;
              this.laserCannon[i].isAlive = 0;
              this.scorePopups.push({
                text: String(this.ufo[u].points),
                x: this.ufo[u].x + this.ufo[u].width * 0.3,
                y: this.ufo[u].y + this.ufo[u].height * 1.05,
                life: 15,
              });
              session.players[0].score += this.ufo[u].points;
              SoundsManager.playSound('ufoLowpitch');
            }
          }
        }
      }
    }
  }
};

ObjectsOnStage.verifyCannonShoot = function (session) {
  this.updateCannonShoot(session);
};

ObjectsOnStage.updateEffects = function () {
  if (!this.shotEffects) {
    this.shotEffects = [];
  }
  if (!this.scorePopups) {
    this.scorePopups = [];
  }

  for (let i = this.shotEffects.length - 1; i >= 0; i -= 1) {
    this.shotEffects[i].life -= 1;
    if (this.shotEffects[i].life <= 0) {
      this.shotEffects.splice(i, 1);
    }
  }

  for (let i = this.scorePopups.length - 1; i >= 0; i -= 1) {
    this.scorePopups[i].life -= 1;
    this.scorePopups[i].y -= 0.8;
    if (this.scorePopups[i].life <= 0) {
      this.scorePopups.splice(i, 1);
    }
  }
};

ObjectsOnStage.renderEffects = function () {
  if (this.shotEffects && this.shotEffects.length > 0) {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < this.shotEffects.length; i += 1) {
      const effect = this.shotEffects[i];
      drawEllipseByCenter(ctx, effect.x, effect.y, effect.w, effect.h);
    }
  }

  if (this.scorePopups && this.scorePopups.length > 0) {
    for (let i = 0; i < this.scorePopups.length; i += 1) {
      const popup = this.scorePopups[i];
      ctx.fillText(popup.text, popup.x, popup.y);
    }
  }
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
