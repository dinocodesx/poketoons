import { GAME_STORAGE_KEY } from "./gameConstants";
import type { PersistedGameState } from "./gameTypes";

/**
 * Saves the current game state to localStorage.
 * Only persists fields defined in the PersistedGameState interface.
 * 
 * @param state - The full game state to persist.
 */
export function savePersistedGameState(state: PersistedGameState): void {
  try {
    const data: PersistedGameState = {
      version: state.version,
      trainer: state.trainer,
      ownedPokemon: state.ownedPokemon,
      currentSession: state.currentSession,
      activeEncounter: state.activeEncounter,
      history: state.history,
    };

    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save game state:", error);
  }
}

/**
 * Loads the persisted game state from localStorage.
 * 
 * @returns The persisted game state, or null if no state is found or an error occurs.
 */
export function loadPersistedGameState(): PersistedGameState | null {
  try {
    const raw = localStorage.getItem(GAME_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as PersistedGameState;
  } catch (error) {
    console.error("Failed to load game state:", error);
    return null;
  }
}
