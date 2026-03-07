import { cv } from '../context.js';

export const animateInvaders = (stageState, toggle) => {
  for (let i = 0; i < stageState.alienInvaders.length; i += 1) {
    for (let j = 0; j < stageState.alienInvaders[i].length; j += 1) {
      stageState.alienInvaders[i][j].alternateMap(toggle);
    }
  }

  for (let i = 0; i < stageState.ufo.length; i += 1) {
    stageState.ufo[i].alternateMap(toggle);
  }
};

export const renderInvaders = (stageState) => {
  for (let i = 0; i < stageState.alienInvaders.length; i += 1) {
    for (let j = 0; j < stageState.alienInvaders[i].length; j += 1) {
      stageState.alienInvaders[i][j].render();
    }
  }
};

export const moveInvadersTroopers = (stageState, x, y) => {
  let stepY = 0;
  const condition =
    stageState.alienInvaders[0][10].x > cv.width - 60 || stageState.alienInvaders[0][0].x < 15;

  if (condition) {
    stageState.directionInvaders *= -1;
    stepY = y;
  }

  for (let i = 0; i < stageState.alienInvaders[stageState.currentLineInvaders].length; i += 1) {
    if (stageState.currentLineInvaders % 2 > 0 && condition) {
      stageState.alienInvaders[stageState.currentLineInvaders][i].move(
        x * stageState.directionInvaders * -1,
        stepY,
      );
    } else {
      stageState.alienInvaders[stageState.currentLineInvaders][i].move(
        x * stageState.directionInvaders,
        stepY,
      );
    }
  }

  if (stageState.currentLineInvaders === 0) {
    stageState.currentLineInvaders = 4;
  } else {
    stageState.currentLineInvaders -= 1;
  }
};
