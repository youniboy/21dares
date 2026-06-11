'use client';

import type { CardType, Player } from '@/types/game';

interface Props {
  loser: Player;
  myPlayerId: string;
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
    desc: 'You\'re in a scenario. Tell the group how you\'d handle it.',
  },
  {
    type: 'burning-house',
    label: 'Burning House',
    icon: '🏠',
    color: '#BE185D',
    desc: 'Name 3 people and assign them to 3 options.',
  },
];

export default function CardSelector({ loser, myPlayerId, onSelect }: Props) {
  const isLoser = loser.id === myPlayerId;

  return (
    <div className="flex flex-col min-h-svh px-4 py-8">
      {/* Loser banner */}
      <div className="rounded-2xl p-4 mb-6 text-center border border-red-500/20" style={{ background: '#EF444415' }}>
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

      {/* Card options */}
      {isLoser ? (
        <div className="flex flex-col gap-3">
          {CARD_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              onClick={() => onSelect(opt.type)}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl border transition-all active:scale-98 text-left"
              style={{
                background: `${opt.color}15`,
                borderColor: `${opt.color}40`,
              }}
            >
              <span className="text-3xl">{opt.icon}</span>
              <div>
                <p className="font-bold text-white text-base">{opt.label}</p>
                <p className="text-xs text-white/50 mt-0.5">{opt.desc}</p>
              </div>
              <div
                className="ml-auto w-2 h-2 rounded-full shrink-0"
                style={{ background: opt.color }}
              />
            </button>
          ))}
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
