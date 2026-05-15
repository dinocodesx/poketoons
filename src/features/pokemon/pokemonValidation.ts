import type { PokemonCatalogEntry, RarityBucket } from "./pokemonTypes";

/**
 * Validates the integrity of the Pokemon data files.
 * Ensures all species are within the allowed range and that buckets reference valid species.
 * 
 * @param catalog - The loaded Pokemon species catalog.
 * @param buckets - The loaded rarity buckets.
 */
export function validatePokemonData(
  catalog: PokemonCatalogEntry[],
  buckets: RarityBucket[],
): void {
  // 1. Ensure all catalog entries are within Pokedex 1-251
  const invalidIds = catalog.filter((p) => p.id < 1 || p.id > 251);

  if (invalidIds.length > 0) {
    throw new Error(
      `Catalog contains invalid IDs: ${invalidIds.map((p) => p.id).join(", ")}`,
    );
  }

  // 2. Ensure all rarity buckets reference existing catalog IDs
  const catalogIdSet = new Set(catalog.map((p) => p.id));
  
  buckets.forEach((bucket) => {
    const missingIds = bucket.pokemonIds.filter((id) => !catalogIdSet.has(id));
    if (missingIds.length > 0) {
      throw new Error(
        `Bucket '${bucket.key}' references missing Pokemon IDs: ${missingIds.join(
          ", ",
        )}`,
      );
    }
  });

  // 3. Ensure weighted buckets have valid weights
  const invalidWeights = buckets.filter((b) => b.weight < 0);
  if (invalidWeights.length > 0) {
    throw new Error(
      `Buckets contain invalid weights: ${invalidWeights
        .map((b) => b.key)
        .join(", ")}`,
    );
  }
}
