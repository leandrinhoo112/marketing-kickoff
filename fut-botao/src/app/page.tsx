'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TEAMS, Team } from '@/data/teams';
import { GameState, GameMode, AIDifficulty, GameModifiers } from '@/game/types';
import { getInitialPositions } from '@/game/physics';
import { playWhistle, playSlide } from '@/game/sounds';
import { useOnlineGame } from '@/hooks/useOnlineGame';
import GameCanvas from '@/components/GameCanvas';
import GameHUD from '@/components/GameHUD';
import TeamSelect from '@/components/TeamSelect';
import RoomModal from '@/components/RoomModal';
import VictoryScreen from '@/components/VictoryScreen';
import EliminationModal from '@/components/EliminationModal';

// ── Types ─────────────────────────────────────────────────────────────────

type AppScreen = 'home' | 'room' | 'teamselect' | 'game';

// ── Helpers ───────────────────────────────────────────────────────────────

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function buildInitialState(
  teamA: Team,
  teamB: Team,
  mode: GameMode,
  aiDifficulty?: AIDifficulty,
  roomCode?: string,
  modifiers?: GameModifiers
): GameState {
  const { buttons, ball } = getInitialPositions(
    teamA.id, teamB.id,
    teamA.players.map(p => p.shortName),
    teamB.players.map(p => p.shortName),
    teamA.logoUrl, teamB.logoUrl,
    teamA.primaryColor, teamB.primaryColor
  );
  return {
    mode, aiDifficulty,
    teamA: teamA.id, teamB: teamB.id,
    scoreA: 0, scoreB: 0,
    currentTurn: 'A',
    phase: 'selecting',
    selectedButtonId: null,
    dragStart: null, dragCurrent: null,
    buttons, ball,
    roomCode, playerSide: 'A',
    goalLimit: modifiers?.ultimoBotao ? 5 : 3,
    modifiers,
    intruders: [],
    eliminatedButtons: [],
  };
}

function resetPositions(prev: GameState, nextTurn: 'A' | 'B'): Partial<GameState> {
  console.log("DEBUG: resetPositions called. Excluded IDs:", prev.eliminatedButtons);
  const ta = TEAMS.find(t => t.id === prev.teamA)!;
  const tb = TEAMS.find(t => t.id === prev.teamB)!;
  const { buttons, ball } = getInitialPositions(
    ta.id, tb.id,
    ta.players.map(p => p.shortName),
    tb.players.map(p => p.shortName),
    ta.logoUrl, tb.logoUrl,
    ta.primaryColor, tb.primaryColor,
    prev.eliminatedButtons
  );
  return { buttons, ball, phase: 'selecting', currentTurn: nextTurn, selectedButtonId: null, dragStart: null, dragCurrent: null };
}

// ── Main Component ────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen]         = useState<AppScreen>('home');
  const [mode, setMode]             = useState<GameMode>('local');
  const [aiDiff, setAiDiff]         = useState<AIDifficulty>('medium');
  const [teamA, setTeamA]           = useState<Team | null>(null);
  const [teamB, setTeamB]           = useState<Team | null>(null);
  const [gameState, setGameState]   = useState<GameState | null>(null);
  const [localSide, setLocalSide]   = useState<'A' | 'B'>('A');
  const [winner, setWinner]         = useState<'A' | 'B' | 'draw' | null>(null);
  const [roomCode, setRoomCode]     = useState<string | undefined>();
  const [opponentTeam, setOpponentTeam]   = useState<Team | null>(null);
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [connStatus, setConnStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');
  const [mySelectedTeam, setMySelectedTeam] = useState<Team | null>(null);
  const [modifiers, setModifiers]   = useState<GameModifiers>({ intrusoNoCampo: false, ultimoBotao: false });
  const [pendingEliminationSide, setPendingEliminationSide] = useState<'A' | 'B' | null>(null);
  const [isLegendaryWinner, setIsLegendaryWinner] = useState(false);

  // ── Online Pusher hook ────────────────────────────────────────────────
  const { announceTeam, broadcastLaunch, broadcastElimination } = useOnlineGame(
    mode === 'online' ? roomCode : undefined,
    localSide,
    {
      onConnectionChange: (s) => setConnStatus(s as 'connecting' | 'connected' | 'disconnected'),

      onGuestJoined: () => {
        setOpponentJoined(true);
        // If we already selected a team, page.tsx re-announces via hook's internal logic
      },

      onOpponentReady: (teamId) => {
        const t = TEAMS.find(t => t.id === teamId);
        if (!t) return;
        setOpponentTeam(t);
      },

      onOpponentLaunch: (buttonId, vx, vy) => {
        // Opponent moved — apply to local game state so our physics loop runs it
        playSlide();
        setGameState(prev => {
          if (!prev) return prev;
          const updatedButtons = prev.buttons.map(b =>
            b.id === buttonId ? { ...b, vx, vy } : b
          );
          return { ...prev, buttons: updatedButtons, phase: 'moving', selectedButtonId: null };
        });
      },

      onOpponentEliminate: (buttonId) => {
        setGameState(prev => {
          if (!prev) return prev;
          const updatedEliminated = [...(prev.eliminatedButtons || []), buttonId];
          const scorer = buttonId.startsWith('A-') ? 'A' : 'B';
          const nextTurn: 'A' | 'B' = scorer === 'A' ? 'B' : 'A';
          const tempState = { ...prev, eliminatedButtons: updatedEliminated };
          return {
            ...tempState,
            ...resetPositions(tempState, nextTurn)
          };
        });
        setPendingEliminationSide(null);
      }
    }
  );

  // Start game when both teams are known (online mode)
  const onlineGameStartedRef = useRef(false);
  React.useEffect(() => {
    if (mode !== 'online') return;
    if (!mySelectedTeam || !opponentTeam || onlineGameStartedRef.current) return;

    onlineGameStartedRef.current = true;
    const tA = localSide === 'A' ? mySelectedTeam : opponentTeam;
    const tB = localSide === 'B' ? mySelectedTeam : opponentTeam;
    setTeamA(tA);
    setTeamB(tB);
    const state = buildInitialState(tA, tB, 'online', undefined, roomCode, modifiers);
    state.playerSide = localSide;
    setGameState(state);
    setWinner(null);
    playWhistle();
    setScreen('game');
  }, [mode, mySelectedTeam, opponentTeam, localSide, roomCode, modifiers]);

  // ── Mode selection ────────────────────────────────────────────────────

  const handleSelectMode = (m: GameMode) => {
    setMode(m);
    onlineGameStartedRef.current = false;
    setOpponentTeam(null);
    setMySelectedTeam(null);
    setOpponentJoined(false);
    if (m === 'online') {
      setScreen('room');
    } else {
      setScreen('teamselect');
    }
  };

  const handleCreateRoom = useCallback(() => {
    const code = generateRoomCode();
    setRoomCode(code);
    setLocalSide('A');
    setConnStatus('connecting');
    // Go to team select immediately so host can pick their team while waiting
    setScreen('teamselect');
  }, []);

  const handleJoinRoom = useCallback((code: string) => {
    setRoomCode(code);
    setLocalSide('B');
    setConnStatus('connecting');
    setScreen('teamselect');
  }, []);

  // ── Team selection ────────────────────────────────────────────────────

  const handleTeamsSelected = useCallback((tA: Team, tB: Team) => {
    if (mode === 'online') {
      // In online mode, 'tA' is always the local player's picked team
      const myTeam = tA;
      setMySelectedTeam(myTeam);
      announceTeam(myTeam.id);
      // Stay on room/waiting screen until opponent is also ready
      setScreen('room');
      return;
    }

    // Local / AI modes
    setTeamA(tA);
    setTeamB(tB);
    const state = buildInitialState(tA, tB, mode, aiDiff, undefined, modifiers);
    setGameState(state);
    setWinner(null);
    playWhistle();
    setScreen('game');
  }, [mode, aiDiff, announceTeam, modifiers]);

  // ── Game logic ────────────────────────────────────────────────────────

  const handleStateChange = useCallback((partial: Partial<GameState>) => {
    setGameState(prev => prev ? { ...prev, ...partial } : prev);
  }, []);

  const handleEliminatePlayer = useCallback((buttonId: string) => {
    console.log("DEBUG: handleEliminatePlayer called with:", buttonId);
    if (mode === 'online') {
      broadcastElimination(buttonId);
    }
    
    setGameState(prev => {
      if (!prev) return prev;
      const updatedEliminated = [...(prev.eliminatedButtons || []), buttonId];
      const scorer = pendingEliminationSide || (buttonId.startsWith('A-') ? 'A' : 'B');
      const nextTurn: 'A' | 'B' = scorer === 'A' ? 'B' : 'A';
      const tempState = { ...prev, eliminatedButtons: updatedEliminated };
      console.log("DEBUG: Updated eliminated list:", updatedEliminated);
      return {
        ...tempState,
        ...resetPositions(tempState, nextTurn)
      };
    });
    setPendingEliminationSide(null);
  }, [mode, broadcastElimination, pendingEliminationSide]);

  // AI auto-elimination effect
  useEffect(() => {
    if (mode !== 'ai' || pendingEliminationSide !== 'B' || !gameState) return;
    
    const aiOutfields = gameState.buttons.filter(b => b.teamSide === 'B' && !b.isGoalkeeper);
    if (aiOutfields.length > 0) {
      // AI chooses the outfield button furthest from the ball
      let bestChoice = aiOutfields[0];
      let maxDist = -Infinity;
      for (const btn of aiOutfields) {
        const dist = Math.hypot(btn.x - gameState.ball.x, btn.y - gameState.ball.y);
        if (dist > maxDist) {
          maxDist = dist;
          bestChoice = btn;
        }
      }
      
      console.log("DEBUG: AI auto-eliminating player:", bestChoice.id);
      const timer = setTimeout(() => {
        handleEliminatePlayer(bestChoice.id);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [mode, pendingEliminationSide, gameState, handleEliminatePlayer]);

  const handleGoal = useCallback((scorer: 'A' | 'B') => {
    console.log("DEBUG: handleGoal called with scorer:", scorer);
    setGameState(prev => {
      if (!prev) return prev;
      const newScoreA = scorer === 'A' ? prev.scoreA + 1 : prev.scoreA;
      const newScoreB = scorer === 'B' ? prev.scoreB + 1 : prev.scoreB;

      const isOver = newScoreA >= prev.goalLimit || newScoreB >= prev.goalLimit;

      if (isOver) {
        const w: 'A' | 'B' | 'draw' = newScoreA > newScoreB ? 'A' : newScoreB > newScoreA ? 'B' : 'draw';
        
        // Determine if winner achieved a legendary victory
        const isLegendary = !!prev.modifiers?.ultimoBotao;
        
        setTimeout(() => {
          setWinner(w);
          setIsLegendaryWinner(isLegendary);
        }, 600);

        return { ...prev, scoreA: newScoreA, scoreB: newScoreB, phase: 'finished' };
      }

      const nextTurn: 'A' | 'B' = scorer === 'A' ? 'B' : 'A';

      if (prev.modifiers?.ultimoBotao) {
        setTimeout(() => {
          setPendingEliminationSide(scorer);
        }, 0);
        return {
          ...prev,
          scoreA: newScoreA,
          scoreB: newScoreB,
          phase: 'finished'
        };
      }

      return {
        ...prev,
        scoreA: newScoreA,
        scoreB: newScoreB,
        ...resetPositions(prev, nextTurn)
      };
    });
  }, []);

  const handleLaunch = useCallback((buttonId: string, vx: number, vy: number) => {
    if (mode === 'online') {
      broadcastLaunch(buttonId, vx, vy);
    }
  }, [mode, broadcastLaunch]);

  const handlePlayAgain = useCallback(() => {
    if (!teamA || !teamB) return;
    onlineGameStartedRef.current = false;
    const state = buildInitialState(teamA, teamB, mode, aiDiff, roomCode, modifiers);
    state.playerSide = localSide;
    setGameState(state);
    setWinner(null);
    setIsLegendaryWinner(false);
    playWhistle();
  }, [teamA, teamB, mode, aiDiff, roomCode, localSide, modifiers]);

  const handleMenu = () => {
    setScreen('home');
    setGameState(null);
    setWinner(null);
    setIsLegendaryWinner(false);
    setPendingEliminationSide(null);
    setTeamA(null);
    setTeamB(null);
    setRoomCode(undefined);
    setOpponentTeam(null);
    setMySelectedTeam(null);
    setOpponentJoined(false);
    onlineGameStartedRef.current = false;
  };

  // ── Effective local side ──────────────────────────────────────────────
  // In local mode, current player is always the one whose turn it is
  const effectiveSide: 'A' | 'B' = mode === 'local'
    ? (gameState?.currentTurn ?? 'A')
    : localSide;

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <>
      {screen === 'home' && (
        <HomeScreen
          onSelectMode={handleSelectMode}
          aiDifficulty={aiDiff}
          onAiDifficultyChange={setAiDiff}
          modifiers={modifiers}
          onModifiersChange={setModifiers}
        />
      )}

      {screen === 'room' && (
        <RoomModal
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onBack={handleMenu}
          roomCode={roomCode}
          connectionStatus={connStatus}
          opponentJoined={opponentJoined}
          isHost={localSide === 'A'}
        />
      )}

      {screen === 'teamselect' && (
        <TeamSelect
          mode={mode}
          aiDifficulty={aiDiff}
          onSelect={handleTeamsSelected}
          onBack={() => setScreen(mode === 'online' ? 'room' : 'home')}
          // For online, both players just pick "their" team (shown as single select)
        />
      )}

      {screen === 'game' && gameState && teamA && teamB && (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-2 gap-3">
          <div className="w-full max-w-4xl">
            <GameHUD
              teamA={teamA}
              teamB={teamB}
              scoreA={gameState.scoreA}
              scoreB={gameState.scoreB}
              currentTurn={gameState.currentTurn}
              phase={gameState.phase}
              goalLimit={gameState.goalLimit}
              localSide={effectiveSide}
              onQuit={handleMenu}
            />
          </div>
          <div className="w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <GameCanvas
              gameState={gameState}
              onStateChange={handleStateChange}
              onGoal={handleGoal}
              localSide={effectiveSide}
              onLaunch={handleLaunch}
            />
          </div>
          {mode === 'online' && (
            <div className={`text-xs flex items-center gap-2 ${connStatus === 'connected' ? 'text-green-400/60' : 'text-red-400/60'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
              {connStatus === 'connected' ? 'Online · sala ' + roomCode : 'Reconectando...'}
            </div>
          )}
          {mode === 'local' && (
            <p className="text-white/30 text-xs">
              Modo local — vez de {gameState.currentTurn === 'A' ? teamA.name : teamB.name}
            </p>
          )}
        </div>
      )}

      {winner && gameState && teamA && teamB && (
        <VictoryScreen
          winner={winner}
          teamA={teamA}
          teamB={teamB}
          scoreA={gameState.scoreA}
          scoreB={gameState.scoreB}
          localSide={localSide}
          onPlayAgain={handlePlayAgain}
          onMenu={handleMenu}
          isLegendary={isLegendaryWinner}
        />
      )}

      {pendingEliminationSide && gameState && teamA && teamB && (
        <EliminationModal
          team={pendingEliminationSide === 'A' ? teamA : teamB}
          buttons={gameState.buttons}
          onEliminate={handleEliminatePlayer}
          isAutomatic={
            (mode === 'ai' && pendingEliminationSide === 'B') ||
            (mode === 'online' && pendingEliminationSide !== localSide)
          }
        />
      )}
    </>
  );
}

// ── Home Screen ───────────────────────────────────────────────────────────

interface HomeScreenProps {
  onSelectMode: (mode: GameMode) => void;
  aiDifficulty: AIDifficulty;
  onAiDifficultyChange: (d: AIDifficulty) => void;
  modifiers: GameModifiers;
  onModifiersChange: (m: GameModifiers) => void;
}

function HomeScreen({ onSelectMode, aiDifficulty, onAiDifficultyChange, modifiers, onModifiersChange }: HomeScreenProps) {
  const [showAI, setShowAI] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-green-950/40 to-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="absolute border border-white/5 rounded-full" style={{
            width: `${120 + i * 90}px`,
            height: `${120 + i * 90}px`,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }} />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-10">
          <div className="text-7xl mb-3 drop-shadow-2xl">🏟️</div>
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
            Futebol de
            <span className="block bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              Botão
            </span>
          </h1>
          <p className="text-white/40 mt-3 text-sm">O clássico jogo de tabuleiro agora online!</p>
        </div>

        {/* Mode buttons */}
        <div className="flex flex-col gap-3">
          {/* Online */}
          <button
            id="btn-online"
            onClick={() => onSelectMode('online')}
            className="w-full py-5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/20 flex items-center gap-4 text-left"
          >
            <span className="text-3xl">🌐</span>
            <div>
              <div className="font-black text-lg">Online</div>
              <div className="text-sm opacity-70">Jogue com um amigo via código de sala</div>
            </div>
          </button>

          {/* Local */}
          <button
            id="btn-local"
            onClick={() => onSelectMode('local')}
            className="w-full py-5 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-2xl font-bold transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/20 flex items-center gap-4 text-left"
          >
            <span className="text-3xl">👥</span>
            <div>
              <div className="font-black text-lg">Local</div>
              <div className="text-sm opacity-70">2 jogadores no mesmo dispositivo</div>
            </div>
          </button>

          {/* vs AI */}
          <div className="flex flex-col gap-2">
            <button
              id="btn-ai"
              onClick={() => setShowAI(p => !p)}
              className="w-full py-5 px-6 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white rounded-2xl font-bold transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20 flex items-center gap-4 text-left"
            >
              <span className="text-3xl">🤖</span>
              <div className="flex-1">
                <div className="font-black text-lg">vs Computador</div>
                <div className="text-sm opacity-70">
                  Dificuldade: <span className="font-bold capitalize">{aiDifficulty === 'easy' ? 'Fácil' : aiDifficulty === 'medium' ? 'Médio' : 'Difícil'}</span>
                </div>
              </div>
              <span className="text-white/40 text-sm">{showAI ? '▲' : '▼'}</span>
            </button>

            {showAI && (
              <div className="flex gap-2 px-1">
                {(['easy', 'medium', 'hard'] as AIDifficulty[]).map(d => (
                  <button
                    key={d}
                    id={`btn-ai-${d}`}
                    onClick={() => { onAiDifficultyChange(d); onSelectMode('ai'); }}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                      aiDifficulty === d
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30 scale-105'
                        : 'bg-purple-900/40 text-purple-300 hover:bg-purple-800/60 hover:text-white'
                    }`}
                  >
                    {d === 'easy' ? '😊 Fácil' : d === 'medium' ? '😐 Médio' : '😈 Difícil'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modifiers */}
        <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
          <h3 className="text-white font-bold text-xs mb-3 flex items-center gap-1.5 uppercase tracking-wider text-white/60">
            ⚡ Modificadores
          </h3>
          <div className="flex flex-col gap-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={modifiers.intrusoNoCampo}
                onChange={(e) => onModifiersChange({ ...modifiers, intrusoNoCampo: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-gray-800 text-green-500 focus:ring-0 cursor-pointer"
              />
              <div>
                <div className="text-white text-xs font-bold group-hover:text-green-400 transition-colors">
                  🏃 Intruso no Campo
                </div>
                <div className="text-white/40 text-[10px] leading-snug">
                  Torcedores e cachorros invadem o campo e causam caos físico!
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={modifiers.ultimoBotao}
                onChange={(e) => onModifiersChange({ ...modifiers, ultimoBotao: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-gray-800 text-red-500 focus:ring-0 cursor-pointer"
              />
              <div>
                <div className="text-white text-xs font-bold group-hover:text-red-400 transition-colors">
                  💀 Último Botão
                </div>
                <div className="text-white/40 text-[10px] leading-snug">
                  A cada gol marcado, perca um jogador. Marque o 5º gol apenas com o goleiro para vencer!
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Teams mini-preview */}
        <div className="mt-10 flex justify-center gap-3 flex-wrap">
          {TEAMS.map(t => (
            <div key={t.id} title={t.name} className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity cursor-default">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10 p-0.5 border border-white/10">
                <img src={t.logoUrl} alt={t.name} className="w-full h-full object-contain rounded-full" />
              </div>
              <span className="text-white/30 text-[9px] font-bold">{t.shortName}</span>
            </div>
          ))}
        </div>

        <p className="text-white/15 text-[10px] mt-4">
          Athletico · Coritiba · Flamengo · São Paulo · Grêmio · Sport · Vasco
        </p>
      </div>
    </div>
  );
}
