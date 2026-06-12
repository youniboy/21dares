'use client';

import { useEffect, useState, useCallback } from 'react';
import type { GameState, Player } from '@/types/game';

const TURN_LIMIT = 15; // seconds per turn

interface Props {
  gameState: GameState;
  myPlayerId: string;
  onAdvance: (by: 1 | 2 | 3) => void;
}

export default function CountingGame({ gameState, myPlayerId, onAdvance }: Props) {
  const { players, count, countingPlayerIndex, round, turnStartedAt } = gameState;
  const currentPlayer = players[countingPlayerIndex];
  const isMyTurn = currentPlayer?.id === myPlayerId;
  const [bounceKey, setBounceKey] = useState(count);
  const [secondsLeft, setSecondsLeft] = useState(TURN_LIMIT);

  useEffect(() => {
    setBounceKey(count);
  }, [count]);

  const handleAutoAdvance = useCallback(() => {
    if (!isMyTurn) return;
    // Pick a random valid number (1-3 that doesn't exceed 21... but hitting 21 is the point)
    const valid: (1 | 2 | 3)[] = ([1, 2, 3] as const).filter((n) => count + n <= 21);
    if (valid.length === 0) return;
    const pick = valid[Math.floor(Math.random() * valid.length)];
    onAdvance(pick);
  }, [isMyTurn, count, onAdvance]);

  useEffect(() => {
    if (!turnStartedAt) return;
    const startedAt = new Date(turnStartedAt).getTime();

    function tick() {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, TURN_LIMIT - elapsed);
      setSecondsLeft(remaining);
      if (remaining === 0 && isMyTurn) {
        handleAutoAdvance();
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [turnStartedAt, isMyTurn, handleAutoAdvance]);

  const options: (1 | 2 | 3)[] = [1, 2, 3];
  const timerPct = (secondsLeft / TURN_LIMIT) * 100;
  const timerColor = secondsLeft <= 5 ? '#EF4444' : secondsLeft <= 8 ? '#F59E0B' : '#7C3AED';

  function wouldHit21(by: number) {
    return count + by === 21;
  }

  return (
    <div className="flex flex-col min-h-svh px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1">
          Round {round + 1}
        </p>
        <h1 className="text-2xl font-black text-white">Count to 21</h1>
        <p className="text-white/40 text-sm mt-1">Whoever lands on 21 loses the round</p>
      </div>

      {/* Current count display */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="relative flex items-center justify-center">
          <div
            className="w-40 h-40 rounded-full flex items-center justify-center border-4"
            style={{
              background: '#1a1a24',
              borderColor: count === 0 ? '#252532' : currentPlayer?.color || '#7C3AED',
              boxShadow: count > 0 ? `0 0 40px ${currentPlayer?.color || '#7C3AED'}44` : 'none',
            }}
          >
            <span
              key={bounceKey}
              className="count-bounce text-7xl font-black text-white"
            >
              {count}
            </span>
          </div>
          <div className="absolute -bottom-6 text-xs text-white/30">
            of 21
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#252532' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(count / 21) * 100}%`,
                background: count >= 18 ? '#EF4444' : count >= 12 ? '#F59E0B' : '#7C3AED',
              }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-white/20">
            <span>0</span>
            <span className="text-white/40 font-semibold">21</span>
          </div>
        </div>

        {/* Whose turn */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/10"
          style={{ background: '#1a1a24' }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: currentPlayer?.color || '#7C3AED' }}
          >
            {currentPlayer?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-xs text-white/40">
              {isMyTurn ? "It's your turn!" : `Waiting for...`}
            </p>
            <p className="font-bold text-white text-sm">
              {isMyTurn ? 'You' : currentPlayer?.name}
            </p>
          </div>
          {isMyTurn && (
            <div
              className="ml-auto w-2 h-2 rounded-full animate-pulse"
              style={{ background: currentPlayer?.color || '#7C3AED' }}
            />
          )}
        </div>

        {/* Turn timer */}
        {turnStartedAt && (
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs mb-1" style={{ color: timerColor }}>
              <span className={secondsLeft <= 5 ? 'animate-pulse font-bold' : ''}>
                {isMyTurn ? (secondsLeft <= 5 ? '⏰ Pick now!' : 'Your time') : `${currentPlayer?.name}'s time`}
              </span>
              <span className="font-bold">{secondsLeft}s</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#252532' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${timerPct}%`, background: timerColor, boxShadow: secondsLeft <= 5 ? `0 0 6px ${timerColor}` : 'none' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="pb-4">
        {isMyTurn ? (
          <div className="space-y-3">
            <p className="text-center text-sm text-white/50 mb-2">
              Say how many numbers you want to claim:
            </p>
            <div className="flex gap-3">
              {options.map((n) => {
                const lands = count + n;
                const isDanger = wouldHit21(n);
                const isOver = lands > 21;
                return (
                  <button
                    key={n}
                    onClick={() => !isOver && onAdvance(n)}
                    disabled={isOver}
                    className="flex-1 flex flex-col items-center py-4 rounded-2xl font-bold text-white transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed border"
                    style={{
                      background: isDanger ? '#EF444433' : '#1a1a24',
                      borderColor: isDanger ? '#EF4444' : '#ffffff15',
                    }}
                  >
                    <span className="text-2xl font-black">{n}</span>
                    <span className="text-xs mt-1" style={{ color: isDanger ? '#EF4444' : 'rgba(255,255,255,0.4)' }}>
                      {isDanger ? '😬 21!' : `→ ${lands}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-white/40 text-sm">
              Wait for <span className="text-white font-semibold">{currentPlayer?.name}</span> to count...
            </p>
          </div>
        )}

        {/* Player order */}
        <div className="mt-6 flex justify-center gap-2 flex-wrap">
          {players.map((p: Player, i: number) => (
            <div
              key={p.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
              style={{
                background: i === countingPlayerIndex ? `${p.color}22` : '#1a1a24',
                border: `1px solid ${i === countingPlayerIndex ? p.color : 'rgba(255,255,255,0.08)'}`,
                color: i === countingPlayerIndex ? p.color : 'rgba(255,255,255,0.4)',
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: p.color }}
              />
              {p.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
