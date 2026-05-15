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
 * Checks if a game session is currently in the 'active' state.
 */
export function selectSessionActive(state: GameState): boolean {
  return state.currentSession?.status === "active";
}

/**
 * Calculates total lifetime successful catches.
 */
export function selectTotalCaught(state: GameState): number {
  return state.history.filter((entry) => entry.result === "caught").length;
}

/**
 * Calculates the current size of the trainer's collection (Party + Boxes).
 */
export function selectTotalOwned(state: GameState): number {
  const partyCount = state.party.filter((p) => p !== null).length;
  const boxesCount = state.boxes.reduce(
    (acc, box) => acc + box.filter((s) => s !== null).length,
    0,
  );
  return partyCount + boxesCount;
}

/**
 * Retrieves the species data for the trainer's original starter choice.
 */
export function selectStarterPokemon(state: GameState) {
  if (!state.trainer) return null;
  return getPokemonById(state.trainer.starterPokemonId) ?? null;
}

/**
 * Retrieves the species data for the Pokemon in the current wild encounter.
 */
export function selectCurrentEncounterPokemon(state: GameState) {
  if (!state.activeEncounter) return null;
  return getPokemonById(state.activeEncounter.pokemonId) ?? null;
}

/**
 * Internal helper to join an OwnedPokemon instance with its static species data.
 */
function enhancePokemon(owned: OwnedPokemon): CollectionEntry | null {
  const pokemon = getPokemonById(owned.pokemonId);
  if (!pokemon) return null;
  return { ...owned, pokemon };
}

/**
 * Returns the current party populated with full species details.
 */
export function selectPartyEntries(
  state: GameState,
): (CollectionEntry | null)[] {
  return state.party.map((p) => (p ? enhancePokemon(p) : null));
}

/**
 * Returns a specific storage box populated with full species details.
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
 * Returns the N most recent encounter results for display in the catch history.
 * Entries are returned in reverse-chronological order (newest first).
 */
export function selectRecentHistoryEntries(state: GameState): HistoryEntry[] {
  return [...state.history]
    .reverse()
    .slice(0, RECENT_HISTORY_LIMIT)
    .flatMap((entry) => {
      const pokemon = getPokemonById(entry.pokemonId);
      if (!pokemon) return [];

      return [
        {
          ...entry,
          pokemon,
        },
      ];
    });
}
