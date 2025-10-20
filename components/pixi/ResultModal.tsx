/**
 * PixiJS Result Modal Component
 * Displays game result (WIN, LOSE, PUSH, BUST) with PixiJS
 */

import { useCallback, useState, useEffect } from "react";
import { TextStyle } from "pixi.js";
import { ButtonSprite } from "./ButtonSprite";
import { ChipStack } from "./ChipSprite";
import { useTick } from "@pixi/react";
import { playSound } from "@/lib/utils/sounds";
import { getIconTexture } from "@/lib/utils/pixiAssets";

interface ResultModalProps {
  isOpen: boolean;
  result: "WIN" | "LOSE" | "PUSH" | "BUST";
  profit: number;
  chips: number[];
  centerX: number;
  centerY: number;
  onNextHand: () => void;
  onClose: () => void;
}

const resultConfig = {
  WIN: {
    title: "YOU WON!",
    color: 0x4ade80, // green-400
    sound: "game-win-3" as const,
  },
  LOSE: {
    title: "YOU LOST!",
    color: 0xf87171, // red-400
    sound: "game-lose-1" as const,
  },
  PUSH: {
    title: "PUSH!",
    color: 0xfbbf24, // yellow-400
    sound: null,
  },
  BUST: {
    title: "BUST!",
    color: 0xf87171, // red-400
    sound: "game-lose-1" as const,
  },
};

// Styles created once outside component
const TITLE_STYLE = new TextStyle({
  fontFamily: "Minecraft, monospace",
  fontSize: 32,
  fill: "#ffffff",
  align: "center",
  letterSpacing: 3,
  fontWeight: "bold",
});

const PROFIT_STYLE = new TextStyle({
  fontFamily: "Minecraft, monospace",
  fontSize: 18,
  fill: "#ffffff",
  align: "center",
  fontWeight: "bold",
});

export function ResultModal({
  isOpen,
  result,
  profit,
  chips,
  centerX,
  centerY,
  onNextHand,
  onClose,
}: ResultModalProps) {
  const [offsetY, setOffsetY] = useState(150);
  const [soundPlayed, setSoundPlayed] = useState(false);

  const config = resultConfig[result];

  // Reset animation when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setOffsetY(150);
      setSoundPlayed(false);
    }
  }, [isOpen]);

  // Play sound effect when modal opens
  useEffect(() => {
    if (isOpen && config.sound && !soundPlayed) {
      playSound(config.sound, 0.5);
      setSoundPlayed(true);
    }
  }, [isOpen, config.sound, soundPlayed]);

  // Animate modal entrance - quick slide up from bottom
  useTick((ticker) => {
    if (!isOpen) {
      setOffsetY(150);
      return;
    }

    // Fast slide up animation
    const targetOffsetY = 0;
    const slideSpeed = 0.3 * ticker.deltaTime; // Faster animation

    setOffsetY((prev) => {
      const diff = targetOffsetY - prev;
      if (Math.abs(diff) < 0.5) return targetOffsetY;
      return prev + diff * slideSpeed;
    });
  });

  // Modal dimensions - smaller and more compact
  const modalWidth = 320; // Fixed smaller width
  const modalHeight = 250; // Fixed smaller height with less space under button
  const modalX = centerX - modalWidth / 2;
  const modalY = centerY - modalHeight / 2;

  // Profit color
  const profitColor =
    profit > 0 ? 0x4ade80 : profit < 0 ? 0xf87171 : 0xffffff;

  const drawBackground = useCallback(
    (g: any) => {
      g.clear();

      // Modal background - #182325 with 100% opacity
      g.roundRect(0, 0, modalWidth, modalHeight, 16);
      g.fill({ color: 0x182325, alpha: 1 });

      // Border
      g.roundRect(0, 0, modalWidth, modalHeight, 16);
      g.stroke({ color: 0x333333, width: 3 });
    },
    [modalWidth, modalHeight]
  );

  if (!isOpen) return null;

  return (
    <pixiContainer
      x={modalX}
      y={modalY + offsetY}
      sortableChildren={true}
      zIndex={1}
    >
      {/* Modal Background */}
      <pixiGraphics draw={drawBackground} />

      {/* Close Button */}
      <pixiSprite
        texture={getIconTexture("xButton")}
        x={modalWidth - 30}
        y={30}
        anchor={0.5}
        scale={0.8}
        eventMode="static"
        cursor="pointer"
        onPointerDown={onClose}
        onTap={onClose}
      />

      {/* Result Title */}
      <pixiText
        text={config.title}
        x={modalWidth / 2}
        y={45}
        anchor={0.5}
        style={{
          ...TITLE_STYLE,
          fill: config.color,
        }}
      />

      {/* Chips Display */}
      <ChipStack
        chips={chips}
        x={modalWidth / 2}
        y={100}
        scale={0.1}
        animateIn={false}
        ref={null}
      />

      {/* Profit/Loss Display - more space from chips */}
      <pixiText
        text={`${profit > 0 ? "+" : ""}$${profit}`}
        x={modalWidth / 2}
        y={130}
        anchor={0.5}
        style={{
          ...PROFIT_STYLE,
          fill: profitColor,
        }}
      />

      {/* Action Button - Single centered NEXT HAND button */}
      <ButtonSprite
        text="PLAY AGAIN"
        x={modalWidth / 2}
        y={185}
        width={230}
        height={42}
        color="white"
        onClick={onNextHand}
      />
    </pixiContainer>
  );
}

