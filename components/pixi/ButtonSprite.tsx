/**
 * PixiJS Button Sprite Component
 * Pixel art styled buttons with drop shadows and beveled edges
 */

import { useCallback, useState } from "react";
import { TextStyle } from "pixi.js";
import { DropShadowFilter } from "pixi-filters";

interface ButtonSpriteProps {
  text: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: "orange" | "blue" | "red" | "green" | "white" | "overlay";
  disabled?: boolean;
  onClick?: () => void;
  fontSize?: number;
  zIndex?: number;
  blur?: number;
}

const BUTTON_COLORS: Record<
  "orange" | "blue" | "red" | "green" | "white" | "overlay",
  { normal: number; hover: number; disabled: number; shadow: number }
> = {
  orange: { normal: 0xFF9700, hover: 0xFFAD33, disabled: 0x8C5500, shadow: 0xC27300 },
  blue: { normal: 0x0092FF, hover: 0x33AAFF, disabled: 0x005580, shadow: 0x005AAD },
  red: { normal: 0xFE4C40, hover: 0xFF6E65, disabled: 0x992D26, shadow: 0xA82D1E },
  green: { normal: 0x27ae60, hover: 0x2ecc71, disabled: 0x186839, shadow: 0x1a7a43 },
  white: { normal: 0xffffff, hover: 0xF0F0F0, disabled: 0xCCCCCC, shadow: 0xd4d4d7 },
  overlay: { normal: 0xe9e9ec, hover: 0xe9e9ec, disabled: 0xe9e9ec, shadow: 0x000000 },
};

export function ButtonSprite({
  text,
  x,
  y,
  width = 180,
  height = 60,
  color = "blue",
  disabled = false,
  onClick,
  fontSize = 20,
  zIndex = 0,
  blur = 0,
}: ButtonSpriteProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const colors = BUTTON_COLORS[color];
  const currentColor = disabled
    ? colors.disabled
    : isPressed
      ? colors.normal
      : isHovered
        ? colors.hover
        : colors.normal;

  const shadowColor = colors.shadow;

  const drawButton = useCallback(
    (g: any) => {
      g.clear();

      const cornerSize = 6;
      const offsetY = isPressed && !disabled ? 2 : 0;
      const offsetX = isPressed && !disabled ? 2 : 0;
      const shadowOffset = 4;
      // Helper: push rectangle definition [x, y, w, h]
      const rects: Array<[number, number, number, number]> = [];
      const fillOptions = {
        color: currentColor,
      };
      // Main body
      rects.push([
        -width / 2 + cornerSize + offsetX,
        -height / 2 + offsetY,
        width - cornerSize * 2,
        height,
      ]);

      // Top small corners / extensions (left and right)
      rects.push([
        -width / 2,
        -height / 2 + cornerSize / 2,
        cornerSize + cornerSize / 3,
        height / 2 + 10
      ])
      rects.push([
        -width / 2 - 4,
        -height / 2 + cornerSize,
        2 * (cornerSize / 3),
        height / 2 + 7
      ])

      // top right
      rects.push([
        width / 2 - (cornerSize + cornerSize / 3),
        -height / 2 + 3,
        cornerSize + cornerSize / 3,
        height / 2 + 10
      ])
      rects.push([
        width / 2,
        -height / 2 + cornerSize,
        2 * (cornerSize / 3),
        height / 2 + 7
      ])

      // bottom left
      rects.push([
        -width / 2,
        -height / 2 + (cornerSize + cornerSize / 3),
        cornerSize + cornerSize / 3,
        height / 2 + cornerSize + 4
      ])
      rects.push([
        -width / 2 - 4,
        -height / 2 + cornerSize + 2,
        2 * (cornerSize / 3),
        height / 2 + 7
      ])

      // bottom right
      rects.push([
        width / 2 - (cornerSize + cornerSize / 3),
        -height / 2 + cornerSize + 2,
        cornerSize + cornerSize / 3,
        height / 2 + cornerSize + 4
      ])

      rects.push([
        width / 2,
        -height / 2 + cornerSize,
        2 * (cornerSize / 3),
        height / 2 + 10
      ])

      // Draw shadow pass first if appropriate (same rects but offset by shadowOffset)
      // if (!isPressed && !disabled && color !== "overlay") {
      //   for (const [rx, ry, rw, rh] of rects) {
      //     g.rect(rx + shadowOffset, ry + shadowOffset, rw, rh);
      //     g.fill({ color: '0x000000' });
      //   }
      // }

      // Draw main pass (actual button shapes)
      for (const [rx, ry, rw, rh] of rects) {
        g.rect(rx, ry, rw, rh);
        g.fill(fillOptions);
      }
    },
    [width, height, currentColor, shadowColor, isPressed, disabled, color]
  );

  const textStyle = new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: fontSize,
    fill: disabled ? "#666666" : color === "white" ? "#000000" : "#ffffff",
    align: "center",
    fontWeight: "500",
    letterSpacing: 0,
    lineHeight: 1,
    ...(color !== "white" && {
      dropShadow: {
        color: "#00000080",
        distance: Math.sqrt(1.5 ** 2 + 1.5 ** 2),
        angle: Math.atan2(1.5, 1.5),
        blur: 0,
      },
    }),
  });
  const textOverlayStyle = new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: fontSize,
    fill: disabled ? "#666666" : "#000000",
    align: "center",
    fontWeight: "500",
    letterSpacing: 0,
    lineHeight: 1,
  });
  const offsetY = isPressed && !disabled ? 2 : 0;
  const offsetX = isPressed && !disabled ? 2 : 2;

  return (
    <pixiContainer x={x} y={y} zIndex={zIndex} alpha={color === "overlay" ? 0.78 : 1}>
      <pixiGraphics
        draw={drawButton}
        filters={new DropShadowFilter({
          color: '0x000000',
          alpha: 0.6,
          blur: 0.25,
          offset: { x: 4, y: 4 },
        })}
        eventMode={disabled ? "none" : "static"}
        cursor={disabled ? "not-allowed" : "pointer"}
        onPointerEnter={() => !disabled && setIsHovered(true)}
        onPointerLeave={() => {
          !disabled && setIsHovered(false);
          !disabled && setIsPressed(false);
        }}
        onPointerDown={() => !disabled && setIsPressed(true)}
        onPointerUp={() => {
          if (!disabled) {
            setIsPressed(false);
            onClick?.();
          }
        }}
        onTap={() => !disabled && onClick?.()}
      />
      <pixiText text={text} anchor={0.5} x={offsetX} y={offsetY} style={color === "overlay" ? textOverlayStyle : textStyle} />
    </pixiContainer>
  );
}
