import React, { useState } from 'react';
import './App.css';
import Breakout from './components/Breakout';
import Pong from './components/Pong';
import Tetris from './components/Tetris';
import GameSelect from './components/GameSelect';

function App() {
  const [name, setName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsSubmitted(true);
    }
  };

  const handleGameSelect = (game: string) => {
    setSelectedGame(game);
  };

  const handleBackToMenu = () => {
    setSelectedGame(null);
  };

  return (
    <div className="container">
      {!isSubmitted ? (
        <>
          <h1 className="welcome-text">Welcome!</h1>
          <form className="input-container" onSubmit={handleSubmit}>
            <label htmlFor="nameInput">Please enter your name: </label>
            <input
              id="nameInput"
              type="text"
              className="chrome-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
            <button type="submit" className="chrome-button">
              Submit
            </button>
          </form>
        </>
      ) : selectedGame === null ? (
        <GameSelect onSelectGame={handleGameSelect} />
      ) : selectedGame === 'breakout' ? (
        <Breakout name={name} onBack={handleBackToMenu} />
      ) : selectedGame === 'pong' ? (
        <Pong name={name} onBack={handleBackToMenu} />
      ) : (
        <Tetris onBack={handleBackToMenu} />
      )}
    </div>
  );
}

export default App; 