'use client';

import { useState } from 'react';
import type { GameCard, BurningHouseCard, Player } from '@/types/game';

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

function ProtectedMedia({ url }: { url: string }) {
  const block = (e: React.MouseEvent | React.DragEvent) => e.preventDefault();

  if (isVideoUrl(url)) {
    // No overlay — it blocks tap on mobile video controls
    return (
      <div className="relative rounded-xl overflow-hidden select-none" onContextMenu={block}>
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
      {/* Transparent overlay blocks right-click → "Save image as" */}
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
  myPlayerId: string;
  players: Player[];
  loserPlayerIndex: number;
  onVoteAccept: () => void;
  onVoteReject: () => void;
  onSetConsequence: (consequence: string) => void;
}

export default function CardJudge({
  card,
  loserName,
  isLoser,
  timedOut,
  myPlayerId,
  players,
  loserPlayerIndex,
  onVoteAccept,
  onVoteReject,
  onSetConsequence,
}: Props) {
  const theme = CARD_THEME[card.type];
  const [consequence, setConsequence] = useState('');

  const judgeVotes = card.judgeVotes ?? { accept: [], reject: [] };
  const nonLoserPlayers = players.filter((_, i) => i !== loserPlayerIndex);
  const judgeCount = nonLoserPlayers.length;
  const majority = Math.ceil(judgeCount / 2);
  const myVote = judgeVotes.accept.includes(myPlayerId)
    ? 'accept'
    : judgeVotes.reject.includes(myPlayerId)
    ? 'reject'
    : null;
  const rejectMajority = judgeVotes.reject.length >= majority;
  const showConsequenceInput = timedOut || rejectMajority;

  const responseIsMedia = card.response && isMediaUrl(card.response);

  function handleSendConsequence() {
    const trimmed = consequence.trim();
    if (!trimmed) return;
    onSetConsequence(trimmed);
  }

  // ── Burning house response display helper ─────────────────────────────────
  function renderBurningHouseResponse() {
    const bh = card as BurningHouseCard;
    if (!bh.assignments || !bh.names) return null;
    return (
      <div className="space-y-2">
        {bh.names.map((name) => (
          <div
            key={name}
            className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/10"
            style={{ background: '#252532' }}
          >
            <span className="font-bold text-white text-sm">{name}</span>
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: '#BE185D33', color: '#BE185D', border: '1px solid #BE185D55' }}
            >
              {bh.assignments?.[name] ?? '—'}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // ── Vote progress bar ─────────────────────────────────────────────────────
  function VoteProgress() {
    const totalVoted = judgeVotes.accept.length + judgeVotes.reject.length;
    return (
      <div className="rounded-2xl p-4 border border-white/10 space-y-2" style={{ background: '#1a1a24' }}>
        <div className="flex justify-between text-xs text-white/40 font-semibold uppercase tracking-wider">
          <span>Jury vote</span>
          <span>{totalVoted}/{judgeCount} voted</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-emerald-400 font-semibold">✓ Accept</span>
              <span className="text-white/40">{judgeVotes.accept.length}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#252532' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: judgeCount > 0 ? `${(judgeVotes.accept.length / judgeCount) * 100}%` : '0%', background: '#059669' }}
              />
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-red-400 font-semibold">✗ Reject</span>
              <span className="text-white/40">{judgeVotes.reject.length}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#252532' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: judgeCount > 0 ? `${(judgeVotes.reject.length / judgeCount) * 100}%` : '0%', background: '#EF4444' }}
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-white/25 text-center">
          Need {majority} to decide · {judgeCount - totalVoted} yet to vote
        </p>
      </div>
    );
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
                <p className="text-white/40 text-sm mt-2">The group is voting on your answer.</p>
              </div>
            </>
          )}

          {/* Show own response — media, text, or burning house assignments */}
          {card.type === 'burning-house' ? (
            <div className="w-full rounded-2xl p-4 border text-left" style={{ background: '#1a1a24', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-3">Your assignments</p>
              {renderBurningHouseResponse()}
            </div>
          ) : card.response ? (
            <div className="w-full rounded-2xl p-4 border text-left" style={{ background: '#1a1a24', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">Your answer</p>
              {responseIsMedia ? (
                <ProtectedMedia url={card.response} />
              ) : (
                <p className="text-white/70 text-sm leading-snug">{card.response}</p>
              )}
            </div>
          ) : null}

          {/* Vote progress visible to loser too */}
          <div className="w-full">
            <VoteProgress />
          </div>
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
        {card.customChallenge ? (
          <div className="rounded-2xl p-4 border" style={{ background: '#1a1a24', borderColor: 'rgba(255,255,255,0.08)' }}>
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1">Challenge</p>
            <p className="text-white/70 text-sm leading-snug">{card.customChallenge}</p>
          </div>
        ) : null}

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
          ) : card.type === 'burning-house' ? (
            renderBurningHouseResponse()
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

        {/* Vote progress */}
        <VoteProgress />

        {/* Verdict / voting */}
        {showConsequenceInput ? (
          /* Reject majority reached or timed out — set consequence */
          <div className="space-y-3">
            <div>
              <label className="text-xs text-red-400/70 uppercase tracking-wider font-semibold mb-2 block">
                {timedOut ? 'Consequence for not responding' : 'Rejected! Set a consequence'}
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
            <button
              onClick={handleSendConsequence}
              disabled={!consequence.trim()}
              className="w-full py-3 rounded-2xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-40"
              style={{ background: '#EF4444' }}
            >
              Send Consequence
            </button>
          </div>
        ) : myVote ? (
          /* Already voted */
          <div
            className="text-center py-3 rounded-2xl text-sm font-semibold border"
            style={{
              background: myVote === 'accept' ? '#05966920' : '#EF444420',
              borderColor: myVote === 'accept' ? '#05966950' : '#EF444450',
              color: myVote === 'accept' ? '#10B981' : '#EF4444',
            }}
          >
            {myVote === 'accept' ? '✓ You voted Accept' : '✗ You voted Reject'} — waiting for others
          </div>
        ) : !timedOut ? (
          /* Vote buttons */
          <div className="flex gap-3">
            <button
              onClick={onVoteAccept}
              className="flex-1 py-4 rounded-2xl font-bold text-white text-sm transition-all active:scale-95"
              style={{ background: '#059669' }}
            >
              ✓ Accept
            </button>
            <button
              onClick={onVoteReject}
              className="flex-1 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 border"
              style={{ background: '#EF444420', borderColor: '#EF444450', color: '#EF4444' }}
            >
              ✗ Reject
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
