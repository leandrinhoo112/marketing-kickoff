// src/app/api/game/action/route.ts
// Receives game actions from clients and broadcasts them to the room channel via Pusher
import { NextRequest, NextResponse } from 'next/server';
import pusherServer from '@/lib/pusherServer';

export interface GameAction {
  roomCode: string;
  type: string;
  payload: Record<string, unknown>;
  senderSocketId?: string; // exclude sender from broadcast when possible
}

export async function POST(request: NextRequest) {
  try {
    const { roomCode, type, payload, senderSocketId } = (await request.json()) as GameAction;

    if (!roomCode || !type) {
      return NextResponse.json({ error: 'Missing roomCode or type' }, { status: 400 });
    }

    const channel = `private-room-${roomCode}`;

    // Trigger the event on the channel. 
    // If senderSocketId is provided, Pusher will exclude that socket (so sender doesn't receive own event).
    if (senderSocketId) {
      await pusherServer.trigger(channel, type, payload, { socket_id: senderSocketId });
    } else {
      await pusherServer.trigger(channel, type, payload);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Game action error:', err);
    return NextResponse.json({ error: 'Failed to broadcast action' }, { status: 500 });
  }
}
