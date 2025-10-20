"use client";

import React from "react";
import { GameState, GamePhaseType, HandResultType, Card } from "@/types/game";

interface GameStateSelectorProps {
  onSelectState: (state: Partial<GameState>) => void;
}

// Predefined game states for testing
const gameStates = {
  betting: {
    name: "Betting Phase",
    state: {
      gamePhase: GamePhaseType.BETTING,
      playerHands: [],
      dealerHand: {
        cards: [],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      pendingBet: 0,
      placedChips: [],
      message: "Place your bet",
    },
  },
  playerHas20: {
    name: "Player Has 20",
    state: {
      gamePhase: GamePhaseType.PLAYING,
      playerHands: [
        {
          cards: [
            { rank: "K", suit: "hearts" } as Card,
            { rank: "Q", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: false,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "7", suit: "clubs" } as Card,
          { rank: "9", suit: "spades" } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      message: "Hit or Stand?",
      canDouble: false,
      canSplit: false,
      canSurrender: false,
    },
  },
  playerBlackjack: {
    name: "Player Blackjack",
    state: {
      gamePhase: GamePhaseType.PLAYING,
      playerHands: [
        {
          cards: [
            { rank: "A", suit: "spades" } as Card,
            { rank: "K", suit: "hearts" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: false,
          isBusted: false,
          isBlackjack: true,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "7", suit: "clubs" } as Card,
          { rank: "9", suit: "spades" } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      message: "Blackjack!",
      canDouble: false,
      canSplit: false,
      canSurrender: false,
    },
  },
  playerBusted: {
    name: "Player Busted",
    state: {
      gamePhase: GamePhaseType.FINISHED,
      playerHands: [
        {
          cards: [
            { rank: "K", suit: "hearts" } as Card,
            { rank: "Q", suit: "diamonds" } as Card,
            { rank: "5", suit: "clubs" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: false,
          isBusted: true,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "7", suit: "clubs" } as Card,
          { rank: "9", suit: "spades" } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: true,
      },
      message: "Bust! You lose $100",
      result: "LOSE" as const,
      handResults: [
        {
          handIndex: 0,
          bet: 100,
          result: HandResultType.LOSE,
          payout: 0,
          profit: -100,
          timestamp: new Date().toISOString(),
        },
      ],
    },
  },
  dealerBusted: {
    name: "Dealer Busted (Win)",
    state: {
      gamePhase: GamePhaseType.FINISHED,
      playerHands: [
        {
          cards: [
            { rank: "K", suit: "hearts" } as Card,
            { rank: "9", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: true,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "10", suit: "clubs" } as Card,
          { rank: "9", suit: "spades" } as Card,
          { rank: "5", suit: "hearts" } as Card,
        ],
        isStanding: false,
        isBusted: true,
        isBlackjack: false,
        showAllCards: true,
      },
      message: "Dealer busts! You win $200",
      result: "WIN" as const,
      balance: 27518,
      totalWon: 200,
      gameProfit: 100,
      handResults: [
        {
          handIndex: 0,
          bet: 100,
          result: HandResultType.WIN,
          payout: 200,
          profit: 100,
          timestamp: new Date().toISOString(),
        },
      ],
    },
  },
  push: {
    name: "Push (Tie)",
    state: {
      gamePhase: GamePhaseType.FINISHED,
      playerHands: [
        {
          cards: [
            { rank: "K", suit: "hearts" } as Card,
            { rank: "9", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: true,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "Q", suit: "clubs" } as Card,
          { rank: "9", suit: "spades" } as Card,
        ],
        isStanding: true,
        isBusted: false,
        isBlackjack: false,
        showAllCards: true,
      },
      message: "Push! Your bet of $100 is returned",
      result: "PUSH" as const,
      balance: 27318,
      totalWon: 100,
      gameProfit: 0,
      handResults: [
        {
          handIndex: 0,
          bet: 100,
          result: HandResultType.PUSH,
          payout: 100,
          profit: 0,
          timestamp: new Date().toISOString(),
        },
      ],
    },
  },
  canSplit: {
    name: "Can Split (Pair of 8s)",
    state: {
      gamePhase: GamePhaseType.PLAYING,
      playerHands: [
        {
          cards: [
            { rank: "8", suit: "hearts" } as Card,
            { rank: "8", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: false,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "7", suit: "clubs" } as Card,
          { rank: "?", suit: "hidden" } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      message: "You can split your pair!",
      canDouble: true,
      canSplit: true,
      canSurrender: true,
    },
  },
  splitHands: {
    name: "Split Hands (2 Hands)",
    state: {
      gamePhase: GamePhaseType.PLAYING,
      currentHandIndex: 0,
      playerHands: [
        {
          cards: [
            { rank: "8", suit: "hearts" } as Card,
            { rank: "3", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: false,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: true,
          isSplitAces: false,
        },
        {
          cards: [
            { rank: "8", suit: "diamonds" } as Card,
            { rank: "9", suit: "clubs" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: false,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: true,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "7", suit: "clubs" } as Card,
          { rank: "?", suit: "hidden" } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      message: "Playing hand 1 of 2",
      canDouble: true,
      canSplit: false,
      canSurrender: false,
    },
  },
  splitAces: {
    name: "Split Aces",
    state: {
      gamePhase: GamePhaseType.PLAYING,
      currentHandIndex: 0,
      playerHands: [
        {
          cards: [
            { rank: "A", suit: "hearts" } as Card,
            { rank: "K", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: true,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: true,
          isSplitAces: true,
        },
        {
          cards: [
            { rank: "A", suit: "spades" } as Card,
            { rank: "9", suit: "clubs" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: true,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: true,
          isSplitAces: true,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "7", suit: "clubs" } as Card,
          { rank: "?", suit: "hidden" } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      message: "Split aces complete - one card each",
      canDouble: false,
      canSplit: false,
      canSurrender: false,
    },
  },
  splitWin: {
    name: "Split Win (Both Hands Win)",
    state: {
      gamePhase: GamePhaseType.FINISHED,
      playerHands: [
        {
          cards: [
            { rank: "8", suit: "hearts" } as Card,
            { rank: "K", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: true,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: true,
          isSplitAces: false,
        },
        {
          cards: [
            { rank: "8", suit: "diamonds" } as Card,
            { rank: "Q", suit: "clubs" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: true,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: true,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "7", suit: "clubs" } as Card,
          { rank: "9", suit: "spades" } as Card,
        ],
        isStanding: true,
        isBusted: false,
        isBlackjack: false,
        showAllCards: true,
      },
      message: "Both hands win! You win $400",
      result: "WIN" as const,
      balance: 27518,
      totalWon: 400,
      gameProfit: 200,
      handResults: [
        {
          handIndex: 0,
          bet: 100,
          result: HandResultType.WIN,
          payout: 200,
          profit: 100,
          timestamp: new Date().toISOString(),
        },
        {
          handIndex: 1,
          bet: 100,
          result: HandResultType.WIN,
          payout: 200,
          profit: 100,
          timestamp: new Date().toISOString(),
        },
      ],
    },
  },
  canDouble: {
    name: "Can Double Down",
    state: {
      gamePhase: GamePhaseType.PLAYING,
      playerHands: [
        {
          cards: [
            { rank: "5", suit: "hearts" } as Card,
            { rank: "6", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: false,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "6", suit: "clubs" } as Card,
          { rank: "?", suit: "hidden" } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      message: "Good spot to double down!",
      canDouble: true,
      canSplit: false,
      canSurrender: true,
    },
  },
  doubled: {
    name: "Doubled Down Hand",
    state: {
      gamePhase: GamePhaseType.PLAYING,
      playerHands: [
        {
          cards: [
            { rank: "5", suit: "hearts" } as Card,
            { rank: "6", suit: "diamonds" } as Card,
            { rank: "9", suit: "clubs" } as Card,
          ],
          bet: 200,
          originalBet: 100,
          isStanding: true,
          isBusted: false,
          isBlackjack: false,
          isDoubled: true,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "6", suit: "clubs" } as Card,
          { rank: "?", suit: "hidden" } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      message: "You doubled down - total 20",
      canDouble: false,
      canSplit: false,
      canSurrender: false,
    },
  },
  insuranceOffered: {
    name: "Insurance Offered",
    state: {
      gamePhase: GamePhaseType.ASK_INSURANCE,
      playerHands: [
        {
          cards: [
            { rank: "K", suit: "hearts" } as Card,
            { rank: "9", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: false,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "A", suit: "clubs" } as Card,
          { rank: "?", suit: "hidden" } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      message: "Dealer shows Ace. Insurance?",
      insuranceOffered: true,
      canDouble: false,
      canSplit: false,
      canSurrender: false,
    },
  },
  shuffle: {
    name: "SHUFFLE",
    state: {
      gamePhase: GamePhaseType.SHUFFLE,
      playerHands: [
        {
          cards: [
            { rank: "4", suit: "diamonds" } as Card,
            { rank: "5", suit: "diamonds" } as Card,
            { rank: "8", suit: "clubs" } as Card,
            { rank: "2", suit: "hearts" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: false,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "J", suit: "clubs" } as Card,
          { rank: "9", suit: "clubs" } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      message: "Dealer shows Ace. Insurance?",
      insuranceOffered: true,
      canDouble: false,
      canSplit: false,
      canSurrender: false,
    },
  },
};

export function GameStateSelector({ onSelectState }: GameStateSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKey = e.target.value;
    if (selectedKey && gameStates[selectedKey as keyof typeof gameStates]) {
      onSelectState(gameStates[selectedKey as keyof typeof gameStates].state);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed top-4 left-20 z-40">
      <select
        onChange={handleChange}
        defaultValue=""
        className="bg-gray-800 text-white text-sm px-3 py-2 rounded border border-gray-600 hover:bg-gray-700 cursor-pointer shadow-lg"
        style={{ fontFamily: "system-ui" }}
      >
        <option value="" disabled>
          🎮 Dev: Select Game State
        </option>
        {Object.entries(gameStates).map(([key, { name }]) => (
          <option key={key} value={key}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}

