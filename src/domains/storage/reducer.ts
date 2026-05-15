import {
  MAX_POKEMON_LEVEL,
  PARTY_SIZE,
  INITIAL_BOX_COUNT,
  BOX_SLOT_COUNT,
  MAX_BOX_COUNT,
} from "./constants";
import type { OwnedPokemon, StorageLocation } from "./types";
import evolutionData from "../../shared/data/evolutions.json";

interface EvolutionConfig {
  to: number | number[];
  level: number;
}

const evolutions = evolutionData as Record<string, EvolutionConfig>;

export function createEmptyParty(): (OwnedPokemon | null)[] {
  return Array(PARTY_SIZE).fill(null);
}

export function createEmptyBoxes(): (OwnedPokemon | null)[][] {
  return Array(INITIAL_BOX_COUNT)
    .fill(null)
    .map(() => Array(BOX_SLOT_COUNT).fill(null));
}

export function applyPartyLevelUp(party: (OwnedPokemon | null)[]) {
  return party.map((pokemon) => {
    if (!pokemon) return null;

    const nextLevel = Math.min(MAX_POKEMON_LEVEL, pokemon.level + 1);
    let currentPokemonId = pokemon.pokemonId;

    const evoConfig = evolutions[currentPokemonId.toString()];
    if (evoConfig && nextLevel >= evoConfig.level) {
      if (Array.isArray(evoConfig.to)) {
        const randomIndex = Math.floor(Math.random() * evoConfig.to.length);
        currentPokemonId = evoConfig.to[randomIndex];
      } else {
        currentPokemonId = evoConfig.to;
      }
    }

    return {
      ...pokemon,
      level: nextLevel,
      pokemonId: currentPokemonId,
    };
  });
}

export function handleMovePokemon(
  party: (OwnedPokemon | null)[],
  boxes: (OwnedPokemon | null)[][],
  source: StorageLocation,
  destination: StorageLocation,
) {
  const nextParty = [...party];
  const nextBoxes = [...boxes];

  const pokemonToMove =
    source.type === "party"
      ? nextParty[source.slotIndex]
      : nextBoxes[source.boxIndex ?? 0][source.slotIndex];

  if (!pokemonToMove) return { party, boxes };

  if (source.type === "party") {
    nextParty[source.slotIndex] = null;
  } else {
    const bIndex = source.boxIndex ?? 0;
    nextBoxes[bIndex] = [...nextBoxes[bIndex]];
    nextBoxes[bIndex][source.slotIndex] = null;
  }

  const swapped =
    destination.type === "party"
      ? nextParty[destination.slotIndex]
      : nextBoxes[destination.boxIndex ?? 0][destination.slotIndex];

  if (destination.type === "party") {
    nextParty[destination.slotIndex] = pokemonToMove;
  } else {
    const bIndex = destination.boxIndex ?? 0;
    nextBoxes[bIndex] = [...nextBoxes[bIndex]];
    nextBoxes[bIndex][destination.slotIndex] = pokemonToMove;
  }

  if (swapped) {
    if (source.type === "party") {
      nextParty[source.slotIndex] = swapped;
    } else {
      const bIndex = source.boxIndex ?? 0;
      nextBoxes[bIndex][source.slotIndex] = swapped;
    }
  }

  return { party: nextParty, boxes: nextBoxes };
}

export function handleReleasePokemon(
  party: (OwnedPokemon | null)[],
  boxes: (OwnedPokemon | null)[][],
  location: StorageLocation,
) {
  const nextParty = [...party];
  const nextBoxes = [...boxes];

  if (location.type === "party") {
    nextParty[location.slotIndex] = null;
  } else {
    const bIndex = location.boxIndex ?? 0;
    nextBoxes[bIndex] = [...nextBoxes[bIndex]];
    nextBoxes[bIndex][location.slotIndex] = null;
  }

  return { party: nextParty, boxes: nextBoxes };
}

export function handleAddBox(boxes: (OwnedPokemon | null)[][]) {
  if (boxes.length >= MAX_BOX_COUNT) return boxes;
  const newBox = Array(BOX_SLOT_COUNT).fill(null);
  return [...boxes, newBox];
}

export function handleAddPokemon(
  party: (OwnedPokemon | null)[],
  boxes: (OwnedPokemon | null)[][],
  pokemon: OwnedPokemon,
) {
  const nextParty = [...party];
  const nextBoxes = [...boxes];
  let isPlaced = false;

  const emptyPartySlot = nextParty.findIndex((p) => p === null);
  if (emptyPartySlot !== -1) {
    nextParty[emptyPartySlot] = pokemon;
    isPlaced = true;
  } else {
    for (let b = 0; b < nextBoxes.length; b++) {
      const emptyBoxSlot = nextBoxes[b].findIndex((s) => s === null);
      if (emptyBoxSlot !== -1) {
        nextBoxes[b] = [...nextBoxes[b]];
        nextBoxes[b][emptyBoxSlot] = pokemon;
        isPlaced = true;
        break;
      }
    }
  }

  return { party: nextParty, boxes: nextBoxes, isPlaced };
}
