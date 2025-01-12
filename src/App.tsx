import React, { useState } from 'react';
import './App.css';
import Breakout from './components/Breakout';

function App() {
  const [name, setName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="container">
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
      {isSubmitted && (
        <>
          <Breakout name={name} />
        </>
      )}
    </div>
  );
}

export default App; 