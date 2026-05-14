import pokemonCatalogData from "../../data/pokemon-catalog.json";
import rarityBucketsData from "../../data/rarity-buckets.json";
import { validatePokemonData } from "./pokemonValidation";
import type { PokemonCatalogEntry, RarityBucket } from "./pokemonTypes";

const { catalog, buckets } = validatePokemonData(
  pokemonCatalogData as PokemonCatalogEntry[],
  rarityBucketsData as RarityBucket[],
);

export const pokemonCatalog = catalog;
export const rarityBuckets = buckets;

export const pokemonById = new Map(
  pokemonCatalog.map((pokemon) => [pokemon.id, pokemon] as const),
);

export const starterPokemonIds = [1, 4, 7] as const;

export const starterChoices = starterPokemonIds
  .map((id) => pokemonById.get(id))
  .filter((pokemon): pokemon is PokemonCatalogEntry => Boolean(pokemon));

export function getPokemonById(id: number) {
  return pokemonById.get(id) ?? null;
}
