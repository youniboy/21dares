import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { GameState } from '@/types/game';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Params = { params: Promise<{ code: string }> };

// Called via sendBeacon on tab close — removes the player and cleans up if empty
export async function POST(req: NextRequest, { params }: Params) {
  const { code } = await params;
  const { playerId } = await req.json();

  if (!playerId) return NextResponse.json({ ok: true });

  const { data: room } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (!room) return NextResponse.json({ ok: true }); // already gone

  const gs: GameState = room.game_state;
  const leavingPlayer = gs.players.find((p) => p.id === playerId);
  const updatedPlayers = gs.players.filter((p) => p.id !== playerId);
  const isHost = leavingPlayer?.isHost ?? false;

  // Delete if host is alone (regardless of game status) or last player leaving
  const shouldDelete = (isHost && gs.players.length === 1) || updatedPlayers.length === 0;

  if (shouldDelete) {
    await supabase.from('rooms').delete().eq('code', code.toUpperCase());
    return NextResponse.json({ ok: true });
  } else {
    const newCountingIndex = Math.min(gs.countingPlayerIndex, updatedPlayers.length - 1);
    const newLoserIndex =
      gs.loserPlayerIndex !== null && gs.loserPlayerIndex >= updatedPlayers.length
        ? null
        : gs.loserPlayerIndex;

    await supabase
      .from('rooms')
      .update({
        game_state: {
          ...gs,
          players: updatedPlayers,
          countingPlayerIndex: newCountingIndex,
          loserPlayerIndex: newLoserIndex,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('code', code.toUpperCase());
  }

  return NextResponse.json({ ok: true });
}
