/**
 * Draw Functions
 * @author Rodrigo Ruotolo <roderickruotolo@gmail.com>
 */

import { cv } from './context.js';

/**
 * @description Clear screen from stage with color previouly defined
 */
export const clearScreen = (canvas, context, color) => {
  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);
};

/**
 * @description Draw Ellipse on canvas
 */
export const drawEllipse = (context, x, y, w, h) => {
  const kappa = 0.5522848;
  const ox = (w / 2) * kappa;
  const oy = (h / 2) * kappa;
  const xe = x + w;
  const ye = y + h;
  const xm = x + w / 2;
  const ym = y + h / 2;

  context.beginPath();
  context.moveTo(x, ym);
  context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  context.fill();
};

/**
 * @description Draw Ellipse Centralized
 */
export const drawEllipseByCenter = (context, cx, cy, w, h) => {
  drawEllipse(context, cx - w / 2.0, cy - h / 2.0, w, h);
};

/**
 * @description Draw Score
 */
export const drawHeader = (context, config, player1, player2, hiScore) => {
  const score = String(player1.score);

  context.fillStyle = config.primaryColor;
  context.font = config.fontProperties;

  context.fillText('SCORE<1>', 20, 30);
  context.fillText(score.padStart(4, '0'), 40, 60);

  context.fillText('HI-SCORE', 310, 30);
  context.fillText(hiScore, 340, 60);

  context.fillText('SCORE<2>', 600, 30);
  context.fillText(score.padStart(4, '0'), 625, 60);
  void player2;
};

/**
 * @description Used only on first scene
 */
export const drawTextMenu = (context, config) => {
  context.fillStyle = config.primaryColor;
  context.font = config.fontProperties;
  context.fillText('Press   Enter   KEY', 250, 300);
  context.fillText('<1 OR 2 PLAYERS>', 270, 350);
};

/**
 * @description Draw footer
 */
export const drawFooter = (context, config) => {
  context.fillStyle = config.primaryColor;
  context.font = config.fontProperties;
  context.fillText('CREDIT 00', 550, 670);
};

/**
 * @description Special animation on Instruction Scene
 */
export const typeWriter = (context, config, text, x, y, callback) => {
  const total = text.length;
  let counter = 0;
  const spaceLetter = 14;
  const stepMs = 60;
  let rafId = null;
  let lastTimestamp = 0;
  let accumulatedMs = 0;
  let isCancelled = false;

  const complete = () => {
    if (isCancelled) {
      return;
    }
    if (callback !== null && callback !== undefined) {
      callback();
    }
  };

  const drawNextChar = () => {
    context.fillStyle = config.primaryColor;
    context.fillText(text[counter], x + counter * spaceLetter, y);
    counter += 1;

    if (counter >= total) {
      console.log(`String digitada, animação finalizada! ${new Date()}`);
      return true;
    }
    return false;
  };

  const animate = (timestamp) => {
    if (isCancelled) {
      return;
    }

    if (lastTimestamp === 0) {
      lastTimestamp = timestamp;
    }

    const deltaMs = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    accumulatedMs += deltaMs;

    while (accumulatedMs >= stepMs && counter < total) {
      const finished = drawNextChar();
      accumulatedMs -= stepMs;
      if (finished) {
        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
        }
        complete();
        return;
      }
    }

    rafId = window.requestAnimationFrame(animate);
  };

  rafId = window.requestAnimationFrame(animate);

  return () => {
    isCancelled = true;
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
};

/**
 * @description Special animation on Instruction Scene
 */
export const turnThePage = (context, config, direction, callback) => {
  let count = 0;
  let intDirection = 1;
  const velocity = 6;
  const stepMs = 50;
  let rafId = null;
  let lastTimestamp = 0;
  let accumulatedMs = 0;
  let isCancelled = false;

  if (direction === 'left') {
    intDirection *= -1;
  }

  const complete = () => {
    if (isCancelled) {
      return;
    }
    if (callback !== null && callback !== undefined) {
      callback();
    }
  };

  const drawStep = () => {
    context.fillStyle = config.backgroundColor;
    context.fillRect(40, 180, 40 + 5 * intDirection + count, 350);

    if (direction === 'left' && count <= 0) {
      return true;
    }
    if (direction === 'right' && count > cv.width - 60) {
      console.log(`Página virada ${new Date()}`);
      return true;
    }
    count += velocity;
    return false;
  };

  const animate = (timestamp) => {
    if (isCancelled) {
      return;
    }

    if (lastTimestamp === 0) {
      lastTimestamp = timestamp;
    }

    const deltaMs = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    accumulatedMs += deltaMs;

    while (accumulatedMs >= stepMs) {
      const finished = drawStep();
      accumulatedMs -= stepMs;
      if (finished) {
        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
        }
        complete();
        return;
      }
    }

    rafId = window.requestAnimationFrame(animate);
  };

  rafId = window.requestAnimationFrame(animate);

  return () => {
    isCancelled = true;
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
};

if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength, padString) {
    targetLength >>= 0;
    padString = String(typeof padString !== 'undefined' ? padString : ' ');
    if (this.length > targetLength) {
      return String(this);
    }

    targetLength -= this.length;
    if (targetLength > padString.length) {
      padString += padString.repeat(targetLength / padString.length);
    }
    return padString.slice(0, targetLength) + String(this);
  };
}
