/**
 * Mock Game API - Server-friendly implementation that mirrors the real game flow.
 * Supports multi-hand play (splits, doubles) so the frontend can exercise all states.
 */

import {
  GameState,
  GamePhaseType,
  Card,
  Hand,
  HandResultType,
  GameActionType,
} from "@/types/game";

// Deck order is tuned so the initial deal gives the player 8 (4♠ + 4♦),
// the dealer 16 (9♣ + 7♠), and the next hit for the player is a 10.
const mockDeck: Card[] = [
  { rank: "4", suit: "spades" }, // Player card 1
  { rank: "9", suit: "clubs" }, // Dealer card 1
  { rank: "4", suit: "diamonds" }, // Player card 2 -> total 8
  { rank: "7", suit: "spades" }, // Dealer card 2 -> total 16
  { rank: "10", suit: "hearts" }, // Player hit card -> +10
  { rank: "5", suit: "hearts" }, // Dealer hit card (if needed)
  { rank: "Q", suit: "diamonds" },
  { rank: "8", suit: "clubs" },
  { rank: "3", suit: "hearts" },
  { rank: "6", suit: "spades" },
  { rank: "4", suit: "clubs" },
  { rank: "J", suit: "diamonds" },
  { rank: "2", suit: "hearts" },
  { rank: "10", suit: "spades" },
  { rank: "9", suit: "diamonds" },
  { rank: "8", suit: "hearts" },
];

function createCardDrawer(start: number) {
  let dealt = start;

  return {
    draw(): Card {
      const card = mockDeck[dealt % mockDeck.length];
      dealt += 1;
      return { ...card };
    },
    getCount(): number {
      return dealt;
    },
  };
}

function calculateHandValue(cards: Card[]): number {
  let value = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === "A") {
      aces += 1;
      value += 11;
    } else if (["K", "Q", "J"].includes(card.rank) || card.rank === "10") {
      value += 10;
    } else {
      value += parseInt(card.rank, 10);
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }

  return value;
}

function withUpdatedFlags(hand: Hand): Hand {
  const value = calculateHandValue(hand.cards);
  return {
    ...hand,
    isBlackjack: value === 21 && hand.cards.length === 2,
    isBusted: value > 21,
  };
}

function getActionAvailability(state: GameState, handIndex: number) {
  const hand = state.playerHands[handIndex];
  if (!hand) {
    return { canDouble: false, canSplit: false, canSurrender: false };
  }

  const hasTwoCards = hand.cards.length === 2;
  const isInitial =
    hasTwoCards && !hand.isBusted && !hand.isStanding && !hand.isSurrendered;

  const canDouble =
    isInitial &&
    !hand.isDoubled &&
    state.balance >= hand.bet &&
    !hand.isSplitAces;

  const canSplit =
    isInitial &&
    hand.cards[0]?.rank === hand.cards[1]?.rank &&
    state.balance >= hand.bet &&
    state.playerHands.length < 4 &&
    !hand.isSplitAces;

  const canSurrender = isInitial && !hand.isFromSplit && !hand.isDoubled;

  return {
    canDouble,
    canSplit,
    canSurrender,
  };
}

function prepareForHand(
  state: GameState,
  handIndex: number,
  overrideMessage?: string
): GameState {
  if (handIndex < 0 || handIndex >= state.playerHands.length) {
    return state;
  }

  const availability = getActionAvailability(state, handIndex);

  const defaultMessage =
    state.playerHands.length > 1
      ? `Hand ${handIndex + 1}: Hit or Stand?`
      : "Hit or Stand?";

  return {
    ...state,
    currentHandIndex: handIndex,
    canDouble: availability.canDouble,
    canSplit: availability.canSplit,
    canSurrender: availability.canSurrender,
    message: overrideMessage ?? defaultMessage,
  };
}

function findNextPlayableHand(hands: Hand[], startIndex: number): number {
  for (let index = startIndex; index < hands.length; index += 1) {
    const hand = hands[index];
    if (!hand) continue;

    if (!hand.isBusted && !hand.isStanding && !hand.isSurrendered) {
      return index;
    }
  }

  return -1;
}

function focusFirstPlayableHand(
  state: GameState,
  startIndex: number
): GameState {
  const nextIndex = findNextPlayableHand(state.playerHands, startIndex);
  if (nextIndex === -1) {
    return playDealerAndResolve(state);
  }
  return prepareForHand(state, nextIndex);
}

function moveToNextHand(state: GameState, startIndex: number): GameState {
  return focusFirstPlayableHand(state, startIndex + 1);
}

function playDealerAndResolve(state: GameState): GameState {
  if (state.gamePhase === GamePhaseType.FINISHED) {
    return state;
  }

  const drawer = createCardDrawer(state.dealtCardCount);
  const dealerHand = {
    ...state.dealerHand,
    cards: state.dealerHand.cards.map((card) => ({ ...card })),
    showAllCards: true,
  };

  let dealerValue = calculateHandValue(dealerHand.cards);
  while (dealerValue < 17) {
    const newCard = drawer.draw();
    dealerHand.cards = [...dealerHand.cards, newCard];
    dealerValue = calculateHandValue(dealerHand.cards);
  }

  dealerHand.isBusted = dealerValue > 21;
  dealerHand.isStanding = dealerValue >= 17 && !dealerHand.isBusted;
  dealerHand.isBlackjack = dealerHand.cards.length === 2 && dealerValue === 21;

  const nextState: GameState = {
    ...state,
    dealerHand,
    dealtCardCount: drawer.getCount(),
    gamePhase: GamePhaseType.DEALER_TURN,
    canDouble: false,
    canSplit: false,
    canSurrender: false,
  };

  return resolveGame(nextState);
}

function resolveGame(state: GameState): GameState {
  const dealerValue = calculateHandValue(state.dealerHand.cards);
  const dealerBust = state.dealerHand.isBusted;

  const handResults: {
    handIndex: number;
    bet: number;
    result: HandResultType;
    payout: number;
    profit: number;
  }[] = [];

  let totalPayout = 0;
  let netProfit = 0;

  const resultMessages: string[] = [];

  state.playerHands.forEach((hand, index) => {
    const handValue = calculateHandValue(hand.cards);
    let payout = 0;
    let resultType: HandResultType;

    if (hand.isSurrendered) {
      payout = Math.floor(hand.bet / 2);
      resultType = HandResultType.SURRENDER;
      resultMessages.push(`Hand ${index + 1}: Surrender (-$${hand.bet / 2})`);
    } else if (hand.isBusted) {
      resultType = HandResultType.LOSE;
      resultMessages.push(`Hand ${index + 1}: Bust (-$${hand.bet})`);
    } else if (dealerBust) {
      payout = hand.bet * 2;
      resultType = HandResultType.WIN;
      resultMessages.push(`Hand ${index + 1}: Dealer busts (+$${hand.bet})`);
    } else if (
      hand.isBlackjack &&
      state.dealerHand.cards.length === 2 &&
      dealerValue !== 21 &&
      !hand.isFromSplit
    ) {
      payout = Math.floor(hand.bet * 2.5);
      resultType = HandResultType.BLACKJACK;
      resultMessages.push(
        `Hand ${index + 1}: Blackjack! (+$${Math.floor(hand.bet * 1.5)})`
      );
    } else if (handValue > dealerValue) {
      payout = hand.bet * 2;
      resultType = HandResultType.WIN;
      resultMessages.push(`Hand ${index + 1}: Win (+$${hand.bet})`);
    } else if (handValue < dealerValue) {
      resultType = HandResultType.LOSE;
      resultMessages.push(`Hand ${index + 1}: Lose (-$${hand.bet})`);
    } else {
      payout = hand.bet;
      resultType = HandResultType.PUSH;
      resultMessages.push(`Hand ${index + 1}: Push`);
    }

    const profit = payout - hand.bet;
    totalPayout += payout;
    netProfit += profit;

    handResults.push({
      handIndex: index,
      bet: hand.bet,
      result: resultType,
      payout,
      profit,
    });
  });

  const nextBalance = state.balance + totalPayout;
  const totalBetAmount = state.playerHands.reduce(
    (sum, hand) => sum + hand.bet,
    0
  );

  // Check if all player hands are busted
  const allHandsBusted = state.playerHands.every((hand) => hand.isBusted);

  let overallResult: "WIN" | "LOSE" | "PUSH" | "BUST" = "PUSH";
  if (allHandsBusted) {
    overallResult = "BUST";
  } else if (netProfit > 0) {
    overallResult = "WIN";
  } else if (netProfit < 0) {
    overallResult = "LOSE";
  }

  return {
    ...state,
    balance: nextBalance,
    totalWon: totalPayout,
    gameProfit: netProfit,
    currentHandProfit: netProfit,
    message:
      state.playerHands.length > 1
        ? resultMessages.join(" | ")
        : resultMessages[0] ?? state.message,
    gamePhase: GamePhaseType.FINISHED,
    dealerHand: {
      ...state.dealerHand,
      showAllCards: true,
    },
    result: overallResult,
    handResults: handResults.map((entry) => ({
      ...entry,
      timestamp: new Date().toISOString(),
    })),
  };
}

export function mockStartRound(currentState: GameState): GameState {
  const drawer = createCardDrawer(currentState.dealtCardCount);

  const playerCard1 = drawer.draw();
  const dealerCard1 = drawer.draw();
  const playerCard2 = drawer.draw();
  const dealerCard2 = drawer.draw();

  const playerHand: Hand = withUpdatedFlags({
    cards: [playerCard1, playerCard2],
    bet: currentState.pendingBet,
    originalBet: currentState.pendingBet,
    isStanding: false,
    isBusted: false,
    isBlackjack: false,
    isDoubled: false,
    isSurrendered: false,
    isFromSplit: false,
    isSplitAces: false,
  });

  const dealerHand = {
    cards: [dealerCard1, dealerCard2],
    isStanding: false,
    isBusted: false,
    isBlackjack: false,
    showAllCards: false,
  };

  const baseState: GameState = {
    ...currentState,
    playerHands: [playerHand],
    dealerHand,
    dealtCardCount: drawer.getCount(),
    gamePhase: GamePhaseType.PLAYING,
    currentHandIndex: 0,
    canDouble: true,
    canSplit:
      playerHand.cards.length === 2 &&
      playerHand.cards[0]?.rank === playerHand.cards[1]?.rank &&
      currentState.balance >= playerHand.bet,
    canSurrender: true,
    message: playerHand.isBlackjack
      ? "Blackjack! Waiting for dealer..."
      : "Hit or Stand?",
    isDealing: false,
    isDealingInProgress: false,
    dealingStep: 4,
    pendingBet: 0,
  };

  if (playerHand.isBlackjack) {
    return playDealerAndResolve({
      ...baseState,
      dealerHand: { ...dealerHand, showAllCards: true },
    });
  }

  return baseState;
}

export function mockHit(currentState: GameState): GameState {
  if (currentState.gamePhase !== GamePhaseType.PLAYING) {
    return currentState;
  }

  const activeIndex = currentState.currentHandIndex ?? 0;
  const activeHand = currentState.playerHands[activeIndex];

  if (!activeHand || activeHand.isStanding || activeHand.isBusted) {
    return currentState;
  }

  const drawer = createCardDrawer(currentState.dealtCardCount);
  const newCard = drawer.draw();

  const updatedHand = withUpdatedFlags({
    ...activeHand,
    cards: [...activeHand.cards, newCard],
  });

  const updatedHands = currentState.playerHands.map((hand, index) =>
    index === activeIndex ? updatedHand : hand
  );

  let nextState: GameState = {
    ...currentState,
    playerHands: updatedHands,
    dealtCardCount: drawer.getCount(),
    canDouble: false,
    canSplit: false,
    canSurrender: false,
  };

  const handValue = calculateHandValue(updatedHand.cards);

  if (updatedHand.isBusted) {
    const bustedHands = updatedHands.map((hand, index) =>
      index === activeIndex ? { ...hand, isStanding: true } : hand
    );
    nextState = {
      ...nextState,
      playerHands: bustedHands,
      message: `Hand ${activeIndex + 1} busts!`,
    };
    return moveToNextHand(nextState, activeIndex);
  }

  if (handValue === 21) {
    const standingHands = updatedHands.map((hand, index) =>
      index === activeIndex ? { ...hand, isStanding: true } : hand
    );
    nextState = {
      ...nextState,
      playerHands: standingHands,
      message: `Hand ${activeIndex + 1} stands on 21`,
    };
    return moveToNextHand(nextState, activeIndex);
  }

  return prepareForHand(nextState, activeIndex);
}

export function mockStand(currentState: GameState): GameState {
  if (currentState.gamePhase !== GamePhaseType.PLAYING) {
    return currentState;
  }

  const activeIndex = currentState.currentHandIndex ?? 0;
  const activeHand = currentState.playerHands[activeIndex];
  if (!activeHand) {
    return currentState;
  }

  const hands = currentState.playerHands.map((hand, index) =>
    index === activeIndex ? { ...hand, isStanding: true } : hand
  );

  const nextState: GameState = {
    ...currentState,
    playerHands: hands,
    canDouble: false,
    canSplit: false,
    canSurrender: false,
    message: `Hand ${activeIndex + 1} stands`,
  };

  return moveToNextHand(nextState, activeIndex);
}

export function mockDouble(currentState: GameState): GameState {
  if (currentState.gamePhase !== GamePhaseType.PLAYING) {
    return currentState;
  }

  const activeIndex = currentState.currentHandIndex ?? 0;
  const activeHand = currentState.playerHands[activeIndex];

  if (!activeHand) {
    return currentState;
  }

  if (currentState.balance < activeHand.bet) {
    return {
      ...currentState,
      message: "Insufficient balance to double",
    };
  }

  const drawer = createCardDrawer(currentState.dealtCardCount);
  const newCard = drawer.draw();

  const doubledHand = withUpdatedFlags({
    ...activeHand,
    cards: [...activeHand.cards, newCard],
    bet: activeHand.bet * 2,
    isDoubled: true,
    isStanding: true,
  });

  const updatedHands = currentState.playerHands.map((hand, index) =>
    index === activeIndex ? doubledHand : hand
  );

  let nextState: GameState = {
    ...currentState,
    playerHands: updatedHands,
    balance: currentState.balance - activeHand.bet,
    totalWagered: currentState.totalWagered + activeHand.bet,
    dealtCardCount: drawer.getCount(),
    canDouble: false,
    canSplit: false,
    canSurrender: false,
    message: `Hand ${activeIndex + 1} doubles to $${doubledHand.bet}`,
  };

  if (doubledHand.isBusted) {
    nextState = {
      ...nextState,
      message: `Hand ${activeIndex + 1} busts after doubling`,
    };
  }

  return moveToNextHand(nextState, activeIndex);
}

export function mockSplit(currentState: GameState): GameState {
  if (currentState.gamePhase !== GamePhaseType.PLAYING) {
    return currentState;
  }

  const activeIndex = currentState.currentHandIndex ?? 0;
  const activeHand = currentState.playerHands[activeIndex];
  if (!activeHand) {
    return currentState;
  }

  if (
    activeHand.cards.length !== 2 ||
    activeHand.cards[0]?.rank !== activeHand.cards[1]?.rank
  ) {
    return {
      ...currentState,
      message: "Cannot split different cards",
    };
  }

  if (currentState.balance < activeHand.bet) {
    return {
      ...currentState,
      message: "Insufficient balance to split",
    };
  }

  const drawer = createCardDrawer(currentState.dealtCardCount);
  const [firstCard, secondCard] = activeHand.cards;

  const replacementCard1 = drawer.draw();
  const replacementCard2 = drawer.draw();

  const isSplitAces = firstCard.rank === "A" && secondCard.rank === "A";

  const firstHand = withUpdatedFlags({
    ...activeHand,
    cards: [firstCard, replacementCard1],
    isStanding: isSplitAces,
    isFromSplit: true,
    isSplitAces,
    isDoubled: false,
  });

  const secondHand = withUpdatedFlags({
    ...activeHand,
    cards: [secondCard, replacementCard2],
    isStanding: isSplitAces,
    isFromSplit: true,
    isSplitAces,
    isDoubled: false,
  });

  const updatedHands = [...currentState.playerHands];
  updatedHands.splice(activeIndex, 1, firstHand, secondHand);

  const nextState: GameState = {
    ...currentState,
    playerHands: updatedHands,
    balance: currentState.balance - activeHand.bet,
    totalWagered: currentState.totalWagered + activeHand.bet,
    dealtCardCount: drawer.getCount(),
    message: "Split! Playing next hand...",
  };

  if (isSplitAces) {
    // Both hands are forced to stand after drawing a single card.
    return moveToNextHand(nextState, activeIndex - 1);
  }

  return prepareForHand(nextState, activeIndex);
}

export function mockSwitchHand(currentState: GameState): GameState {
  if (currentState.gamePhase !== GamePhaseType.PLAYING) {
    return currentState;
  }

  const activeIndex = currentState.currentHandIndex ?? 0;
  return moveToNextHand(currentState, activeIndex);
}

export function mockResetGame(currentState: GameState): GameState {
  return {
    ...currentState,
    shuffleId: `shuffle_${Date.now()}`,
    dealtCardCount: 0,
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
    initialBet: 0,
    insuranceBet: 0,
    totalWagered: 0,
    totalWon: 0,
    gameProfit: 0,
    currentHandProfit: 0,
    message: "Place your bet",
    canDouble: false,
    canSplit: false,
    canSurrender: false,
    insuranceOffered: false,
    insuranceWasOffered: false,
    dealerHasBlackjack: undefined,
    dealingStep: 0,
    isDealing: false,
    isDealingInProgress: false,
    lastProcessedStep: 0,
    dealerDealingStep: 0,
    isDealerDealing: false,
    isBustSequence: false,
    bustSequenceStep: 0,
    dealerBustRevealStep: 0,
    handResults: [],
    result: undefined,
    currentHandIndex: 0,
  };
}

export function processMockAction(
  action: GameActionType,
  state: GameState
): GameState {
  switch (action) {
    case GameActionType.START_ROUND:
      return mockStartRound(state);
    case GameActionType.HIT:
      return mockHit(state);
    case GameActionType.STAND:
      return mockStand(state);
    case GameActionType.DOUBLE:
      return mockDouble(state);
    case GameActionType.SPLIT:
      return mockSplit(state);
    case GameActionType.SWITCH_HAND:
      return mockSwitchHand(state);
    case GameActionType.PLAY_AGAIN:
    case GameActionType.START_NEW_GAME:
    case GameActionType.RESET_GAME:
      return mockResetGame(state);
    default:
      return state;
  }
}
