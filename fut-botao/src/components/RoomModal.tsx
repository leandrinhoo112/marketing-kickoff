'use client';
import React, { useState } from 'react';

type RoomStep = 'menu' | 'creating' | 'waiting' | 'join';

interface RoomModalProps {
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onBack: () => void;
  roomCode?: string;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'disconnected';
  opponentJoined: boolean;
  isHost: boolean;
  error?: string;
}

export default function RoomModal({
  onCreateRoom,
  onJoinRoom,
  onBack,
  roomCode,
  connectionStatus,
  opponentJoined,
  isHost,
  error,
}: RoomModalProps) {
  const [step, setStep] = useState<RoomStep>('menu');
  const [joinCode, setJoinCode] = useState('');

  const handleCreate = () => {
    setStep('creating');
    onCreateRoom();
  };

  // Advance to 'waiting' once we have a room code
  React.useEffect(() => {
    if (roomCode && step === 'creating') setStep('waiting');
  }, [roomCode, step]);

  const handleJoinSubmit = () => {
    if (joinCode.trim().length === 6) {
      onJoinRoom(joinCode.trim().toUpperCase());
    }
  };

  const copyCode = () => {
    if (roomCode) navigator.clipboard.writeText(roomCode).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🌐</div>
            <h2 className="text-2xl font-black text-white">Jogo Online</h2>
            <p className="text-white/50 text-sm mt-1">Conecte-se com um amigo em tempo real</p>
          </div>

          {/* ── MENU ─────────────────────────────────────────────── */}
          {step === 'menu' && (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCreate}
                className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-2xl transition-all hover:scale-[1.02] flex items-center gap-4"
              >
                <span className="text-2xl">🏠</span>
                <div className="text-left">
                  <div className="font-black">Criar Sala</div>
                  <div className="text-xs opacity-75">Gere um código e convide um amigo</div>
                </div>
              </button>

              <button
                onClick={() => setStep('join')}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-2xl transition-all hover:scale-[1.02] flex items-center gap-4"
              >
                <span className="text-2xl">🚪</span>
                <div className="text-left">
                  <div className="font-black">Entrar em Sala</div>
                  <div className="text-xs opacity-75">Digite o código de uma sala existente</div>
                </div>
              </button>

              <button onClick={onBack} className="w-full py-3 text-white/50 hover:text-white transition-colors text-sm">
                ← Voltar ao Menu
              </button>
            </div>
          )}

          {/* ── CREATING (spinner) ───────────────────────────────── */}
          {step === 'creating' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/70">Criando sala...</p>
            </div>
          )}

          {/* ── WAITING FOR OPPONENT ─────────────────────────────── */}
          {step === 'waiting' && roomCode && (
            <div className="flex flex-col items-center gap-5">
              {/* Connection indicator */}
              <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full border ${
                connectionStatus === 'connected'
                  ? 'border-green-500/40 bg-green-500/10 text-green-400'
                  : connectionStatus === 'connecting'
                    ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400'
                    : 'border-red-500/40 bg-red-500/10 text-red-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                  connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                  'bg-red-400'
                }`} />
                {connectionStatus === 'connected' ? 'Conectado ao servidor' :
                 connectionStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
              </div>

              <p className="text-white/70 text-sm text-center">Compartilhe o código com seu amigo:</p>

              {/* Room code */}
              <button
                onClick={copyCode}
                title="Clique para copiar"
                className="bg-gray-800 border-2 border-green-500/50 hover:border-green-400 rounded-2xl px-8 py-4 transition-all hover:scale-105 group"
              >
                <span className="text-4xl font-black text-green-400 tracking-[0.3em]">{roomCode}</span>
                <div className="text-white/30 text-xs mt-1 group-hover:text-white/60 transition-colors">📋 Clique para copiar</div>
              </button>

              {/* Status */}
              {!opponentJoined ? (
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  <p className="text-yellow-400 text-sm font-medium">Aguardando adversário...</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-400">
                  <span className="text-xl">✅</span>
                  <p className="font-bold">Adversário entrou! Escolha seu time...</p>
                </div>
              )}

              <button onClick={onBack} className="text-white/30 hover:text-white/60 text-xs transition-colors">
                ← Cancelar
              </button>
            </div>
          )}

          {/* ── JOIN ─────────────────────────────────────────────── */}
          {step === 'join' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-white/70 text-sm font-bold block mb-2">Código da Sala</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                  onKeyDown={e => e.key === 'Enter' && handleJoinSubmit()}
                  placeholder="EX: AB12CD"
                  autoFocus
                  className="w-full bg-gray-800 border-2 border-white/20 focus:border-cyan-400 rounded-xl px-4 py-3 text-white text-2xl font-black tracking-[0.3em] text-center outline-none transition-colors"
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button
                onClick={handleJoinSubmit}
                disabled={joinCode.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all hover:scale-[1.02]"
              >
                {joinCode.length === 6 ? 'Entrar na Sala →' : `Faltam ${6 - joinCode.length} dígitos`}
              </button>

              <button onClick={() => setStep('menu')} className="text-white/40 hover:text-white text-sm transition-colors text-center">
                ← Voltar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
