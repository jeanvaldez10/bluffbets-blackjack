/**
 * PixiJS Asset Management Utilities
 * Following official PixiJS v8 documentation: https://pixijs.com/8.x/guides/components/assets
 */

import { Assets, Texture } from "pixi.js";

// Card suits and ranks
export const SUITS = ["C", "D", "H", "S"] as const;
export const RANKS = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
] as const;

export type Suit = (typeof SUITS)[number];
export type Rank = (typeof RANKS)[number];

// Track if Assets have been loaded
let assetsLoaded = false;

/**
 * Preload all game assets using the basic PixiJS Assets.load() pattern
 * Docs: https://pixijs.com/8.x/guides/components/assets
 */
export async function preloadGameAssets() {
  if (assetsLoaded) {
    return true;
  }

  try {
    const assetsToLoad: Array<{ alias: string; src: string }> = [];

    // Background
    assetsToLoad.push({
      alias: "mainBackground",
      src: "/assets/images/backgrounds/main-background.png",
    });

    // Mobile Background
    assetsToLoad.push({
      alias: "mobileBackground",
      src: "/assets/images/backgrounds/blackjack-mobile.png",
    });

    // Bevel frame
    assetsToLoad.push({
      alias: "bevel",
      src: "/assets/images/backgrounds/bevel.png",
    });

    // UI assets
    assetsToLoad.push(
      { alias: "deck", src: "/assets/images/ui/deck.png" },
      { alias: "logo", src: "/assets/images/logos/bluff-b.png" },
      { alias: "xButton", src: "/assets/icons/actions/x-button.svg" },
      { alias: "tooltip", src: "/assets/icons/actions/tooltip.svg" },
      { alias: "split", src: "/assets/icons/actions/split.svg" },
      { alias: "square", src: "/assets/icons/actions/square.svg" },
      { alias: "draw", src: "/assets/icons/actions/draw.svg" },
      { alias: "pair", src: "/assets/icons/actions/pair-square.svg" },
    );

    // Chip textures
    [1, 5, 10, 25, 100].forEach((value) => {
      assetsToLoad.push({
        alias: `chip${value}`,
        src: `/assets/images/ui/chip-${value}.png`,
      });
    });

    // Card back
    assetsToLoad.push({
      alias: "BACK",
      src: "/assets/images/cards/BACK.png",
    });

    // All 52 playing cards
    SUITS.forEach((suit) => {
      RANKS.forEach((rank) => {
        assetsToLoad.push({
          alias: `${rank}${suit}`,
          src: `/assets/images/cards/${rank}${suit}.png`,
        });
      });
    });

    // Load all assets
    await Assets.load(assetsToLoad);

    assetsLoaded = true;
    return true;
  } catch (error) {
    console.error("Error loading assets:", error);
    throw error;
  }
}

/**
 * Convert full suit name to abbreviation
 */
function getSuitAbbreviation(suit: string): string {
  const suitMap: { [key: string]: string } = {
    hearts: "H",
    diamonds: "D",
    clubs: "C",
    spades: "S",
    // Also support abbreviations directly
    H: "H",
    D: "D",
    C: "C",
    S: "S",
  };
  return suitMap[suit.toLowerCase()] || suit;
}

/**
 * Get a card texture by rank and suit
 */
export function getCardTexture(rank: string, suit: string): Texture {
  const suitAbbrev = getSuitAbbreviation(suit);
  const cardName = `${rank}${suitAbbrev}`;
  const texture = Assets.get(cardName);
  if (!texture) {
    throw new Error(
      `Card texture not found: ${cardName} (original suit: ${suit})`
    );
  }
  return texture;
}

/**
 * Get the card back texture
 */
export function getCardBackTexture(): Texture {
  const texture = Assets.get("BACK");
  if (!texture) {
    throw new Error("Card back texture not found: BACK");
  }
  return texture;
}

/**
 * Get a chip texture by value
 */
export function getChipTexture(value: number): Texture {
  const chipKey = `chip${value}`;
  const texture = Assets.get(chipKey);
  if (!texture) {
    throw new Error(`Chip texture not found: ${chipKey}`);
  }
  return texture;
}

/**
 * Get UI texture by name
 */
export function getUITexture(name: string): Texture {
  const texture = Assets.get(name);
  if (!texture) {
    throw new Error(`UI texture not found: ${name}`);
  }
  return texture;
}

/**
 * Get icon texture by name
 */
export function getIconTexture(name: string): Texture {
  const texture = Assets.get(name);
  if (!texture) {
    throw new Error(`Icon texture not found: ${name}`);
  }
  return texture;
}

/**
 * Get background texture (desktop)
 */
export function getBackgroundTexture(): Texture {
  const texture = Assets.get("mainBackground");
  if (!texture) {
    throw new Error("Background texture not found: mainBackground");
  }
  return texture;
}

/**
 * Get mobile background texture
 */
export function getMobileBackgroundTexture(): Texture {
  const texture = Assets.get("mobileBackground");
  if (!texture) {
    throw new Error("Mobile background texture not found: mobileBackground");
  }
  return texture;
}

/**
 * Check if all assets are loaded
 */
export function areAssetsLoaded(): boolean {
  return assetsLoaded;
}
