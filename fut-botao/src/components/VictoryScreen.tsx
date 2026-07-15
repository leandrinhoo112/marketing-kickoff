'use client';
import React, { useEffect, useState } from 'react';
import { Team } from '@/data/teams';
import { playWhistle } from '@/game/sounds';

interface VictoryScreenProps {
  winner: 'A' | 'B' | 'draw';
  teamA: Team;
  teamB: Team;
  scoreA: number;
  scoreB: number;
  localSide: 'A' | 'B';
  onPlayAgain: () => void;
  onMenu: () => void;
  isLegendary?: boolean;
}

export default function VictoryScreen({ winner, teamA, teamB, scoreA, scoreB, localSide, onPlayAgain, onMenu, isLegendary = false }: VictoryScreenProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    playWhistle();
    setTimeout(() => playWhistle(), 300);
    setTimeout(() => playWhistle(), 600);
    setTimeout(() => setShow(true), 100);
  }, []);

  const winnerTeam = winner === 'A' ? teamA : winner === 'B' ? teamB : null;
  const isLocalWinner = winner === localSide;
  const isDraw = winner === 'draw';

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-gray-900/95 rounded-3xl border border-white/10 p-8 max-w-sm w-full mx-4 text-center transform transition-all duration-500 ${show ? 'scale-100' : 'scale-75'}`}>
        {/* Trophy/emoji */}
        <div className="text-7xl mb-4 animate-bounce">
          {isDraw ? '🤝' : isLocalWinner ? (isLegendary ? '👑' : '🏆') : '😢'}
        </div>

        {/* Result text */}
        <h2 className={`text-3xl font-black mb-2 ${
          isDraw ? 'text-yellow-400' : isLocalWinner ? (isLegendary ? 'text-yellow-400 animate-pulse' : 'text-green-400') : 'text-red-400'
        }`}>
          {isDraw ? 'Empate!' : isLocalWinner ? (isLegendary ? 'Lendário!' : 'Vitória!') : 'Derrota!'}
        </h2>

        {isLegendary && isLocalWinner && (
          <div className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 rounded-xl py-2 px-3 text-xs font-black uppercase tracking-wider mb-4 animate-pulse">
            🏅 Campeão com apenas o goleiro!
          </div>
        )}

        {winnerTeam && (
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={winnerTeam.logoUrl} alt={winnerTeam.name} className="w-10 h-10 object-contain" />
            <span className="text-white font-bold">{winnerTeam.name} venceu!</span>
          </div>
        )}

        {/* Score */}
        <div className="flex items-center justify-center gap-6 my-6 bg-gray-800/50 rounded-2xl py-4 px-6">
          <div className="flex flex-col items-center gap-1">
            <img src={teamA.logoUrl} alt={teamA.name} className="w-10 h-10 object-contain" />
            <span className="text-white/60 text-xs">{teamA.shortName}</span>
            <span className="text-4xl font-black text-white">{scoreA}</span>
          </div>
          <span className="text-white/30 text-2xl font-bold">×</span>
          <div className="flex flex-col items-center gap-1">
            <img src={teamB.logoUrl} alt={teamB.name} className="w-10 h-10 object-contain" />
            <span className="text-white/60 text-xs">{teamB.shortName}</span>
            <span className="text-4xl font-black text-white">{scoreB}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all hover:scale-[1.02]"
          >
            🔄 Jogar Novamente
          </button>
          <button
            onClick={onMenu}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white/70 hover:text-white font-bold rounded-xl transition-all"
          >
            🏠 Menu Principal
          </button>
        </div>
      </div>
    </div>
  );
}
