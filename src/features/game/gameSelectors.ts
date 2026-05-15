import { getPokemonById } from "../pokemon/pokemonCatalog";
import type {
  CollectionEntry,
  GameState,
  HistoryEntry,
  OwnedPokemon,
} from "./gameTypes";

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
  const partyCount = state.party.filter((p) => p !== null).length;
  const boxesCount = state.boxes.reduce(
    (acc, box) => acc + box.filter((s) => s !== null).length,
    0,
  );
  return partyCount + boxesCount;
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
 * Helper to enhance an owned Pokemon with catalog details.
 */
function enhancePokemon(owned: OwnedPokemon): CollectionEntry | null {
  const pokemon = getPokemonById(owned.pokemonId);
  if (!pokemon) return null;
  return { ...owned, pokemon };
}

/**
 * Selector to get the trainer's party with catalog data.
 */
export function selectPartyEntries(
  state: GameState,
): (CollectionEntry | null)[] {
  return state.party.map((p) => (p ? enhancePokemon(p) : null));
}

/**
 * Selector to get a specific box with catalog data.
 */
export function selectBoxEntries(
  state: GameState,
  boxIndex: number,
): (CollectionEntry | null)[] {
  const box = state.boxes[boxIndex];
  if (!box) return [];
  return box.map((p) => (p ? enhancePokemon(p) : null));
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
