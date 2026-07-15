// src/hooks/useOnlineGame.ts
// Manages real-time multiplayer communication via Pusher private channels
//
// Protocol:
//  1. Host (A) creates room → subscribes → picks team → broadcasts 'host-ready'
//  2. Guest (B) enters code → subscribes → on sub success → broadcasts 'guest-joined'
//  3. Host receives 'guest-joined' → re-broadcasts 'host-ready' (so guest gets it)
//  4. Guest picks team → broadcasts 'guest-ready'
//  5. Both have each other's team → game starts
//  6. During game: each player broadcasts 'launch' when they move a button
//  7. Opponent receives 'launch', applies it to local state (physics is deterministic)

import { useEffect, useRef, useCallback } from 'react';
import Pusher, { Channel } from 'pusher-js';

// ── Types ─────────────────────────────────────────────────────────────────

export interface OnlineCallbacks {
  onOpponentReady: (teamId: string) => void;     // opponent selected their team
  onGuestJoined: () => void;                      // guest joined the room (host gets this)
  onOpponentLaunch: (buttonId: string, vx: number, vy: number) => void;
  onConnectionChange: (status: 'connecting' | 'connected' | 'disconnected') => void;
  onOpponentEliminate?: (buttonId: string) => void; // opponent eliminated a player
}

// ── Helper: broadcast via server ──────────────────────────────────────────

async function broadcast(
  roomCode: string,
  type: string,
  payload: Record<string, unknown>,
  socketId?: string
) {
  try {
    await fetch('/api/game/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode, type, payload, senderSocketId: socketId }),
    });
  } catch (e) {
    console.error('Broadcast failed:', type, e);
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useOnlineGame(
  roomCode: string | undefined,
  playerSide: 'A' | 'B',
  callbacks: OnlineCallbacks
) {
  const pusherRef  = useRef<Pusher | null>(null);
  const channelRef = useRef<Channel | null>(null);
  const socketIdRef = useRef<string | undefined>(undefined);
  const callbacksRef = useRef(callbacks);
  const myTeamRef = useRef<string | null>(null);

  // Keep callbacks ref current so event handlers don't stale-close
  useEffect(() => { callbacksRef.current = callbacks; }, [callbacks]);

  // ── Subscribe to Pusher channel ──────────────────────────────────────────
  useEffect(() => {
    if (!roomCode) return;
    const key   = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster) {
      console.warn('Pusher env vars not set — online mode disabled');
      return;
    }

    callbacksRef.current.onConnectionChange('connecting');

    const pusher = new Pusher(key, {
      cluster,
      authEndpoint: '/api/pusher/auth',
    });
    pusherRef.current = pusher;

    pusher.connection.bind('connected', () => {
      socketIdRef.current = pusher.connection.socket_id;
      callbacksRef.current.onConnectionChange('connected');
    });
    pusher.connection.bind('disconnected', () => {
      callbacksRef.current.onConnectionChange('disconnected');
    });

    const channel = pusher.subscribe(`private-room-${roomCode}`);
    channelRef.current = channel;

    // ── Event: opponent's team announced ────────────────────────────────────
    channel.bind('host-ready', ({ teamId, side }: { teamId: string; side: 'A' | 'B' }) => {
      if (side !== playerSide) {
        callbacksRef.current.onOpponentReady(teamId);
      }
    });

    channel.bind('guest-ready', ({ teamId, side }: { teamId: string; side: 'A' | 'B' }) => {
      if (side !== playerSide) {
        callbacksRef.current.onOpponentReady(teamId);
      }
    });

    // ── Event: guest joined — host re-announces their team so guest gets it ─
    channel.bind('guest-joined', ({ side }: { side: 'A' | 'B' }) => {
      if (side !== playerSide) {
        callbacksRef.current.onGuestJoined();
        // If host already picked a team, re-announce it
        if (playerSide === 'A' && myTeamRef.current) {
          broadcast(roomCode, 'host-ready', { teamId: myTeamRef.current, side: 'A' }, socketIdRef.current);
        }
      }
    });

    // ── Event: button launched ────────────────────────────────────────────
    channel.bind('launch', ({ buttonId, vx, vy, side }: { buttonId: string; vx: number; vy: number; side: 'A' | 'B' }) => {
      if (side !== playerSide) {
        callbacksRef.current.onOpponentLaunch(buttonId, vx, vy);
      }
    });

    // ── Event: player eliminated ──────────────────────────────────────────
    channel.bind('eliminate-player', ({ buttonId, side }: { buttonId: string; side: 'A' | 'B' }) => {
      if (side !== playerSide) {
        callbacksRef.current.onOpponentEliminate?.(buttonId);
      }
    });

    // ── Guest announces presence on successful subscription ───────────────
    channel.bind('pusher:subscription_succeeded', () => {
      if (playerSide === 'B') {
        broadcast(roomCode, 'guest-joined', { side: 'B' }, socketIdRef.current);
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`private-room-${roomCode}`);
      pusher.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, playerSide]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const announceTeam = useCallback(async (teamId: string) => {
    if (!roomCode) return;
    myTeamRef.current = teamId;
    const eventName = playerSide === 'A' ? 'host-ready' : 'guest-ready';
    await broadcast(roomCode, eventName, { teamId, side: playerSide }, socketIdRef.current);
  }, [roomCode, playerSide]);

  const broadcastLaunch = useCallback(async (buttonId: string, vx: number, vy: number) => {
    if (!roomCode) return;
    await broadcast(roomCode, 'launch', { buttonId, vx, vy, side: playerSide }, socketIdRef.current);
  }, [roomCode, playerSide]);

  const broadcastElimination = useCallback(async (buttonId: string) => {
    if (!roomCode) return;
    await broadcast(roomCode, 'eliminate-player', { buttonId, side: playerSide }, socketIdRef.current);
  }, [roomCode, playerSide]);

  return { announceTeam, broadcastLaunch, broadcastElimination };
}
