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
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

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
      if (gameOver) return;

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
        const checkPaddleCollision = (paddle: { x: number; y: number }, isPlayer: boolean) => {
          const paddleX = isPlayer ? paddle.x + paddleWidth : paddle.x;
          const ballNearPaddle = isPlayer ? newX <= paddleX : newX >= paddleX - ballSize;

          if (
            ballNearPaddle &&
            newY >= paddle.y &&
            newY <= paddle.y + paddleHeight
          ) {
            newDx = -newDx;

            // Calculate hit position on paddle
            const hitPosition = (newY - paddle.y) / paddleHeight;

            // Adjust speed based on hit position
            if (hitPosition < 0.2 || hitPosition > 0.8) {
              // Edge hit
              newDx *= 1.1;
              newDy *= 1.1;
            } else if (hitPosition > 0.4 && hitPosition < 0.6) {
              // Center hit
              newDx *= 0.9;
              newDy *= 0.9;
            }
          }
        };

        checkPaddleCollision(playerPaddle, true);
        checkPaddleCollision(computerPaddle, false);

        // Score update
        if (newX < 0) {
          setComputerScore(prev => prev + 1);
          if (computerScore + 1 >= 7) {
            setGameOver(true);
            setWinner('Computer');
          }
          return { x: canvasWidth / 2, y: canvasHeight / 2, dx: 4, dy: 4 };
        }
        if (newX > canvasWidth) {
          setPlayerScore(prev => prev + 1);
          if (playerScore + 1 >= 7) {
            setGameOver(true);
            setWinner(name);
          }
          return { x: canvasWidth / 2, y: canvasHeight / 2, dx: -4, dy: 4 };
        }

        return { x: newX, y: newY, dx: newDx, dy: newDy };
      });

      // Computer AI
      setComputerPaddle(prev => {
        const targetY = ball.y - paddleHeight / 2;
        const newY = prev.y + (targetY - prev.y) * 0.088; // Reduced skill factor
        return { ...prev, y: Math.max(0, Math.min(canvasHeight - paddleHeight, newY)) };
      });
    };

    const animationId = setInterval(gameLoop, 1000 / 60);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      clearInterval(animationId);
    };
  }, [playerPaddle, computerPaddle, ball, gameOver, playerScore, computerScore, name]);

  const resetGame = () => {
    setPlayerScore(0);
    setComputerScore(0);
    setGameOver(false);
    setWinner(null);
    setBall({ x: canvasWidth / 2, y: canvasHeight / 2, dx: 4, dy: 4 });
  };

  return (
    <div className="pong-container">
      <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} className="pong-canvas" />
      <div className="scoreboard">
        {name}: {playerScore} - Computer: {computerScore}
      </div>
      {gameOver && (
        <div className="game-over">
          <div className="winner-message">{winner} Wins!</div>
          <button className="reset-button" onClick={resetGame}>Play Again</button>
        </div>
      )}
      <button className="back-button" onClick={onBack}>Back to Menu</button>
    </div>
  );
};

export default Pong; 