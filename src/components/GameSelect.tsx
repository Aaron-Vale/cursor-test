import React from 'react';
import '../styles/GameSelect.css';

interface GameSelectProps {
  onSelectGame: (game: string) => void;
}

const GameSelect: React.FC<GameSelectProps> = ({ onSelectGame }) => {
  return (
    <div className="game-select-container">
      <h2 className="game-select-title">Select a Game</h2>
      <button className="game-select-button" onClick={() => onSelectGame('breakout')}>
        Breakout
      </button>
      <button className="game-select-button" onClick={() => onSelectGame('pong')}>
        Pong
      </button>
      <button className="game-select-button" onClick={() => onSelectGame('tetris')}>
        Tetris
      </button>
    </div>
  );
};

export default GameSelect; 