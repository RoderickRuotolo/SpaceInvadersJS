import { afterEach, describe, expect, it, vi } from 'vitest';
import { Definitions } from '../../js/config.js';
import { setCanvasContext } from '../../js/context.js';
import { SceneLoser, SceneWinner, ScenesManager } from '../../js/scenes.js';
import { createSession } from '../../js/session.js';

afterEach(() => setCanvasContext(null, null));

describe('Result scene rendering', () => {
  it.each([
    [true, 3, 'You Win! Thanks for Playing!'],
    [false, 4, 'You Lose!'],
  ])('renders a visible result after a game ends (won=%s)', (won, index, message) => {
    const textDraws = [];
    const context = {
      fillStyle: Definitions.backgroundColor,
      fillRect: vi.fn(),
      fillText(text) {
        textDraws.push({ text, color: this.fillStyle });
      },
    };
    setCanvasContext({ width: 750, height: 680 }, context);
    const session = createSession(Definitions);
    const placeholder = () => ({ enter: vi.fn(), exit: vi.fn() });
    const manager = new ScenesManager([
      placeholder(),
      placeholder(),
      placeholder(),
      new SceneWinner(session),
      new SceneLoser(session),
    ]);
    manager.changeScene(2);
    manager.nextScene(won);
    manager.activeScene.render();

    expect(manager.currentScene).toBe(index);
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 750, 680);
    expect(textDraws).toContainEqual({ text: message, color: Definitions.primaryColor });
    expect(Definitions.primaryColor).not.toBe(Definitions.backgroundColor);
    manager.stop();
  });
});
