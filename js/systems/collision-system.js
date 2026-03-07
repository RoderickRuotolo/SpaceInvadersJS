export const resolvePlayerProjectileCollisions = (stageState) => {
  const events = [];

  if (!stageState.laserCannon || !stageState.alienInvaders || !stageState.ufo) {
    return events;
  }

  for (let i = 0; i < stageState.laserCannon.length; i += 1) {
    const projectile = stageState.laserCannon[i];

    if (projectile.isAlive !== 1) {
      continue;
    }

    for (let j = 0; j < stageState.alienInvaders.length; j += 1) {
      for (let k = 0; k < stageState.alienInvaders[j].length; k += 1) {
        const invader = stageState.alienInvaders[j][k];

        if (projectile.isAlive === 1 && invader.isAlive === 1) {
          if (projectile.collisionWasDetected(invader)) {
            invader.currentMap = 2;
            invader.isAlive = 0;
            projectile.isAlive = 0;

            events.push({
              type: 'alienHit',
              points: invader.points,
            });
          }
        }
      }
    }

    for (let u = 0; u < stageState.ufo.length; u += 1) {
      const ufo = stageState.ufo[u];

      if (projectile.isAlive === 1 && ufo.isAlive === 1) {
        if (projectile.collisionWasDetected(ufo)) {
          ufo.currentMap = 2;
          ufo.isAlive = 0;
          projectile.isAlive = 0;

          events.push({
            type: 'ufoHit',
            points: ufo.points,
            textX: ufo.x + ufo.width * 0.3,
            textY: ufo.y + ufo.height * 1.05,
          });
        }
      }
    }
  }

  return events;
};
