export const createSession = (definitions) => ({
  players: [],
  definitions,
  hiScore: 5000,
  playerCount: 1,
  activePlayerIndex: 0,
  matchIsOver: false,
  includePlayers(player) {
    this.players.push(player);
  },
});

export const createPlayer = () => ({
  won: false,
  score: 0,
  isAlive: true,
  lives: 4,
  turnFinished: false,
  killed() {
    this.lives = Math.max(0, this.lives - 1);

    if (this.lives === 0) {
      this.isAlive = false;
    }
  },
});

// Preserve player references and the session record; reset only match state.
export const resetMatch = (session, playerCount = session.playerCount) => {
  session.hiScore = Math.max(session.hiScore, ...session.players.map((player) => player.score));
  for (const player of session.players) Object.assign(player, createPlayer());
  session.playerCount = playerCount === 2 && session.players.length >= 2 ? 2 : 1;
  session.activePlayerIndex = 0;
  session.matchIsOver = false;
};

export const getActivePlayer = (session) => session.players[session.activePlayerIndex ?? 0];

// A turn lasts until that player clears the formation or loses the game.
// Individual deaths with lives remaining do not switch players.
export const finishPlayerTurn = (session, won) => {
  const player = getActivePlayer(session);
  if (session.matchIsOver || player.turnFinished) return false;
  player.won = won;
  player.turnFinished = true;
  session.hiScore = Math.max(session.hiScore, player.score);
  if (session.activePlayerIndex + 1 < session.playerCount) {
    session.activePlayerIndex += 1;
    return true;
  }
  session.matchIsOver = true;
  return false;
};

// Multiplayer standings are determined by score, regardless of stage clearance.
export const getMatchWinner = (session) => {
  if (session.players[0].score === session.players[1].score) return null;
  return session.players[0].score > session.players[1].score ? 0 : 1;
};
