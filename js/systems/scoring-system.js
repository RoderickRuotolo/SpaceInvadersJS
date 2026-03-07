import { SoundsManager } from '../sounds-manager.js';

const ensurePopupState = (stageState) => {
  if (!stageState.scorePopups) {
    stageState.scorePopups = [];
  }
};

export const applyCollisionScoring = (session, stageState, collisionEvents) => {
  ensurePopupState(stageState);

  for (let i = 0; i < collisionEvents.length; i += 1) {
    const event = collisionEvents[i];

    if (event.type === 'alienHit') {
      session.players[0].score += event.points;
      SoundsManager.playSound('shoot');
    }

    if (event.type === 'ufoHit') {
      session.players[0].score += event.points;
      stageState.scorePopups.push({
        text: String(event.points),
        x: event.textX,
        y: event.textY,
        life: 15,
      });
      SoundsManager.playSound('ufoLowpitch');
    }
  }
};
