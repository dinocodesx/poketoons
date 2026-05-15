import { useReducer } from "react";
import { SESSION_CYCLE_MS } from "./gameConstants";
import { gameReducer, initialGameState } from "./gameReducer";
import { selectTotalCaught } from "./gameSelectors";
import { formatPokemonName } from "../../lib/string";
import {
  starterChoices,
  pokemonCatalog,
  rarityBuckets,
  getPokemonById,
} from "../pokemon/pokemonCatalog";
import {
  isCorrectPokemonGuess,
  pickSpawnPokemon,
} from "../pokemon/pokemonSpawn";
import { useGamePersistence } from "./useGamePersistence";
import { useGameLoop } from "./useGameLoop";
import type { GuessAttemptResult, StorageLocation } from "./gameTypes";

/**
 * The main orchestrator hook for the Pokemon Catching Game.
 * Combines state management, persistence, and game loop logic into a unified API.
 * 
 * @returns An object containing the current game state, choices, and action functions.
 */
export function useGameSession() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  // Initialize persistence and loop side effects
  useGamePersistence(state, dispatch);
  useGameLoop(state, dispatch);

  /**
   * Initializes the trainer profile with a name and a starter Pokemon.
   */
  function createTrainer(name: string, starterPokemonId: number) {
    dispatch({
      type: "CREATE_TRAINER",
      payload: {
        name,
        starterPokemonId,
        createdAt: Date.now(),
        starterInstanceId: crypto.randomUUID(),
      },
    });
  }

  /**
   * Starts a manual catching session and spawns the first encounter.
   */
  function startSession() {
    if (!state.trainer || state.currentSession?.status === "active") {
      return;
    }

    const now = Date.now();
    const pokemonId = pickSpawnPokemon(
      pokemonCatalog,
      rarityBuckets,
      selectTotalCaught(state),
    );

    if (!pokemonId) {
      return;
    }

    dispatch({
      type: "START_SESSION",
      payload: {
        sessionId: crypto.randomUUID(),
        encounterId: crypto.randomUUID(),
        pokemonId,
        startedAt: now,
        expiresAt: now + SESSION_CYCLE_MS,
        nextEncounterAt: now + SESSION_CYCLE_MS,
        cycleDurationMs: SESSION_CYCLE_MS,
      },
    });
  }

  /**
   * Ends the current catching session and clears the active encounter.
   */
  function endSession() {
    if (state.currentSession?.status !== "active") {
      return;
    }

    dispatch({
      type: "END_SESSION",
      payload: {
        endedAt: Date.now(),
      },
    });
  }

  /**
   * Processes a player's guess for the current encounter.
   * If correct, the Pokemon is caught and added to the collection.
   * 
   * @param guess - The name of the Pokemon guessed by the player.
   * @returns A result object with feedback for the UI.
   */
  function submitGuess(guess: string): GuessAttemptResult {
    if (!state.activeEncounter || state.currentSession?.status !== "active") {
      return {
        accepted: false,
        correct: false,
        message: "Start a session to catch Pokemon.",
      };
    }

    const pokemon = getPokemonById(state.activeEncounter.pokemonId);

    if (!pokemon) {
      return {
        accepted: false,
        correct: false,
        message: "This encounter could not be resolved.",
      };
    }

    if (!isCorrectPokemonGuess(guess, pokemon)) {
      const newMistakes = state.activeEncounter.mistakes + 1;

      if (newMistakes >= 3) {
        dispatch({
          type: "MISS_ENCOUNTER",
          payload: { resolvedAt: Date.now() },
        });

        return {
          accepted: true,
          correct: false,
          message: `Too many mistakes! ${formatPokemonName(
            pokemon.name,
          )} ran away.`,
        };
      }

      dispatch({ type: "RECORD_MISTAKE" });

      return {
        accepted: true,
        correct: false,
        message: `That name does not match this Pokemon. (${newMistakes}/3)`,
      };
    }

    dispatch({
      type: "CATCH_ENCOUNTER",
      payload: {
        resolvedAt: Date.now(),
        ownedPokemonInstanceId: crypto.randomUUID(),
      },
    });

    return {
      accepted: true,
      correct: true,
      message: `${formatPokemonName(pokemon.name)} was caught.`,
    };
  }

  /**
   * Moves a Pokemon between slots.
   */
  function movePokemon(source: StorageLocation, destination: StorageLocation) {
    dispatch({
      type: "MOVE_POKEMON",
      payload: { source, destination },
    });
  }

  /**
   * Releases a Pokemon back into the wild.
   */
  function releasePokemon(location: StorageLocation) {
    dispatch({
      type: "RELEASE_POKEMON",
      payload: { location },
    });
  }

  return {
    state,
    starterChoices,
    createTrainer,
    startSession,
    endSession,
    submitGuess,
    movePokemon,
    releasePokemon,
  };
}
