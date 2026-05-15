import type { PokemonCatalogEntry } from "../pokemon/types";

export type CatchResult = "caught" | "missed" | "fled";

export interface TrainerProfile {
  name: string;
  starterPokemonId: number;
  createdAt: number;
}

export interface CatchHistoryEntry {
  encounterId: string;
  pokemonId: number;
  result: CatchResult;
  resolvedAt: number;
  sessionId: string | null;
}

export interface HistoryEntry extends CatchHistoryEntry {
  pokemon: PokemonCatalogEntry;
}
