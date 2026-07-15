'use client';
import React from 'react';
import { Team } from '@/data/teams';

interface GameHUDProps {
  teamA: Team;
  teamB: Team;
  scoreA: number;
  scoreB: number;
  currentTurn: 'A' | 'B';
  phase: string;
  goalLimit: number;
  localSide: 'A' | 'B';
  onQuit: () => void;
}

export default function GameHUD({
  teamA,
  teamB,
  scoreA,
  scoreB,
  currentTurn,
  phase,
  goalLimit,
  localSide,
  onQuit,
}: GameHUDProps) {
  const isYourTurn = currentTurn === localSide;
  const turnTeam = currentTurn === 'A' ? teamA : teamB;

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Scoreboard */}
      <div className="flex items-center justify-between bg-gray-900/90 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
        {/* Team A */}
        <div className={`flex items-center gap-3 ${currentTurn === 'A' ? 'opacity-100' : 'opacity-60'} transition-opacity`}>
          <div className="flex flex-col items-center">
            <img src={teamA.logoUrl} alt={teamA.name} className="w-10 h-10 object-contain rounded-full bg-white p-0.5" />
            <span className="text-white text-xs font-bold mt-1">{teamA.shortName}</span>
          </div>
          <span className={`text-5xl font-black tabular-nums ${currentTurn === 'A' ? 'text-cyan-400' : 'text-white'}`}>
            {scoreA}
          </span>
        </div>

        {/* Center info */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Melhor de {goalLimit}</span>
          <span className="text-white text-lg font-bold">×</span>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            phase === 'moving' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
            isYourTurn ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
            'bg-red-500/20 text-red-400 border border-red-500/40'
          }`}>
            {phase === 'moving' ? '⚡ Em jogo...' :
             phase === 'goal' ? '⚽ GOL!' :
             isYourTurn ? '🟢 Sua vez!' : `⏳ Vez de ${turnTeam.shortName}`}
          </div>
        </div>

        {/* Team B */}
        <div className={`flex items-center gap-3 ${currentTurn === 'B' ? 'opacity-100' : 'opacity-60'} transition-opacity`}>
          <span className={`text-5xl font-black tabular-nums ${currentTurn === 'B' ? 'text-orange-400' : 'text-white'}`}>
            {scoreB}
          </span>
          <div className="flex flex-col items-center">
            <img src={teamB.logoUrl} alt={teamB.name} className="w-10 h-10 object-contain rounded-full bg-white p-0.5" />
            <span className="text-white text-xs font-bold mt-1">{teamB.shortName}</span>
          </div>
        </div>
      </div>

      {/* Controls hint */}
      <div className="flex justify-between items-center px-2">
        <p className="text-white/50 text-xs">
          {phase === 'selecting' && isYourTurn ? '💡 Clique e arraste um botão para lançar' : ''}
          {phase === 'dragging' ? '🎯 Solte para lançar!' : ''}
        </p>
        <button
          onClick={onQuit}
          className="text-white/40 hover:text-red-400 text-xs transition-colors px-2 py-1 rounded hover:bg-red-500/10"
        >
          ✕ Sair
        </button>
      </div>
    </div>
  );
}
