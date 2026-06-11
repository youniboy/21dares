'use client';

import { useState } from 'react';
import type { GameCard } from '@/types/game';

const CARD_THEME: Record<string, { label: string; icon: string; color: string }> = {
  truth:         { label: 'Truth',        icon: '🤔', color: '#7C3AED' },
  dare:          { label: 'Dare',         icon: '🔥', color: '#DC2626' },
  'double-dare': { label: 'Double Dare',  icon: '⚡', color: '#D97706' },
  situation:     { label: 'Situation',    icon: '🎭', color: '#059669' },
  'burning-house': { label: 'Burning House', icon: '🏠', color: '#BE185D' },
};

const RESPOND_PROMPT: Record<string, string> = {
  truth:         'The loser must answer this question in writing.',
  dare:          'The loser must describe how they did / will do this.',
  'double-dare': 'The loser picks which dare(s) to do and explains.',
  situation:     "The loser must explain exactly how they'd handle this.",
  'burning-house': 'The loser will be asked to assign 3 names to these options.',
};

interface Props {
  card: GameCard;
  loserName: string;
  isLoser: boolean;
  onSendChallenge: (challenge: string) => void;
}

function getSuggestions(card: GameCard): string[] {
  switch (card.type) {
    case 'truth':    return [card.suggestion];
    case 'dare':     return [card.suggestion];
    case 'double-dare': return [`${card.suggestion1} / ${card.suggestion2}`];
    case 'situation': return [card.suggestion];
    case 'burning-house': return [card.options.join(' / ')];
  }
}

export default function CardSetup({ card, loserName, isLoser, onSendChallenge }: Props) {
  const theme = CARD_THEME[card.type];
  const [useCustom, setUseCustom] = useState(false);
  const [customText, setCustomText] = useState('');
  const suggestions = getSuggestions(card);
  const preset = suggestions[0];
  const canSend = useCustom ? customText.trim().length > 0 : true;

  function handleSend() {
    onSendChallenge(useCustom ? customText.trim() : preset);
  }

  // ── Loser waiting screen ─────────────────────────────────────────────────
  if (isLoser) {
    return (
      <div className="flex flex-col min-h-svh px-4 py-8 items-center justify-center">
        <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold"
            style={{ background: theme.color, color: 'white' }}
          >
            {theme.icon} {theme.label}
          </div>
          <div className="text-5xl animate-bounce">🎲</div>
          <div>
            <p className="text-white font-bold text-xl">The others are choosing your challenge...</p>
            <p className="text-white/40 text-sm mt-2">Sit tight. No peeking.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Others: pick preset or write custom ──────────────────────────────────
  return (
    <div className="flex flex-col min-h-svh px-4 py-8">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-5">
        <div className="text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-3"
            style={{ background: theme.color, color: 'white' }}
          >
            {theme.icon} {theme.label}
          </div>
          <p className="text-white font-bold text-lg">
            Set a challenge for <span style={{ color: theme.color }}>{loserName}</span>
          </p>
          <p className="text-white/40 text-xs mt-1">{RESPOND_PROMPT[card.type]}</p>
        </div>

        {/* Preset option */}
        <button
          onClick={() => setUseCustom(false)}
          className="w-full text-left p-4 rounded-2xl border transition-all"
          style={{
            background: !useCustom ? `${theme.color}20` : '#1a1a24',
            borderColor: !useCustom ? theme.color : 'rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
              style={{
                borderColor: !useCustom ? theme.color : 'rgba(255,255,255,0.3)',
                background: !useCustom ? theme.color : 'transparent',
              }}
            >
              {!useCustom && <span className="text-white text-xs font-bold">✓</span>}
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1">Use suggestion</p>
              <p className="text-white/80 text-sm leading-snug">{preset}</p>
            </div>
          </div>
        </button>

        {/* Custom option */}
        <div>
          <button
            onClick={() => setUseCustom(true)}
            className="w-full text-left p-4 rounded-2xl border transition-all"
            style={{
              background: useCustom ? `${theme.color}20` : '#1a1a24',
              borderColor: useCustom ? theme.color : 'rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                style={{
                  borderColor: useCustom ? theme.color : 'rgba(255,255,255,0.3)',
                  background: useCustom ? theme.color : 'transparent',
                }}
              >
                {useCustom && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Write custom</p>
            </div>
          </button>

          {useCustom && (
            <textarea
              autoFocus
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={`Write a custom ${theme.label.toLowerCase()} for ${loserName}...`}
              rows={3}
              maxLength={300}
              className="w-full mt-2 px-4 py-3 rounded-xl text-white placeholder-white/20 text-sm outline-none border border-white/10 resize-none"
              style={{ background: '#252532', borderColor: theme.color + '60' }}
            />
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={!canSend}
          className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95 disabled:opacity-40"
          style={{ background: theme.color }}
        >
          Send to {loserName} {theme.icon}
        </button>

        <p className="text-center text-xs text-white/25">
          First person to send locks in the challenge.
        </p>
      </div>
    </div>
  );
}
