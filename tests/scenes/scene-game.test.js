import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Definitions } from '../../js/config.js';
import { setCanvasContext } from '../../js/context.js';
import { LaserCannon } from '../../js/invaders.js';
import * as runtimeModule from '../../js/runtime-state.js';
import { SceneGame, ScenesManager } from '../../js/scenes.js';
import { createPlayer, createSession } from '../../js/session.js';

describe('SceneGame outcomes', () => {
  let runtime;
  let session;
  let game;
  let manager;
  let listeners;
  let winners;
  let losers;

  beforeEach(() => {
    listeners = new Set();
    vi.stubGlobal('window', {
      addEventListener: vi.fn((type, listener) => listeners.add(listener)),
      removeEventListener: vi.fn((type, listener) => listeners.delete(listener)),
    });
    vi.stubGlobal('createjs', undefined);
    setCanvasContext({ width: 750, height: 680 }, {});
    runtime = runtimeModule.createGameRuntime();
    vi.spyOn(runtimeModule, 'createGameRuntime').mockReturnValue(runtime);
    session = createSession(Definitions);
    session.includePlayers(createPlayer());
    session.includePlayers(createPlayer());
    game = new SceneGame(session);
    const makeScene = () => ({ enter: vi.fn(), exit: vi.fn() });
    winners = makeScene();
    losers = makeScene();
    manager = new ScenesManager([makeScene(), makeScene(), game, winners, losers]);
    manager.changeScene(2);
  });

  afterEach(() => {
    manager.stop();
    setCanvasContext(null, null);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const killFormation = (runtime) => {
    for (const invader of runtime.alienInvaders.flat()) invader.isAlive = 0;
  };

  it('does not win during the intro while the formation is not initialized', () => {
    game.update(1000);
    expect(manager.currentScene).toBe(2);
    expect(runtime.alienInvaders).toHaveLength(0);
    game.update(1000);
    game.update(60);
    expect(manager.currentScene).toBe(2);
  });

  it('wins with all standard invaders dead even when the UFO is alive, and removes controls', () => {
    game.update(2000);
    killFormation(runtime);
    expect(runtime.ufo[0].isAlive).toBe(1);
    game.update(60);
    expect(manager.currentScene).toBe(3);
    expect(manager.won).toBe(true);
    expect(session.players[0].won).toBe(true);
    expect(runtime.stageIsOver).toBe(true);
    expect(listeners.size).toBe(0);
    game.update(60);
    expect(winners.enter).toHaveBeenCalledTimes(1);
  });

  it('scores the last hit before transitioning to victory in the same update', () => {
    game.update(2000);
    killFormation(runtime);
    const lastInvader = runtime.alienInvaders[0][0];
    lastInvader.isAlive = 1;
    const shot = new LaserCannon(lastInvader.x, lastInvader.y + 40);
    runtime.laserCannon.push(shot);
    game.update(60);
    expect(lastInvader.isAlive).toBe(0);
    expect(session.players[0].score).toBe(lastInvader.points);
    expect(manager.currentScene).toBe(3);
  });

  it.each([0, -1])('loses with %i lives and overrides a previous winning result', (lives) => {
    game.update(2000);
    manager.won = true;
    session.players[0].lives = lives;
    killFormation(runtime);
    game.update(60);
    expect(manager.currentScene).toBe(4);
    expect(manager.won).toBe(false);
    expect(session.players[0].won).toBe(false);
    expect(losers.enter).toHaveBeenCalledTimes(1);
    expect(listeners.size).toBe(0);
  });

  it('loses when the bottom of a living invader reaches the cannon height, regardless of x', () => {
    game.update(2000);
    const invader = runtime.alienInvaders[4][10];
    invader.y = runtime.cannon.y - invader.height;
    expect(invader.x).toBeGreaterThan(runtime.cannon.x + runtime.cannon.width);
    game.update(60);
    expect(manager.currentScene).toBe(4);
  });

  it('ignores dead invaders at the boundary and continues while a living invader remains above it', () => {
    game.update(2000);
    const invader = runtime.alienInvaders[4][0];
    invader.isAlive = 0;
    invader.y = runtime.cannon.y;
    const alive = runtime.alienInvaders[4][1];
    alive.y = runtime.cannon.y - alive.height - 1;
    game.update(60);
    expect(manager.currentScene).toBe(2);
  });

  it('detects defeat in the update where the formation descends across the boundary', () => {
    game.update(2000);
    for (let tick = 0; tick < 28; tick += 1) game.update(60);
    runtime.currentLineInvaders = 4;
    runtime.directionInvaders = 1;
    runtime.alienInvaders[0][10].x = 750 - 59;
    const invader = runtime.alienInvaders[4][0];
    invader.y = runtime.cannon.y - invader.height - 1;
    game.update(60);
    expect(invader.y + invader.height).toBeGreaterThan(runtime.cannon.y);
    expect(manager.currentScene).toBe(4);
  });
});
