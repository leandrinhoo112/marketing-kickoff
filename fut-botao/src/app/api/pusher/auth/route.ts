// src/app/api/pusher/auth/route.ts
// Authenticates private Pusher channels so only valid clients can join rooms
import { NextRequest, NextResponse } from 'next/server';
import pusherServer from '@/lib/pusherServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const socketId = body.get('socket_id') as string;
    const channelName = body.get('channel_name') as string;

    if (!socketId || !channelName) {
      return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 });
    }

    // Allow any private-room-* channel — in production you'd verify the user owns the room
    if (!channelName.startsWith('private-room-')) {
      return NextResponse.json({ error: 'Unauthorized channel' }, { status: 403 });
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
  } catch (err) {
    console.error('Pusher auth error:', err);
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}
