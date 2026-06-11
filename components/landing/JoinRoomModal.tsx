'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import { getOrCreatePlayerId } from '@/lib/room-utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prefillCode?: string;
}

export default function JoinRoomModal({ isOpen, onClose, prefillCode }: Props) {
  const [code, setCode] = useState(prefillCode || '');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [nsfwPin, setNsfwPin] = useState('');
  const [showNsfwPin, setShowNsfwPin] = useState(false);
  const [needsNsfwPin, setNeedsNsfwPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleJoin() {
    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();
    if (!trimmedCode || trimmedCode.length !== 6) { setError('Enter a valid 6-character room code.'); return; }
    if (!trimmedName) { setError('Enter your name to continue.'); return; }

    setLoading(true);
    setError('');
    try {
      const playerId = getOrCreatePlayerId();
      const res = await fetch(`/api/rooms/${trimmedCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: trimmedName,
          playerId,
          password: password.trim() || undefined,
          nsfwPin: nsfwPin.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.requiresPassword) {
          setNeedsPassword(true);
          setError(password ? 'Wrong password. Try again.' : 'This room requires a password.');
          setLoading(false);
          return;
        }
        if (data.requiresNsfwPin) {
          setNeedsNsfwPin(true);
          setError(nsfwPin ? 'Wrong NSFW PIN. Try again.' : 'This room requires the NSFW PIN.');
          setLoading(false);
          return;
        }
        throw new Error(data.error || 'Failed to join room');
      }
      router.push(`/room/${trimmedCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join a Room">
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-white/60 mb-2">Room code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase().slice(0, 6)); setError(''); }}
            placeholder="e.g. AB1C2D"
            maxLength={6}
            autoFocus={!prefillCode}
            className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 text-base font-mono tracking-widest outline-none border border-white/10 focus:border-pink-500/60 transition-colors uppercase"
            style={{ background: '#252532' }}
          />
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-2">Your name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            placeholder="Enter your name..."
            maxLength={20}
            autoFocus={!!prefillCode}
            className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 text-base outline-none border border-white/10 focus:border-pink-500/60 transition-colors"
            style={{ background: '#252532' }}
          />
        </div>

        {/* Room password — shown after first failed attempt */}
        {needsPassword && (
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Room password
              <span className="text-pink-400 ml-1 text-xs">required</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="Enter room password..."
                maxLength={30}
                autoFocus
                className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-white/30 text-base outline-none border border-pink-500/40 focus:border-pink-500/70 transition-colors"
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
          </div>
        )}

        {/* NSFW PIN — shown after first failed attempt on NSFW room */}
        {needsNsfwPin && (
          <div className="p-3 rounded-xl border border-red-500/25" style={{ background: '#1a0808' }}>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#FCA5A5' }}>
              NSFW PIN
              <span className="font-normal text-white/40 ml-1">(required for this room)</span>
            </label>
            <div className="relative">
              <input
                type={showNsfwPin ? 'text' : 'password'}
                value={nsfwPin}
                onChange={(e) => { setNsfwPin(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="Enter NSFW PIN..."
                maxLength={20}
                autoFocus
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
              This is an NSFW room. By entering the PIN you confirm you are 21+.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={handleJoin}
          disabled={loading || !code.trim() || !name.trim()}
          className="w-full py-3.5 rounded-xl font-semibold text-white text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #BE185D, #DC2626)' }}
        >
          {loading ? 'Joining...' : 'Join Room'}
        </button>
      </div>
    </Modal>
  );
}
