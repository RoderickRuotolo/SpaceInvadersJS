/**
 * @description Alien invaders from game
 * @author Rodrigo Ruotolo <roderickruotolo@gmail.com>
 */

import { Definitions } from './config.js';
import { cv, ctx } from './context.js';
import { ObjectGame } from './game.js';
import { PixelSprites } from './sprites.js';
import { ObjectsOnStage } from './stage.js';

const getRandomInt = (min, max) => {
  const start = Math.ceil(min);
  const end = Math.floor(max);
  return Math.floor(Math.random() * (end - start)) + start;
};

export const Invader = function (x, y) {
  ObjectGame.call(this, x, y);
  this.currentMap = 0;
};
Invader.prototype = Object.create(ObjectGame.prototype);

Invader.prototype.alternateMap = function (statusToggle) {
  if (statusToggle && this.currentMap === 0) {
    this.currentMap = 1;
  } else if (statusToggle && this.currentMap === 1) {
    this.currentMap = 0;
  } else if (statusToggle && this.currentMap === 2) {
    this.currentMap = 3;
  }
};

export const SmallInvader = function (x, y) {
  ObjectGame.call(this, x, y);
  this.points = 30;
  this.maps = [PixelSprites.Squid, PixelSprites.Squid2, PixelSprites.AlienExplosion, PixelSprites.Dead];
  this.width = Definitions.pixelSize * this.maps[0][0].length;
  this.height = Definitions.pixelSize * this.maps[0].length;
};
SmallInvader.prototype = Object.create(Invader.prototype);

export const MediumInvader = function (x, y) {
  ObjectGame.call(this, x, y);
  this.points = 20;
  this.maps = [PixelSprites.Crab, PixelSprites.Crab2, PixelSprites.AlienExplosion, PixelSprites.Dead];
  this.width = Definitions.pixelSize * this.maps[0][0].length;
  this.height = Definitions.pixelSize * this.maps[0].length;
};
MediumInvader.prototype = Object.create(Invader.prototype);

export const LargeInvader = function (x, y) {
  ObjectGame.call(this, x, y);
  this.points = 10;
  this.maps = [PixelSprites.Jellyfish, PixelSprites.Jellyfish2, PixelSprites.AlienExplosion, PixelSprites.Dead];
  this.width = Definitions.pixelSize * this.maps[0][0].length;
  this.height = Definitions.pixelSize * this.maps[0].length;
};
LargeInvader.prototype = Object.create(Invader.prototype);

export const UfoInvader = function (x, y) {
  ObjectGame.call(this, x, y);
  this.color = 'red';
  this.points = [50, 100, 150][getRandomInt(0, 2)];
  this.velocity = 2;
  this.maps = [PixelSprites.UFO, PixelSprites.UFO, PixelSprites.AlienExplosion, PixelSprites.Dead];
  this.width = Definitions.pixelSize * this.maps[0][0].length;
  this.height = Definitions.pixelSize * this.maps[0].length;
};
UfoInvader.prototype = Object.create(Invader.prototype);

export const CoreCannon = function (x, y) {
  Invader.call(this, x, y);
  this.color = Definitions.secondaryColor;
  this.velocity = 8;
  this.maps = [PixelSprites.Cannon, PixelSprites.Cannon, PixelSprites.AlienExplosion, PixelSprites.Dead];
  this.width = Definitions.pixelSize * this.maps[0][0].length;
  this.height = Definitions.pixelSize * this.maps[0].length;
};
CoreCannon.prototype = Object.create(Invader.prototype);

CoreCannon.prototype.move = function (positionX) {
  const insideRightLimit = positionX < cv.width - this.width;
  const insideLeftLimit = positionX > 1;
  if (insideLeftLimit && insideRightLimit) {
    this.x = positionX;
  }
};

CoreCannon.prototype.shoot = function () {
  const laserCannon = new LaserCannon(this.x + (this.width / 2 - 1), this.y);
  ObjectsOnStage.laserCannon.push(laserCannon);
};

export const LaserCannon = function (x, y) {
  this.x = x;
  this.y = y - 10;
  this.velocity = 30;
  this.isAlive = 1;
  this.width = 3;
  this.height = 15;
  this.color = Definitions.primaryColor;
};

LaserCannon.prototype.move = function () {
  this.y -= this.velocity;
};

LaserCannon.prototype.render = function () {
  ctx.fillStyle = this.color;
  ctx.fillRect(this.x, this.y, this.width, this.height);
};

LaserCannon.prototype.collisionWasDetected = function (target) {
  return (
    this.x < target.x + target.width &&
    this.x + this.width > target.x &&
    this.y < target.y + target.height &&
    this.height + this.y > target.y
  );
};

export const LaserInvaders = function (x, y) {
  LaserCannon.call(this, x, y);
};
LaserInvaders.prototype = Object.create(LaserCannon.prototype);
LaserInvaders.prototype.move = function () {
  this.y += this.velocity;
};

export const LaserSmallInvader = function (x, y) {
  LaserInvaders.call(this, x, y);
};
LaserSmallInvader.prototype = Object.create(LaserInvaders.prototype);
LaserSmallInvader.prototype.render = function () {
  ctx.lineWidth = 2;
  ctx.strokeStyle = this.color;
  ctx.beginPath();
  ctx.moveTo(this.x + 1, this.y);
  ctx.lineTo(this.x - 1, this.y + 3.75);
  ctx.lineTo(this.x + 1, this.y + 7.5);
  ctx.lineTo(this.x - 1, this.y + 11.25);
  ctx.lineTo(this.x + 1, this.y + 15);
  ctx.stroke();
};

export const LaserMediumInvader = function (x, y) {
  LaserInvaders.call(this, x, y);
};
LaserMediumInvader.prototype = Object.create(LaserInvaders.prototype);
LaserMediumInvader.prototype.render = function () {
  ctx.fillStyle = this.color;
  ctx.fillRect(this.x - 0.75, this.y, this.width / 2, this.height - 3);
  ctx.beginPath();
  ctx.moveTo(this.x - 3, this.y + 10);
  ctx.lineTo(this.x + 3, this.y + 10);
  ctx.lineTo(this.x + 0, this.y + 15);
  ctx.fillStyle = this.color;
  ctx.fill();
};

export const LaserLargeInvader = function (x, y) {
  LaserInvaders.call(this, x, y);
};
LaserLargeInvader.prototype = Object.create(LaserInvaders.prototype);
LaserLargeInvader.prototype.render = function () {
  ctx.strokeStyle = this.color;
  ctx.beginPath();
  ctx.moveTo(this.x - 1.5, this.y);
  ctx.lineTo(this.x + 1.5, this.y + 5);
  ctx.lineTo(this.x - 1.5, this.y + 10);
  ctx.lineTo(this.x + 1.5, this.y + 15);
  ctx.stroke();
};

export const LaserUfoInvader = function (x, y) {
  LaserInvaders.call(this, x, y);
};
LaserUfoInvader.prototype = Object.create(LaserInvaders.prototype);
LaserUfoInvader.prototype.render = function () {
  ctx.fillStyle = this.color;
  ctx.fillRect(this.x, this.y, this.width / 2, this.height);
  ctx.fillRect(this.x - 3.5, this.y, this.width + 6, this.width / 2);
};

export const BaseShelter = function (x, y) {
  ObjectGame.call(this, x, y);
  this.currentMap = 0;
};
BaseShelter.prototype = Object.create(ObjectGame.prototype);
