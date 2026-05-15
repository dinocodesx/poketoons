import { useEffect, useLayoutEffect, useRef } from "react";
import type { GameAction } from "../reducer";
import type { GameState } from "../types";
import { selectTotalCaught } from "../selectors";
import { pokemonCatalog, rarityBuckets } from "../../domains/pokemon/catalog";
import { pickSpawnPokemon } from "../../domains/pokemon/spawn";

/**
 * Manages the background "clock" of the game.
 * Performs periodic checks for encounter expiration and spawn scheduling.
 * 
 * DESIGN PATTERN: State-Ref Synchronization
 * We use a ref to the current state to allow the interval loop to access the 
 * latest data without being re-created every render, which ensures timing accuracy.
 */
export function useGameLoop(
  state: GameState,
  dispatch: React.Dispatch<GameAction>,
) {
  const stateRef = useRef(state);
  
  // Update ref on every render (sync point)
  useLayoutEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    // Only run the loop if hydration is complete and a session is active
    if (state.isHydrating || state.currentSession?.status !== "active") {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const currentState = stateRef.current;
      const now = Date.now();

      // TASK 1: Check for expired encounters
      if (
        currentState.activeEncounter &&
        now >= currentState.activeEncounter.expiresAt
      ) {
        const hasAttempted = currentState.activeEncounter.mistakes > 0;
        
        // Use 'MISS' if they tried and failed, 'FLEE' if they didn't try at all
        dispatch({
          type: hasAttempted ? "MISS_ENCOUNTER" : "FLEE_ENCOUNTER",
          payload: { resolvedAt: currentState.activeEncounter.expiresAt },
        });
        return;
      }

      // TASK 2: Schedule new spawns if idle
      if (
        !currentState.activeEncounter &&
        currentState.currentSession?.status === "active"
      ) {
        const nextEncounterAt = currentState.currentSession.nextEncounterAt ?? now;

        // Still waiting for the next spawn cycle
        if (now < nextEncounterAt) return;

        // Perform weighted random selection
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
    }, 250); // 4Hz tick rate is sufficient for UI precision without heavy CPU load

    return () => window.clearInterval(intervalId);
  }, [state.isHydrating, state.currentSession?.status, dispatch]);
}
