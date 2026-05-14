import { normalizeGuess } from "../../lib/string";
import { pickWeightedItem, randomFromArray } from "../../lib/random";
import type { PokemonCatalogEntry, RarityBucket } from "./pokemonTypes";

export function isCorrectPokemonGuess(
  guess: string,
  pokemon: Pick<PokemonCatalogEntry, "name">,
) {
  return normalizeGuess(guess) === pokemon.name;
}

export function getEligiblePokemon(
  catalog: PokemonCatalogEntry[],
  catchProgress: number,
) {
  return catalog.filter((pokemon) => pokemon.minCatchLevel <= catchProgress);
}

export function pickSpawnPokemon(
  catalog: PokemonCatalogEntry[],
  buckets: RarityBucket[],
  catchProgress: number,
) {
  const eligiblePokemon = getEligiblePokemon(catalog, catchProgress);
  const eligibleIds = new Set(eligiblePokemon.map((pokemon) => pokemon.id));
  const weightedBuckets = buckets
    .map((bucket) => ({
      ...bucket,
      eligibleIds: bucket.pokemonIds.filter((id) => eligibleIds.has(id)),
    }))
    .filter((bucket) => bucket.eligibleIds.length > 0);

  const selectedBucket = pickWeightedItem(weightedBuckets);

  if (!selectedBucket) {
    return null;
  }

  return randomFromArray(selectedBucket.eligibleIds);
}
