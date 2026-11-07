// Defeat takes precedence if the player runs out of lives on the winning tick.
// The UFO is a bonus target and does not prevent victory.
export const getGameOutcome = (stageState, player) => {
  if (player.lives <= 0) return 'lost';

  const livingInvaders = stageState.alienInvaders.flat().filter((invader) => invader.isAlive);
  if (livingInvaders.some((invader) => invader.y + invader.height >= stageState.cannon.y)) {
    return 'lost';
  }

  return livingInvaders.length === 0 ? 'won' : null;
};
