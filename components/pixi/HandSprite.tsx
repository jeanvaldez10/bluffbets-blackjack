import { CardSprite } from "./CardSprite";
import { ButtonSprite } from "./ButtonSprite";
import { Card } from "@/types/game";
import { TextStyle, Container } from "pixi.js";
import { useRef, useEffect, useState } from "react";
import { getIconTexture } from "@/lib/utils/pixiAssets";
import SpliteSprite from "./SpliteSprite";
import { PixiSquareContainer } from "./UIComponents";

interface HandSpriteProps {
  cards: Card[];
  x: number;
  y: number;
  label?: string;
  score?: number;
  showScore?: boolean;
  hideSecondCard?: boolean;
  hideLastCard?: boolean;
  animateIn?: boolean;
  cardSpacing?: number;
  scale?: number;
  isMobile?: boolean;
  isActive?: boolean;
  status?: string;
  canSplit?: boolean;
  onSplit?: () => void;
}

export function HandSprite({
  cards,
  x,
  y,
  label,
  score,
  showScore = true,
  hideSecondCard = false,
  hideLastCard = false,
  animateIn = false,
  cardSpacing = 80,
  scale = 1,
  isMobile = false,
  isActive = false,
  status,
  canSplit = false,
  onSplit,
}: HandSpriteProps) {
  const startX = -((cards.length - 1) * cardSpacing) / 2;
  const labelY =
    label === "DEALER" ? (isMobile ? 65 : 75) : (isMobile ? -55 : 75);
  const labelX = label === "DEALER" && isMobile ? -60 : -50;

  const scoreBoxX = isMobile ? 85 : 50;
  const scoreTextX = isMobile ? 100 : 92.5;

  const labelStyle = new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: 16,
    fill: "#ffffff",
    align: "center",
    letterSpacing: 2,
  });

  const scoreStyle = new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: 16,
    fill: "#ffffff",
    align: "center",
    fontWeight: '500'
  });

  const statusStyle = new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: 14,
    fill: "#ffe8a3",
    align: "center",
    dropShadow: {
      color: "#000000",
      distance: 2,
    },
  });
  // const isInactive = !isActive && cards.length > 0 && status !== "BUST";
  const isInactive =
    // show inactive overlay only if there are multiple hands (split)
    cards.length > 0 &&
    !isActive &&
    label !== "DEALER";

  // Refs and states for card bounds
  const cardRefs = useRef<Container[]>([]);
  const [cardBounds, setCardBounds] = useState<{ width: number; height: number }[]>(
    []
  );

  useEffect(() => {
    // Reset refs if card count changes
    cardRefs.current = cardRefs.current.slice(0, cards.length);

    if (cards.length === 0) return;

    // Wait until next tick to ensure Pixi has mounted
    const timeout = setTimeout(() => {
      const boundsArray = cards.map((_, index) => {
        const ref = cardRefs.current[index];
        if (ref) {
          try {
            const b = ref.getLocalBounds();
            return { width: b.width, height: b.height };
          } catch {
            // Pixi may not be ready
            return { width: 0, height: 0 };
          }
        }
        return { width: 0, height: 0 };
      });
      setCardBounds(boundsArray);
    }, 0);

    return () => clearTimeout(timeout);
  }, [cards, scale]);


  return (
    <pixiContainer x={x} y={y}>
      {/* Label and Score */}
      <pixiContainer x={labelX} y={labelY}>
        {label && <pixiText text={label} anchor={{ x: 0, y: 0.5 }} style={labelStyle} />}
        {showScore && score !== undefined && (
          <PixiSquareContainer
            drawBackgroundColor="0x000000"
            width={24}
            height={24}
            x={scoreBoxX + scoreTextX}
            drawBackgroundOpacity={"0.3"}>
            <pixiText
              text={score.toString()}
              anchor={{ x: 0.5, y: 0.5 }}
              x={12}
              y={0}
              style={scoreStyle}
            />
          </PixiSquareContainer>
        )}
      </pixiContainer>

      {/* Status */}
      {status && (
        <pixiText
          text={status}
          anchor={{ x: 0.5, y: 0.5 }}
          x={0}
          y={label === "DEALER" ? -cardBounds[0]?.height / 2 - 30 || -90 : cardBounds[0]?.height / 2 + 36 || 120}
          style={statusStyle}
        />
      )}

      {/* Cards */}
      {cards.map((card, index) => {
        const shouldHide = hideSecondCard && index === 1;
        const shouldHideLastCard = hideLastCard && index === cards.length - 1;
        if (shouldHideLastCard) return null;

        const cardX = startX + index * cardSpacing;
        return (
          <pixiContainer
            key={`${card.rank}-${card.suit}-${index}`}
            x={cardX}
            y={0}
            ref={(el) => {
              if (el) cardRefs.current[index] = el;
            }}
          >
            {/* Card */}
            <CardSprite
              rank={card.rank}
              suit={card.suit}
              x={0}
              y={0}
              faceUp={!shouldHide}
              scale={scale}
              animateIn={animateIn}
              animationDelay={0}
              zIndex={index}
            />

            {/* Overlay when inactive */}
            {/* Overlay for inactive (non-active) or completed hands */}
            {cardBounds[index] && label !== "DEALER" && (
              <>
                {/* If hand is not active (because we moved to next split hand) */}
                {(!isActive || status === "BUST" || status === "STAND") && (
                  <pixiGraphics
                    alpha={0.45}
                    zIndex={999}
                    draw={(g) => {
                      g.clear();
                      g.drawRoundedRect(
                        -cardBounds[index].width / 2,
                        -cardBounds[index].height / 2,
                        cardBounds[index].width,
                        cardBounds[index].height,
                        8
                      );
                      g.fill({ color: 0x000000 });
                    }}
                  />
                )}
              </>
            )}

          </pixiContainer>
        );
      })}

      {/* Split Button */}
      {canSplit && cards.length === 2 && (
        <SpliteSprite
          isMobile={isMobile}
          fontSize={isMobile ? 10 : 24}
          onSplit={onSplit}
        />
      )}
    </pixiContainer>
  );
}
