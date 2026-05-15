import {
  INITIAL_BOX_COUNT,
  MAX_BOX_COUNT,
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
import { getPokemonById, getBucketByKey } from "../pokemon/pokemonCatalog";
import evolutionData from "../../data/evolutions.json";

/** 
 * Evolution configuration format. 
 * Supports both linear and branching evolution paths.
 */
interface EvolutionConfig {
  /** Species ID(s) to evolve into. */
  to: number | number[];
  /** Level threshold for evolution. */
  level: number;
}

/** Static evolution mapping for all Gen 1-4 species. */
const evolutions = evolutionData as Record<string, EvolutionConfig>;

/**
 * Creates a fixed-size empty party array.
 * @returns Array of length PARTY_SIZE filled with null.
 */
function createEmptyParty(): (OwnedPokemon | null)[] {
  return Array(PARTY_SIZE).fill(null);
}

/**
 * Creates the initial storage box structure.
 * @returns 2D array [INITIAL_BOX_COUNT][BOX_SLOT_COUNT].
 */
function createEmptyBoxes(): (OwnedPokemon | null)[][] {
  return Array(INITIAL_BOX_COUNT)
    .fill(null)
    .map(() => Array(BOX_SLOT_COUNT).fill(null));
}

/**
 * Default state for a new player.
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
 * The initial state used by the useReducer hook.
 * Seeds from localStorage if a valid version exists.
 */
export const initialGameState: GameState = {
  ...(isVersionValid ? persisted : initialPersistedGameState),
  isHydrating: true,
};

// --- Action Definitions ---

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

interface FleeEncounterAction {
  type: "FLEE_ENCOUNTER";
  payload: {
    resolvedAt: number;
  };
}

interface RecordMistakeAction {
  type: "RECORD_MISTAKE";
}

interface MovePokemonAction {
  type: "MOVE_POKEMON";
  payload: {
    source: StorageLocation;
    destination: StorageLocation;
  };
}

interface ReleasePokemonAction {
  type: "RELEASE_POKEMON";
  payload: {
    location: StorageLocation;
  };
}

interface AddBoxAction {
  type: "ADD_BOX";
}

export type GameAction =
  | CreateTrainerAction
  | HydrateAction
  | StartSessionAction
  | EndSessionAction
  | SpawnEncounterAction
  | CatchEncounterAction
  | MissEncounterAction
  | FleeEncounterAction
  | RecordMistakeAction
  | MovePokemonAction
  | ReleasePokemonAction
  | AddBoxAction;

// --- Domain Logic Handlers (SRP) ---

/**
 * Internal helper to build history records.
 */
function buildHistoryEntry(
  encounterId: string,
  pokemonId: number,
  result: CatchHistoryEntry["result"],
  resolvedAt: number,
  sessionId: string | null,
): CatchHistoryEntry {
  return { encounterId, pokemonId, result, resolvedAt, sessionId };
}

/**
 * Increments levels for the trainer's active party and checks for evolutions.
 * @param party - Current trainer party.
 * @returns Updated party array.
 */
function applyPartyLevelUp(party: (OwnedPokemon | null)[]) {
  return party.map((pokemon) => {
    if (!pokemon) return null;

    const nextLevel = Math.min(MAX_POKEMON_LEVEL, pokemon.level + 1);
    let currentPokemonId = pokemon.pokemonId;

    // Check evolution mapping
    const evoConfig = evolutions[currentPokemonId.toString()];
    if (evoConfig && nextLevel >= evoConfig.level) {
      if (Array.isArray(evoConfig.to)) {
        // Branching Evolution: Randomly select a candidate
        const randomIndex = Math.floor(Math.random() * evoConfig.to.length);
        currentPokemonId = evoConfig.to[randomIndex];
      } else {
        // Linear Evolution
        currentPokemonId = evoConfig.to;
      }
    }

    return {
      ...pokemon,
      level: nextLevel,
      pokemonId: currentPokemonId,
    };
  });
}

/**
 * Handles the logic for a successful Pokemon catch.
 * Attempts to place the Pokemon in the first available slot (Party first, then Boxes).
 */
function handleCatchEncounter(state: GameState, action: CatchEncounterAction): GameState {
  if (!state.activeEncounter) return state;

  // Determine starting level based on the encounter's rarity bucket
  const pokemonSpecies = getPokemonById(state.activeEncounter.pokemonId);
  const bucket = pokemonSpecies ? getBucketByKey(pokemonSpecies.group) : undefined;
  const initialLevel = bucket?.minLevel ?? WILD_POKEMON_BASE_LEVEL;

  const newPokemon: OwnedPokemon = {
    instanceId: action.payload.ownedPokemonInstanceId,
    pokemonId: state.activeEncounter.pokemonId,
    level: initialLevel,
    caughtAt: action.payload.resolvedAt,
    caughtInSessionId: state.currentSession?.sessionId ?? null,
  };

  const nextParty = [...state.party];
  const nextBoxes = [...state.boxes];
  let isPlaced = false;

  // 1. Attempt placement in Party
  const emptyPartySlot = nextParty.findIndex((p) => p === null);
  if (emptyPartySlot !== -1) {
    nextParty[emptyPartySlot] = newPokemon;
    isPlaced = true;
  } else {
    // 2. Attempt placement in Boxes
    for (let b = 0; b < nextBoxes.length; b++) {
      const emptyBoxSlot = nextBoxes[b].findIndex((s) => s === null);
      if (emptyBoxSlot !== -1) {
        nextBoxes[b] = [...nextBoxes[b]];
        nextBoxes[b][emptyBoxSlot] = newPokemon;
        isPlaced = true;
        break;
      }
    }
  }

  // If storage is full, the encounter still ends but no Pokemon is added
  if (!isPlaced) {
    return {
      ...state,
      currentSession: state.currentSession
        ? { ...state.currentSession, activeEncounterId: null }
        : null,
      activeEncounter: null,
    };
  }

  // Only the active party gains levels upon a successful catch
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
      ? { ...state.currentSession, activeEncounterId: null }
      : null,
    activeEncounter: null,
    history: [...state.history, historyEntry],
  };
}

/**
 * Transitions the game state into a resolved encounter state (non-caught).
 * Shared between manual 'miss' and timer-based 'flee'.
 */
export function applyResolvedEncounterState(
  state: PersistedGameState,
  resolvedAt: number,
  result: "missed" | "fleeing",
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

/**
 * Handles swapping or moving Pokemon between party slots and boxes.
 */
function handleMovePokemon(state: GameState, action: MovePokemonAction): GameState {
  const { source, destination } = action.payload;
  const nextParty = [...state.party];
  const nextBoxes = [...state.boxes];

  // Resolve source Pokemon
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

  // Resolve destination (for swapping)
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

  // Handle Swap: Put displaced Pokemon back into the source slot
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
 * Removes a Pokemon permanently from the trainer's collection.
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
 * Adds a new empty box to the storage system if within limits.
 */
function handleAddBox(state: GameState): GameState {
  if (state.boxes.length >= MAX_BOX_COUNT) return state;

  const newBox = Array(BOX_SLOT_COUNT).fill(null);
  return {
    ...state,
    boxes: [...state.boxes, newBox],
  };
}

/**
 * The core reducer managing all game state transitions.
 * Adheres to Redux-style immutable patterns.
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "HYDRATE":
      return { ...action.payload, isHydrating: false };

    case "CREATE_TRAINER": {
      const { name, starterPokemonId, createdAt, starterInstanceId } = action.payload;
      
      const trainer: TrainerProfile = { name, starterPokemonId, createdAt };
      const party = createEmptyParty();
      party[0] = {
        instanceId: starterInstanceId,
        pokemonId: starterPokemonId,
        level: STARTER_LEVEL,
        caughtAt: createdAt,
        caughtInSessionId: null,
      };

      return { ...state, trainer, party, boxes: createEmptyBoxes() };
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
          mistakes: 0,
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
          mistakes: 0,
        },
      };

    case "CATCH_ENCOUNTER":
      return handleCatchEncounter(state, action);

    case "MISS_ENCOUNTER":
      return {
        ...applyResolvedEncounterState(state, action.payload.resolvedAt, "missed"),
        isHydrating: state.isHydrating,
      };

    case "FLEE_ENCOUNTER":
      return {
        ...applyResolvedEncounterState(state, action.payload.resolvedAt, "fleeing"),
        isHydrating: state.isHydrating,
      };

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
      return handleMovePokemon(state, action);

    case "RELEASE_POKEMON":
      return handleReleasePokemon(state, action);

    case "ADD_BOX":
      return handleAddBox(state);

    default:
      return state;
  }
}
