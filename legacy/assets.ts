/**
 * Asset path utilities for type-safe asset references
 */

const ASSETS_BASE = "/assets";

export const AssetPaths = {
  // Images
  images: {
    cards: `${ASSETS_BASE}/images/cards`,
    backgrounds: `${ASSETS_BASE}/images/backgrounds`,
    ui: `${ASSETS_BASE}/images/ui`,
    logos: `${ASSETS_BASE}/images/logos`,
  },

  // Icons
  icons: {
    social: `${ASSETS_BASE}/icons/social`,
    actions: `${ASSETS_BASE}/icons/actions`,
    game: `${ASSETS_BASE}/icons/game`,
  },

  // Fonts
  fonts: `${ASSETS_BASE}/fonts`,

  // Sounds
  sounds: {
    effects: `${ASSETS_BASE}/sounds/effects`,
    music: `${ASSETS_BASE}/sounds/music`,
  },

  // Videos
  videos: `${ASSETS_BASE}/videos`,
} as const;

/**
 * Helper function to get card image path
 * @param rank - Card rank (A, 2-10, J, Q, K)
 * @param suit - Card suit (hearts, diamonds, clubs, spades or H, D, C, S)
 * @example getCardImage('A', 'spades') // Ace of Spades -> AS.png
 */
export function getCardImage(rank: string, suit: string): string {
  // Convert full suit names to abbreviations
  const suitMap: Record<string, string> = {
    hearts: "H",
    diamonds: "D",
    clubs: "C",
    spades: "S",
    H: "H",
    D: "D",
    C: "C",
    S: "S",
  };
  const suitAbbr = suitMap[suit] || suit;
  return `${AssetPaths.images.cards}/${rank}${suitAbbr}.png`;
}

/**
 * Helper function to get card back image
 */
export function getCardBackImage(): string {
  return `${AssetPaths.images.cards}/BACK.png`;
}

/**
 * Helper function to get icon path
 * @param category - Icon category (social, actions, game)
 * @param name - Icon name
 * @param extension - File extension (default: svg)
 */
export function getIcon(
  category: "social" | "actions" | "game",
  name: string,
  extension: string = "svg"
): string {
  return `${AssetPaths.icons[category]}/${name}.${extension}`;
}

/**
 * Helper function to get sound effect path
 * @param name - Sound effect name
 * @param extension - File extension (default: mp3)
 */
export function getSoundEffect(
  name: string,
  extension: string = "mp3"
): string {
  return `${AssetPaths.sounds.effects}/${name}.${extension}`;
}

/**
 * Helper function to get background music path
 * @param name - Music track name
 * @param extension - File extension (default: mp3)
 */
export function getMusic(name: string, extension: string = "mp3"): string {
  return `${AssetPaths.sounds.music}/${name}.${extension}`;
}

/**
 * Helper function to get UI image path
 * @param name - UI element name
 * @param extension - File extension (default: png)
 */
export function getUIImage(name: string, extension: string = "png"): string {
  return `${AssetPaths.images.ui}/${name}.${extension}`;
}

/**
 * Helper function to get logo path
 * @param name - Logo name
 * @param extension - File extension (default: png)
 */
export function getLogo(name: string, extension: string = "png"): string {
  return `${AssetPaths.images.logos}/${name}.${extension}`;
}

/**
 * Helper function to get background image path
 * @param name - Background name
 * @param extension - File extension (default: jpg)
 */
export function getBackground(name: string, extension: string = "jpg"): string {
  return `${AssetPaths.images.backgrounds}/${name}.${extension}`;
}
