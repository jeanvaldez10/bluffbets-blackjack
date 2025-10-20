import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { getCardImage, getCardBackImage } from "@/lib/utils/assets";
import { Card } from "@/types/game";

interface HandDisplayProps {
  cards: Card[];
  label: string;
  score?: number;
  showScore?: boolean;
  hideSecondCard?: boolean; // For dealer's hidden card
}

export function HandDisplay({
  cards,
  label,
  score,
  showScore = true,
  hideSecondCard = false,
}: HandDisplayProps) {
  if (cards.length === 0) {
    return <div className="h-[154px]" />;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <span className="text-white text-base tracking-wider">{label}</span>
        {showScore && score !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="px-1 py-0.5"
            style={{ backgroundColor: "#2C5644" }}
          >
            <span className="text-white text-base leading-tight">{score}</span>
          </motion.div>
        )}
      </div>
      <div className="flex gap-2">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.2,
              delay: i * 0.05,
              ease: "easeOut",
            }}
            className="relative"
          >
            <Image
              src={
                hideSecondCard && i === 1 && !card.isHidden
                  ? getCardBackImage()
                  : card.isHidden
                  ? getCardBackImage()
                  : getCardImage(card.rank, card.suit)
              }
              alt={
                hideSecondCard && i === 1
                  ? "Hidden card"
                  : `${card.rank} of ${card.suit}`
              }
              width={110}
              height={154}
              className="pixelated"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

