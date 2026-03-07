import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setCanvasContext } from '../../js/context.js';
import {
  animateInvaders,
  moveInvadersTroopers,
  renderInvaders,
} from '../../js/systems/invader-system.js';

describe('invader-system', () => {
  beforeEach(() => {
    setCanvasContext({ width: 750, height: 680 }, {});
  });

  it('animates all invaders and ufo entries', () => {
    const alienA = { alternateMap: vi.fn() };
    const alienB = { alternateMap: vi.fn() };
    const ufo = { alternateMap: vi.fn() };

    const stageState = {
      alienInvaders: [[alienA], [alienB]],
      ufo: [ufo],
    };

    animateInvaders(stageState, true);

    expect(alienA.alternateMap).toHaveBeenCalledWith(true);
    expect(alienB.alternateMap).toHaveBeenCalledWith(true);
    expect(ufo.alternateMap).toHaveBeenCalledWith(true);
  });

  it('renders every invader entity', () => {
    const invaderA = { render: vi.fn() };
    const invaderB = { render: vi.fn() };

    renderInvaders({ alienInvaders: [[invaderA, invaderB]] });

    expect(invaderA.render).toHaveBeenCalledTimes(1);
    expect(invaderB.render).toHaveBeenCalledTimes(1);
  });

  it('moves current line and cycles line index', () => {
    const moved = [];
    const mk = (x) => ({
      x,
      move: vi.fn((dx, dy) => {
        moved.push([dx, dy]);
      }),
    });
    const mkRow = (startX) => Array.from({ length: 11 }, (_, i) => mk(startX + i * 20));

    const stageState = {
      directionInvaders: 1,
      currentLineInvaders: 1,
      alienInvaders: [mkRow(100), mkRow(200), mkRow(300), mkRow(400), mkRow(500)],
    };

    moveInvadersTroopers(stageState, 8, 8);

    expect(moved).toHaveLength(11);
    expect(moved.every(([dx, dy]) => dx === 8 && dy === 0)).toBe(true);
    expect(stageState.currentLineInvaders).toBe(0);
  });
});
