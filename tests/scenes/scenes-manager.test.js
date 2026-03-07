import { describe, expect, it, vi } from 'vitest';
import { ScenesManager } from '../../js/scenes.js';

const makeScene = () => ({
  enter: vi.fn(),
  exit: vi.fn(),
  update: vi.fn(),
  render: vi.fn(),
});

describe('ScenesManager transitions', () => {
  it('changes sequential scenes and calls enter/exit hooks', () => {
    const scenes = [makeScene(), makeScene(), makeScene(), makeScene(), makeScene()];
    const manager = new ScenesManager(scenes);

    manager.changeScene(0);
    manager.nextScene();

    expect(manager.currentScene).toBe(1);
    expect(scenes[0].exit).toHaveBeenCalledTimes(1);
    expect(scenes[1].enter).toHaveBeenCalledTimes(1);
  });

  it('routes to winner scene when game is won at scene index 2', () => {
    const scenes = [makeScene(), makeScene(), makeScene(), makeScene(), makeScene()];
    const manager = new ScenesManager(scenes);

    manager.changeScene(2);
    manager.won = true;
    manager.nextScene();

    expect(manager.currentScene).toBe(3);
    expect(scenes[3].enter).toHaveBeenCalledTimes(1);
  });

  it('routes to loser scene when game is lost at scene index 2', () => {
    const scenes = [makeScene(), makeScene(), makeScene(), makeScene(), makeScene()];
    const manager = new ScenesManager(scenes);

    manager.changeScene(2);
    manager.won = false;
    manager.nextScene();

    expect(manager.currentScene).toBe(4);
    expect(scenes[4].enter).toHaveBeenCalledTimes(1);
  });
});
