'use client';

import { useState } from 'react';
import Modal from './Modal';

interface Props {
  isOpen: boolean;
  minAge: 18 | 21;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AgeGateModal({ isOpen, minAge, onConfirm, onCancel }: Props) {
  const [confirmed, setConfirmed] = useState(false);

  const isNsfw = minAge === 21;

  function handleConfirm() {
    if (!confirmed) return;
    setConfirmed(false);
    onConfirm();
  }

  function handleCancel() {
    setConfirmed(false);
    onCancel();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={isNsfw ? 'Explicit Content' : 'Adults Only'}>
      <div className="space-y-5">
        <div
          className="rounded-2xl px-5 py-4 text-center border"
          style={{
            background: isNsfw ? '#1a0a0f' : '#1f1020',
            borderColor: isNsfw ? 'rgba(239,68,68,0.3)' : 'rgba(190,24,93,0.2)',
          }}
        >
          <div className="text-4xl mb-2">{isNsfw ? '🔞' : '🔞'}</div>
          <p className="text-white font-semibold text-base">
            {isNsfw ? 'NSFW Mode — 21+ Only' : 'Spicy / Mix Mode — 18+'}
          </p>
          <p className="text-white/50 text-sm mt-1 leading-relaxed">
            {isNsfw
              ? 'This mode contains explicit sexual content intended for consenting adults aged 21 and over. Intended for couples or adult party settings.'
              : 'This mode contains adult content intended for players aged 18 and over.'}
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer select-none">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              className="sr-only"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <div
              className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors"
              style={{
                borderColor: confirmed ? (isNsfw ? '#EF4444' : '#EC4899') : 'rgba(255,255,255,0.2)',
                background: confirmed ? (isNsfw ? '#EF4444' : '#EC4899') : 'transparent',
              }}
            >
              {confirmed && (
                <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                  <path d="M1 4.5L4.5 8L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-white/70 text-sm leading-relaxed">
            {isNsfw
              ? 'I confirm that all players are 21 or older and consent to explicit adult content.'
              : 'I confirm that all players in this room are 18 years of age or older.'}
          </span>
        </label>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 py-3 rounded-xl font-semibold text-white/50 text-sm border border-white/10 transition-all active:scale-95"
            style={{ background: '#252532' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!confirmed}
            className="flex-1 py-3 rounded-xl font-semibold text-white text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: confirmed
                ? isNsfw
                  ? 'linear-gradient(135deg, #DC2626, #7C3AED)'
                  : 'linear-gradient(135deg, #BE185D, #9333EA)'
                : '#252532',
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
}
