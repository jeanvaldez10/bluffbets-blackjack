/**
 * PixiJS Dealing Animation
 * Card flying animation fully in PixiJS canvas
 */

import { useTick } from "@pixi/react";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/types/game";
import { getCardBackTexture, getCardTexture } from "@/lib/utils/pixiAssets";

interface CardAnimation {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number;
  rotation: number;
  card?: Card;
  faceUp: boolean;
  isDealerHole?: boolean;
  flipProgress: number;
  shouldFlip: boolean;
  // Current position
  x: number;
  y: number;
  // Animation enhancements
  controlPoint1: { x: number; y: number }; // Bezier curve control point 1
  controlPoint2: { x: number; y: number }; // Bezier curve control point 2
  trail: Array<{ x: number; y: number; rotation: number }>; // Trail positions
  bounceProgress: number; // Landing bounce effect
  glowAlpha: number; // Glow effect intensity
}

interface DealingAnimationProps {
  isDealing: boolean;
  dealingStep: number;
  deckX: number;
  deckY: number;
  dealerY: number;
  playerY: number;
  centerX: number;
  isMobile?: boolean;
  playerCards: Card[];
  dealerCards: Card[];
  playerCardSlots: { x: number; y: number }[];
  dealerCardSlots: { x: number; y: number }[];
}

function getCardForStep(
  step: number,
  playerCards: Card[],
  dealerCards: Card[]
) {
  switch (step) {
    case 1:
      return {
        card: playerCards[0],
        faceUp: true,
        isPlayerCard: true,
        cardIndex: 0,
      };
    case 2:
      return {
        card: dealerCards[0],
        faceUp: true,
        isPlayerCard: false,
        cardIndex: 0,
      }; // Make the dealer's first card face-up
    case 3:
      return {
        card: playerCards[1],
        faceUp: true,
        isPlayerCard: true,
        cardIndex: 1,
      };
    case 4:
      return {
        card: dealerCards[1],
        faceUp: false, // Keep the hole card face-down initially
        isDealerHole: true,
        isPlayerCard: false,
        cardIndex: 1,
      };
    default:
      // For hit cards after initial deal
      const isDealerTurn = dealerCards.length > 2;

      if (isDealerTurn) {
        // Dealer's turn
        return {
          card: dealerCards[dealerCards.length - 1],
          faceUp: true,
          shouldFlip: true,
          isPlayerCard: false,
          isDealerHole: false,
          cardIndex: dealerCards.length - 1,
        };
      } else {
        // Player's turn
        return {
          card: playerCards[playerCards.length - 1],
          faceUp: true,
          shouldFlip: true,
          isPlayerCard: true,
          isDealerHole: false,
          cardIndex: playerCards.length - 1,
        };
      }
  }
}

export function DealingAnimationSprite({
  isDealing,
  dealingStep,
  deckX,
  deckY,
  dealerY,
  playerY,
  centerX,
  isMobile = false,
  playerCards,
  dealerCards,
  playerCardSlots,
  dealerCardSlots,
}: DealingAnimationProps) {
  const [cards, setCards] = useState<CardAnimation[]>([]);
  const animationSpeed = 0.05; // Increased animation speed (much faster)

  useEffect(() => {
    // ✅ Only clear when the *entire* dealing sequence is done and game resets
    if (
      !isDealing &&
      dealingStep === 0 &&
      playerCards.length === 0 &&
      dealerCards.length === 0
    ) {
      setCards([]);
    }
  }, [isDealing, dealingStep, playerCards.length, dealerCards.length]);

  useEffect(() => {
    if (!isDealing) return;
    if (dealingStep > 0) {
      // Check if previous card has started moving enough to start the next one
      const prevCard = cards.find((c) => c.id === dealingStep - 1);
      const shouldStartNext = !prevCard || prevCard.progress > 0.4; // Start next when previous is 40% done

      if (!shouldStartNext) return;

      const { card, faceUp, isDealerHole, isPlayerCard, cardIndex } =
        getCardForStep(dealingStep, playerCards, dealerCards);

      let targetX, targetY;

      const cardSpacing = isMobile ? 60 : 90;

      // For initial deal (first 4 cards)
      if (dealingStep <= 4) {
        const slots = isPlayerCard ? playerCardSlots : dealerCardSlots;
        const slot = slots[cardIndex];
        targetX = slot?.x ?? centerX;
        targetY = slot?.y ?? (isPlayerCard ? playerY : dealerY);
      } else {
        // For hit cards after initial deal
        const isDealerTurn = dealerCards.length > 2;
        const currentCards = isDealerTurn ? dealerCards : playerCards;
        const totalCards = currentCards.length;

        // Calculate startX the same way HandSprite does
        const startX = centerX - ((totalCards - 1) * cardSpacing) / 2;
        const cardIndex = totalCards - 1; // Index of the new card

        // Calculate final position using the same formula as HandSprite
        targetX = startX + cardIndex * cardSpacing;
        targetY = isDealerTurn ? dealerY : playerY;
      }

      setCards((prev) => {
        // ✅ Keep all previous cards (never remove or replace)
        const existing = prev.some((c) => c.id === dealingStep);
        if (existing) return prev;
        // Calculate bezier control points for smooth arc
        const midX = (deckX + targetX) / 2;
        const xOffset = Math.abs(targetX - deckX) * 0.15;

        // Subtle arcs for player and dealer cards
        // Player cards: Small upward arc
        // Dealer cards: Small downward arc
        const heightOffset = isPlayerCard ? -50 : 50; // Reduced height for subtler arcs

        const controlPoint1 = {
          x: isPlayerCard ? midX - xOffset : midX + xOffset,
          y: Math.min(deckY, targetY) + heightOffset,
        };
        const controlPoint2 = {
          x: isPlayerCard ? midX + xOffset : midX - xOffset,
          y: Math.min(deckY, targetY) + heightOffset,
        };

        const newCard: CardAnimation = {
          id: dealingStep,
          startX: deckX,
          startY: deckY,
          targetX,
          targetY,
          progress: 0,
          rotation: 0, // Start with no rotation
          card,
          faceUp,
          isDealerHole,
          flipProgress: 0,
          shouldFlip: isPlayerCard,
          // Current position starts at deck
          x: deckX,
          y: deckY,
          // Animation enhancements
          controlPoint1,
          controlPoint2,
          trail: [], // Will be populated during animation
          bounceProgress: 0,
          glowAlpha: 0.8, // Start with high glow
        };

        return [...prev, newCard];
      });
    }
  }, [isDealing, dealingStep, playerCards, dealerCards]);
  console.log("cards", cards);

  // Bezier curve helper
  const getBezierPoint = (
    t: number,
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number }
  ) => {
    const oneMinusT = 1 - t;
    const b0 = oneMinusT * oneMinusT * oneMinusT;
    const b1 = 3 * oneMinusT * oneMinusT * t;
    const b2 = 3 * oneMinusT * t * t;
    const b3 = t * t * t;
    return {
      x: b0 * p0.x + b1 * p1.x + b2 * p2.x + b3 * p3.x,
      y: b0 * p0.y + b1 * p1.y + b2 * p2.y + b3 * p3.y,
    };
  };

  // Animate cards
  useTick((ticker) => {
    if (!cards.length) return;

    setCards((prev) =>
      prev
        .map((card) => {
          // Phase 1: Flying animation (face-down)
          if (card.progress < 1) {
            const newProgress = Math.min(
              card.progress + animationSpeed * ticker.deltaTime,
              1
            );

            // Custom easing for smoother motion
            const eased = 1 - Math.pow(1 - newProgress, 4); // Quartic easing

            // Calculate position along bezier curve
            const currentPos = getBezierPoint(
              eased,
              { x: card.startX, y: card.startY },
              card.controlPoint1,
              card.controlPoint2,
              { x: card.targetX, y: card.targetY }
            );

            // Calculate rotation based on movement direction
            const nextPos = getBezierPoint(
              Math.min(eased + 0.1, 1),
              { x: card.startX, y: card.startY },
              card.controlPoint1,
              card.controlPoint2,
              { x: card.targetX, y: card.targetY }
            );

            // No rotation
            const trail = [
              ...card.trail,
              { x: currentPos.x, y: currentPos.y, rotation: 0 },
            ].slice(-5);

            // Fade out glow as card lands
            const glowAlpha = card.glowAlpha * (1 - eased);

            return {
              ...card,
              progress: newProgress,
              rotation: 0,
              trail,
              bounceProgress: 0,
              glowAlpha,
              x: currentPos.x,
              y: currentPos.y,
            };
          }

          // Phase 2: Flip animation (after landing) - very fast flip
          if (card.shouldFlip && card.flipProgress < 1) {
            const newFlipProgress = Math.min(
              card.flipProgress + 0.2 * ticker.deltaTime,
              1
            );

            return {
              ...card,
              flipProgress: newFlipProgress,
              trail: [], // Clear trail after landing
              glowAlpha: 0, // No glow during flip
            };
          }

          return card;
        })
        .filter((card) => {
          // Keep cards visible throughout the entire dealing phase
          return true;
        })
    );
  });

  if (cards.length === 0) return null;

  return (
    <pixiContainer>
      {cards.map((card) => {
        let showFaceUp = false;
        let flipScale = 1;

        if (card.progress < 1) {
          showFaceUp = false; // Flight: always face-down
        } else if (card.shouldFlip && card.flipProgress < 1) {
          if (card.flipProgress <= 0.5) {
            showFaceUp = false;
            flipScale = Math.max(0.01, 1 - card.flipProgress * 2);
          } else {
            showFaceUp = true;
            flipScale = Math.max(0.01, (card.flipProgress - 0.5) * 2);
          }
        } else if (card.shouldFlip && card.flipProgress >= 1) {
          showFaceUp = true;
          flipScale = 1;
        } else {
          showFaceUp = !card.isDealerHole;
          flipScale = 1;
        }

        let texture;
        if (showFaceUp && card.card) {
          try {
            texture = getCardTexture(card.card.rank, card.card.suit);
          } catch (error) {
            console.error(
              `Error loading card texture for ${card.card.rank}${card.card.suit}:`,
              error
            );
            texture = getCardBackTexture();
          }
        } else {
          texture = getCardBackTexture();
        }

        const baseScale = isMobile ? 0.08 : 0.12;

        return (
          <pixiContainer key={card.id}>
            {/* Trail effect */}
            {card.trail.map((pos, i) => (
              <pixiSprite
                key={`trail-${i}`}
                texture={getCardBackTexture()}
                x={pos.x}
                y={pos.y}
                anchor={0.5}
                scale={{ x: baseScale * 0.9, y: baseScale * 0.9 }}
                alpha={0.1 * (i / card.trail.length)}
                zIndex={card.id * 10 + i}
                tint={0x4477ff}
              />
            ))}

            {/* Glow effect */}
            {card.glowAlpha > 0 && (
              <pixiSprite
                texture={texture}
                x={card.x}
                y={card.y}
                anchor={0.5}
                scale={{ x: baseScale * 1.2, y: baseScale * 1.2 }}
                alpha={card.glowAlpha * 0.3}
                zIndex={card.id * 10 + 5}
                tint={0xffffff}
                blendMode="screen" // Glow effect
              />
            )}

            {/* Main card */}
            <pixiSprite
              texture={texture}
              x={card.x}
              y={card.y}
              anchor={0.5}
              scale={{ x: baseScale * flipScale, y: baseScale }}
              alpha={card.progress}
              zIndex={card.id * 10 + 6}
            />
          </pixiContainer>
        );
      })}
    </pixiContainer>
  );
}
