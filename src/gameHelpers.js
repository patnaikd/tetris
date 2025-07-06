// Game constants and helper functions

export const STAGE_WIDTH = 12;
export const STAGE_HEIGHT = 20;

// Create an empty game board
export const createStage = () =>
  Array.from(Array(STAGE_HEIGHT), () =>
    new Array(STAGE_WIDTH).fill([0, 'clear'])
  );

// Check if the player's move is valid (collision detection)
export const checkCollision = (player, stage, { x: moveX, y: moveY }) => {
  for (let y = 0; y < player.tetromino.length; y += 1) {
    for (let x = 0; x < player.tetromino[y].length; x += 1) {
      // 1. Check that we're on an actual tetromino cell
      if (player.tetromino[y][x] !== 0) {
        if (
          // 2. Check that our move is inside the game area's height (y)
          // We shouldn't go through the bottom of the play area
          !stage[y + player.pos.y + moveY] ||
          // 3. Check that our move is inside the game area's width (x)
          !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
          // 4. Check that the cell we're moving to isn't set to clear
          stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !== 'clear'
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

// Rotate tetromino matrix (90 degrees clockwise)
export const rotate = (matrix, dir) => {
  // Make the rows to become columns (transpose)
  const rotatedTetro = matrix.map((_, index) =>
    matrix.map(col => col[index])
  );
  
  // Reverse each row to get a 90 degree rotation
  if (dir > 0) return rotatedTetro.map(row => row.reverse());
  
  return rotatedTetro.reverse();
};

// Check if the game is over (pieces reached the top)
export const isColliding = (player, stage, { x: moveX, y: moveY }) => {
  return checkCollision(player, stage, { x: moveX, y: moveY });
};
