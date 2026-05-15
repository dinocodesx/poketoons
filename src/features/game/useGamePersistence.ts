import { useEffect } from "react";
import type { GameAction } from "./gameReducer";
import type { GameState } from "./gameTypes";
import { hydrateGameState } from "./gameHydration";
import { savePersistedGameState } from "./gameStorage";

/**
 * Hook to manage game state persistence (loading from and saving to localStorage).
 * 
 * @param state - The current game state.
 * @param dispatch - The dispatch function to update game state.
 */
export function useGamePersistence(
  state: GameState,
  dispatch: React.Dispatch<GameAction>,
) {
  // Initial hydration
  useEffect(() => {
    const hydratedState = hydrateGameState(Date.now());
    dispatch({ type: "HYDRATE", payload: hydratedState });
  }, [dispatch]);

  // Auto-save on state changes
  useEffect(() => {
    if (state.isHydrating) return;
    savePersistedGameState(state);
  }, [state]);
}
