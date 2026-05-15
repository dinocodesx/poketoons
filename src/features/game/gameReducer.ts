import {
  BOX_COUNT,
  BOX_SLOT_COUNT,
  GAME_STATE_VERSION,
  MAX_POKEMON_LEVEL,
  PARTY_SIZE,
  STARTER_LEVEL,
  WILD_POKEMON_BASE_LEVEL,
} from "./gameConstants";
import type {
  CatchHistoryEntry,
  GameState,
  PersistedGameState,
  TrainerProfile,
  OwnedPokemon,
  StorageLocation,
} from "./gameTypes";
import { loadPersistedGameState } from "./gameStorage";

/**
 * Helper to create an empty party.
 */
function createEmptyParty(): (OwnedPokemon | null)[] {
  return Array(PARTY_SIZE).fill(null);
}

/**
 * Helper to create empty boxes.
 */
function createEmptyBoxes(): (OwnedPokemon | null)[][] {
  return Array(BOX_COUNT)
    .fill(null)
    .map(() => Array(BOX_SLOT_COUNT).fill(null));
}

/**
 * The initial state for a fresh game.
 */
export const initialPersistedGameState: PersistedGameState = {
  version: GAME_STATE_VERSION,
  trainer: null,
  party: createEmptyParty(),
  boxes: createEmptyBoxes(),
  currentSession: null,
  activeEncounter: null,
  history: [],
};

// Synchronously check storage for hydration status to prevent UI blink on refresh.
const persisted = loadPersistedGameState();
const isVersionValid = persisted?.version === GAME_STATE_VERSION;

/**
 * The initial state used by the useReducer hook, including hydration status.
 */
export const initialGameState: GameState = {
  ...(isVersionValid ? persisted : initialPersistedGameState),
  isHydrating: true,
};

/** Action to create a new trainer profile and assign a starter Pokemon. */
interface CreateTrainerAction {
  type: "CREATE_TRAINER";
  payload: {
    name: string;
    starterPokemonId: number;
    createdAt: number;
    starterInstanceId: string;
  };
}

/** Action to hydrate the state from persisted storage. */
interface HydrateAction {
  type: "HYDRATE";
  payload: PersistedGameState;
}

/** Action to start a new manual catching session. */
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

/** Action to end the current manual catching session. */
interface EndSessionAction {
  type: "END_SESSION";
  payload: {
    endedAt: number;
  };
}

/** Action to spawn a new encounter during an active session. */
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

/** Action to record a successful catch. */
interface CatchEncounterAction {
  type: "CATCH_ENCOUNTER";
  payload: {
    resolvedAt: number;
    ownedPokemonInstanceId: string;
  };
}

/** Action to record a missed encounter (time ran out). */
interface MissEncounterAction {
  type: "MISS_ENCOUNTER";
  payload: {
    resolvedAt: number;
  };
}

/** Action to move a Pokemon from one slot to another (Party <-> Box or Box <-> Box). */
interface MovePokemonAction {
  type: "MOVE_POKEMON";
  payload: {
    source: StorageLocation;
    destination: StorageLocation;
  };
}

/** Action to release a Pokemon. */
interface ReleasePokemonAction {
  type: "RELEASE_POKEMON";
  payload: {
    location: StorageLocation;
  };
}

/** Union of all possible game actions. */
export type GameAction =
  | CreateTrainerAction
  | HydrateAction
  | StartSessionAction
  | EndSessionAction
  | SpawnEncounterAction
  | CatchEncounterAction
  | MissEncounterAction
  | MovePokemonAction
  | ReleasePokemonAction;

/**
 * Helper to build a history entry object.
 */
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

/**
 * Applies level-up logic to the trainer's party.
 * As per rules, only Pokemon in the party gain +1 level (capped at MAX_POKEMON_LEVEL).
 */
function applyPartyLevelUp(party: (OwnedPokemon | null)[]) {
  return party.map((pokemon) => {
    if (!pokemon) {
      return null;
    }

    return {
      ...pokemon,
      level: Math.min(MAX_POKEMON_LEVEL, pokemon.level + 1),
    };
  });
}

/**
 * Pure helper to transition the state into a missed encounter state.
 * Shared between manual resolution and timer-based resolution.
 */
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

/**
 * Helper to create a trainer profile object.
 */
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

/**
 * Handles the logic for a successful Pokemon catch.
 */
function handleCatchEncounter(state: GameState, action: CatchEncounterAction): GameState {
  if (!state.activeEncounter) {
    return state;
  }

  const newPokemon: OwnedPokemon = {
    instanceId: action.payload.ownedPokemonInstanceId,
    pokemonId: state.activeEncounter.pokemonId,
    level: WILD_POKEMON_BASE_LEVEL,
    caughtAt: action.payload.resolvedAt,
    caughtInSessionId: state.currentSession?.sessionId ?? null,
  };

  const nextParty = [...state.party];
  const nextBoxes = [...state.boxes];
  let placed = false;

  // 1. Try to place in party
  const emptyPartySlot = nextParty.findIndex((p) => p === null);
  if (emptyPartySlot !== -1) {
    nextParty[emptyPartySlot] = newPokemon;
    placed = true;
  } else {
    // 2. Try to place in boxes
    for (let b = 0; b < nextBoxes.length; b++) {
      const emptyBoxSlot = nextBoxes[b].findIndex((s) => s === null);
      if (emptyBoxSlot !== -1) {
        nextBoxes[b] = [...nextBoxes[b]];
        nextBoxes[b][emptyBoxSlot] = newPokemon;
        placed = true;
        break;
      }
    }
  }

  // Only level up and record history if the catch was actually placed somewhere
  if (!placed) {
    return {
      ...state,
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            activeEncounterId: null,
          }
        : null,
      activeEncounter: null,
    };
  }

  const finalParty = applyPartyLevelUp(nextParty);

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
    boxes: nextBoxes,
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

/**
 * Handles moving a Pokemon between slots or swapping them.
 */
function handleMovePokemon(state: GameState, action: MovePokemonAction): GameState {
  const { source, destination } = action.payload;
  const nextParty = [...state.party];
  const nextBoxes = [...state.boxes];

  const pokemonToMove = source.type === "party"
    ? nextParty[source.slotIndex]
    : nextBoxes[source.boxIndex ?? 0][source.slotIndex];

  if (!pokemonToMove) return state;

  // Withdraw from source
  if (source.type === "party") {
    nextParty[source.slotIndex] = null;
  } else {
    const bIndex = source.boxIndex ?? 0;
    nextBoxes[bIndex] = [...nextBoxes[bIndex]];
    nextBoxes[bIndex][source.slotIndex] = null;
  }

  // Get what's at destination (for swap)
  const swapped = destination.type === "party"
    ? nextParty[destination.slotIndex]
    : nextBoxes[destination.boxIndex ?? 0][destination.slotIndex];

  // Deposit in destination
  if (destination.type === "party") {
    nextParty[destination.slotIndex] = pokemonToMove;
  } else {
    const bIndex = destination.boxIndex ?? 0;
    nextBoxes[bIndex] = [...nextBoxes[bIndex]];
    nextBoxes[bIndex][destination.slotIndex] = pokemonToMove;
  }

  // Put swapped back to source
  if (swapped) {
    if (source.type === "party") {
      nextParty[source.slotIndex] = swapped;
    } else {
      const bIndex = source.boxIndex ?? 0;
      nextBoxes[bIndex][source.slotIndex] = swapped;
    }
  }

  return { ...state, party: nextParty, boxes: nextBoxes };
}

/**
 * Handles releasing a Pokemon.
 */
function handleReleasePokemon(state: GameState, action: ReleasePokemonAction): GameState {
  const { location } = action.payload;
  const nextParty = [...state.party];
  const nextBoxes = [...state.boxes];

  if (location.type === "party") {
    nextParty[location.slotIndex] = null;
  } else {
    const bIndex = location.boxIndex ?? 0;
    nextBoxes[bIndex] = [...nextBoxes[bIndex]];
    nextBoxes[bIndex][location.slotIndex] = null;
  }

  return { ...state, party: nextParty, boxes: nextBoxes };
}

/**
 * The core reducer managing all game state transitions.
 * Ensures state is updated immutably and according to game rules.
 * 
 * @param state - The current game state.
 * @param action - The action to apply.
 * @returns The new game state.
 */
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

      const newParty = createEmptyParty();
      newParty[0] = {
        instanceId: action.payload.starterInstanceId,
        pokemonId: action.payload.starterPokemonId,
        level: STARTER_LEVEL,
        caughtAt: action.payload.createdAt,
        caughtInSessionId: null,
      };

      return {
        ...state,
        trainer,
        party: newParty,
        boxes: createEmptyBoxes(),
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

    case "CATCH_ENCOUNTER":
      return handleCatchEncounter(state, action);

    case "MISS_ENCOUNTER":
      return {
        ...applyMissedEncounterState(state, action.payload.resolvedAt),
        isHydrating: state.isHydrating,
      };

    case "MOVE_POKEMON":
      return handleMovePokemon(state, action);

    case "RELEASE_POKEMON":
      return handleReleasePokemon(state, action);

    default:
      return state;
  }
}
