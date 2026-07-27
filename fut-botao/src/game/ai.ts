// src/game/ai.ts
import { ButtonPiece, Ball, AIDifficulty, Vec2 } from './types';
import { FIELD, MAX_LAUNCH_FORCE } from './physics';

function distance(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(bx - ax, by - ay);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function lineIntersectsCircle(
  p1: Vec2, p2: Vec2,
  center: Vec2, radius: number
): boolean {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  if (len < 0.001) return false;
  const u = clamp(((center.x - p1.x) * dx + (center.y - p1.y) * dy) / (len * len), 0, 1);
  const projX = p1.x + u * dx;
  const projY = p1.y + u * dy;
  return Math.hypot(center.x - projX, center.y - projY) < radius;
}

interface LaunchParams {
  buttonId: string;
  vx: number;
  vy: number;
}

interface CandidateMove {
  buttonId: string;
  vx: number;
  vy: number;
  score: number;
  type: 'direct_shot' | 'bank_shot' | 'clearance' | 'positioning' | 'defense';
}

export function computeAILaunch(
  aiSide: 'A' | 'B',
  buttons: ButtonPiece[],
  ball: Ball,
  difficulty: AIDifficulty
): LaunchParams {
  const aiButtons = buttons.filter(b => b.teamSide === aiSide);

  switch (difficulty) {
    case 'easy':
      return computeEasyAI(aiButtons, buttons, ball, aiSide);
    case 'medium':
      return computeMediumAI(aiButtons, buttons, ball, aiSide);
    case 'hard':
      return computeHardAI(aiButtons, buttons, ball, aiSide);
    default:
      return computeMediumAI(aiButtons, buttons, ball, aiSide);
  }
}

function addShotCandidate(
  b: ButtonPiece,
  allButtons: ButtonPiece[],
  ball: Ball,
  targetX: number,
  targetY: number,
  aiSide: 'A' | 'B',
  candidates: CandidateMove[],
  type: CandidateMove['type'],
  bonusScore = 0
) {
  const b2gX = targetX - ball.x;
  const b2gY = targetY - ball.y;
  const b2gDist = Math.hypot(b2gX, b2gY);
  if (b2gDist < 0.001) return;

  const dirX = b2gX / b2gDist;
  const dirY = b2gY / b2gDist;

  const contactDist = b.radius + ball.radius + 1;
  const contactX = ball.x - dirX * contactDist;
  const contactY = ball.y - dirY * contactDist;

  const btnToContactX = contactX - b.x;
  const btnToContactY = contactY - b.y;
  const btnToContactDist = Math.hypot(btnToContactX, btnToContactY);
  if (btnToContactDist < 0.001) return;

  const pushDirX = btnToContactX / btnToContactDist;
  const pushDirY = btnToContactY / btnToContactDist;

  const alignment = pushDirX * dirX + pushDirY * dirY;
  if (alignment < 0.25) return; // Button must be positioned behind ball relative to target

  let isBlocked = false;
  for (const other of allButtons) {
    if (other.id === b.id) continue;
    if (lineIntersectsCircle({ x: b.x, y: b.y }, { x: contactX, y: contactY }, { x: other.x, y: other.y }, b.radius + other.radius - 4)) {
      isBlocked = true;
      break;
    }
  }

  // Check if ball trajectory towards goal target is blocked by opponents
  const opponents = allButtons.filter(ob => ob.teamSide !== aiSide);
  let ballPathBlocked = false;
  for (const opp of opponents) {
    if (lineIntersectsCircle({ x: ball.x, y: ball.y }, { x: targetX, y: targetY }, { x: opp.x, y: opp.y }, ball.radius + opp.radius - 2)) {
      ballPathBlocked = true;
      break;
    }
  }

  let score = 900 - b2gDist * 0.6 - btnToContactDist * 0.4 + bonusScore;
  if (alignment > 0.8) score += 120;
  if (!isBlocked) score += 180;
  else score -= 250;

  if (!ballPathBlocked) score += 300;
  else score -= 200;

  if (b.isGoalkeeper) score -= 200; // Prefer outfield players for attacks

  const forceNeeded = clamp(btnToContactDist * 0.38 + b2gDist * 0.02, 6, MAX_LAUNCH_FORCE);

  candidates.push({
    buttonId: b.id,
    vx: pushDirX * forceNeeded,
    vy: pushDirY * forceNeeded,
    score,
    type
  });
}

function getDirectShotCandidates(
  aiButtons: ButtonPiece[],
  allButtons: ButtonPiece[],
  ball: Ball,
  opponentGoalX: number,
  aiSide: 'A' | 'B'
): CandidateMove[] {
  const candidates: CandidateMove[] = [];
  const goalYTargets = [215, 235, 250, 265, 285];

  for (const b of aiButtons) {
    for (const gY of goalYTargets) {
      const bonus = (gY === 215 || gY === 285) ? 60 : 0; // Bonus for targeting corners
      addShotCandidate(b, allButtons, ball, opponentGoalX, gY, aiSide, candidates, 'direct_shot', bonus);
    }
  }
  return candidates;
}

function getBankShotCandidates(
  aiButtons: ButtonPiece[],
  allButtons: ButtonPiece[],
  ball: Ball,
  opponentGoalX: number,
  aiSide: 'A' | 'B'
): CandidateMove[] {
  const candidates: CandidateMove[] = [];
  const goalYTargets = [220, 250, 280];
  const topBounceY = FIELD.BORDER + ball.radius; // ~20
  const botBounceY = FIELD.HEIGHT - FIELD.BORDER - ball.radius; // ~480

  for (const b of aiButtons) {
    for (const gY of goalYTargets) {
      // Top wall rebound
      const topVirtualY = 2 * topBounceY - gY;
      addShotCandidate(b, allButtons, ball, opponentGoalX, topVirtualY, aiSide, candidates, 'bank_shot', 180);

      // Bottom wall rebound
      const botVirtualY = 2 * botBounceY - gY;
      addShotCandidate(b, allButtons, ball, opponentGoalX, botVirtualY, aiSide, candidates, 'bank_shot', 180);
    }
  }
  return candidates;
}

function getDefensiveCandidates(
  aiButtons: ButtonPiece[],
  allButtons: ButtonPiece[],
  ball: Ball,
  aiSide: 'A' | 'B'
): CandidateMove[] {
  const candidates: CandidateMove[] = [];
  const ownGoalX = aiSide === 'A' ? 0 : FIELD.WIDTH;
  const ownGoalY = FIELD.HEIGHT / 2;
  const ballDistToOwnGoal = distance(ball.x, ball.y, ownGoalX, ownGoalY);

  const isBallThreatening = ballDistToOwnGoal < 320;
  if (!isBallThreatening) return candidates;

  // Clear towards opponent half
  const targetX = aiSide === 'A' ? FIELD.WIDTH * 0.8 : FIELD.WIDTH * 0.2;
  const targetY = ball.y < FIELD.HEIGHT / 2 ? FIELD.HEIGHT * 0.8 : FIELD.HEIGHT * 0.2;

  for (const b of aiButtons) {
    // 1. Clearance shot
    addShotCandidate(b, allButtons, ball, targetX, targetY, aiSide, candidates, 'clearance', 450);

    // 2. Defensive block position
    const blockX = ownGoalX + (aiSide === 'A' ? 55 : -55);
    const blockY = clamp(ball.y, FIELD.HEIGHT / 2 - 40, FIELD.HEIGHT / 2 + 40);
    const distToBlock = distance(b.x, b.y, blockX, blockY);

    if (distToBlock > 5) {
      const dx = blockX - b.x;
      const dy = blockY - b.y;
      const dist = Math.hypot(dx, dy);
      const force = clamp(dist * 0.35, 3, MAX_LAUNCH_FORCE * 0.85);

      let defScore = 550 - dist;
      if (b.isGoalkeeper) defScore += 250;

      candidates.push({
        buttonId: b.id,
        vx: (dx / dist) * force,
        vy: (dy / dist) * force,
        score: defScore,
        type: 'defense'
      });
    }
  }

  return candidates;
}

function getPositioningCandidates(
  aiButtons: ButtonPiece[],
  ball: Ball,
  opponentGoalX: number
): CandidateMove[] {
  const candidates: CandidateMove[] = [];
  const goalY = FIELD.HEIGHT / 2;

  const g2bX = ball.x - opponentGoalX;
  const g2bY = ball.y - goalY;
  const len = Math.hypot(g2bX, g2bY);
  const dirX = g2bX / (len || 1);
  const dirY = g2bY / (len || 1);

  const setupX = ball.x + dirX * 60;
  const setupY = ball.y + dirY * 60;

  for (const b of aiButtons) {
    if (b.isGoalkeeper) continue;
    const dx = setupX - b.x;
    const dy = setupY - b.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 5) continue;

    const force = clamp(dist * 0.25, 2.5, 7.5);
    candidates.push({
      buttonId: b.id,
      vx: (dx / dist) * force,
      vy: (dy / dist) * force,
      score: 150 - dist * 0.2,
      type: 'positioning'
    });
  }

  return candidates;
}

function getFallbackMove(aiButtons: ButtonPiece[], ball: Ball): LaunchParams {
  let closest = aiButtons[0];
  let minDist = Infinity;
  for (const b of aiButtons) {
    const d = distance(b.x, b.y, ball.x, ball.y);
    if (d < minDist) {
      minDist = d;
      closest = b;
    }
  }
  const dx = ball.x - closest.x;
  const dy = ball.y - closest.y;
  const dist = Math.hypot(dx, dy) || 1;
  const force = clamp(dist * 0.3, 3, MAX_LAUNCH_FORCE * 0.7);

  return {
    buttonId: closest.id,
    vx: (dx / dist) * force,
    vy: (dy / dist) * force,
  };
}

function computeHardAI(
  aiButtons: ButtonPiece[],
  allButtons: ButtonPiece[],
  ball: Ball,
  aiSide: 'A' | 'B'
): LaunchParams {
  const opponentGoalX = aiSide === 'A' ? FIELD.WIDTH : 0;
  const candidates: CandidateMove[] = [
    ...getDirectShotCandidates(aiButtons, allButtons, ball, opponentGoalX, aiSide),
    ...getBankShotCandidates(aiButtons, allButtons, ball, opponentGoalX, aiSide),
    ...getDefensiveCandidates(aiButtons, allButtons, ball, aiSide),
    ...getPositioningCandidates(aiButtons, ball, opponentGoalX),
  ];

  if (candidates.length === 0) {
    return getFallbackMove(aiButtons, ball);
  }

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  return {
    buttonId: best.buttonId,
    vx: best.vx,
    vy: best.vy,
  };
}

function computeMediumAI(
  aiButtons: ButtonPiece[],
  allButtons: ButtonPiece[],
  ball: Ball,
  aiSide: 'A' | 'B'
): LaunchParams {
  const opponentGoalX = aiSide === 'A' ? FIELD.WIDTH : 0;
  const candidates: CandidateMove[] = [
    ...getDirectShotCandidates(aiButtons, allButtons, ball, opponentGoalX, aiSide),
    ...getDefensiveCandidates(aiButtons, allButtons, ball, aiSide),
    ...getPositioningCandidates(aiButtons, ball, opponentGoalX),
  ];

  if (candidates.length === 0) {
    return getFallbackMove(aiButtons, ball);
  }

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  const noiseAngle = (Math.random() - 0.5) * 0.08;
  const cosN = Math.cos(noiseAngle);
  const sinN = Math.sin(noiseAngle);

  return {
    buttonId: best.buttonId,
    vx: best.vx * cosN - best.vy * sinN,
    vy: best.vx * sinN + best.vy * cosN,
  };
}

function computeEasyAI(
  aiButtons: ButtonPiece[],
  allButtons: ButtonPiece[],
  ball: Ball,
  aiSide: 'A' | 'B'
): LaunchParams {
  const opponentGoalX = aiSide === 'A' ? FIELD.WIDTH : 0;
  const candidates: CandidateMove[] = [
    ...getDirectShotCandidates(aiButtons, allButtons, ball, opponentGoalX, aiSide),
    ...getPositioningCandidates(aiButtons, ball, opponentGoalX),
  ];

  if (candidates.length === 0) {
    return getFallbackMove(aiButtons, ball);
  }

  candidates.sort((a, b) => b.score - a.score);
  const topCount = Math.min(3, candidates.length);
  const chosen = candidates[Math.floor(Math.random() * topCount)];

  const noiseAngle = (Math.random() - 0.5) * 0.28;
  const noisePower = 0.75 + Math.random() * 0.25;
  const cosN = Math.cos(noiseAngle);
  const sinN = Math.sin(noiseAngle);

  return {
    buttonId: chosen.buttonId,
    vx: (chosen.vx * cosN - chosen.vy * sinN) * noisePower,
    vy: (chosen.vx * sinN + chosen.vy * cosN) * noisePower,
  };
}
