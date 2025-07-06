import React, { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import Display from './components/Display';
import StartButton from './components/StartButton';
import { createStage, checkCollision } from './gameHelpers';
import { TETROMINOS, randomTetromino } from './tetrominos';
import { STAGE_WIDTH } from './gameHelpers';
import './App.css';

const App = () => {
  const [dropTime, setDropTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [rows, setRows] = useState(0);
  const [level, setLevel] = useState(0);
  
  // Player state
  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    tetromino: TETROMINOS[0].shape,
    collided: false,
  });
  
  // Board state
  const [stage, setStage] = useState(createStage());

  // Scoring system
  const linePoints = [40, 100, 300, 1200];

  // Reset player with new tetromino
  const resetPlayer = useCallback(() => {
    setPlayer({
      pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
      tetromino: randomTetromino().shape,
      collided: false,
    });
  }, []);

  // Update player position
  const updatePlayerPos = useCallback(({ x, y, collided }) => {
    setPlayer(prev => ({
      ...prev,
      pos: { x: prev.pos.x + x, y: prev.pos.y + y },
      collided,
    }));
  }, []);

  // Update stage with player position and handle line clearing
  const updateStage = useCallback(() => {
    // Create new stage from existing merged blocks
    const newStage = stage.map(row =>
      row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] : cell))
    );

    // Draw current player position
    player.tetromino.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const newY = y + player.pos.y;
          const newX = x + player.pos.x;
          if (newStage[newY]) {
            newStage[newY][newX] = [
              value,
              `${player.collided ? 'merged' : 'clear'}`,
            ];
          }
        }
      });
    });

    // Check for completed lines if player collided
    if (player.collided) {
      let linesCleared = 0;
      
      const sweptStage = newStage.reduce((ack, row) => {
        if (row.findIndex(cell => cell[0] === 0) === -1) {
          linesCleared += 1;
          ack.unshift(new Array(newStage[0].length).fill([0, 'clear']));
          return ack;
        }
        ack.push(row);
        return ack;
      }, []);

      // Update score and rows
      if (linesCleared > 0) {
        setScore(prev => prev + linePoints[linesCleared - 1] * (level + 1));
        setRows(prev => prev + linesCleared);
      }

      setStage(sweptStage);
      resetPlayer();
    } else {
      setStage(newStage);
    }
  }, [player, stage, level, linePoints, resetPlayer]);

  // Update stage when player changes
  useEffect(() => {
    updateStage();
  }, [player.pos.x, player.pos.y, player.tetromino, player.collided]);

  // Update level based on rows cleared
  useEffect(() => {
    setLevel(Math.floor(rows / 10));
  }, [rows]);

  const drop = useCallback(() => {
    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      // Game Over check
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  }, [player, stage, updatePlayerPos]);

  const keyUp = ({ keyCode }) => {
    if (!gameOver) {
      if (keyCode === 40) {
        setDropTime(1000 / (level + 1) + 200);
      }
    }
  };

  const dropPlayer = () => {
    setDropTime(null);
    drop();
  };

  const move = ({ keyCode }) => {
    if (!gameOver) {
      if (keyCode === 37) {
        // Left arrow
        if (!checkCollision(player, stage, { x: -1, y: 0 })) {
          updatePlayerPos({ x: -1, y: 0, collided: false });
        }
      } else if (keyCode === 39) {
        // Right arrow
        if (!checkCollision(player, stage, { x: 1, y: 0 })) {
          updatePlayerPos({ x: 1, y: 0, collided: false });
        }
      } else if (keyCode === 40) {
        // Down arrow
        dropPlayer();
      } else if (keyCode === 38) {
        // Up arrow - rotate
        const clonedPlayer = JSON.parse(JSON.stringify(player));
        clonedPlayer.tetromino = rotateMatrix(clonedPlayer.tetromino);
        
        if (!checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
          setPlayer(clonedPlayer);
        }
      } else if (keyCode === 32) {
        // Space bar - hard drop
        let dropY = 0;
        while (!checkCollision(player, stage, { x: 0, y: dropY + 1 })) {
          dropY += 1;
        }
        updatePlayerPos({ x: 0, y: dropY, collided: true });
      }
    }
  };

  // Simple rotation function
  const rotateMatrix = (matrix) => {
    const rotated = matrix.map((_, index) =>
      matrix.map(col => col[index])
    );
    return rotated.map(row => row.reverse());
  };

  const startGame = () => {
    setStage(createStage());
    setDropTime(1000);
    resetPlayer();
    setGameOver(false);
    setScore(0);
    setRows(0);
    setLevel(0);
  };

  useEffect(() => {
    if (dropTime !== null) {
      const interval = setInterval(() => {
        drop();
      }, dropTime);

      return () => {
        clearInterval(interval);
      };
    }
  }, [drop, dropTime]);

  return (
    <div 
      className="App" 
      role="button" 
      tabIndex="0" 
      onKeyDown={e => move(e)} 
      onKeyUp={keyUp}
    >
      <div className="tetris">
        <Board stage={stage} />
        <aside>
          {gameOver ? (
            <Display gameOver={gameOver} text="Game Over" />
          ) : (
            <div>
              <Display text={`Score: ${score}`} />
              <Display text={`Rows: ${rows}`} />
              <Display text={`Level: ${level}`} />
            </div>
          )}
          <StartButton callback={startGame} />
        </aside>
      </div>
      <div className="controls">
        <p>Controls:</p>
        <p>← → Move • ↓ Soft Drop • ↑ Rotate • Space Hard Drop</p>
      </div>
    </div>
  );
};

export default App;
