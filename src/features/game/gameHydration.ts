import {
  applyMissedEncounterState,
  initialPersistedGameState,
} from "./gameReducer";
import type { PersistedGameState } from "./gameTypes";
import { loadPersistedGameState } from "./gameStorage";
import { GAME_STATE_VERSION } from "./gameConstants";

/**
 * Hydrates the game state from storage and performs a cleanup check.
 * If there was an active encounter that expired while the user was away,
 * it is automatically resolved as "missed".
 * 
 * @param now - The current timestamp (used for resolution comparison).
 * @returns The hydrated and cleaned-up persisted game state.
 */
export function hydrateGameState(now: number): PersistedGameState {
  const persisted = loadPersistedGameState();

  if (!persisted || persisted.version !== GAME_STATE_VERSION) {
    return initialPersistedGameState;
  }

  // Cleanup: If an encounter expired while the app was closed, resolve it as missed.
  if (persisted.activeEncounter && now >= persisted.activeEncounter.expiresAt) {
    return applyMissedEncounterState(persisted, persisted.activeEncounter.expiresAt);
  }

  return persisted;
}
