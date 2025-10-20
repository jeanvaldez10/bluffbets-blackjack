/**
 * PixiJS Card Sprite Component
 * Renders individual playing cards with animations
 */

import { useTick } from "@pixi/react";
import { useEffect, useRef, useState } from "react";
import { getCardTexture, getCardBackTexture } from "@/lib/utils/pixiAssets";

interface CardSpriteProps {
  rank: string;
  suit: string;
  x: number;
  y: number;
  faceUp?: boolean;
  scale?: number;
  rotation?: number;
  animateIn?: boolean;
  animationDelay?: number;
  zIndex?: number;
}

export function CardSprite({
  rank,
  suit,
  x,
  y,
  faceUp = true,
  scale = 1,
  rotation = 0,
  animateIn = false,
  animationDelay = 0,
  zIndex = 0,
}: CardSpriteProps) {
  const [entranceScale, setEntranceScale] = useState(scale);
  const [flipScale, setFlipScale] = useState(1);
  const [currentRotation, setCurrentRotation] = useState(rotation);
  const [currentAlpha, setCurrentAlpha] = useState(1); // Always visible
  const [displayFaceUp, setDisplayFaceUp] = useState(faceUp);
  const animationTime = useRef(0);
  const animationStarted = useRef(false);
  const flipState = useRef({
    target: faceUp,
    progress: 0,
    flipping: false,
    swapped: false,
  });

  // Get the appropriate texture - add error handling
  let texture;
  try {
    texture = displayFaceUp
      ? getCardTexture(rank, suit)
      : getCardBackTexture();
  } catch (error) {
    console.error(`Failed to load texture for ${rank}${suit}:`, error);
    return null;
  }

  // Trigger flip animation when faceUp changes
  useEffect(() => {
    if (faceUp !== flipState.current.target) {
      flipState.current = {
        target: faceUp,
        progress: 0,
        flipping: true,
        swapped: false,
      };
    }
  }, [faceUp]);

  useEffect(() => {
    setEntranceScale(scale);
  }, [scale]);

  // Animate card entrance
  useTick((ticker) => {
    if (!animateIn || !animationStarted.current) return;

    animationTime.current += ticker.deltaTime;
    const elapsed = animationTime.current / 60; // Convert to seconds

    if (elapsed < animationDelay) return;

    const animProgress = Math.min(
      (elapsed - animationDelay) / 0.3,
      1
    ); // 0.3s animation

    // Ease out cubic
    const eased = 1 - Math.pow(1 - animProgress, 3);

    setEntranceScale(scale * eased);
    setCurrentAlpha(eased);

    // Add slight rotation bounce
    const rotationBounce = Math.sin(animProgress * Math.PI) * 0.1;
    setCurrentRotation(rotation + rotationBounce);

    if (animProgress >= 1) {
      animationStarted.current = false;
    }
  });

  // Handle flip animation
  useTick((ticker) => {
    if (!flipState.current.flipping) return;

    flipState.current.progress += ticker.deltaTime * 0.08;
    const progress = Math.min(flipState.current.progress, 1);

    let scaleFactor = 1;
    if (progress < 0.5) {
      scaleFactor = 1 - progress * 2;
    } else {
      if (!flipState.current.swapped) {
        setDisplayFaceUp(flipState.current.target);
        flipState.current.swapped = true;
      }
      scaleFactor = (progress - 0.5) * 2;
    }

    setFlipScale(Math.max(scaleFactor, 0.02));

    if (progress >= 1) {
      flipState.current.flipping = false;
      flipState.current.progress = 0;
      flipState.current.swapped = false;
      setFlipScale(1);
    }
  });

  // Start animation on mount
  useEffect(() => {
    if (animateIn) {
      animationStarted.current = true;
    }
  }, [animateIn]);

  return (
    <pixiSprite
      texture={texture}
      x={x}
      y={y}
      anchor={0.5}
      scale={{ x: entranceScale * flipScale, y: entranceScale }}
      rotation={currentRotation}
      alpha={currentAlpha}
      zIndex={zIndex}
    />
  );
}
