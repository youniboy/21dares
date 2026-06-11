'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import AgeGateModal from '@/components/ui/AgeGateModal';
import { getOrCreatePlayerId } from '@/lib/room-utils';
import type { GameMode } from '@/types/game';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const MODES: { value: GameMode; label: string; icon: string; description: string }[] = [
  { value: 'normal', label: 'Normal',  icon: '🎭', description: 'Fun for everyone' },
  { value: 'spicy',  label: 'Spicy',   icon: '🔥', description: '18+ content' },
  { value: 'mix',    label: 'Mix',     icon: '🌀', description: 'Best of both' },
  { value: 'nsfw',   label: 'NSFW',    icon: '🔞', description: '21+ explicit' },
];

const MODE_COLORS: Record<GameMode, { border: string; bg: string; text: string }> = {
  normal: { border: '#6D28D9', bg: '#1e1b4b', text: '#A78BFA' },
  spicy:  { border: '#BE185D', bg: '#1f0f14', text: '#F472B6' },
  mix:    { border: '#7C3AED', bg: '#1a1430', text: '#C084FC' },
  nsfw:   { border: '#DC2626', bg: '#1a0808', text: '#FCA5A5' },
};

export default function CreateRoomModal({ isOpen, onClose }: Props) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<GameMode>('normal');
  const [nsfwPin, setNsfwPin] = useState('');
  const [showNsfwPin, setShowNsfwPin] = useState(false);
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function createRoom() {
    const trimmedName = name.trim();
    if (!trimmedName) { setError('Enter your name to continue.'); return; }
    if (trimmedName.length > 20) { setError('Name must be 20 characters or less.'); return; }
    if (mode === 'nsfw' && !/^\d{6}$/.test(nsfwPin.trim())) { setError('NSFW PIN must be exactly 6 digits.'); return; }

    setLoading(true);
    setError('');
    try {
      const playerId = getOrCreatePlayerId();
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: trimmedName,
          playerId,
          password: password.trim() || undefined,
          mode,
          nsfwPin: mode === 'nsfw' ? nsfwPin.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create room');
      const qs = new URLSearchParams();
      if (password.trim()) qs.set('p', password.trim());
      if (mode === 'nsfw' && nsfwPin.trim()) qs.set('nsfw', nsfwPin.trim());
      const query = qs.toString();
      router.push(`/room/${data.code}${query ? `?${query}` : ''}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  function handleCreate() {
    if (!name.trim()) { setError('Enter your name to continue.'); return; }
    if (mode === 'nsfw' && !/^\d{6}$/.test(nsfwPin.trim())) { setError('NSFW PIN must be exactly 6 digits.'); return; }
    if (mode === 'spicy' || mode === 'mix' || mode === 'nsfw') {
      setShowAgeGate(true);
    } else {
      createRoom();
    }
  }

  const colors = MODE_COLORS[mode];

  return (
    <>
      <Modal isOpen={isOpen && !showAgeGate} onClose={onClose} title="Create a Room">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="Enter your name..."
              maxLength={20}
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 text-base outline-none border border-white/10 focus:border-purple-500/60 transition-colors"
              style={{ background: '#252532' }}
            />
          </div>

          {/* Mode selector */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Game mode</label>
            <div className="grid grid-cols-4 gap-2">
              {MODES.map((m) => {
                const selected = mode === m.value;
                const c = MODE_COLORS[m.value];
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => { setMode(m.value); setError(''); }}
                    className="flex flex-col items-center gap-1 py-3 px-1 rounded-xl border transition-all active:scale-95"
                    style={{
                      background: selected ? c.bg : '#252532',
                      borderColor: selected ? c.border : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-xs font-bold" style={{ color: selected ? c.text : 'rgba(255,255,255,0.5)' }}>
                      {m.label}
                    </span>
                    <span className="text-white/25 text-xs leading-tight text-center" style={{ fontSize: '9px' }}>
                      {m.description}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* NSFW PIN field */}
            {mode === 'nsfw' && (
              <div className="mt-3 p-3 rounded-xl border border-red-500/20" style={{ background: '#1a0808' }}>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#FCA5A5' }}>
                  NSFW PIN <span className="font-normal text-white/40">(required — share only with your group)</span>
                </label>
                <div className="relative">
                  <input
                    type={showNsfwPin ? 'text' : 'password'}
                    value={nsfwPin}
                    onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setNsfwPin(v); setError(''); }}
                    placeholder="6-digit PIN e.g. 042069"
                    maxLength={6}
                    inputMode="numeric"
                    className="w-full px-4 py-2.5 pr-12 rounded-lg text-white placeholder-white/20 text-sm outline-none border border-red-500/30 focus:border-red-500/60 transition-colors"
                    style={{ background: '#2a1010' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNsfwPin((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-xs"
                  >
                    {showNsfwPin ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-xs text-white/30 mt-1.5">
                  6-digit numbers only. Anyone joining must enter this PIN.
                </p>
              </div>
            )}

            {(mode === 'spicy' || mode === 'mix') && (
              <p className="text-xs mt-2" style={{ color: '#F9A8D4' }}>
                Age confirmation required before creating room.
              </p>
            )}
            {mode === 'nsfw' && (
              <p className="text-xs mt-2" style={{ color: '#FCA5A5' }}>
                21+ confirmation required. All joiners must enter the NSFW PIN.
              </p>
            )}
          </div>

          {/* Room password */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Room password <span className="text-white/30 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Set a password for your room..."
                maxLength={30}
                className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-white/30 text-base outline-none border border-white/10 focus:border-purple-500/60 transition-colors"
                style={{ background: '#252532' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-sm"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-white/30 mt-1.5">
              Share this password only with your friends. They&apos;ll need it to join.
            </p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            onClick={handleCreate}
            disabled={loading || !name.trim() || (mode === 'nsfw' && !/^\d{6}$/.test(nsfwPin.trim()))}
            className="w-full py-3.5 rounded-xl font-semibold text-white text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, ${colors.border}, #4F46E5)` }}
          >
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </div>
      </Modal>

      <AgeGateModal
        isOpen={showAgeGate}
        minAge={mode === 'nsfw' ? 21 : 18}
        onConfirm={() => { setShowAgeGate(false); createRoom(); }}
        onCancel={() => setShowAgeGate(false)}
      />
    </>
  );
}
