import type { PokemonCatalogEntry } from "../pokemon/types";

export interface OwnedPokemon {
  instanceId: string;
  pokemonId: number;
  level: number;
  caughtAt: number;
  caughtInSessionId: string | null;
}

export interface CollectionEntry extends OwnedPokemon {
  pokemon: PokemonCatalogEntry;
}

export interface StorageLocation {
  type: "party" | "box";
  boxIndex?: number;
  slotIndex: number;
}
