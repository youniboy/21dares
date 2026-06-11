'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GameCard } from '@/types/game';
import { supabase } from '@/lib/supabase';

const RESPONSE_LIMIT = 90;

const CARD_THEME: Record<string, { label: string; icon: string; color: string }> = {
  truth:           { label: 'Truth',         icon: '🤔', color: '#7C3AED' },
  dare:            { label: 'Dare',          icon: '🔥', color: '#DC2626' },
  'double-dare':   { label: 'Double Dare',   icon: '⚡', color: '#D97706' },
  situation:       { label: 'Situation',     icon: '🎭', color: '#059669' },
  'burning-house': { label: 'Burning House', icon: '🏠', color: '#BE185D' },
};

const RESPONSE_HINT: Record<string, string> = {
  truth:           'Answer honestly. The group will judge.',
  dare:            'Describe what you did or plan to do. Be specific.',
  'double-dare':   "Say which dare(s) you're picking and what you'll do.",
  situation:       'Play it out in detail. No vague answers.',
  'burning-house': 'Explain each assignment. Defend yourself.',
};

function isVideoFile(file: File) {
  return file.type.startsWith('video/');
}

interface Props {
  card: GameCard;
  loserName: string;
  isLoser: boolean;
  onSubmitResponse: (response: string, mediaPath?: string) => void;
  onTimeUp: () => void;
}

export default function CardRespond({ card, loserName, isLoser, onSubmitResponse, onTimeUp }: Props) {
  const theme = CARD_THEME[card.type];
  const canUploadMedia = card.type === 'dare' || card.type === 'double-dare';

  const [responseMode, setResponseMode] = useState<'text' | 'media'>('text');
  const [response, setResponse] = useState(card.response || '');
  const [secondsLeft, setSecondsLeft] = useState<number>(RESPONSE_LIMIT);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isPreviewVideo, setIsPreviewVideo] = useState(false);

  const handleTimeUp = useCallback(() => { onTimeUp(); }, [onTimeUp]);

  useEffect(() => {
    if (!card.respondStartedAt) return;
    const startedAt = new Date(card.respondStartedAt).getTime();
    function tick() {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, RESPONSE_LIMIT - elapsed);
      setSecondsLeft(remaining);
      if (remaining === 0) handleTimeUp();
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [card.respondStartedAt, handleTimeUp]);

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) { setUploadError('File must be under 100 MB.'); return; }

    setUploading(true);
    setUploadError('');
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsPreviewVideo(isVideoFile(file));

    const ext = file.name.split('.').pop() ?? 'bin';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await supabase.storage
      .from('dare-responses')
      .upload(path, file, { upsert: true });

    if (error) {
      setUploadError('Upload failed. Try again or switch to text.');
      setUploading(false);
      setPreviewUrl('');
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('dare-responses').getPublicUrl(data.path);
    onSubmitResponse(publicUrl, data.path);
    setUploading(false);
  }

  const timerPct = (secondsLeft / RESPONSE_LIMIT) * 100;
  const timerColor = secondsLeft <= 10 ? '#EF4444' : secondsLeft <= 30 ? '#F59E0B' : theme.color;
  const isUrgent = secondsLeft <= 10;

  // ── Non-loser waiting screen ─────────────────────────────────────────────
  if (!isLoser) {
    return (
      <div className="flex flex-col min-h-svh px-4 py-8 items-center justify-center">
        <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold" style={{ background: theme.color, color: 'white' }}>
            {theme.icon} {theme.label}
          </div>
          <div className="w-full rounded-2xl p-4 border text-left" style={{ background: `${theme.color}15`, borderColor: `${theme.color}40` }}>
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1">Challenge sent</p>
            <p className="text-white/80 text-sm leading-snug">{card.customChallenge}</p>
          </div>
          {canUploadMedia && (
            <p className="text-xs text-white/30 italic">{loserName} can respond with text or upload a photo/video.</p>
          )}
          <div className="w-full">
            <div className="flex justify-between text-xs text-white/40 mb-1">
              <span>{loserName} is responding...</span>
              <span style={{ color: timerColor }}>{secondsLeft}s</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#252532' }}>
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${timerPct}%`, background: timerColor }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Loser: respond ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-svh px-4 py-8">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-5">

        {/* Timer */}
        <div>
          <div className="flex justify-between text-xs mb-1.5" style={{ color: timerColor }}>
            <span className={isUrgent ? 'animate-pulse font-bold' : ''}>{isUrgent ? '⏰ Time running out!' : 'Time remaining'}</span>
            <span className="font-bold">{secondsLeft}s</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: '#252532' }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${timerPct}%`, background: timerColor, boxShadow: isUrgent ? `0 0 8px ${timerColor}` : 'none' }}
            />
          </div>
        </div>

        {/* Challenge */}
        <div className="rounded-2xl p-5 border" style={{ background: `${theme.color}15`, borderColor: `${theme.color}50` }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: theme.color, color: 'white' }}>
              {theme.icon} {theme.label}
            </div>
          </div>
          <p className="text-white text-lg font-semibold leading-snug">{card.customChallenge}</p>
        </div>

        {/* Response area */}
        {canUploadMedia ? (
          <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: '#1a1a24' }}>
            {/* Mode tabs */}
            <div className="flex border-b border-white/10">
              {(['text', 'media'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setResponseMode(tab)}
                  className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                  style={{
                    color: responseMode === tab ? '#fff' : 'rgba(255,255,255,0.35)',
                    borderBottom: responseMode === tab ? `2px solid ${theme.color}` : '2px solid transparent',
                  }}
                >
                  {tab === 'text' ? '✏️ Write' : '📸 Photo / Video'}
                </button>
              ))}
            </div>

            <div className="p-4">
              {responseMode === 'text' ? (
                <div className="flex flex-col gap-3">
                  <textarea
                    autoFocus
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder={RESPONSE_HINT[card.type]}
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-white/20 text-sm outline-none border border-white/10 resize-none transition-colors"
                    style={{ background: '#252532', borderColor: response ? theme.color + '60' : undefined }}
                  />
                  <p className="text-right text-xs text-white/20">{response.length}/500</p>
                  <button
                    onClick={() => onSubmitResponse(response.trim())}
                    disabled={!response.trim()}
                    className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-40"
                    style={{ background: theme.color }}
                  >
                    Submit Answer
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Preview */}
                  {previewUrl && (
                    <div className="rounded-xl overflow-hidden">
                      {isPreviewVideo ? (
                        <video src={previewUrl} className="w-full max-h-48 rounded-xl" muted playsInline />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewUrl} alt="Preview" className="w-full max-h-48 object-cover rounded-xl" />
                      )}
                    </div>
                  )}

                  {uploading ? (
                    <div className="flex flex-col items-center gap-2 py-5 rounded-xl border border-white/10" style={{ background: '#252532' }}>
                      <span className="text-2xl">⏳</span>
                      <span className="text-white/50 text-sm">Uploading...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {/* Take photo/video — opens camera directly */}
                      <label
                        className="flex flex-col items-center gap-2 py-5 border-2 border-dashed rounded-xl cursor-pointer transition-colors"
                        style={{ borderColor: `${theme.color}50` }}
                      >
                        <span className="text-2xl">📷</span>
                        <span className="text-white/60 text-xs text-center leading-snug font-medium">Take Photo<br/>or Video</span>
                        <input type="file" accept="image/*,video/*" capture="environment" className="sr-only" onChange={handleMediaUpload} />
                      </label>
                      {/* Upload from gallery/files */}
                      <label
                        className="flex flex-col items-center gap-2 py-5 border-2 border-dashed rounded-xl cursor-pointer transition-colors"
                        style={{ borderColor: 'rgba(255,255,255,0.15)' }}
                      >
                        <span className="text-2xl">🖼️</span>
                        <span className="text-white/60 text-xs text-center leading-snug font-medium">From<br/>Library</span>
                        <input type="file" accept="image/*,video/*" className="sr-only" onChange={handleMediaUpload} />
                      </label>
                    </div>
                  )}

                  {uploadError && <p className="text-xs text-red-400 text-center">{uploadError}</p>}

                  <p className="text-xs text-white/25 text-center">
                    The group will see your upload once — it&apos;s deleted after they judge it.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Non-dare types: plain text only */
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2 block">Your response</label>
            <textarea
              autoFocus
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder={RESPONSE_HINT[card.type]}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 rounded-xl text-white placeholder-white/20 text-sm outline-none border border-white/10 resize-none transition-colors"
              style={{ background: '#252532', borderColor: response ? theme.color + '60' : undefined }}
            />
            <p className="text-right text-xs text-white/20 mt-1">{response.length}/500</p>
            <button
              onClick={() => onSubmitResponse(response.trim())}
              disabled={!response.trim()}
              className="w-full mt-3 py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95 disabled:opacity-40"
              style={{ background: theme.color }}
            >
              Submit Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
