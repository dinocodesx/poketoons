import { useEffect, useLayoutEffect, useRef } from "react";
import type { GameAction } from "./gameReducer";
import type { GameState } from "./gameTypes";
import { selectTotalCaught } from "./gameSelectors";
import { pokemonCatalog, rarityBuckets } from "../pokemon/pokemonCatalog";
import { pickSpawnPokemon } from "../pokemon/pokemonSpawn";

/**
 * Hook to manage the core game loop (timer-based checks for encounters and expirations).
 * 
 * @param state - The current game state.
 * @param dispatch - The dispatch function to update game state.
 */
export function useGameLoop(
  state: GameState,
  dispatch: React.Dispatch<GameAction>,
) {
  // Use a ref to always have the latest state inside the interval without re-subscribing
  const stateRef = useRef(state);
  
  useLayoutEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    if (state.isHydrating || state.currentSession?.status !== "active") {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const currentState = stateRef.current;
      const now = Date.now();

      // 1. Check if the active encounter has expired
      if (
        currentState.activeEncounter &&
        now >= currentState.activeEncounter.expiresAt
      ) {
        const hasAttempted = currentState.activeEncounter.mistakes > 0;
        
        dispatch({
          type: hasAttempted ? "MISS_ENCOUNTER" : "FLEE_ENCOUNTER",
          payload: { resolvedAt: currentState.activeEncounter.expiresAt },
        });
        return;
      }

      // 2. If no active encounter, check if it's time to spawn a new one
      if (
        !currentState.activeEncounter &&
        currentState.currentSession?.status === "active"
      ) {
        const nextEncounterAt = currentState.currentSession.nextEncounterAt ?? now;

        if (now < nextEncounterAt) {
          return;
        }

        const pokemonId = pickSpawnPokemon(
          pokemonCatalog,
          rarityBuckets,
          selectTotalCaught(currentState),
        );

        if (!pokemonId) return;

        dispatch({
          type: "SPAWN_ENCOUNTER",
          payload: {
            encounterId: crypto.randomUUID(),
            pokemonId,
            startedAt: now,
            expiresAt: now + currentState.currentSession.cycleDurationMs,
            nextEncounterAt: now + currentState.currentSession.cycleDurationMs,
          },
        });
      }
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [state.isHydrating, state.currentSession?.status, dispatch]);
}
