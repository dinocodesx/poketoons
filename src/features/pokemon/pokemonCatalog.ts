import catalogData from "../../data/pokemon-catalog.json";
import bucketData from "../../data/rarity-buckets.json";
import { validatePokemonData } from "./pokemonValidation";
import type { PokemonCatalogEntry, RarityBucket } from "./pokemonTypes";

/** The full list of Pokemon species available in the game. */
export const pokemonCatalog = catalogData as PokemonCatalogEntry[];

/** The weighted rarity buckets used for spawning logic. */
export const rarityBuckets = bucketData as RarityBucket[];

/**
 * Validates the loaded catalog and bucket data against business rules.
 * Throws an error if the data is invalid.
 */
validatePokemonData(pokemonCatalog, rarityBuckets);

/**
 * Retrieves a Pokemon species by its ID.
 * 
 * @param id - The ID of the Pokemon to find.
 * @returns The catalog entry, or undefined if not found.
 */
export function getPokemonById(id: number): PokemonCatalogEntry | undefined {
  return pokemonCatalog.find((p) => p.id === id);
}

/**
 * The specific Pokemon IDs traditionally offered as starters in Generation 1.
 */
const STARTER_IDS = [1, 4, 7]; // Bulbasaur, Charmander, Squirtle

/**
 * The catalog entries for the available starter choices.
 */
export const starterChoices = pokemonCatalog.filter((p) =>
  STARTER_IDS.includes(p.id),
);
