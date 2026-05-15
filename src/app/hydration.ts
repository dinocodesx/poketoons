import {
  applyResolvedEncounterState,
  initialPersistedGameState,
} from "./reducer";
import type { PersistedGameState } from "./types";
import { loadPersistedGameState } from "../shared/lib/gameStorage";
import { GAME_STATE_VERSION } from "./constants";

/**
 * Hydrates the game state from storage and performs a cleanup check.
 * If there was an active encounter that expired while the user was away,
 * it is automatically resolved as "fled".
 *
 * @param now - The current timestamp (used for resolution comparison).
 * @returns The hydrated and cleaned-up persisted game state.
 */
export function hydrateGameState(now: number): PersistedGameState {
  const persisted = loadPersistedGameState();

  if (!persisted || persisted.version !== GAME_STATE_VERSION) {
    return initialPersistedGameState;
  }

  // Cleanup: If an encounter expired while the app was closed, resolve it as fled (no attempt).
  if (persisted.activeEncounter && now >= persisted.activeEncounter.expiresAt) {
    return applyResolvedEncounterState(
      persisted,
      persisted.activeEncounter.expiresAt,
      "fled",
    );
  }

  return persisted;
}
