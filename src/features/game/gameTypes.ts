import type { PokemonCatalogEntry } from "../pokemon/pokemonTypes";

/**
 * Represents the current status of an encounter.
 * - 'active': The Pokemon is currently visible and can be guessed.
 * - 'caught': The encounter ended with a successful catch.
 * - 'missed': The encounter ended due to time or too many mistakes.
 * - 'fleeing': The encounter ended without any player interaction.
 */
export type EncounterStatus = "active" | "caught" | "missed" | "fleeing";

/**
 * Represents the current status of a game session.
 * Sessions are the "active play" state where encounters spawn.
 */
export type SessionStatus = "idle" | "active" | "ended";

/**
 * The final result of an encounter recorded in history.
 */
export type CatchResult = "caught" | "missed" | "fleeing";

/**
 * Profile data for the player (Trainer).
 * Persisted across sessions.
 */
export interface TrainerProfile {
  /** The trainer's chosen name. */
  name: string;
  /** ID of the starter Pokemon chosen (Pokedex ID). */
  starterPokemonId: number;
  /** Timestamp when the trainer profile was created. */
  createdAt: number;
}

/**
 * Represents a specific Pokemon instance owned by a trainer.
 * This is different from a CatalogEntry, as it represents a unique individual with its own level and history.
 */
export interface OwnedPokemon {
  /** Unique identifier for this specific instance (UUID). */
  instanceId: string;
  /** ID referencing the Pokemon species in the catalog (Pokedex ID). */
  pokemonId: number;
  /** Current level of this Pokemon (1-100). */
  level: number;
  /** Timestamp when this Pokemon was caught. */
  caughtAt: number;
  /** The ID of the session in which this Pokemon was caught, if any. */
  caughtInSessionId: string | null;
}

/**
 * Represents an ongoing encounter with a wild Pokemon species.
 */
export interface ActiveEncounter {
  /** Unique identifier for this specific encounter occurrence. */
  encounterId: string;
  /** ID of the Pokemon species appearing (Pokedex ID). */
  pokemonId: number;
  /** Timestamp when the encounter began. */
  startedAt: number;
  /** Timestamp when the catch window expires. */
  expiresAt: number;
  /** Current state of the encounter. */
  status: EncounterStatus;
  /** Number of incorrect guesses recorded in this encounter. Max 3. */
  mistakes: number;
}

/**
 * Represents a manual catching session.
 * Tracks the "active play" state and schedules the next spawn.
 */
export interface GameSession {
  /** Unique identifier for the session (UUID). */
  sessionId: string;
  /** Timestamp when the session was started. */
  startedAt: number;
  /** Timestamp when the session was ended, or null if currently active. */
  endedAt: number | null;
  /** Current status of the session. */
  status: SessionStatus;
  /** Duration of each cycle in this session (ms). */
  cycleDurationMs: number;
  /** ID of the encounter currently associated with this session. */
  activeEncounterId: string | null;
  /** Timestamp for when the next encounter is scheduled to appear if none is active. */
  nextEncounterAt: number | null;
}

/**
 * A historical record of a completed encounter.
 */
export interface CatchHistoryEntry {
  /** ID of the encounter. */
  encounterId: string;
  /** ID of the Pokemon involved. */
  pokemonId: number;
  /** Whether the Pokemon was caught, missed, or fled. */
  result: CatchResult;
  /** Timestamp when the encounter was resolved. */
  resolvedAt: number;
  /** ID of the session during which this occurred. */
  sessionId: string | null;
}

/**
 * The core game state that is serialized to JSON for localStorage.
 * Does not include transient UI states like 'isHydrating'.
 */
export interface PersistedGameState {
  /** Schema version for migration logic. */
  version: number;
  /** The trainer's profile, or null for new players. */
  trainer: TrainerProfile | null;
  /** The trainer's current active party. Fixed size (e.g., 6). */
  party: (OwnedPokemon | null)[];
  /** The trainer's storage boxes for Pokemon not in the party. */
  boxes: (OwnedPokemon | null)[][];
  /** The current or most recent session metadata. */
  currentSession: GameSession | null;
  /** The currently active wild encounter, if any. */
  activeEncounter: ActiveEncounter | null;
  /** Chronological list of all historical encounters. */
  history: CatchHistoryEntry[];
}

/**
 * The full application state used within React.
 * Extends persisted state with runtime-only flags.
 */
export interface GameState extends PersistedGameState {
  /** 
   * True while state is being loaded from storage.
   * Prevents UI flickers and hydration mismatches.
   */
  isHydrating: boolean;
}

/**
 * A UI-friendly view of an OwnedPokemon, joined with its species data.
 */
export interface CollectionEntry extends OwnedPokemon {
  /** Full species details from the catalog. */
  pokemon: PokemonCatalogEntry;
}

/**
 * A UI-friendly view of a history record, joined with species data.
 */
export interface HistoryEntry extends CatchHistoryEntry {
  /** Full species details from the catalog. */
  pokemon: PokemonCatalogEntry;
}

/**
 * Represents a target location within the storage system.
 */
export interface StorageLocation {
  /** Whether the slot is in the Party or a Box. */
  type: "party" | "box";
  /** The index of the box (0-indexed) if type is 'box'. */
  boxIndex?: number;
  /** The index of the slot within the party or box. */
  slotIndex: number;
}

/**
 * Result of a user's guess attempt for UI feedback.
 */
export interface GuessAttemptResult {
  /** Whether the guess was processed (false if encounter was invalid). */
  accepted: boolean;
  /** Whether the guess was correct. */
  correct: boolean;
  /** Feedback message to display to the user. */
  message: string;
}
