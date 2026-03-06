export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  pos: Vector2D;
  size: Vector2D;
  color: string;
}

export interface Player extends Entity {
  velocity: Vector2D;
  isGrounded: boolean;
  isSliding: boolean;
  jumpCount: number;
}

export interface Obstacle extends Entity {
  type: 'ground' | 'air';
  speed: number;
}

export interface Particle extends Entity {
  velocity: Vector2D;
  life: number;
  opacity: number;
}

export type GameStatus = 'START' | 'PLAYING' | 'GAMEOVER';

export interface GameState {
  status: GameStatus;
  score: number;
  highScore: number;
  distance: number;
}
