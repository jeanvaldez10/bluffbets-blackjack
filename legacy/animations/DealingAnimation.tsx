"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getCardBackImage } from "@/lib/utils/assets";

interface DealingAnimationProps {
  isDealing: boolean;
  dealingStep: number;
  totalCards?: number; // Total cards to deal (default: 4 for initial deal)
  onDealComplete?: () => void;
}

interface AnimatedCard {
  id: number;
  targetType: "player" | "dealer";
  cardIndex: number; // Which card in the hand (0, 1, 2, etc.)
}

const DealingAnimationComponent = ({
  isDealing,
  dealingStep,
  totalCards = 4,
  onDealComplete,
}: DealingAnimationProps) => {
  const [cards, setCards] = useState<AnimatedCard[]>([]);

  // Memoize animation duration to prevent recalculation
  const animationDuration = React.useMemo(
    () => 0.4 + totalCards * 0.05,
    [totalCards]
  );

  // Memoize positions to prevent recalculation
  const positions = React.useMemo(() => {
    if (typeof window === "undefined") {
      return { deckX: 0, deckY: 0, centerX: 0, playerY: 0, dealerY: 0 };
    }
    return {
      deckX: window.innerWidth - 200,
      deckY: 100,
      centerX: window.innerWidth / 2 - 55,
      playerY: window.innerHeight / 2 + 80,
      dealerY: 96,
    };
  }, []);

  useEffect(() => {
    if (!isDealing) {
      setCards([]);
      return;
    }

    if (dealingStep === 0) {
      setCards([]);
      return;
    }

    // Add new card for current dealing step
    if (dealingStep > 0 && dealingStep <= totalCards) {
      const isPlayerCard = dealingStep % 2 === 1;
      const cardIndex = Math.floor((dealingStep - 1) / 2);
      
      setCards((prev) => {
        if (prev.some((c) => c.id === dealingStep)) {
          return prev;
        }
        
        return [
          ...prev,
          {
            id: dealingStep,
            targetType: isPlayerCard ? "player" : "dealer",
            cardIndex,
          },
        ];
      });
    }

    // Clear cards after dealing completes
    if (dealingStep >= totalCards) {
      const timeout = setTimeout(() => {
        setCards([]);
        onDealComplete?.();
      }, animationDuration * 1000 + 100);
      return () => clearTimeout(timeout);
    }
  }, [isDealing, dealingStep, totalCards, animationDuration, onDealComplete]);

  if (!isDealing || cards.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {cards.map((card) => {
          const targetX = positions.centerX + card.cardIndex * 20;
          const targetY =
            card.targetType === "player" ? positions.playerY : positions.dealerY;

          return (
            <motion.div
              key={card.id}
              initial={{
                x: positions.deckX,
                y: positions.deckY,
                rotate: 5,
                opacity: 1,
              }}
              animate={{
                x: targetX,
                y: targetY,
                rotate: 0,
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.1 },
              }}
              transition={{
                duration: animationDuration,
                ease: [0.22, 1, 0.36, 1],
                delay: 0,
              }}
              className="absolute"
              style={{
                width: "110px",
                height: "154px",
                willChange: "transform",
                transform: "translateZ(0)", // Force GPU acceleration
              }}
            >
              <Image
                src={getCardBackImage()}
                alt="Dealing card"
                width={110}
                height={154}
                className="pixelated"
                priority
                unoptimized
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const DealingAnimation = React.memo(DealingAnimationComponent);
