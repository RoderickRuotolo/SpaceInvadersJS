import { describe, expect, it, vi } from 'vitest';
import { createGameRuntime } from '../../js/runtime-state.js';
import { LaserInvaders } from '../../js/invaders.js';
import {
  updateAlienProjectiles,
  renderAlienProjectiles,
} from '../../js/systems/alien-shooting-system.js';

const alien = (x, y, isAlive = 1) => ({ x, y, width: 30, height: 30, isAlive });

describe('Alien shooting', () => {
  it('waits for its cadence and selects only the lowest living invader in a column', () => {
    const state = createGameRuntime();
    state.alienInvaders = [[alien(10, 100)], [alien(10, 200)], [alien(10, 300, 0)]];
    updateAlienProjectiles(state, 899, 680, () => 0);
    expect(state.laserInvaders).toHaveLength(0);
    updateAlienProjectiles(state, 1, 680, () => 0);
    expect(state.laserInvaders).toHaveLength(1);
    expect(state.laserInvaders[0]).toMatchObject({ x: 25, y: 230, velocity: 6 });
    updateAlienProjectiles(state, 60, 680);
    expect(state.laserInvaders[0].y).toBe(236);
  });

  it('limits active shots and removes dead and off-screen shots', () => {
    const state = createGameRuntime();
    state.alienInvaders = [[alien(10, 100)]];
    for (let tick = 0; tick < 8; tick += 1) updateAlienProjectiles(state, 900, 680, () => 0);
    expect(state.laserInvaders).toHaveLength(3);
    state.laserInvaders[0].isAlive = 0;
    state.laserInvaders[1].y = 679;
    updateAlienProjectiles(state, 60, 680);
    expect(state.laserInvaders).toHaveLength(1);
  });

  it('does not shoot from an eliminated formation and renders only living shots', () => {
    const state = createGameRuntime();
    state.alienInvaders = [[alien(10, 100, 0)]];
    updateAlienProjectiles(state, 900, 680);
    expect(state.laserInvaders).toHaveLength(0);
    const shot = new LaserInvaders(10, 20);
    shot.render = vi.fn();
    state.laserInvaders.push(shot);
    renderAlienProjectiles(state);
    expect(shot.render).toHaveBeenCalledTimes(1);
    shot.isAlive = 0;
    renderAlienProjectiles(state);
    expect(shot.render).toHaveBeenCalledTimes(1);
  });
});
