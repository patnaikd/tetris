import React from 'react';
import { TETROMINOS } from '../tetrominos';

const Cell = ({ type }) => (
  <div
    className={`cell ${type === 0 ? 'cell-empty' : `cell-${type}`}`}
    style={{
      background: `rgba(${TETROMINOS[type].color}, 0.8)`,
      border: type === 0 ? '0.5px solid rgba(255, 255, 255, 0.1)' : '2px inset rgba(255, 255, 255, 0.3)',
    }}
  />
);

export default React.memo(Cell);
