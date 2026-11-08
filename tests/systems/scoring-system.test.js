import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../js/sounds-manager.js', () => ({
  SoundsManager: {
    playSound: vi.fn(),
  },
}));

import { SoundsManager } from '../../js/sounds-manager.js';
import { applyCollisionScoring } from '../../js/systems/scoring-system.js';

describe('applyCollisionScoring', () => {
  beforeEach(() => {
    SoundsManager.playSound.mockClear();
  });

  it('adds alien points and plays alien hit sound', () => {
    const session = { players: [{ score: 0 }], hiScore: 5000 };
    const stageState = { scorePopups: [] };

    applyCollisionScoring(session, stageState, [{ type: 'alienHit', points: 30 }]);

    expect(session.players[0].score).toBe(30);
    expect(stageState.scorePopups).toHaveLength(0);
    expect(SoundsManager.playSound).toHaveBeenCalledWith('shoot');
  });

  it('adds ufo points, creates popup and plays ufo sound', () => {
    const session = { players: [{ score: 10 }], hiScore: 5000 };
    const stageState = { scorePopups: [] };

    applyCollisionScoring(session, stageState, [
      { type: 'ufoHit', points: 150, textX: 40, textY: 60 },
    ]);

    expect(session.players[0].score).toBe(160);
    expect(stageState.scorePopups).toEqual([{ text: '150', x: 40, y: 60, life: 15 }]);
    expect(SoundsManager.playSound).toHaveBeenCalledWith('ufoLowpitch');
  });

  it('updates the record immediately when either kind of hit beats it and never lowers it', () => {
    const session = { players: [{ score: 4990 }], hiScore: 5000 };
    const state = { scorePopups: [] };
    applyCollisionScoring(session, state, [{ type: 'alienHit', points: 30 }]);
    expect(session.hiScore).toBe(5020);
    applyCollisionScoring(session, state, [{ type: 'ufoHit', points: 150, textX: 0, textY: 0 }]);
    expect(session.hiScore).toBe(5170);
    session.players[0].score = 0;
    applyCollisionScoring(session, state, [{ type: 'alienHit', points: 10 }]);
    expect(session.hiScore).toBe(5170);
  });

  it('awards both kinds of hits and the record to player 2 while preserving player 1', () => {
    const session = {
      players: [{ score: 4000 }, { score: 4990 }],
      activePlayerIndex: 1,
      hiScore: 5000,
    };
    const state = { scorePopups: [] };
    applyCollisionScoring(session, state, [
      { type: 'alienHit', points: 30 },
      { type: 'ufoHit', points: 150, textX: 0, textY: 0 },
    ]);
    expect(session.players[0].score).toBe(4000);
    expect(session.players[1].score).toBe(5170);
    expect(session.hiScore).toBe(5170);
    expect(state.scorePopups[0].text).toBe('150');
  });
});
