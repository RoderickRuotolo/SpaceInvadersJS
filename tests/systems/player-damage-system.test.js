import { afterEach, describe, expect, it, vi } from 'vitest';
import { CoreCannon, LaserInvaders } from '../../js/invaders.js';
import { createGameRuntime } from '../../js/runtime-state.js';
import { createPlayer } from '../../js/session.js';
import {
  resolvePlayerDamage,
  updatePlayerRecovery,
  PLAYER_DEATH_MS,
  PLAYER_INVULNERABLE_MS,
} from '../../js/systems/player-damage-system.js';

afterEach(() => vi.unstubAllGlobals());

const setup = () => {
  vi.stubGlobal('createjs', undefined);
  const state = createGameRuntime();
  state.cannon = new CoreCannon(100, 580);
  state.laserInvaders.push(new LaserInvaders(110, 590), new LaserInvaders(120, 590));
  return { state, player: createPlayer() };
};

describe('Player damage and recovery', () => {
  it('deducts only one life for simultaneous hits, shows an explosion and clears projectiles', () => {
    const { state, player } = setup();
    state.laserCannon.push({});
    expect(resolvePlayerDamage(state, player)).toBe(true);
    expect(player.lives).toBe(3);
    expect(player.isAlive).toBe(true);
    expect(state.cannon).toMatchObject({ isAlive: 0, currentMap: 2 });
    expect(state.laserCannon).toHaveLength(0);
    expect(state.laserInvaders).toHaveLength(0);
    expect(resolvePlayerDamage(state, player)).toBe(false);
  });

  it('respawns only after the delay and protects the player until invulnerability expires', () => {
    const { state, player } = setup();
    player.score = 100;
    resolvePlayerDamage(state, player);
    updatePlayerRecovery(state, player, PLAYER_DEATH_MS - 1);
    expect(state.cannon.isAlive).toBe(0);
    updatePlayerRecovery(state, player, 1);
    expect(state.cannon).toMatchObject({ x: 50, isAlive: 1, currentMap: 0 });
    expect(player.score).toBe(100);
    state.laserInvaders.push(new LaserInvaders(60, 590));
    expect(resolvePlayerDamage(state, player)).toBe(false);
    updatePlayerRecovery(state, player, PLAYER_INVULNERABLE_MS);
    expect(resolvePlayerDamage(state, player)).toBe(true);
    expect(player.lives).toBe(2);
  });

  it('does not respawn after the last life or allow negative lives', () => {
    const { state, player } = setup();
    player.lives = 1;
    resolvePlayerDamage(state, player);
    updatePlayerRecovery(state, player, PLAYER_DEATH_MS);
    expect(player).toMatchObject({ lives: 0, isAlive: false });
    expect(state.cannon.isAlive).toBe(0);
    player.killed();
    expect(player.lives).toBe(0);
  });

  it('does not damage the player when a shot misses', () => {
    const { state, player } = setup();
    state.laserInvaders = [new LaserInvaders(500, 590)];
    expect(resolvePlayerDamage(state, player)).toBe(false);
    expect(player.lives).toBe(4);
  });
});
