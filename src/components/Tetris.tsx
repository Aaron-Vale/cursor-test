import React, { useEffect, useRef, useState } from 'react';
import '../styles/Tetris.css';

interface TetrisProps {
  onBack: () => void;
}

const Tetris: React.FC<TetrisProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [grid, setGrid] = useState<number[][]>(Array.from({ length: 20 }, () => Array(10).fill(0)));
  const [currentPiece, setCurrentPiece] = useState<number[][]>([]);
  const [position, setPosition] = useState({ x: 4, y: 0 });
  const [level, setLevel] = useState(1);
  const [rowsCleared, setRowsCleared] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const pieces = [
    [[1, 1, 1, 1]], // I
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 0], [0, 1, 1]], // Z
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
  ];

  // Bright colors for better visibility
  const colors = ['#FF0000', '#FF4500', '#FF6347', '#FF7F50', '#FF8C00', '#FFA500', '#FFB6C1'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const blockSize = canvas.width / 10; // Calculate block size based on canvas width

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background grid
      ctx.strokeStyle = '#306230';
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
          ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
        }
      }

      // Draw placed blocks
      grid.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            ctx.fillStyle = colors[value - 1];
            ctx.fillRect(x * blockSize, y * blockSize, blockSize - 1, blockSize - 1);
            ctx.strokeStyle = '#0f380f';
            ctx.strokeRect(x * blockSize, y * blockSize, blockSize - 1, blockSize - 1);
          }
        });
      });
    };

    const drawPiece = (piece: number[][], offset: { x: number; y: number }) => {
      piece.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            ctx.fillStyle = colors[value - 1];
            ctx.fillRect(
              (x + offset.x) * blockSize,
              (y + offset.y) * blockSize,
              blockSize - 1,
              blockSize - 1
            );
            ctx.strokeStyle = '#0f380f';
            ctx.strokeRect(
              (x + offset.x) * blockSize,
              (y + offset.y) * blockSize,
              blockSize - 1,
              blockSize - 1
            );
          }
        });
      });
    };

    const merge = (piece: number[][], offset: { x: number; y: number }) => {
      piece.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            grid[y + offset.y][x + offset.x] = value;
          }
        });
      });
    };

    const collide = (piece: number[][], offset: { x: number; y: number }) => {
      for (let y = 0; y < piece.length; ++y) {
        for (let x = 0; x < piece[y].length; ++x) {
          if (piece[y][x] !== 0 && (grid[y + offset.y] && grid[y + offset.y][x + offset.x]) !== 0) {
            return true;
          }
        }
      }
      return false;
    };

    const rotate = (matrix: number[][], dir: number) => {
      // Make the matrix square by padding with zeros
      const N = Math.max(matrix.length, Math.max(...matrix.map(row => row.length)));
      const paddedMatrix = matrix.map(row => [...row, ...Array(N - row.length).fill(0)]);
      while (paddedMatrix.length < N) {
        paddedMatrix.push(Array(N).fill(0));
      }
      
      const rotated = Array.from({ length: N }, () => Array(N).fill(0));
      
      if (dir > 0) { // Clockwise rotation
        for (let y = 0; y < N; y++) {
          for (let x = 0; x < N; x++) {
            rotated[x][N - 1 - y] = paddedMatrix[y][x];
          }
        }
      } else { // Counter-clockwise rotation
        for (let y = 0; y < N; y++) {
          for (let x = 0; x < N; x++) {
            rotated[N - 1 - x][y] = paddedMatrix[y][x];
          }
        }
      }
      
      // Trim any empty rows and columns
      const trimmed = rotated
        .map(row => [...row]) // Create a copy of each row
        .filter(row => row.some(cell => cell !== 0)); // Remove empty rows
      
      // Remove empty columns
      const maxWidth = Math.max(...trimmed.map(row => {
        const lastNonZero = row.length - [...row].reverse().findIndex(cell => cell !== 0);
        return lastNonZero > 0 ? lastNonZero : row.length;
      }));
      
      return trimmed.map(row => row.slice(0, maxWidth));
    };

    const playerReset = () => {
      const piece = pieces[Math.floor(Math.random() * pieces.length)];
      setCurrentPiece(piece);
      setPosition({ x: 4, y: 0 });
      if (collide(piece, { x: 4, y: 0 })) {
        setGameOver(true);
      }
    };

    const playerDrop = () => {
      setPosition(prev => {
        const newPos = { ...prev, y: prev.y + 1 };
        if (collide(currentPiece, newPos)) {
          merge(currentPiece, prev);
          playerReset();
          sweep();
          return prev;
        }
        return newPos;
      });
    };

    const playerMove = (dir: number) => {
      setPosition(prev => {
        const newPos = { ...prev, x: prev.x + dir };
        if (!collide(currentPiece, newPos)) {
          return newPos;
        }
        return prev;
      });
    };

    const playerRotate = (dir: number) => {
      const rotated = rotate(currentPiece, dir);
      if (!collide(rotated, position)) {
        setCurrentPiece(rotated);
      }
    };

    const sweep = () => {
      let newGrid = [...grid.map(row => [...row])];
      let linesCleared = 0;
      
      // Check rows from bottom to top
      for (let y = newGrid.length - 1; y >= 0; y--) {
        // Check if row is full (every cell is non-zero)
        const isRowFull = newGrid[y].every(value => value !== 0);
        
        if (isRowFull) {
          // Move all rows above down
          for (let row = y; row > 0; row--) {
            newGrid[row] = [...newGrid[row - 1]];
          }
          // Add new empty row at top
          newGrid[0] = Array(10).fill(0);
          linesCleared++;
          y++; // Check the same row again since we moved everything down
        }
      }
      
      // Update score and grid if any lines were cleared
      if (linesCleared > 0) {
        setRowsCleared(prev => prev + linesCleared);
        setGrid(newGrid);
      }
    };

    const update = () => {
      drawGrid();
      if (currentPiece.length > 0) {
        drawPiece(currentPiece, position);
      }
    };

    // Initial draw
    update();

    const dropInterval = 1000 - (level - 1) * 100;
    const intervalId = setInterval(() => {
      if (!gameOver && gameStarted) {
        playerDrop();
        update();
      }
    }, dropInterval);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === ' ') {
        if (!gameStarted) {
          setGameStarted(true);
          playerReset();
          update();
        }
      } else if (gameStarted) {
        if (e.key === 'ArrowLeft') {
          playerMove(-1);
          update();
        } else if (e.key === 'ArrowRight') {
          playerMove(1);
          update();
        } else if (e.key === 'ArrowDown') {
          playerDrop();
          update();
        } else if (e.key === 'ArrowUp') {
          playerRotate(-1);
          update();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPiece, position, grid, gameOver, level, gameStarted]);

  useEffect(() => {
    if (rowsCleared >= level * 5) {
      setLevel(prev => prev + 1);
      setRowsCleared(0);
    }
  }, [rowsCleared, level]);

  return (
    <div className="tetris-container">
      <canvas ref={canvasRef} width={300} height={600} className="tetris-canvas" />
      <div className="level-display">Level: {level}</div>
      {!gameStarted && !gameOver && <div className="start-message">Press SPACE to start</div>}
      {gameOver && <div className="game-over-message">Game Over</div>}
      <button className="back-button" onClick={onBack}>Back to Menu</button>
    </div>
  );
};

export default Tetris; 