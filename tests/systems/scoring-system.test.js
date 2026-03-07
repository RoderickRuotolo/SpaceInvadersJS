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
    const session = { players: [{ score: 0 }] };
    const stageState = { scorePopups: [] };

    applyCollisionScoring(session, stageState, [{ type: 'alienHit', points: 30 }]);

    expect(session.players[0].score).toBe(30);
    expect(stageState.scorePopups).toHaveLength(0);
    expect(SoundsManager.playSound).toHaveBeenCalledWith('shoot');
  });

  it('adds ufo points, creates popup and plays ufo sound', () => {
    const session = { players: [{ score: 10 }] };
    const stageState = { scorePopups: [] };

    applyCollisionScoring(session, stageState, [
      { type: 'ufoHit', points: 150, textX: 40, textY: 60 },
    ]);

    expect(session.players[0].score).toBe(160);
    expect(stageState.scorePopups).toEqual([{ text: '150', x: 40, y: 60, life: 15 }]);
    expect(SoundsManager.playSound).toHaveBeenCalledWith('ufoLowpitch');
  });
});
