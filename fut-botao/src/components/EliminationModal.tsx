'use client';
import React from 'react';
import { Team } from '@/data/teams';
import { ButtonPiece } from '@/game/types';

interface EliminationModalProps {
  team: Team;
  buttons: ButtonPiece[];
  onEliminate: (buttonId: string) => void;
  isAutomatic?: boolean; // If AI or remote player is choosing, show a waiting state
}

export default function EliminationModal({
  team,
  buttons,
  onEliminate,
  isAutomatic = false,
}: EliminationModalProps) {
  // Only outfield players can be eliminated
  console.log("DEBUG: EliminationModal - team.id:", team.id, "buttons teamIds:", buttons.map(b => `${b.id}:${b.teamId}`));
  const options = buttons.filter((b) => b.teamId === team.id && !b.isGoalkeeper);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-900/95 rounded-3xl border border-white/10 p-8 max-w-md w-full mx-4 text-center shadow-2xl transform scale-100 transition-all duration-300">
        <div className="text-5xl mb-4 animate-pulse">💀</div>
        <h2 className="text-2xl font-black text-red-500 mb-2">ÚLTIMO BOTÃO!</h2>
        <p className="text-white/70 text-sm mb-6">
          O time <strong className="text-white">{team.name}</strong> marcou um gol! Escolha um jogador de linha para ser eliminado de campo (handicap).
        </p>

        {isAutomatic ? (
          <div className="flex flex-col items-center justify-center p-6 gap-3">
            <div className="w-8 h-8 border-4 border-t-transparent border-red-500 rounded-full animate-spin"></div>
            <p className="text-white/50 text-xs">Aguardando decisão...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
            {options.map((player) => (
              <button
                key={player.id}
                onClick={() => onEliminate(player.id)}
                className="w-full py-3.5 px-5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/40 rounded-2xl flex items-center justify-between text-left transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: team.primaryColor + '22',
                      borderColor: team.primaryColor,
                      color: '#ffffff',
                    }}
                  >
                    👕
                  </div>
                  <div>
                    <div className="font-bold text-white group-hover:text-red-400 transition-colors">
                      {player.playerName}
                    </div>
                    <div className="text-white/40 text-xs">Jogador de linha</div>
                  </div>
                </div>
                <span className="text-red-500/60 group-hover:text-red-500 text-xs font-bold font-mono">
                  ELIMINAR
                </span>
              </button>
            ))}

            {options.length === 0 && (
              <p className="text-yellow-500 text-xs font-bold py-4">
                Apenas o goleiro restou no campo!
              </p>
            )}
          </div>
        )}

        <div className="mt-6 text-white/30 text-[10px] uppercase tracking-wider">
          A cada gol sofrido, um botão é banido para sempre.
        </div>
      </div>
    </div>
  );
}
