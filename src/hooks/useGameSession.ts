import { useReducer, useCallback, useMemo } from "react";
import { SESSION_CYCLE_MS } from "../features/game/gameConstants";
import { gameReducer, initialGameState } from "../features/game/gameReducer";
import { selectTotalCaught } from "../features/game/gameSelectors";
import { formatPokemonName } from "../lib/string";
import {
  starterChoices,
  pokemonCatalog,
  rarityBuckets,
  getPokemonById,
} from "../features/pokemon/pokemonCatalog";
import {
  isCorrectPokemonGuess,
  pickSpawnPokemon,
} from "../features/pokemon/pokemonSpawn";
import { useGamePersistence } from "./useGamePersistence";
import { useGameLoop } from "./useGameLoop";
import type {
  GuessAttemptResult,
  StorageLocation,
} from "../features/game/gameTypes";

/**
 * The primary orchestrator hook for the Pokemon Catching Game.
 * Implements the 'Facade' pattern to provide a clean, action-oriented API to the UI
 * while encapsulating complex state transitions, persistence, and the game loop.
 *
 * @returns {Object} Game state and action API.
 */
export function useGameSession() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  // side effects: handle persistence and time-based loop checks
  useGamePersistence(state, dispatch);
  useGameLoop(state, dispatch);

  /**
   * Initializes the trainer profile with a name and a starter Pokemon.
   */
  const createTrainer = useCallback(
    (name: string, starterPokemonId: number) => {
      dispatch({
        type: "CREATE_TRAINER",
        payload: {
          name,
          starterPokemonId,
          createdAt: Date.now(),
          starterInstanceId: crypto.randomUUID(),
        },
      });
    },
    [],
  );

  /**
   * Starts a manual catching session and triggers the first wild spawn.
   */
  const startSession = useCallback(() => {
    if (!state.trainer || state.currentSession?.status === "active") return;

    const now = Date.now();
    const pokemonId = pickSpawnPokemon(
      pokemonCatalog,
      rarityBuckets,
      selectTotalCaught(state),
    );

    if (!pokemonId) return;

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
  }, [state]);

  /**
   * Ends the current catching session and cleans up active encounters.
   */
  const endSession = useCallback(() => {
    if (state.currentSession?.status !== "active") return;

    dispatch({
      type: "END_SESSION",
      payload: { endedAt: Date.now() },
    });
  }, [state.currentSession?.status]);

  /**
   * Validates a player's guess against the active encounter.
   * If correct, updates state to record the catch and trigger level-ups.
   * If incorrect, tracks mistakes and handles runaway logic.
   *
   * @param {string} guess - The user-input Pokemon name.
   * @returns {GuessAttemptResult} Result for UI feedback.
   */
  const submitGuess = useCallback(
    (guess: string): GuessAttemptResult => {
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

      // Check guess correctness (normalized)
      if (!isCorrectPokemonGuess(guess, pokemon)) {
        const newMistakes = state.activeEncounter.mistakes + 1;

        // 3 mistakes rule: Pokemon runs away
        if (newMistakes >= 3) {
          dispatch({
            type: "MISS_ENCOUNTER",
            payload: { resolvedAt: Date.now() },
          });

          return {
            accepted: true,
            correct: false,
            message: `Too many mistakes! ${formatPokemonName(pokemon.name)} fled.`,
          };
        }

        dispatch({ type: "RECORD_MISTAKE" });

        return {
          accepted: true,
          correct: false,
          message: `That name does not match this Pokemon. (${newMistakes}/3)`,
        };
      }

      // Success: Catch the Pokemon
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
        message: `${formatPokemonName(pokemon.name)} was caught!`,
      };
    },
    [state.activeEncounter, state.currentSession?.status],
  );

  /**
   * Swaps or moves a Pokemon within the collection storage.
   */
  const movePokemon = useCallback(
    (source: StorageLocation, destination: StorageLocation) => {
      dispatch({
        type: "MOVE_POKEMON",
        payload: { source, destination },
      });
    },
    [],
  );

  /**
   * Permanently releases a Pokemon from the collection.
   */
  const releasePokemon = useCallback((location: StorageLocation) => {
    dispatch({
      type: "RELEASE_POKEMON",
      payload: { location },
    });
  }, []);

  /**
   * Adds a new empty storage box.
   */
  const addBox = useCallback(() => {
    dispatch({ type: "ADD_BOX" });
  }, []);

  // Memoize the public API to prevent unnecessary re-renders in consumer components
  return useMemo(
    () => ({
      state,
      starterChoices,
      createTrainer,
      startSession,
      endSession,
      submitGuess,
      movePokemon,
      releasePokemon,
      addBox,
    }),
    [
      state,
      createTrainer,
      startSession,
      endSession,
      submitGuess,
      movePokemon,
      releasePokemon,
      addBox,
    ],
  );
}
