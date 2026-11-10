// src/game/physics.ts
import { ButtonPiece, Ball, TeamSide, World, PhysEvent, Bumper } from './types';

export const FIELD = {
  WIDTH: 800,
  HEIGHT: 500,
  GOAL_WIDTH: 90,
  GOAL_DEPTH: 22,
  BORDER: 10,
};

export const FRICTION        = 0.978;  // per-frame velocity multiplier
export const RESTITUTION     = 0.62;   // bounciness (1 = fully elastic)
export const MIN_SPEED       = 0.18;
export const MAX_LAUNCH_FORCE = 16;
export const SUBSTEPS        = 4;      // sub-steps per frame (anti-tunneling)

export const BUTTON_RADIUS    = 22;
export const GIANT_RADIUS     = 30;
export const SUPER_MULT       = 1.6;   // Super Chute launch multiplier
export const MAX_BALL_SPEED   = 24;
export const TURN_FRAME_LIMIT = 210;   // a move is cut after 3.5s @60fps

const MUD_FRICTION = 0.90;  // extra per-frame multiplier inside lama
const BOOST_ACCEL  = 0.38;  // per-frame acceleration on an acelerador

// Masses — ratio determines momentum transfer
const BUTTON_MASS = 2.0;  // heavier button
const BALL_MASS   = 1.0;  // lighter ball (button:ball = 2:1 like real futebol de botão)

export function massOf(btn: ButtonPiece): number {
  return BUTTON_MASS * (btn.giantTurns ? 1.8 : 1) * (btn.superActive ? 2 : 1);
}

/** Launch speed that makes a free-sliding button stop after roughly `d` pixels. */
export function launchSpeedForDistance(d: number): number {
  return Math.min(MAX_LAUNCH_FORCE, d * (1 - FRICTION) + 0.12);
}

// ── helpers ─────────────────────────────────────────────────────────────────

const MIN_SPEED_SQ = MIN_SPEED * MIN_SPEED;

export function isMoving(buttons: ButtonPiece[], ball: Ball): boolean {
  if (ball.vx * ball.vx + ball.vy * ball.vy > MIN_SPEED_SQ) return true;
  for (let i = 0; i < buttons.length; i++) {
    const b = buttons[i];
    if (b.vx * b.vx + b.vy * b.vy > MIN_SPEED_SQ) return true;
  }
  return false;
}

// ── circle vs circle collision (elastic + CoR) ───────────────────────────────

export function resolveCircles(
  ax: number, ay: number, avx: number, avy: number, ar: number, am: number,
  bx: number, by: number, bvx: number, bvy: number, br: number, bm: number,
): { avx: number; avy: number; bvx: number; bvy: number; ax: number; ay: number; bx: number; by: number } | null {
  const dx = bx - ax;
  const dy = by - ay;
  const minDist = ar + br;
  const distSq = dx * dx + dy * dy;
  // Squared-distance early exit: this runs for every pair on every sub-step
  if (distSq >= minDist * minDist) return null;
  const dist = Math.sqrt(distSq);
  if (dist < 0.001) return null;

  // --- Separate overlapping circles ---
  const overlap = minDist - dist;
  const nx = dx / dist;
  const ny = dy / dist;
  const pushA = overlap * (bm / (am + bm));
  const pushB = overlap * (am / (am + bm));

  const newAx = ax - nx * pushA;
  const newAy = ay - ny * pushA;
  const newBx = bx + nx * pushB;
  const newBy = by + ny * pushB;

  // --- Velocity impulse (1D along normal) ---
  const relVx = avx - bvx;
  const relVy = avy - bvy;
  const velAlongNormal = relVx * nx + relVy * ny;

  // nx points FROM A → B, so velAlongNormal > 0 means A is approaching B → need impulse
  // velAlongNormal <= 0 means objects are separating or stationary → no impulse needed
  if (velAlongNormal <= 0) {
    return { avx, avy, bvx, bvy, ax: newAx, ay: newAy, bx: newBx, by: newBy };
  }

  const e = RESTITUTION;
  const impulseScalar = -(1 + e) * velAlongNormal / (1 / am + 1 / bm);

  return {
    avx: avx + (impulseScalar / am) * nx,
    avy: avy + (impulseScalar / am) * ny,
    bvx: bvx - (impulseScalar / bm) * nx,
    bvy: bvy - (impulseScalar / bm) * ny,
    ax: newAx, ay: newAy,
    bx: newBx, by: newBy,
  };
}

// ── arena helpers ────────────────────────────────────────────────────────────

/** Bounce a moving circle off a static bumper. Returns impact speed (0 = no impact). */
function bumperBounce(
  o: { x: number; y: number; vx: number; vy: number; radius: number },
  bp: Bumper, e: number, minKick: number,
): number {
  const dx = o.x - bp.x;
  const dy = o.y - bp.y;
  const minDist = o.radius + bp.r;
  const distSq = dx * dx + dy * dy;
  if (distSq >= minDist * minDist) return 0;
  const dist = Math.sqrt(distSq);
  if (dist < 0.001) return 0;
  const nx = dx / dist;
  const ny = dy / dist;
  o.x = bp.x + nx * minDist;
  o.y = bp.y + ny * minDist;
  const dot = o.vx * nx + o.vy * ny;
  if (dot >= 0) return 0;
  o.vx -= (1 + e) * dot * nx;
  o.vy -= (1 + e) * dot * ny;
  if (dot < -0.3 && minKick > 0) {
    const out = o.vx * nx + o.vy * ny;
    if (out < minKick) { o.vx += (minKick - out) * nx; o.vy += (minKick - out) * ny; }
  }
  return -dot;
}

const GY1 = FIELD.HEIGHT / 2 - FIELD.GOAL_WIDTH / 2;
const GY2 = FIELD.HEIGHT / 2 + FIELD.GOAL_WIDTH / 2;
const POSTS = [
  { x: FIELD.BORDER, y: GY1 }, { x: FIELD.BORDER, y: GY2 },
  { x: FIELD.WIDTH - FIELD.BORDER, y: GY1 }, { x: FIELD.WIDTH - FIELD.BORDER, y: GY2 },
];

// ── main step (called SUBSTEPS times per frame, with dt = 1/SUBSTEPS) ────────
// Returns the scoring team if a goal happened this sub-step, otherwise null.

function subStep(
  buttons: ButtonPiece[], ball: Ball, dt: number,
  world: World | undefined, events: PhysEvent[] | undefined,
): TeamSide | null {
  const GD  = FIELD.GOAL_DEPTH;
  const W   = FIELD.WIDTH;
  const H   = FIELD.HEIGHT;
  const B   = FIELD.BORDER;
  const br  = ball.radius;
  const arena = world?.arena;

  // ── Aceleradores (push the ball while it is on the pad) ───────────────────
  if (arena) {
    for (const pad of arena.boosts) {
      if (Math.hypot(ball.x - pad.x, ball.y - pad.y) < pad.r) {
        ball.vx += pad.dx * BOOST_ACCEL * dt;
        ball.vy += pad.dy * BOOST_ACCEL * dt;
      }
    }
    const sp = Math.hypot(ball.vx, ball.vy);
    if (sp > MAX_BALL_SPEED) { ball.vx *= MAX_BALL_SPEED / sp; ball.vy *= MAX_BALL_SPEED / sp; }
  }

  // ── Move ──────────────────────────────────────────────────────────────────
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  for (const btn of buttons) {
    if (btn.vx === 0 && btn.vy === 0) continue;
    btn.x += btn.vx * dt;
    btn.y += btn.vy * dt;
  }

  // ── Portais (ball only) ───────────────────────────────────────────────────
  if (arena && arena.portals.length) {
    if (ball.inPortal) {
      let outside = true;
      for (const p of arena.portals) {
        if (Math.hypot(ball.x - p.ax, ball.y - p.ay) < p.r + 2 ||
            Math.hypot(ball.x - p.bx, ball.y - p.by) < p.r + 2) { outside = false; break; }
      }
      if (outside) ball.inPortal = false;
    } else {
      for (const p of arena.portals) {
        const inA = Math.hypot(ball.x - p.ax, ball.y - p.ay) < p.r * 0.75;
        const inB = !inA && Math.hypot(ball.x - p.bx, ball.y - p.by) < p.r * 0.75;
        if (inA || inB) {
          const fx = ball.x, fy = ball.y;
          ball.x = inA ? p.bx : p.ax;
          ball.y = inA ? p.by : p.ay;
          ball.inPortal = true;
          events?.push({ type: 'portal', x: fx, y: fy, tx: ball.x, ty: ball.y });
          break;
        }
      }
    }
  }

  // ── Goal detection (BEFORE any wall bounce so the ball isn't pushed back) ──
  // Ball centre crosses x=0 (left canvas edge) inside goal opening → Team B scored
  if (ball.x - br < 0 && ball.y >= GY1 && ball.y <= GY2) return 'B';
  // Ball centre crosses x=W (right canvas edge) → Team A scored
  if (ball.x + br > W && ball.y >= GY1 && ball.y <= GY2) return 'A';

  // ── Ball wall collisions ──────────────────────────────────────────────────
  const pvx = ball.vx, pvy = ball.vy;

  // Left wall — open in goal Y range (ball passes through for goal detection above)
  if (ball.x - br < B) {
    if (ball.y < GY1 || ball.y > GY2) {
      ball.x = B + br;
      ball.vx = Math.abs(ball.vx) * RESTITUTION;
    }
    // else: ball is sliding into the goal opening, let it through
  }

  // Right wall
  if (ball.x + br > W - B) {
    if (ball.y < GY1 || ball.y > GY2) {
      ball.x = W - B - br;
      ball.vx = -Math.abs(ball.vx) * RESTITUTION;
    }
  }

  // Top / Bottom
  if (ball.y - br < B) { ball.y = B + br; ball.vy =  Math.abs(ball.vy) * RESTITUTION; }
  if (ball.y + br > H - B) { ball.y = H - B - br; ball.vy = -Math.abs(ball.vy) * RESTITUTION; }

  // Goal back-wall — only reached if ball didn't score yet
  if (ball.y >= GY1 && ball.y <= GY2) {
    if (ball.x - br < -GD) { ball.x = -GD + br; ball.vx =  Math.abs(ball.vx) * RESTITUTION; }
    if (ball.x + br > W + GD) { ball.x = W + GD - br; ball.vx = -Math.abs(ball.vx) * RESTITUTION; }
  }

  // Goal post corners (small circular deflectors at the four goal posts)
  for (const post of POSTS) {
    const dx = ball.x - post.x;
    const dy = ball.y - post.y;
    if (dx > br + 4 || dx < -br - 4 || dy > br + 4 || dy < -br - 4) continue;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < br + 4 && dist > 0.001) {
      const nx2 = dx / dist;
      const ny2 = dy / dist;
      ball.x = post.x + nx2 * (br + 4);
      ball.y = post.y + ny2 * (br + 4);
      const dot = ball.vx * nx2 + ball.vy * ny2;
      if (dot < 0) {
        ball.vx -= 2 * dot * nx2 * RESTITUTION;
        ball.vy -= 2 * dot * ny2 * RESTITUTION;
      }
    }
  }

  if (events && (ball.vx !== pvx || ball.vy !== pvy)) {
    const power = Math.hypot(ball.vx - pvx, ball.vy - pvy);
    if (power > 1.2) events.push({ type: 'wall', x: ball.x, y: ball.y, power });
  }

  // ── Button wall collisions ────────────────────────────────────────────────
  for (const btn of buttons) {
    if (btn.vx === 0 && btn.vy === 0) continue;
    const r = btn.radius;
    if (btn.x - r < B) { btn.x = B + r; btn.vx =  Math.abs(btn.vx) * RESTITUTION; }
    if (btn.x + r > W - B) { btn.x = W - B - r; btn.vx = -Math.abs(btn.vx) * RESTITUTION; }
    if (btn.y - r < B) { btn.y = B + r; btn.vy =  Math.abs(btn.vy) * RESTITUTION; }
    if (btn.y + r > H - B) { btn.y = H - B - r; btn.vy = -Math.abs(btn.vy) * RESTITUTION; }
  }

  // ── Bumpers ───────────────────────────────────────────────────────────────
  if (arena) {
    for (let i = 0; i < arena.bumpers.length; i++) {
      const bp = arena.bumpers[i];
      const hitBall = bumperBounce(ball, bp, 1.0, 5);
      if (hitBall > 0.5) events?.push({ type: 'bumper', index: i, x: bp.x, y: bp.y });
      for (const btn of buttons) {
        const hit = bumperBounce(btn, bp, 0.85, 0);
        if (hit > 0.5) events?.push({ type: 'bumper', index: i, x: bp.x, y: bp.y });
      }
    }
  }

  // ── Button vs Button collisions ───────────────────────────────────────────
  for (let i = 0; i < buttons.length; i++) {
    const a = buttons[i];
    const aStill = a.vx === 0 && a.vy === 0;
    for (let j = i + 1; j < buttons.length; j++) {
      const b = buttons[j];
      // Two resting buttons cannot start colliding
      if (aStill && b.vx === 0 && b.vy === 0) continue;
      const pdx = b.x - a.x, pdy = b.y - a.y, pmd = a.radius + b.radius;
      if (pdx * pdx + pdy * pdy >= pmd * pmd) continue; // cheap reject before the full solver
      const res = resolveCircles(
        a.x, a.y, a.vx, a.vy, a.radius, massOf(a),
        b.x, b.y, b.vx, b.vy, b.radius, massOf(b),
      );
      if (res) {
        if (events) {
          const power = Math.hypot(res.bvx - b.vx, res.bvy - b.vy);
          if (power > 1) events.push({ type: 'hit', x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, power, ball: false });
        }
        a.vx = res.avx; a.vy = res.avy; a.x = res.ax; a.y = res.ay;
        b.vx = res.bvx; b.vy = res.bvy; b.x = res.bx; b.y = res.by;
      }
    }
  }

  // ── Button vs Ball collisions ─────────────────────────────────────────────
  for (const btn of buttons) {
    const qdx = ball.x - btn.x, qdy = ball.y - btn.y, qmd = btn.radius + ball.radius;
    if (qdx * qdx + qdy * qdy >= qmd * qmd) continue;
    const res = resolveCircles(
      btn.x, btn.y, btn.vx, btn.vy, btn.radius, massOf(btn),
      ball.x, ball.y, ball.vx, ball.vy, ball.radius, BALL_MASS,
    );
    if (res) {
      if (events) {
        const power = Math.hypot(res.bvx - ball.vx, res.bvy - ball.vy);
        if (power > 0.4) events.push({ type: 'hit', x: ball.x, y: ball.y, power, ball: true, side: btn.teamSide });
      }
      btn.vx = res.avx; btn.vy = res.avy; btn.x = res.ax; btn.y = res.ay;
      ball.vx = res.bvx; ball.vy = res.bvy; ball.x = res.bx; ball.y = res.by;
    }
  }

  // ── Power-up pickups (first button to touch it wins it for its team) ──────
  if (world && world.powerups.length) {
    for (let i = world.powerups.length - 1; i >= 0; i--) {
      const pu = world.powerups[i];
      for (const btn of buttons) {
        if (btn.vx === 0 && btn.vy === 0) continue;
        if (Math.hypot(btn.x - pu.x, btn.y - pu.y) < btn.radius + pu.r) {
          world.powerups.splice(i, 1);
          events?.push({ type: 'pickup', powerup: pu, buttonId: btn.id, side: btn.teamSide });
          break;
        }
      }
    }
  }

  return null;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Run one full frame of physics (4 sub-steps).
 * Mutates buttons, ball and world.powerups in place.
 * `events` (optional) collects impacts / pickups for effects and for the AI.
 * Returns the scoring TeamSide if a goal was detected, otherwise null.
 */
export function stepPhysics(
  buttons: ButtonPiece[], ball: Ball,
  world?: World, events?: PhysEvent[],
): TeamSide | null {
  const dt = 1 / SUBSTEPS;
  const fricPerSub = Math.pow(FRICTION, dt);
  const mudPerSub  = Math.pow(MUD_FRICTION, dt);
  const mud = world?.arena?.mud;
  const inMud = (x: number, y: number) => {
    if (!mud) return false;
    for (const m of mud) if (Math.hypot(x - m.x, y - m.y) < m.r) return true;
    return false;
  };

  for (let s = 0; s < SUBSTEPS; s++) {
    const goal = subStep(buttons, ball, dt, world, events);
    if (goal) return goal; // stop immediately — no more movement after a goal

    // Per-substep friction (total = FRICTION per frame)
    const fb = fricPerSub * (inMud(ball.x, ball.y) ? mudPerSub : 1);
    ball.vx *= fb; ball.vy *= fb;
    if (Math.abs(ball.vx) < MIN_SPEED / SUBSTEPS) ball.vx = 0;
    if (Math.abs(ball.vy) < MIN_SPEED / SUBSTEPS) ball.vy = 0;
    for (const btn of buttons) {
      if (btn.vx === 0 && btn.vy === 0) continue;
      const f = fricPerSub * (inMud(btn.x, btn.y) ? mudPerSub : 1);
      btn.vx *= f; btn.vy *= f;
      if (Math.abs(btn.vx) < MIN_SPEED / SUBSTEPS) btn.vx = 0;
      if (Math.abs(btn.vy) < MIN_SPEED / SUBSTEPS) btn.vy = 0;
    }
  }

  return null;
}


// ── Initial positions ─────────────────────────────────────────────────────────

export function getInitialPositions(
  teamAId: string, teamBId: string,
  teamANames: string[], teamBNames: string[],
  teamALogo: string, teamBLogo: string,
  teamAColor: string, teamBColor: string,
  excludeIds?: string[],
): { buttons: ButtonPiece[]; ball: Ball } {
  const R  = BUTTON_RADIUS;
  const W  = FIELD.WIDTH;
  const H  = FIELD.HEIGHT;
  const cx = H / 2;

  const posA = [
    { x: 70,  y: cx,       gk: true  },
    { x: 210, y: cx - 130, gk: false },
    { x: 210, y: cx - 43,  gk: false },
    { x: 210, y: cx + 43,  gk: false },
    { x: 210, y: cx + 130, gk: false },
  ];
  const posB = [
    { x: W - 70,  y: cx,       gk: true  },
    { x: W - 210, y: cx - 130, gk: false },
    { x: W - 210, y: cx - 43,  gk: false },
    { x: W - 210, y: cx + 43,  gk: false },
    { x: W - 210, y: cx + 130, gk: false },
  ];

  const buttons: ButtonPiece[] = [];

  posA.forEach((p, i) => {
    const id = `A-${i}`;
    if (excludeIds?.includes(id)) return;
    const name = teamANames[i] || `J${i + 1}`;
    buttons.push({
      id, teamSide: 'A', isGoalkeeper: p.gk,
      playerName: name, shortName: name,
      x: p.x, y: p.y, vx: 0, vy: 0, radius: R,
      teamId: teamAId, logoUrl: teamALogo, primaryColor: teamAColor,
    });
  });

  posB.forEach((p, i) => {
    const id = `B-${i}`;
    if (excludeIds?.includes(id)) return;
    const name = teamBNames[i] || `J${i + 1}`;
    buttons.push({
      id, teamSide: 'B', isGoalkeeper: p.gk,
      playerName: name, shortName: name,
      x: p.x, y: p.y, vx: 0, vy: 0, radius: R,
      teamId: teamBId, logoUrl: teamBLogo, primaryColor: teamBColor,
    });
  });

  return {
    buttons,
    ball: { x: W / 2, y: H / 2, vx: 0, vy: 0, radius: 10 },
  };
}
