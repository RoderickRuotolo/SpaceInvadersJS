import { ctx } from '../context.js';
import { drawEllipseByCenter } from '../draw-functions.js';

const ensureEffectsState = (stageState) => {
  if (!stageState.shotEffects) {
    stageState.shotEffects = [];
  }

  if (!stageState.scorePopups) {
    stageState.scorePopups = [];
  }
};

export const updateStageEffects = (stageState) => {
  ensureEffectsState(stageState);

  for (let i = stageState.shotEffects.length - 1; i >= 0; i -= 1) {
    stageState.shotEffects[i].life -= 1;
    if (stageState.shotEffects[i].life <= 0) {
      stageState.shotEffects.splice(i, 1);
    }
  }

  for (let i = stageState.scorePopups.length - 1; i >= 0; i -= 1) {
    stageState.scorePopups[i].life -= 1;
    stageState.scorePopups[i].y -= 0.8;
    if (stageState.scorePopups[i].life <= 0) {
      stageState.scorePopups.splice(i, 1);
    }
  }
};

export const renderStageEffects = (stageState) => {
  ensureEffectsState(stageState);

  if (stageState.shotEffects.length > 0) {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < stageState.shotEffects.length; i += 1) {
      const effect = stageState.shotEffects[i];
      drawEllipseByCenter(ctx, effect.x, effect.y, effect.w, effect.h);
    }
  }

  if (stageState.scorePopups.length > 0) {
    for (let i = 0; i < stageState.scorePopups.length; i += 1) {
      const popup = stageState.scorePopups[i];
      ctx.fillText(popup.text, popup.x, popup.y);
    }
  }
};
