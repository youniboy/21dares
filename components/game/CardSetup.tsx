'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GameCard, DoubleDareCard, ProposedChallenge } from '@/types/game';

const SETUP_LIMIT = 45; // seconds to submit a challenge

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
  'burning-house': 'The loser will assign 3 names to the options shown.',
};

interface Props {
  card: GameCard;
  loserName: string;
  isLoser: boolean;
  myPlayerId: string;
  myPlayerName: string;
  onProposeChallenge: (text: string, isPreset: boolean) => void;
  onVoteForProposal: (proposalId: string) => void;
  onSetupTimerUp: () => void;
}

function getPresetText(card: GameCard): string {
  switch (card.type) {
    case 'truth':    return card.suggestion;
    case 'dare':     return card.suggestion;
    case 'double-dare': return card.suggestion1;
    case 'situation': return card.suggestion;
    case 'burning-house': return card.options.join(' / ');
  }
}

export default function CardSetup({
  card,
  loserName,
  isLoser,
  myPlayerId,
  myPlayerName,
  onProposeChallenge,
  onVoteForProposal,
  onSetupTimerUp,
}: Props) {
  const theme = CARD_THEME[card.type];
  const [customText, setCustomText] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(SETUP_LIMIT);

  const proposals: ProposedChallenge[] = card.proposedChallenges ?? [];
  const myProposal = proposals.find((p) => p.playerId === myPlayerId);
  const myVotedId = proposals.find((p) => p.votes.includes(myPlayerId))?.id ?? null;
  const topProposal = proposals.length > 0
    ? proposals.reduce((a, b) => b.votes.length > a.votes.length ? b : a)
    : null;

  const handleTimerUp = useCallback(() => {
    if (card.cardPhase !== 'setup') return;
    onSetupTimerUp();
  }, [card.cardPhase, onSetupTimerUp]);

  useEffect(() => {
    if (!card.setupStartedAt) return;
    const startedAt = new Date(card.setupStartedAt).getTime();

    function tick() {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, SETUP_LIMIT - elapsed);
      setSecondsLeft(remaining);
      if (remaining === 0) handleTimerUp();
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [card.setupStartedAt, handleTimerUp]);

  const timerPct = (secondsLeft / SETUP_LIMIT) * 100;
  const timerColor = secondsLeft <= 10 ? '#EF4444' : secondsLeft <= 20 ? '#F59E0B' : theme.color;

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
          {/* Show proposals count live */}
          {proposals.length > 0 && (
            <p className="text-white/30 text-xs">{proposals.length} challenge{proposals.length !== 1 ? 's' : ''} submitted so far</p>
          )}
          {/* Timer */}
          {card.setupStartedAt && (
            <div className="w-full">
              <div className="flex justify-between text-xs mb-1" style={{ color: timerColor }}>
                <span>Time remaining</span>
                <span className="font-bold">{secondsLeft}s</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#252532' }}>
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${timerPct}%`, background: timerColor }} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Non-loser view ───────────────────────────────────────────────────────

  const preset = getPresetText(card);
  const isDoubleDare = card.type === 'double-dare';
  const dd = isDoubleDare ? (card as DoubleDareCard) : null;

  function handlePropose(text: string, isPreset: boolean) {
    if (!text.trim()) return;
    onProposeChallenge(text.trim(), isPreset);
    setCustomText('');
  }

  return (
    <div className="flex flex-col min-h-svh px-4 py-8">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-5">

        {/* Header */}
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

        {/* Timer */}
        {card.setupStartedAt && (
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: timerColor }}>
              <span className={secondsLeft <= 10 ? 'animate-pulse font-bold' : ''}>
                {secondsLeft <= 10 ? '⏰ Best challenge wins soon!' : 'Submit & vote on challenges'}
              </span>
              <span className="font-bold">{secondsLeft}s</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#252532' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${timerPct}%`, background: timerColor, boxShadow: secondsLeft <= 10 ? `0 0 6px ${timerColor}` : 'none' }}
              />
            </div>
          </div>
        )}

        {/* Double dare: show both preset cards */}
        {isDoubleDare && dd ? (
          <div className="space-y-2">
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Preset dares</p>
            <div
              className="rounded-2xl p-4 border cursor-pointer transition-all active:scale-98"
              style={{ background: `${theme.color}15`, borderColor: `${theme.color}40` }}
              onClick={() => handlePropose(`Dare 1: ${dd.suggestion1}`, true)}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">⚡</span>
                <div>
                  <p className="text-xs text-white/40 font-semibold mb-1">DARE 1 — tap to propose</p>
                  <p className="text-white/80 text-sm leading-snug">{dd.suggestion1}</p>
                </div>
              </div>
            </div>
            <div
              className="rounded-2xl p-4 border cursor-pointer transition-all active:scale-98"
              style={{ background: `${theme.color}15`, borderColor: `${theme.color}40` }}
              onClick={() => handlePropose(`Dare 2: ${dd.suggestion2}`, true)}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">⚡</span>
                <div>
                  <p className="text-xs text-white/40 font-semibold mb-1">DARE 2 — tap to propose</p>
                  <p className="text-white/80 text-sm leading-snug">{dd.suggestion2}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => handlePropose(`Both dares: ${dd.suggestion1} AND ${dd.suggestion2}`, true)}
              className="w-full py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95"
              style={{ background: `${theme.color}10`, borderColor: `${theme.color}30`, color: theme.color }}
            >
              ⚡⚡ Propose BOTH dares
            </button>
          </div>
        ) : (
          /* Single preset card */
          <button
            onClick={() => handlePropose(preset, true)}
            className="w-full text-left p-4 rounded-2xl border transition-all active:scale-98"
            style={{ background: `${theme.color}15`, borderColor: `${theme.color}40` }}
          >
            <div className="flex items-start gap-3">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1">Tap to propose preset</p>
                <p className="text-white/80 text-sm leading-snug">{preset}</p>
              </div>
            </div>
          </button>
        )}

        {/* Custom challenge input */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2 block">Or write a custom challenge</label>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={`Write a custom ${theme.label.toLowerCase()} for ${loserName}...`}
            rows={3}
            maxLength={300}
            className="w-full px-4 py-3 rounded-xl text-white placeholder-white/20 text-sm outline-none border border-white/10 resize-none transition-colors"
            style={{ background: '#252532', borderColor: customText ? theme.color + '60' : undefined }}
          />
          <button
            onClick={() => handlePropose(customText, false)}
            disabled={!customText.trim()}
            className="w-full mt-2 py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-40"
            style={{ background: theme.color }}
          >
            Propose this challenge
          </button>
        </div>

        {/* Live proposal list */}
        {proposals.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">
              {proposals.length} challenge{proposals.length !== 1 ? 's' : ''} — vote for the best one
            </p>
            {proposals
              .slice()
              .sort((a, b) => b.votes.length - a.votes.length)
              .map((p) => {
                const isTop = p.id === topProposal?.id;
                const hasMyVote = p.votes.includes(myPlayerId);
                return (
                  <div
                    key={p.id}
                    className="rounded-2xl p-3 border transition-all"
                    style={{
                      background: isTop ? `${theme.color}18` : '#1a1a24',
                      borderColor: isTop ? `${theme.color}60` : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="text-xs text-white/40 mb-1">
                          {p.playerName}{p.isPreset ? ' · preset' : ''}
                          {isTop && proposals.length > 1 ? ' · 🏆 leading' : ''}
                        </p>
                        <p className="text-white/80 text-sm leading-snug">{p.text}</p>
                      </div>
                      <button
                        onClick={() => onVoteForProposal(p.id)}
                        className="shrink-0 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all active:scale-95 border"
                        style={{
                          background: hasMyVote ? `${theme.color}30` : '#252532',
                          borderColor: hasMyVote ? theme.color : 'rgba(255,255,255,0.1)',
                          color: hasMyVote ? theme.color : 'rgba(255,255,255,0.5)',
                        }}
                      >
                        <span className="text-sm">{hasMyVote ? '👍' : '👍'}</span>
                        <span className="text-xs font-bold">{p.votes.length}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {proposals.length === 0 && (
          <p className="text-center text-xs text-white/25">
            First person to propose locks if no one votes. Timer picks the winner.
          </p>
        )}
      </div>
    </div>
  );
}
