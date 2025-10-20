import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChipStack } from "./ChipStack";
import { ActionButton } from "./ActionButton";
import { playSound } from "@/lib/utils/sounds";
import { getIcon } from "@/lib/utils/assets";

interface GameResultModalProps {
  isOpen: boolean;
  result: "WIN" | "LOSE" | "PUSH" | "BUST";
  profit: number;
  chips: number[];
  onPlayAgain: () => void;
  onNewBet: () => void;
}

const resultConfig = {
  WIN: {
    title: "YOU WON!",
    color: "text-green-400",
    sound: "game-win-3" as const,
  },
  LOSE: {
    title: "YOU LOST!",
    color: "text-red-400",
    sound: "game-lose-1" as const,
  },
  PUSH: {
    title: "PUSH!",
    color: "text-yellow-400",
    sound: null,
  },
  BUST: {
    title: "BUST!",
    color: "text-red-400",
    sound: "game-lose-1" as const,
  },
};

export function GameResultModal({
  isOpen,
  result,
  profit,
  chips,
  onPlayAgain,
  onNewBet,
}: GameResultModalProps) {
  const config = resultConfig[result];

  // Play sound effect when modal opens
  useEffect(() => {
    if (isOpen && config.sound) {
      playSound(config.sound, 0.5);
    }
  }, [isOpen, config.sound]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
        >
          <div
            className="px-16 py-12 rounded-2xl flex flex-col items-center gap-6 relative"
            style={{ backgroundColor: "#182325" }}
          >
            {/* Close Button */}
            <button
              onClick={onNewBet}
              className="absolute top-4 right-4 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Image
                src={getIcon("actions", "x-button", "svg")}
                alt="Close"
                width={24}
                height={24}
              />
            </button>

            {/* Result Title */}
            <h2 className={`text-4xl font-bold tracking-wider ${config.color}`}>
              {config.title}
            </h2>

            {/* Chips Display */}
            <div className="flex flex-col items-center gap-2">
              <ChipStack chips={chips} />
              {/* Profit/Loss Display */}
              <div
                className={`text-2xl font-bold ${
                  profit > 0 ? "text-green-400" : profit < 0 ? "text-red-400" : "text-white"
                }`}
              >
                {profit > 0 ? "+" : ""}${profit}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-4">
              <ActionButton onClick={onNewBet} variant="blue">
                NEW BET
              </ActionButton>
              <ActionButton onClick={onPlayAgain} variant="green">
                PLAY AGAIN
              </ActionButton>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

