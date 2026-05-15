import type { PokemonCatalogEntry } from "../pokemon/pokemonTypes";

/**
 * Represents the current status of an encounter.
 */
export type EncounterStatus = "active" | "caught" | "missed";

/**
 * Represents the current status of a game session.
 */
export type SessionStatus = "idle" | "active" | "ended";

/**
 * The possible outcomes of an encounter.
 */
export type CatchResult = "caught" | "missed";

/**
 * Profile data for the player (Trainer).
 */
export interface TrainerProfile {
  /** The trainer's chosen name. */
  name: string;
  /** ID of the starter Pokemon chosen. */
  starterPokemonId: number;
  /** Timestamp when the trainer profile was created. */
  createdAt: number;
}

/**
 * Represents a Pokemon instance owned by a trainer.
 */
export interface OwnedPokemon {
  /** Unique identifier for this specific instance. */
  instanceId: string;
  /** ID referencing the Pokemon in the catalog. */
  pokemonId: number;
  /** Current level of this Pokemon. */
  level: number;
  /** Timestamp when this Pokemon was caught. */
  caughtAt: number;
  /** The ID of the session in which this Pokemon was caught, if any. */
  caughtInSessionId: string | null;
}

/**
 * Represents an ongoing encounter with a wild Pokemon.
 */
export interface ActiveEncounter {
  /** Unique identifier for this encounter cycle. */
  encounterId: string;
  /** ID of the Pokemon currently appearing. */
  pokemonId: number;
  /** Timestamp when the encounter began. */
  startedAt: number;
  /** Timestamp when the catch window expires. */
  expiresAt: number;
  /** Current state of the encounter. */
  status: EncounterStatus;
}

/**
 * Represents a manual catching session.
 */
export interface GameSession {
  /** Unique identifier for the session. */
  sessionId: string;
  /** Timestamp when the session was started. */
  startedAt: number;
  /** Timestamp when the session was ended, or null if active. */
  endedAt: number | null;
  /** Current status of the session. */
  status: SessionStatus;
  /** Duration of each cycle in this session. */
  cycleDurationMs: number;
  /** ID of the currently active encounter, if any. */
  activeEncounterId: string | null;
  /** Timestamp for when the next encounter is scheduled to appear. */
  nextEncounterAt: number | null;
}

/**
 * A record of a completed encounter in the trainer's history.
 */
export interface CatchHistoryEntry {
  /** ID of the encounter. */
  encounterId: string;
  /** ID of the Pokemon involved. */
  pokemonId: number;
  /** Whether the Pokemon was caught or missed. */
  result: CatchResult;
  /** Timestamp when the encounter was resolved. */
  resolvedAt: number;
  /** ID of the session during which this occurred. */
  sessionId: string | null;
}

/**
 * The core game state that is persisted to localStorage.
 */
export interface PersistedGameState {
  /** Schema version. */
  version: number;
  /** The trainer's profile, or null if not yet created. */
  trainer: TrainerProfile | null;
  /** The trainer's current party of Pokemon. Always length PARTY_SIZE. */
  party: (OwnedPokemon | null)[];
  /** The trainer's storage boxes. Array of BOX_COUNT boxes, each with BOX_SLOT_COUNT slots. */
  boxes: (OwnedPokemon | null)[][];
  /** The current or most recent session data. */
  currentSession: GameSession | null;
  /** The currently active encounter, if any. */
  activeEncounter: ActiveEncounter | null;
  /** Chronological history of all encounters. */
  history: CatchHistoryEntry[];
}

/**
 * The full game state used within the React application.
 */
export interface GameState extends PersistedGameState {
  /** Whether the state is currently being loaded from storage. */
  isHydrating: boolean;
}

/**
 * A UI-friendly representation of an owned Pokemon with catalog details.
 */
export interface CollectionEntry extends OwnedPokemon {
  /** Full catalog data for the Pokemon species. */
  pokemon: PokemonCatalogEntry;
}

/**
 * A UI-friendly representation of a history record with catalog details.
 */
export interface HistoryEntry extends CatchHistoryEntry {
  /** Full catalog data for the Pokemon species. */
  pokemon: PokemonCatalogEntry;
}

/**
 * Represents a location in the storage system (Party or Box).
 */
export interface StorageLocation {
  type: "party" | "box";
  boxIndex?: number;
  slotIndex: number;
}

/**
 * The result of a player's guess attempt.
 */
export interface GuessAttemptResult {
  /** Whether the guess was accepted for processing. */
  accepted: boolean;
  /** Whether the guess correctly identified the Pokemon. */
  correct: boolean;
  /** User-facing feedback message. */
  message: string;
}
