/**
 * Categories determining encounter probability and power levels.
 */
export type PokemonRarity =
  | "early_route"
  | "forest"
  | "rare"
  | "baby"
  | "no_evo"
  | "safari"
  | "victory_road"
  | "starter"
  | "pseudo_legendary"
  | "legendary";

/**
 * Static definition of a Pokemon species in the game's Pokedex.
 * These values are derived from PokeAPI and are read-only at runtime.
 */
export interface PokemonCatalogEntry {
  /** The unique Pokedex number (1-493). */
  id: number;
  /** URL-friendly name (e.g., 'mr-mime'). */
  name: string;
  /** Generation introduced (1-4). */
  generation: 1 | 2 | 3 | 4;
  /** The rarity classification of this species. */
  rarity: PokemonRarity;
  /** 
   * The spawn group this species belongs to. 
   * Used for selecting which bucket to pull from. 
   */
  group: PokemonRarity;
  /** 
   * Minimum number of lifetime catches required to unlock this species spawn.
   * Creates a progression curve for rare/powerful Pokemon.
   */
  minCatchLevel: number;
  /** Identifier for grouping species into evolution trees. */
  evolutionFamily: string;
  /** High-quality artwork URL. */
  artworkUrl: string;
}

/**
 * Configuration for a weighted encounter pool.
 */
export interface RarityBucket {
  /** Machine key matching PokemonRarity. */
  key: PokemonRarity;
  /** Display label (e.g., 'Early Route'). */
  label: string;
  /** Relative weight (probability) of this bucket being selected. */
  weight: number;
  /** The starting level assigned to Pokemon caught from this bucket. */
  minLevel: number;
  /** List of species IDs included in this encounter pool. */
  pokemonIds: number[];
}
