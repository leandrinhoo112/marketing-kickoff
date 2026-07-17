'use client';
/**
 * GameCanvas — renders the field and runs the physics loop.
 *
 * Architecture:
 *  - ALL state during the 'moving' phase lives in `localRef` (a plain object).
 *  - The requestAnimationFrame loop reads/writes localRef directly — no React re-renders.
 *  - React props (gameState) are only synced into localRef when the phase is NOT 'moving'.
 *  - onStateChange / onGoal are called ONCE when a turn ends or a goal is scored.
 *
 * This avoids the React-state-as-physics-state anti-pattern that caused buttons and
 * the ball to pass through each other (stale positions between async re-renders).
 */
import React, { useRef, useEffect, useCallback } from 'react';
import { ButtonPiece, Ball, GameState, Vec2, Intruder, GameModifiers } from '@/game/types';
import { FIELD, stepPhysics, isMoving, MAX_LAUNCH_FORCE } from '@/game/physics';
import { computeAILaunch } from '@/game/ai';
import { playSlide, playGoal, playTeamAnthem, playRandomNarration, stopNarration } from '@/game/sounds';
import { spawnIntruder, stepIntruderPhysics } from '@/game/intruders';

// ── Props ──────────────────────────────────────────────────────────────────

interface GameCanvasProps {
  gameState: GameState;
  onStateChange: (patch: Partial<GameState>) => void;
  onGoal: (scorer: 'A' | 'B') => void;
  localSide: 'A' | 'B';
  /** Called after a local launch, so online mode can broadcast it */
  onLaunch?: (buttonId: string, vx: number, vy: number) => void;
}

// ── Local physics state ────────────────────────────────────────────────────

interface Local {
  buttons: ButtonPiece[];
  ball: Ball;
  phase: GameState['phase'];
  currentTurn: 'A' | 'B';
  selectedButtonId: string | null;
  dragStart: Vec2 | null;
  dragCurrent: Vec2 | null;
  goalFlash: { scorer: string; until: number } | null;
  intruders: Intruder[];
  modifiers?: GameModifiers;
  lastIntruderSpawnTime: number;
  movingPhaseStartTime: number;
}

function copyFromState(gs: GameState): Local {
  return {
    buttons:         gs.buttons.map(b => ({ ...b })),
    ball:            { ...gs.ball },
    phase:           gs.phase,
    currentTurn:     gs.currentTurn,
    selectedButtonId: gs.selectedButtonId,
    dragStart:       gs.dragStart,
    dragCurrent:     gs.dragCurrent,
    goalFlash:       null,
    intruders:       gs.intruders ? gs.intruders.map(i => ({ ...i })) : [],
    modifiers:       gs.modifiers,
    lastIntruderSpawnTime: Date.now(),
    movingPhaseStartTime: 0,
  };
}

// ── Component ──────────────────────────────────────────────────────────────

export default function GameCanvas({
  gameState,
  onStateChange,
  onGoal,
  localSide,
  onLaunch,
}: GameCanvasProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef<number>(0);
  const imagesRef   = useRef<Map<string, HTMLImageElement>>(new Map());
  const aiTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The authoritative local state
  const local = useRef<Local>(copyFromState(gameState));

  // Keep callbacks and latest gameState stable in refs
  const onStateChangeRef = useRef(onStateChange);
  const onGoalRef        = useRef(onGoal);
  const onLaunchRef      = useRef(onLaunch);
  const gameStateRef     = useRef(gameState);
  useEffect(() => { onStateChangeRef.current = onStateChange; }, [onStateChange]);
  useEffect(() => { onGoalRef.current = onGoal; }, [onGoal]);
  useEffect(() => { onLaunchRef.current = onLaunch; }, [onLaunch]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // Sync React props → local ref (only when safe to do so)
  useEffect(() => {
    const L = local.current;

    // Always sync input/phase
    L.phase           = gameState.phase;
    L.currentTurn     = gameState.currentTurn;
    L.selectedButtonId = gameState.selectedButtonId;
    L.dragStart       = gameState.dragStart;
    L.dragCurrent     = gameState.dragCurrent;
    L.modifiers       = gameState.modifiers;

    // Only sync positions when NOT in the middle of simulating
    // (during 'moving', localRef IS the truth)
    if (gameState.phase !== 'moving') {
      console.log("DEBUG: GameCanvas useEffect syncing L.buttons. Prop count:", gameState.buttons.length);
      L.buttons = gameState.buttons.map(b => ({ ...b }));
      L.ball    = { ...gameState.ball };
      L.intruders = gameState.intruders ? gameState.intruders.map(i => ({ ...i })) : [];
    }
  }, [gameState]);

  // Preload team logos
  useEffect(() => {
    gameState.buttons.forEach(b => {
      if (!imagesRef.current.has(b.logoUrl)) {
        const img = new Image();
        img.src = b.logoUrl;
        imagesRef.current.set(b.logoUrl, img);
      }
    });
  }, [gameState.buttons]);

  // ── Narration Audio Interval ──────────────────────────────────────────────
  useEffect(() => {
    // Começa a tocar narrações de 15 em 15 segundos enquanto o jogo estiver ativo
    const interval = setInterval(() => {
      if (gameStateRef.current?.phase !== 'finished') {
        playRandomNarration();
      }
    }, 15000);

    return () => {
      clearInterval(interval);
      stopNarration();
    };
  }, []);

  // ── AI ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (gameState.mode !== 'ai') return;
    if (gameState.phase !== 'selecting') return;
    if (gameState.currentTurn === localSide) return; // human's turn

    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    aiTimerRef.current = setTimeout(() => {
      const L = local.current;
      if (L.phase !== 'selecting' || L.currentTurn === localSide) return;

      const launch = computeAILaunch(L.currentTurn, L.buttons, L.ball, gameState.aiDifficulty || 'medium');
      const btn = L.buttons.find(b => b.id === launch.buttonId);
      if (!btn) return;

      btn.vx = launch.vx;
      btn.vy = launch.vy;
      L.phase = 'moving';
      L.movingPhaseStartTime = Date.now();
      L.selectedButtonId = null;
      L.dragStart = null;
      L.dragCurrent = null;
      playSlide();
      // Sync phase to React so HUD updates
      onStateChangeRef.current({ phase: 'moving' });
    }, 600 + Math.random() * 700);

    return () => { if (aiTimerRef.current) clearTimeout(aiTimerRef.current); };
  }, [gameState.phase, gameState.currentTurn, gameState.mode, gameState.aiDifficulty, localSide]);

  // ── Main loop (physics + render) ────────────────────────────────────────

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const L = local.current;
    const now = Date.now();

    // Spawn intruder logic (max 2 active)
    if (L.modifiers?.intrusoNoCampo && L.phase !== 'finished') {
      if (now - L.lastIntruderSpawnTime > 25000 && L.intruders.length < 2) {
        L.intruders.push(spawnIntruder(now));
        L.lastIntruderSpawnTime = now;
      }
    }

    // Filter out expired intruders
    L.intruders = L.intruders.filter(i => now - i.spawnTime < i.lifetime);

    // Simulate intruders (do not transition L.phase to 'moving', just let them run!)
    if (L.modifiers?.intrusoNoCampo && L.intruders.length > 0 && L.phase !== 'finished') {
      stepIntruderPhysics(L.intruders, L.buttons, L.ball, 1);
    }

    // ─ Physics ────────────────────────────────────────────────────────────
    if (L.phase === 'moving') {
      const scorer = stepPhysics(L.buttons, L.ball); // mutates in place, returns goal or null

      if (scorer) {
        L.phase = 'finished'; // stop simulation
        playGoal();
        // Play the scoring team's anthem
        const gs = gameStateRef.current;
        const scoringTeamId = scorer === 'A' ? gs.teamA : gs.teamB;
        playTeamAnthem(scoringTeamId);
        L.goalFlash = { scorer, until: Date.now() + 2000 };
        onGoalRef.current(scorer);
      } else if (!isMoving(L.buttons, L.ball) || (Date.now() - L.movingPhaseStartTime > 3500)) {
        // Movement stopped or 3.5s timeout reached → end turn
        const nextTurn: 'A' | 'B' = L.currentTurn === 'A' ? 'B' : 'A';
        L.phase       = 'selecting';
        L.currentTurn = nextTurn;
        L.selectedButtonId = null;
        if (Date.now() - L.movingPhaseStartTime > 3500) {
          L.buttons.forEach(b => { b.vx = 0; b.vy = 0; });
          L.ball.vx = 0; L.ball.vy = 0;
        }
        // Push final positions + new turn to React
        onStateChangeRef.current({
          buttons:         L.buttons.map(b => ({ ...b })),
          ball:            { ...L.ball },
          phase:           'selecting',
          currentTurn:     nextTurn,
          selectedButtonId: null,
          intruders:       L.intruders.map(i => ({ ...i })),
        });
      }
    } else if (L.phase === 'selecting' || L.phase === 'dragging') {
      // Simulate physics for moving pieces even during player turns, so they keep rolling!
      if (isMoving(L.buttons, L.ball)) {
        const scorer = stepPhysics(L.buttons, L.ball);
        if (scorer) {
          L.phase = 'finished';
          playGoal();
          const gs = gameStateRef.current;
          const scoringTeamId = scorer === 'A' ? gs.teamA : gs.teamB;
          playTeamAnthem(scoringTeamId);
          L.goalFlash = { scorer, until: Date.now() + 2000 };
          onGoalRef.current(scorer);
        } else if (!isMoving(L.buttons, L.ball)) {
          // Finished rolling during turn → sync final positions
          onStateChangeRef.current({
            buttons: L.buttons.map(b => ({ ...b })),
            ball:    { ...L.ball },
          });
        }
      }
    }

    // ─ Render ─────────────────────────────────────────────────────────────
    ctx.clearRect(0, 0, FIELD.WIDTH, FIELD.HEIGHT);
    drawField(ctx);

    if (L.phase === 'dragging' && L.selectedButtonId && L.dragCurrent) {
      const sel = L.buttons.find(b => b.id === L.selectedButtonId);
      if (sel) drawDragGuide(ctx, sel, L.dragCurrent);
    }

    // Draw intruders
    if (L.modifiers?.intrusoNoCampo && L.intruders.length > 0) {
      L.intruders.forEach(intruder => drawIntruder(ctx, intruder));
    }

    // Draw opponent buttons first (under own)
    const opponents = L.buttons.filter(b => b.teamSide !== localSide);
    const own       = L.buttons.filter(b => b.teamSide === localSide);
    opponents.forEach(b => drawButton(ctx, b, false, imagesRef.current));
    own.forEach(b       => drawButton(ctx, b, b.id === L.selectedButtonId, imagesRef.current));

    drawBall(ctx, L.ball);

    // Goal flash overlay
    if (L.goalFlash && Date.now() < L.goalFlash.until) {
      const t = 1 - (L.goalFlash.until - Date.now()) / 2000;
      const pulse = Math.abs(Math.sin(t * Math.PI * 4));
      ctx.save();
      ctx.fillStyle = L.goalFlash.scorer === 'A'
        ? `rgba(0,120,255,${0.15 * pulse})`
        : `rgba(255,60,0,${0.15 * pulse})`;
      ctx.fillRect(0, 0, FIELD.WIDTH, FIELD.HEIGHT);

      ctx.font = 'bold 86px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 24;
      ctx.fillStyle = `rgba(255,255,255,${0.7 + 0.3 * pulse})`;
      ctx.fillText('GOL! ⚽', FIELD.WIDTH / 2, FIELD.HEIGHT / 2);
      ctx.restore();
    } else if (L.goalFlash && Date.now() >= L.goalFlash.until) {
      L.goalFlash = null;
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [localSide]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  // ── Input ──────────────────────────────────────────────────────────────

  function getPos(e: React.MouseEvent | React.TouchEvent): Vec2 {
    const rect = canvasRef.current!.getBoundingClientRect();
    const sx   = FIELD.WIDTH  / rect.width;
    const sy   = FIELD.HEIGHT / rect.height;
    let cx: number, cy: number;
    if ('touches' in e && e.touches.length > 0) {
      cx = e.touches[0].clientX; cy = e.touches[0].clientY;
    } else if ('changedTouches' in e) {
      cx = (e as React.TouchEvent).changedTouches[0].clientX;
      cy = (e as React.TouchEvent).changedTouches[0].clientY;
    } else {
      cx = (e as React.MouseEvent).clientX;
      cy = (e as React.MouseEvent).clientY;
    }
    return { x: (cx - rect.left) * sx, y: (cy - rect.top) * sy };
  }

  const handleDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const L = local.current;
    if (L.phase !== 'selecting') return;
    if (L.currentTurn !== localSide) return;

    const pos = getPos(e);
    const hit = L.buttons.find(b =>
      b.teamSide === L.currentTurn && Math.hypot(b.x - pos.x, b.y - pos.y) <= b.radius
    );
    if (!hit) return;

    L.selectedButtonId = hit.id;
    L.dragStart        = { x: hit.x, y: hit.y };
    L.dragCurrent      = pos;
    L.phase            = 'dragging';
    // Lightweight React sync for HUD
    onStateChangeRef.current({ phase: 'dragging', selectedButtonId: hit.id });
  }, [localSide]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const L = local.current;
    if (L.phase !== 'dragging') return;
    e.preventDefault();
    L.dragCurrent = getPos(e);
  }, []);

  const handleUp = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const L = local.current;
    if (L.phase !== 'dragging' || !L.selectedButtonId) return;

    const pos = getPos(e);
    const btn = L.buttons.find(b => b.id === L.selectedButtonId);
    if (!btn) { L.phase = 'selecting'; return; }

    // Slingshot: drag direction = OPPOSITE of launch direction
    const dx = btn.x - pos.x;
    const dy = btn.y - pos.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 8) {
      // Too small → cancel
      L.phase = 'selecting';
      L.selectedButtonId = null;
      L.dragStart = L.dragCurrent = null;
      onStateChangeRef.current({ phase: 'selecting', selectedButtonId: null });
      return;
    }

    const force = Math.min(dist / (MAX_LAUNCH_FORCE * 5), 1) * MAX_LAUNCH_FORCE;
    const vx = (dx / dist) * force;
    const vy = (dy / dist) * force;

    btn.vx = vx;
    btn.vy = vy;
    L.phase            = 'moving';
    L.movingPhaseStartTime = Date.now();
    L.selectedButtonId = null;
    L.dragStart = L.dragCurrent = null;

    playSlide();
    onStateChangeRef.current({ phase: 'moving', selectedButtonId: null });

    if (onLaunchRef.current) onLaunchRef.current(btn.id, vx, vy);
  }, []);

  // ── Global mouse listeners (keeps drag alive when cursor leaves canvas) ──

  useEffect(() => {
    function getPosFromClient(clientX: number, clientY: number): Vec2 {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: (clientX - rect.left) * (FIELD.WIDTH  / rect.width),
        y: (clientY - rect.top)  * (FIELD.HEIGHT / rect.height),
      };
    }

    function onWindowMove(e: MouseEvent) {
      const L = local.current;
      if (L.phase !== 'dragging') return;
      L.dragCurrent = getPosFromClient(e.clientX, e.clientY);
    }

    function onWindowUp(e: MouseEvent) {
      const L = local.current;
      if (L.phase !== 'dragging' || !L.selectedButtonId) return;

      const pos = getPosFromClient(e.clientX, e.clientY);
      const btn = L.buttons.find(b => b.id === L.selectedButtonId);
      if (!btn) { L.phase = 'selecting'; return; }

      const dx = btn.x - pos.x;
      const dy = btn.y - pos.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 8) {
        L.phase = 'selecting';
        L.selectedButtonId = null;
        L.dragStart = L.dragCurrent = null;
        onStateChangeRef.current({ phase: 'selecting', selectedButtonId: null });
        return;
      }

      const force = Math.min(dist / (MAX_LAUNCH_FORCE * 5), 1) * MAX_LAUNCH_FORCE;
      const vx = (dx / dist) * force;
      const vy = (dy / dist) * force;

      btn.vx = vx;
      btn.vy = vy;
      L.phase            = 'moving';
      L.movingPhaseStartTime = Date.now();
      L.selectedButtonId = null;
      L.dragStart = L.dragCurrent = null;

      playSlide();
      onStateChangeRef.current({ phase: 'moving', selectedButtonId: null });
      if (onLaunchRef.current) onLaunchRef.current(btn.id, vx, vy);
    }

    window.addEventListener('mousemove', onWindowMove);
    window.addEventListener('mouseup',   onWindowUp);
    return () => {
      window.removeEventListener('mousemove', onWindowMove);
      window.removeEventListener('mouseup',   onWindowUp);
    };
  }, []); // runs once — handlers read from refs so they never go stale

  return (
    <canvas
      ref={canvasRef}
      width={FIELD.WIDTH}
      height={FIELD.HEIGHT}
      style={{ width: '100%', aspectRatio: `${FIELD.WIDTH}/${FIELD.HEIGHT}`, cursor: 'crosshair', display: 'block' }}
      className="rounded-lg touch-none select-none"
      onMouseDown={handleDown}
      /* move/up handled globally via window listeners above */
      onTouchStart={handleDown}
      onTouchMove={handleMove}
      onTouchEnd={handleUp}
    />
  );
}


// ── Drawing helpers ────────────────────────────────────────────────────────

function drawField(ctx: CanvasRenderingContext2D) {
  const { WIDTH: W, HEIGHT: H, GOAL_WIDTH: GW, GOAL_DEPTH: GD, BORDER: B } = FIELD;
  const GY1 = H / 2 - GW / 2;

  // Grass
  ctx.fillStyle = '#2a7a30';
  ctx.fillRect(0, 0, W, H);

  // Darker stripe pattern
  ctx.fillStyle = 'rgba(0,0,0,0.055)';
  const sw = (W - 2 * B) / 8;
  for (let i = 0; i < 8; i += 2) ctx.fillRect(B + i * sw, B, sw, H - 2 * B);

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 2;

  // Border
  ctx.strokeRect(B, B, W - 2 * B, H - 2 * B);

  // Center line
  ctx.beginPath(); ctx.moveTo(W / 2, B); ctx.lineTo(W / 2, H - B); ctx.stroke();

  // Center circle + dot
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 65, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 4,  0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fill();

  // Penalty areas
  const PA_W = 130, PA_H = 200;
  ctx.strokeRect(B, H / 2 - PA_H / 2, PA_W, PA_H);
  ctx.strokeRect(W - B - PA_W, H / 2 - PA_H / 2, PA_W, PA_H);

  // Small boxes
  const SA_W = 55, SA_H = 120;
  ctx.strokeRect(B, H / 2 - SA_H / 2, SA_W, SA_H);
  ctx.strokeRect(W - B - SA_W, H / 2 - SA_H / 2, SA_W, SA_H);

  ctx.restore();

  // Goals
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fillRect(0, GY1, GD, GW);
  ctx.fillRect(W - GD, GY1, GD, GW);

  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, GY1, GD, GW);
  ctx.strokeRect(W - GD, GY1, GD, GW);

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 0.5;
  const ns = 9;
  for (let y = GY1; y <= GY1 + GW; y += ns) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(GD, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W - GD, y); ctx.lineTo(W, y); ctx.stroke();
  }
  for (let x = 0; x <= GD; x += ns) {
    ctx.beginPath(); ctx.moveTo(x, GY1); ctx.lineTo(x, GY1 + GW); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W - GD + x, GY1); ctx.lineTo(W - GD + x, GY1 + GW); ctx.stroke();
  }
  ctx.restore();
}

function drawButton(
  ctx: CanvasRenderingContext2D,
  btn: ButtonPiece,
  selected: boolean,
  images: Map<string, HTMLImageElement>,
) {
  const { x, y, radius: r, isGoalkeeper, primaryColor, logoUrl, shortName } = btn;
  const img = images.get(logoUrl);

  ctx.save();

  // Shadow
  ctx.shadowColor   = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur    = selected ? 18 : 7;
  ctx.shadowOffsetY = 2;

  // Outer ring (team color)
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = primaryColor;
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // White inner disc
  ctx.beginPath(); ctx.arc(x, y, r - 3, 0, Math.PI * 2);
  ctx.fillStyle = '#fff'; ctx.fill();

  // Logo clipped
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r - 4, 0, Math.PI * 2); ctx.clip();
    const d = (r - 4) * 2;
    ctx.drawImage(img, x - r + 4, y - r + 4, d, d);
    ctx.restore();
  }

  // GK gold border
  if (isGoalkeeper) {
    ctx.beginPath(); ctx.arc(x, y, r + 3.5, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 4; ctx.stroke();
  }

  // Selected glow
  if (selected) {
    ctx.beginPath(); ctx.arc(x, y, r + (isGoalkeeper ? 8 : 5), 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,255,220,0.9)'; ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 3]); ctx.stroke(); ctx.setLineDash([]);
  }

  // Thin dark outline
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();

  // Name tag below
  const label = shortName.length > 9 ? shortName.slice(0, 9) : shortName;
  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const tw = ctx.measureText(label).width + 8;
  const ty = y + r + 12;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.beginPath(); ctx.roundRect(x - tw / 2, ty - 7, tw, 14, 4); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 2;
  ctx.fillText(label, x, ty);

  ctx.restore();
}

function drawBall(ctx: CanvasRenderingContext2D, ball: Ball) {
  const { x, y, radius: r } = ball;
  ctx.save();

  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;

  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, 1, x, y, r);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.5, '#e0e0e0');
  grad.addColorStop(1, '#888888');
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = grad; ctx.fill();
  ctx.shadowColor = 'transparent';

  // Pentagon patches
  ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.arc(x, y, r * 0.38, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.65, y + Math.sin(a) * r * 0.65, r * 0.22, 0, Math.PI * 2); ctx.stroke();
  }

  // Highlight
  const hl = ctx.createRadialGradient(x - r * 0.25, y - r * 0.3, 0, x - r * 0.25, y - r * 0.3, r * 0.55);
  hl.addColorStop(0, 'rgba(255,255,255,0.55)'); hl.addColorStop(1, 'transparent');
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = hl; ctx.fill();

  ctx.restore();
}

function drawDragGuide(ctx: CanvasRenderingContext2D, btn: ButtonPiece, dragTo: Vec2) {
  const { x, y } = btn;

  // Direction the button WILL fly (opposite of drag)
  const dx = x - dragTo.x;
  const dy = y - dragTo.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 4) return;

  const ratio = Math.min(dist / (MAX_LAUNCH_FORCE * 5), 1);
  const nx = dx / dist;
  const ny = dy / dist;

  ctx.save();

  // ── Pull line (cursor → button) ─────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(dragTo.x, dragTo.y);
  ctx.lineTo(x, y);
  ctx.strokeStyle = 'rgba(255,80,80,0.5)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // ── Launch arrow (button → launch direction) ────────────────────────────
  const arrowLen = ratio * 90;
  const color = ratio < 0.45
    ? `rgba(80,230,120,0.95)`
    : ratio < 0.75
      ? `rgba(255,200,40,0.95)`
      : `rgba(255,70,70,0.95)`;

  // Arrow shaft
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + nx * arrowLen, y + ny * arrowLen);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Arrowhead
  const hl = 12;
  const angle = Math.atan2(ny, nx);
  ctx.beginPath();
  ctx.moveTo(x + nx * arrowLen, y + ny * arrowLen);
  ctx.lineTo(
    x + nx * arrowLen - hl * Math.cos(angle - 0.42),
    y + ny * arrowLen - hl * Math.sin(angle - 0.42),
  );
  ctx.lineTo(
    x + nx * arrowLen - hl * Math.cos(angle + 0.42),
    y + ny * arrowLen - hl * Math.sin(angle + 0.42),
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  // Force ring around button
  ctx.beginPath();
  ctx.arc(x, y, btn.radius + 4 + ratio * 10, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.4 + ratio * 0.4;
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawIntruder(ctx: CanvasRenderingContext2D, intruder: Intruder) {
  const { x, y, radius: r, type, spawnTime } = intruder;
  ctx.save();
  
  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  if (type === 'torcedor') {
    // Orange square
    ctx.fillStyle = '#ff6b35';
    ctx.strokeStyle = '#d44a1d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - r, y - r, r * 2, r * 2, 6);
    ctx.fill();
    ctx.stroke();

    // Emoji text
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('😆', x, y);
    
    // Draw funny waving arms based on wave time
    const wave = Math.sin((Date.now() - spawnTime) / 100) * 10;
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    // Left arm
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.lineTo(x - r - 8, y - 5 + wave);
    ctx.stroke();
    // Right arm
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + r + 8, y - 5 - wave);
    ctx.stroke();
    
  } else if (type === 'cachorro') {
    // Brown circle
    ctx.fillStyle = '#8B4513';
    ctx.strokeStyle = '#5c2d0c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dog ears
    ctx.fillStyle = '#5c2d0c';
    ctx.beginPath();
    ctx.arc(x - r * 0.8, y - r * 0.3, r * 0.4, 0, Math.PI * 2);
    ctx.arc(x + r * 0.8, y - r * 0.3, r * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Emoji text
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐕', x, y);
    
  } else if (type === 'guarda') {
    // Blue circle
    ctx.fillStyle = '#1e3d59';
    ctx.strokeStyle = '#17252a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Guard cap (visor)
    ctx.fillStyle = '#17252a';
    ctx.beginPath();
    ctx.arc(x, y - r * 0.8, r * 0.6, Math.PI, 0);
    ctx.fill();

    // Emoji text
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👮', x, y + 2);
  }

  // Draw little exclamation warning when spawning (first 1.5 seconds)
  const age = Date.now() - spawnTime;
  if (age < 1500) {
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = '#ff3333';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ INVASÃO!', x, y - r - 10);
  }

  ctx.restore();
}
