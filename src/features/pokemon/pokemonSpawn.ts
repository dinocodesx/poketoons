import { pickWeightedRandom } from "../../lib/random";
import { normalizeGuess } from "../../lib/string";
import type { PokemonCatalogEntry, RarityBucket } from "./pokemonTypes";

/**
 * Validates if a user's guess matches a Pokemon's name.
 * Performs a case-insensitive comparison on the normalized name.
 * 
 * @param guess - The player's input string.
 * @param pokemon - The catalog entry for the Pokemon to check against.
 * @returns True if the guess is correct.
 */
export function isCorrectPokemonGuess(
  guess: string,
  pokemon: PokemonCatalogEntry,
) {
  return normalizeGuess(guess) === normalizeGuess(pokemon.name);
}

/**
 * Selects a random Pokemon species to spawn based on weighted rarity and trainer progression.
 * 
 * @param catalog - The full Pokemon catalog.
 * @param buckets - The rarity buckets for weighted selection.
 * @param totalCaught - The trainer's total catch count (used to unlock rare spawns).
 * @returns The ID of the spawned Pokemon, or null if selection fails.
 */
export function pickSpawnPokemon(
  catalog: PokemonCatalogEntry[],
  buckets: RarityBucket[],
  totalCaught: number,
): number | null {
  // 1. Pick a weighted rarity bucket
  const bucket = pickWeightedRandom(buckets);

  if (!bucket) return null;

  // 2. Filter the IDs in that bucket by the trainer's catch level
  const eligibleIds = bucket.pokemonIds.filter((id) => {
    const entry = catalog.find((p) => p.id === id);
    if (!entry) return false;
    return totalCaught >= entry.minCatchLevel;
  });

  if (eligibleIds.length === 0) {
    // Fallback: If no rarities in this bucket are eligible, recursively try again or pick a common one.
    // For simplicity, we'll try one more time or return null (the loop will retry on next tick).
    return null;
  }

  // 3. Pick a random Pokemon from the eligible list
  const randomIndex = Math.floor(Math.random() * eligibleIds.length);
  return eligibleIds[randomIndex] ?? null;
}
