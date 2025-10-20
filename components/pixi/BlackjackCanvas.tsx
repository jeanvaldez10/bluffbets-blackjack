/**
 * PixiJS Blackjack Game Canvas
 * Main canvas component that renders the entire blackjack game
 */

"use client";

import { Application, extend } from "@pixi/react";
import { useEffect, useState, useMemo, useRef } from "react";
import { Container, Sprite, Text, Graphics, TextStyle } from "pixi.js";
import { HandSprite } from "./HandSprite";
import { ChipStack } from "./ChipSprite";
import { ChipSplash, Confetti } from "./ParticleEffects";
import { ButtonSprite } from "./ButtonSprite";
import {
  BalanceDisplay,
  ChipButton,
  WalletDisplay,
  PixelatedContainer,
  PixiSquareContainer,
  PixiDrawContainer,
} from "./UIComponents";
import { DealingAnimationSprite } from "./DealingAnimationSprite";
import { ResultModal } from "./ResultModal";
import {
  GameState,
  GamePhaseType,
  GameActionType,
  HandResultType,
} from "@/types/game";
import {
  preloadGameAssets,
  areAssetsLoaded,
  getUITexture,
  getBackgroundTexture,
  getMobileBackgroundTexture,
} from "@/lib/utils/pixiAssets";
import { getPlayerHandValue, getDealerHandValue } from "@/lib/utils/cardUtils";
import TrollBox from "./trollBox";
import ShuffleModal from "./shuffleModal";
import PairSprite from "./pairSprite";

// Extend PixiJS components for use in JSX
extend({ Container, Sprite, Text, Graphics });

// Create TextStyles ONCE outside component (best practice)
const STYLES = {
  message: new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: 24,
    fill: "#ffffff",
    align: "center",
    stroke: { color: "#000000", width: 4 },
    letterSpacing: 2,
  }),
  bet: new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: 12,
    fill: "#ffffff",
    align: "center",
    letterSpacing: 1,
  }),
};

const DEBUG = process.env.NODE_ENV === "development";

interface BlackjackCanvasProps {
  gameState: GameState;
  width: number;
  height: number;
  onAction?: (action: GameActionType, amount?: number) => void;
  loading?: boolean;
  error?: string | null;
  isMobile?: boolean;
  onReady?: () => void;
}
const chipValues = [1, 5, 10, 25, 100];
export function BlackjackCanvas({
  gameState,
  width,
  height,
  onAction,
  loading = false,
  error = null,
  isMobile = false,
  onReady,
}: BlackjackCanvasProps) {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [showWinParticles, setShowWinParticles] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [modalOpen, setModalOpen] = useState(true);
  const [shuffleModalOpen, setShuffleModalOpen] = useState(true);

  // Container ref must be declared before any early return so hook order stays consistent
  const appContainerRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<Container>(null);
  const [chipBounds, setChipBounds] = useState<{
    width: number;
    height: number;
  }>({ width: 66, height: 0 });
  useEffect(() => {
    if (chipRef.current) {
      const b = chipRef.current.getLocalBounds();
      setChipBounds({ width: b.width, height: b.height });
    }
  }, [gameState.placedChips.length]);
  // Preload assets
  useEffect(() => {
    if (!areAssetsLoaded()) {
      preloadGameAssets()
        .then(() => {
          setAssetsLoaded(true);
          // Wait for multiple frames to ensure canvas is fully rendered
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setTimeout(() => setCanvasReady(true), 50);
            });
          });
        })
        .catch((error) => {
          console.error("Failed to load assets:", error);
        });
    } else {
      setAssetsLoaded(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => setCanvasReady(true), 50);
        });
      });
    }
  }, []);

  // Notify parent once when both assets and canvas are ready
  const hasNotifiedRef = useRef(false);
  useEffect(() => {
    if (!hasNotifiedRef.current && assetsLoaded && canvasReady) {
      hasNotifiedRef.current = true;
      onReady?.();
    }
  }, [assetsLoaded, canvasReady, onReady]);

  // Show particles on win
  useEffect(() => {
    if (
      gameState.gamePhase === GamePhaseType.FINISHED &&
      gameState.result === "WIN"
    ) {
      setShowWinParticles(true);
      if (gameState.gameProfit > 100) {
        setShowConfetti(true);
      }
    } else {
      setShowWinParticles(false);
      setShowConfetti(false);
    }
  }, [gameState.gamePhase, gameState.result, gameState.gameProfit]);

  // Reset modal open state when game finishes
  useEffect(() => {
    if (gameState.gamePhase === GamePhaseType.FINISHED) {
      setModalOpen(true);
    }
  }, [gameState.gamePhase]);

  // Calculate positions based on canvas size - matching original design
  const positions = useMemo(() => {
    const centerX = width / 2;
    const centerY = height / 2;
    if (isMobile) {
      return {
        dealer: { x: centerX, y: 65 }, // Slightly higher
        player: { x: centerX, y: centerY - 50 }, // Closer to center for better spacing
        chips: { x: centerX, y: centerY + 80 }, // Higher - better spacing
        deck: { x: width - 65, y: 40 }, // Top right corner for mobile, slightly smaller
        betDisplay: { x: centerX, y: centerY + 25 }, // Higher - more even spacing
        buttons: { y: height - 130 },
        buttonSpacing: 200,
        balance: { x: centerX, y: height - 175 },
        chipButtons: { y: height - 70 },
        wallet: { x: 10, y: 20 }, // Top left for mobile
        trollbox: { x: centerX, y: 20 }, // Will be hidden on mobile
        pair: { x: centerX, y: centerY + 55 }, // Pair position closer to chips
      };
    }

    return {
      dealer: { x: centerX, y: 85 }, // Higher up
      player: { x: centerX, y: centerY - 70 }, // Moved up for gap with balance
      chips: { x: centerX, y: centerY + 135 }, // Closer to bet display
      deck: { x: width - 90, y: 110 }, // Top right, closer to edge
      betDisplay: { x: centerX, y: centerY + 85 }, // Moved higher
      buttons: { y: height - 120 }, // Slightly higher
      buttonSpacing: 200, // Space between buttons
      balance: { x: centerX, y: height - 165 }, // Closer to buttons
      chipButtons: { y: height - 50 }, // Chip selection buttons (always visible)
      wallet: { x: width - 190, y: height - 30 }, // Wallet address (right-aligned)
      trollbox: { x: 100, y: height - 30 }, // Trollbox
      pair: { x: centerX, y: centerY + 115 }, // Pair position closer to chips
    };
  }, [width, height, isMobile]);

  // Calculate hand values
  const playerHandValues = useMemo(
    () => gameState.playerHands.map((hand) => getPlayerHandValue(hand)),
    [gameState.playerHands]
  );
  const dealerValue = getDealerHandValue(gameState.dealerHand);
  const playerHandPositions = useMemo(() => {
    const count = gameState.playerHands.length;
    if (count === 0) {
      return [];
    }
    const spacing = isMobile ? 140 : 220;
    const baseX = positions.player.x;
    const baseY = positions.player.y;
    if (count === 1) {
      return [{ x: baseX, y: baseY }];
    }
    const totalWidth = spacing * (count - 1);
    const startX = baseX - totalWidth / 2;
    const handPositions = gameState.playerHands.map((hand, index) => {
      let positionX = startX + index * spacing;

      if (hand.cards.length > 2) {
        if (index === 0) {
          positionX -= 50 * hand.cards.length - totalWidth / 2;
        } else if (index === 1) {
          positionX += 50 * hand.cards.length - totalWidth / 2;
        }
      }

      return positionX;
    });
    return gameState.playerHands.map((_, index) => ({
      x: handPositions[index],
      y: baseY,
    }));
  }, [gameState.playerHands, positions.player.x, positions.player.y, isMobile]);
  const activeHandIndex = gameState.currentHandIndex ?? 0;
  const basePlayerSpacing = isMobile ? 60 : 90;
  const baseDealerSpacing = isMobile ? 60 : 90;
  const playerDealSlots = useMemo(
    () => [
      {
        x: positions.player.x - basePlayerSpacing / 2,
        y: positions.player.y,
      },
      {
        x: positions.player.x + basePlayerSpacing / 2,
        y: positions.player.y,
      },
    ],
    [positions.player.x, positions.player.y, basePlayerSpacing]
  );
  const dealerDealSlots = useMemo(
    () => [
      {
        x: positions.dealer.x - baseDealerSpacing / 2,
        y: positions.dealer.y,
      },
      {
        x: positions.dealer.x + baseDealerSpacing / 2,
        y: positions.dealer.y,
      },
    ],
    [positions.dealer.x, positions.dealer.y, baseDealerSpacing]
  );

  if (!assetsLoaded || !canvasReady) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: "#478269", // Match the felt table green
        }}
      >
        <div className="text-white text-2xl font-['Minecraft']">
          Loading Game Assets...
        </div>
      </div>
    );
  }

  return (
    <div ref={appContainerRef} style={{ width: "100%", height: "100%" }}>
      <Application
        width={width}
        height={height}
        backgroundAlpha={0}
        backgroundColor={0x478269}
        antialias={true}
        autoDensity={true}
        // Use devicePixelRatio for crisp rendering (capped for perf)
        resolution={
          typeof window !== "undefined"
            ? Math.min(window.devicePixelRatio || 1, 2)
            : 1
        }
        powerPreference="high-performance"
        hello={false}
        // Automatically resize renderer to this element's client size
        resizeTo={appContainerRef}
      >
        {/* Background - Full screen sprite - RENDER FIRST */}
        <pixiSprite
          texture={
            isMobile ? getMobileBackgroundTexture() : getBackgroundTexture()
          }
          x={0}
          y={0}
          width={width}
          height={height}
          anchor={0}
        />

        {/* Deck */}
        <pixiSprite
          texture={getUITexture("deck")}
          x={positions.deck.x}
          y={positions.deck.y}
          anchor={0.5}
          scale={isMobile ? 0.08 : 0.19}
        />

        {/* Dealing Animation - Renders on top of deck */}
        {gameState.isDealing && (
          <DealingAnimationSprite
            isDealing={gameState.isDealing}
            dealingStep={gameState.dealingStep}
            deckX={positions.deck.x}
            deckY={positions.deck.y}
            dealerY={positions.dealer.y}
            playerY={positions.player.y}
            centerX={width / 2}
            isMobile={isMobile}
            playerCards={gameState.playerHands[0]?.cards ?? []}
            dealerCards={gameState.dealerHand.cards ?? []}
            playerCardSlots={playerDealSlots}
            dealerCardSlots={dealerDealSlots}
          />
        )}

        {/* Dealer's Hand - Hide during initial deal until dealer cards are placed */}
        {gameState.gamePhase !== GamePhaseType.BETTING &&
          gameState.dealerHand.cards.length > 0 &&
          (!gameState.isDealing || gameState.dealingStep > 4) && (
            <HandSprite
              cards={gameState.dealerHand.cards}
              x={positions.dealer.x}
              y={positions.dealer.y}
              label="DEALER"
              score={dealerValue}
              showScore={gameState.dealerHand.cards.length > 0}
              hideSecondCard={!gameState.dealerHand.showAllCards}
              animateIn={false}
              scale={isMobile ? 0.08 : 0.12}
              cardSpacing={isMobile ? 60 : 90}
              isMobile={isMobile}
            />
          )}

        {/* Betting Display - visible through all states */}
        {((gameState.gamePhase === GamePhaseType.BETTING &&
          gameState.pendingBet > 0) ||
          (gameState.gamePhase !== GamePhaseType.BETTING &&
            gameState.initialBet > 0)) &&
          (() => {
            const betAmount =
              gameState.gamePhase === GamePhaseType.BETTING
                ? gameState.pendingBet
                : gameState.initialBet;
            const text = `BET: $${betAmount}`;
            const width = Math.max(text.length * 8 + 20, 100);
            const height = 28;

            return (
              <PixiDrawContainer
                width={width}
                height={height}
                x={positions.betDisplay.x}
                y={positions.betDisplay.y}
              >
                <pixiText
                  text={text}
                  anchor={0.5}
                  x={0}
                  y={0}
                  style={STYLES.bet}
                />
              </PixiDrawContainer>
            );
          })()}
        {/* Pair and 21+3 Display - visible through all states */}
        {gameState.placedChips.length > 0 &&
          ((gameState.gamePhase === GamePhaseType.BETTING &&
            gameState.pendingBet > 0) ||
            (gameState.gamePhase !== GamePhaseType.BETTING &&
              gameState.initialBet > 0)) && (
            <PairSprite
              x={positions.chips.x - chipBounds.width / 2 - 40}
              y={positions.pair.y}
              text="PAIR"
              position="left"
            />
          )}
        {gameState.placedChips.length > 0 &&
          ((gameState.gamePhase === GamePhaseType.BETTING &&
            gameState.pendingBet > 0) ||
            (gameState.gamePhase !== GamePhaseType.BETTING &&
              gameState.initialBet > 0)) && (
            <PairSprite
              x={positions.chips.x + chipBounds.width / 2 + 20}
              y={positions.pair.y}
              text="21+3"
              position="right"
            />
          )}
        {/* Chips - Always visible in center like original */}
        {gameState.placedChips.length > 0 && (
          <ChipStack
            chips={gameState.placedChips}
            x={positions.chips.x}
            y={positions.chips.y}
            scale={0.1}
            animateIn={false}
            ref={chipRef}
          />
        )}
        {/* Player Hands - Hide during initial dealing, but show during hit animations */}
        {gameState.gamePhase !== GamePhaseType.BETTING &&
          gameState.playerHands.length > 0 &&
          (!gameState.isDealing || gameState.dealingStep > 4) &&
          gameState.playerHands.map((hand, index) => {
            const baseCardSpacing = isMobile ? 60 : 90;
            const position = playerHandPositions[index] ?? positions.player;
            const label =
              gameState.playerHands.length > 1 ? `HAND ${index + 1}` : "YOU";
            const isActive =
              gameState.gamePhase === GamePhaseType.PLAYING &&
              index === activeHandIndex &&
              !hand.isBusted &&
              !hand.isSurrendered;

            let status: string | undefined;
            if (hand.isBusted) {
              status = "BUST";
            } else if (hand.isSurrendered) {
              status = "SURRENDER";
            } else if (hand.isBlackjack && hand.cards.length === 2) {
              status = "BLACKJACK";
            } else if (
              hand.isStanding &&
              (gameState.gamePhase !== GamePhaseType.PLAYING ||
                index !== activeHandIndex)
            ) {
              status = "STAND";
            }

            if (gameState.gamePhase === GamePhaseType.FINISHED) {
              const result = gameState.handResults.find(
                (entry) => entry.handIndex === index
              );
              if (result && (!status || status === "STAND")) {
                if (result.result === HandResultType.WIN) {
                  status = `WIN +$${result.profit}`;
                } else if (result.result === HandResultType.LOSE) {
                  status = "LOSE";
                } else if (result.result === HandResultType.PUSH) {
                  status = "PUSH";
                } else if (result.result === HandResultType.BLACKJACK) {
                  status = "BLACKJACK";
                } else if (result.result === HandResultType.SURRENDER) {
                  status = "SURRENDER";
                }
              }
            }

            const cardSpacing =
              gameState.playerHands.length > 2
                ? isMobile
                  ? 50
                  : baseCardSpacing
                : isMobile
                ? 60
                : baseCardSpacing;
            return (
              <HandSprite
                key={`player-hand-${index}`}
                cards={hand.cards}
                x={position.x}
                y={position.y}
                label={label}
                score={playerHandValues[index]}
                showScore
                // hideLastCard={gameState.isDealing && gameState.dealingStep > 4}
                hideLastCard={false}
                animateIn={false}
                scale={isMobile ? 0.08 : 0.12}
                cardSpacing={cardSpacing}
                isMobile={isMobile}
                isActive={isActive}
                status={status}
                canSplit={gameState.canSplit && index === activeHandIndex}
                onSplit={() => onAction?.(GameActionType.SPLIT)}
              />
            );
          })}

        {/* Particle Effects */}
        {showWinParticles && (
          <ChipSplash
            x={positions.chips.x}
            y={positions.chips.y}
            active={showWinParticles}
          />
        )}

        {showConfetti && <Confetti active={showConfetti} canvasWidth={width} />}

        {/* Balance Display */}
        {/* <BalanceDisplay
          balance={gameState.balance}
          x={positions.balance.x}
          y={positions.balance.y}
        /> */}

        {/* Action Buttons - BETTING PHASE */}
        {gameState.gamePhase === GamePhaseType.BETTING && (
          <>
            <ButtonSprite
              text="CLEAR"
              x={isMobile ? width / 2 - 65 : width / 2 - 75}
              y={positions.buttons.y}
              width={isMobile ? 100 : 120}
              height={isMobile ? 36 : 42}
              color="orange"
              disabled={gameState.pendingBet === 0}
              onClick={() => onAction?.(GameActionType.CLEAR_BET)}
              fontSize={isMobile ? 12 : 20}
            />
            <ButtonSprite
              text={loading ? "DEALING..." : "PLACE BET"}
              x={isMobile ? width / 2 + 65 : width / 2 + 75}
              y={positions.buttons.y}
              width={isMobile ? 100 : 120}
              height={isMobile ? 36 : 42}
              color="red"
              disabled={gameState.pendingBet === 0 || loading}
              onClick={() => onAction?.(GameActionType.START_ROUND)}
              fontSize={isMobile ? 10 : 20}
            />
          </>
        )}

        {/* Action Buttons - PLAYING PHASE */}
        {gameState.gamePhase === GamePhaseType.PLAYING && (
          <>
            {/* Always show 3 buttons - split is now on the cards themselves */}
            <ButtonSprite
              text="×2"
              x={isMobile ? width / 2 - 115 : width / 2 - 138}
              y={positions.buttons.y}
              width={isMobile ? 85 : 100}
              height={isMobile ? 36 : 42}
              color="orange"
              disabled={!gameState.canDouble || loading}
              onClick={() => onAction?.(GameActionType.DOUBLE)}
              fontSize={isMobile ? 12 : 24}
            />
            <ButtonSprite
              text="STAND"
              x={width / 2}
              y={positions.buttons.y}
              width={isMobile ? 85 : 100}
              height={isMobile ? 36 : 42}
              color="blue"
              disabled={loading}
              onClick={() => onAction?.(GameActionType.STAND)}
              fontSize={isMobile ? 12 : 24}
            />
            <ButtonSprite
              text="HIT"
              x={isMobile ? width / 2 + 115 : width / 2 + 138}
              y={positions.buttons.y}
              width={isMobile ? 85 : 100}
              height={isMobile ? 36 : 42}
              color="red"
              disabled={loading}
              onClick={() => onAction?.(GameActionType.HIT)}
              fontSize={isMobile ? 12 : 24}
            />
          </>
        )}

        {/* Chip Selection Background - Pixelated container */}
        <PixiDrawContainer
          x={width / 2}
          y={positions.chipButtons.y}
          width={312}
          height={64}
        >
          {/* Chip Selection Buttons - Always visible */}
          {chipValues.map((value, index) => {
            const spacing = 60;
            const totalWidth = (chipValues.length - 1) * spacing;
            const xOffset = -totalWidth / 2 + index * spacing;
            return (
              <ChipButton
                key={value}
                value={value}
                x={xOffset}
                y={0}
                disabled={
                  gameState.gamePhase !== GamePhaseType.BETTING ||
                  value > gameState.balance
                }
                onClick={() => onAction?.(GameActionType.PLACE_BET, value)}
              />
            );
          })}
        </PixiDrawContainer>

        {/* Wallet Display */}
        <WalletDisplay
          address="0x...b95a"
          x={positions.wallet.x}
          y={positions.wallet.y}
          anchor={isMobile ? { x: 0, y: 0 } : { x: 1, y: 0 }}
          isMobile={isMobile}
        />

        {/* Error Message */}
        {error && (
          <pixiContainer x={width / 2} y={30}>
            <pixiGraphics
              draw={(g) => {
                g.clear();
                g.roundRect(-150, -20, 300, 40, 10);
                g.fill({ color: 0xff0000, alpha: 0.9 });
              }}
            />
            <pixiText text={error} anchor={0.5} style={STYLES.message} />
          </pixiContainer>
        )}

        {/* Result Modal - Rendered on top of everything */}
        {gameState.gamePhase === GamePhaseType.FINISHED && gameState.result && (
          <ResultModal
            isOpen={modalOpen}
            result={gameState.result}
            profit={gameState.gameProfit}
            chips={gameState.placedChips}
            centerX={width / 2}
            centerY={height / 2}
            onNextHand={() => onAction?.(GameActionType.START_NEW_GAME)}
            onClose={() => setModalOpen(false)}
          />
        )}
        {/* next hand button after game is finished */}
        {gameState.gamePhase === GamePhaseType.FINISHED && gameState.result && (
          <ButtonSprite
            text="NEXT HAND"
            x={width / 2}
            y={positions.buttons.y}
            width={isMobile ? 95 : 150}
            height={isMobile ? 36 : 46}
            color="red"
            disabled={loading}
            onClick={() => onAction?.(GameActionType.START_NEW_GAME)}
            fontSize={isMobile ? 12 : 24}
          />
        )}
        {/* Shuffle Modal */}
        {gameState.gamePhase === GamePhaseType.SHUFFLE && (
          <ShuffleModal
            isOpen={shuffleModalOpen}
            centerX={width / 2}
            centerY={height / 2}
            onClose={() => setShuffleModalOpen(false)}
            lastDealerCards={gameState.dealerHand.cards}
            lastPlayerCards={gameState.playerHands && gameState.playerHands}
            isMobile={isMobile}
          />
        )}
      </Application>
      {/* Troll box  */}
      {assetsLoaded && canvasReady && (
        <TrollBox
          label="Troll BOX"
          x={positions.trollbox.x}
          y={positions.trollbox.y}
          anchor={{ x: 1, y: 0 }}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
