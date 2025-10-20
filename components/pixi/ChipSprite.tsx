/**
 * PixiJS Chip Sprite Component
 * Renders casino chips with stacking and particle effects
 */

import { useTick } from "@pixi/react";
import { useEffect, useRef, useState } from "react";
import { getChipTexture } from "@/lib/utils/pixiAssets";

interface ChipSpriteProps {
  value: number;
  x: number;
  y: number;
  scale?: number;
  animateIn?: boolean;
  animationDelay?: number;
  stackOffset?: number;
  zIndex?: number;
}

export function ChipSprite({
  value,
  x,
  y,
  scale = 1,
  animateIn = false,
  animationDelay = 0,
  stackOffset = 0,
  zIndex = 0,
}: ChipSpriteProps) {
  const [currentY, setCurrentY] = useState(y + stackOffset); // Start at final position
  const [currentAlpha, setCurrentAlpha] = useState(1); // Always visible
  const [currentScale, setCurrentScale] = useState(scale);
  const animationTime = useRef(0);
  const animationStarted = useRef(false);

  let texture;
  try {
    texture = getChipTexture(value);
  } catch (error) {
    console.error(`Failed to load chip texture for value ${value}:`, error);
    return null;
  }
  const targetWidth = 44;
  const targetHeight = 46;
  const baseScaleX = targetWidth / texture.width;
  const baseScaleY = targetHeight / texture.height;
  const normalizedScale = Math.min(baseScaleX, baseScaleY) * scale;
  // Animate chip drop
  useTick((ticker) => {
    if (!animateIn || !animationStarted.current) return;

    animationTime.current += ticker.deltaTime;
    const elapsed = animationTime.current / 60;

    if (elapsed < animationDelay) return;

    const animProgress = Math.min(
      (elapsed - animationDelay) / 0.4,
      1
    ); // 0.4s animation

    // Ease out bounce
    const eased =
      animProgress < 0.5
        ? 4 * animProgress * animProgress * animProgress
        : 1 - Math.pow(-2 * animProgress + 2, 3) / 2;
    const targetY = y + stackOffset;
    setCurrentY(y - 200 + (200 + stackOffset) * eased);
    setCurrentAlpha(Math.min(animProgress * 2, 1));
    setCurrentScale(normalizedScale * (0.5 + 0.5 * eased));

    // Slight bounce at the end
    if (animProgress > 0.8) {
      const bounce = Math.sin((animProgress - 0.8) * Math.PI * 5) * 2;
      setCurrentY(targetY + bounce);
    }
  });

  useEffect(() => {
    if (animateIn) {
      animationStarted.current = true;
    }
  }, [animateIn]);
  return (
    <pixiSprite
      texture={texture}
      x={x}
      y={currentY}
      anchor={0.5}
      scale={normalizedScale * 10}
      alpha={currentAlpha}
      zIndex={zIndex}
    />
  );
}

interface ChipStackProps {
  chips: number[];
  x: number;
  y: number;
  scale?: number;
  animateIn?: boolean;
  ref: any
}

export function ChipStack({
  chips,
  x,
  y,
  scale = 1,
  animateIn = false,
  ref
}: ChipStackProps) {
  // Horizontal stacking like original - each chip slightly overlaps the previous one
  const chipWidth = 260 * scale; // Base chip width
  const overlapAmount = 20 * scale; // How much chips overlap (negative margin from original)
  const horizontalSpacing = chipWidth - overlapAmount;
  const totalWidth =
    chips.length > 0 ? (chips.length - 1) * horizontalSpacing + chipWidth : 0;
  const startX = -totalWidth / 2 + chipWidth / 2;
  return (
    <pixiContainer x={x} y={y} ref={ref}>
      {chips.map((chipValue, index) => (
        <ChipSprite
          key={`chip-${index}`}
          value={chipValue}
          x={startX + index * horizontalSpacing}
          y={0}
          scale={scale}
          stackOffset={0}
          animateIn={animateIn}
          animationDelay={index * 0.05}
          zIndex={index}
        />
      ))}
    </pixiContainer>
  );
}

