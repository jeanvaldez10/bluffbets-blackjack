/**
 * Game Type Definitions for Blackjack
 */

// Game Action Types - All possible player actions
export enum GameActionType {
  PLACE_BET = "PLACE_BET",
  START_ROUND = "START_ROUND",
  HIT = "HIT",
  STAND = "STAND",
  DOUBLE = "DOUBLE",
  SPLIT = "SPLIT",
  SURRENDER = "SURRENDER",
  INSURANCE = "INSURANCE",
  DECLINE_INSURANCE = "DECLINE_INSURANCE",
  PLAY_AGAIN = "PLAY_AGAIN",
  START_NEW_GAME = "START_NEW_GAME",
  RESET_GAME = "RESET_GAME",
  SWITCH_HAND = "SWITCH_HAND",
  CLEAR_BET = "CLEAR_BET", // Local action, not API
}

// Card representation
export interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades" | "hidden";
  rank:
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "?";
  isHidden?: boolean;
}

// Player hand
export interface Hand {
  cards: Card[];
  bet: number;
  originalBet: number; // Track the original bet amount before doubling/splitting
  isStanding: boolean;
  isBusted: boolean;
  isBlackjack: boolean;
  isDoubled: boolean;
  isSurrendered: boolean;
  isFromSplit: boolean; // Track if this hand was created from splitting
  isSplitAces: boolean; // Track if this hand was created from splitting aces
}

// Dealer hand for frontend - hides second card until revealed
export interface FrontendDealerHand {
  cards: Card[];
  isStanding: boolean;
  isBusted: boolean;
  isBlackjack: boolean;
  showAllCards: boolean; // Whether to show all cards or just the first one
}

// Game Phase Types
export enum GameStatePhaseType {
  BETTING,
  ASK_INSURANCE, // optional
  PLAYING,
  DEALER_TURN, // internal phase, should never be returned to the user
  FINISHED,
  SHUFFLE
}

// Alias for compatibility
export const GamePhaseType = GameStatePhaseType;
export type GamePhaseType = GameStatePhaseType;

// Hand result types
export enum HandResultType {
  WIN,
  LOSE,
  PUSH,
  BLACKJACK,
  SURRENDER,
}

// Hand result
export interface HandResult {
  handIndex: number;
  bet: number;
  result: HandResultType;
  payout: number;
  profit: number; // Payout - bet (positive for win, negative for loss)
  timestamp: string;
}

// Main Game State (internal)
export interface GameState {
  gameId: string;
  shuffleId: string;
  shuffleSalt?: string; // Store the salt used for this shuffle (optional for backward compatibility)
  dealtCardCount: number; // Number of cards dealt from the deterministic deck
  playerHands: Hand[];
  dealerHand: FrontendDealerHand;
  currentHandIndex: number;
  // TODO: game state probably shouldn't be tracking balance
  balance: number; // Current balance (updated by effects)
  pendingBet: number; // Individual bet amount being placed
  initialBet: number; // The original bet placed when the game started
  gamePhase: GameStatePhaseType;
  message: string;
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
  insuranceOffered: boolean;
  shuffle: boolean;
  insuranceWasOffered: boolean; // Track if insurance was offered during this game (never reset)
  insuranceBet: number; // Amount of insurance bet placed
  dealerHasBlackjack: boolean | undefined;
  dealingStep: number;
  isDealing: boolean;
  isDealingInProgress: boolean;
  lastProcessedStep: number;
  dealerDealingStep: number;
  isDealerDealing: boolean;
  // Bust sequence tracking
  isBustSequence: boolean;
  bustSequenceStep: number;
  // Dealer bust reveal tracking
  dealerBustRevealStep: number;
  // Balance tracking (moved to effects - these are for display only)
  startingBalance: number; // Balance at the start of the game
  totalWagered: number; // Total amount wagered in this game
  totalWon: number; // Total amount won in this game
  currentHandProfit: number; // Profit/loss for current hand
  gameProfit: number; // Total profit/loss for this game
  handResults: HandResult[]; // Results for each completed hand
  result?: "WIN" | "LOSE" | "PUSH" | "BUST"; // Overall game result (set when game finishes)
  userId: string; // User ID for balance management
  placedChips: number[]; // Track actual chips placed by user (UI only)
}

// Frontend game state without the deck (for security)
export interface FrontendGameState {
  gameId: string;
  shuffleId: string;
  shuffleSalt?: string; // Include shuffle salt for verification
  playerHands: Hand[];
  dealerHand: FrontendDealerHand;
  currentHandIndex: number;
  balance: number; // This will be populated by effects
  pendingBet: number; // Individual bet amount being placed
  initialBet: number; // The original bet placed when the game started
  gamePhase: GameStatePhaseType;
  message: string;
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
  insuranceOffered: boolean;
  shuffle: boolean;
  insuranceWasOffered: boolean; // Track if insurance was offered during this game (never reset)
  insuranceBet: number; // Amount of insurance bet placed
  dealerHasBlackjack: boolean;
  dealingStep: number;
  isDealing: boolean;
  isDealingInProgress: boolean;
  lastProcessedStep: number;
  dealerDealingStep: number;
  isDealerDealing: boolean;
  // Bust sequence tracking
  isBustSequence: boolean;
  bustSequenceStep: number;
  // Dealer bust reveal tracking
  dealerBustRevealStep: number;
  // Balance tracking (populated by effects)
  startingBalance: number;
  totalWagered: number;
  totalWon: number;
  currentHandProfit: number;
  gameProfit: number;
  handResults: HandResult[];
  result?: "WIN" | "LOSE" | "PUSH" | "BUST"; // Overall game result (set when game finishes)
}

export interface ShuffleVerification {
  shuffleId: string;
  canBeVerified: boolean;
  saltHash: string;
  salt?: string; // Only present when salt is revealed (after game ends)
  shuffledDeck?: Card[]; // Only present when salt is revealed (for verification)
  timestamp: string;
  isSaltRevealed: boolean;
}

export interface AvailableAction {
  action: string;
  description: string;
}

export interface GameResponse {
  sessionId: string;
  gameState: FrontendGameState;
  results?: Array<{ handIndex: number; result: string; payout: number }>;
  totalPayout?: number;
  gameResults?: {
    results: Array<{ handIndex: number; result: string; payout: number }>;
    totalPayout: number;
    message: string;
  };
  shuffleVerification?: ShuffleVerification;
  availableActions?: AvailableAction[];
  error?: string;
  updatedBalance?: number;
}

export interface GameActionRequest {
  sessionId?: string;
  action: GameActionType;
  amount?: number;
}

// Type alias for DealerHand compatibility
export type DealerHand = FrontendDealerHand;
