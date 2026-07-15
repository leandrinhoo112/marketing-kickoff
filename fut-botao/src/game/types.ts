// src/game/types.ts

export type GameMode = 'online' | 'local' | 'ai';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type TeamSide = 'A' | 'B';

export interface Vec2 {
  x: number;
  y: number;
}

export interface ButtonPiece {
  id: string;
  teamSide: TeamSide;
  isGoalkeeper: boolean;
  playerName: string;
  shortName: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  teamId: string;
  logoUrl: string;
  primaryColor: string;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export type IntruderType = 'torcedor' | 'cachorro' | 'guarda';

export interface Intruder {
  id: string;
  type: IntruderType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle?: number;        // For circular or custom movement patterns
  spawnTime: number;     // Timestamp or game time when spawned
  lifetime: number;      // How long the intruder stays (ms)
}

export interface GameModifiers {
  intrusoNoCampo: boolean;
  ultimoBotao: boolean;
}

export interface GameState {
  mode: GameMode;
  aiDifficulty?: AIDifficulty;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  currentTurn: TeamSide;
  phase: 'selecting' | 'dragging' | 'moving' | 'goal' | 'finished';
  selectedButtonId: string | null;
  dragStart: Vec2 | null;
  dragCurrent: Vec2 | null;
  buttons: ButtonPiece[];
  ball: Ball;
  roomCode?: string;
  playerSide?: TeamSide;
  goalLimit: number;
  modifiers?: GameModifiers;
  intruders?: Intruder[];
  eliminatedButtons?: string[];
}

export interface NetworkEvent {
  type: 'LAUNCH' | 'SYNC_STATE' | 'GOAL' | 'RESET';
  payload: unknown;
}
