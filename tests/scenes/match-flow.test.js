import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Definitions } from '../../js/config.js';
import { setCanvasContext } from '../../js/context.js';
import * as runtimeModule from '../../js/runtime-state.js';
import {
  SceneGame,
  SceneInstructions,
  SceneLoser,
  SceneMenu,
  ScenesManager,
  SceneWinner,
} from '../../js/scenes.js';
import { createPlayer, createSession } from '../../js/session.js';

const makeRuntime = runtimeModule.createGameRuntime;

describe('Repeated match flow', () => {
  let manager;
  let session;
  let listeners;
  let runtimes;
  const press = (keyCode = 13, repeat = false) => {
    for (const listener of [...listeners]) listener({ keyCode, repeat });
  };

  beforeEach(() => {
    listeners = new Set();
    runtimes = [];
    let frameId = 0;
    vi.stubGlobal('window', {
      addEventListener: vi.fn((type, listener) => listeners.add(listener)),
      removeEventListener: vi.fn((type, listener) => listeners.delete(listener)),
      requestAnimationFrame: vi.fn(() => ++frameId),
      cancelAnimationFrame: vi.fn(),
    });
    vi.stubGlobal('createjs', undefined);
    setCanvasContext({ width: 750, height: 680 }, { fillRect: vi.fn(), fillText: vi.fn() });
    vi.spyOn(runtimeModule, 'createGameRuntime').mockImplementation(() => {
      const state = makeRuntime();
      runtimes.push(state);
      return state;
    });
    session = createSession(Definitions);
    session.includePlayers(createPlayer());
    session.includePlayers(createPlayer());
    manager = new ScenesManager([
      new SceneMenu(session),
      new SceneInstructions(session),
      new SceneGame(session),
      new SceneWinner(session),
      new SceneLoser(session),
    ]);
    manager.changeScene(0);
  });

  afterEach(() => {
    manager.stop();
    setCanvasContext(null, null);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each([true, false])(
    'plays three matches through real scenes without stale state (won=%s)',
    (won) => {
      const players = [...session.players];
      let previousState;
      for (let match = 0; match < 3; match += 1) {
        expect(listeners.size).toBe(1);
        press(13, true);
        expect(manager.currentScene).toBe(0);
        press();
        expect(manager.currentScene).toBe(1);
        expect(listeners.size).toBe(0);
        for (let player = 0; player < 2; player += 1) {
          expect(session.players[player]).toBe(players[player]);
          expect(session.players[player]).toMatchObject({
            score: 0,
            lives: 4,
            isAlive: true,
            won: false,
          });
        }
        manager.activeScene.update(10000);
        expect(manager.currentScene).toBe(2);
        const state = runtimes.at(-1);
        expect(state).not.toBe(previousState);
        expect(state.cannon).toBe(null);
        expect(state.alienInvaders).toEqual([]);
        manager.activeScene.update(1999);
        expect(state.cannon).toBe(null);
        manager.activeScene.update(1);
        expect(state.cannon).toMatchObject({ x: 50, y: 580, isAlive: 1, currentMap: 0 });
        expect(state.ufo[0]).toMatchObject({ x: 50, y: 90, isAlive: 1 });
        expect(state.alienInvaders.flat()).toHaveLength(55);
        expect(state.alienInvaders.flat().every((alien) => alien.isAlive === 1)).toBe(true);
        expect(
          state.barriers.every((barrier) => barrier.segments.every((cell) => cell.isAlive))
        ).toBe(true);
        for (const key of ['laserCannon', 'laserInvaders', 'shotEffects', 'scorePopups'])
          expect(state[key]).toEqual([]);
        expect(state).toMatchObject({
          alienShotElapsedMs: 0,
          playerDeathRemainingMs: 0,
          playerInvulnerableMs: 0,
          stageIsOver: false,
        });
        manager.activeScene.update(60);
        expect(state.alienInvaders[4][0].x).toBe(100);
        expect(state.alienInvaders[4][0].y).toBe(320);
        // Finish the reveal so the next match must also reset its mask and count.
        for (let tick = 0; tick < 28; tick += 1) manager.activeScene.update(60);
        state.cannon.x = 300;
        state.ufo[0].x = 400;
        state.barriers[0].segments[0].isAlive = false;
        state.laserCannon.push({ isAlive: 1 });
        state.laserInvaders.push({ isAlive: 1 });
        state.shotEffects.push({ life: 99 });
        state.scorePopups.push({ life: 99 });
        state.alienShotElapsedMs = 899;
        state.playerInvulnerableMs = 1200;
        session.players[0].score = 6000 + match;
        session.players[1].score = 100;
        if (won) {
          for (const alien of state.alienInvaders.flat()) alien.isAlive = 0;
        } else {
          session.players[0].lives = 0;
          session.players[0].isAlive = false;
        }
        manager.activeScene.update(60);
        expect(manager.currentScene).toBe(won ? 3 : 4);
        expect(listeners.size).toBe(1);
        manager.activeScene.render();
        const resultListener = [...listeners][0];
        press(13, true);
        press(32);
        expect(manager.currentScene).toBe(won ? 3 : 4);
        press();
        expect(manager.currentScene).toBe(0);
        expect(manager.won).toBe(false);
        expect(listeners.size).toBe(1);
        expect(session.players[0].score).toBe(6000 + match);
        // A removed result listener cannot act on a later scene.
        const change = vi.spyOn(manager, 'changeScene');
        resultListener({ keyCode: 13 });
        expect(change).not.toHaveBeenCalled();
        change.mockRestore();
        previousState = state;
      }
      press();
      expect(session.hiScore).toBe(6002);
      expect(session.players[0].score).toBe(0);
      expect(window.cancelAnimationFrame).toHaveBeenCalled();
    }
  );
});
