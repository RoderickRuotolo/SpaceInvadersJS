import { afterEach, describe, expect, it, vi } from 'vitest';
import { SoundsManager } from '../js/sounds-manager.js';

afterEach(() => vi.unstubAllGlobals());

describe('SoundsManager', () => {
  it('allows the game to load and play when SoundJS is unavailable', () => {
    vi.stubGlobal('createjs', undefined);
    expect(() => SoundsManager.loadSounds()).not.toThrow();
    expect(() => SoundsManager.playSound('shoot')).not.toThrow();
  });

  it('registers and plays sounds when SoundJS is available', () => {
    const Sound = { registerSound: vi.fn(), play: vi.fn() };
    vi.stubGlobal('createjs', { Sound });
    SoundsManager.loadSounds();
    expect(Sound.registerSound).toHaveBeenCalledTimes(Object.keys(SoundsManager.sounds).length);
    expect(Sound.registerSound).toHaveBeenCalledWith('sounds/shoot.wav', 'shoot');
    SoundsManager.playSound('shoot');
    expect(Sound.play).toHaveBeenCalledWith('shoot');
  });
});
