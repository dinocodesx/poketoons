import { useEffect } from "react";
import type { GameAction } from "../reducer";
import type { GameState } from "../types";
import { hydrateGameState } from "../hydration";
import { savePersistedGameState } from "../../shared/lib/gameStorage";

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
