// src/game/mechanics.ts
// Arena Maluca layouts, power-ups, Super Chute meters and the forward simulator
// shared by the aim preview and the AI.
import {
  ArenaLayout, Ball, ButtonPiece, PhysEvent, PowerUp, PowerUpKind, TeamSide, Vec2, World,
} from './types';
import {
  FIELD, BUTTON_RADIUS, GIANT_RADIUS, SUPER_MULT, TURN_FRAME_LIMIT, isMoving, stepPhysics,
} from './physics';

// ── Arena Maluca ──────────────────────────────────────────────────────────
// Every layout is symmetric under a 180° rotation around the centre spot,
// so neither side gets an advantage.

export const ARENAS: ArenaLayout[] = [
  {
    id: 'pinball', name: 'Pinball',
    bumpers: [
      { x: 400, y: 105, r: 20 }, { x: 400, y: 395, r: 20 },
      { x: 265, y: 335, r: 15 }, { x: 535, y: 165, r: 15 },
    ],
    mud: [], boosts: [], portals: [],
  },
  {
    id: 'turbo', name: 'Pista Turbo',
    bumpers: [],
    mud: [{ x: 285, y: 165, r: 36 }, { x: 515, y: 335, r: 36 }],
    boosts: [
      { x: 400, y: 92, r: 36, dx: 1, dy: 0 },
      { x: 400, y: 408, r: 36, dx: -1, dy: 0 },
    ],
    portals: [],
  },
  {
    id: 'portais', name: 'Portais',
    bumpers: [{ x: 400, y: 140, r: 16 }, { x: 400, y: 360, r: 16 }],
    mud: [], boosts: [],
    portals: [{ ax: 135, ay: 72, bx: 665, by: 428, r: 19 }],
  },
  {
    id: 'caos', name: 'Caos Total',
    bumpers: [{ x: 310, y: 250, r: 14 }, { x: 490, y: 250, r: 14 }],
    mud: [{ x: 190, y: 405, r: 32 }, { x: 610, y: 95, r: 32 }],
    boosts: [
      { x: 300, y: 80, r: 30, dx: 1, dy: 0 },
      { x: 500, y: 420, r: 30, dx: -1, dy: 0 },
    ],
    portals: [{ ax: 400, ay: 62, bx: 400, by: 438, r: 18 }],
  },
];

export function pickArena(): ArenaLayout {
  return ARENAS[Math.floor(Math.random() * ARENAS.length)];
}

// ── Poderes ───────────────────────────────────────────────────────────────

export const POWERUP_INFO: Record<PowerUpKind, { emoji: string; label: string; color: string; desc: string }> = {
  turbo:   { emoji: '⚡', label: 'TURBO',        color: '#facc15', desc: 'Enche a barra do Super Chute' },
  gelo:    { emoji: '🧊', label: 'GELO',         color: '#7dd3fc', desc: 'Congela um botão adversário' },
  gigante: { emoji: '🐘', label: 'GIGANTE',      color: '#c084fc', desc: 'Botão gigante por 4 jogadas' },
  extra:   { emoji: '🔁', label: 'JOGADA EXTRA', color: '#4ade80', desc: 'Joga duas vezes seguidas' },
};

const POWERUP_KINDS: PowerUpKind[] = ['turbo', 'gelo', 'gigante', 'extra'];
export const POWERUP_RADIUS = 14;

/** Finds a free spot and returns a new power-up, or null if the pitch is too crowded. */
export function spawnPowerUp(buttons: ButtonPiece[], ball: Ball, world: World): PowerUp | null {
  for (let attempt = 0; attempt < 24; attempt++) {
    const x = 150 + Math.random() * (FIELD.WIDTH - 300);
    const y = 60 + Math.random() * (FIELD.HEIGHT - 120);
    if (Math.hypot(x - ball.x, y - ball.y) < 60) continue;
    if (buttons.some(b => Math.hypot(x - b.x, y - b.y) < b.radius + 46)) continue;
    if (world.powerups.some(p => Math.hypot(x - p.x, y - p.y) < 90)) continue;
    const a = world.arena;
    if (a) {
      if (a.bumpers.some(e => Math.hypot(x - e.x, y - e.y) < e.r + 30)) continue;
      if (a.mud.some(e => Math.hypot(x - e.x, y - e.y) < e.r + 20)) continue;
      if (a.boosts.some(e => Math.hypot(x - e.x, y - e.y) < e.r + 20)) continue;
      if (a.portals.some(e =>
        Math.hypot(x - e.ax, y - e.ay) < e.r + 30 || Math.hypot(x - e.bx, y - e.by) < e.r + 30)) continue;
    }
    const kind = POWERUP_KINDS[Math.floor(Math.random() * POWERUP_KINDS.length)];
    return { id: `pu-${Date.now()}-${Math.floor(Math.random() * 1e6)}`, kind, x, y, r: POWERUP_RADIUS };
  }
  return null;
}

export interface Meters {
  energy: Record<TeamSide, number>;      // 0..100 — Super Chute
  extraTurns: Record<TeamSide, number>;  // pending extra moves
}

export function newMeters(): Meters {
  return { energy: { A: 0, B: 0 }, extraTurns: { A: 0, B: 0 } };
}

export const ENERGY_PER_TURN = 25;
export const ENERGY_ON_CONCEDE = 30;

/** Applies a collected power-up. Returns the banner text to show. */
export function applyPowerUp(
  kind: PowerUpKind, buttonId: string, side: TeamSide,
  buttons: ButtonPiece[], ball: Ball, meters: Meters, currentTurn: TeamSide,
): string {
  const info = POWERUP_INFO[kind];
  switch (kind) {
    case 'turbo':
      meters.energy[side] = 100;
      break;
    case 'extra':
      meters.extraTurns[side] += 1;
      break;
    case 'gigante': {
      const btn = buttons.find(b => b.id === buttonId);
      if (btn) { btn.radius = GIANT_RADIUS; btn.giantTurns = 4; }
      break;
    }
    case 'gelo': {
      const rivals = buttons.filter(b => b.teamSide !== side);
      const pool = rivals.filter(b => !b.frozenTurns);
      // Never freeze a team's only usable button
      if (pool.length >= 2) {
        let victim = pool[0];
        let best = Infinity;
        for (const b of pool) {
          const d = Math.hypot(b.x - ball.x, b.y - ball.y);
          if (d < best) { best = d; victim = b; }
        }
        // Must still be frozen during the victim team's NEXT own turn
        victim.frozenTurns = victim.teamSide === currentTurn ? 2 : 1;
      }
      break;
    }
  }
  return `${info.emoji} ${info.label}!`;
}

/** Bookkeeping when `side` finishes a move. */
export function endOfTurnEffects(buttons: ButtonPiece[], side: TeamSide): void {
  for (const b of buttons) {
    if (b.superActive) b.superActive = false;
    if (b.giantTurns) {
      b.giantTurns -= 1;
      if (b.giantTurns <= 0) { b.giantTurns = 0; b.radius = BUTTON_RADIUS; }
    }
    if (b.frozenTurns && b.teamSide === side) b.frozenTurns -= 1;
  }
}

export function canLaunch(b: ButtonPiece): boolean {
  return !b.frozenTurns;
}

/** Guarantees the side to play has at least one usable button. */
export function ensurePlayable(buttons: ButtonPiece[], side: TeamSide): void {
  const mine = buttons.filter(b => b.teamSide === side);
  if (mine.length && !mine.some(canLaunch)) mine.forEach(b => { b.frozenTurns = 0; });
}

// ── Forward simulation ────────────────────────────────────────────────────

export interface SimResult {
  scorer: TeamSide | null;
  buttons: ButtonPiece[];
  ball: Ball;
  world: World;
  frames: number;
  ballTouched: boolean;
  wallBounces: number;
  pickups: { side: TeamSide; kind: PowerUpKind }[];
}

export interface SimTrace { button: Vec2[]; ball: Vec2[]; }

/**
 * Plays a launch forward on a COPY of the state using the real physics engine.
 * `trace` (optional) records the path of the launched button and of the ball.
 */
export function simulateLaunch(
  buttons: ButtonPiece[], ball: Ball, world: World,
  buttonId: string, vx: number, vy: number, useSuper: boolean,
  maxFrames = TURN_FRAME_LIMIT, trace?: SimTrace,
): SimResult {
  const bs = buttons.map(b => ({ ...b }));
  const bl = { ...ball };
  const w: World = { arena: world.arena, powerups: world.powerups.slice() };
  const res: SimResult = {
    scorer: null, buttons: bs, ball: bl, world: w,
    frames: 0, ballTouched: false, wallBounces: 0, pickups: [],
  };
  const me = bs.find(b => b.id === buttonId);
  if (!me) return res;
  const mult = useSuper ? SUPER_MULT : 1;
  me.vx = vx * mult;
  me.vy = vy * mult;
  if (useSuper) me.superActive = true;

  const events: PhysEvent[] = [];
  for (let f = 0; f < maxFrames; f++) {
    events.length = 0;
    const scorer = stepPhysics(bs, bl, w, events);
    res.frames = f + 1;
    for (const ev of events) {
      if (ev.type === 'hit' && ev.ball) { res.ballTouched = true; res.wallBounces = 0; }
      else if (ev.type === 'wall' || ev.type === 'bumper') { if (res.ballTouched) res.wallBounces++; }
      else if (ev.type === 'pickup') res.pickups.push({ side: ev.side, kind: ev.powerup.kind });
    }
    if (trace && f % 2 === 0) {
      trace.button.push({ x: me.x, y: me.y });
      if (res.ballTouched) trace.ball.push({ x: bl.x, y: bl.y });
    }
    if (scorer) { res.scorer = scorer; break; }
    if (!isMoving(bs, bl)) break;
  }
  return res;
}
