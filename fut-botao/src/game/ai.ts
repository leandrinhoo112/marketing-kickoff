// src/game/ai.ts
import { ButtonPiece, Ball, AIDifficulty, Vec2 } from './types';
import { FIELD, MAX_LAUNCH_FORCE } from './physics';

function distance(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(bx - ax, by - ay);
}

function angle(from: Vec2, to: Vec2) {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

interface LaunchParams {
  buttonId: string;
  vx: number;
  vy: number;
}

export function computeAILaunch(
  aiSide: 'A' | 'B',
  buttons: ButtonPiece[],
  ball: Ball,
  difficulty: AIDifficulty
): LaunchParams {
  const aiButtons = buttons.filter(b => b.teamSide === aiSide);
  const opponentGoalX = aiSide === 'A' ? FIELD.WIDTH : 0;
  const goalY = FIELD.HEIGHT / 2;

  switch (difficulty) {
    case 'easy':
      return computeEasyAI(aiButtons, ball, opponentGoalX, goalY);
    case 'medium':
      return computeMediumAI(aiButtons, ball, opponentGoalX, goalY);
    case 'hard':
      return computeHardAI(aiButtons, buttons.filter(b => b.teamSide !== aiSide), ball, opponentGoalX, goalY, aiSide);
    default:
      return computeEasyAI(aiButtons, ball, opponentGoalX, goalY);
  }
}

function computeEasyAI(aiButtons: ButtonPiece[], ball: Ball, goalX: number, goalY: number): LaunchParams {
  // Find button closest to ball
  let closest = aiButtons[0];
  let minDist = Infinity;
  for (const b of aiButtons) {
    const d = distance(b.x, b.y, ball.x, ball.y);
    if (d < minDist) {
      minDist = d;
      closest = b;
    }
  }

  // If close to ball, aim at goal; otherwise, move toward ball
  const distToBall = distance(closest.x, closest.y, ball.x, ball.y);
  const TARGET_RADIUS = closest.radius + ball.radius + 5;

  let targetX: number, targetY: number;
  if (distToBall < 120) {
    // Aim toward the goal through the ball
    const ballToGoalAngle = Math.atan2(goalY - ball.y, goalX - ball.x);
    // Aim button slightly behind ball so it hits ball toward goal
    targetX = ball.x - Math.cos(ballToGoalAngle) * TARGET_RADIUS;
    targetY = ball.y - Math.sin(ballToGoalAngle) * TARGET_RADIUS;
  } else {
    targetX = ball.x;
    targetY = ball.y;
  }

  const dx = targetX - closest.x;
  const dy = targetY - closest.y;
  const dist = Math.hypot(dx, dy);
  const force = clamp(dist * 0.3, 3, MAX_LAUNCH_FORCE * 0.7);

  // Add slight randomness for easy
  const noise = (Math.random() - 0.5) * 0.4;

  return {
    buttonId: closest.id,
    vx: (dx / dist) * force * Math.cos(noise),
    vy: (dy / dist) * force * Math.sin(noise) + (dy / dist) * force * (1 - Math.cos(noise)),
  };
}

function computeMediumAI(aiButtons: ButtonPiece[], ball: Ball, goalX: number, goalY: number): LaunchParams {
  // Evaluate each button and pick best option
  let bestButton = aiButtons[0];
  let bestScore = -Infinity;

  for (const b of aiButtons) {
    const distToBall = distance(b.x, b.y, ball.x, ball.y);
    const angleScore = 1 / (1 + Math.abs(Math.atan2(goalY - ball.y, goalX - ball.x) - Math.atan2(ball.y - b.y, ball.x - b.x)));
    const distScore = 1 / (1 + distToBall);
    const score = distScore * 0.6 + angleScore * 0.4;
    if (score > bestScore) {
      bestScore = score;
      bestButton = b;
    }
  }

  const b = bestButton;
  const distToBall = distance(b.x, b.y, ball.x, ball.y);
  const ballToGoalAngle = Math.atan2(goalY - ball.y, goalX - ball.x);
  const TARGET_RADIUS = b.radius + ball.radius + 3;

  let targetX: number, targetY: number;
  if (distToBall < 150) {
    targetX = ball.x - Math.cos(ballToGoalAngle) * TARGET_RADIUS;
    targetY = ball.y - Math.sin(ballToGoalAngle) * TARGET_RADIUS;
  } else {
    targetX = ball.x;
    targetY = ball.y;
  }

  const dx = targetX - b.x;
  const dy = targetY - b.y;
  const dist = Math.hypot(dx, dy);
  const force = clamp(dist * 0.35, 4, MAX_LAUNCH_FORCE * 0.85);
  const noise = (Math.random() - 0.5) * 0.15;

  return {
    buttonId: b.id,
    vx: (dx / dist + noise) * force,
    vy: (dy / dist + noise) * force,
  };
}

function computeHardAI(
  aiButtons: ButtonPiece[],
  opponentButtons: ButtonPiece[],
  ball: Ball,
  goalX: number,
  goalY: number,
  aiSide: 'A' | 'B'
): LaunchParams {
  const ownGoalX = aiSide === 'A' ? 0 : FIELD.WIDTH;

  // Check if ball is close to own goal — defend
  const ballDistToOwnGoal = distance(ball.x, ball.y, ownGoalX, goalY);
  const isDefending = ballDistToOwnGoal < 200;

  if (isDefending) {
    // Find button closest to ball to block
    let closest = aiButtons[0];
    let minDist = Infinity;
    for (const b of aiButtons) {
      const d = distance(b.x, b.y, ball.x, ball.y);
      if (d < minDist) {
        minDist = d;
        closest = b;
      }
    }
    // Push ball away from own goal
    const dx = ball.x - ownGoalX;
    const dy = ball.y - goalY;
    const dist = Math.hypot(dx, dy);
    const force = MAX_LAUNCH_FORCE * 0.9;
    return {
      buttonId: closest.id,
      vx: (dx / dist) * force,
      vy: (dy / dist) * force,
    };
  }

  // Attack: find best button to aim at goal
  return computeMediumAI(aiButtons, ball, goalX, goalY);
}
