'use client';

import { useState } from 'react';
import type { GameState, Player } from '@/types/game';

interface Props {
  gameState: GameState;
  myPlayerId: string;
  roomCode: string;
  onStartGame: () => void;
  onLeave: () => void;
  roomPassword?: string;
  roomNsfwPin?: string;
}

export default function Lobby({ gameState, myPlayerId, roomCode, onStartGame, onLeave, roomPassword, roomNsfwPin }: Props) {
  const [copied, setCopied] = useState(false);
  const isHost = gameState.players.find((p) => p.id === myPlayerId)?.isHost;
  const canStart = gameState.players.length >= 2;

  async function copyCode() {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function copyLink() {
    const url = `${window.location.origin}/room/${roomCode}`;
    const lines = [`🎮 Join my 21 Dares room!`, `Link: ${url}`];
    if (roomPassword) lines.push(`Password: ${roomPassword}`);
    if (roomNsfwPin) lines.push(`NSFW PIN: ${roomNsfwPin}`);
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const mode = gameState.mode ?? 'normal';
  const modeMeta = {
    normal: { icon: '🎭', label: 'Normal', color: '#A78BFA', bg: '#1e1b4b' },
    spicy:  { icon: '🔥', label: 'Spicy',  color: '#F472B6', bg: '#1f0f14' },
    mix:    { icon: '🌀', label: 'Mix',     color: '#C084FC', bg: '#1a1430' },
    nsfw:   { icon: '🔞', label: 'NSFW',   color: '#FCA5A5', bg: '#1a0808' },
  }[mode] ?? { icon: '🎭', label: 'Normal', color: '#A78BFA', bg: '#1e1b4b' };

  return (
    <div className="flex flex-col min-h-svh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Room code */}
        <div className="rounded-2xl p-5 border border-white/10 text-center" style={{ background: '#1a1a24' }}>
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-2">Room Code</p>
          <div className="text-4xl font-black tracking-[0.2em] text-white mb-3">{roomCode}</div>
          <div className="flex justify-center mb-4">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: modeMeta.bg, color: modeMeta.color }}
            >
              {modeMeta.icon} {modeMeta.label} Mode
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyCode}
              className="flex-1 py-2 rounded-xl text-sm font-semibold border border-white/15 text-white/70 hover:text-white transition-colors"
              style={{ background: '#252532' }}
            >
              {copied ? '✓ Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={copyLink}
              className="flex-1 py-2 rounded-xl text-sm font-semibold border border-white/15 text-white/70 hover:text-white transition-colors"
              style={{ background: '#252532' }}
            >
              Copy Link
            </button>
          </div>
        </div>

        {/* Players */}
        <div className="rounded-2xl p-5 border border-white/10" style={{ background: '#1a1a24' }}>
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-3">
            Players ({gameState.players.length})
          </p>
          <div className="space-y-2">
            {gameState.players.map((player: Player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 py-2 px-3 rounded-xl"
                style={{ background: '#252532' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: player.color }}
                >
                  {player.name[0].toUpperCase()}
                </div>
                <span className="text-white font-medium text-sm flex-1">{player.name}</span>
                <div className="flex items-center gap-1">
                  {player.id === myPlayerId && (
                    <span className="text-xs text-white/40 px-1.5 py-0.5 rounded-md" style={{ background: '#1a1a24' }}>
                      You
                    </span>
                  )}
                  {player.isHost && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold" style={{ background: '#7C3AED22', color: '#A78BFA' }}>
                      Host
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {!canStart && (
            <p className="text-xs text-white/30 mt-3 text-center">
              Waiting for at least 2 players to join...
            </p>
          )}
        </div>

        {/* Start game */}
        {isHost ? (
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: canStart ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' : '#252532' }}
          >
            {canStart ? 'Start Game' : `Need ${2 - gameState.players.length} more player${2 - gameState.players.length === 1 ? '' : 's'}`}
          </button>
        ) : (
          <div className="text-center py-4 text-white/40 text-sm">
            Waiting for the host to start the game...
          </div>
        )}

        <button
          onClick={onLeave}
          className="w-full py-3 rounded-2xl font-semibold text-white/40 text-sm border border-white/8 transition-all active:scale-95"
          style={{ background: 'transparent' }}
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}
