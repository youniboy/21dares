export type CardType = 'truth' | 'dare' | 'double-dare' | 'situation' | 'burning-house';
export type GamePhase = 'rules' | 'counting' | 'card-selection' | 'card-active';
export type GameStatus = 'lobby' | 'playing' | 'ended';
export type CardPhase = 'setup' | 'respond' | 'judge' | 'consequence';
export type Verdict = 'pending' | 'accepted' | 'consequence';
export type GameMode = 'normal' | 'spicy' | 'mix' | 'nsfw';

export const PLAYER_COLORS = [
  '#EF4444',
  '#3B82F6',
  '#10B981',
  '#A855F7',
  '#F59E0B',
  '#EC4899',
  '#14B8A6',
  '#F97316',
] as const;

export interface Player {
  id: string;
  name: string;
  color: string;
  isHost: boolean;
  lastCardType?: CardType | null;
}

export interface ProposedChallenge {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  votes: string[];
  isPreset: boolean;
}

// Shared interaction fields added to every card
export interface CardInteraction {
  cardPhase: CardPhase;
  customChallenge: string;
  respondStartedAt: string | null;
  response: string;
  verdict: Verdict;
  consequence: string;
  consequenceStartedAt: string | null;
  proof: string;
  mediaPath: string | null;
  judgeVotes?: { accept: string[]; reject: string[] };
  proposedChallenges?: ProposedChallenge[];
  setupStartedAt?: string | null;
}

export interface TruthCard extends CardInteraction {
  type: 'truth';
  suggestion: string; // preset suggestion shown to others
}

export interface DareCard extends CardInteraction {
  type: 'dare';
  suggestion: string;
}

export interface DoubleDareCard extends CardInteraction {
  type: 'double-dare';
  suggestion1: string;
  suggestion2: string;
  completed: ('dare1' | 'dare2')[];
}

export interface SituationCard extends CardInteraction {
  type: 'situation';
  suggestion: string;
}

export interface BurningHouseCard extends CardInteraction {
  type: 'burning-house';
  options: [string, string, string];
  names: [string, string, string] | null;
  assignments: Record<string, string> | null;
}

export type GameCard =
  | TruthCard
  | DareCard
  | DoubleDareCard
  | SituationCard
  | BurningHouseCard;

export interface GameState {
  status: GameStatus;
  players: Player[];
  phase: GamePhase;
  countingPlayerIndex: number;
  count: number;
  loserPlayerIndex: number | null;
  currentCard: GameCard | null;
  round: number;
  endVotes: string[];
  mode: GameMode;
  nsfwPinHash?: string | null;
  pendingPlayers?: Player[];
  turnStartedAt?: string | null;
  cardSelectionStartedAt?: string | null;
  usedSuggestions?: string[];
}

export interface Room {
  id: string;
  code: string;
  host_id: string;
  password_hash: string | null;
  game_state: GameState;
  created_at: string;
  updated_at: string;
}
