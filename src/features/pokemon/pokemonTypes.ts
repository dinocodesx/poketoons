/**
 * The possible rarity levels for Pokemon in the game.
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
 * Represents an entry in the Pokemon species catalog.
 */
export interface PokemonCatalogEntry {
  /** The unique Pokedex number (1-493). */
  id: number;
  /** Normalized name for logic and storage. */
  name: string;
  /** The generation the Pokemon belongs to. */
  generation: 1 | 2 | 3 | 4;
  /** The rarity tier of the species. */
  rarity: PokemonRarity;
  /** The spawn group the species belongs to. */
  group: PokemonRarity;
  /** The minimum catch count required for this species to spawn. */
  minCatchLevel: number;
  /** The name of the evolution family the species belongs to. */
  evolutionFamily: string;
  /** The URL for the Pokemon's official artwork. */
  artworkUrl: string;
}

/**
 * Represents a bucket used for weighted random spawn selection.
 */
export interface RarityBucket {
  /** The rarity key associated with this bucket. */
  key: PokemonRarity;
  /** A human-readable label for the rarity. */
  label: string;
  /** The relative weight for spawning from this bucket. */
  weight: number;
  /** The minimum level for Pokemon caught from this bucket. */
  minLevel: number;
  /** List of Pokemon IDs included in this bucket. */
  pokemonIds: number[];
}
