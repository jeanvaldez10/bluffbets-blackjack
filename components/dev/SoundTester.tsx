"use client";

import React, { useState } from "react";
import { playSound } from "@/lib/utils/sounds";

export function SoundTester() {
  const [isOpen, setIsOpen] = useState(false);

  const handleTestCardDeal = () => {
    playSound("card-deal", 0.3, 0.8);
  };

  const handleTestChipsPlaceBet = () => {
    playSound("chips-place-bet", 0.5);
  };

  const handleTestButtonPress = () => {
    playSound("button-press", 0.3, 0.5);
  };

  const handleTestChipsJourney = () => {
    playSound("chips-collect", 0.5);
  };

  const handleTestWin = () => {
    playSound("game-win-3", 0.5);
  };

  const handleTestLose = () => {
    playSound("game-lose-1", 0.5);
  };

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed top-16 left-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white text-sm px-3 py-2 rounded border border-gray-600 hover:bg-gray-700 cursor-pointer w-full text-left"
        style={{ fontFamily: "system-ui" }}
      >
        🔊 {isOpen ? "▼" : "▶"} Sound Tester
      </button>
      
      {isOpen && (
        <div className="mt-1 bg-gray-800 border border-gray-600 rounded p-2 flex flex-col gap-1">
          <button
            onClick={handleTestCardDeal}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
          >
            Card Deal
          </button>
          <button
            onClick={handleTestChipsPlaceBet}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
          >
            Chips Place
          </button>
          <button
            onClick={handleTestButtonPress}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
          >
            Button Press
          </button>
          <button
            onClick={handleTestChipsJourney}
            className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors"
          >
            Chips Collect
          </button>
          <button
            onClick={handleTestWin}
            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-colors"
          >
            Win
          </button>
          <button
            onClick={handleTestLose}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
          >
            Lose
          </button>
        </div>
      )}
    </div>
  );
}
