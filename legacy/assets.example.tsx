/**
 * Example usage of asset utilities
 * This file demonstrates how to use the asset helper functions
 * You can delete this file once you're familiar with the patterns
 */

import Image from 'next/image';
import { 
  getCardImage, 
  getCardBackImage, 
  getIcon, 
  getSoundEffect,
  getUIImage,
  getLogo,
  AssetPaths 
} from './assets';

export function AssetExamples() {
  return (
    <div className="space-y-4 p-4">
      {/* Example 1: Using card images */}
      <div>
        <h3>Card Images</h3>
        <Image 
          src={getCardImage('spades', 'ace')} 
          alt="Ace of Spades"
          width={100}
          height={140}
        />
        <Image 
          src={getCardBackImage()} 
          alt="Card Back"
          width={100}
          height={140}
        />
      </div>

      {/* Example 2: Using icons */}
      <div>
        <h3>Action Icons</h3>
        <img 
          src={getIcon('actions', 'hit')} 
          alt="Hit"
          className="w-8 h-8"
        />
        <img 
          src={getIcon('actions', 'stand')} 
          alt="Stand"
          className="w-8 h-8"
        />
      </div>

      {/* Example 3: Using UI images */}
      <div>
        <h3>UI Elements</h3>
        <Image
          src={getUIImage('chip-100')}
          alt="$100 Chip"
          width={50}
          height={50}
        />
      </div>

      {/* Example 4: Using logos */}
      <div>
        <h3>Logo</h3>
        <Image
          src={getLogo('bluffbets-logo')}
          alt="BluffBets"
          width={200}
          height={50}
        />
      </div>

      {/* Example 5: Direct path access */}
      <div>
        <h3>Direct Paths</h3>
        <p>Cards directory: {AssetPaths.images.cards}</p>
        <p>Sound effects: {AssetPaths.sounds.effects}</p>
      </div>

      {/* Example 6: Audio with sound effects */}
      <button 
        onClick={() => {
          const audio = new Audio(getSoundEffect('card-flip'));
          audio.play();
        }}
      >
        Play Card Flip Sound
      </button>
    </div>
  );
}

/**
 * Example: Preloading critical assets
 */
export function preloadCriticalAssets() {
  // Preload card images
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];
  
  suits.forEach(suit => {
    ranks.forEach(rank => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = getCardImage(suit, rank);
      document.head.appendChild(link);
    });
  });
  
  // Preload card back
  const cardBackLink = document.createElement('link');
  cardBackLink.rel = 'preload';
  cardBackLink.as = 'image';
  cardBackLink.href = getCardBackImage();
  document.head.appendChild(cardBackLink);
}

