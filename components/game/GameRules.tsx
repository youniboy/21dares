'use client';

import type { GameMode } from '@/types/game';

const RULES = [
  {
    icon: '🔢',
    title: 'Count to 21',
    body: 'Players take turns saying 1, 2, or 3 consecutive numbers. Whoever lands on 21 loses the round.',
  },
  {
    icon: '🃏',
    title: 'Pick a card',
    body: 'The loser picks: Truth, Dare, Double Dare, Situation, or Burning House.',
  },
  {
    icon: '⚡',
    title: 'Others set the challenge',
    body: 'The rest of the group chooses a preset or writes a custom challenge. First to submit locks it in.',
  },
  {
    icon: '⏱️',
    title: '90 seconds to respond',
    body: "The loser reads the challenge and writes their response. Run out of time and you're removed from the room.",
  },
  {
    icon: '⚖️',
    title: 'Group judges',
    body: "If the group isn't satisfied with the response, they set a consequence.",
  },
  {
    icon: '📸',
    title: 'Submit proof',
    body: 'After a consequence, the loser must submit photo or text proof within 2 minutes. No proof = kicked.',
  },
  {
    icon: '🔄',
    title: 'Loser starts next count',
    body: 'The loser always kicks off the counting in the next round.',
  },
  {
    icon: '🚪',
    title: 'Ending the game',
    body: 'All players must vote to end. If only one person votes to leave, they get kicked instead.',
  },
];

const MODE_LABEL: Record<GameMode, { icon: string; label: string; color: string }> = {
  normal: { icon: '🎭', label: 'Normal Mode', color: '#A78BFA' },
  spicy:  { icon: '🔥', label: 'Spicy Mode',  color: '#F472B6' },
  mix:    { icon: '🌀', label: 'Mix Mode',     color: '#C084FC' },
  nsfw:   { icon: '🔞', label: 'NSFW Mode',    color: '#FCA5A5' },
};

interface Props {
  mode: GameMode;
  onReady: () => void;
}

export default function GameRules({ mode, onReady }: Props) {
  const m = MODE_LABEL[mode] ?? MODE_LABEL.normal;

  return (
    <div className="flex flex-col min-h-svh px-4 py-8 items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-5">

        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-2">📋</div>
          <h1 className="text-2xl font-black text-white">Rules of the Game</h1>
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ color: m.color, background: `${m.color}18` }}>
            {m.icon} {m.label}
          </div>
        </div>

        {/* Rules list */}
        <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: '#1a1a24' }}>
          {RULES.map((rule, i) => (
            <div
              key={i}
              className="flex gap-3 px-4 py-3.5"
              style={{ borderBottom: i < RULES.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
            >
              <span className="text-lg shrink-0 mt-0.5">{rule.icon}</span>
              <div>
                <p className="text-white font-semibold text-sm">{rule.title}</p>
                <p className="text-white/45 text-xs mt-0.5 leading-relaxed">{rule.body}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onReady}
          className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
        >
          Got it — Let's Play!
        </button>
      </div>
    </div>
  );
}
