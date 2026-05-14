import { getPokemonById } from "../pokemon/pokemonCatalog";
import type { CollectionEntry, GameState, HistoryEntry } from "./gameTypes";

const RECENT_HISTORY_LIMIT = 8;

export function selectSessionActive(state: GameState) {
  return state.currentSession?.status === "active";
}

export function selectTotalCaught(state: GameState) {
  return state.history.filter((entry) => entry.result === "caught").length;
}

export function selectTotalOwned(state: GameState) {
  return state.ownedPokemon.length;
}

export function selectStarterPokemon(state: GameState) {
  if (!state.trainer) {
    return null;
  }

  return getPokemonById(state.trainer.starterPokemonId);
}

export function selectCurrentEncounterPokemon(state: GameState) {
  if (!state.activeEncounter) {
    return null;
  }

  return getPokemonById(state.activeEncounter.pokemonId);
}

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
