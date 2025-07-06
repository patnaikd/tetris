import { useState, useEffect } from 'react';
import { createStage } from '../gameHelpers';

export const useBoard = (player, resetPlayer) => {
  const [stage, setStage] = useState(createStage());
  const [rowsCleared, setRowsCleared] = useState(0);

  useEffect(() => {
    // Update the stage with the current player position
    const updateStage = prevStage => {
      // First flush the stage from the previous player position
      const newStage = prevStage.map(row =>
        row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] : cell))
      );

      // Then draw the current player position
      player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            newStage[y + player.pos.y][x + player.pos.x] = [
              value,
              `${player.collided ? 'merged' : 'clear'}`,
            ];
          }
        });
      });

      // Check if we collided and sweep rows
      if (player.collided) {
        let linesCleared = 0;
        
        // Sweep the stage to check for completed rows
        const sweptStage = newStage.reduce((ack, row) => {
          // If the row doesn't contain any empty cells (0), it's completed
          if (row.findIndex(cell => cell[0] === 0) === -1) {
            linesCleared += 1;
            // Add a new empty row at the top
            ack.unshift(new Array(newStage[0].length).fill([0, 'clear']));
            return ack;
          }
          ack.push(row);
          return ack;
        }, []);

        setRowsCleared(linesCleared);
        resetPlayer();
        return sweptStage;
      }

      return newStage;
    };

    setStage(prev => updateStage(prev));
  }, [player.pos.x, player.pos.y, player.tetromino, player.collided, resetPlayer]);

  return [stage, setStage, rowsCleared];
};
