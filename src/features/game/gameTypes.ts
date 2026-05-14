import type { PokemonCatalogEntry } from "../pokemon/pokemonTypes";

export type EncounterStatus = "active" | "caught" | "missed";
export type SessionStatus = "idle" | "active" | "ended";
export type CatchResult = "caught" | "missed";

export interface TrainerProfile {
  name: string;
  starterPokemonId: number;
  createdAt: number;
}

export interface OwnedPokemon {
  instanceId: string;
  pokemonId: number;
  level: number;
  caughtAt: number;
  caughtInSessionId: string | null;
}

export interface ActiveEncounter {
  encounterId: string;
  pokemonId: number;
  startedAt: number;
  expiresAt: number;
  status: EncounterStatus;
}

export interface GameSession {
  sessionId: string;
  startedAt: number;
  endedAt: number | null;
  status: SessionStatus;
  cycleDurationMs: number;
  activeEncounterId: string | null;
  nextEncounterAt: number | null;
}

export interface CatchHistoryEntry {
  encounterId: string;
  pokemonId: number;
  result: CatchResult;
  resolvedAt: number;
  sessionId: string | null;
}

export interface PersistedGameState {
  version: number;
  trainer: TrainerProfile | null;
  ownedPokemon: OwnedPokemon[];
  currentSession: GameSession | null;
  activeEncounter: ActiveEncounter | null;
  history: CatchHistoryEntry[];
}

export interface GameState extends PersistedGameState {
  isHydrating: boolean;
}

export interface CollectionEntry extends OwnedPokemon {
  pokemon: PokemonCatalogEntry;
}

export interface HistoryEntry extends CatchHistoryEntry {
  pokemon: PokemonCatalogEntry;
}

export interface GuessAttemptResult {
  accepted: boolean;
  correct: boolean;
  message: string;
}
