const CELL_SIZE = 6;
const COLUMNS = 12;
const ROWS = 8;

export const createBarriers = (screenWidth) =>
  Array.from({ length: 4 }, (_, index) => {
    const x = ((index + 1) * screenWidth) / 5 - (COLUMNS * CELL_SIZE) / 2;
    const segments = [];
    for (let row = 0; row < ROWS; row += 1) {
      for (let column = 0; column < COLUMNS; column += 1) {
        const corner = row < 2 && (column < 2 - row || column >= COLUMNS - 2 + row);
        const opening = row >= 5 && column >= 4 && column < 8;
        if (corner || opening) continue;
        segments.push({
          x: x + column * CELL_SIZE,
          y: 500 + row * CELL_SIZE,
          width: CELL_SIZE,
          height: CELL_SIZE,
          isAlive: true,
        });
      }
    }
    return { segments };
  });

const overlaps = (a, b) =>
  a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

// Sweep the entire movement so fast player shots cannot skip thin segments.
// Only the first intact segment along the shot's direction absorbs the hit.
export const resolveBarrierCollisions = (state, projectiles, direction) => {
  const segments = state.barriers.flatMap((barrier) => barrier.segments);
  for (const shot of projectiles) {
    if (!shot.isAlive) continue;
    const previousY = shot.previousY ?? shot.y;
    const swept = {
      x: shot.x,
      y: Math.min(previousY, shot.y),
      width: shot.width,
      height: Math.abs(previousY - shot.y) + shot.height,
    };
    const hits = segments.filter((segment) => segment.isAlive && overlaps(swept, segment));
    hits.sort((a, b) => direction * (a.y - b.y));
    if (hits.length) {
      hits[0].isAlive = false;
      shot.isAlive = 0;
    }
  }
};

export const crushBarriers = (state) => {
  const invaders = state.alienInvaders.flat().filter((invader) => invader.isAlive);
  for (const barrier of state.barriers) {
    for (const segment of barrier.segments) {
      if (segment.isAlive && invaders.some((invader) => overlaps(invader, segment))) {
        segment.isAlive = false;
      }
    }
  }
};

export const renderBarriers = (state, context, color) => {
  context.fillStyle = color;
  for (const barrier of state.barriers) {
    for (const segment of barrier.segments) {
      if (segment.isAlive) {
        context.fillRect(segment.x, segment.y, segment.width, segment.height);
      }
    }
  }
};
