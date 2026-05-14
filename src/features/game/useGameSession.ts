import { useEffect, useEffectEvent, useReducer } from "react";
import { SESSION_CYCLE_MS } from "./gameConstants";
import { gameReducer, initialGameState } from "./gameReducer";
import { hydrateGameState } from "./gameHydration";
import { savePersistedGameState } from "./gameStorage";
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

export function useGameSession() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  useEffect(() => {
    dispatch({
      type: "HYDRATE",
      payload: hydrateGameState(Date.now()),
    });
  }, []);

  useEffect(() => {
    if (state.isHydrating) {
      return;
    }

    savePersistedGameState(state);
  }, [state]);

  const tickSession = useEffectEvent(() => {
    if (state.isHydrating || state.currentSession?.status !== "active") {
      return;
    }

    const now = Date.now();

    if (state.activeEncounter && now >= state.activeEncounter.expiresAt) {
      dispatch({
        type: "MISS_ENCOUNTER",
        payload: {
          resolvedAt: state.activeEncounter.expiresAt,
        },
      });

      return;
    }

    if (!state.activeEncounter) {
      const nextEncounterAt = state.currentSession.nextEncounterAt ?? now;

      if (now < nextEncounterAt) {
        return;
      }

      const pokemonId = pickSpawnPokemon(
        pokemonCatalog,
        rarityBuckets,
        selectTotalCaught(state),
      );

      if (!pokemonId) {
        return;
      }

      dispatch({
        type: "SPAWN_ENCOUNTER",
        payload: {
          encounterId: crypto.randomUUID(),
          pokemonId,
          startedAt: now,
          expiresAt: now + state.currentSession.cycleDurationMs,
          nextEncounterAt: now + state.currentSession.cycleDurationMs,
        },
      });
    }
  });

  useEffect(() => {
    if (state.isHydrating || state.currentSession?.status !== "active") {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      tickSession();
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [state.isHydrating, state.currentSession?.status]);

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

  function submitGuess(guess: string) {
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
      return {
        accepted: true,
        correct: false,
        message: "That name does not match this Pokemon.",
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

  return {
    state,
    starterChoices,
    createTrainer,
    startSession,
    endSession,
    submitGuess,
  };
}
