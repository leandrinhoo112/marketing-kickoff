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
 * The canvas also owns the "world" of the match (arena layout, power-ups on the
 * pitch, Super Chute meters). It is reset whenever gameState.matchId changes.
 */
import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  ButtonPiece, Ball, GameState, Vec2, Intruder, GameModifiers,
  World, ArenaLayout, PowerUp, PhysEvent, TeamSide,
} from '@/game/types';
import {
  FIELD, stepPhysics, isMoving, MAX_LAUNCH_FORCE, SUPER_MULT, TURN_FRAME_LIMIT,
} from '@/game/physics';
import { aiDecisionSteps, AIDecision } from '@/game/ai';
import {
  Meters, newMeters, pickArena, spawnPowerUp, applyPowerUp, endOfTurnEffects,
  ensurePlayable, canLaunch, simulateLaunch, SimTrace,
  POWERUP_INFO, ENERGY_PER_TURN, ENERGY_ON_CONCEDE,
} from '@/game/mechanics';
import {
  playSlide, playGoal, playTeamAnthem, playRandomNarration, stopNarration,
  playKick, playBumper, playPowerUp, playPowerSpawn, playSuperArm, playSuperShot, playPortal,
} from '@/game/sounds';
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

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; max: number; color: string; size: number;
}

interface AIAim {
  buttonId: string; vx: number; vy: number; useSuper: boolean;
  label: string; start: number; until: number;
}

interface Local {
  buttons: ButtonPiece[];
  ball: Ball;
  phase: GameState['phase'];
  currentTurn: 'A' | 'B';
  selectedButtonId: string | null;
  dragStart: Vec2 | null;
  dragCurrent: Vec2 | null;
  goalFlash: { scorer: string; until: number; title: string } | null;
  intruders: Intruder[];
  modifiers?: GameModifiers;
  lastIntruderSpawnTime: number;

  // ── match world ──
  matchId: number | undefined;
  world: World;
  meters: Meters;
  turnCount: number;
  superArmed: boolean;

  // ── current move ──
  movingFrames: number;
  superMove: boolean;
  lastTouchSide: TeamSide | null;
  bouncesSinceTouch: number;
  slowTick: number;

  // ── visuals ──
  particles: Particle[];
  trail: Vec2[];
  shake: number;
  banner: { text: string; color: string; start: number; until: number } | null;
  bumperFlash: number[];
  aiAim: AIAim | null;
  aiThink: { side: TeamSide; count: number } | null;
  preview: SimTrace | null;
  previewKey: string;
}

function newWorld(modifiers?: GameModifiers): World {
  return { arena: modifiers?.arenaMaluca ? pickArena() : null, powerups: [] };
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

    matchId:    gs.matchId,
    world:      newWorld(gs.modifiers),
    meters:     newMeters(),
    turnCount:  0,
    superArmed: false,

    movingFrames: 0,
    superMove: false,
    lastTouchSide: null,
    bouncesSinceTouch: 0,
    slowTick: 0,

    particles: [],
    trail: [],
    shake: 0,
    banner: null,
    bumperFlash: [],
    aiAim: null,
    aiThink: null,
    preview: null,
    previewKey: '',
  };
}

interface Hud {
  eA: number; eB: number;
  colorA: string; colorB: string;
  armed: boolean;
  canArm: boolean;
  arena: string | null;
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
  const aiTimer2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The authoritative local state
  const local = useRef<Local>(copyFromState(gameState));

  const [hud, setHud] = useState<Hud>({
    eA: 0, eB: 0, colorA: '#22d3ee', colorB: '#fb923c', armed: false, canArm: false,
    arena: null,
  });

  // Keep callbacks and latest gameState stable in refs
  const onStateChangeRef = useRef(onStateChange);
  const onGoalRef        = useRef(onGoal);
  const onLaunchRef      = useRef(onLaunch);
  const gameStateRef     = useRef(gameState);
  const localSideRef     = useRef(localSide);
  useEffect(() => { onStateChangeRef.current = onStateChange; }, [onStateChange]);
  useEffect(() => { onGoalRef.current = onGoal; }, [onGoal]);
  useEffect(() => { onLaunchRef.current = onLaunch; }, [onLaunch]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { localSideRef.current = localSide; }, [localSide]);

  // ── HUD sync (energy bars + Super Chute button) ─────────────────────────

  const syncHud = useCallback(() => {
    const L = local.current;
    const humanTurn = L.currentTurn === localSideRef.current
      && (L.phase === 'selecting' || L.phase === 'dragging');
    const next: Hud = {
      eA: L.meters.energy.A,
      eB: L.meters.energy.B,
      colorA: L.buttons.find(b => b.teamSide === 'A')?.primaryColor ?? '#22d3ee',
      colorB: L.buttons.find(b => b.teamSide === 'B')?.primaryColor ?? '#fb923c',
      armed: L.superArmed,
      canArm: humanTurn && L.meters.energy[L.currentTurn] >= 100,
      arena: L.world.arena?.name ?? null,
    };
    setHud(prev => (
      prev.eA === next.eA && prev.eB === next.eB && prev.armed === next.armed
      && prev.canArm === next.canArm && prev.arena === next.arena
      && prev.colorA === next.colorA && prev.colorB === next.colorB
    ) ? prev : next);
  }, []);

  const showBanner = useCallback((text: string, color = '#ffffff', ms = 1500) => {
    const now = Date.now();
    local.current.banner = { text, color, start: now, until: now + ms };
  }, []);

  // Sync React props → local ref (only when safe to do so)
  useEffect(() => {
    const L = local.current;
    const wasMoving = L.phase === 'moving';

    // New match → fresh world (arena, power-ups, energy)
    if (gameState.matchId !== L.matchId) {
      L.matchId    = gameState.matchId;
      L.world      = newWorld(gameState.modifiers);
      L.meters     = newMeters();
      L.turnCount  = 0;
      L.superArmed = false;
      L.particles  = [];
      L.trail      = [];
      L.aiAim      = null;
      L.aiThink    = null;
      L.goalFlash  = null;
      if (L.world.arena) showBanner(`🎪 Arena: ${L.world.arena.name}`, '#fde68a', 2200);
    }

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
      L.buttons = gameState.buttons.map(b => ({ ...b }));
      L.ball    = { ...gameState.ball };
      L.intruders = gameState.intruders ? gameState.intruders.map(i => ({ ...i })) : [];
    } else if (!wasMoving) {
      // A launch that arrived through props (online opponent) — copy its velocity in
      for (const pb of gameState.buttons) {
        const sp = Math.hypot(pb.vx, pb.vy);
        if (sp <= 0) continue;
        const lb = L.buttons.find(b => b.id === pb.id);
        if (!lb) continue;
        lb.vx = pb.vx; lb.vy = pb.vy;
        if (sp > MAX_LAUNCH_FORCE * 1.05) {
          lb.superActive = true;
          L.superMove = true;
          L.meters.energy[lb.teamSide] = 0;
          playSuperShot();
          showBanner('⚡ SUPER CHUTE!', '#facc15');
        }
      }
      L.movingFrames = 0;
      L.lastTouchSide = null;
      L.bouncesSinceTouch = 0;
    }
    syncHud();
  }, [gameState, syncHud, showBanner]);

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

  // First render of a match with an arena → announce it
  useEffect(() => {
    const a = local.current.world.arena;
    if (a) showBanner(`🎪 Arena: ${a.name}`, '#fde68a', 2200);
  }, [showBanner]);

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

  // ── Launch (shared by human, AI and touch) ──────────────────────────────

  const launch = useCallback((btn: ButtonPiece, vx: number, vy: number, useSuper: boolean) => {
    const L = local.current;
    if (useSuper) {
      vx *= SUPER_MULT; vy *= SUPER_MULT;
      btn.superActive = true;
      L.superMove = true;
      L.meters.energy[btn.teamSide] = 0;
      L.shake = 9;
      playSuperShot();
      showBanner('⚡ SUPER CHUTE!', '#facc15');
    } else {
      L.superMove = false;
      playSlide();
    }
    btn.vx = vx;
    btn.vy = vy;
    L.phase            = 'moving';
    L.movingFrames     = 0;
    L.lastTouchSide    = null;
    L.bouncesSinceTouch = 0;
    L.superArmed       = false;
    L.selectedButtonId = null;
    L.dragStart = L.dragCurrent = null;
    L.preview = null; L.previewKey = '';
    // Sync phase to React so HUD updates
    onStateChangeRef.current({ phase: 'moving', selectedButtonId: null });
    syncHud();
    return { vx, vy };
  }, [syncHud, showBanner]);

  // ── AI ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (gameState.mode !== 'ai') return;
    if (gameState.phase !== 'selecting') return;
    if (gameState.currentTurn === localSide) return; // human's turn

    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    if (aiTimer2Ref.current) clearTimeout(aiTimer2Ref.current);

    aiTimerRef.current = setTimeout(() => {
      const L = local.current;
      if (L.phase !== 'selecting' || L.currentTurn === localSide) return;

      // The AI plays hundreds of candidate launches forward before choosing.
      // It works on a snapshot and thinks in ~12ms slices so the page never freezes.
      const gen = aiDecisionSteps({
        side: L.currentTurn,
        buttons: L.buttons.map(b => ({ ...b })),
        ball: { ...L.ball },
        world: { arena: L.world.arena, powerups: L.world.powerups.slice() },
        difficulty: gameState.aiDifficulty || 'medium',
        energy: { ...L.meters.energy },
      });
      L.aiThink = { side: L.currentTurn, count: 0 };

      const decided = (d: AIDecision) => {
        const L1 = local.current;
        L1.aiThink = null;
        if (L1.phase !== 'selecting' || L1.currentTurn === localSide) return;

        // Show the aim for a moment (arrow + thought bubble), then shoot
        const now = Date.now();
        const aimMs = 750;
        L1.aiAim = { ...d, start: now, until: now + aimMs };

        aiTimer2Ref.current = setTimeout(() => {
          const L2 = local.current;
          L2.aiAim = null;
          if (L2.phase !== 'selecting' || L2.currentTurn === localSide) return;
          const btn = L2.buttons.find(b => b.id === d.buttonId);
          if (!btn) return;
          launch(btn, d.vx, d.vy, d.useSuper && L2.meters.energy[btn.teamSide] >= 100);
        }, aimMs);
      };

      const pump = () => {
        const t0 = performance.now();
        let r = gen.next();
        while (!r.done && performance.now() - t0 < 12) r = gen.next();
        if (r.done) { decided(r.value); return; }
        if (local.current.aiThink) local.current.aiThink.count = r.value;
        aiTimerRef.current = setTimeout(pump, 0);
      };
      pump();
    }, 200 + Math.random() * 250);

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      if (aiTimer2Ref.current) clearTimeout(aiTimer2Ref.current);
      local.current.aiAim = null;
      local.current.aiThink = null;
    };
  }, [gameState.phase, gameState.currentTurn, gameState.mode, gameState.aiDifficulty, localSide, launch]);

  // ── Main loop (physics + render) ────────────────────────────────────────

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const L = local.current;
    const now = Date.now();
    const events: PhysEvent[] = [];

    const burst = (x: number, y: number, n: number, color: string, speed = 3, size = 3) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = speed * (0.35 + Math.random() * 0.65);
        const max = 18 + Math.random() * 18;
        L.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: max, max, color, size });
      }
      if (L.particles.length > 400) L.particles.splice(0, L.particles.length - 400);
    };

    const handleEvents = () => {
      let pushButtons = false;
      for (const ev of events) {
        if (ev.type === 'hit') {
          if (ev.ball) {
            L.lastTouchSide = ev.side ?? L.lastTouchSide;
            L.bouncesSinceTouch = 0;
          }
          if (ev.power > 1.6) {
            playKick(ev.power);
            burst(ev.x, ev.y, Math.min(14, 3 + Math.floor(ev.power)), L.superMove ? '#fb923c' : '#ffffff', 1.5 + ev.power * 0.25, 2.5);
            if (ev.power > 8) L.shake = Math.max(L.shake, Math.min(10, ev.power * 0.6));
          }
        } else if (ev.type === 'wall') {
          L.bouncesSinceTouch++;
          if (ev.power > 3) burst(ev.x, ev.y, 5, '#d9f99d', 2, 2);
        } else if (ev.type === 'bumper') {
          L.bouncesSinceTouch++;
          L.bumperFlash[ev.index] = now;
          playBumper();
          burst(ev.x, ev.y, 10, '#f472b6', 3.5, 3);
        } else if (ev.type === 'portal') {
          playPortal();
          burst(ev.x, ev.y, 14, '#c084fc', 3, 3);
          burst(ev.tx, ev.ty, 14, '#c084fc', 3, 3);
          L.trail = [];
        } else if (ev.type === 'pickup') {
          const text = applyPowerUp(ev.powerup.kind, ev.buttonId, ev.side, L.buttons, L.ball, L.meters, L.currentTurn);
          const info = POWERUP_INFO[ev.powerup.kind];
          playPowerUp();
          burst(ev.powerup.x, ev.powerup.y, 26, info.color, 4.5, 3.5);
          showBanner(text, info.color);
          pushButtons = true;
        }
      }
      if (pushButtons) {
        syncHud();
        if (L.phase !== 'moving') {
          onStateChangeRef.current({ buttons: L.buttons.map(b => ({ ...b })), ball: { ...L.ball } });
        }
      }
    };

    const onGoalScored = (scorer: TeamSide) => {
      L.phase = 'finished'; // stop simulation
      playGoal();
      // Play the scoring team's anthem
      const gs = gameStateRef.current;
      playTeamAnthem(scorer === 'A' ? gs.teamA : gs.teamB);

      const ownGoal = L.lastTouchSide !== null && L.lastTouchSide !== scorer;
      const title = ownGoal ? 'GOL CONTRA! 😱'
        : L.superMove ? 'SUPER GOL! ⚡'
        : L.bouncesSinceTouch > 0 ? 'GOLAÇO DE TABELA! 🧱'
        : 'GOL! ⚽';
      L.goalFlash = { scorer, until: now + 2000, title };
      L.shake = 14;
      burst(L.ball.x, L.ball.y, 60, '#fde047', 7, 4);
      burst(L.ball.x, L.ball.y, 40, '#ffffff', 5, 3);

      // Comeback mechanic: conceding charges the Super Chute
      const conceding: TeamSide = scorer === 'A' ? 'B' : 'A';
      L.meters.energy[conceding] = Math.min(100, L.meters.energy[conceding] + ENERGY_ON_CONCEDE);
      L.superArmed = false;
      L.superMove = false;
      L.trail = [];
      syncHud();
      onGoalRef.current(scorer);
    };

    const endTurn = () => {
      const side = L.currentTurn;
      if (L.movingFrames >= TURN_FRAME_LIMIT) {
        L.buttons.forEach(b => { b.vx = 0; b.vy = 0; });
        L.ball.vx = 0; L.ball.vy = 0;
      }
      endOfTurnEffects(L.buttons, side);
      L.meters.energy[side] = Math.min(100, L.meters.energy[side] + ENERGY_PER_TURN);

      let nextTurn: TeamSide = side === 'A' ? 'B' : 'A';
      if (L.meters.extraTurns[side] > 0) {
        L.meters.extraTurns[side] -= 1;
        nextTurn = side;
        showBanner('🔁 JOGADA EXTRA!', '#4ade80');
      }
      ensurePlayable(L.buttons, nextTurn);

      L.turnCount++;
      if (L.modifiers?.poderes && L.turnCount % 2 === 0 && L.world.powerups.length < 2) {
        const pu = spawnPowerUp(L.buttons, L.ball, L.world);
        if (pu) {
          L.world.powerups.push(pu);
          playPowerSpawn();
          burst(pu.x, pu.y, 12, POWERUP_INFO[pu.kind].color, 2.5, 2.5);
        }
      }

      L.phase       = 'selecting';
      L.currentTurn = nextTurn;
      L.selectedButtonId = null;
      L.superMove   = false;
      // Push final positions + new turn to React
      onStateChangeRef.current({
        buttons:         L.buttons.map(b => ({ ...b })),
        ball:            { ...L.ball },
        phase:           'selecting',
        currentTurn:     nextTurn,
        selectedButtonId: null,
        intruders:       L.intruders.map(i => ({ ...i })),
      });
      syncHud();
    };

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
      // Dramatic slow motion when a fast ball is about to reach a goal mouth
      const bs = Math.hypot(L.ball.vx, L.ball.vy);
      const nearGoal = bs > 2.5 && Math.abs(L.ball.y - FIELD.HEIGHT / 2) < 75 && (
        (L.ball.vx < 0 && L.ball.x < 120) || (L.ball.vx > 0 && L.ball.x > FIELD.WIDTH - 120));
      L.slowTick = nearGoal ? (L.slowTick + 1) % 3 : 0;

      if (!nearGoal || L.slowTick === 0) {
        const scorer = stepPhysics(L.buttons, L.ball, L.world, events); // mutates in place
        L.movingFrames++;
        handleEvents();

        if (scorer) {
          onGoalScored(scorer);
        } else if (!isMoving(L.buttons, L.ball) || L.movingFrames >= TURN_FRAME_LIMIT) {
          // Movement stopped or 3.5s limit reached → end turn
          endTurn();
        }
      }
    } else if (L.phase === 'selecting' || L.phase === 'dragging') {
      // Simulate physics for moving pieces even during player turns, so they keep rolling!
      if (isMoving(L.buttons, L.ball)) {
        const scorer = stepPhysics(L.buttons, L.ball, L.world, events);
        handleEvents();
        if (scorer) {
          onGoalScored(scorer);
        } else if (!isMoving(L.buttons, L.ball)) {
          // Finished rolling during turn → sync final positions
          onStateChangeRef.current({
            buttons: L.buttons.map(b => ({ ...b })),
            ball:    { ...L.ball },
          });
        }
      }
    }

    // Ball trail
    const ballSpeed = Math.hypot(L.ball.vx, L.ball.vy);
    if (ballSpeed > 2.2 && L.phase !== 'finished') {
      L.trail.push({ x: L.ball.x, y: L.ball.y });
      if (L.trail.length > 16) L.trail.shift();
    } else if (L.trail.length) {
      L.trail.shift();
    }

    // Aim preview (short simulated look-ahead while dragging)
    if (L.phase === 'dragging' && L.selectedButtonId && L.dragCurrent) {
      const sel = L.buttons.find(b => b.id === L.selectedButtonId);
      if (sel) {
        const key = `${sel.id}|${Math.round(L.dragCurrent.x)}|${Math.round(L.dragCurrent.y)}|${L.superArmed}`;
        if (key !== L.previewKey) {
          L.previewKey = key;
          const dx = sel.x - L.dragCurrent.x;
          const dy = sel.y - L.dragCurrent.y;
          const dist = Math.hypot(dx, dy);
          if (dist >= 8) {
            const force = Math.min(dist / (MAX_LAUNCH_FORCE * 5), 1) * MAX_LAUNCH_FORCE;
            const trace: SimTrace = { button: [], ball: [] };
            simulateLaunch(L.buttons, L.ball, L.world, sel.id, (dx / dist) * force, (dy / dist) * force, L.superArmed, 46, trace);
            L.preview = trace;
          } else {
            L.preview = null;
          }
        }
      }
    } else if (L.preview) {
      L.preview = null; L.previewKey = '';
    }

    // ─ Render ─────────────────────────────────────────────────────────────
    ctx.clearRect(0, 0, FIELD.WIDTH, FIELD.HEIGHT);
    ctx.save();
    if (L.shake > 0.4) {
      ctx.translate((Math.random() - 0.5) * L.shake, (Math.random() - 0.5) * L.shake);
      L.shake *= 0.86;
    } else {
      L.shake = 0;
    }

    drawField(ctx);
    if (L.world.arena) drawArena(ctx, L.world.arena, now, L.bumperFlash);
    L.world.powerups.forEach(pu => drawPowerUp(ctx, pu, now));

    if (L.preview) drawPreview(ctx, L.preview, L.superArmed);

    if (L.phase === 'dragging' && L.selectedButtonId && L.dragCurrent) {
      const sel = L.buttons.find(b => b.id === L.selectedButtonId);
      if (sel) drawDragGuide(ctx, sel, L.dragCurrent);
    }

    // AI aiming: growing arrow on the chosen button
    let aimBtn: ButtonPiece | undefined;
    if (L.aiAim && now < L.aiAim.until) {
      aimBtn = L.buttons.find(b => b.id === L.aiAim!.buttonId);
      if (aimBtn) {
        const t = Math.min(1, (now - L.aiAim.start) / 450);
        const ease = 1 - Math.pow(1 - t, 3);
        const sp = Math.hypot(L.aiAim.vx, L.aiAim.vy) || 1;
        const pull = (sp / MAX_LAUNCH_FORCE) * MAX_LAUNCH_FORCE * 5 * ease;
        drawDragGuide(ctx, aimBtn, {
          x: aimBtn.x - (L.aiAim.vx / sp) * pull,
          y: aimBtn.y - (L.aiAim.vy / sp) * pull,
        });
      }
    }

    // Draw intruders
    if (L.modifiers?.intrusoNoCampo && L.intruders.length > 0) {
      L.intruders.forEach(intruder => drawIntruder(ctx, intruder));
    }

    // Draw opponent buttons first (under own)
    const side = localSideRef.current;
    const armedId = L.superArmed ? L.selectedButtonId : null;
    L.buttons.filter(b => b.teamSide !== side)
      .forEach(b => drawButton(ctx, b, b.id === aimBtn?.id, imagesRef.current, now, false));
    L.buttons.filter(b => b.teamSide === side)
      .forEach(b => drawButton(ctx, b, b.id === L.selectedButtonId, imagesRef.current, now, b.id === armedId));

    drawTrail(ctx, L.trail, L.ball.radius, L.superMove);
    drawBall(ctx, L.ball, L.superMove && L.phase === 'moving');

    // Particles
    for (let i = L.particles.length - 1; i >= 0; i--) {
      const p = L.particles[i];
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.93; p.vy *= 0.93;
      p.life -= 1;
      if (p.life <= 0) { L.particles.splice(i, 1); continue; }
      ctx.globalAlpha = p.life / p.max;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.4 + 0.6 * p.life / p.max), 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // AI thought bubble
    if (L.aiAim && aimBtn && now < L.aiAim.until) drawBubble(ctx, aimBtn, L.aiAim.label);

    ctx.restore(); // end of screen shake

    // AI "thinking" indicator with the live count of simulated plays
    if (L.aiThink) drawThinking(ctx, L.aiThink.side, L.aiThink.count, now);

    // Banner (power-ups, arena name, extra turn...)
    if (L.banner) {
      if (now >= L.banner.until) L.banner = null;
      else drawBanner(ctx, L.banner, now);
    }

    // Goal flash overlay
    if (L.goalFlash && now < L.goalFlash.until) {
      const t = 1 - (L.goalFlash.until - now) / 2000;
      const pulse = Math.abs(Math.sin(t * Math.PI * 4));
      ctx.save();
      ctx.fillStyle = L.goalFlash.scorer === 'A'
        ? `rgba(0,120,255,${0.15 * pulse})`
        : `rgba(255,60,0,${0.15 * pulse})`;
      ctx.fillRect(0, 0, FIELD.WIDTH, FIELD.HEIGHT);

      const title = L.goalFlash.title;
      ctx.font = `bold ${title.length > 10 ? 54 : 86}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 24;
      ctx.fillStyle = `rgba(255,255,255,${0.7 + 0.3 * pulse})`;
      const scale = 1 + 0.06 * pulse;
      ctx.translate(FIELD.WIDTH / 2, FIELD.HEIGHT / 2);
      ctx.scale(scale, scale);
      ctx.fillText(title, 0, 0);
      ctx.restore();
    } else if (L.goalFlash && now >= L.goalFlash.until) {
      L.goalFlash = null;
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [syncHud, showBanner]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  // ── Super Chute arming (button + Space key) ─────────────────────────────

  const toggleSuper = useCallback(() => {
    const L = local.current;
    if (L.phase !== 'selecting' && L.phase !== 'dragging') return;
    if (L.currentTurn !== localSideRef.current) return;
    if (L.meters.energy[L.currentTurn] < 100) return;
    L.superArmed = !L.superArmed;
    if (L.superArmed) playSuperArm();
    syncHud();
  }, [syncHud]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code !== 'Space') return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      toggleSuper();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleSuper]);

  // ── Input ──────────────────────────────────────────────────────────────

  function getPosFromClient(clientX: number, clientY: number): Vec2 {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (FIELD.WIDTH  / rect.width),
      y: (clientY - rect.top)  * (FIELD.HEIGHT / rect.height),
    };
  }

  function getPos(e: React.MouseEvent | React.TouchEvent): Vec2 {
    if ('touches' in e && e.touches.length > 0) {
      return getPosFromClient(e.touches[0].clientX, e.touches[0].clientY);
    }
    if ('changedTouches' in e) {
      const t = (e as React.TouchEvent).changedTouches[0];
      return getPosFromClient(t.clientX, t.clientY);
    }
    return getPosFromClient((e as React.MouseEvent).clientX, (e as React.MouseEvent).clientY);
  }

  /** Finishes a slingshot drag at `pos`: launches the button or cancels. */
  const releaseDrag = useCallback((pos: Vec2) => {
    const L = local.current;
    if (L.phase !== 'dragging' || !L.selectedButtonId) return;

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
    const useSuper = L.superArmed && L.meters.energy[btn.teamSide] >= 100;
    const v = launch(btn, (dx / dist) * force, (dy / dist) * force, useSuper);
    // The broadcast carries the boosted velocity, so the other side replays the Super Chute too
    if (onLaunchRef.current) onLaunchRef.current(btn.id, v.vx, v.vy);
  }, [launch]);

  const handleDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const L = local.current;
    if (L.phase !== 'selecting') return;
    if (L.currentTurn !== localSideRef.current) return;

    const pos = getPos(e);
    const hit = L.buttons.find(b =>
      b.teamSide === L.currentTurn && Math.hypot(b.x - pos.x, b.y - pos.y) <= b.radius
    );
    if (!hit) return;
    if (!canLaunch(hit)) {
      showBanner('🧊 Botão congelado!', '#7dd3fc', 900);
      return;
    }

    L.selectedButtonId = hit.id;
    L.dragStart        = { x: hit.x, y: hit.y };
    L.dragCurrent      = pos;
    L.phase            = 'dragging';
    // Lightweight React sync for HUD
    onStateChangeRef.current({ phase: 'dragging', selectedButtonId: hit.id });
  }, [showBanner]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const L = local.current;
    if (L.phase !== 'dragging') return;
    e.preventDefault();
    L.dragCurrent = getPos(e);
  }, []);

  const handleUp = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    releaseDrag(getPos(e));
  }, [releaseDrag]);

  // ── Global mouse listeners (keeps drag alive when cursor leaves canvas) ──

  useEffect(() => {
    function onWindowMove(e: MouseEvent) {
      const L = local.current;
      if (L.phase !== 'dragging') return;
      L.dragCurrent = getPosFromClient(e.clientX, e.clientY);
    }
    function onWindowUp(e: MouseEvent) {
      releaseDrag(getPosFromClient(e.clientX, e.clientY));
    }

    window.addEventListener('mousemove', onWindowMove);
    window.addEventListener('mouseup',   onWindowUp);
    return () => {
      window.removeEventListener('mousemove', onWindowMove);
      window.removeEventListener('mouseup',   onWindowUp);
    };
  }, [releaseDrag]);

  const poderes = !!gameState.modifiers?.poderes;

  return (
    <div className="bg-gray-900">
      <canvas
        ref={canvasRef}
        width={FIELD.WIDTH}
        height={FIELD.HEIGHT}
        style={{ width: '100%', aspectRatio: `${FIELD.WIDTH}/${FIELD.HEIGHT}`, cursor: 'crosshair', display: 'block' }}
        className="touch-none select-none"
        onMouseDown={handleDown}
        /* move/up handled globally via window listeners above */
        onTouchStart={handleDown}
        onTouchMove={handleMove}
        onTouchEnd={handleUp}
      />

      {/* Super Chute strip */}
      <div className="flex items-center gap-3 px-3 py-2 border-t border-white/10">
        <EnergyBar value={hud.eA} color={hud.colorA} />
        <button
          type="button"
          id="btn-super-chute"
          onClick={toggleSuper}
          disabled={!hud.canArm}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-black tracking-wide transition-all ${
            hud.armed
              ? 'bg-yellow-400 text-gray-900 shadow-lg shadow-yellow-400/40 scale-105 animate-pulse'
              : hud.canArm
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/60 hover:bg-yellow-500/30'
                : 'bg-white/5 text-white/30 border border-white/10 cursor-default'
          }`}
          title="Barra cheia = Super Chute (atalho: Espaço)"
        >
          {hud.armed ? '⚡ SUPER ARMADO — LANCE!' : hud.canArm ? '⚡ ATIVAR SUPER CHUTE' : '⚡ Super Chute'}
        </button>
        <EnergyBar value={hud.eB} color={hud.colorB} reverse />
      </div>

      {(poderes || hud.arena) && (
        <div className="px-3 pb-2 text-[10px] text-white/40 flex flex-wrap gap-x-3 gap-y-0.5 justify-center">
          {hud.arena && <span>🎪 Arena: <b className="text-white/60">{hud.arena}</b></span>}
          {poderes && (Object.keys(POWERUP_INFO) as (keyof typeof POWERUP_INFO)[]).map(k => (
            <span key={k}>{POWERUP_INFO[k].emoji} {POWERUP_INFO[k].desc}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function EnergyBar({ value, color, reverse }: { value: number; color: string; reverse?: boolean }) {
  const full = value >= 100;
  return (
    <div className={`flex-1 h-3 rounded-full bg-white/10 overflow-hidden flex ${reverse ? 'justify-end' : ''}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${full ? 'animate-pulse' : ''}`}
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: full ? 'linear-gradient(90deg,#facc15,#fb923c)' : color,
          boxShadow: full ? '0 0 10px #facc15' : undefined,
        }}
      />
    </div>
  );
}


// ── Drawing helpers ────────────────────────────────────────────────────────

function drawField(ctx: CanvasRenderingContext2D) {
  const { WIDTH: W, HEIGHT: H, GOAL_WIDTH: GW, GOAL_DEPTH: GD, BORDER: B } = FIELD;
  const GY1 = H / 2 - GW / 2;

  // Grass
  ctx.fillStyle = '#2a7a30';
  ctx.fillRect(-20, -20, W + 40, H + 40);

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

function drawArena(ctx: CanvasRenderingContext2D, arena: ArenaLayout, now: number, flashes: number[]) {
  ctx.save();

  // Lama
  for (const m of arena.mud) {
    const g = ctx.createRadialGradient(m.x, m.y, 2, m.x, m.y, m.r);
    g.addColorStop(0, 'rgba(92,58,24,0.95)');
    g.addColorStop(0.75, 'rgba(105,70,32,0.85)');
    g.addColorStop(1, 'rgba(105,70,32,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(m.x, m.y, m.r + 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(60,36,12,0.55)';
    for (let i = 0; i < 5; i++) {
      const a = i * 1.9 + 0.4;
      ctx.beginPath();
      ctx.arc(m.x + Math.cos(a) * m.r * 0.45, m.y + Math.sin(a) * m.r * 0.45, m.r * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Aceleradores
  for (const p of arena.boosts) {
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(34,211,238,0.16)'; ctx.fill();
    ctx.strokeStyle = 'rgba(103,232,249,0.7)'; ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]); ctx.lineDashOffset = -(now / 40) % 11; ctx.stroke(); ctx.setLineDash([]);

    const ang = Math.atan2(p.dy, p.dx);
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(ang);
    ctx.beginPath(); ctx.arc(0, 0, p.r - 2, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = 'rgba(165,243,252,0.95)'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const shift = ((now / 12) % 22);
    for (let i = -3; i <= 3; i++) {
      const cx = i * 22 + shift;
      ctx.beginPath(); ctx.moveTo(cx - 7, -10); ctx.lineTo(cx + 3, 0); ctx.lineTo(cx - 7, 10); ctx.stroke();
    }
    ctx.restore();
  }

  // Portais
  for (const p of arena.portals) {
    for (const [x, y] of [[p.ax, p.ay], [p.bx, p.by]] as const) {
      const g = ctx.createRadialGradient(x, y, 1, x, y, p.r);
      g.addColorStop(0, 'rgba(15,5,40,0.95)');
      g.addColorStop(0.7, 'rgba(126,34,206,0.85)');
      g.addColorStop(1, 'rgba(192,132,252,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, p.r + 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(233,213,255,0.9)'; ctx.lineWidth = 2;
      for (let k = 0; k < 3; k++) {
        const a0 = now / 260 + k * 2.1;
        ctx.beginPath(); ctx.arc(x, y, p.r * (0.45 + k * 0.25), a0, a0 + 1.7); ctx.stroke();
      }
    }
  }

  // Bumpers
  arena.bumpers.forEach((b, i) => {
    const age = now - (flashes[i] || 0);
    const flash = age < 220 ? 1 - age / 220 : 0;
    const r = b.r * (1 + 0.22 * flash);
    ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
    const g = ctx.createRadialGradient(b.x - r * 0.3, b.y - r * 0.3, 1, b.x, b.y, r);
    g.addColorStop(0, flash > 0 ? '#ffffff' : '#fda4af');
    g.addColorStop(1, '#e11d48');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(b.x, b.y, r - 1.5, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(b.x, b.y, r * 0.5, 0, Math.PI * 2); ctx.stroke();
  });

  ctx.restore();
}

function drawPowerUp(ctx: CanvasRenderingContext2D, pu: PowerUp, now: number) {
  const info = POWERUP_INFO[pu.kind];
  const bob = Math.sin(now / 260 + pu.x) * 2.5;
  const pulse = 0.5 + 0.5 * Math.sin(now / 200 + pu.y);
  const x = pu.x, y = pu.y + bob, r = pu.r;
  ctx.save();
  ctx.globalAlpha = 0.25 + 0.3 * pulse;
  ctx.strokeStyle = info.color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, r + 5 + pulse * 4, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.shadowColor = info.color; ctx.shadowBlur = 14;
  ctx.fillStyle = 'rgba(17,24,39,0.92)';
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = info.color; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText(info.emoji, x, y + 1);
  ctx.restore();
}

function drawPreview(ctx: CanvasRenderingContext2D, trace: SimTrace, superArmed: boolean) {
  ctx.save();
  const dots = (pts: Vec2[], color: string, r0: number) => {
    for (let i = 0; i < pts.length; i++) {
      ctx.globalAlpha = 0.75 * (1 - i / (pts.length + 2));
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(pts[i].x, pts[i].y, r0, 0, Math.PI * 2); ctx.fill();
    }
  };
  dots(trace.button, superArmed ? '#fdba74' : '#ffffff', 2.6);
  dots(trace.ball, '#fde047', 3.4);
  ctx.restore();
}

function drawTrail(ctx: CanvasRenderingContext2D, trail: Vec2[], r: number, fire: boolean) {
  if (trail.length < 2) return;
  ctx.save();
  for (let i = 0; i < trail.length; i++) {
    const t = (i + 1) / trail.length;
    ctx.globalAlpha = 0.32 * t;
    ctx.fillStyle = fire ? (i % 2 ? '#fb923c' : '#fde047') : '#ffffff';
    ctx.beginPath(); ctx.arc(trail[i].x, trail[i].y, r * (0.35 + 0.6 * t) * (fire ? 1.25 : 1), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawBubble(ctx: CanvasRenderingContext2D, btn: ButtonPiece, label: string) {
  ctx.save();
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(label).width + 18;
  const h = 24;
  const above = btn.y - btn.radius - 22 > h;
  const cx = Math.max(w / 2 + 6, Math.min(FIELD.WIDTH - w / 2 - 6, btn.x));
  const cy = above ? btn.y - btn.radius - 22 : btn.y + btn.radius + 34;
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 8;
  ctx.fillStyle = 'rgba(17,24,39,0.93)';
  ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 12); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(192,132,252,0.9)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 12); ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.fillText(label, cx, cy + 1);
  ctx.restore();
}

function drawThinking(ctx: CanvasRenderingContext2D, side: TeamSide, count: number, now: number) {
  const dots = '.'.repeat(1 + Math.floor(now / 300) % 3);
  const text = count > 0 ? `🤖 analisando ${count} jogadas${dots}` : `🤖 pensando${dots}`;
  ctx.save();
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = side === 'A' ? 'left' : 'right';
  const w = ctx.measureText('🤖 analisando 8888 jogadas...').width + 20;
  const x = side === 'A' ? 18 : FIELD.WIDTH - 18 - w;
  const y = FIELD.HEIGHT - 30;
  ctx.fillStyle = 'rgba(17,24,39,0.85)';
  ctx.beginPath(); ctx.roundRect(x, y - 12, w, 24, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(192,132,252,0.8)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.roundRect(x, y - 12, w, 24, 12); ctx.stroke();
  ctx.fillStyle = '#e9d5ff';
  ctx.fillText(text, side === 'A' ? x + 10 : x + w - 10, y + 1);
  ctx.restore();
}

function drawBanner(
  ctx: CanvasRenderingContext2D,
  banner: { text: string; color: string; start: number; until: number },
  now: number,
) {
  const inT = Math.min(1, (now - banner.start) / 180);
  const outT = Math.min(1, (banner.until - now) / 300);
  const a = Math.min(inT, outT);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.font = 'bold 26px Inter, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(banner.text).width + 36;
  const y = 46 - (1 - inT) * 14;
  ctx.fillStyle = 'rgba(10,10,20,0.78)';
  ctx.beginPath(); ctx.roundRect(FIELD.WIDTH / 2 - w / 2, y - 21, w, 42, 21); ctx.fill();
  ctx.strokeStyle = banner.color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(FIELD.WIDTH / 2 - w / 2, y - 21, w, 42, 21); ctx.stroke();
  ctx.fillStyle = banner.color;
  ctx.fillText(banner.text, FIELD.WIDTH / 2, y + 1);
  ctx.restore();
}

function drawButton(
  ctx: CanvasRenderingContext2D,
  btn: ButtonPiece,
  selected: boolean,
  images: Map<string, HTMLImageElement>,
  now: number,
  superArmed: boolean,
) {
  const { x, y, radius: r, isGoalkeeper, primaryColor, logoUrl, shortName } = btn;
  const img = images.get(logoUrl);
  const onFire = superArmed || !!btn.superActive;

  ctx.save();

  // Super Chute aura
  if (onFire) {
    const pulse = 0.5 + 0.5 * Math.sin(now / 70);
    ctx.beginPath(); ctx.arc(x, y, r + 7 + pulse * 4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(251,146,60,${0.25 + 0.2 * pulse})`; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r + 4, 0, Math.PI * 2);
    ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3; ctx.stroke();
  }

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

  // Giant ring
  if (btn.giantTurns) {
    ctx.beginPath(); ctx.arc(x, y, r + (isGoalkeeper ? 7 : 3), 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(192,132,252,0.95)'; ctx.lineWidth = 2.5; ctx.stroke();
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

  // Frozen overlay
  if (btn.frozenTurns) {
    ctx.beginPath(); ctx.arc(x, y, r + 1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(125,211,252,0.62)'; ctx.fill();
    ctx.strokeStyle = '#e0f2fe'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.font = `${Math.round(r * 0.95)}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText('❄️', x, y + 1);
  }

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

function drawBall(ctx: CanvasRenderingContext2D, ball: Ball, fire: boolean) {
  const { x, y, radius: r } = ball;
  ctx.save();

  if (fire) {
    ctx.shadowColor = '#fb923c'; ctx.shadowBlur = 22;
  } else {
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
  }

  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, 1, x, y, r);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.5, fire ? '#fde68a' : '#e0e0e0');
  grad.addColorStop(1, fire ? '#f97316' : '#888888');
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
