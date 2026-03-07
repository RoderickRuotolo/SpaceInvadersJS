export const ensureProjectileState = (stageState) => {
  if (!stageState.laserCannon) {
    stageState.laserCannon = [];
  }
  if (!stageState.shotEffects) {
    stageState.shotEffects = [];
  }
};

export const arePlayerProjectilesInactive = (stageState) => {
  ensureProjectileState(stageState);

  for (let i = 0; i < stageState.laserCannon.length; i += 1) {
    if (stageState.laserCannon[i].isAlive) {
      return false;
    }
  }
  return true;
};

export const updatePlayerProjectiles = (stageState) => {
  ensureProjectileState(stageState);

  for (let i = 0; i < stageState.laserCannon.length; i += 1) {
    const projectile = stageState.laserCannon[i];

    if (projectile.isAlive === 1) {
      projectile.move();

      if (projectile.y < 0) {
        stageState.shotEffects.push({ x: projectile.x, y: 3, w: 20, h: 10, life: 3 });
        projectile.isAlive = 0;
      }
    }
  }
};

export const renderPlayerProjectiles = (stageState) => {
  ensureProjectileState(stageState);

  for (let i = 0; i < stageState.laserCannon.length; i += 1) {
    const projectile = stageState.laserCannon[i];
    if (projectile.isAlive === 1) {
      projectile.render();
    }
  }
};
