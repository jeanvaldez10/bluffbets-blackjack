"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { GameState, GamePhaseType, GameActionType } from "@/types/game";
import { playSound } from "@/lib/utils/sounds";

// Convert bet amount to highest denominations
function optimizeChips(totalAmount: number): number[] {
  const chipDenominations = [100, 25, 10, 5, 1];
  const optimizedChips: number[] = [];
  let remaining = totalAmount;

  for (const chipValue of chipDenominations) {
    while (remaining >= chipValue) {
      optimizedChips.push(chipValue);
      remaining -= chipValue;
    }
  }

  // Reverse so higher values are on the right
  return optimizedChips.reverse();
}

// Initial game state
function createInitialGameState(): GameState {
  return {
    gameId: `game_${Date.now()}`,
    shuffleId: `shuffle_${Date.now()}`,
    shuffleSalt: undefined,
    dealtCardCount: 0,
    playerHands: [],
    dealerHand: {
      cards: [],
      isStanding: false,
      isBusted: false,
      isBlackjack: false,
      showAllCards: false,
    },
    currentHandIndex: 0,
    balance: 27318, // Starting balance
    pendingBet: 0,
    initialBet: 0,
    insuranceBet: 0,
    totalWagered: 0,
    totalWon: 0,
    gameProfit: 0,
    currentHandProfit: 0,
    startingBalance: 27318,
    placedChips: [],
    gamePhase: GamePhaseType.BETTING,
    message: "Place your bet",
    canDouble: false,
    canSplit: false,
    canSurrender: false,
    insuranceOffered: false,
    shuffle: false,
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
    userId: "dev_user",
  };
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(
    createInitialGameState()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestStateRef = useRef<GameState>(gameState);

  useEffect(() => {
    latestStateRef.current = gameState;
  }, [gameState]);

  const sendMockRequest = useCallback(
    async (
      action: GameActionType,
      options: {
        amount?: number;
        overrideState?: GameState;
        applyDelayMs?: number;
        deferApply?: boolean;
      } = {}
    ) => {
      try {
        const stateToSend = options.overrideState ?? latestStateRef.current;

        const response = await fetch("/api/mock-game", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            action,
            amount: options.amount,
            state: stateToSend,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          throw new Error(errorBody?.error || "Mock API request failed");
        }

        const data = await response.json();

        if (!data?.gameState) {
          throw new Error("Mock API returned no game state");
        }

        if (options.deferApply) {
          return data.gameState as GameState;
        }

        await new Promise<void>((resolve) => {
          const applyState = () => {
            console.log("data.gameState", data.gameState);
            setGameState(data.gameState);
            resolve();
          };

          if (options.applyDelayMs && options.applyDelayMs > 0) {
            setTimeout(applyState, options.applyDelayMs);
          } else {
            applyState();
          }
        });

        return data.gameState as GameState;
      } catch (err) {
        console.error("Failed to send mock action:", err);
        const message =
          err instanceof Error ? err.message : "Failed to process action";
        setError(message);
        throw err;
      }
    },
    []
  );

  // Place bet - add amount to pending bet
  const placeBet = useCallback((amount: number) => {
    setError(null);

    setGameState((prev) => {
      // Validate bet
      if (prev.gamePhase !== GamePhaseType.BETTING) {
        setError("Can only place bets during betting phase");
        return prev;
      }

      const newBet = prev.pendingBet + amount;

      if (newBet > prev.balance) {
        setError("Insufficient balance");
        playSound("button-press", 0.3, 0.5);
        return prev;
      }

      // Play bet sound
      playSound("chips-place-bet", 0.5);

      // Optimize chips to highest denominations
      const optimizedChips = optimizeChips(newBet);

      return {
        ...prev,
        pendingBet: newBet,
        placedChips: optimizedChips,
        message: `Bet: $${newBet}`,
      };
    });
  }, []);

  // Clear bet
  const clearBet = useCallback(() => {
    setError(null);
    playSound("button-press", 0.3, 0.5);

    setGameState((prev) => {
      if (prev.gamePhase !== GamePhaseType.BETTING) {
        return prev;
      }

      return {
        ...prev,
        pendingBet: 0,
        placedChips: [],
        message: "Place your bet",
      };
    });
  }, []);

  // Start round
  const startRound = useCallback(() => {
    setError(null);
    setLoading(true);

    setGameState((prev) => {
      if (prev.gamePhase !== GamePhaseType.BETTING) {
        setError("Can only start round during betting phase");
        setLoading(false);
        return prev;
      }

      if (prev.pendingBet <= 0) {
        setError("Please place a bet first");
        setLoading(false);
        playSound("button-press", 0.3, 0.5);
        return prev;
      }

      if (prev.pendingBet > prev.balance) {
        setError("Insufficient balance");
        setLoading(false);
        playSound("button-press", 0.3, 0.5);
        return prev;
      }

      // Play deal sound
      playSound("card-deal", 0.4, 0.2);

      // Deduct bet from balance and start dealing animation
      const stateWithBet: GameState = {
        ...prev,
        initialBet: prev.pendingBet,
        totalWagered: prev.pendingBet,
        balance: prev.balance - prev.pendingBet,
        message: "Dealing cards...",
        isDealing: false, // Start as false, will be true once cards arrive
        isDealingInProgress: false,
        dealingStep: 0,
      };

      const dealingSteps = [1, 2, 3, 4]; // Player, Dealer, Player, Dealer
      const animationDuration = dealingSteps.length * 800 + 400;

      // Send request to get cards from server
      sendMockRequest(GameActionType.START_ROUND, {
        overrideState: stateWithBet,
        deferApply: true,
      })
        .then((serverState) => {
          // Immediately set the game state with cards BEFORE starting animation
          setGameState({
            ...serverState,
            dealingStep: 0,
            isDealing: true,
            isDealingInProgress: true,
            message: "Dealing cards...",
          });

          // Now start the dealing step animations with cards already in state
          dealingSteps.forEach((step, index) => {
            setTimeout(() => {
              playSound("card-deal", 0.3, 0.8);
              setGameState((current) => ({
                ...current,
                dealingStep: step,
              }));
            }, index * 800); // 0.8s delay between each card
          });

          setTimeout(() => {
            setGameState((current) => ({
              ...current,
              isDealing: false,
              isDealingInProgress: false,
              dealingStep: 4,
            }));
            setLoading(false);
          }, animationDuration);
        })
        .catch(() => {
          setGameState((current) => ({
            ...current,
            isDealing: false,
            isDealingInProgress: false,
            message: "Failed to start round. Please try again.",
          }));
          setLoading(false);
        });

      return stateWithBet;
    });
  }, [sendMockRequest]);

  // Hit - take another card
  const hit = useCallback(() => {
    setError(null);
    setLoading(true);

    // Start dealing animation
    setGameState((prev) => ({
      ...prev,
      isDealing: true,
      isDealingInProgress: true,
      dealingStep: prev.dealingStep + 1, // Increment for next card
      message: "Dealing card...",
    }));

    // Play deal sound
    playSound("card-deal", 0.3, 0.8);

    // Get the new state from server
    sendMockRequest(GameActionType.HIT, { deferApply: true })
      .then((serverState) => {
        // Keep dealing animation running while card flies and flips
        setGameState((current) => ({
          ...serverState,
          dealingStep: current.dealingStep,
          isDealing: true,
          isDealingInProgress: true,
        }));

        // End dealing animation after card lands and flips (1.5s total: 0.5s fly + 0.5s flip + 0.5s buffer)
        setTimeout(() => {
          setGameState((current) => ({
            ...current,
            isDealing: false,
            isDealingInProgress: false,
          }));
          setLoading(false);
        }, 1500);
      })
      .catch(() => {
        setGameState((current) => ({
          ...current,
          isDealing: false,
          isDealingInProgress: false,
        }));
        setLoading(false);
      });
  }, [sendMockRequest]);

  // Stand - end turn, dealer plays
  const stand = useCallback(() => {
    setError(null);
    setLoading(true);
    playSound("button-press", 0.3, 0.5);

    sendMockRequest(GameActionType.STAND, { applyDelayMs: 500 })
      .catch(() => {
        // Error already handled in helper
      })
      .finally(() => setLoading(false));
  }, [sendMockRequest]);

  // Double - double bet and hit once
  const double = useCallback(() => {
    setError(null);
    setLoading(true);

    // Start dealing animation
    setGameState((prev) => ({
      ...prev,
      isDealing: true,
      isDealingInProgress: true,
      dealingStep: prev.dealingStep + 1, // Increment for next card
      message: "Doubling down...",
    }));

    // Play sounds
    playSound("chips-place-bet", 0.5);
    playSound("card-deal", 0.3, 0.8);

    // Get the new state from server
    sendMockRequest(GameActionType.DOUBLE, { deferApply: true })
      .then((serverState) => {
        // Keep dealing animation running while card flies and flips
        setGameState((current) => ({
          ...serverState,
          dealingStep: current.dealingStep,
          isDealing: true,
          isDealingInProgress: true,
        }));

        // End dealing animation after card lands and flips (1.5s total)
        setTimeout(() => {
          setGameState((current) => ({
            ...current,
            isDealing: false,
            isDealingInProgress: false,
          }));
          setLoading(false);
        }, 1500);
      })
      .catch(() => {
        setGameState((current) => ({
          ...current,
          isDealing: false,
          isDealingInProgress: false,
        }));
        setLoading(false);
      });
  }, [sendMockRequest]);

  const split = useCallback(() => {
    setError(null);
    playSound("chips-place-bet", 0.5);

    sendMockRequest(GameActionType.SPLIT).catch(() => {
      // Error already handled in helper
    });
  }, [sendMockRequest]);

  const switchHand = useCallback(() => {
    setError(null);
    playSound("button-press", 0.3, 0.5);

    sendMockRequest(GameActionType.SWITCH_HAND).catch(() => {
      // Error already handled in helper
    });
  }, [sendMockRequest]);

  // Play again - reset for new game with same bet
  const playAgain = useCallback(() => {
    setError(null);
    playSound("button-press", 0.3, 0.5);

    const previousBet = latestStateRef.current.initialBet;

    sendMockRequest(GameActionType.PLAY_AGAIN)
      .then((resetState) => {
        setGameState(() => ({
          ...resetState,
          pendingBet: previousBet,
          placedChips: optimizeChips(previousBet),
          message: previousBet > 0 ? `Bet: $${previousBet}` : "Place your bet",
        }));
      })
      .catch(() => {
        // Error handled in helper
      });
  }, [latestStateRef, sendMockRequest]);

  // Start new game - reset completely
  const startNewGame = useCallback(() => {
    setError(null);
    playSound("button-press", 0.3, 0.5);

    sendMockRequest(GameActionType.START_NEW_GAME).catch(() => {
      // Error handled in helper
    });
  }, [sendMockRequest]);

  // Reset game
  const resetGame = useCallback(() => {
    playSound("button-press", 0.3, 0.5);

    sendMockRequest(GameActionType.RESET_GAME)
      .catch(() => {
        // Error handled in helper
      })
      .finally(() => {
        setError(null);
        setLoading(false);
      });
  }, [sendMockRequest]);

  // Send action - main action handler
  const sendAction = useCallback(
    (action: GameActionType, amount?: number) => {
      switch (action) {
        case GameActionType.PLACE_BET:
          if (amount) placeBet(amount);
          break;
        case GameActionType.CLEAR_BET:
          clearBet();
          break;
        case GameActionType.START_ROUND:
          startRound();
          break;
        case GameActionType.HIT:
          hit();
          break;
        case GameActionType.STAND:
          stand();
          break;
        case GameActionType.DOUBLE:
          double();
          break;
        case GameActionType.SPLIT:
          split();
          break;
        case GameActionType.SWITCH_HAND:
          switchHand();
          break;
        case GameActionType.PLAY_AGAIN:
          playAgain();
          break;
        case GameActionType.START_NEW_GAME:
          startNewGame();
          break;
        case GameActionType.RESET_GAME:
          resetGame();
          break;
        default:
          console.warn(`Action not implemented: ${action}`);
      }
    },
    [
      placeBet,
      clearBet,
      startRound,
      hit,
      stand,
      double,
      split,
      switchHand,
      playAgain,
      startNewGame,
      resetGame,
    ]
  );

  // Set game state directly (for dev tools)
  const setGameStateDirectly = useCallback((newState: Partial<GameState>) => {
    setGameState((prev) => ({
      ...prev,
      ...newState,
    }));
  }, []);

  return {
    gameState,
    loading,
    error,
    sendAction,
    placeBet,
    clearBet,
    startRound,
    hit,
    stand,
    double,
    split,
    switchHand,
    playAgain,
    startNewGame,
    resetGame,
    setGameStateDirectly,
  };
}
