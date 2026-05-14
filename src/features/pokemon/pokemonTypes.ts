export type PokemonRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary";

export interface PokemonCatalogEntry {
  id: number;
  name: string;
  generation: 1 | 2;
  rarity: PokemonRarity;
  group: PokemonRarity;
  minCatchLevel: number;
  evolutionFamily: string;
  artworkUrl: string;
}

export interface RarityBucket {
  key: PokemonRarity;
  label: string;
  weight: number;
  pokemonIds: number[];
}
