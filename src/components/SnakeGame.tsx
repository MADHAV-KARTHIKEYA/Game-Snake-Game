import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Trophy, RefreshCw, Play } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const SPEED = 100;

type Point = { x: number; y: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string };

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameover'>('playing');
  
  const state = useRef({
    snake: [{ x: 10, y: 10 }] as Point[],
    direction: { x: 0, y: -1 } as Point,
    nextDirection: { x: 0, y: -1 } as Point,
    food: { x: 5, y: 5 } as Point,
    lastMoveTime: 0,
    particles: [] as Particle[],
    shakeTime: 0,
    score: 0,
    status: 'playing' as 'playing' | 'paused' | 'gameover'
  });

  const resetGame = useCallback(() => {
    state.current = {
      snake: [{ x: 10, y: 10 }],
      direction: { x: 0, y: -1 },
      nextDirection: { x: 0, y: -1 },
      food: { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) },
      lastMoveTime: performance.now(),
      particles: [],
      shakeTime: 0,
      score: 0,
      status: 'playing'
    };
    setScore(0);
    setGameState('playing');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      const s = state.current;

      if (e.key === ' ') {
        if (s.status === 'gameover') {
          resetGame();
        } else {
          s.status = s.status === 'playing' ? 'paused' : 'playing';
          setGameState(s.status);
        }
        return;
      }

      if (s.status !== 'playing') return;

      switch (e.key) {
        case 'ArrowUp':
          if (s.direction.y !== 1) s.nextDirection = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (s.direction.y !== -1) s.nextDirection = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (s.direction.x !== 1) s.nextDirection = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (s.direction.x !== -1) s.nextDirection = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetGame]);

  useEffect(() => {
    let animationFrameId: number;
    
    const update = (time: number) => {
      const s = state.current;
      if (s.status !== 'playing') return;

      // Update particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) s.particles.splice(i, 1);
      }

      if (s.shakeTime > 0) {
        s.shakeTime -= 16;
      }

      if (time - s.lastMoveTime > SPEED) {
        s.lastMoveTime = time;
        s.direction = s.nextDirection;
        
        const head = s.snake[0];
        const newHead = { x: head.x + s.direction.x, y: head.y + s.direction.y };

        // Wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          s.status = 'gameover';
          s.shakeTime = 300;
          setGameState('gameover');
          return;
        }

        // Self collision
        if (s.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          s.status = 'gameover';
          s.shakeTime = 300;
          setGameState('gameover');
          return;
        }

        s.snake.unshift(newHead);

        // Food collision
        if (newHead.x === s.food.x && newHead.y === s.food.y) {
          s.score += 10;
          setScore(s.score);
          setHighScore(prev => Math.max(prev, s.score));
          
          // Spawn particles
          for(let i=0; i<20; i++) {
            s.particles.push({
              x: s.food.x * CELL_SIZE + CELL_SIZE/2,
              y: s.food.y * CELL_SIZE + CELL_SIZE/2,
              vx: (Math.random() - 0.5) * 12,
              vy: (Math.random() - 0.5) * 12,
              life: 20 + Math.random() * 20,
              maxLife: 40,
              color: '#00FF00'
            });
          }

          // New food
          let newFood;
          while (true) {
            newFood = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
            if (!s.snake.some(seg => seg.x === newFood.x && seg.y === newFood.y)) break;
          }
          s.food = newFood;
        } else {
          s.snake.pop();
        }
      }
    };

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const s = state.current;

      ctx.fillStyle = '#0A0A0C';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      ctx.save();
      if (s.shakeTime > 0) {
        const dx = (Math.random() - 0.5) * 15;
        const dy = (Math.random() - 0.5) * 15;
        ctx.translate(dx, dy);
      }

      // Draw grid
      ctx.strokeStyle = '#151619';
      ctx.lineWidth = 1;
      for(let i=0; i<=GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
        ctx.stroke();
      }

      // Draw food
      ctx.fillStyle = '#00FF00';
      ctx.shadowColor = '#00FF00';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(s.food.x * CELL_SIZE + CELL_SIZE/2, s.food.y * CELL_SIZE + CELL_SIZE/2, CELL_SIZE/2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw snake
      s.snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#FFFFFF' : '#8E9299';
        if (index === 0) {
          ctx.shadowColor = '#FFFFFF';
          ctx.shadowBlur = 10;
        } else {
          ctx.shadowBlur = 0;
        }
        // slightly smaller than cell to show grid
        ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      });
      ctx.shadowBlur = 0;

      // Draw particles
      s.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      ctx.restore();
    };

    const loop = (time: number) => {
      update(time);
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between w-full mb-6 px-6 py-4 bg-[#151619] border border-[#2A2D35] rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2">
          <div 
            className="text-white font-digital text-4xl tracking-widest glitch-text"
            data-text={`SCORE: ${score.toString().padStart(4, '0')}`}
          >
            SCORE: {score.toString().padStart(4, '0')}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[#8E9299] font-digital text-3xl">
          <Trophy size={24} className="text-[#8E9299]" />
          <span className="glitch-text" data-text={highScore.toString().padStart(4, '0')}>
            {highScore.toString().padStart(4, '0')}
          </span>
        </div>
      </div>

      <div className="relative p-3 bg-[#151619] border border-[#2A2D35] rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] w-full max-w-[500px] aspect-square flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="w-full h-full object-contain rounded bg-[#0A0A0C]"
        />

        {/* Overlays */}
        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            {gameState === 'gameover' ? (
              <>
                <h2 className="text-5xl font-digital text-[#FF4444] mb-2 tracking-widest glitch-text" data-text="SYSTEM_FAILURE">SYSTEM_FAILURE</h2>
                <p className="text-[#8E9299] mb-8 font-mono text-sm tracking-widest uppercase">Final Score: {score}</p>
                <button 
                  onClick={resetGame}
                  className="flex items-center gap-2 px-8 py-3 bg-[#2A2D35] hover:bg-[#3A3D45] text-white font-mono text-sm tracking-widest uppercase rounded transition-all border border-[#4A4D55]"
                >
                  <RefreshCw size={16} />
                  Reboot_Sequence
                </button>
              </>
            ) : (
              <>
                <h2 className="text-5xl font-digital text-[#00FF00] mb-8 tracking-widest glitch-text" data-text="STANDBY_MODE">STANDBY_MODE</h2>
                <button 
                  onClick={() => {
                    state.current.status = 'playing';
                    setGameState('playing');
                  }}
                  className="flex items-center gap-2 px-8 py-3 bg-[#00FF00] hover:bg-[#00CC00] text-black font-mono text-sm tracking-widest uppercase rounded transition-all shadow-[0_0_15px_rgba(0,255,0,0.4)]"
                >
                  <Play size={16} />
                  Resume_Operation
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-6 text-[#8E9299] font-mono text-xs tracking-widest uppercase text-center flex gap-6">
        <span>[ARROWS] Navigate</span>
        <span>[SPACE] Pause/Reboot</span>
      </div>
    </div>
  );
}
