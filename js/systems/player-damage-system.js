import { SoundsManager } from '../sounds-manager.js';

export const PLAYER_DEATH_MS = 900;
export const PLAYER_INVULNERABLE_MS = 1200;

export const resolvePlayerDamage = (state, player) => {
  if (state.playerDeathRemainingMs > 0 || state.playerInvulnerableMs > 0 || player.lives <= 0) {
    return false;
  }
  const hit = state.laserInvaders.some(
    (shot) => shot.isAlive && shot.collisionWasDetected(state.cannon)
  );
  if (!hit) return false;

  player.killed();
  state.cannon.isAlive = 0;
  state.cannon.currentMap = 2;
  state.playerDeathRemainingMs = PLAYER_DEATH_MS;
  state.laserInvaders = [];
  state.laserCannon = [];
  state.alienShotElapsedMs = 0;
  SoundsManager.playSound('explosion');
  return true;
};

// Freeze gameplay while the explosion is visible, including on the last life.
export const updatePlayerRecovery = (state, player, deltaMs) => {
  state.playerInvulnerableMs = Math.max(0, state.playerInvulnerableMs - deltaMs);
  if (state.playerDeathRemainingMs <= 0) return;
  state.playerDeathRemainingMs = Math.max(0, state.playerDeathRemainingMs - deltaMs);
  if (state.playerDeathRemainingMs === 0 && player.lives > 0) {
    state.cannon.x = 50;
    state.cannon.isAlive = 1;
    state.cannon.currentMap = 0;
    state.playerInvulnerableMs = PLAYER_INVULNERABLE_MS;
  }
};
