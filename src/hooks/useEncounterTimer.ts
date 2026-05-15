import { useEffect, useState } from "react";
import { formatClock, getRemainingMs } from "../lib/time";
import type { ActiveEncounter } from "../features/game/gameTypes";

/**
 * Configuration options for the encounter timer hook.
 */
interface UseEncounterTimerOptions {
  /** The currently active encounter, if any. */
  activeEncounter: ActiveEncounter | null;
  /** Whether a game session is currently active. */
  isSessionActive: boolean;
  /** Timestamp for the next scheduled encounter. */
  nextEncounterAt: number | null;
}

/**
 * Manages a real-time countdown clock for the UI.
 * Orchestrates two distinct timing states:
 * 1. Catch Window: Time remaining to guess the current Pokemon.
 * 2. Spawn Cooldown: Time remaining until the next wild Pokemon appears.
 * 
 * DESIGN PRINCIPLE: Derived State from Reference Time
 * Instead of multiple countdown states, this hook maintains a single 'now' 
 * reference and calculates all display values relative to it, ensuring 
 * consistency across the UI.
 */
export function useEncounterTimer({
  activeEncounter,
  isSessionActive,
  nextEncounterAt,
}: UseEncounterTimerOptions) {
  // Use local state to drive re-renders for the clock tick
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Only run the tick interval if there's actually a session to track
    if (!isSessionActive) return undefined;

    // 250ms interval provides smooth UI updates (4fps) without performance impact
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [isSessionActive]);

  // SCENARIO 1: Active Encounter
  // High priority - player needs to see how long they have to catch the current Pokemon
  if (activeEncounter) {
    const remainingMs = getRemainingMs(activeEncounter.expiresAt, now);

    return {
      label: "Catch window",
      remainingMs,
      displayValue: formatClock(remainingMs),
    };
  }

  // SCENARIO 2: Waiting for Spawn
  // Secondary priority - player needs to see the cooldown between spawns
  if (isSessionActive && nextEncounterAt) {
    const remainingMs = getRemainingMs(nextEncounterAt, now);

    return {
      label: "Next encounter",
      remainingMs,
      displayValue: formatClock(remainingMs),
    };
  }

  // SCENARIO 3: Idle
  // Fallback for when the game is paused or stopped
  return {
    label: "Session timer",
    remainingMs: 0,
    displayValue: "00:00",
  };
}
