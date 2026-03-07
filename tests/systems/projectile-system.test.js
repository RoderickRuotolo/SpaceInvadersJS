import { describe, expect, it, vi } from 'vitest';
import {
  arePlayerProjectilesInactive,
  ensureProjectileState,
  renderPlayerProjectiles,
  updatePlayerProjectiles,
} from '../../js/systems/projectile-system.js';

describe('projectile-system', () => {
  it('initializes projectile containers when missing', () => {
    const stageState = {};

    ensureProjectileState(stageState);

    expect(stageState.laserCannon).toEqual([]);
    expect(stageState.shotEffects).toEqual([]);
  });

  it('detects if any projectile is still active', () => {
    const stageState = {
      laserCannon: [{ isAlive: 0 }, { isAlive: 1 }],
      shotEffects: [],
    };

    expect(arePlayerProjectilesInactive(stageState)).toBe(false);
  });

  it('updates live projectiles and creates top-hit effect when leaving screen', () => {
    const move = vi.fn(function move() {
      this.y -= 20;
    });

    const stageState = {
      laserCannon: [{ x: 10, y: 5, isAlive: 1, move }],
      shotEffects: [],
    };

    updatePlayerProjectiles(stageState);

    expect(move).toHaveBeenCalledTimes(1);
    expect(stageState.laserCannon[0].isAlive).toBe(0);
    expect(stageState.shotEffects).toEqual([{ x: 10, y: 3, w: 20, h: 10, life: 3 }]);
  });

  it('renders only live projectiles', () => {
    const renderAlive = vi.fn();
    const renderDead = vi.fn();

    const stageState = {
      laserCannon: [
        { isAlive: 1, render: renderAlive },
        { isAlive: 0, render: renderDead },
      ],
      shotEffects: [],
    };

    renderPlayerProjectiles(stageState);

    expect(renderAlive).toHaveBeenCalledTimes(1);
    expect(renderDead).not.toHaveBeenCalled();
  });
});
