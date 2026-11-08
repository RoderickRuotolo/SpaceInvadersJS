import { LaserInvaders } from '../invaders.js';

export const ALIEN_SHOT_INTERVAL_MS = 900;
export const MAX_ALIEN_PROJECTILES = 3;

export const updateAlienProjectiles = (state, deltaMs, screenHeight, random = Math.random) => {
  state.laserInvaders = state.laserInvaders.filter((shot) => {
    if (!shot.isAlive) return false;
    shot.previousY = shot.y;
    shot.move();
    return shot.y < screenHeight;
  });

  state.alienShotElapsedMs += deltaMs;
  if (state.alienShotElapsedMs < ALIEN_SHOT_INTERVAL_MS) return;
  state.alienShotElapsedMs %= ALIEN_SHOT_INTERVAL_MS;
  if (state.laserInvaders.length >= MAX_ALIEN_PROJECTILES) return;

  // Pick the lowest living invader in each original formation column.
  const shooters = [];
  for (const row of state.alienInvaders) {
    row.forEach((invader, column) => {
      if (invader.isAlive && (!shooters[column] || invader.y > shooters[column].y)) {
        shooters[column] = invader;
      }
    });
  }
  const candidates = shooters.filter(Boolean);
  if (!candidates.length) return;
  const shooter = candidates[Math.floor(random() * candidates.length)];
  const shot = new LaserInvaders(shooter.x + shooter.width / 2, shooter.y + shooter.height + 10);
  shot.velocity = 6;
  state.laserInvaders.push(shot);
};

export const renderAlienProjectiles = (state) => {
  for (const shot of state.laserInvaders) {
    if (shot.isAlive) shot.render();
  }
};
