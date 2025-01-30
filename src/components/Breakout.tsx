import React, { useEffect, useRef, useState } from 'react';
import '../styles/Breakout.css';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Add interface for props
interface BreakoutProps {
  name: string;
  onBack: () => void;
}

// Update component definition to use props
const Breakout: React.FC<BreakoutProps> = ({ name, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Game objects
  const [paddle, setPaddle] = useState<GameObject>({
    x: 350,
    y: 580,
    width: 100,
    height: 10
  });
  
  const [ball, setBall] = useState<GameObject & { dx: number; dy: number }>({
    x: 400,
    y: 565,
    width: 10,
    height: 10,
    dx: 5,
    dy: -5
  });

  const [bricks, setBricks] = useState<GameObject[]>(() => {
    const brickArray: GameObject[] = [];
    const brickRows = 5;
    const brickCols = 8;
    const brickWidth = 80;
    const brickHeight = 20;
    const brickPadding = 10;
    
    for (let i = 0; i < brickRows; i++) {
      for (let j = 0; j < brickCols; j++) {
        brickArray.push({
          x: j * (brickWidth + brickPadding) + 50,
          y: i * (brickHeight + brickPadding) + 50,
          width: brickWidth,
          height: brickHeight
        });
      }
    }
    return brickArray;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !gameStarted) {
        setGameStarted(true);
      }
      
      if (e.code === 'ArrowLeft') {
        setPaddle(prev => ({
          ...prev,
          x: Math.max(0, prev.x - 20)
        }));
      }
      if (e.code === 'ArrowRight') {
        setPaddle(prev => ({
          ...prev,
          x: Math.min(canvas.width - prev.width, prev.x + 20)
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const gameLoop = () => {
      if (!gameStarted) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw paddle
      ctx.fillStyle = '#8bac0f';
      ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
      
      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.width / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#8bac0f';
      ctx.fill();
      ctx.closePath();
      
      // Draw bricks
      bricks.forEach(brick => {
        ctx.fillStyle = '#306230';
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        ctx.strokeStyle = '#8bac0f';
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      });
      
      // Ball movement and collision
      setBall(prev => {
        let newX = prev.x + prev.dx;
        let newY = prev.y + prev.dy;
        let newDx = prev.dx;
        let newDy = prev.dy;
        
        // Wall collisions
        if (newX <= 0 || newX >= canvas.width) newDx = -newDx;
        if (newY <= 0) newDy = -newDy;
        
        // Paddle collision
        if (
          newY + prev.height >= paddle.y &&
          newX >= paddle.x &&
          newX <= paddle.x + paddle.width
        ) {
          newDy = -newDy;
        }
        
        // Game over condition
        if (newY >= canvas.height) {
          setGameStarted(false);
          return { ...prev, x: 400, y: 565, dx: 5, dy: -5 };
        }
        
        return { ...prev, x: newX, y: newY, dx: newDx, dy: newDy };
      });
      
      // Brick collision
      setBricks(prev => {
        return prev.filter(brick => {
          const collision = (
            ball.x >= brick.x &&
            ball.x <= brick.x + brick.width &&
            ball.y >= brick.y &&
            ball.y <= brick.y + brick.height
          );
          
          if (collision) {
            setBall(prevBall => ({ ...prevBall, dy: -prevBall.dy }));
          }
          
          return !collision;
        });
      });
    };

    const animationId = setInterval(gameLoop, 1000 / 60);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(animationId);
    };
  }, [gameStarted, paddle, ball, bricks]);

  return (
    <div className="breakout-container">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="breakout-canvas"
      />
      <div className="welcome-message">
        Welcome, {name}! 🎮
      </div>
      {!gameStarted && (
        <div className="start-message">
          Press SPACE to start
          <br />
          Use ← → arrows to move
        </div>
      )}
      <button className="back-button" onClick={onBack}>Back to Menu</button>
    </div>
  );
};

export default Breakout; 