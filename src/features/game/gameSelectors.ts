import { getPokemonById } from "../pokemon/pokemonCatalog";
import type { CollectionEntry, GameState, HistoryEntry } from "./gameTypes";

/** Maximum number of history entries to show in the recent history panel. */
const RECENT_HISTORY_LIMIT = 10;

/**
 * Selector to check if a game session is currently active.
 */
export function selectSessionActive(state: GameState) {
  return state.currentSession?.status === "active";
}

/**
 * Selector to get the total number of Pokemon caught by the trainer.
 */
export function selectTotalCaught(state: GameState) {
  return state.history.filter((entry) => entry.result === "caught").length;
}

/**
 * Selector to get the total number of Pokemon currently owned by the trainer.
 */
export function selectTotalOwned(state: GameState) {
  return state.ownedPokemon.length;
}

/**
 * Selector to get the trainer's starter Pokemon catalog entry.
 */
export function selectStarterPokemon(state: GameState) {
  if (!state.trainer) {
    return null;
  }

  return getPokemonById(state.trainer.starterPokemonId) ?? null;
}

/**
 * Selector to get the catalog entry for the Pokemon in the current encounter.
 */
export function selectCurrentEncounterPokemon(state: GameState) {
  if (!state.activeEncounter) {
    return null;
  }

  return getPokemonById(state.activeEncounter.pokemonId) ?? null;
}

/**
 * Selector to get the full collection of owned Pokemon, enhanced with catalog data.
 * Returns entries in reverse chronological order (newest first).
 */
export function selectCollectionEntries(state: GameState): CollectionEntry[] {
  return [...state.ownedPokemon].reverse().flatMap((ownedPokemon) => {
    const pokemon = getPokemonById(ownedPokemon.pokemonId);

    if (!pokemon) {
      return [];
    }

    return [
      {
        ...ownedPokemon,
        pokemon,
      },
    ];
  });
}

/**
 * Selector to get the most recent catch history entries, enhanced with catalog data.
 * Returns entries in reverse chronological order.
 */
export function selectRecentHistoryEntries(state: GameState): HistoryEntry[] {
  return [...state.history]
    .reverse()
    .slice(0, RECENT_HISTORY_LIMIT)
    .flatMap((entry) => {
      const pokemon = getPokemonById(entry.pokemonId);

      if (!pokemon) {
        return [];
      }

      return [
        {
          ...entry,
          pokemon,
        },
      ];
    });
}
