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
  // 1. Ensure all catalog entries are within Pokedex 1-493
  const invalidIds = catalog.filter((p) => p.id < 1 || p.id > 493);

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

  // 4. Ensure minCatchLevel is non-negative and valid
  const invalidCatchLevels = catalog.filter((p) => p.minCatchLevel < 0);
  if (invalidCatchLevels.length > 0) {
    throw new Error(
      `Catalog contains invalid minCatchLevel values for: ${invalidCatchLevels
        .map((p) => p.name)
        .join(", ")}`,
    );
  }

  // 5. Ensure there are always some Pokemon available at catch level 0 (early_route bucket)
  const earlyRouteBucket = buckets.find((b) => b.key === "early_route");
  if (earlyRouteBucket) {
    const level0Count = earlyRouteBucket.pokemonIds.filter((id) => {
      const p = catalog.find((entry) => entry.id === id);
      return p && p.minCatchLevel === 0;
    }).length;

    if (level0Count === 0) {
      throw new Error("No Pokemon available in early_route bucket at catch level 0.");
    }
  }
}
