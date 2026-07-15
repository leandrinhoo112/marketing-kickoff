// src/game/intruders.ts
import { Intruder, IntruderType, ButtonPiece, Ball } from './types';
import { FIELD, resolveCircles } from './physics';

const INTRUDER_SPEEDS: Record<IntruderType, number> = {
  torcedor: 3.8,
  cachorro: 4.8,
  guarda: 2.8,
};

const INTRUDER_MASSES: Record<IntruderType, number> = {
  torcedor: 2.5,
  cachorro: 1.5,
  guarda: 3.5,
};

export function spawnIntruder(now: number): Intruder {
  const types: IntruderType[] = ['torcedor', 'cachorro'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  // Decide spawn position (on one of the 4 borders)
  const border = Math.floor(Math.random() * 4); // 0: Top, 1: Right, 2: Bottom, 3: Left
  const W = FIELD.WIDTH;
  const H = FIELD.HEIGHT;
  const B = FIELD.BORDER;
  const r = type === 'torcedor' ? 20 : type === 'cachorro' ? 18 : 22;

  let x = 0;
  let y = 0;
  let vx = 0;
  let vy = 0;
  let angle = 0;

  switch (border) {
    case 0: // Top
      x = B + Math.random() * (W - 2 * B);
      y = B + r + 5;
      angle = Math.PI / 2 + (Math.random() - 0.5) * 0.5; // heading down
      break;
    case 1: // Right
      x = W - B - r - 5;
      y = B + Math.random() * (H - 2 * B);
      angle = Math.PI + (Math.random() - 0.5) * 0.5; // heading left
      break;
    case 2: // Bottom
      x = B + Math.random() * (W - 2 * B);
      y = H - B - r - 5;
      angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5; // heading up
      break;
    case 3: // Left
    default:
      x = B + r + 5;
      y = B + Math.random() * (H - 2 * B);
      angle = (Math.random() - 0.5) * 0.5; // heading right
      break;
  }

  const speed = INTRUDER_SPEEDS[type];
  vx = Math.cos(angle) * speed;
  vy = Math.sin(angle) * speed;

  return {
    id: `intruder-${type}-${now}-${Math.floor(Math.random() * 1000)}`,
    type,
    x,
    y,
    vx,
    vy,
    radius: r,
    angle,
    spawnTime: now,
    lifetime: 10000 + Math.random() * 5000, // 10 to 15 seconds
  };
}

export function stepIntruderPhysics(
  intruders: Intruder[],
  buttons: ButtonPiece[],
  ball: Ball,
  dt: number
) {
  const B = FIELD.BORDER;
  const W = FIELD.WIDTH;
  const H = FIELD.HEIGHT;

  for (const intruder of intruders) {
    const speed = INTRUDER_SPEEDS[intruder.type];
    const mass = INTRUDER_MASSES[intruder.type];

    // 1. Calculate Target Behavior Velocity
    let targetVx = intruder.vx;
    let targetVy = intruder.vy;

    if (intruder.type === 'torcedor') {
      // Runs in a slightly wavy straight path
      const timeOffset = (Date.now() - intruder.spawnTime) / 1000;
      const angleOffset = Math.sin(timeOffset * 5) * 0.3; // wavy movement
      const currentAngle = (intruder.angle || 0) + angleOffset;
      targetVx = Math.cos(currentAngle) * speed;
      targetVy = Math.sin(currentAngle) * speed;
    } else if (intruder.type === 'cachorro') {
      // Runs in circles/erratic curves
      const timeOffset = (Date.now() - intruder.spawnTime) / 1000;
      intruder.angle = (intruder.angle || 0) + 0.08; // constantly curving
      targetVx = Math.cos(intruder.angle) * speed;
      targetVy = Math.sin(intruder.angle) * speed;
      
      // Randomly change direction slightly
      if (Math.random() < 0.02) {
        intruder.angle += (Math.random() - 0.5) * Math.PI;
      }
    } else if (intruder.type === 'guarda') {
      // Chases the ball
      const dx = ball.x - intruder.x;
      const dy = ball.y - intruder.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 5) {
        targetVx = (dx / dist) * speed;
        targetVy = (dy / dist) * speed;
      } else {
        targetVx = 0;
        targetVy = 0;
      }
    }

    // Blend current velocity with target velocity to allow recovering from collisions
    intruder.vx = intruder.vx * 0.85 + targetVx * 0.15;
    intruder.vy = intruder.vy * 0.85 + targetVy * 0.15;

    // 2. Move Intruder
    intruder.x += intruder.vx * dt;
    intruder.y += intruder.vy * dt;

    // 3. Wall Collisions
    const r = intruder.radius;
    if (intruder.x - r < B) {
      intruder.x = B + r;
      intruder.vx = Math.abs(intruder.vx) * 0.6;
      if (intruder.type === 'cachorro' || intruder.type === 'torcedor') intruder.angle = Math.PI - (intruder.angle || 0);
    }
    if (intruder.x + r > W - B) {
      intruder.x = W - B - r;
      intruder.vx = -Math.abs(intruder.vx) * 0.6;
      if (intruder.type === 'cachorro' || intruder.type === 'torcedor') intruder.angle = Math.PI - (intruder.angle || 0);
    }
    if (intruder.y - r < B) {
      intruder.y = B + r;
      intruder.vy = Math.abs(intruder.vy) * 0.6;
      if (intruder.type === 'cachorro' || intruder.type === 'torcedor') intruder.angle = -(intruder.angle || 0);
    }
    if (intruder.y + r > H - B) {
      intruder.y = H - B - r;
      intruder.vy = -Math.abs(intruder.vy) * 0.6;
      if (intruder.type === 'cachorro' || intruder.type === 'torcedor') intruder.angle = -(intruder.angle || 0);
    }

    // 4. Collisions with Buttons
    const BUTTON_MASS = 2.0;
    for (const btn of buttons) {
      const res = resolveCircles(
        intruder.x, intruder.y, intruder.vx, intruder.vy, r, mass,
        btn.x, btn.y, btn.vx, btn.vy, btn.radius, BUTTON_MASS
      );
      if (res) {
        intruder.vx = res.avx; intruder.vy = res.avy; intruder.x = res.ax; intruder.y = res.ay;
        btn.vx = res.bvx; btn.vy = res.bvy; btn.x = res.bx; btn.y = res.by;
      }
    }

    // 5. Collisions with Ball
    const BALL_MASS = 1.0;
    const resBall = resolveCircles(
      intruder.x, intruder.y, intruder.vx, intruder.vy, r, mass,
      ball.x, ball.y, ball.vx, ball.vy, ball.radius, BALL_MASS
    );
    if (resBall) {
      intruder.vx = resBall.avx; intruder.vy = resBall.avy; intruder.x = resBall.ax; intruder.y = resBall.ay;
      ball.vx = resBall.bvx; ball.vy = resBall.bvy; ball.x = resBall.bx; ball.y = resBall.by;
    }
  }
}
