// src/game/physics.ts
import { ButtonPiece, Ball, TeamSide } from './types';

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

// Masses — ratio determines momentum transfer
const BUTTON_MASS = 2.0;  // heavier button
const BALL_MASS   = 1.0;  // lighter ball (button:ball = 2:1 like real futebol de botão)

// ── helpers ─────────────────────────────────────────────────────────────────

export function isMoving(buttons: ButtonPiece[], ball: Ball): boolean {
  if (speed(ball) > MIN_SPEED) return true;
  return buttons.some(b => speed(b) > MIN_SPEED);
}

function speed(obj: { vx: number; vy: number }): number {
  return Math.hypot(obj.vx, obj.vy);
}

// ── circle vs circle collision (elastic + CoR) ───────────────────────────────

export function resolveCircles(
  ax: number, ay: number, avx: number, avy: number, ar: number, am: number,
  bx: number, by: number, bvx: number, bvy: number, br: number, bm: number,
): { avx: number; avy: number; bvx: number; bvy: number; ax: number; ay: number; bx: number; by: number } | null {
  const dx = bx - ax;
  const dy = by - ay;
  const dist = Math.hypot(dx, dy);
  const minDist = ar + br;

  if (dist >= minDist || dist < 0.001) return null;

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

// ── main step (called SUBSTEPS times per frame, with dt = 1/SUBSTEPS) ────────
// Returns the scoring team if a goal happened this sub-step, otherwise null.

function subStep(buttons: ButtonPiece[], ball: Ball, dt: number): TeamSide | null {
  const GY1 = FIELD.HEIGHT / 2 - FIELD.GOAL_WIDTH / 2;
  const GY2 = FIELD.HEIGHT / 2 + FIELD.GOAL_WIDTH / 2;
  const GD  = FIELD.GOAL_DEPTH;
  const W   = FIELD.WIDTH;
  const H   = FIELD.HEIGHT;
  const B   = FIELD.BORDER;
  const br  = ball.radius;

  // ── Move ──────────────────────────────────────────────────────────────────
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  for (const btn of buttons) {
    btn.x += btn.vx * dt;
    btn.y += btn.vy * dt;
  }

  // ── Goal detection (BEFORE any wall bounce so the ball isn't pushed back) ──
  // Ball centre crosses x=0 (left canvas edge) inside goal opening → Team B scored
  if (ball.x - br < 0 && ball.y >= GY1 && ball.y <= GY2) return 'B';
  // Ball centre crosses x=W (right canvas edge) → Team A scored
  if (ball.x + br > W && ball.y >= GY1 && ball.y <= GY2) return 'A';

  // ── Ball wall collisions ──────────────────────────────────────────────────

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
  const posts = [
    { x: B, y: GY1 }, { x: B, y: GY2 },
    { x: W - B, y: GY1 }, { x: W - B, y: GY2 },
  ];
  for (const post of posts) {
    const dx = ball.x - post.x;
    const dy = ball.y - post.y;
    const dist = Math.hypot(dx, dy);
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

  // ── Button wall collisions ────────────────────────────────────────────────
  for (const btn of buttons) {
    const r = btn.radius;
    if (btn.x - r < B) { btn.x = B + r; btn.vx =  Math.abs(btn.vx) * RESTITUTION; }
    if (btn.x + r > W - B) { btn.x = W - B - r; btn.vx = -Math.abs(btn.vx) * RESTITUTION; }
    if (btn.y - r < B) { btn.y = B + r; btn.vy =  Math.abs(btn.vy) * RESTITUTION; }
    if (btn.y + r > H - B) { btn.y = H - B - r; btn.vy = -Math.abs(btn.vy) * RESTITUTION; }
  }

  // ── Button vs Button collisions ───────────────────────────────────────────
  for (let i = 0; i < buttons.length; i++) {
    for (let j = i + 1; j < buttons.length; j++) {
      const a = buttons[i];
      const b = buttons[j];
      const res = resolveCircles(
        a.x, a.y, a.vx, a.vy, a.radius, BUTTON_MASS,
        b.x, b.y, b.vx, b.vy, b.radius, BUTTON_MASS,
      );
      if (res) {
        a.vx = res.avx; a.vy = res.avy; a.x = res.ax; a.y = res.ay;
        b.vx = res.bvx; b.vy = res.bvy; b.x = res.bx; b.y = res.by;
      }
    }
  }

  // ── Button vs Ball collisions ─────────────────────────────────────────────
  for (const btn of buttons) {
    const res = resolveCircles(
      btn.x, btn.y, btn.vx, btn.vy, btn.radius, BUTTON_MASS,
      ball.x, ball.y, ball.vx, ball.vy, ball.radius, BALL_MASS,
    );
    if (res) {
      btn.vx = res.avx; btn.vy = res.avy; btn.x = res.ax; btn.y = res.ay;
      ball.vx = res.bvx; ball.vy = res.bvy; ball.x = res.bx; ball.y = res.by;
    }
  }

  return null;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Run one full frame of physics (4 sub-steps).
 * Mutates buttons and ball in place.
 * Returns the scoring TeamSide if a goal was detected, otherwise null.
 */
export function stepPhysics(buttons: ButtonPiece[], ball: Ball): TeamSide | null {
  const dt = 1 / SUBSTEPS;
  const fricPerSub = Math.pow(FRICTION, dt);

  for (let s = 0; s < SUBSTEPS; s++) {
    const goal = subStep(buttons, ball, dt);
    if (goal) return goal; // stop immediately — no more movement after a goal

    // Per-substep friction (total = FRICTION per frame)
    ball.vx *= fricPerSub; ball.vy *= fricPerSub;
    if (Math.abs(ball.vx) < MIN_SPEED / SUBSTEPS) ball.vx = 0;
    if (Math.abs(ball.vy) < MIN_SPEED / SUBSTEPS) ball.vy = 0;
    for (const btn of buttons) {
      btn.vx *= fricPerSub; btn.vy *= fricPerSub;
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
  const R  = 22;
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
