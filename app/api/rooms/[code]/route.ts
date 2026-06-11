import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { assignPlayerColor } from '@/lib/room-utils';
import type { Player, GameState } from '@/types/game';

function hashPassword(password: string): string {
  return createHash('sha256').update(password.trim()).digest('hex');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Params = { params: Promise<{ code: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { code } = await params;
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }
  return NextResponse.json(data);
}

// Join room
export async function POST(req: NextRequest, { params }: Params) {
  const { code } = await params;
  const { playerName, playerId, password, nsfwPin } = await req.json();

  if (!playerName || !playerId) {
    return NextResponse.json({ error: 'Missing playerName or playerId' }, { status: 400 });
  }

  const { data: room, error: fetchError } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (fetchError || !room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  // Password check (skip for reconnecting players — checked below)
  if (room.password_hash) {
    if (!password) {
      return NextResponse.json({ error: 'This room is password protected.', requiresPassword: true }, { status: 403 });
    }
    if (hashPassword(password) !== room.password_hash) {
      return NextResponse.json({ error: 'Wrong password.', requiresPassword: true }, { status: 403 });
    }
  }

  const gameState: GameState = room.game_state;

  // NSFW PIN check
  if (gameState.nsfwPinHash) {
    if (!nsfwPin) {
      return NextResponse.json({ error: 'This room requires the NSFW PIN.', requiresNsfwPin: true }, { status: 403 });
    }
    if (hashPassword(nsfwPin) !== gameState.nsfwPinHash) {
      return NextResponse.json({ error: 'Wrong NSFW PIN.', requiresNsfwPin: true }, { status: 403 });
    }
  }

  if (gameState.status === 'ended') {
    return NextResponse.json({ error: 'This game has ended.' }, { status: 400 });
  }

  // Check if player is already in the room (reconnection — skip password for them)
  const existing = gameState.players.find((p: Player) => p.id === playerId);
  if (existing) {
    return NextResponse.json({ code: room.code });
  }

  if (gameState.status === 'playing') {
    return NextResponse.json({ error: 'Game already in progress.' }, { status: 400 });
  }

  const existingColors = gameState.players.map((p: Player) => p.color);
  const newPlayer: Player = {
    id: playerId,
    name: playerName.trim(),
    color: assignPlayerColor(existingColors),
    isHost: false,
  };

  const updatedState: GameState = {
    ...gameState,
    players: [...gameState.players, newPlayer],
  };

  const { error: updateError } = await supabase
    .from('rooms')
    .update({ game_state: updatedState, updated_at: new Date().toISOString() })
    .eq('code', code.toUpperCase());

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ code: room.code });
}

// Delete room
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { code } = await params;
  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('code', code.toUpperCase());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

// Update game state
export async function PATCH(req: NextRequest, { params }: Params) {
  const { code } = await params;
  const { game_state } = await req.json();

  const { error } = await supabase
    .from('rooms')
    .update({ game_state, updated_at: new Date().toISOString() })
    .eq('code', code.toUpperCase());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
