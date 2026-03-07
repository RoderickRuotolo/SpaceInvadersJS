import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setCanvasContext } from '../../js/context.js';
import { renderStageEffects, updateStageEffects } from '../../js/systems/effects-system.js';

const makeFakeCtx = () => ({
  fillStyle: '',
  fillText: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  bezierCurveTo: vi.fn(),
  fill: vi.fn(),
});

describe('effects-system', () => {
  let fakeCtx;

  beforeEach(() => {
    fakeCtx = makeFakeCtx();
    setCanvasContext({ width: 750, height: 680 }, fakeCtx);
  });

  it('updates and removes expired visual effects', () => {
    const stageState = {
      shotEffects: [{ life: 1, x: 1, y: 2, w: 3, h: 4 }],
      scorePopups: [{ life: 2, x: 10, y: 20, text: '100' }],
    };

    updateStageEffects(stageState);

    expect(stageState.shotEffects).toEqual([]);
    expect(stageState.scorePopups).toEqual([{ life: 1, x: 10, y: 19.2, text: '100' }]);
  });

  it('renders shot effects and score popups', () => {
    const stageState = {
      shotEffects: [{ life: 3, x: 10, y: 3, w: 20, h: 10 }],
      scorePopups: [{ life: 10, x: 50, y: 60, text: '150' }],
    };

    renderStageEffects(stageState);

    expect(fakeCtx.beginPath).toHaveBeenCalled();
    expect(fakeCtx.fill).toHaveBeenCalled();
    expect(fakeCtx.fillText).toHaveBeenCalledWith('150', 50, 60);
  });
});
