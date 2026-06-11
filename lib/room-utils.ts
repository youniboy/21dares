import { PLAYER_COLORS } from '@/types/game';

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function assignPlayerColor(existingColors: string[]): string {
  const available = PLAYER_COLORS.filter((c) => !existingColors.includes(c));
  if (available.length > 0) return available[0];
  return PLAYER_COLORS[existingColors.length % PLAYER_COLORS.length];
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts (local IP on mobile)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function getOrCreatePlayerId(): string {
  if (typeof window === 'undefined') return generateUUID();
  const stored = localStorage.getItem('player_id');
  if (stored) return stored;
  const id = generateUUID();
  localStorage.setItem('player_id', id);
  return id;
}
