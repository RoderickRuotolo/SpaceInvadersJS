import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScenesManager } from '../../js/scenes.js';

const makeScene = () => ({
  enter: vi.fn(),
  exit: vi.fn(),
  update: vi.fn(),
  render: vi.fn(),
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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

  it.each([NaN, Infinity, -Infinity, -1, 5, 0.5, '1', null, undefined, {}, true])(
    'rejects invalid target %s before exiting the active scene',
    (index) => {
      const first = makeScene();
      const manager = new ScenesManager([first, makeScene()]);
      manager.changeScene(0);
      manager.won = true;
      expect(manager.changeScene(index)).toBe(false);
      expect(manager.activeScene).toBe(first);
      expect(manager.currentScene).toBe(0);
      expect(manager.won).toBe(true);
      expect(first.exit).not.toHaveBeenCalled();
    }
  );

  it.each([null, undefined, {}, { enter() {}, exit() {} }])(
    'rejects an incomplete destination %s',
    (invalid) => {
      const first = makeScene();
      const manager = new ScenesManager([first, invalid]);
      manager.changeScene(0);
      expect(manager.changeScene(1)).toBe(false);
      expect(manager.activeScene).toBe(first);
      expect(first.exit).not.toHaveBeenCalled();
    }
  );

  it('ignores same-scene requests without resetting lifecycle or state', () => {
    const scene = makeScene();
    const manager = new ScenesManager([scene]);
    expect(manager.changeScene(0)).toBe(true);
    manager.won = true;
    expect(scene.onSceneChange(0)).toBe(false);
    expect(scene.enter).toHaveBeenCalledTimes(1);
    expect(scene.exit).not.toHaveBeenCalled();
    expect(manager.won).toBe(true);
  });

  it('ignores inactive and previously captured callbacks, including after re-entry', () => {
    const scenes = [makeScene(), makeScene()];
    const manager = new ScenesManager(scenes);
    expect(manager.nextScene()).toBe(false);
    expect(scenes[0].onNextScene()).toBe(false);
    manager.changeScene(0);
    const oldNext = scenes[0].onNextScene;
    const oldChange = scenes[0].onSceneChange;
    expect(oldNext()).toBe(true);
    expect(oldChange(0)).toBe(false);
    manager.changeScene(0);
    expect(oldNext()).toBe(false);
    expect(oldChange(1)).toBe(false);
    expect(scenes[0].onNextScene()).toBe(true);
    const lastNext = scenes[1].onNextScene;
    manager.stop();
    expect(lastNext()).toBe(false);
    expect(manager.activeScene).toBe(null);
  });

  it('blocks nested transitions in exit and enter while preserving hook order', () => {
    const scenes = [makeScene(), makeScene(), makeScene()];
    const manager = new ScenesManager(scenes);
    const calls = [];
    manager.changeScene(0);
    scenes[0].exit.mockImplementation(() => {
      calls.push('exit');
      expect(manager.changeScene(2)).toBe(false);
      expect(scenes[0].onNextScene()).toBe(false);
    });
    scenes[1].enter.mockImplementation(() => {
      calls.push('enter');
      expect(scenes[1].onNextScene()).toBe(false);
    });
    expect(manager.changeScene(1)).toBe(true);
    expect(calls).toEqual(['exit', 'enter']);
    expect(manager.currentScene).toBe(1);
    expect(scenes[2].enter).not.toHaveBeenCalled();
    expect(scenes[1].onNextScene()).toBe(true);
  });

  it('keeps result scenes stable until an explicit return to the menu', () => {
    const scenes = Array.from({ length: 5 }, makeScene);
    const manager = new ScenesManager(scenes);
    for (const resultIndex of [3, 4]) {
      manager.changeScene(resultIndex);
      expect(scenes[resultIndex].onNextScene()).toBe(false);
      expect(manager.currentScene).toBe(resultIndex);
      expect(scenes[resultIndex].onSceneChange(0)).toBe(true);
    }
  });

  it('rejects malformed results or missing result destinations without changing won', () => {
    const scenes = Array.from({ length: 3 }, makeScene);
    const manager = new ScenesManager(scenes);
    manager.changeScene(2);
    expect(manager.nextScene('won')).toBe(false);
    expect(manager.nextScene(true)).toBe(false);
    expect(manager.currentScene).toBe(2);
    expect(manager.won).toBe(false);
    expect(scenes[2].exit).not.toHaveBeenCalled();
  });

  it('logs only when debug is explicitly enabled, and only for accepted transitions', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});
    new ScenesManager([makeScene()]).changeScene(0);
    expect(log).not.toHaveBeenCalled();
    expect(debug).not.toHaveBeenCalled();
    const manager = new ScenesManager([makeScene()], { debug: true });
    manager.changeScene(0);
    manager.changeScene(NaN);
    manager.changeScene(0);
    expect(debug).toHaveBeenCalledTimes(1);
    expect(debug).toHaveBeenCalledWith('Current scene: 0');
  });

  it('does not render or schedule another frame after stop is called during update', () => {
    const scene = makeScene();
    const manager = new ScenesManager([scene]);
    vi.stubGlobal('window', {
      requestAnimationFrame: vi.fn(() => 1),
      cancelAnimationFrame: vi.fn(),
    });
    scene.update.mockImplementation(() => manager.stop());
    scene.exit.mockImplementation(() => {
      expect(scene.onNextScene()).toBe(false);
      expect(manager.changeScene(0)).toBe(false);
    });
    manager.run();
    manager.loop(1);
    const scheduled = window.requestAnimationFrame.mock.calls.length;
    manager.loop(61);
    expect(scene.exit).toHaveBeenCalledTimes(1);
    expect(scene.render).not.toHaveBeenCalled();
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(scheduled);
    manager.loop(121);
    expect(scene.update).toHaveBeenCalledTimes(1);
  });

  it('releases the transition lock if a lifecycle hook throws', () => {
    const scenes = [makeScene(), makeScene(), makeScene()];
    const manager = new ScenesManager(scenes);
    manager.changeScene(0);
    scenes[1].enter.mockImplementationOnce(() => {
      throw new Error('enter failed');
    });
    expect(() => manager.changeScene(1)).toThrow('enter failed');
    expect(manager.changeScene(2)).toBe(true);
    expect(manager.activeScene).toBe(scenes[2]);
  });

  it('renders the destination rather than the exited scene when update requests a transition', () => {
    const scenes = [makeScene(), makeScene()];
    const manager = new ScenesManager(scenes);
    vi.stubGlobal('window', {
      requestAnimationFrame: vi.fn(() => 1),
      cancelAnimationFrame: vi.fn(),
    });
    scenes[0].update.mockImplementation(() => scenes[0].onNextScene());
    manager.run();
    manager.loop(1);
    manager.loop(61);
    expect(manager.activeScene).toBe(scenes[1]);
    expect(scenes[0].render).not.toHaveBeenCalled();
    expect(scenes[1].render).toHaveBeenCalledTimes(1);
    manager.stop();
  });
});
