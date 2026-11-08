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
    this.lives = Math.max(0, this.lives - 1);

    if (this.lives === 0) {
      this.isAlive = false;
    }
  },
});

// Preserve player references and the session record; reset only match state.
export const resetMatch = (session) => {
  session.hiScore = Math.max(session.hiScore, ...session.players.map((player) => player.score));
  for (const player of session.players) Object.assign(player, createPlayer());
};
