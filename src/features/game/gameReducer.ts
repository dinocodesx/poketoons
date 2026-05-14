import {
  GAME_STATE_VERSION,
  MAX_POKEMON_LEVEL,
  RECENT_LEVEL_UP_COUNT,
  STARTER_LEVEL,
  WILD_POKEMON_BASE_LEVEL,
} from "./gameConstants";
import type {
  CatchHistoryEntry,
  GameState,
  PersistedGameState,
  TrainerProfile,
  OwnedPokemon,
} from "./gameTypes";

export const initialPersistedGameState: PersistedGameState = {
  version: GAME_STATE_VERSION,
  trainer: null,
  ownedPokemon: [],
  currentSession: null,
  activeEncounter: null,
  history: [],
};

export const initialGameState: GameState = {
  ...initialPersistedGameState,
  isHydrating: true,
};

interface CreateTrainerAction {
  type: "CREATE_TRAINER";
  payload: {
    name: string;
    starterPokemonId: number;
    createdAt: number;
    starterInstanceId: string;
  };
}

interface HydrateAction {
  type: "HYDRATE";
  payload: PersistedGameState;
}

interface StartSessionAction {
  type: "START_SESSION";
  payload: {
    sessionId: string;
    encounterId: string;
    pokemonId: number;
    startedAt: number;
    expiresAt: number;
    nextEncounterAt: number;
    cycleDurationMs: number;
  };
}

interface EndSessionAction {
  type: "END_SESSION";
  payload: {
    endedAt: number;
  };
}

interface SpawnEncounterAction {
  type: "SPAWN_ENCOUNTER";
  payload: {
    encounterId: string;
    pokemonId: number;
    startedAt: number;
    expiresAt: number;
    nextEncounterAt: number;
  };
}

interface CatchEncounterAction {
  type: "CATCH_ENCOUNTER";
  payload: {
    resolvedAt: number;
    ownedPokemonInstanceId: string;
  };
}

interface MissEncounterAction {
  type: "MISS_ENCOUNTER";
  payload: {
    resolvedAt: number;
  };
}

type GameAction =
  | CreateTrainerAction
  | HydrateAction
  | StartSessionAction
  | EndSessionAction
  | SpawnEncounterAction
  | CatchEncounterAction
  | MissEncounterAction;

function buildHistoryEntry(
  encounterId: string,
  pokemonId: number,
  result: CatchHistoryEntry["result"],
  resolvedAt: number,
  sessionId: string | null,
): CatchHistoryEntry {
  return {
    encounterId,
    pokemonId,
    result,
    resolvedAt,
    sessionId,
  };
}

function applyLevelUpWindow(collection: OwnedPokemon[]) {
  const startIndex = Math.max(0, collection.length - RECENT_LEVEL_UP_COUNT);

  return collection.map((pokemon, index) => {
    if (index < startIndex) {
      return pokemon;
    }

    return {
      ...pokemon,
      level: Math.min(MAX_POKEMON_LEVEL, pokemon.level + 1),
    };
  });
}

export function applyMissedEncounterState(
  state: PersistedGameState,
  resolvedAt: number,
): PersistedGameState {
  if (!state.activeEncounter) {
    return state;
  }

  const historyEntry = buildHistoryEntry(
    state.activeEncounter.encounterId,
    state.activeEncounter.pokemonId,
    "missed",
    resolvedAt,
    state.currentSession?.sessionId ?? null,
  );

  return {
    ...state,
    currentSession: state.currentSession
      ? {
          ...state.currentSession,
          activeEncounterId: null,
        }
      : null,
    activeEncounter: null,
    history: [...state.history, historyEntry],
  };
}

function createTrainerProfile(
  name: string,
  starterPokemonId: number,
  createdAt: number,
): TrainerProfile {
  return {
    name,
    starterPokemonId,
    createdAt,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "HYDRATE":
      return {
        ...action.payload,
        isHydrating: false,
      };

    case "CREATE_TRAINER": {
      const trainer = createTrainerProfile(
        action.payload.name,
        action.payload.starterPokemonId,
        action.payload.createdAt,
      );

      return {
        ...state,
        trainer,
        ownedPokemon: [
          {
            instanceId: action.payload.starterInstanceId,
            pokemonId: action.payload.starterPokemonId,
            level: STARTER_LEVEL,
            caughtAt: action.payload.createdAt,
            caughtInSessionId: null,
          },
        ],
      };
    }

    case "START_SESSION":
      return {
        ...state,
        currentSession: {
          sessionId: action.payload.sessionId,
          startedAt: action.payload.startedAt,
          endedAt: null,
          status: "active",
          cycleDurationMs: action.payload.cycleDurationMs,
          activeEncounterId: action.payload.encounterId,
          nextEncounterAt: action.payload.nextEncounterAt,
        },
        activeEncounter: {
          encounterId: action.payload.encounterId,
          pokemonId: action.payload.pokemonId,
          startedAt: action.payload.startedAt,
          expiresAt: action.payload.expiresAt,
          status: "active",
        },
      };

    case "END_SESSION":
      return {
        ...state,
        currentSession: state.currentSession
          ? {
              ...state.currentSession,
              status: "ended",
              endedAt: action.payload.endedAt,
              activeEncounterId: null,
              nextEncounterAt: null,
            }
          : null,
        activeEncounter: null,
      };

    case "SPAWN_ENCOUNTER":
      return {
        ...state,
        currentSession: state.currentSession
          ? {
              ...state.currentSession,
              status: "active",
              activeEncounterId: action.payload.encounterId,
              nextEncounterAt: action.payload.nextEncounterAt,
            }
          : null,
        activeEncounter: {
          encounterId: action.payload.encounterId,
          pokemonId: action.payload.pokemonId,
          startedAt: action.payload.startedAt,
          expiresAt: action.payload.expiresAt,
          status: "active",
        },
      };

    case "CATCH_ENCOUNTER": {
      if (!state.activeEncounter) {
        return state;
      }

      const newCollection = applyLevelUpWindow([
        ...state.ownedPokemon,
        {
          instanceId: action.payload.ownedPokemonInstanceId,
          pokemonId: state.activeEncounter.pokemonId,
          level: WILD_POKEMON_BASE_LEVEL,
          caughtAt: action.payload.resolvedAt,
          caughtInSessionId: state.currentSession?.sessionId ?? null,
        },
      ]);

      const historyEntry = buildHistoryEntry(
        state.activeEncounter.encounterId,
        state.activeEncounter.pokemonId,
        "caught",
        action.payload.resolvedAt,
        state.currentSession?.sessionId ?? null,
      );

      return {
        ...state,
        ownedPokemon: newCollection,
        currentSession: state.currentSession
          ? {
              ...state.currentSession,
              activeEncounterId: null,
            }
          : null,
        activeEncounter: null,
        history: [...state.history, historyEntry],
      };
    }

    case "MISS_ENCOUNTER":
      return {
        ...applyMissedEncounterState(state, action.payload.resolvedAt),
        isHydrating: state.isHydrating,
      };

    default:
      return state;
  }
}
