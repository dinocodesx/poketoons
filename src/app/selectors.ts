import { getPokemonById } from "../domains/pokemon/catalog";
import type { GameState } from "./types";
import type { CollectionEntry } from "../domains/storage/types";
import type { HistoryEntry } from "../domains/trainer/types";

export const selectTotalCaught = (state: GameState) =>
  state.history.filter((h) => h.result === "caught").length;

export const selectSessionActive = (state: GameState) =>
  state.currentSession?.status === "active";

export const selectCurrentEncounterPokemon = (state: GameState) => {
  if (!state.activeEncounter) return null;
  return getPokemonById(state.activeEncounter.pokemonId) ?? null;
};

export const selectStarterPokemon = (state: GameState) => {
  if (!state.trainer) return null;
  return getPokemonById(state.trainer.starterPokemonId) ?? null;
};

export const selectPartyEntries = (state: GameState): (CollectionEntry | null)[] => {
  return state.party.map((p) => {
    if (!p) return null;
    const species = getPokemonById(p.pokemonId);
    if (!species) return null;
    return { ...p, pokemon: species };
  });
};

export const selectBoxEntries = (state: GameState, boxIndex: number): (CollectionEntry | null)[] => {
  const box = state.boxes[boxIndex];
  if (!box) return [];
  return box.map((p) => {
    if (!p) return null;
    const species = getPokemonById(p.pokemonId);
    if (!species) return null;
    return { ...p, pokemon: species };
  });
};

export const selectRecentHistoryEntries = (state: GameState): HistoryEntry[] => {
  return [...state.history]
    .reverse()
    .map((h) => {
      const species = getPokemonById(h.pokemonId);
      if (!species) return null;
      return { ...h, pokemon: species };
    })
    .filter((h): h is HistoryEntry => h !== null);
};
