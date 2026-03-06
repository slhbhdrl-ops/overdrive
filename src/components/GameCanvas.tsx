import React, { useEffect, useRef, useState } from 'react';
import { Player, Obstacle, Particle, GameState } from '../types';

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  isPaused: boolean;
}

const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const GROUND_Y = 0.8; // Percentage of height
const PLAYER_X = 100;
const INITIAL_SPEED = 5;
const SPEED_INCREMENT = 0.0005;

export const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  
  // Game State Refs (to avoid re-renders during game loop)
  const playerRef = useRef<Player>({
    pos: { x: PLAYER_X, y: 0 },
    size: { x: 40, y: 60 },
    color: '#00f2ff',
    velocity: { x: 0, y: 0 },
    isGrounded: false,
    isSliding: false,
    jumpCount: 0
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const speedRef = useRef<number>(INITIAL_SPEED);
  const lastSpawnRef = useRef<number>(0);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current?.parentElement) {
        const { clientWidth, clientHeight } = canvasRef.current.parentElement;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const spawnObstacle = (time: number) => {
      const minGap = 1500 / speedRef.current;
      if (time - lastSpawnRef.current > minGap + Math.random() * 1000) {
        const type = Math.random() > 0.7 ? 'air' : 'ground';
        const height = type === 'air' ? dimensions.height * 0.5 : dimensions.height * GROUND_Y - 40;
        
        obstaclesRef.current.push({
          pos: { x: dimensions.width, y: height },
          size: { x: 30, y: type === 'air' ? 30 : 40 },
          color: '#ff0055',
          type,
          speed: speedRef.current
        });
        lastSpawnRef.current = time;
      }
    };

    const createParticles = (x: number, y: number, color: string, count = 5) => {
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          pos: { x, y },
          size: { x: Math.random() * 4 + 2, y: Math.random() * 4 + 2 },
          velocity: { x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 10 },
          color,
          life: 1,
          opacity: 1
        });
      }
    };

    const update = (time: number) => {
      if (isPaused) {
        animationFrameId = requestAnimationFrame(update);
        return;
      }

      const groundY = dimensions.height * GROUND_Y;
      const player = playerRef.current;

      // Physics
      player.velocity.y += GRAVITY;
      player.pos.y += player.velocity.y;

      if (player.pos.y + player.size.y > groundY) {
        player.pos.y = groundY - player.size.y;
        player.velocity.y = 0;
        player.isGrounded = true;
        player.jumpCount = 0;
      } else {
        player.isGrounded = false;
      }

      // Speed up
      speedRef.current += SPEED_INCREMENT;
      scoreRef.current += speedRef.current / 10;

      // Obstacles
      spawnObstacle(time);
      obstaclesRef.current = obstaclesRef.current.filter(obs => {
        obs.pos.x -= speedRef.current;
        
        // Collision
        const pBox = {
          left: player.pos.x + 5,
          right: player.pos.x + player.size.x - 5,
          top: player.pos.y + 5,
          bottom: player.pos.y + player.size.y - 5
        };
        const oBox = {
          left: obs.pos.x,
          right: obs.pos.x + obs.size.x,
          top: obs.pos.y,
          bottom: obs.pos.y + obs.size.y
        };

        if (pBox.left < oBox.right && pBox.right > oBox.left && pBox.top < oBox.bottom && pBox.bottom > oBox.top) {
          onGameOver(Math.floor(scoreRef.current));
          return false;
        }

        return obs.pos.x + obs.size.x > 0;
      });

      // Particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.pos.x += p.velocity.x;
        p.pos.y += p.velocity.y;
        p.life -= 0.02;
        p.opacity = p.life;
        return p.life > 0;
      });

      // Draw
      draw(ctx);
      animationFrameId = requestAnimationFrame(update);
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Background Grid
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.1)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      const offset = (frameRef.current * speedRef.current) % gridSize;
      
      for (let x = -offset; x < dimensions.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, dimensions.height);
        ctx.stroke();
      }
      
      const groundY = dimensions.height * GROUND_Y;
      
      // Ground
      ctx.strokeStyle = '#00f2ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(dimensions.width, groundY);
      ctx.stroke();
      
      // Neon Glow for Ground
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00f2ff';
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Player
      const player = playerRef.current;
      ctx.fillStyle = player.color;
      ctx.shadowBlur = 20;
      ctx.shadowColor = player.color;
      ctx.fillRect(player.pos.x, player.pos.y, player.size.x, player.size.y);
      
      // Player "Trail"
      if (!player.isGrounded) {
        ctx.globalAlpha = 0.3;
        ctx.fillRect(player.pos.x - 10, player.pos.y + 5, player.size.x, player.size.y);
        ctx.globalAlpha = 1;
      }
      ctx.shadowBlur = 0;

      // Obstacles
      obstaclesRef.current.forEach(obs => {
        ctx.fillStyle = obs.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = obs.color;
        ctx.fillRect(obs.pos.x, obs.pos.y, obs.size.x, obs.size.y);
        ctx.shadowBlur = 0;
      });

      // Particles
      particlesRef.current.forEach(p => {
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.pos.x, p.pos.y, p.size.x, p.size.y);
      });
      ctx.globalAlpha = 1;

      frameRef.current++;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        const player = playerRef.current;
        if (player.jumpCount < 2) {
          player.velocity.y = JUMP_FORCE;
          player.jumpCount++;
          createParticles(player.pos.x + player.size.x / 2, player.pos.y + player.size.y, '#00f2ff');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    animationFrameId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions, isPaused, onGameOver]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="w-full h-full bg-black cursor-pointer"
      onClick={() => {
        const player = playerRef.current;
        if (player.jumpCount < 2) {
          player.velocity.y = JUMP_FORCE;
          player.jumpCount++;
        }
      }}
    />
  );
};
