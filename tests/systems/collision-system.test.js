import { describe, expect, it } from 'vitest';
import { resolvePlayerProjectileCollisions } from '../../js/systems/collision-system.js';

describe('resolvePlayerProjectileCollisions', () => {
  it('returns an alienHit event and kills alien/projectile on collision', () => {
    const projectile = {
      isAlive: 1,
      collisionWasDetected: () => true,
    };

    const alien = {
      isAlive: 1,
      currentMap: 0,
      points: 20,
    };

    const stageState = {
      laserCannon: [projectile],
      alienInvaders: [[alien]],
      ufo: [],
    };

    const events = resolvePlayerProjectileCollisions(stageState);

    expect(events).toEqual([{ type: 'alienHit', points: 20 }]);
    expect(projectile.isAlive).toBe(0);
    expect(alien.isAlive).toBe(0);
    expect(alien.currentMap).toBe(2);
  });

  it('returns an ufoHit event with popup coordinates on collision', () => {
    const projectile = {
      isAlive: 1,
      collisionWasDetected: () => true,
    };

    const ufo = {
      x: 10,
      y: 20,
      width: 30,
      height: 40,
      points: 150,
      isAlive: 1,
      currentMap: 0,
    };

    const stageState = {
      laserCannon: [projectile],
      alienInvaders: [],
      ufo: [ufo],
    };

    const events = resolvePlayerProjectileCollisions(stageState);

    expect(events).toEqual([
      {
        type: 'ufoHit',
        points: 150,
        textX: 19,
        textY: 62,
      },
    ]);
    expect(projectile.isAlive).toBe(0);
    expect(ufo.isAlive).toBe(0);
    expect(ufo.currentMap).toBe(2);
  });
});
