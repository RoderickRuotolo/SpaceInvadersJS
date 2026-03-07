/**
 * @author Rodrigo Ruotolo <roderickruotolo@gmail.com>
 */

import { Definitions } from './config.js';
import { ctx } from './context.js';

/**
 * Object Game is parent of the majority actors game kinds
 */
export const ObjectGame = function (x, y) {
  this.x = x;
  this.y = y;
  this.maps = undefined;
  this.currentMap = 0;
  this.isAlive = 1;
  this.velocity = 1;
  this.color = Definitions.primaryColor;
  this.direction = 1;
};

ObjectGame.prototype.render = function () {
  if (!this.maps || this.maps.length === 0) {
    throw new Error('The property maps is empty');
  }

  for (let i = 0; i < this.maps[this.currentMap].length; i += 1) {
    for (let j = 0; j < this.maps[this.currentMap][i].length; j += 1) {
      if (this.maps[this.currentMap][i][j]) {
        ctx.fillStyle = this.color;
      } else {
        ctx.fillStyle = Definitions.backgroundColor;
      }
      ctx.fillRect(
        this.x + Definitions.pixelSize * j,
        this.y + Definitions.pixelSize * i,
        Definitions.pixelSize,
        Definitions.pixelSize,
      );
    }
  }
};

ObjectGame.prototype.move = function (x, y) {
  this.x += x * this.direction * this.velocity;
  this.y += y * this.direction * this.velocity;
};

ObjectGame.prototype.verifyColision = function (target) {
  return (
    this.x < target.x + target.width &&
    this.x + this.width > target.x &&
    this.y < target.y + target.height &&
    this.height + this.y > target.y
  );
};
