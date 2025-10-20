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
      const playerGotCard = playerCards.length > dealerCards.length;
      const cardIndex = playerGotCard
        ? playerCards.length - 1
        : dealerCards.length - 1;

      return {
        card: playerGotCard ? playerCards[cardIndex] : dealerCards[cardIndex],
        faceUp: false,
        shouldFlip: playerGotCard,
        isPlayerCard: playerGotCard,
        isDealerHole: !playerGotCard,
        cardIndex,
      };
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
  const animationSpeed = 0.015; // Adjust for faster/slower animation

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
      const { card, faceUp, isDealerHole, isPlayerCard, cardIndex } =
        getCardForStep(dealingStep, playerCards, dealerCards);

      let targetX, targetY;

      if (dealingStep < 4) {
        const slots = isPlayerCard ? playerCardSlots : dealerCardSlots;
        const slot = slots[cardIndex];
        targetX = slot?.x ?? centerX + cardIndex * 30;
        targetY = slot?.y ?? (isPlayerCard ? playerY : dealerY);
      } else {
        if (isPlayerCard) {
          const hitCardIndex = playerCards.length - 1;
          const slot = playerCardSlots[hitCardIndex];
          targetX = slot?.x ?? centerX + hitCardIndex * 20;
          targetY = slot?.y ?? playerY;
        } else {
          const hitCardIndex = dealerCards.length - 1;
          const slot = dealerCardSlots[hitCardIndex];
          targetX = slot?.x ?? centerX + hitCardIndex * 20;
          targetY = slot?.y ?? dealerY;
        }
      }

      setCards((prev) => {
        // ✅ Keep all previous cards (never remove or replace)
        const existing = prev.some((c) => c.id === dealingStep);
        if (existing) return prev;
        const newCard: CardAnimation = {
          id: dealingStep,
          startX: deckX,
          startY: deckY,
          targetX,
          targetY,
          progress: 0,
          rotation: 5,
          card,
          faceUp, // ✅ start face-down
          isDealerHole,
          flipProgress: 0,
          shouldFlip: isPlayerCard, // ✅ flip only for player cards
        };

        return [...prev, newCard];
      });
    }
  }, [isDealing, dealingStep, playerCards, dealerCards]);
  console.log("cards", cards);

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

            // Ease out cubic
            const eased = 1 - Math.pow(1 - newProgress, 3);

            return {
              ...card,
              progress: newProgress,
              rotation: 5 * (1 - eased),
            };
          }

          // Phase 2: Flip animation (after landing) - faster flip for clarity
          if (card.shouldFlip && card.flipProgress < 1) {
            const newFlipProgress = Math.min(
              card.flipProgress + 0.15 * ticker.deltaTime,
              1
            );

            return {
              ...card,
              flipProgress: newFlipProgress,
            };
          }

          return card;
        })
        .filter((card) => {
          // Keep cards visible throughout the entire dealing phase
          // They will be replaced by HandSprite when isDealing becomes false
          return true;
        })
    );
  });

  if (cards.length === 0) return null;

  return (
    <pixiContainer>
      {cards.map((card) => {
        const eased = 1 - Math.pow(1 - card.progress, 3);
        const maxOffset = card.isDealerHole ? 0 : card.id * 10;
        const offsetFactor = 1 - eased; // 1 → 0 as progress goes from 0 → 1
        const currentX =
          card.startX +
          (card.targetX - card.startX) * eased +
          maxOffset * offsetFactor;
        const currentY = card.startY + (card.targetY - card.startY) * eased;

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
          // Dealer hole card stays face-down until flipped
          showFaceUp = !card.isDealerHole; // Only show face-up for the first card
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
          <pixiSprite
            key={card.id}
            texture={texture}
            x={currentX}
            y={currentY}
            anchor={0.5}
            rotation={card.rotation * (Math.PI / 180)}
            scale={{ x: baseScale * flipScale, y: baseScale }}
            alpha={card.progress}
            zIndex={card.id}
          />
        );
      })}
    </pixiContainer>
  );
}
