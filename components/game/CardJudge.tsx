'use client';

import { useState } from 'react';
import type { GameCard } from '@/types/game';

const CARD_THEME: Record<string, { label: string; icon: string; color: string }> = {
  truth:           { label: 'Truth',         icon: '🤔', color: '#7C3AED' },
  dare:            { label: 'Dare',          icon: '🔥', color: '#DC2626' },
  'double-dare':   { label: 'Double Dare',   icon: '⚡', color: '#D97706' },
  situation:       { label: 'Situation',     icon: '🎭', color: '#059669' },
  'burning-house': { label: 'Burning House', icon: '🏠', color: '#BE185D' },
};

function isMediaUrl(s: string) {
  return s.startsWith('https://');
}

function isVideoUrl(s: string) {
  const lower = s.toLowerCase().split('?')[0];
  return lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.webm') || lower.endsWith('.avi');
}

/** Image/video rendered with all practical anti-download protections */
function ProtectedMedia({ url }: { url: string }) {
  const block = (e: React.MouseEvent | React.DragEvent) => e.preventDefault();

  if (isVideoUrl(url)) {
    return (
      <div className="relative rounded-xl overflow-hidden select-none" onContextMenu={block}>
        {/* Invisible overlay blocks right-click on the video surface */}
        <div className="absolute inset-0 z-10" onContextMenu={block} />
        <video
          src={url}
          controls
          playsInline
          disablePictureInPicture
          className="w-full max-h-72 rounded-xl"
          onContextMenu={block}
          {...{ controlsList: 'nodownload' }}
        />
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden select-none" onContextMenu={block} onDragStart={block}>
      {/* Transparent overlay: blocks right-click → "Save image as" */}
      <div className="absolute inset-0 z-10" onContextMenu={block} onDragStart={block} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Response"
        draggable={false}
        className="w-full max-h-72 object-cover rounded-xl pointer-events-none"
        onContextMenu={block}
        onDragStart={block}
      />
    </div>
  );
}

interface Props {
  card: GameCard;
  loserName: string;
  isLoser: boolean;
  timedOut: boolean;
  onAccept: () => void;
  onSetConsequence: (consequence: string) => void;
}

export default function CardJudge({ card, loserName, isLoser, timedOut, onAccept, onSetConsequence }: Props) {
  const theme = CARD_THEME[card.type];
  const [showConsequenceInput, setShowConsequenceInput] = useState(timedOut);
  const [consequence, setConsequence] = useState('');

  const responseIsMedia = card.response && isMediaUrl(card.response);

  function handleSendConsequence() {
    const trimmed = consequence.trim();
    if (!trimmed) return;
    onSetConsequence(trimmed);
  }

  // ── Loser waiting screen ─────────────────────────────────────────────────
  if (isLoser) {
    return (
      <div className="flex flex-col min-h-svh px-4 py-8 items-center justify-center">
        <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold" style={{ background: theme.color, color: 'white' }}>
            {theme.icon} {theme.label}
          </div>

          {timedOut ? (
            <>
              <div className="text-5xl">⏰</div>
              <div>
                <p className="text-red-400 font-bold text-xl">Time&apos;s up!</p>
                <p className="text-white/40 text-sm mt-2">The others are deciding your consequence...</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-5xl animate-pulse">⚖️</div>
              <div>
                <p className="text-white font-bold text-xl">Waiting for the verdict...</p>
                <p className="text-white/40 text-sm mt-2">The others are reviewing your answer.</p>
              </div>
            </>
          )}

          {/* Show own response — media or text */}
          {card.response && (
            <div className="w-full rounded-2xl p-4 border text-left" style={{ background: '#1a1a24', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">Your answer</p>
              {responseIsMedia ? (
                <ProtectedMedia url={card.response} />
              ) : (
                <p className="text-white/70 text-sm leading-snug">{card.response}</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Others: judge screen ─────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-svh px-4 py-8">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-5">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-2" style={{ background: theme.color, color: 'white' }}>
            {theme.icon} {theme.label}
          </div>
          <p className="text-white/50 text-sm">
            {timedOut ? `${loserName} ran out of time` : `${loserName}'s answer — judge it`}
          </p>
        </div>

        {/* Challenge */}
        <div className="rounded-2xl p-4 border" style={{ background: '#1a1a24', borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1">Challenge</p>
          <p className="text-white/70 text-sm leading-snug">{card.customChallenge}</p>
        </div>

        {/* Response */}
        <div
          className="rounded-2xl p-4 border"
          style={{
            background: timedOut ? '#EF444415' : `${theme.color}15`,
            borderColor: timedOut ? '#EF444440' : `${theme.color}40`,
          }}
        >
          <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">
            {timedOut ? "Didn't respond in time" : `${loserName}'s answer`}
          </p>

          {timedOut ? (
            <p className="text-red-400/70 text-sm italic">No response submitted — time expired ⏰</p>
          ) : responseIsMedia ? (
            <>
              <ProtectedMedia url={card.response} />
              <p className="text-xs text-white/25 mt-2 text-center">
                This media is deleted after you judge it.
              </p>
            </>
          ) : (
            <p className="text-white text-sm leading-snug">{card.response || '(no response)'}</p>
          )}
        </div>

        {/* Verdict */}
        {!showConsequenceInput ? (
          <div className="flex gap-3">
            {!timedOut && (
              <button
                onClick={onAccept}
                className="flex-1 py-4 rounded-2xl font-bold text-white text-sm transition-all active:scale-95"
                style={{ background: '#059669' }}
              >
                ✓ Accept
              </button>
            )}
            <button
              onClick={() => setShowConsequenceInput(true)}
              className="flex-1 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 border"
              style={{
                background: timedOut ? '#EF4444' : '#EF444420',
                borderColor: '#EF444450',
                color: timedOut ? 'white' : '#EF4444',
              }}
            >
              {timedOut ? 'Set Consequence' : '✗ Not Good Enough'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-red-400/70 uppercase tracking-wider font-semibold mb-2 block">
                {timedOut ? 'Consequence for not responding' : 'Set a consequence'}
              </label>
              <textarea
                autoFocus
                value={consequence}
                onChange={(e) => setConsequence(e.target.value)}
                placeholder={`What must ${loserName} do?`}
                rows={3}
                maxLength={300}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-white/20 text-sm outline-none border border-red-500/30 resize-none"
                style={{ background: '#252532' }}
              />
            </div>
            <div className="flex gap-3">
              {!timedOut && (
                <button
                  onClick={() => setShowConsequenceInput(false)}
                  className="flex-1 py-3 rounded-2xl font-semibold text-white/50 text-sm border border-white/10 transition-all"
                  style={{ background: '#1a1a24' }}
                >
                  Back
                </button>
              )}
              <button
                onClick={handleSendConsequence}
                disabled={!consequence.trim()}
                className="flex-1 py-3 rounded-2xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-40"
                style={{ background: '#EF4444' }}
              >
                Send Consequence
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
