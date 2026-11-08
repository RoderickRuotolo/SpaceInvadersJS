import { SoundsManager } from '../sounds-manager.js';
import { getActivePlayer } from '../session.js';

const ensurePopupState = (stageState) => {
  if (!stageState.scorePopups) {
    stageState.scorePopups = [];
  }
};

export const applyCollisionScoring = (session, stageState, collisionEvents) => {
  ensurePopupState(stageState);
  const player = getActivePlayer(session);

  for (let i = 0; i < collisionEvents.length; i += 1) {
    const event = collisionEvents[i];

    if (event.type === 'alienHit') {
      player.score += event.points;
      SoundsManager.playSound('shoot');
    }

    if (event.type === 'ufoHit') {
      player.score += event.points;
      stageState.scorePopups.push({
        text: String(event.points),
        x: event.textX,
        y: event.textY,
        life: 15,
      });
      SoundsManager.playSound('ufoLowpitch');
    }
    session.hiScore = Math.max(session.hiScore, player.score);
  }
};
