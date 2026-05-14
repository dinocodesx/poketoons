import type { PokemonCatalogEntry, RarityBucket } from "./pokemonTypes";

const MAX_POKEMON_ID = 251;
const MIN_POKEMON_ID = 1;

export function validatePokemonData(
  catalog: PokemonCatalogEntry[],
  buckets: RarityBucket[],
) {
  const ids = new Set<number>();
  const names = new Set<string>();

  for (const pokemon of catalog) {
    if (pokemon.id < MIN_POKEMON_ID || pokemon.id > MAX_POKEMON_ID) {
      throw new Error(`Pokemon id ${pokemon.id} is outside the allowed range.`);
    }

    if (ids.has(pokemon.id)) {
      throw new Error(`Duplicate Pokemon id detected: ${pokemon.id}`);
    }

    if (names.has(pokemon.name)) {
      throw new Error(`Duplicate Pokemon name detected: ${pokemon.name}`);
    }

    ids.add(pokemon.id);
    names.add(pokemon.name);
  }

  for (const bucket of buckets) {
    for (const id of bucket.pokemonIds) {
      if (!ids.has(id)) {
        throw new Error(
          `Bucket ${bucket.key} references unknown Pokemon id ${id}`,
        );
      }
    }
  }

  return {
    catalog,
    buckets,
  };
}
