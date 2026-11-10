// src/game/ai.ts
// Simulation-based AI.
//
// Instead of scoring moves with geometric guesses, the AI now:
//   1. generates hundreds of candidate launches (aimed shots, wall bank shots,
//      a full radial sweep for caroms, defensive blocks, set-ups, power-up grabs);
//   2. plays every one forward with the REAL physics engine (bumpers, lama,
//      aceleradores, portais and power-ups included);
//   3. scores the resulting position (goal, ball progress, danger, shooting lanes,
//      goalkeeper position, power-ups collected);
//   4. on the harder levels, refines the best candidates with tiny angle/force
//      variations and simulates the OPPONENT's best answers, discarding moves
//      that hand over an easy goal (2-ply look-ahead).
import { ButtonPiece, Ball, AIDifficulty, TeamSide, World } from './types';
import { FIELD, MAX_LAUNCH_FORCE, launchSpeedForDistance } from './physics';
import { canLaunch, simulateLaunch, SimResult } from './mechanics';

export type AIIntent = 'shot' | 'bank' | 'clear' | 'block' | 'setup' | 'power' | 'carom';

export interface AIContext {
  side: TeamSide;
  buttons: ButtonPiece[];
  ball: Ball;
  world: World;
  difficulty: AIDifficulty;
  /** Super Chute energy (0..100) of each side. */
  energy: Record<TeamSide, number>;
}

export interface AIDecision {
  buttonId: string;
  vx: number;
  vy: number;
  useSuper: boolean;
  intent: AIIntent;
  /** Short text shown in the AI's "thought bubble". */
  label: string;
  /** How many launches were simulated to reach this decision. */
  simulations: number;
}

interface Candidate {
  buttonId: string;
  vx: number;
  vy: number;
  useSuper: boolean;
  kind: AIIntent;
  score: number;
  sim?: SimResult;
}

interface Profile {
  goalTargets: number[];     // Y offsets from goal centre
  shotForces: number[];      // fractions of MAX_LAUNCH_FORCE
  bank: boolean;
  radialAngles: number;
  radialForces: number[];
  defense: boolean;
  refineTop: number;
  replyTop: number;
  replyTargets: number[];
  replyForces: number[];
  noiseAngle: number;        // total spread in radians
  noisePower: number;        // max power loss (0..1)
  pickTop: number;           // choose randomly among the N best
  superPolicy: 'never' | 'random' | 'smart';
}

const PROFILES: Record<AIDifficulty, Profile> = {
  easy: {
    goalTargets: [-22, 0, 22], shotForces: [0.7], bank: false,
    radialAngles: 8, radialForces: [0.6], defense: false,
    refineTop: 0, replyTop: 0, replyTargets: [], replyForces: [],
    noiseAngle: 0.17, noisePower: 0.25, pickTop: 4, superPolicy: 'random',
  },
  medium: {
    goalTargets: [-30, -15, 0, 15, 30], shotForces: [0.6, 0.9], bank: true,
    radialAngles: 16, radialForces: [0.5, 0.9], defense: true,
    refineTop: 0, replyTop: 0, replyTargets: [], replyForces: [],
    noiseAngle: 0.045, noisePower: 0.06, pickTop: 1, superPolicy: 'smart',
  },
  hard: {
    goalTargets: [-32, -16, 0, 16, 32], shotForces: [0.5, 0.7, 0.9, 1], bank: true,
    radialAngles: 20, radialForces: [0.5, 1], defense: true,
    refineTop: 5, replyTop: 4, replyTargets: [-20, 0, 20], replyForces: [0.7, 1],
    noiseAngle: 0.012, noisePower: 0, pickTop: 1, superPolicy: 'smart',
  },
  legend: {
    goalTargets: [-34, -22, -11, 0, 11, 22, 34], shotForces: [0.45, 0.6, 0.75, 0.9, 1], bank: true,
    radialAngles: 28, radialForces: [0.4, 0.7, 1], defense: true,
    refineTop: 8, replyTop: 8, replyTargets: [-28, -14, 0, 14, 28], replyForces: [0.6, 0.8, 1],
    noiseAngle: 0, noisePower: 0, pickTop: 1, superPolicy: 'smart',
  },
};

const CY = FIELD.HEIGHT / 2;

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 < 0.0001) return Math.hypot(px - ax, py - ay);
  const u = clamp(((px - ax) * dx + (py - ay) * dy) / len2, 0, 1);
  return Math.hypot(px - (ax + u * dx), py - (ay + u * dy));
}

const goalX = (attacker: TeamSide) => (attacker === 'A' ? FIELD.WIDTH : 0);

/**
 * Direction a button must travel so that it hits the ball towards (tx, ty).
 * Returns null when the button is on the wrong side of the ball.
 */
function aimThroughBall(b: ButtonPiece, ball: Ball, tx: number, ty: number) {
  const gx = tx - ball.x, gy = ty - ball.y;
  const gl = Math.hypot(gx, gy);
  if (gl < 1) return null;
  const dx = gx / gl, dy = gy / gl;
  const cx = ball.x - dx * (b.radius + ball.radius);
  const cy = ball.y - dy * (b.radius + ball.radius);
  const px = cx - b.x, py = cy - b.y;
  const pl = Math.hypot(px, py);
  if (pl < 1) return { nx: dx, ny: dy, align: 1, dist: 0 };
  const nx = px / pl, ny = py / pl;
  const align = nx * dx + ny * dy;
  if (align < 0.15) return null;
  return { nx, ny, align, dist: pl };
}

/** 0..1 — how good a shooting chance `side` has in this position. */
function laneQuality(side: TeamSide, buttons: ButtonPiece[], ball: Ball): number {
  const gx = goalX(side);
  let best = 0;
  for (const b of buttons) {
    if (b.teamSide !== side || !canLaunch(b)) continue;
    for (const off of [-25, 0, 25]) {
      const ty = CY + off;
      const aim = aimThroughBall(b, ball, gx, ty);
      if (!aim || aim.align < 0.5) continue;
      const cx = b.x + aim.nx * aim.dist, cy = b.y + aim.ny * aim.dist;
      let blocked = false;
      for (const o of buttons) {
        if (o.id === b.id) continue;
        if (segDist(o.x, o.y, ball.x, ball.y, gx, ty) < ball.radius + o.radius - 2 ||
            segDist(o.x, o.y, b.x, b.y, cx, cy) < b.radius + o.radius - 3) { blocked = true; break; }
      }
      if (blocked) continue;
      const q = aim.align
        * clamp(1 - Math.hypot(gx - ball.x, ty - ball.y) / 720, 0.12, 1)
        * clamp(1 - aim.dist / 520, 0.3, 1);
      if (q > best) best = q;
    }
  }
  return best;
}

function evaluate(sim: SimResult, side: TeamSide, usedSuper: boolean, lightThreat: boolean): number {
  if (sim.scorer === side) return 100000 - sim.frames * 5;
  if (sim.scorer) return -100000;

  const opp: TeamSide = side === 'A' ? 'B' : 'A';
  const { buttons, ball } = sim;
  const ogx = goalX(side);      // goal I attack
  const mgx = goalX(opp);       // goal I defend
  const dOpp = Math.hypot(ogx - ball.x, CY - ball.y);
  const dOwn = Math.hypot(mgx - ball.x, CY - ball.y);

  let score = (800 - dOpp) * 0.9;
  if (dOwn < 300) score -= (300 - dOwn) * 3;

  score += 170 * laneQuality(side, buttons, ball);
  score -= (lightThreat ? 160 : 440) * laneQuality(opp, buttons, ball);

  // Goalkeeper should stay home, shading towards the ball
  const gk = buttons.find(b => b.teamSide === side && b.isGoalkeeper);
  if (gk) {
    const hx = mgx + (side === 'A' ? 48 : -48);
    const hy = clamp(ball.y, CY - 32, CY + 32);
    score -= Math.min(Math.hypot(gk.x - hx, gk.y - hy), 260) * 0.65;
  }

  // Bodies between the ball and my goal
  if (dOwn < 430) {
    let blockers = 0;
    for (const b of buttons) {
      if (b.teamSide !== side) continue;
      if (segDist(b.x, b.y, ball.x, ball.y, mgx, CY) < b.radius + 6) blockers++;
    }
    score += Math.min(blockers, 2) * 55;
  }

  for (const p of sim.pickups) score += p.side === side ? 190 : -170;
  if (sim.ballTouched) score += 30;
  if (usedSuper) score -= 260; // do not burn the Super Chute on a move that does not score
  return score;
}

/** How many of the opponent's obvious answers score from this position. */
function* countScoringReplies(
  sim: SimResult, side: TeamSide, p: Profile, counter: { n: number },
): Generator<number, number, void> {
  const opp: TeamSide = side === 'A' ? 'B' : 'A';
  const gx = goalX(opp);
  let scoring = 0;
  for (const b of sim.buttons) {
    if (b.teamSide !== opp || !canLaunch(b)) continue;
    for (const off of p.replyTargets) {
      const aim = aimThroughBall(b, sim.ball, gx, CY + off);
      if (!aim) continue;
      for (const f of p.replyForces) {
        const v = f * MAX_LAUNCH_FORCE;
        counter.n++;
        const r = simulateLaunch(sim.buttons, sim.ball, sim.world, b.id, aim.nx * v, aim.ny * v, false, 170);
        if (r.scorer === opp) scoring++;
        yield counter.n;
      }
    }
  }
  return scoring;
}

function labelFor(c: Candidate, side: TeamSide): string {
  if (c.sim?.scorer === side) {
    if (c.useSuper) return '⚡ SUPER CHUTE!';
    if (c.kind === 'bank' || (c.sim.wallBounces > 0)) return '🧱 De tabela!';
    return '🎯 Pra dentro!';
  }
  if (c.sim?.pickups.some(p => p.side === side)) return '✨ Pega o poder!';
  switch (c.kind) {
    case 'shot':  return '🎯 Finalização';
    case 'bank':  return '🧱 Tabela';
    case 'clear': return '🧹 Afasta!';
    case 'block': return '🛡️ Fecha o gol';
    case 'setup': return '🧠 Armando a jogada';
    case 'power': return '✨ Pega o poder!';
    default:      return '🎱 Carambola';
  }
}

/**
 * The decision as a generator: it yields (the number of launches simulated so far)
 * after every simulation, so the caller can spread the thinking over several
 * frames instead of freezing the page. Use computeAIDecision() to run it in one go.
 */
export function* aiDecisionSteps(ctx: AIContext): Generator<number, AIDecision, void> {
  const { side, buttons, ball, world } = ctx;
  const p = PROFILES[ctx.difficulty] ?? PROFILES.medium;
  const opp: TeamSide = side === 'A' ? 'B' : 'A';
  const ogx = goalX(side);
  const mgx = goalX(opp);
  const dir = side === 'A' ? 1 : -1;
  let mine = buttons.filter(b => b.teamSide === side && canLaunch(b));
  if (mine.length === 0) mine = buttons.filter(b => b.teamSide === side);

  const cands: Candidate[] = [];
  const add = (b: ButtonPiece, nx: number, ny: number, speed: number, kind: AIIntent, useSuper = false) => {
    cands.push({ buttonId: b.id, vx: nx * speed, vy: ny * speed, useSuper, kind, score: 0 });
  };
  const canSuper = p.superPolicy === 'smart' && ctx.energy[side] >= 100;

  const topY = FIELD.BORDER + ball.radius;
  const botY = FIELD.HEIGHT - FIELD.BORDER - ball.radius;
  const dOwn = Math.hypot(mgx - ball.x, CY - ball.y);

  for (const b of mine) {
    // 1. Aimed shots at the goal mouth
    for (const off of p.goalTargets) {
      const aim = aimThroughBall(b, ball, ogx, CY + off);
      if (!aim) continue;
      for (const f of p.shotForces) add(b, aim.nx, aim.ny, f * MAX_LAUNCH_FORCE, 'shot');
      if (canSuper) add(b, aim.nx, aim.ny, MAX_LAUNCH_FORCE, 'shot', true);
    }

    // 2. Bank shots off the top / bottom wall (mirror the goal across the wall)
    if (p.bank) {
      for (const off of [-22, 0, 22]) {
        for (const wallY of [topY, botY]) {
          const aim = aimThroughBall(b, ball, ogx, 2 * wallY - (CY + off));
          if (!aim) continue;
          for (const f of p.shotForces) {
            if (f < 0.6) continue;
            add(b, aim.nx, aim.ny, f * MAX_LAUNCH_FORCE, 'bank');
          }
          if (canSuper) add(b, aim.nx, aim.ny, MAX_LAUNCH_FORCE, 'bank', true);
        }
      }
    }

    // 3. Radial sweep — finds caroms, pushes, blocks and anything geometry misses
    const phase = (b.x * 0.013 + b.y * 0.007) % 1;
    for (let i = 0; i < p.radialAngles; i++) {
      const a = ((i + phase) / p.radialAngles) * Math.PI * 2;
      for (const f of p.radialForces) add(b, Math.cos(a), Math.sin(a), f * MAX_LAUNCH_FORCE, 'carom');
    }

    if (p.defense) {
      // 4. Clearances towards the far corners when the ball is close to my goal
      if (dOwn < 360) {
        for (const ty of [70, FIELD.HEIGHT - 70]) {
          const aim = aimThroughBall(b, ball, FIELD.WIDTH / 2 + dir * 230, ty);
          if (!aim) continue;
          add(b, aim.nx, aim.ny, 0.8 * MAX_LAUNCH_FORCE, 'clear');
          add(b, aim.nx, aim.ny, MAX_LAUNCH_FORCE, 'clear');
        }
      }

      // 5. Slide into the line between the ball and my goal (stops there)
      const lx = ball.x - mgx, ly = ball.y - CY;
      const ll = Math.hypot(lx, ly) || 1;
      for (const d of [58, 115]) {
        if (ll < d + 30) continue;
        const tx = mgx + (lx / ll) * d, ty = CY + (ly / ll) * d;
        const mx = tx - b.x, my = ty - b.y;
        const ml = Math.hypot(mx, my);
        if (ml < 12) continue;
        add(b, mx / ml, my / ml, launchSpeedForDistance(ml), 'block');
      }

      // 6. Set up behind the ball for the next shot
      if (!b.isGoalkeeper) {
        const sx = ball.x - dir * 62;
        for (const sy of [ball.y, ball.y + (ball.y < CY ? -26 : 26)]) {
          const mx = sx - b.x, my = sy - b.y;
          const ml = Math.hypot(mx, my);
          if (ml < 12) continue;
          add(b, mx / ml, my / ml, launchSpeedForDistance(ml), 'setup');
        }
      }
    }

    // 7. Power-ups on the pitch
    for (const pu of world.powerups) {
      const mx = pu.x - b.x, my = pu.y - b.y;
      const ml = Math.hypot(mx, my);
      if (ml < 1) continue;
      add(b, mx / ml, my / ml, Math.min(MAX_LAUNCH_FORCE, launchSpeedForDistance(ml) + 0.6), 'power');
    }
  }

  const counter = { n: 0 };
  const run = (c: Candidate) => {
    counter.n++;
    c.sim = simulateLaunch(buttons, ball, world, c.buttonId, c.vx, c.vy, c.useSuper);
    c.score = evaluate(c.sim, side, c.useSuper, false);
  };
  for (const c of cands) { run(c); yield counter.n; }
  cands.sort((a, b) => b.score - a.score);

  // Refinement: tiny variations around the most promising launches
  if (p.refineTop > 0) {
    const extra: Candidate[] = [];
    for (const c of cands.slice(0, p.refineTop)) {
      if (c.score > 90000) continue; // already a goal
      const sp = Math.hypot(c.vx, c.vy);
      const ang = Math.atan2(c.vy, c.vx);
      for (const da of [-0.045, -0.025, -0.012, 0.012, 0.025, 0.045]) {
        extra.push({ ...c, vx: Math.cos(ang + da) * sp, vy: Math.sin(ang + da) * sp, sim: undefined });
      }
      for (const m of [0.9, 1.1]) {
        const s2 = Math.min(MAX_LAUNCH_FORCE, sp * m);
        extra.push({ ...c, vx: Math.cos(ang) * s2, vy: Math.sin(ang) * s2, sim: undefined });
      }
    }
    for (const c of extra) { run(c); yield counter.n; }
    cands.push(...extra);
    cands.sort((a, b) => b.score - a.score);
  }

  // 2-ply: throw away moves that leave the opponent an open goal
  if (p.replyTop > 0) {
    for (const c of cands.slice(0, p.replyTop)) {
      if (!c.sim || c.sim.scorer) continue;
      const n = yield* countScoringReplies(c.sim, side, p, counter);
      // The reply simulation already measures the danger, so soften the static estimate
      c.score = evaluate(c.sim, side, c.useSuper, true);
      if (n > 0) c.score -= 1800 + 260 * Math.min(n, 5);
    }
    cands.sort((a, b) => b.score - a.score);
  }

  let chosen = cands[0];
  if (p.pickTop > 1 && cands.length > 1) {
    chosen = cands[Math.floor(Math.random() * Math.min(p.pickTop, cands.length))];
  }
  if (!chosen) {
    // No candidate at all (should not happen) — nudge the closest button at the ball
    const b = mine[0] ?? buttons[0];
    const mx = ball.x - b.x, my = ball.y - b.y;
    const ml = Math.hypot(mx, my) || 1;
    return {
      buttonId: b.id, vx: (mx / ml) * 8, vy: (my / ml) * 8,
      useSuper: false, intent: 'carom', label: '🎱 Carambola', simulations: counter.n,
    };
  }

  let useSuper = chosen.useSuper;
  if (p.superPolicy === 'random' && ctx.energy[side] >= 100 && Math.random() < 0.5) useSuper = true;

  // Human-like imprecision on the lower levels
  const na = (Math.random() - 0.5) * p.noiseAngle;
  const np = 1 - Math.random() * p.noisePower;
  const cos = Math.cos(na), sin = Math.sin(na);

  return {
    buttonId: chosen.buttonId,
    vx: (chosen.vx * cos - chosen.vy * sin) * np,
    vy: (chosen.vx * sin + chosen.vy * cos) * np,
    useSuper,
    intent: chosen.kind,
    label: useSuper && chosen.sim?.scorer !== side ? '⚡ SUPER CHUTE!' : labelFor(chosen, side),
    simulations: counter.n,
  };
}

/** Runs the whole decision synchronously. */
export function computeAIDecision(ctx: AIContext): AIDecision {
  const gen = aiDecisionSteps(ctx);
  let r = gen.next();
  while (!r.done) r = gen.next();
  return r.value;
}

/** Kept for compatibility with older callers. */
export function computeAILaunch(
  aiSide: TeamSide, buttons: ButtonPiece[], ball: Ball, difficulty: AIDifficulty,
): { buttonId: string; vx: number; vy: number } {
  const d = computeAIDecision({
    side: aiSide, buttons, ball, difficulty,
    world: { arena: null, powerups: [] }, energy: { A: 0, B: 0 },
  });
  return { buttonId: d.buttonId, vx: d.vx, vy: d.vy };
}
