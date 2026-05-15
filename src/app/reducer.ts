import { GAME_STATE_VERSION } from "./constants";
import type { GameState, PersistedGameState } from "./types";
import { loadPersistedGameState } from "../shared/lib/gameStorage";
import {
  createEmptyParty,
  createEmptyBoxes,
  handleMovePokemon,
  handleReleasePokemon,
  handleAddBox,
  handleAddPokemon,
  applyPartyLevelUp,
} from "../domains/storage/reducer";
import {
  handleStartSession,
  handleEndSession,
  handleSpawnEncounter,
} from "../domains/encounter/reducer";
import { buildHistoryEntry } from "../domains/trainer/reducer";
import { getPokemonById, getBucketByKey } from "../domains/pokemon/catalog";
import { STARTER_LEVEL, WILD_POKEMON_BASE_LEVEL } from "../domains/storage/constants";

export const initialPersistedGameState: PersistedGameState = {
  version: GAME_STATE_VERSION,
  trainer: null,
  party: createEmptyParty(),
  boxes: createEmptyBoxes(),
  currentSession: null,
  activeEncounter: null,
  history: [],
};

const persisted = loadPersistedGameState();
const isVersionValid = persisted?.version === GAME_STATE_VERSION;

export const initialGameState: GameState = {
  ...(isVersionValid ? persisted : initialPersistedGameState),
  isHydrating: true,
};

export type GameAction = any; // Will be properly typed later or kept flexible

export function applyResolvedEncounterState(
  state: PersistedGameState,
  resolvedAt: number,
  result: "missed" | "fled",
): PersistedGameState {
  if (!state.activeEncounter) return state;

  const historyEntry = buildHistoryEntry(
    state.activeEncounter.encounterId,
    state.activeEncounter.pokemonId,
    result,
    resolvedAt,
    state.currentSession?.sessionId ?? null,
  );

  return {
    ...state,
    currentSession: state.currentSession
      ? { ...state.currentSession, activeEncounterId: null }
      : null,
    activeEncounter: null,
    history: [...state.history, historyEntry],
  };
}

export function rootReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "HYDRATE":
      return { ...action.payload, isHydrating: false };

    case "CREATE_TRAINER": {
      const { name, starterPokemonId, createdAt, starterInstanceId } = action.payload;
      const party = createEmptyParty();
      party[0] = {
        instanceId: starterInstanceId,
        pokemonId: starterPokemonId,
        level: STARTER_LEVEL,
        caughtAt: createdAt,
        caughtInSessionId: null,
      };

      return {
        ...state,
        trainer: { name, starterPokemonId, createdAt },
        party,
        boxes: createEmptyBoxes(),
      };
    }

    case "START_SESSION":
      return {
        ...state,
        ...handleStartSession(action.payload),
      };

    case "END_SESSION":
      return {
        ...state,
        ...handleEndSession(state.currentSession, action.payload.endedAt),
      };

    case "SPAWN_ENCOUNTER":
      return {
        ...state,
        ...handleSpawnEncounter(state.currentSession, action.payload),
      };

    case "CATCH_ENCOUNTER": {
      if (!state.activeEncounter) return state;

      const pokemonSpecies = getPokemonById(state.activeEncounter.pokemonId);
      const bucket = pokemonSpecies ? getBucketByKey(pokemonSpecies.group) : undefined;
      const initialLevel = bucket?.minLevel ?? WILD_POKEMON_BASE_LEVEL;

      const newPokemon = {
        instanceId: action.payload.ownedPokemonInstanceId,
        pokemonId: state.activeEncounter.pokemonId,
        level: initialLevel,
        caughtAt: action.payload.resolvedAt,
        caughtInSessionId: state.currentSession?.sessionId ?? null,
      };

      const { party, boxes, isPlaced } = handleAddPokemon(state.party, state.boxes, newPokemon);

      if (!isPlaced) {
        return {
          ...state,
          currentSession: state.currentSession ? { ...state.currentSession, activeEncounterId: null } : null,
          activeEncounter: null,
        };
      }

      const finalParty = applyPartyLevelUp(party);
      const historyEntry = buildHistoryEntry(
        state.activeEncounter.encounterId,
        state.activeEncounter.pokemonId,
        "caught",
        action.payload.resolvedAt,
        state.currentSession?.sessionId ?? null,
      );

      return {
        ...state,
        party: finalParty,
        boxes,
        currentSession: state.currentSession ? { ...state.currentSession, activeEncounterId: null } : null,
        activeEncounter: null,
        history: [...state.history, historyEntry],
      };
    }

    case "MISS_ENCOUNTER":
    case "FLEE_ENCOUNTER": {
      if (!state.activeEncounter) return state;
      const result = action.type === "MISS_ENCOUNTER" ? "missed" : "fled";
      const historyEntry = buildHistoryEntry(
        state.activeEncounter.encounterId,
        state.activeEncounter.pokemonId,
        result,
        action.payload.resolvedAt,
        state.currentSession?.sessionId ?? null,
      );

      return {
        ...state,
        currentSession: state.currentSession ? { ...state.currentSession, activeEncounterId: null } : null,
        activeEncounter: null,
        history: [...state.history, historyEntry],
      };
    }

    case "RECORD_MISTAKE":
      if (!state.activeEncounter) return state;
      return {
        ...state,
        activeEncounter: {
          ...state.activeEncounter,
          mistakes: state.activeEncounter.mistakes + 1,
        },
      };

    case "MOVE_POKEMON":
      return {
        ...state,
        ...handleMovePokemon(state.party, state.boxes, action.payload.source, action.payload.destination),
      };

    case "RELEASE_POKEMON":
      return {
        ...state,
        ...handleReleasePokemon(state.party, state.boxes, action.payload.location),
      };

    case "ADD_BOX":
      return {
        ...state,
        boxes: handleAddBox(state.boxes),
      };

    default:
      return state;
  }
}
