import { useState, useEffect } from 'react';

// Scoring system based on lines cleared at once
const linePoints = [40, 100, 300, 1200];

export const useGameStatus = rowsCleared => {
  const [score, setScore] = useState(0);
  const [rows, setRows] = useState(0);
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (rowsCleared > 0) {
      // This is how original Tetris score is calculated
      setScore(prev => prev + linePoints[rowsCleared - 1] * (level + 1));
      setRows(prev => prev + rowsCleared);
    }
  }, [rowsCleared, level]);

  useEffect(() => {
    setLevel(Math.floor(rows / 10));
  }, [rows]);

  return [score, setScore, rows, setRows, level, setLevel];
};
