'use client';

import { useState } from 'react';
import type { DoubleDareCard as DoubleDareCardType } from '@/types/game';

interface Props {
  card: DoubleDareCardType;
  loserName: string;
  isLoser: boolean;
  onUpdateCompleted: (completed: ('dare1' | 'dare2')[]) => void;
  onDone: () => void;
}

export default function DoubleDareCard({ card, loserName, isLoser, onUpdateCompleted, onDone }: Props) {
  const [completed, setCompleted] = useState<('dare1' | 'dare2')[]>(card.completed || []);

  function toggle(d: 'dare1' | 'dare2') {
    if (!isLoser) return;
    const updated = completed.includes(d) ? completed.filter((x) => x !== d) : [...completed, d];
    setCompleted(updated);
    onUpdateCompleted(updated);
  }

  const dares = [
    { key: 'dare1' as const, text: card.suggestion1, label: 'Dare 1' },
    { key: 'dare2' as const, text: card.suggestion2, label: 'Dare 2' },
  ];

  return (
    <div className="flex flex-col min-h-svh px-4 py-8 items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-4">
        {/* Header */}
        <div className="text-center mb-2">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold tracking-wider mb-2"
            style={{ background: '#D97706', color: 'white' }}
          >
            ⚡ DOUBLE DARE
          </div>
          <p className="text-white/50 text-xs">
            {isLoser
              ? 'Complete one, both, or come clean and take the shame.'
              : `${loserName} must choose what to tackle.`}
          </p>
        </div>

        {/* Dare cards */}
        {dares.map((d) => {
          const done = completed.includes(d.key);
          return (
            <button
              key={d.key}
              onClick={() => toggle(d.key)}
              disabled={!isLoser}
              className="w-full text-left rounded-3xl p-5 border transition-all"
              style={{
                background: done ? '#D9780620' : '#1a1a24',
                borderColor: done ? '#D97706' : 'rgba(255,255,255,0.08)',
                opacity: isLoser ? 1 : 0.9,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                  style={{
                    borderColor: done ? '#D97706' : 'rgba(255,255,255,0.2)',
                    background: done ? '#D97706' : 'transparent',
                  }}
                >
                  {done && <span className="text-xs text-white font-bold">✓</span>}
                </div>
                <div>
                  <span className="text-xs font-bold text-white/40 uppercase tracking-wider">{d.label}</span>
                  <p className="text-white font-semibold text-sm mt-1 leading-snug">{d.text}</p>
                </div>
              </div>
            </button>
          );
        })}

        {isLoser && (
          <p className="text-center text-xs text-white/30">
            Tap a dare to mark it complete.
          </p>
        )}

        <button
          onClick={onDone}
          className="w-full py-4 rounded-2xl font-bold text-white text-base mt-2 transition-all active:scale-95"
          style={{ background: '#D97706' }}
        >
          Next Round
        </button>
      </div>
    </div>
  );
}
