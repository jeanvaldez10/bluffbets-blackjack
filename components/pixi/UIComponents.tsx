/**
 * PixiJS UI Components
 * All UI elements rendered in PixiJS canvas
 */

import { useCallback, useState } from "react";
import { TextStyle } from "pixi.js";
import { getChipTexture, getIconTexture } from "@/lib/utils/pixiAssets";
import { alpha } from "framer-motion";

// Shared UI Styles
const UI_STYLES = {
  balance: new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: 14,
    fill: "#ffffff",
    align: "center",
    letterSpacing: 1,
  }),
  chipLabel: new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: 14,
    fill: "#000000",
    fontWeight: "bold",
    align: "center",
  }),
};

// Pixelated Container Component
interface PixelatedContainerProps {
  width: number;
  height: number;
  x?: number;
  y?: number;
  children?: React.ReactNode;
  drawBackgroundColor?: string;
  drawBackgroundOpacity?: string;
  position?: "left" | "right"
}

export function PixelatedContainer({ width, height, x = 0, y = 0, children, drawBackgroundColor, drawBackgroundOpacity }: PixelatedContainerProps) {
  const color = drawBackgroundColor ? `0x${drawBackgroundColor}` : '0x000000';
  const alpa = drawBackgroundOpacity ?? 0.3

  const drawBackground = useCallback(
    (g: any) => {
      g.clear();

      const cornerSize = 8;

      // Main background body
      g.rect(
        -width / 2 + cornerSize,
        -height / 2,
        width - cornerSize * 2,
        height
      );
      g.fill({ color: color, alpha: alpa });

      // Top edge extensions (horizontal) - pixelated corners
      g.rect(-width / 2 + cornerSize / 2, -height / 2, cornerSize / 2, cornerSize);
      g.fill({ color: color, alpha: alpa });

      g.rect(width / 2 - cornerSize, -height / 2, cornerSize / 2, cornerSize);
      g.fill({ color: color, alpha: alpa });

      // Bottom edge extensions (horizontal)
      g.rect(-width / 2 + cornerSize / 2, height / 2 - cornerSize, cornerSize / 2, cornerSize);
      g.fill({ color: color, alpha: alpa });

      g.rect(width / 2 - cornerSize, height / 2 - cornerSize, cornerSize / 2, cornerSize);
      g.fill({ color: color, alpha: alpa });

      // Left edge extensions (vertical)
      g.rect(-width / 2, -height / 2 + cornerSize, cornerSize, height - cornerSize * 2);
      g.fill({ color: color, alpha: alpa });

      // Right edge extensions (vertical)
      g.rect(width / 2 - cornerSize, -height / 2 + cornerSize, cornerSize, height - cornerSize * 2);
      g.fill({ color: color, alpha: alpa });
    },
    [width, height]
  );

  return (
    <pixiContainer x={x} y={y}>
      <pixiGraphics draw={drawBackground} onPointerEnter={() => console.log("test")} />
      {children}
    </pixiContainer>
  );
}

export function PixiSquareContainer({ width, height, x = 0, y = 0, children, position }: PixelatedContainerProps) {
  const horizontalX = position === "right" ? x : x - 62
  return (
    <pixiContainer x={horizontalX} y={y}>
      <pixiSprite
        texture={position === "left" ? getIconTexture("pair") : getIconTexture("square")}
        x={0}
        y={0}
        width={width}
        height={height}
        anchor={{ x: 0, y: 0.5 }}
      />
      {children}
    </pixiContainer>
  );
}
export function PixiDrawContainer({ width, height, x = 0, y = 0, children }: PixelatedContainerProps) {

  return (
    <pixiContainer x={x} y={y}>
      <pixiSprite
        texture={getIconTexture("draw")}
        x={0}
        y={0}
        width={width}
        height={height}
        anchor={{ x: 0.5, y: 0.5 }}
      />
      {children}
    </pixiContainer>
  );
}
interface BalanceDisplayProps {
  balance: number;
  x: number;
  y: number;
}

export function BalanceDisplay({ balance, x, y }: BalanceDisplayProps) {
  const text = `$${balance.toLocaleString()}`;
  const width = Math.max(text.length * 9 + 50, 110);
  const height = 32;

  const drawPlusBackground = useCallback((g: any) => {
    g.clear();

    const cornerSize = 4;
    const bgWidth = 24;
    const bgHeight = 24;

    // Main background body
    g.rect(
      -bgWidth / 2 + cornerSize,
      -bgHeight / 2,
      bgWidth - cornerSize * 2,
      bgHeight
    );
    g.fill({ color: 0x000000, alpha: 0.5 });

    // Top edge extensions (horizontal) - pixelated corners
    g.rect(-bgWidth / 2 + cornerSize / 2, -bgHeight / 2, cornerSize / 2, cornerSize);
    g.fill({ color: 0x000000, alpha: 0.5 });

    g.rect(bgWidth / 2 - cornerSize, -bgHeight / 2, cornerSize / 2, cornerSize);
    g.fill({ color: 0x000000, alpha: 0.5 });

    // Bottom edge extensions (horizontal)
    g.rect(-bgWidth / 2 + cornerSize / 2, bgHeight / 2 - cornerSize, cornerSize / 2, cornerSize);
    g.fill({ color: 0x000000, alpha: 0.5 });

    g.rect(bgWidth / 2 - cornerSize, bgHeight / 2 - cornerSize, cornerSize / 2, cornerSize);
    g.fill({ color: 0x000000, alpha: 0.5 });

    // Left edge extensions (vertical)
    g.rect(-bgWidth / 2, -bgHeight / 2 + cornerSize, cornerSize, bgHeight - cornerSize * 2);
    g.fill({ color: 0x000000, alpha: 0.5 });

    // Right edge extensions (vertical)
    g.rect(bgWidth / 2 - cornerSize, -bgHeight / 2 + cornerSize, cornerSize, bgHeight - cornerSize * 2);
    g.fill({ color: 0x000000, alpha: 0.5 });
  }, []);

  const drawPlusShadow = useCallback((g: any) => {
    g.clear();

    // Drop shadow offset
    const shadowOffset = 2;

    // Vertical bar of plus (shadow) - centered on x=0
    g.rect(-1 + shadowOffset, -6 + shadowOffset, 2, 12);
    g.fill({ color: 0x000000, alpha: 0.3 });

    // Horizontal bar of plus (shadow) - centered on y=0
    g.rect(-6 + shadowOffset, -1 + shadowOffset, 12, 2);
    g.fill({ color: 0x000000, alpha: 0.3 });
  }, []);

  const drawPlus = useCallback((g: any) => {
    g.clear();

    // Vertical bar of plus - centered on x=0
    g.rect(-1, -6, 2, 12);
    g.fill({ color: 0xffffff });

    // Horizontal bar of plus - centered on y=0
    g.rect(-6, -1, 12, 2);
    g.fill({ color: 0xffffff });
  }, []);

  return (
    <PixiDrawContainer width={width} height={height} x={x} y={y}>
      <pixiText
        text={text}
        anchor={0.5}
        x={-8}
        y={0}
        style={UI_STYLES.balance}
      />

      {/* Plus icon with background on the right */}
      <pixiContainer x={width / 2 - 18} y={0}>
        {/* Plus background */}
        <pixiGraphics draw={drawPlusBackground} />

        {/* Plus shadow */}
        <pixiGraphics draw={drawPlusShadow} />

        {/* Plus icon */}
        <pixiGraphics draw={drawPlus} />
      </pixiContainer>
    </PixiDrawContainer>
  );
}

interface ChipButtonProps {
  value: number;
  x: number;
  y: number;
  disabled?: boolean;
  onClick?: () => void;
}

export function ChipButton({ value, x, y, disabled = false, onClick }: ChipButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  let texture;
  try {
    texture = getChipTexture(value);
  } catch (error) {
    console.error(`Failed to load chip texture for button ${value}:`, error);
    return null;
  }

  const chipScale = isHovered && !disabled ? 0.14 : 0.12;
  const chipAlpha = disabled ? 0.5 : 1;

  return (
    <pixiContainer x={x} y={y}>
      <pixiSprite
        texture={texture}
        anchor={0.5}
        scale={chipScale}
        alpha={chipAlpha}
        eventMode={disabled ? "none" : "static"}
        cursor={disabled ? "not-allowed" : "pointer"}
        onPointerEnter={() => !disabled && setIsHovered(true)}
        onPointerLeave={() => !disabled && setIsHovered(false)}
        onPointerDown={() => !disabled && onClick?.()}
        onTap={() => !disabled && onClick?.()}
      />
    </pixiContainer>
  );
}

interface WalletDisplayProps {
  address: string;
  x: number;
  y: number;
  anchor?: { x: number; y: number };
  isMobile?: boolean;
}
export function WalletDisplay({ address, x, y, anchor = { x: 1, y: 0 }, isMobile = false }: WalletDisplayProps) {
  const height = 64
  const width = 240
  // Mobile: stacked with small text and green address
  if (isMobile) {
    const labelStyle = new TextStyle({
      fontFamily: "Minecraft, monospace",
      fontSize: 10,
      fill: "#ffffff",
      letterSpacing: 1,
      align: anchor.x === 0 ? "left" : "right",
    });

    const addressStyle = new TextStyle({
      fontFamily: "Minecraft, monospace",
      fontSize: 10,
      fill: "#00ff00", // Green
      letterSpacing: 1,
      align: anchor.x === 0 ? "left" : "right",
    });

    return (
      <pixiContainer x={x} y={y}>
        {/* CONNECTED label */}
        <pixiText
          text="CONNECTED:"
          x={0}
          y={0}
          anchor={anchor}
          style={labelStyle}
        />
        {/* Wallet address on second line */}
        <pixiText
          text={address}
          x={0}
          y={12}
          anchor={anchor}
          style={addressStyle}
        />
      </pixiContainer>
    );
  }

  // Desktop: single line, normal size
  const style = new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: 14,
    fill: "#ffffff",
    letterSpacing: 2,
    align: anchor.x === 0 ? "left" : "right",
    dropShadow: {
      color: "#00000080",
      distance: Math.sqrt(1.5 ** 2 + 1.5 ** 2),
      angle: Math.atan2(1.5, 1.5),
      blur: 0
    }
  });

  return (
    <PixelatedContainer width={width} height={height} x={x} y={y + 24}>
      <pixiText
        text={`CONNECTED: ${address}`}
        x={anchor.x === 0 ? -width / 2 + 8 : width / 2 - 10}
        y={-16}
        anchor={anchor}
        style={style}
      />
    </PixelatedContainer>

  );
}