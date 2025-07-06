import React from 'react';

const StartButton = ({ callback }) => (
  <div className="start-button" onClick={callback}>
    Start Game
  </div>
);

export default StartButton;
