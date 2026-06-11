import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { generateRoomCode, assignPlayerColor } from '@/lib/room-utils';
import type { GameState, Player, GameMode } from '@/types/game';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function hashPassword(password: string): string {
  return createHash('sha256').update(password.trim()).digest('hex');
}

export async function POST(req: NextRequest) {
  const { playerName, playerId, password, mode, nsfwPin } = await req.json();
  const gameMode: GameMode = (['spicy', 'mix', 'nsfw'] as GameMode[]).includes(mode) ? mode : 'normal';

  if (gameMode === 'nsfw' && (!nsfwPin || !/^\d{6}$/.test(nsfwPin.trim()))) {
    return NextResponse.json({ error: 'NSFW mode requires a 6-digit numeric PIN.' }, { status: 400 });
  }

  if (!playerName || !playerId) {
    return NextResponse.json({ error: 'Missing playerName or playerId' }, { status: 400 });
  }

  let code: string;
  let attempts = 0;
  do {
    code = generateRoomCode();
    const { data } = await supabase.from('rooms').select('code').eq('code', code).single();
    if (!data) break;
    attempts++;
  } while (attempts < 5);

  const player: Player = {
    id: playerId,
    name: playerName.trim(),
    color: assignPlayerColor([]),
    isHost: true,
  };

  const nsfwPinHash = gameMode === 'nsfw' && nsfwPin ? hashPassword(nsfwPin.trim()) : null;

  const gameState: GameState = {
    status: 'lobby',
    players: [player],
    phase: 'counting',
    countingPlayerIndex: 0,
    count: 0,
    loserPlayerIndex: null,
    currentCard: null,
    round: 0,
    endVotes: [],
    mode: gameMode,
    nsfwPinHash,
  };

  const passwordHash = password ? hashPassword(password) : null;

  const { error } = await supabase.from('rooms').insert({
    code: code!,
    host_id: playerId,
    password_hash: passwordHash,
    game_state: gameState,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ code: code! });
}
