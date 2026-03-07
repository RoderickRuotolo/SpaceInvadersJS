export const createSession = (definitions) => ({
  players: [],
  definitions,
  hiScore: 5000,
  includePlayers(player) {
    this.players.push(player);
  },
});

export const createPlayer = () => ({
  won: false,
  score: 0,
  isAlive: true,
  lives: 4,
  killed() {
    this.lives -= 1;

    if (this.lives === 0) {
      this.isAlive = false;
    }
  },
});
