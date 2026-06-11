'use client';

import type { GameState, CardType, GameCard, BurningHouseCard, DoubleDareCard } from '@/types/game';
import { supabase } from '@/lib/supabase';
import CountingGame from './CountingGame';
import CardSelector from './CardSelector';
import CardSetup from './CardSetup';
import CardRespond from './CardRespond';
import CardJudge from './CardJudge';
import CardConsequence from './CardConsequence';
import GameRules from './GameRules';
import BurningHouseCardComponent from '@/components/cards/BurningHouseCard';
import {
  getRandomTruth,
  getRandomDare,
  getRandomDoubleDare,
  getRandomSituation,
  getRandomBurningHouse,
} from '@/lib/game-content';

interface Props {
  gameState: GameState;
  myPlayerId: string;
  onUpdateGameState: (updates: Partial<GameState>) => void;
}

export default function GameBoard({ gameState, myPlayerId, onUpdateGameState }: Props) {
  const { phase, count, countingPlayerIndex, loserPlayerIndex, currentCard, players } = gameState;
  const mode = gameState.mode ?? 'normal';
  const loser = loserPlayerIndex !== null ? players[loserPlayerIndex] : null;
  const isLoser = loser?.id === myPlayerId;

  function patchCard(updates: Partial<GameCard>) {
    onUpdateGameState({ currentCard: { ...currentCard!, ...updates } as GameCard });
  }

  // ── Counting phase ───────────────────────────────────────────────────────
  function handleAdvance(by: 1 | 2 | 3) {
    const newCount = count + by;
    const nextIndex = (countingPlayerIndex + 1) % players.length;
    if (newCount === 21) {
      onUpdateGameState({ count: newCount, loserPlayerIndex: countingPlayerIndex, phase: 'card-selection' });
    } else {
      onUpdateGameState({ count: newCount, countingPlayerIndex: nextIndex });
    }
  }

  // ── Loser picks card type ────────────────────────────────────────────────
  function handleCardTypeSelected(type: CardType) {
    let card: GameCard;
    switch (type) {
      case 'truth':         card = getRandomTruth(mode); break;
      case 'dare':          card = getRandomDare(mode); break;
      case 'double-dare':   card = getRandomDoubleDare(mode); break;
      case 'situation':     card = getRandomSituation(mode); break;
      case 'burning-house': card = getRandomBurningHouse(mode); break;
    }
    onUpdateGameState({ phase: 'card-active', currentCard: card });
  }

  // ── Others send the challenge ────────────────────────────────────────────
  function handleSendChallenge(challenge: string) {
    patchCard({
      customChallenge: challenge,
      cardPhase: 'respond',
      respondStartedAt: new Date().toISOString(),
    });
  }

  // ── Delete dare media from storage (fire-and-forget) ────────────────────
  function cleanupMedia(card?: GameCard | null) {
    const path = (card ?? currentCard)?.mediaPath;
    if (path) supabase.storage.from('dare-responses').remove([path]);
  }

  // ── Loser submits their response ─────────────────────────────────────────
  function handleSubmitResponse(response: string, mediaPath?: string) {
    patchCard({ response, cardPhase: 'judge', ...(mediaPath ? { mediaPath } : {}) });
  }

  // ── Timer ran out — loser is kicked for not being a sport ───────────────
  function handleTimeUp() {
    if (currentCard?.cardPhase !== 'respond') return;
    if (!loser) return;

    cleanupMedia();
    const updatedPlayers = players.filter((p) => p.id !== loser.id);

    if (updatedPlayers.length === 0) {
      onUpdateGameState({ status: 'ended', currentCard: null, loserPlayerIndex: null });
      return;
    }

    const nextIndex = Math.min(loserPlayerIndex ?? 0, updatedPlayers.length - 1);
    onUpdateGameState({
      players: updatedPlayers,
      loserPlayerIndex: null,
      countingPlayerIndex: nextIndex,
      currentCard: {
        ...currentCard!,
        cardPhase: 'judge',
        verdict: 'consequence',
        consequence: `${loser.name} ran out of time and was removed from the room for not being a sport. 👋`,
      } as GameCard,
    });
  }

  // ── Others judge ─────────────────────────────────────────────────────────
  function handleAccept() {
    cleanupMedia();
    patchCard({ verdict: 'accepted', cardPhase: 'consequence', consequenceStartedAt: new Date().toISOString() });
  }

  function handleSetConsequence(consequence: string) {
    cleanupMedia();
    patchCard({ verdict: 'consequence', consequence, cardPhase: 'consequence', consequenceStartedAt: new Date().toISOString() });
  }

  // ── Rules acknowledged ───────────────────────────────────────────────────
  function handleRulesAcknowledged() {
    onUpdateGameState({ phase: 'counting' });
  }

  // ── Proof submitted by loser ─────────────────────────────────────────────
  function handleSubmitProof(proof: string) {
    patchCard({ proof });
  }

  // ── Proof timer expired or group rejects proof — kick loser ──────────────
  function handleKickLoser() {
    if (!loser) return;
    cleanupMedia();
    const updatedPlayers = players.filter((p) => p.id !== loser.id);
    if (updatedPlayers.length === 0) {
      onUpdateGameState({ status: 'ended', currentCard: null, loserPlayerIndex: null });
      return;
    }
    const nextIndex = Math.min(loserPlayerIndex ?? 0, updatedPlayers.length - 1);
    onUpdateGameState({
      players: updatedPlayers,
      loserPlayerIndex: null,
      countingPlayerIndex: nextIndex,
      currentCard: null,
      phase: 'counting',
      count: 0,
      round: gameState.round + 1,
    });
  }

  // ── End round ────────────────────────────────────────────────────────────
  function handleNextRound() {
    cleanupMedia();
    const nextCountingIndex = loserPlayerIndex ?? 0;
    onUpdateGameState({
      phase: 'counting',
      count: 0,
      countingPlayerIndex: nextCountingIndex,
      loserPlayerIndex: null,
      currentCard: null,
      round: gameState.round + 1,
    });
  }

  // ── Burning House updates ─────────────────────────────────────────────────
  function handleBurningHouseUpdate(names: [string, string, string], assignments: Record<string, string>) {
    if (currentCard?.type !== 'burning-house') return;
    const namesSubmitted = names.every((n) => n.length > 0);
    patchCard({
      ...(currentCard as BurningHouseCard),
      names,
      assignments,
      // Move to respond phase once names are submitted
      ...(namesSubmitted && !currentCard.names ? { cardPhase: 'respond' } : {}),
    });
  }

  function handleBurningHouseReveal() {
    patchCard({ cardPhase: 'judge' });
  }

  // ── Routing ───────────────────────────────────────────────────────────────

  if (phase === 'rules') {
    return <GameRules mode={mode} onReady={handleRulesAcknowledged} />;
  }

  if (phase === 'counting') {
    return <CountingGame gameState={gameState} myPlayerId={myPlayerId} onAdvance={handleAdvance} />;
  }

  if (phase === 'card-selection' && loser) {
    return <CardSelector loser={loser} myPlayerId={myPlayerId} onSelect={handleCardTypeSelected} />;
  }

  if (phase === 'card-active' && currentCard && loser) {
    const { cardPhase, verdict } = currentCard;

    // Burning House has its own setup + respond UI
    if (currentCard.type === 'burning-house') {
      if (cardPhase === 'setup' || cardPhase === 'respond') {
        return (
          <BurningHouseCardComponent
            card={currentCard as BurningHouseCard}
            loserName={loser.name}
            isLoser={isLoser}
            onUpdate={handleBurningHouseUpdate}
            onReveal={handleBurningHouseReveal}
          />
        );
      }
    }

    // Generic card phases
    if (cardPhase === 'setup') {
      return (
        <CardSetup
          card={currentCard}
          loserName={loser.name}
          isLoser={isLoser}
          onSendChallenge={handleSendChallenge}
        />
      );
    }

    if (cardPhase === 'respond') {
      return (
        <CardRespond
          card={currentCard}
          loserName={loser.name}
          isLoser={isLoser}
          onSubmitResponse={handleSubmitResponse}
          onTimeUp={handleTimeUp}
        />
      );
    }

    if (cardPhase === 'judge') {
      const timedOut = verdict === 'consequence' && !currentCard.consequence;
      return (
        <CardJudge
          card={currentCard}
          loserName={loser.name}
          isLoser={isLoser}
          timedOut={timedOut}
          onAccept={handleAccept}
          onSetConsequence={handleSetConsequence}
        />
      );
    }

    if (cardPhase === 'consequence') {
      if (verdict === 'accepted') {
        return (
          <div className="flex flex-col min-h-svh px-4 py-8 items-center justify-center">
            <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
              <div className="text-5xl">✅</div>
              <div>
                <p className="text-white font-bold text-2xl">Accepted!</p>
                <p className="text-white/50 text-sm mt-2">
                  {isLoser ? 'The group accepted your answer.' : `${loser.name}'s answer was accepted.`}
                </p>
              </div>
              {!isLoser && (
                <button
                  onClick={handleNextRound}
                  className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95"
                  style={{ background: '#059669' }}
                >
                  Next Round
                </button>
              )}
              {isLoser && (
                <p className="text-white/30 text-sm">Waiting for the group to start the next round...</p>
              )}
            </div>
          </div>
        );
      }

      return (
        <CardConsequence
          card={currentCard}
          loserName={loser.name}
          isLoser={isLoser}
          onSubmitProof={handleSubmitProof}
          onNextRound={handleNextRound}
          onKickLoser={handleKickLoser}
          onProofTimeUp={handleKickLoser}
        />
      );
    }
  }

  return null;
}
