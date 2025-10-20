"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getLogo, getCardBackImage } from "../lib/utils/assets";
import { useGameState } from "../hooks/useGameState";
import { GamePhaseType, GameActionType } from "../types/game";
import { preloadCommonSounds } from "../lib/utils/sounds";
import { getPlayerHandValue, getDealerHandValue } from "../lib/utils/cardUtils";
import {
  ChipStack,
  BetDisplay,
  ActionButton,
  ChipButton,
  BalanceDisplay,
  HandDisplay,
  MessageDisplay,
  GameResultModal,
} from "./ui";
import { GameStateSelector } from "./dev/GameStateSelector";
import { SoundTester } from "./dev/SoundTester";
import { DealingAnimation } from "./animations/DealingAnimation";

export default function BlackjackGame() {
  const { gameState, loading, error, sendAction, setGameStateDirectly } =
    useGameState();

  // Calculate hand values
  const playerValue =
    gameState.playerHands.length > 0
      ? getPlayerHandValue(gameState.playerHands[0])
      : 0;
  const dealerValue = getDealerHandValue(gameState.dealerHand);

  // Preload sounds and images on mount
  useEffect(() => {
    preloadCommonSounds();

    // Preload card back image for smooth dealing animation
    const img = new window.Image();
    img.src = getCardBackImage();
  }, []);

  const betChips = [1, 5, 10, 25, 100];

  // Handlers
  const handleBetClick = (amount: number) => {
    sendAction(GameActionType.PLACE_BET, amount);
  };

  const handleStartRound = () => {
    sendAction(GameActionType.START_ROUND);
  };

  const handleClearBet = () => {
    sendAction(GameActionType.CLEAR_BET);
  };

  const handleHit = () => {
    sendAction(GameActionType.HIT);
  };

  const handleStand = () => {
    sendAction(GameActionType.STAND);
  };

  const handleDouble = () => {
    sendAction(GameActionType.DOUBLE);
  };

  const handlePlayAgain = () => {
    sendAction(GameActionType.PLAY_AGAIN);
  };

  const handleStartNewGame = () => {
    sendAction(GameActionType.START_NEW_GAME);
  };

  return (
    <div
      className="h-screen text-white font-['Minecraft'] relative overflow-hidden"
      style={{
        backgroundImage: "url(/assets/images/backgrounds/main-background.webp)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dev Tool - Game State Selector */}
      <GameStateSelector onSelectState={setGameStateDirectly} />

      {/* Dev Tool - Sound Tester */}
      <SoundTester />

      {/* Dealing Animation */}
      <DealingAnimation
        isDealing={gameState.isDealing}
        dealingStep={gameState.dealingStep}
      />

      {/* Deck / History - Top Right */}
      <div className="absolute top-12 right-12">
        <Image
          src="/assets/images/ui/deck.png"
          alt="Deck"
          width={110}
          height={146}
          className="pixelated"
        />
      </div>

      {/* Messages - Absolute Position Top Center */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
        {error && <MessageDisplay message={error} type="error" />}
        {gameState.message && !error && (
          <MessageDisplay message={gameState.message} type="info" />
        )}
      </div>

      {/* Dealer's Hand - Absolute Position Top Center */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2">
        <AnimatePresence mode="wait">
          {gameState.gamePhase !== GamePhaseType.BETTING && (
            <motion.div
              key="dealer-hand"
              initial={{ opacity: 0 }}
              animate={{ opacity: gameState.isDealing ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.2,
                delay: gameState.isDealing ? 0 : 0.15,
              }}
            >
              <HandDisplay
                cards={gameState.dealerHand.cards}
                label="DEALER"
                score={dealerValue}
                showScore={gameState.dealerHand.cards.length > 0}
                hideSecondCard={!gameState.dealerHand.showAllCards}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Betting Area / Chips - Absolute Position Center - Always visible */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-12">
        <div className="text-center">
          {gameState.gamePhase === GamePhaseType.BETTING && (
            <BetDisplay amount={gameState.pendingBet} />
          )}
          <ChipStack chips={gameState.placedChips} />
        </div>
      </div>

      {/* Player's Hand - Absolute Position Below Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-20">
        <AnimatePresence mode="wait">
          {gameState.gamePhase !== GamePhaseType.BETTING &&
            gameState.playerHands.length > 0 && (
              <motion.div
                key="player-hand"
                initial={{ opacity: 0 }}
                animate={{ opacity: gameState.isDealing ? 0 : 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.2,
                  delay: gameState.isDealing ? 0 : 0.15,
                }}
              >
                <HandDisplay
                  cards={gameState.playerHands[0].cards}
                  label="YOU"
                  score={playerValue}
                />
              </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Bottom Section - Controls - Absolute Position Bottom Center */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-5">
        {/* Balance */}
        <BalanceDisplay balance={gameState.balance} />

        {/* Action Buttons */}
        {gameState.gamePhase === GamePhaseType.BETTING ? (
          <div className="flex gap-4">
            <ActionButton
              onClick={handleClearBet}
              disabled={gameState.pendingBet === 0}
              variant="red"
            >
              CLEAR
            </ActionButton>
            <ActionButton
              onClick={handleStartRound}
              disabled={gameState.pendingBet === 0 || loading}
              variant="green"
            >
              {loading ? "DEALING..." : "DEAL"}
            </ActionButton>
          </div>
        ) : gameState.gamePhase === GamePhaseType.PLAYING ? (
          <div className="flex gap-4">
            <ActionButton
              onClick={handleDouble}
              disabled={!gameState.canDouble || loading}
              variant="orange"
            >
              ×2
            </ActionButton>
            <ActionButton
              onClick={handleStand}
              disabled={loading}
              variant="blue"
            >
              STAND
            </ActionButton>
            <ActionButton onClick={handleHit} disabled={loading} variant="red">
              HIT
            </ActionButton>
          </div>
        ) : null}

        {/* Betting Chips */}
        {gameState.gamePhase === GamePhaseType.BETTING && (
          <div className="flex gap-3">
            {betChips.map((value) => (
              <ChipButton
                key={value}
                value={value}
                onClick={() => handleBetClick(value)}
                disabled={value > gameState.balance}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-4 left-4 right-4 flex justify-between items-center">
        {/* Logo */}
        <div className="relative w-12 h-12">
          <Image
            src={getLogo("bluff-b")}
            alt="BluffBets"
            width={48}
            height={48}
            className="pixelated"
          />
        </div>

        {/* Connected Wallet */}
        <div className="text-sm tracking-wider">
          CONNECTED: <span className="text-green-400">0x...1c9F08</span>
        </div>
      </div>

      {/* Game Result Modal */}
      <GameResultModal
        isOpen={gameState.gamePhase === GamePhaseType.FINISHED}
        result={
          gameState.playerHands[0]?.isBusted
            ? "BUST"
            : (gameState.result as "WIN" | "LOSE" | "PUSH") || "LOSE"
        }
        profit={gameState.gameProfit}
        chips={gameState.placedChips}
        onPlayAgain={handlePlayAgain}
        onNewBet={handleStartNewGame}
      />
    </div>
  );
}
