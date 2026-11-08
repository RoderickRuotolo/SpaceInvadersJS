import { describe, expect, it } from 'vitest';
import {
  createPlayer,
  createSession,
  finishPlayerTurn,
  getActivePlayer,
  getMatchWinner,
  resetMatch,
} from '../js/session.js';

describe('Match reset', () => {
  it('resets both players in place while retaining the highest score and definitions', () => {
    const definitions = {};
    const session = createSession(definitions);
    const players = [createPlayer(), createPlayer()];
    players.forEach((player) => session.includePlayers(player));
    Object.assign(players[0], { score: 100, lives: 0, isAlive: false, won: false });
    Object.assign(players[1], { score: 7000, lives: 1, won: true });
    resetMatch(session);
    expect(session.hiScore).toBe(7000);
    expect(session.definitions).toBe(definitions);
    players.forEach((player, index) => {
      expect(session.players[index]).toBe(player);
      expect(player).toMatchObject({ score: 0, lives: 4, isAlive: true, won: false });
      player.killed();
      expect(player.lives).toBe(3);
    });
    resetMatch(session);
    expect(session.hiScore).toBe(7000);
  });

  it('tracks independent turn outcomes and resets multiplayer state for a new single-player match', () => {
    const session = createSession({});
    session.includePlayers(createPlayer());
    session.includePlayers(createPlayer());
    resetMatch(session, 2);
    const first = getActivePlayer(session);
    first.score = 6000;
    first.lives = 0;
    expect(finishPlayerTurn(session, false)).toBe(true);
    expect(first).toMatchObject({ score: 6000, lives: 0, won: false, turnFinished: true });
    expect(session).toMatchObject({ activePlayerIndex: 1, matchIsOver: false, hiScore: 6000 });
    const second = getActivePlayer(session);
    expect(second).toBe(session.players[1]);
    expect(second).toMatchObject({ score: 0, lives: 4, turnFinished: false });
    second.score = 5000;
    expect(finishPlayerTurn(session, true)).toBe(false);
    expect(session.matchIsOver).toBe(true);
    expect(second).toMatchObject({ won: true, turnFinished: true });
    expect(getMatchWinner(session)).toBe(0);
    expect(finishPlayerTurn(session, false)).toBe(false);
    expect(second.won).toBe(true);
    resetMatch(session, 1);
    expect(session).toMatchObject({
      playerCount: 1,
      activePlayerIndex: 0,
      matchIsOver: false,
      hiScore: 6000,
    });
    expect(
      session.players.every(
        (player) => player.lives === 4 && player.score === 0 && !player.turnFinished
      )
    ).toBe(true);
    expect(finishPlayerTurn(session, true)).toBe(false);
    expect(session.activePlayerIndex).toBe(0);
    expect(session.players[1].turnFinished).toBe(false);
  });

  it.each([
    [100, 50, 0],
    [50, 100, 1],
    [100, 100, null],
    [0, 0, null],
  ])('compares scores %i and %i', (first, second, winner) => {
    const session = createSession({});
    session.includePlayers(createPlayer());
    session.includePlayers(createPlayer());
    session.players[0].score = first;
    session.players[1].score = second;
    expect(getMatchWinner(session)).toBe(winner);
  });
});
