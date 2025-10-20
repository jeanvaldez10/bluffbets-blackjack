/**
 * Card utility functions for blackjack
 */

import { Card, Hand, DealerHand } from "@/types/game";

/**
 * Calculate the value of a hand
 */
export function calculateHandValue(cards: Card[]): number {
  let value = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === "A") {
      aces++;
      value += 11;
    } else if (["K", "Q", "J"].includes(card.rank)) {
      value += 10;
    } else {
      value += parseInt(card.rank);
    }
  }

  // Adjust for aces
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}

/**
 * Get player hand value
 */
export function getPlayerHandValue(hand: Hand): number {
  return calculateHandValue(hand.cards);
}

/**
 * Get dealer hand value (considering hidden card)
 */
export function getDealerHandValue(hand: DealerHand): number {
  if (!hand.showAllCards && hand.cards.length > 0) {
    // Only show first card
    return calculateHandValue([hand.cards[0]]);
  }
  return calculateHandValue(hand.cards);
}
