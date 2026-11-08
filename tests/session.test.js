import { describe, expect, it } from 'vitest';
import { createPlayer, createSession, resetMatch } from '../js/session.js';

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
});
