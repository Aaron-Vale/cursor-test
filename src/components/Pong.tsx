import React, { useEffect, useRef, useState } from 'react';
import '../styles/Pong.css';

interface PongProps {
  onBack: () => void;
  name: string;
}

const Pong: React.FC<PongProps> = ({ onBack, name }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);

  const paddleWidth = 10;
  const paddleHeight = 100;
  const ballSize = 10;
  const canvasWidth = 800;
  const canvasHeight = 600;

  const [playerPaddle, setPlayerPaddle] = useState({ x: 0, y: canvasHeight / 2 - paddleHeight / 2 });
  const [computerPaddle, setComputerPaddle] = useState({ x: canvasWidth - paddleWidth, y: canvasHeight / 2 - paddleHeight / 2 });
  const [ball, setBall] = useState({ x: canvasWidth / 2, y: canvasHeight / 2, dx: 4, dy: 4 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp') {
        setPlayerPaddle(prev => ({ ...prev, y: Math.max(0, prev.y - 20) }));
      }
      if (e.code === 'ArrowDown') {
        setPlayerPaddle(prev => ({ ...prev, y: Math.min(canvasHeight - paddleHeight, prev.y + 20) }));
      }
    };

    const handleWheel = (e: WheelEvent) => {
      setPlayerPaddle(prev => ({
        ...prev,
        y: Math.max(0, Math.min(canvasHeight - paddleHeight, prev.y + e.deltaY * 0.1))
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel);

    const gameLoop = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Draw paddles
      ctx.fillStyle = '#8bac0f';
      ctx.fillRect(playerPaddle.x, playerPaddle.y, paddleWidth, paddleHeight);
      ctx.fillRect(computerPaddle.x, computerPaddle.y, paddleWidth, paddleHeight);

      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ballSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#8bac0f';
      ctx.fill();
      ctx.closePath();

      // Move ball
      setBall(prev => {
        let newX = prev.x + prev.dx;
        let newY = prev.y + prev.dy;
        let newDx = prev.dx;
        let newDy = prev.dy;

        // Wall collision
        if (newY <= 0 || newY >= canvasHeight) newDy = -newDy;

        // Paddle collision
        if (
          (newX <= playerPaddle.x + paddleWidth && newY >= playerPaddle.y && newY <= playerPaddle.y + paddleHeight) ||
          (newX >= computerPaddle.x - paddleWidth && newY >= computerPaddle.y && newY <= computerPaddle.y + paddleHeight)
        ) {
          newDx = -newDx;
        }

        // Score update
        if (newX < 0) {
          setComputerScore(prev => prev + 1);
          return { x: canvasWidth / 2, y: canvasHeight / 2, dx: 4, dy: 4 };
        }
        if (newX > canvasWidth) {
          setPlayerScore(prev => prev + 1);
          return { x: canvasWidth / 2, y: canvasHeight / 2, dx: -4, dy: 4 };
        }

        return { x: newX, y: newY, dx: newDx, dy: newDy };
      });

      // Computer AI
      setComputerPaddle(prev => {
        const targetY = ball.y - paddleHeight / 2;
        const newY = prev.y + (targetY - prev.y) * 0.085; // Reduced skill factor
        return { ...prev, y: Math.max(0, Math.min(canvasHeight - paddleHeight, newY)) };
      });
    };

    const animationId = setInterval(gameLoop, 1000 / 60);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      clearInterval(animationId);
    };
  }, [playerPaddle, computerPaddle, ball]);

  return (
    <div className="pong-container">
      <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} className="pong-canvas" />
      <div className="scoreboard">
        {name}: {playerScore} - Computer: {computerScore}
      </div>
      <button className="back-button" onClick={onBack}>Back to Menu</button>
    </div>
  );
};

export default Pong; 