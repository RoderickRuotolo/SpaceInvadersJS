import { ctx } from './context.js';
import { LargeInvader, MediumInvader, SmallInvader } from './invaders.js';

/**
 * @return Invader[][]
 */
export const createSpaceInvaders = () => {
  const alienInvaders = [];

  for (let i = 0; i < 5; i += 1) {
    alienInvaders[i] = [];
  }

  for (let i = 0; i < 11; i += 1) {
    alienInvaders[0][i] = new SmallInvader(100 + 50 * i, 160);
    alienInvaders[1][i] = new MediumInvader(100 + 50 * i, 200);
    alienInvaders[2][i] = new MediumInvader(100 + 50 * i, 240);
    alienInvaders[3][i] = new LargeInvader(100 + 50 * i, 280);
    alienInvaders[4][i] = new LargeInvader(100 + 50 * i, 320);
  }

  return alienInvaders;
};

export const createSpaceInvadersMask = (alienInvaders) => ({
  aliens: alienInvaders,
  masks: [],
  totalMasks: 0,
  animatedFinished: false,
  create() {
    for (let i = 0; i < this.aliens.length; i += 1) {
      for (let j = 0; j < this.aliens[i].length; j += 1) {
        this.masks.push({
          x: this.aliens[i][j].x,
          y: this.aliens[i][j].y,
          w: this.aliens[i][j].width,
          h: this.aliens[i][j].height,
        });
      }
    }
    this.totalMasks = this.masks.length - 1;
  },
  render() {
    if (this.totalMasks > 0) {
      ctx.fillStyle = '#000000';
      for (let i = 0; i < this.totalMasks; i += 1) {
        ctx.fillRect(this.masks[i].x, this.masks[i].y, 40, 40);
      }
    }
  },
  remove() {
    this.totalMasks -= 1;
  },
  step(removalsPerTick = 2) {
    if (this.totalMasks > 0) {
      for (let i = 0; i < removalsPerTick; i += 1) {
        this.remove();
        if (this.totalMasks <= 0) {
          this.totalMasks = 0;
          break;
        }
      }
    } else {
      this.animatedFinished = true;
    }

    if (this.totalMasks <= 0) {
      this.animatedFinished = true;
    }
  },
  run() {
    this.step(2);
    this.render();
  },
});
