import { getIconTexture, getCardTexture } from "@/lib/utils/pixiAssets";
import { isMobile, TextStyle } from "pixi.js";
import { useCallback } from "react";
import { Card, Hand } from "@/types/game";
import { Text } from 'pixi.js';
import { DropShadowFilter } from "pixi-filters";
type ShuffleModalProps = {
    isOpen: boolean;
    centerX: number;
    centerY: number;
    onClose: () => void;
    lastPlayerCards: Hand[];
    lastDealerCards: Card[];
    isMobile: boolean
};

const suits = ["hearts", "diamonds", "clubs", "spades"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
let fullDeck: Card[] = [];
suits.forEach(suit => {
    ranks.forEach(rank => {
        fullDeck.push({ rank, suit } as Card);
    });
});
function ShuffleModal({
    centerX,
    centerY,
    isOpen,
    onClose,
    lastPlayerCards,
    lastDealerCards,
    isMobile
}: ShuffleModalProps) {
    if (!isOpen) return null;
    const windowWidth = window.innerWidth;
    const modalWidth = isMobile ? windowWidth - 76 : 832;
    const modalHeight = isMobile ? 353 : 595;
    const modalX = centerX - modalWidth / 2;
    const modalY = centerY - modalHeight / 2;
    const lastPlayerCardsList = lastPlayerCards[0]?.cards || [];
    const lastDealerCardsList = lastDealerCards || [];
    const TITLE_STYLE = new TextStyle({
        fontFamily: "Minecraft, monospace",
        fill: "#ffffff",
        fontSize: isMobile ? 12 : 24,
        letterSpacing: 3,
        fontWeight: "500",
        dropShadow: {
            color: "#00000080",
            distance: Math.sqrt(1.5 ** 2 + 1.5 ** 2),
            angle: Math.atan2(1.5, 1.5),
            blur: 0,
        },
    });
    const smallTitleStyle = TITLE_STYLE.clone();
    smallTitleStyle.fontSize = isMobile ? 7 : 14;

    // Remove last hand cards from the full deck
    const remainingDeck = fullDeck.filter(
        c =>
            !lastPlayerCardsList.some(lp => lp.rank === c.rank && lp.suit === c.suit) &&
            !lastDealerCardsList.some(ld => ld.rank === c.rank && ld.suit === c.suit)
    );
    // Shuffle remaining cards
    for (let i = remainingDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remainingDeck[i], remainingDeck[j]] = [remainingDeck[j], remainingDeck[i]];
    }

    // Final deck: last hand first, then shuffled remaining
    const displayDeck = [...lastPlayerCardsList, ...lastDealerCardsList, ...remainingDeck];
    const drawBackground = useCallback(
        (g: any) => {
            g.clear();
            // Main modal body (excluding corners)
            g.roundRect(24, 0, modalWidth - 48, modalHeight, 0);
            g.fill({ color: 0x182325, alpha: 1 });

            // ---------- Top-left edge ----------
            g.roundRect(6, 6, 18, 6, 0);
            g.fill({ color: 0x182325, alpha: 1 });
            g.roundRect(0, 12, 24, 12, 0);
            g.fill({ color: 0x182325, alpha: 1 });
            g.roundRect(-12, 18, 36, 36, 0);
            g.fill({ color: 0x182325, alpha: 1 });
            g.roundRect(-18, 36, 60, 50, 0);
            g.fill({ color: 0x182325, alpha: 1 });

            // ---------- Top-right edge (mirrored horizontally) ----------
            g.roundRect(modalWidth - 24, 6, 18, 12, 0); // mirror top 12x12 rectangle
            g.fill({ color: 0x182325, alpha: 1 });

            g.roundRect(modalWidth - 24, 12, 24, 12, 0); // mirror second rectangle
            g.fill({ color: 0x182325, alpha: 1 });

            g.roundRect(modalWidth - 36, 18, 48, 36, 0); // mirror third rectangle
            g.fill({ color: 0x182325, alpha: 1 });
            g.roundRect(modalWidth - 42, 36, 60, 36, 0);
            g.fill({ color: 0x182325, alpha: 1 });

            // ---------- Bottom-left edge (mirrored vertically) ----------
            g.roundRect(6, modalHeight - 18, 18, 12, 0); // mirror top 12x12 rectangle
            g.fill({ color: 0x182325, alpha: 1 });

            g.roundRect(0, modalHeight - 24, 24, 12, 0); // mirror second rectangle
            g.fill({ color: 0x182325, alpha: 1 });

            g.roundRect(-12, modalHeight - 48, 48, 30, 0); // mirror third rectangle
            g.fill({ color: 0x182325, alpha: 1 });
            g.roundRect(-18, modalHeight - 74, 60, 36, 0);
            g.fill({ color: 0x182325, alpha: 1 });

            // ---------- Bottom-right edge (mirrored horizontally and vertically) ----------
            g.roundRect(modalWidth - 24, modalHeight - 18, 18, 12, 0); // mirror first rectangle
            g.fill({ color: 0x182325, alpha: 1 });

            g.roundRect(modalWidth - 24, modalHeight - 24, 24, 12, 0); // mirror second rectangle
            g.fill({ color: 0x182325, alpha: 1 });

            g.roundRect(modalWidth - 36, modalHeight - 48, 48, 30, 0); // mirror third rectangle
            g.fill({ color: 0x182325, alpha: 1 });
            g.roundRect(modalWidth - 42, modalHeight - 74, 60, 36, 0);
            g.fill({ color: 0x182325, alpha: 1 });

            g.roundRect(-18, 48, modalWidth + 36, modalHeight - 48 * 2, 0); // rest rectangle fill
            g.fill({ color: 0x182325, alpha: 1 });

        },
        [modalWidth, modalHeight]
    );


    const leftPadding = isMobile ? 38 : 103; // consistent left alignment
    const topTitleY = isMobile ? 15 : 50;
    const baseY = isMobile ? 40 : 84; // vertical position for dealer/player section
    const sectionGap = 30; // horizontal gap between dealer and player
    const targetWidth = isMobile ? 25 : 48;
    const targetHeight = isMobile ? 34 : 66;

    // Compute widths dynamically (approximate based on number of cards)
    const dealerWidth = (lastPlayerCards[0]?.cards.length) * (targetWidth + 3);
    const dealerSectionX = Math.max(dealerWidth, 0) + sectionGap;

    return (
        <pixiContainer
            x={modalX}
            y={modalY}
            sortableChildren={true}
            zIndex={100}
        >
            {/* Background */}
            <pixiGraphics draw={drawBackground}
                filters={[
                    new DropShadowFilter({
                        color: 0x000000,
                        alpha: 0.7,
                        blur: 0.25,
                        offset: { x: 10, y: 10 },
                    })]} />

            {/* Close Button */}
            <pixiSprite
                texture={getIconTexture("xButton")}
                x={isMobile ? modalWidth - 36 : modalWidth - 62}
                y={isMobile ? 22 : 58}
                anchor={0.5}
                scale={0.8}
                eventMode="static"
                cursor="pointer"
                onPointerDown={onClose}
                onTap={onClose}
            />

            {/* Title */}
            <pixiText
                text="LAST HAND"
                x={leftPadding}
                y={topTitleY}
                anchor={0} // left align
                style={TITLE_STYLE}
            />

            {/* Horizontal row: Dealer + Player */}
            <pixiContainer x={leftPadding} y={baseY}>
                {/* Player Section */}
                <pixiContainer x={0} y={0}>
                    <pixiText
                        text="YOU"
                        x={0}
                        y={0}
                        anchor={0} // left align
                        style={smallTitleStyle}
                    />
                    <pixiContainer x={0} y={isMobile ? 16 : 24}>
                        {lastPlayerCards?.[0]?.cards.map((card, index) => {
                            const texture = getCardTexture(card.rank, card.suit);
                            const spriteWidth = texture.width;
                            const spriteHeight = texture.height;

                            // Calculate scale to match target size
                            const scaleX = targetWidth / spriteWidth;
                            const scaleY = targetHeight / spriteHeight;

                            return (
                                <pixiSprite
                                    key={`player-${index}`}
                                    texture={texture}
                                    x={index * (targetWidth + 3)}
                                    y={0}
                                    anchor={0}
                                    scale={{ x: scaleX, y: scaleY }}
                                    filters={[
                                        new DropShadowFilter({
                                            color: 0xffffff,
                                            alpha: 1,
                                            blur: 2,
                                            offset: { x: 0, y: 0 }
                                        })
                                    ]}
                                />
                            );
                        })}
                    </pixiContainer>
                </pixiContainer>
                {/* Dealer Section */}
                <pixiContainer x={dealerSectionX} y={0}>
                    {(() => {
                        const tempText = new Text("YOU", smallTitleStyle);
                        const textWidth = tempText.width;
                        const dealerWidth = lastDealerCards.length > 0 ? 0 : textWidth + sectionGap;
                        return (
                            <>
                                <pixiText
                                    text="DEALER"
                                    x={dealerWidth}
                                    y={0}
                                    anchor={0} // left align
                                    style={smallTitleStyle}
                                />
                            </>
                        );
                    })()}

                    <pixiContainer x={0} y={isMobile ? 16 : 24}>
                        {lastDealerCards.map((card, index) => {
                            const texture = getCardTexture(card.rank, card.suit);
                            const spriteWidth = texture.width;
                            const spriteHeight = texture.height;

                            // Calculate scale to match target size
                            const scaleX = targetWidth / spriteWidth;
                            const scaleY = targetHeight / spriteHeight;

                            return (
                                <pixiSprite
                                    key={`dealer-${index}`}
                                    texture={texture}
                                    x={index * (targetWidth + 3)}
                                    y={0}
                                    anchor={0}
                                    scale={{ x: scaleX, y: scaleY }}
                                    filters={[
                                        new DropShadowFilter({
                                            color: 0xFE4C40,
                                            alpha: 1,
                                            blur: 2,
                                            offset: { x: 0, y: 0 }
                                        })
                                    ]}
                                />
                            );
                        })}
                    </pixiContainer>
                </pixiContainer>
            </pixiContainer>
            <pixiContainer
                x={leftPadding}
                y={isMobile ? baseY + 60 : baseY + 120}>
                <pixiContainer
                    x={0}
                    y={0}>
                    <pixiText
                        text="SHUFFLE"
                        x={0}
                        y={0}
                        anchor={0} // left align
                        style={TITLE_STYLE}
                    />
                </pixiContainer>
                <pixiContainer
                    x={isMobile ? modalWidth - leftPadding + 10 : modalWidth - leftPadding - 10}
                    y={10}
                    anchor={{ x: 1, y: 0.5 }}
                >
                    {/* Measure text width */}
                    {(() => {
                        const tempText = new Text("IS THIS FAIR?", smallTitleStyle);
                        const textWidth = tempText.width;

                        return (
                            <>
                                <pixiText
                                    text="IS THIS FAIR?"
                                    x={-textWidth - leftPadding - 20}
                                    y={0}
                                    anchor={{ x: 0, y: 0.5 }}
                                    style={smallTitleStyle}
                                />
                                <pixiSprite
                                    texture={getIconTexture("tooltip")}
                                    x={-textWidth + 30}
                                    y={-3}
                                    anchor={{ x: 0, y: 0.5 }}
                                    scale={isMobile ? 0.5 : 1}
                                />
                            </>
                        );
                    })()}
                </pixiContainer>
                {lastPlayerCards && lastDealerCards && lastPlayerCards.length > 0 && lastDealerCards.length > 0 &&
                    <pixiContainer x={0} y={isMobile ? 20 : 40}>
                        {displayDeck.map((card, index) => {
                            const texture = getCardTexture(card.rank, card.suit);
                            const scaleX = targetWidth / texture.width;
                            const scaleY = targetHeight / texture.height;
                            const cardsPerRow = isMobile ? 10 : 13; //  cards per row for desktop and mobile

                            const colIndex = index % cardsPerRow;
                            const rowIndex = Math.floor(index / cardsPerRow);
                            // Detect which group the card belongs to
                            const isPlayerCard = lastPlayerCardsList.some(
                                (lp) => lp.rank === card.rank && lp.suit === card.suit
                            );
                            const isDealerCard = lastDealerCardsList.some(
                                (ld) => ld.rank === card.rank && ld.suit === card.suit
                            );
                            // Assign filter conditionally
                            let filters: any[] = [];
                            if (isPlayerCard) {
                                filters = [
                                    new DropShadowFilter({
                                        color: 0xffffff,
                                        alpha: 1,
                                        blur: 3,
                                        offset: { x: 0, y: 0 },
                                    }),
                                ];
                            } else if (isDealerCard) {
                                filters = [
                                    new DropShadowFilter({
                                        color: 0xfe4c40,
                                        alpha: 1,
                                        blur: 3,
                                        offset: { x: 0, y: 0 },
                                    }),
                                ];
                            }
                            return (
                                <pixiSprite
                                    key={`${card.suit}-${card.rank}-${index}`}
                                    texture={texture}
                                    x={colIndex * (targetWidth + 3)}
                                    y={rowIndex * (targetHeight + 3)}
                                    anchor={0}
                                    scale={{ x: scaleX, y: scaleY }}
                                    filters={filters}
                                />
                            );
                        })}

                    </pixiContainer>}

            </pixiContainer>
        </pixiContainer>
    );
}

export default ShuffleModal;
