'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { GameCard } from '@/types/game';
import { supabase } from '@/lib/supabase';

const PROOF_LIMIT = 120; // 2 minutes to submit proof

const CARD_THEME: Record<string, { label: string; icon: string; color: string }> = {
  truth:           { label: 'Truth',         icon: '🤔', color: '#7C3AED' },
  dare:            { label: 'Dare',          icon: '🔥', color: '#DC2626' },
  'double-dare':   { label: 'Double Dare',   icon: '⚡', color: '#D97706' },
  situation:       { label: 'Situation',     icon: '🎭', color: '#059669' },
  'burning-house': { label: 'Burning House', icon: '🏠', color: '#BE185D' },
};

interface Props {
  card: GameCard;
  loserName: string;
  isLoser: boolean;
  onSubmitProof: (proof: string) => void;
  onNextRound: () => void;
  onKickLoser: () => void;
  onProofTimeUp: () => void;
}

function isImageUrl(s: string) {
  return s.startsWith('https://');
}

export default function CardConsequence({
  card,
  loserName,
  isLoser,
  onSubmitProof,
  onNextRound,
  onKickLoser,
  onProofTimeUp,
}: Props) {
  const theme = CARD_THEME[card.type];
  const [secondsLeft, setSecondsLeft] = useState(PROOF_LIMIT);
  const [expired, setExpired] = useState(false);
  const [proofText, setProofText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [proofTab, setProofTab] = useState<'image' | 'text'>('image');
  const timeUpFired = useRef(false);

  const proof = card.proof ?? '';
  const proofSubmitted = proof !== '';

  const handleExpire = useCallback(() => {
    if (!proofSubmitted && !timeUpFired.current) {
      timeUpFired.current = true;
      setExpired(true);
      onProofTimeUp();
    }
  }, [proofSubmitted, onProofTimeUp]);

  useEffect(() => {
    if (!card.consequenceStartedAt) return;
    const startedAt = new Date(card.consequenceStartedAt).getTime();

    function tick() {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, PROOF_LIMIT - elapsed);
      setSecondsLeft(remaining);
      if (remaining === 0) handleExpire();
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [card.consequenceStartedAt, handleExpire]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setUploadError('Image must be under 5 MB.'); return; }

    setUploading(true);
    setUploadError('');
    setPreviewUrl(URL.createObjectURL(file));

    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await supabase.storage.from('proofs').upload(path, file, { upsert: true });
    if (error) {
      setUploadError('Upload failed. Try again or switch to text proof.');
      setUploading(false);
      setPreviewUrl('');
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(data.path);
    onSubmitProof(publicUrl);
    setUploading(false);
  }

  function handleSubmitText() {
    if (!proofText.trim()) return;
    onSubmitProof(proofText.trim());
  }

  const timerPct = (secondsLeft / PROOF_LIMIT) * 100;
  const timerColor = secondsLeft <= 15 ? '#EF4444' : secondsLeft <= 40 ? '#F59E0B' : '#DC2626';
  const isUrgent = secondsLeft <= 15 && !expired && !proofSubmitted;

  // ── Loser view ─────────────────────────────────────────────────────────────

  if (isLoser) {
    if (proofSubmitted) {
      return (
        <div className="flex flex-col min-h-svh px-4 py-8 items-center justify-center">
          <div className="w-full max-w-sm flex flex-col gap-5 text-center">
            <div className="text-5xl">⏳</div>
            <div>
              <p className="text-white font-bold text-xl">Proof submitted!</p>
              <p className="text-white/40 text-sm mt-1">Waiting for the group to verify it...</p>
            </div>
            <div className="rounded-2xl p-4 border border-white/10" style={{ background: '#1a1a24' }}>
              {isImageUrl(proof) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={proof} alt="Your proof" className="w-full rounded-xl max-h-48 object-cover" />
              ) : (
                <p className="text-white/70 text-sm italic">"{proof}"</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col min-h-svh px-4 py-8 items-center justify-center">
        <div className="w-full max-w-sm flex flex-col gap-4">

          <div className="text-center">
            <div className="text-4xl mb-2">😬</div>
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Consequence</p>
            <p className="text-white font-bold text-xl mt-1">You must complete this:</p>
          </div>

          {/* Consequence */}
          <div className="rounded-3xl p-5 border" style={{ background: '#EF444415', borderColor: '#EF444440' }}>
            <p className="text-xs text-red-400/60 uppercase tracking-wider font-semibold mb-2">Must do</p>
            <p className="text-white text-xl font-bold leading-snug">{card.consequence}</p>
          </div>

          {/* Timer */}
          {card.consequenceStartedAt && (
            <div>
              <div className="flex justify-between text-xs mb-1.5" style={{ color: timerColor }}>
                <span className={isUrgent ? 'animate-pulse font-bold' : ''}>
                  {expired ? 'Time is up!' : isUrgent ? '⏰ Submit proof now!' : 'Time to submit proof'}
                </span>
                <span className="font-bold">{expired ? '0' : secondsLeft}s</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#252532' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${timerPct}%`, background: timerColor, boxShadow: isUrgent ? `0 0 8px ${timerColor}` : 'none' }}
                />
              </div>
            </div>
          )}

          {/* Proof submission */}
          {!expired && (
            <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: '#1a1a24' }}>
              {/* Tabs */}
              <div className="flex border-b border-white/10">
                {(['image', 'text'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setProofTab(tab)}
                    className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                    style={{
                      color: proofTab === tab ? '#fff' : 'rgba(255,255,255,0.35)',
                      borderBottom: proofTab === tab ? '2px solid #DC2626' : '2px solid transparent',
                    }}
                  >
                    {tab === 'image' ? '📸 Photo proof' : '✍️ Text proof'}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {proofTab === 'image' ? (
                  <div className="flex flex-col gap-3">
                    {previewUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="Preview" className="w-full rounded-xl max-h-40 object-cover" />
                    )}
                    <label className="flex flex-col items-center gap-2 py-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors border-white/15 hover:border-white/30">
                      <span className="text-2xl">📷</span>
                      <span className="text-white/50 text-sm">{uploading ? 'Uploading...' : 'Tap to choose a photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="sr-only"
                        disabled={uploading}
                        onChange={handleImageUpload}
                      />
                    </label>
                    {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <textarea
                      value={proofText}
                      onChange={(e) => setProofText(e.target.value)}
                      placeholder="Describe how you completed the consequence..."
                      maxLength={300}
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl text-white placeholder-white/25 text-sm outline-none border border-white/10 focus:border-red-500/50 resize-none transition-colors"
                      style={{ background: '#252532' }}
                    />
                    <button
                      onClick={handleSubmitText}
                      disabled={!proofText.trim()}
                      className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-40"
                      style={{ background: proofText.trim() ? '#DC2626' : '#252532' }}
                    >
                      Submit Proof
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {expired && (
            <p className="text-center text-red-400/70 text-sm font-semibold">
              Time's up — you've been removed for not submitting proof.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Others view ────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-svh px-4 py-8 items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-5">

        <div className="text-center">
          <div className="text-4xl mb-2">{proofSubmitted ? '🔍' : '😬'}</div>
          <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Consequence</p>
          <p className="text-white font-bold text-xl mt-1">
            {proofSubmitted ? `${loserName} submitted proof` : `${loserName} must complete this:`}
          </p>
        </div>

        {/* Consequence */}
        <div className="rounded-3xl p-5 border" style={{ background: '#EF444415', borderColor: '#EF444440' }}>
          <p className="text-xs text-red-400/60 uppercase tracking-wider font-semibold mb-2">Must do</p>
          <p className="text-white text-xl font-bold leading-snug">{card.consequence}</p>
        </div>

        {/* Timer — show while waiting for proof */}
        {!proofSubmitted && card.consequenceStartedAt && (
          <div>
            <div className="flex justify-between text-xs mb-1.5" style={{ color: timerColor }}>
              <span className={isUrgent ? 'animate-pulse font-bold' : ''}>
                {expired ? `${loserName} ran out of time` : `Waiting for ${loserName}'s proof`}
              </span>
              <span className="font-bold">{expired ? '0' : secondsLeft}s</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#252532' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${timerPct}%`, background: timerColor }}
              />
            </div>
          </div>
        )}

        {/* Proof display */}
        {proofSubmitted && (
          <div className="rounded-2xl p-4 border border-white/10" style={{ background: '#1a1a24' }}>
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-3">Their proof</p>
            {isImageUrl(proof) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={proof} alt="Proof" className="w-full rounded-xl max-h-64 object-cover" />
            ) : (
              <p className="text-white/80 text-sm leading-relaxed italic">"{proof}"</p>
            )}
          </div>
        )}

        {/* Waiting state */}
        {!proofSubmitted && !expired && (
          <p className="text-center text-white/30 text-sm">
            {loserName} has {secondsLeft}s to submit photo or text proof.
          </p>
        )}

        {/* Action buttons — only shown after proof submitted */}
        {proofSubmitted && (
          <div className="flex flex-col gap-2">
            <button
              onClick={onNextRound}
              className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95"
              style={{ background: '#059669' }}
            >
              Accept & Next Round
            </button>
            <button
              onClick={onKickLoser}
              className="w-full py-3 rounded-2xl font-semibold text-red-400 text-sm border border-red-500/20 transition-all active:scale-95"
              style={{ background: '#EF444410' }}
            >
              Reject proof — kick {loserName}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
