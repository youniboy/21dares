'use client';

import { useEffect, useState, useCallback } from 'react';
import type { CardType, Player } from '@/types/game';

const SELECTION_LIMIT = 15; // seconds to pick a card type

interface Props {
  loser: Player;
  myPlayerId: string;
  cardSelectionStartedAt?: string | null;
  onSelect: (type: CardType) => void;
}

const CARD_OPTIONS: { type: CardType; label: string; icon: string; color: string; desc: string }[] = [
  {
    type: 'truth',
    label: 'Truth',
    icon: '🤔',
    color: '#7C3AED',
    desc: 'Answer honestly or face consequences.',
  },
  {
    type: 'dare',
    label: 'Dare',
    icon: '🔥',
    color: '#DC2626',
    desc: 'Do the dare or back down.',
  },
  {
    type: 'double-dare',
    label: 'Double Dare',
    icon: '⚡',
    color: '#D97706',
    desc: 'Two dares. Do one, both, or neither — choose wisely.',
  },
  {
    type: 'situation',
    label: 'Situation',
    icon: '🎭',
    color: '#059669',
    desc: "You're in a scenario. Tell the group how you'd handle it.",
  },
  {
    type: 'burning-house',
    label: 'Burning House',
    icon: '🏠',
    color: '#BE185D',
    desc: 'Name 3 people and assign them to 3 options.',
  },
];

export default function CardSelector({ loser, myPlayerId, cardSelectionStartedAt, onSelect }: Props) {
  const isLoser = loser.id === myPlayerId;
  const lastType = loser.lastCardType ?? null;
  const [secondsLeft, setSecondsLeft] = useState(SELECTION_LIMIT);

  const handleAutoSelect = useCallback(() => {
    if (!isLoser) return;
    const available = CARD_OPTIONS.filter((o) => o.type !== lastType);
    const pool = available.length > 0 ? available : CARD_OPTIONS;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    onSelect(pick.type);
  }, [isLoser, lastType, onSelect]);

  useEffect(() => {
    if (!cardSelectionStartedAt) return;
    const startedAt = new Date(cardSelectionStartedAt).getTime();

    function tick() {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, SELECTION_LIMIT - elapsed);
      setSecondsLeft(remaining);
      if (remaining === 0 && isLoser) {
        handleAutoSelect();
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [cardSelectionStartedAt, isLoser, handleAutoSelect]);

  const timerPct = (secondsLeft / SELECTION_LIMIT) * 100;
  const timerColor = secondsLeft <= 5 ? '#EF4444' : secondsLeft <= 8 ? '#F59E0B' : '#A855F7';

  return (
    <div className="flex flex-col min-h-svh px-4 py-8">
      {/* Loser banner */}
      <div className="rounded-2xl p-4 mb-4 text-center border border-red-500/20" style={{ background: '#EF444415' }}>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-2"
          style={{ background: loser.color }}
        >
          {loser.name[0].toUpperCase()}
        </div>
        {isLoser ? (
          <>
            <p className="text-red-400 font-bold text-lg">You said 21!</p>
            <p className="text-white/50 text-sm mt-1">Pick your challenge:</p>
          </>
        ) : (
          <>
            <p className="font-bold text-white text-lg">{loser.name} said 21!</p>
            <p className="text-white/50 text-sm mt-1">Waiting for them to pick...</p>
          </>
        )}
      </div>

      {/* Timer */}
      {cardSelectionStartedAt && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1" style={{ color: timerColor }}>
            <span className={secondsLeft <= 5 ? 'animate-pulse font-bold' : ''}>
              {isLoser ? (secondsLeft <= 5 ? '⏰ Pick now or one is chosen!' : 'Choose your card') : `${loser.name} is choosing...`}
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

      {/* Card options */}
      {isLoser ? (
        <div className="flex flex-col gap-3">
          {CARD_OPTIONS.map((opt) => {
            const isSameAsLast = opt.type === lastType;
            return (
              <button
                key={opt.type}
                onClick={() => !isSameAsLast && onSelect(opt.type)}
                disabled={isSameAsLast}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl border transition-all active:scale-98 text-left disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: isSameAsLast ? '#1a1a24' : `${opt.color}15`,
                  borderColor: isSameAsLast ? 'rgba(255,255,255,0.06)' : `${opt.color}40`,
                }}
              >
                <span className="text-3xl">{opt.icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-white text-base">{opt.label}</p>
                  <p className="text-xs text-white/50 mt-0.5">
                    {isSameAsLast ? '🚫 Picked last round — choose something else' : opt.desc}
                  </p>
                </div>
                {!isSameAsLast && (
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: opt.color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-4xl animate-pulse">🃏</div>
            <p className="text-white/40 text-sm">
              Waiting for <span className="text-white">{loser.name}</span> to choose a card type...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
