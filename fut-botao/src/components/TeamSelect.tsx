'use client';
import React, { useState, useEffect } from 'react';
import { TEAMS, Team } from '@/data/teams';
import { preloadAnthem, playTeamAnthem, stopAnthem } from '@/game/sounds';

interface TeamSelectProps {
  mode: 'online' | 'local' | 'ai';
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  onSelect: (teamA: Team, teamB: Team) => void;
  onBack: () => void;
}

export default function TeamSelect({ mode, aiDifficulty, onSelect, onBack }: TeamSelectProps) {
  const [teamA, setTeamA] = useState<Team | null>(null);
  const [teamB, setTeamB] = useState<Team | null>(null);
  const [selecting, setSelecting] = useState<'A' | 'B'>('A');

  // Pre-load all anthems as soon as this screen mounts
  useEffect(() => {
    TEAMS.forEach(t => preloadAnthem(t.id));
    return () => stopAnthem();
  }, []);

  const handleTeamClick = (team: Team) => {
    // Play a short preview of the team's anthem
    playTeamAnthem(team.id, 0.7);

    if (mode === 'online') {
      onSelect(team, team);
      return;
    }

    if (selecting === 'A') {
      setTeamA(team);
      if (mode === 'local') {
        setSelecting('B');
      } else {
        // AI: auto-pick a random opponent
        const others = TEAMS.filter(t => t.id !== team.id);
        const randB = others[Math.floor(Math.random() * others.length)];
        onSelect(team, randB);
      }
    } else {
      setTeamB(team);
      if (teamA) onSelect(teamA, team);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-green-950 to-gray-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <button onClick={onBack} className="absolute top-4 left-4 text-white/50 hover:text-white transition-colors text-sm flex items-center gap-1">
            ← Voltar
          </button>
          <h1 className="text-3xl font-black text-white mb-2">⚽ Futebol de Botão</h1>
          {mode === 'local' && (
            <p className="text-green-400 font-bold">
              {selecting === 'A' ? '🔵 Jogador 1, escolha seu time' : '🔴 Jogador 2, escolha seu time'}
            </p>
          )}
          {mode === 'ai' && (
            <p className="text-green-400 font-bold">Escolha seu time — IA no nível <span className="capitalize">{aiDifficulty}</span></p>
          )}
          {mode === 'online' && (
            <p className="text-blue-400 font-bold">🌐 Escolha <u>seu</u> time — o adversário escolherá o dele</p>
          )}
        </div>

        {/* Selected teams preview */}
        {(teamA || teamB) && (
          <div className="flex justify-center gap-4 mb-6">
            <div className={`flex flex-col items-center px-4 py-2 rounded-xl border ${teamA ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-white/10 bg-white/5'}`}>
              {teamA ? (
                <>
                  <img src={teamA.logoUrl} alt={teamA.name} className="w-12 h-12 object-contain" />
                  <span className="text-cyan-400 text-xs font-bold mt-1">{teamA.shortName}</span>
                </>
              ) : (
                <span className="text-white/30 text-xs">Time 1</span>
              )}
            </div>
            <div className="flex items-center text-white/50 font-bold">VS</div>
            <div className={`flex flex-col items-center px-4 py-2 rounded-xl border ${teamB ? 'border-orange-500/50 bg-orange-500/10' : 'border-white/10 bg-white/5'}`}>
              {teamB ? (
                <>
                  <img src={teamB.logoUrl} alt={teamB.name} className="w-12 h-12 object-contain" />
                  <span className="text-orange-400 text-xs font-bold mt-1">{teamB.shortName}</span>
                </>
              ) : (
                <span className="text-white/30 text-xs">Time 2</span>
              )}
            </div>
          </div>
        )}

        {/* Team grid */}
        <div className="grid grid-cols-3 gap-4">
          {TEAMS.map(team => {
            const isSelected = teamA?.id === team.id || teamB?.id === team.id;
            const isTeamA = teamA?.id === team.id;
            return (
              <button
                key={team.id}
                onClick={() => handleTeamClick(team)}
                disabled={isSelected && selecting === 'B' && teamA?.id === team.id && mode === 'local'}
                className={`
                  relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200
                  ${isSelected
                    ? isTeamA
                      ? 'border-cyan-400 bg-cyan-500/20 scale-105'
                      : 'border-orange-400 bg-orange-500/20 scale-105'
                    : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 hover:scale-102'
                  }
                  disabled:opacity-40 disabled:cursor-not-allowed
                `}
                style={{ borderColor: isSelected ? undefined : undefined }}
              >
                {isSelected && (
                  <span className={`absolute top-2 right-2 text-xs font-black ${isTeamA ? 'text-cyan-400' : 'text-orange-400'}`}>
                    {isTeamA ? 'J1' : 'J2'}
                  </span>
                )}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center p-1"
                  style={{ backgroundColor: team.primaryColor + '33', border: `3px solid ${team.primaryColor}` }}
                >
                  <img src={team.logoUrl} alt={team.name} className="w-12 h-12 object-contain rounded-full" />
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-sm leading-tight">{team.name}</p>
                  <p className="text-white/50 text-xs">{team.shortName}</p>
                </div>
                {/* Players preview */}
                <div className="flex flex-wrap gap-1 justify-center">
                  {team.players.map(p => (
                    <span
                      key={p.name}
                      className={`text-[9px] px-1 py-0.5 rounded ${p.isGoalkeeper ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/60'}`}
                    >
                      {p.shortName}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
