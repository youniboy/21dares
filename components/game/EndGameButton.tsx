'use client';

import { useState } from 'react';
import type { Player } from '@/types/game';

interface Props {
  players: Player[];
  endVotes: string[];
  myPlayerId: string;
  onVote: () => void;
}

export default function EndGameButton({ players, endVotes, myPlayerId, onVote }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const hasVoted = endVotes.includes(myPlayerId);
  const voteCount = endVotes.length;
  const total = players.length;

  // Show a small badge if others have voted
  const othersVoted = endVotes.filter((id) => id !== myPlayerId).length;

  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
        <div
          className="relative w-full max-w-sm rounded-3xl p-6 border border-white/10"
          style={{ background: '#1a1a24' }}
        >
          <h2 className="text-white font-bold text-xl mb-2">End the game?</h2>

          {total > 1 ? (
            <p className="text-white/50 text-sm mb-4">
              If you&apos;re the only one voting, <span className="text-white">you&apos;ll be removed from the room</span> and the others continue.
              If everyone votes, the room is permanently closed.
            </p>
          ) : (
            <p className="text-white/50 text-sm mb-4">
              You&apos;re the only player. This will close the room.
            </p>
          )}

          {voteCount > 0 && (
            <div
              className="px-3 py-2 rounded-xl text-sm text-white/70 mb-4 border border-white/8"
              style={{ background: '#252532' }}
            >
              {voteCount}/{total} player{voteCount !== 1 ? 's' : ''} want{voteCount === 1 ? 's' : ''} to end
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 py-3 rounded-2xl font-semibold text-white/60 border border-white/10 transition-all"
              style={{ background: '#252532' }}
            >
              Cancel
            </button>
            <button
              onClick={() => { setShowConfirm(false); onVote(); }}
              className="flex-1 py-3 rounded-2xl font-bold text-white transition-all active:scale-95"
              style={{ background: '#EF4444' }}
            >
              {total === 1 ? 'Close Room' : 'Vote to End'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 border"
      style={{
        background: hasVoted ? '#EF444420' : 'rgba(255,255,255,0.05)',
        borderColor: hasVoted ? '#EF444450' : 'rgba(255,255,255,0.08)',
        color: hasVoted ? '#EF4444' : 'rgba(255,255,255,0.4)',
      }}
    >
      <span>⏻</span>
      <span>End</span>
      {othersVoted > 0 && (
        <span
          className="w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-bold"
          style={{ background: '#EF4444' }}
        >
          {othersVoted}
        </span>
      )}
    </button>
  );
}
