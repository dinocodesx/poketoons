import {
  applyMissedEncounterState,
  initialPersistedGameState,
} from "./gameReducer";
import { loadPersistedGameState } from "./gameStorage";

export function hydrateGameState(now: number) {
  const persistedState = loadPersistedGameState();

  if (
    !persistedState.currentSession ||
    persistedState.currentSession.status !== "active"
  ) {
    return {
      ...initialPersistedGameState,
      ...persistedState,
      activeEncounter: null,
    };
  }

  if (
    persistedState.activeEncounter &&
    persistedState.activeEncounter.expiresAt <= now
  ) {
    return applyMissedEncounterState(
      persistedState,
      persistedState.activeEncounter.expiresAt,
    );
  }

  return persistedState;
}
