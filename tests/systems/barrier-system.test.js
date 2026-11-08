import { describe, expect, it, vi } from 'vitest';
import {
  createBarriers,
  crushBarriers,
  renderBarriers,
  resolveBarrierCollisions,
} from '../../js/systems/barrier-system.js';
import { createGameRuntime } from '../../js/runtime-state.js';

const segment = (y) => ({ x: 100, y, width: 6, height: 6, isAlive: true });
const shot = (previousY, y, x = 101) => ({ x, previousY, y, width: 3, height: 15, isAlive: 1 });

describe('Destructible barriers', () => {
  it('creates four separate shelters above the cannon with open arches and clipped top corners', () => {
    const barriers = createBarriers(750);
    expect(barriers).toHaveLength(4);
    for (const barrier of barriers) {
      const left = Math.min(...barrier.segments.map((cell) => cell.x));
      expect(barrier.segments.some((cell) => cell.x === left + 24 && cell.y === 530)).toBe(false);
      expect(barrier.segments.some((cell) => cell.x === left && cell.y === 500)).toBe(false);
      expect(barrier.segments.some((cell) => cell.x === left && cell.y === 512)).toBe(true);
      expect(barrier.segments.every((cell) => cell.y + cell.height < 580)).toBe(true);
    }
    const nextMatch = createBarriers(750);
    barriers[0].segments[0].isAlive = false;
    expect(nextMatch[0].segments[0].isAlive).toBe(true);
    expect(barriers[1].segments[0].isAlive).toBe(true);
  });

  it.each([
    [-1, 140, 80, 112],
    [1, 70, 130, 100],
  ])(
    'absorbs a fast shot at the first intact segment in direction %i',
    (direction, from, to, firstY) => {
      const state = { barriers: [{ segments: [segment(106), segment(100), segment(112)] }] };
      const projectile = shot(from, to);
      resolveBarrierCollisions(state, [projectile], direction);
      expect(projectile.isAlive).toBe(0);
      const destroyed = state.barriers[0].segments.filter((cell) => !cell.isAlive);
      expect(destroyed).toHaveLength(1);
      expect(destroyed[0].y).toBe(firstY);
    }
  );

  it('erodes intact segments on repeated hits and lets the next shot pass through the hole', () => {
    const state = { barriers: [{ segments: [segment(100), segment(106)] }] };
    for (let hit = 0; hit < 2; hit += 1) {
      const projectile = shot(140, 80);
      resolveBarrierCollisions(state, [projectile], -1);
      expect(projectile.isAlive).toBe(0);
    }
    const throughHole = shot(140, 80);
    resolveBarrierCollisions(state, [throughHole], -1);
    expect(throughHole.isAlive).toBe(1);
  });

  it('does not damage a shelter for dead shots, misses or movement outside its vertical range', () => {
    const cell = segment(100);
    const state = { barriers: [{ segments: [cell] }] };
    const dead = { ...shot(140, 80), isAlive: 0 };
    const miss = shot(140, 80, 200);
    const below = shot(180, 150);
    resolveBarrierCollisions(state, [dead, miss, below], -1);
    expect(cell.isAlive).toBe(true);
    expect(miss.isAlive).toBe(1);
    expect(below.isAlive).toBe(1);
  });

  it('crushes only segments overlapped by living invaders', () => {
    const cells = [segment(100), segment(120)];
    const state = {
      barriers: [{ segments: cells }],
      alienInvaders: [
        [
          { x: 100, y: 100, width: 30, height: 15, isAlive: 1 },
          { x: 100, y: 120, width: 30, height: 15, isAlive: 0 },
        ],
      ],
    };
    crushBarriers(state);
    expect(cells[0].isAlive).toBe(false);
    expect(cells[1].isAlive).toBe(true);
  });

  it('renders only intact segments in the requested color and tolerates an empty stage', () => {
    const state = createGameRuntime();
    const colors = [];
    const context = {
      fillRect: vi.fn(function () {
        colors.push(this.fillStyle);
      }),
    };
    renderBarriers(state, context, '#AAFFFF');
    resolveBarrierCollisions(state, [shot(140, 80)], -1);
    crushBarriers(state);
    expect(context.fillRect).not.toHaveBeenCalled();
    state.barriers = [{ segments: [segment(100), { ...segment(106), isAlive: false }] }];
    renderBarriers(state, context, '#AAFFFF');
    expect(context.fillRect).toHaveBeenCalledTimes(1);
    expect(context.fillRect).toHaveBeenCalledWith(100, 100, 6, 6);
    expect(colors).toEqual(['#AAFFFF']);
  });
});
