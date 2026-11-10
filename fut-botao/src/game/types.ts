// src/game/types.ts

export type GameMode = 'online' | 'local' | 'ai';
export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'legend';
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
  /** Turns this button stays frozen (cannot be launched). */
  frozenTurns?: number;
  /** Turns this button stays giant (bigger + heavier). */
  giantTurns?: number;
  /** True only during a Super Chute move (heavier, blasts through). */
  superActive?: boolean;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  /** Set right after a teleport; cleared once the ball leaves every portal. */
  inPortal?: boolean;
}

// ── Arena Maluca ──────────────────────────────────────────────────────────

export interface Bumper { x: number; y: number; r: number; }
export interface MudZone { x: number; y: number; r: number; }
export interface BoostPad { x: number; y: number; r: number; dx: number; dy: number; }
export interface PortalPair { ax: number; ay: number; bx: number; by: number; r: number; }

export interface ArenaLayout {
  id: string;
  name: string;
  bumpers: Bumper[];
  mud: MudZone[];
  boosts: BoostPad[];
  portals: PortalPair[];
}

// ── Poderes ───────────────────────────────────────────────────────────────

export type PowerUpKind = 'turbo' | 'gelo' | 'gigante' | 'extra';

export interface PowerUp {
  id: string;
  kind: PowerUpKind;
  x: number;
  y: number;
  r: number;
}

/** Everything on the pitch besides buttons and ball that physics must know about. */
export interface World {
  arena: ArenaLayout | null;
  powerups: PowerUp[];
}

export type PhysEvent =
  | { type: 'hit'; x: number; y: number; power: number; ball: boolean; side?: TeamSide }
  | { type: 'wall'; x: number; y: number; power: number }
  | { type: 'bumper'; index: number; x: number; y: number }
  | { type: 'portal'; x: number; y: number; tx: number; ty: number }
  | { type: 'pickup'; powerup: PowerUp; buttonId: string; side: TeamSide };

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
  /** Bumpers, lama, aceleradores e portais no gramado. */
  arenaMaluca: boolean;
  /** Power-ups que aparecem no campo. */
  poderes: boolean;
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
  /** Changes every new match so the canvas can reset its own world state. */
  matchId?: number;
}

export interface NetworkEvent {
  type: 'LAUNCH' | 'SYNC_STATE' | 'GOAL' | 'RESET';
  payload: unknown;
}
