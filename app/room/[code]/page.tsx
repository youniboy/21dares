'use client';

import { useEffect, useState, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getOrCreatePlayerId } from '@/lib/room-utils';
import Lobby from '@/components/game/Lobby';
import GameBoard from '@/components/game/GameBoard';
import EndGameButton from '@/components/game/EndGameButton';
import type { Room, GameState } from '@/types/game';

interface Props {
  params: Promise<{ code: string }>;
}

export default function RoomPage({ params }: Props) {
  const { code } = use(params);
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState('');
  const [myPlayerId] = useState(() => getOrCreatePlayerId());
  const [isAlone, setIsAlone] = useState(false);
  const [roomPassword, setRoomPassword] = useState('');
  const [roomNsfwPin, setRoomNsfwPin] = useState('');
  // Tracks intentional navigations so beforeunload doesn't double-fire cleanup
  const intentionalExitRef = useRef(false);

  const updateGameState = useCallback(
    async (updates: Partial<GameState>) => {
      if (!room) return;
      const newState: GameState = { ...room.game_state, ...updates };
      setRoom((prev) => prev ? { ...prev, game_state: newState } : prev);
      await fetch(`/api/rooms/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_state: newState }),
      });
    },
    [room, code]
  );

  // Read password/pin from URL params (set by CreateRoomModal after room creation)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRoomPassword(params.get('p') ?? '');
    setRoomNsfwPin(params.get('nsfw') ?? '');
  }, []);

  // Load room on mount
  useEffect(() => {
    async function loadRoom() {
      const res = await fetch(`/api/rooms/${code}`);
      if (!res.ok) {
        setError('Room not found. The code may be wrong or the game has ended.');
        return;
      }
      const data: Room = await res.json();
      setRoom(data);
    }
    loadRoom();
  }, [code]);

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`room:${code}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `code=eq.${code}` },
        (payload) => { setRoom(payload.new as Room); }
      )
      // Room deleted — redirect everyone home
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'rooms', filter: `code=eq.${code}` },
        () => { router.push('/?ended=1'); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [code, router]);

  // Tab close / crash — fire-and-forget cleanup via sendBeacon
  useEffect(() => {
    function handleBeforeUnload() {
      if (intentionalExitRef.current) return;
      const blob = new Blob(
        [JSON.stringify({ playerId: myPlayerId })],
        { type: 'application/json' }
      );
      navigator.sendBeacon(`/api/rooms/${code}/leave`, blob);
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [code, myPlayerId]);

  // Detect if I was removed from the players list
  useEffect(() => {
    if (!room) return;
    const gs = room.game_state;
    const stillInRoom = gs.players.some((p) => p.id === myPlayerId);
    if (!stillInRoom) {
      intentionalExitRef.current = true;
      router.push('/?kicked=1');
      return;
    }
    // Detect when I'm the last player left mid-game (others left or were kicked)
    if (gs.status === 'playing' && gs.players.length === 1) {
      setIsAlone(true);
      const t = setTimeout(() => { deleteRoom(); }, 3000);
      return () => clearTimeout(t);
    }
  }, [room, myPlayerId, router]);

  function handleStartGame() {
    if (!room) return;
    updateGameState({ status: 'playing', phase: 'rules' });
  }

  async function deleteRoom() {
    intentionalExitRef.current = true;
    await fetch(`/api/rooms/${code}`, { method: 'DELETE' });
    router.push('/');
  }

  async function removeMe(gs: GameState) {
    const updatedPlayers = gs.players.filter((p) => p.id !== myPlayerId);
    intentionalExitRef.current = true;
    if (updatedPlayers.length === 0) {
      await fetch(`/api/rooms/${code}`, { method: 'DELETE' });
    } else {
      await fetch(`/api/rooms/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_state: {
            ...gs,
            players: updatedPlayers,
            endVotes: [],
            countingPlayerIndex: Math.min(gs.countingPlayerIndex, updatedPlayers.length - 1),
            loserPlayerIndex:
              gs.loserPlayerIndex !== null && gs.loserPlayerIndex >= updatedPlayers.length
                ? updatedPlayers.length - 1
                : gs.loserPlayerIndex,
          },
        }),
      });
    }
    router.push('/');
  }

  async function handleVoteToEnd() {
    if (!room) return;
    const gs = room.game_state;
    const myPlayer = gs.players.find((p) => p.id === myPlayerId);
    const isHost = myPlayer?.isHost ?? false;

    // Host alone — delete room regardless of game status
    if (isHost && gs.players.length === 1) {
      await deleteRoom();
      return;
    }

    // Host with others still in — just remove host, game continues
    if (isHost) {
      await removeMe(gs);
      return;
    }

    // Non-host: vote to end
    const endVotes = gs.endVotes ?? [];
    if (endVotes.includes(myPlayerId)) return;

    const newVotes = [...endVotes, myPlayerId];
    const allVoted = newVotes.length >= gs.players.length;

    if (allVoted) {
      await deleteRoom();
    } else {
      await removeMe(gs);
    }
  }

  if (isAlone) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center z-50 px-6 text-center" style={{ background: '#0d0d14' }}>
        <div className="flex flex-col items-center gap-6">
          <div className="text-7xl animate-bounce">👋</div>
          <div>
            <p className="text-white font-black text-2xl">Everyone left the party</p>
            <p className="text-white/40 text-sm mt-2">Heading back home...</p>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: '#7C3AED', animationDelay: `${i * 0.25}s` }}
              />
            ))}
          </div>
          <button
            onClick={deleteRoom}
            className="mt-2 px-6 py-3 rounded-2xl font-semibold text-white/60 text-sm border border-white/10 transition-all active:scale-95"
            style={{ background: '#1a1a24' }}
          >
            Go home now
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-svh items-center justify-center px-4 text-center gap-4">
        <div className="text-4xl">😕</div>
        <p className="text-white font-bold text-lg">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 rounded-2xl font-semibold text-white border border-white/15"
          style={{ background: '#1a1a24' }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col min-h-svh items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#7C3AED', borderTopColor: 'transparent' }} />
        <p className="text-white/40 text-sm">Joining room...</p>
      </div>
    );
  }

  const { game_state } = room;
  const isInGame = game_state.status === 'playing';

  return (
    <div className="relative">
      {/* Persistent End Game button — shown during active game */}
      {isInGame && (
        <div className="fixed top-4 right-4 z-40">
          <EndGameButton
            players={game_state.players}
            endVotes={game_state.endVotes || []}
            myPlayerId={myPlayerId}
            onVote={handleVoteToEnd}
          />
        </div>
      )}

      {game_state.status === 'lobby' && (
        <Lobby
          gameState={game_state}
          myPlayerId={myPlayerId}
          roomPassword={roomPassword}
          roomNsfwPin={roomNsfwPin}
          roomCode={code}
          onStartGame={handleStartGame}
          onLeave={handleVoteToEnd}
        />
      )}

      {game_state.status === 'playing' && (
        <GameBoard
          gameState={game_state}
          myPlayerId={myPlayerId}
          onUpdateGameState={updateGameState}
        />
      )}

      {game_state.status === 'ended' && (
        <div className="flex flex-col min-h-svh items-center justify-center px-4 text-center gap-6">
          <div className="text-5xl">🎉</div>
          <div>
            <h1 className="text-3xl font-black text-white">Game Over</h1>
            <p className="text-white/50 mt-2">Good times were had.</p>
          </div>
          <button
            onClick={() => { intentionalExitRef.current = true; router.push('/'); }}
            className="px-6 py-3 rounded-2xl font-bold text-white border border-white/15 transition-all active:scale-95"
            style={{ background: '#1a1a24' }}
          >
            Leave
          </button>
        </div>
      )}
    </div>
  );
}
