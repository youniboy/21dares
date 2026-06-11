'use client';

import { useState } from 'react';
import CreateRoomModal from '@/components/landing/CreateRoomModal';
import JoinRoomModal from '@/components/landing/JoinRoomModal';

const CARD_PREVIEWS = [
  { label: 'Truth', color: '#7C3AED', icon: '🤔' },
  { label: 'Dare', color: '#DC2626', icon: '🔥' },
  { label: 'Double Dare', color: '#D97706', icon: '⚡' },
  { label: 'Situation', color: '#059669', icon: '🎭' },
  { label: 'Burning House', color: '#BE185D', icon: '🏠' },
];

export default function HomePage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  return (
    <main className="flex flex-col min-h-svh items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#7C3AED' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15 blur-3xl" style={{ background: '#BE185D' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8">
        {/* Logo / Title */}
        <div className="text-center">
          <div className="text-6xl font-black tracking-tight text-white leading-none mb-2">
            21 Dares
          </div>
          <p className="text-white/50 text-sm">The party game with a twist.</p>
        </div>

        {/* Card type pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {CARD_PREVIEWS.map((c) => (
            <span
              key={c.label}
              className="px-3 py-1 rounded-full text-xs font-semibold text-white/90"
              style={{ background: `${c.color}33`, border: `1px solid ${c.color}55` }}
            >
              {c.icon} {c.label}
            </span>
          ))}
        </div>

        {/* How it works */}
        <div className="w-full rounded-2xl p-4 border border-white/8" style={{ background: '#1a1a24' }}>
          <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-3">How it works</p>
          <ol className="space-y-2 text-sm text-white/70">
            <li className="flex gap-2">
              <span className="text-white/30 shrink-0">1.</span>
              Count to 21 — whoever lands on it loses the round.
            </li>
            <li className="flex gap-2">
              <span className="text-white/30 shrink-0">2.</span>
              The loser picks a challenge card type.
            </li>
            <li className="flex gap-2">
              <span className="text-white/30 shrink-0">3.</span>
              Survive the card. New round. Repeat.
            </li>
          </ol>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => setShowCreate(true)}
            className="w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg transition-transform active:scale-95"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
          >
            Create Room
          </button>
          <button
            onClick={() => setShowJoin(true)}
            className="w-full py-4 rounded-2xl font-bold text-white/90 text-lg border border-white/15 transition-transform active:scale-95"
            style={{ background: '#1a1a24' }}
          >
            Join Room
          </button>
        </div>

        <p className="text-xs text-white/25 text-center">
          Play in the same room or anywhere in the world.
        </p>

        <p className="text-xs text-white/20 text-center">
          © 21 Dares &nbsp;·&nbsp; made with{' '}
          <span className="text-red-400/70">♥</span>
          {' '}by{' '}
          <a
            href="https://github.com/youniboy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/35 hover:text-white/60 underline underline-offset-2 transition-colors"
          >
            youniboy
          </a>
        </p>
      </div>

      <CreateRoomModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <JoinRoomModal isOpen={showJoin} onClose={() => setShowJoin(false)} />
    </main>
  );
}
