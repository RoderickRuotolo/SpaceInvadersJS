import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Definitions } from '../../js/config.js';
import { setCanvasContext } from '../../js/context.js';
import { LaserCannon, LaserInvaders } from '../../js/invaders.js';
import { Menu } from '../../js/menu.js';
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

describe('Alternating two-player flow', () => {
  let manager;
  let session;
  let listeners;
  let runtimes;
  let textDraws;
  const press = (keyCode = 13) => {
    for (const listener of [...listeners]) listener({ keyCode });
  };
  const currentRuntime = () => runtimes.at(-1);
  const startMatch = () => {
    press(40);
    expect(Menu.option).toBe(2);
    press();
    expect(session.playerCount).toBe(2);
    manager.activeScene.update(10000);
    expect(manager.currentScene).toBe(2);
    manager.activeScene.update(2000);
  };
  const endTurn = (won) => {
    if (won) {
      for (const alien of currentRuntime().alienInvaders.flat()) alien.isAlive = 0;
    } else {
      const player = session.players[session.activePlayerIndex];
      player.lives = 0;
      player.isAlive = false;
    }
    manager.activeScene.update(60);
  };
  const draw = () => {
    textDraws.length = 0;
    manager.activeScene.render();
    return textDraws.map(({ text }) => text);
  };

  beforeEach(() => {
    listeners = new Set();
    runtimes = [];
    textDraws = [];
    Menu.option = Menu.players = 1;
    let frame = 0;
    vi.stubGlobal('window', {
      addEventListener: vi.fn((type, listener) => listeners.add(listener)),
      removeEventListener: vi.fn((type, listener) => listeners.delete(listener)),
      requestAnimationFrame: vi.fn(() => ++frame),
      cancelAnimationFrame: vi.fn(),
    });
    vi.stubGlobal('createjs', undefined);
    setCanvasContext(
      { width: 750, height: 680 },
      {
        fillRect: vi.fn(),
        fillText(text) {
          textDraws.push({ text: String(text), color: this.fillStyle });
        },
      }
    );
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
    Menu.option = Menu.players = 1;
    setCanvasContext(null, null);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ])(
    'completes both turns with outcomes %s/%s and gives player 2 a fresh stage',
    (firstWon, secondWon) => {
      startMatch();
      const firstState = currentRuntime();
      for (let tick = 0; tick < 29; tick += 1) manager.activeScene.update(60);
      session.players[0].score = 6100;
      firstState.cannon.x = 400;
      firstState.barriers[0].segments[0].isAlive = false;
      firstState.ufo[0].x = 350;
      firstState.laserCannon.push({ isAlive: 1 });
      firstState.laserInvaders.push({ isAlive: 1 });
      firstState.shotEffects.push({ life: 99 });
      firstState.scorePopups.push({ life: 99 });
      endTurn(firstWon);
      expect(manager.currentScene).toBe(2);
      expect(session.activePlayerIndex).toBe(1);
      expect(session.matchIsOver).toBe(false);
      expect(session.players[0]).toMatchObject({ score: 6100, won: firstWon, turnFinished: true });
      expect(session.players[1]).toMatchObject({ score: 0, lives: 4, turnFinished: false });
      const secondState = currentRuntime();
      expect(secondState).not.toBe(firstState);
      expect(firstState.stageIsOver).toBe(true);
      expect(secondState).toEqual(makeRuntime());
      expect(draw()).toContain('PLAYER 2 START');
      const firstSnapshot = { ...session.players[0] };
      expect(listeners.size).toBe(1);
      press(39);
      press(32);
      expect(secondState.cannon).toBe(null);
      expect(secondState.laserCannon).toHaveLength(0);
      manager.activeScene.update(1999);
      expect(secondState.cannon).toBe(null);
      manager.activeScene.update(1);
      expect(secondState.cannon).toMatchObject({ x: 50, y: 580, isAlive: 1 });
      expect(secondState.alienInvaders.flat()).toHaveLength(55);
      expect(secondState.alienInvaders.flat().every((alien) => alien.isAlive)).toBe(true);
      expect(
        secondState.barriers.every((barrier) => barrier.segments.every((cell) => cell.isAlive))
      ).toBe(true);
      expect(secondState.ufo[0].x).toBe(50);
      manager.activeScene.update(60);
      expect(secondState.alienInvaders[4][0].x).toBe(100);
      expect(draw()).toContain('PLAYER <2>');
      expect(draw()).toContain('LIVES 4');
      const alien = secondState.alienInvaders[0][0];
      secondState.laserCannon.push(new LaserCannon(alien.x, alien.y + 40));
      manager.activeScene.update(60);
      expect(session.players[1].score).toBe(alien.points);
      expect(session.players[0]).toEqual(firstSnapshot);
      session.players[1].score = 6200;
      endTurn(secondWon);
      expect(manager.currentScene).toBe(secondWon ? 3 : 4);
      expect(session.matchIsOver).toBe(true);
      expect(session.players[1]).toMatchObject({ score: 6200, won: secondWon, turnFinished: true });
      expect(session.players[0]).toEqual(firstSnapshot);
      expect(session.hiScore).toBe(6200);
      const results = draw();
      expect(results).toContain('MATCH RESULTS');
      expect(results).toContain('PLAYER 1 SCORE 6100');
      expect(results).toContain('PLAYER 2 SCORE 6200');
      expect(results).toContain('PLAYER 2 WINS!');
      expect(textDraws.find(({ text }) => text === 'PLAYER 2 WINS!').color).toBe(
        Definitions.secondaryColor
      );
      press();
      expect(manager.currentScene).toBe(0);
      press(38);
      expect(Menu.option).toBe(1);
      press();
      expect(session).toMatchObject({
        playerCount: 1,
        activePlayerIndex: 0,
        matchIsOver: false,
        hiScore: 6200,
      });
      expect(
        session.players.every(
          (player) => player.score === 0 && player.lives === 4 && !player.turnFinished
        )
      ).toBe(true);
      manager.activeScene.update(10000);
      manager.activeScene.update(2000);
      endTurn(false);
      expect(manager.currentScene).toBe(4);
      expect(session.activePlayerIndex).toBe(0);
      expect(runtimes).toHaveLength(3);
    }
  );

  it('keeps each player active after a nonfatal hit and switches only after the final death animation', () => {
    startMatch();
    const first = currentRuntime();
    first.laserInvaders.push(new LaserInvaders(60, 590));
    manager.activeScene.update(60);
    expect(session.players[0].lives).toBe(3);
    expect(session.players[1].lives).toBe(4);
    manager.activeScene.update(900);
    expect(session.activePlayerIndex).toBe(0);
    expect(currentRuntime()).toBe(first);
    first.playerInvulnerableMs = 0;
    session.players[0].lives = 1;
    first.laserInvaders.push(new LaserInvaders(60, 590));
    manager.activeScene.update(60);
    expect(session.players[0].lives).toBe(0);
    expect(session.activePlayerIndex).toBe(0);
    manager.activeScene.update(899);
    expect(session.activePlayerIndex).toBe(0);
    manager.activeScene.update(1);
    expect(session.activePlayerIndex).toBe(1);
    expect(draw()).toContain('PLAYER 2 START');
    manager.activeScene.update(2000);
    currentRuntime().laserInvaders.push(new LaserInvaders(60, 590));
    manager.activeScene.update(60);
    expect(session.players[0].lives).toBe(0);
    expect(session.players[1].lives).toBe(3);
    expect(session.activePlayerIndex).toBe(1);
    expect(draw()).toContain('LIVES 3');
  });

  it('restarts another two-player match from the menu with both turns cleared', () => {
    startMatch();
    for (let match = 0; match < 2; match += 1) {
      expect(session).toMatchObject({ playerCount: 2, activePlayerIndex: 0, matchIsOver: false });
      expect(
        session.players.every(
          (player) => player.score === 0 && player.lives === 4 && !player.turnFinished
        )
      ).toBe(true);
      session.players[0].score = 7000 + match;
      endTurn(false);
      manager.activeScene.update(2000);
      session.players[1].score = 500;
      endTurn(false);
      expect(session.matchIsOver).toBe(true);
      expect(draw()).toContain('PLAYER 1 WINS!');
      press();
      expect(manager.currentScene).toBe(0);
      expect(listeners.size).toBe(1);
      expect(Menu.option).toBe(2);
      if (match === 0) {
        press();
        manager.activeScene.update(10000);
        manager.activeScene.update(2000);
      }
    }
    expect(session.hiScore).toBe(7001);
    expect(runtimes).toHaveLength(4);
  });

  it.each([
    [100, 50, 'PLAYER 1 WINS!'],
    [100, 100, 'TIE GAME!'],
    [0, 0, 'TIE GAME!'],
  ])('renders standings by scores %i/%i even when both players lose', (score1, score2, message) => {
    startMatch();
    session.players[0].score = score1;
    endTurn(false);
    manager.activeScene.update(2000);
    session.players[1].score = score2;
    endTurn(false);
    expect(draw()).toContain(message);
    expect(textDraws.find(({ text }) => text === message).color).toBe(Definitions.secondaryColor);
    expect(draw()).toContain('Press ENTER to return to the menu');
  });
});
