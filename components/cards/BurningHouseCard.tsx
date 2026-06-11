'use client';

import { useState, useEffect } from 'react';
import type { BurningHouseCard as BurningHouseCardType } from '@/types/game';

interface Props {
  card: BurningHouseCardType;
  loserName: string;
  isLoser: boolean;
  onUpdate: (names: [string, string, string], assignments: Record<string, string>) => void;
  onReveal: () => void;
}

export default function BurningHouseCard({ card, loserName, isLoser, onUpdate, onReveal }: Props) {
  const [names, setNames] = useState<[string, string, string]>(card.names || ['', '', '']);
  const [assignments, setAssignments] = useState<Record<string, string>>(card.assignments || {});

  useEffect(() => {
    if (card.names) setNames(card.names);
    if (card.assignments) setAssignments(card.assignments);
  }, [card.names, card.assignments]);

  const namesSubmitted = !!card.names;
  const allNamesFilled = names.every((n) => n.trim().length > 0);
  const allAssigned = namesSubmitted && card.names!.every((n) => assignments[n]);

  function handleNameChange(i: number, val: string) {
    const updated = [...names] as [string, string, string];
    updated[i] = val;
    setNames(updated);
  }

  function handleSubmitNames() {
    const trimmed = names.map((n) => n.trim()) as [string, string, string];
    onUpdate(trimmed, {});
  }

  function handleAssign(name: string, option: string) {
    const currentHolder = Object.entries(assignments).find(([, v]) => v === option)?.[0];
    const updated = { ...assignments };
    if (currentHolder) delete updated[currentHolder];
    updated[name] = option;
    setAssignments(updated);
    onUpdate(card.names!, updated);
  }

  const badge = (
    <div
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold"
      style={{ background: '#BE185D', color: 'white' }}
    >
      🏠 BURNING HOUSE
    </div>
  );

  // ── Phase: setup — others enter names, loser waits ───────────────────────
  if (!namesSubmitted) {
    if (isLoser) {
      return (
        <div className="flex flex-col min-h-svh px-4 py-8 items-center justify-center">
          <div className="w-full max-w-sm flex flex-col gap-5 items-center text-center">
            {badge}
            <div className="text-5xl animate-pulse mt-2">🏠🔥</div>
            <div>
              <p className="text-white font-bold text-xl">The others are picking names for you...</p>
              <p className="text-white/40 text-sm mt-2">
                Options: <span className="text-white/70">{card.options.join(' · ')}</span>
              </p>
              <p className="text-white/30 text-xs mt-3">Don&apos;t peek 👀</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col min-h-svh px-4 py-8">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-5">
          <div className="text-center">
            {badge}
            <p className="text-white font-bold text-lg mt-3">
              Pick 3 names for <span style={{ color: '#BE185D' }}>{loserName}</span>
            </p>
            <p className="text-white/40 text-sm mt-1">
              They&apos;ll assign each to: <span className="text-white/70">{card.options.join(', ')}</span>
            </p>
          </div>

          <div className="space-y-3">
            {([0, 1, 2] as const).map((i) => (
              <div key={i}>
                <label className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1 block">
                  Person {i + 1}
                </label>
                <input
                  type="text"
                  value={names[i]}
                  onChange={(e) => handleNameChange(i, e.target.value)}
                  placeholder={`Name ${i + 1}...`}
                  maxLength={30}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-white/20 text-base outline-none border border-white/10 focus:border-pink-500/50 transition-colors"
                  style={{ background: '#252532' }}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmitNames}
            disabled={!allNamesFilled}
            className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95 disabled:opacity-40"
            style={{ background: '#BE185D' }}
          >
            Send to {loserName} 🔥
          </button>
        </div>
      </div>
    );
  }

  // ── Phase: respond — loser assigns, others watch live ────────────────────
  if (!isLoser) {
    return (
      <div className="flex flex-col min-h-svh px-4 py-8 items-center justify-center">
        <div className="w-full max-w-sm flex flex-col gap-4 items-center text-center">
          {badge}
          <p className="text-white font-bold text-lg mt-2">
            {loserName} is making their choices...
          </p>
          <div className="w-full space-y-3 mt-2">
            {card.names!.map((name) => (
              <div
                key={name}
                className="flex items-center justify-between px-4 py-3 rounded-2xl border border-white/10"
                style={{ background: '#1a1a24' }}
              >
                <span className="font-bold text-white">{name}</span>
                {assignments[name] ? (
                  <span
                    className="text-sm font-semibold px-3 py-1 rounded-full"
                    style={{ background: '#BE185D33', color: '#BE185D', border: '1px solid #BE185D55' }}
                  >
                    {assignments[name]}
                  </span>
                ) : (
                  <span className="text-white/20 text-sm">deciding...</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Loser assigns ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-svh px-4 py-8">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-5">
        <div className="text-center">
          {badge}
          <p className="text-white font-bold text-lg mt-3">Your turn to decide 😬</p>
          <p className="text-white/40 text-sm mt-1">Assign each person to an option</p>
        </div>

        <div className="space-y-4">
          {card.names!.map((name) => (
            <div
              key={name}
              className="rounded-2xl p-4 border border-white/10"
              style={{ background: '#1a1a24' }}
            >
              <p className="font-bold text-white mb-3">{name}</p>
              <div className="flex gap-2 flex-wrap">
                {card.options.map((opt) => {
                  const isSelected = assignments[name] === opt;
                  const takenBy = Object.entries(assignments).find(([n, v]) => v === opt && n !== name)?.[0];
                  return (
                    <button
                      key={opt}
                      onClick={() => handleAssign(name, opt)}
                      className="flex-1 min-w-0 px-3 py-2 rounded-xl text-xs font-bold transition-all border"
                      style={{
                        background: isSelected ? '#BE185D' : '#252532',
                        borderColor: isSelected ? '#BE185D' : takenBy ? '#ffffff10' : '#ffffff20',
                        color: isSelected ? 'white' : takenBy ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)',
                        textDecoration: takenBy && !isSelected ? 'line-through' : 'none',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onReveal}
          disabled={!allAssigned}
          className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95 disabled:opacity-40"
          style={{ background: '#BE185D' }}
        >
          Reveal my answers 🔥
        </button>
      </div>
    </div>
  );
}
