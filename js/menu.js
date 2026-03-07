import { ctx } from './context.js';
import { Definitions } from './config.js';

export const Menu = {
  option: 1,
  players: 1,
  altOption() {
    if (this.option === 1) {
      this.option = 2;
      this.drawTwoPlayers();
    } else if (this.option === 2) {
      this.option = 1;
      this.drawOnePlayer();
    }
  },
  drawOnePlayer() {
    this.players = 1;
    ctx.fillStyle = Definitions.secondaryColor;
    ctx.fillText('* 1 PLAYER', 290, 400);
    ctx.fillStyle = Definitions.primaryColor;
    ctx.fillText('* 2 PLAYERS', 290, 450);
  },
  drawTwoPlayers() {
    this.players = 2;
    ctx.fillStyle = Definitions.primaryColor;
    ctx.fillText('* 1 PLAYER', 290, 400);
    ctx.fillStyle = Definitions.secondaryColor;
    ctx.fillText('* 2 PLAYERS', 290, 450);
  },
};
