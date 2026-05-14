import {
  loadFromLocalStorage,
  saveToLocalStorage,
} from "../../lib/localStorage";
import { GAME_STORAGE_KEY, GAME_STATE_VERSION } from "./gameConstants";
import { initialPersistedGameState } from "./gameReducer";
import type { GameState, PersistedGameState } from "./gameTypes";

export function loadPersistedGameState() {
  const persisted = loadFromLocalStorage<PersistedGameState>(GAME_STORAGE_KEY);

  if (!persisted || persisted.version !== GAME_STATE_VERSION) {
    return initialPersistedGameState;
  }

  return {
    ...initialPersistedGameState,
    ...persisted,
    version: GAME_STATE_VERSION,
  };
}

export function savePersistedGameState(state: GameState) {
  const persistedState: PersistedGameState = {
    version: state.version,
    trainer: state.trainer,
    ownedPokemon: state.ownedPokemon,
    currentSession: state.currentSession,
    activeEncounter: state.activeEncounter,
    history: state.history,
  };

  saveToLocalStorage(GAME_STORAGE_KEY, persistedState);
}
