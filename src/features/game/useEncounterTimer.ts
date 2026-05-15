import { useEffect, useState } from "react";
import { formatClock, getRemainingMs } from "../../lib/time";
import type { ActiveEncounter } from "./gameTypes";

interface UseEncounterTimerOptions {
  /** The currently active encounter, if any. */
  activeEncounter: ActiveEncounter | null;
  /** Whether a game session is currently active. */
  isSessionActive: boolean;
  /** Timestamp for the next scheduled encounter. */
  nextEncounterAt: number | null;
}

/**
 * Hook to manage a real-time countdown timer for encounters and session cycles.
 * Provides formatted display values and raw remaining milliseconds.
 * 
 * @param options - Configuration options for the timer.
 * @returns An object containing the current label, remaining time, and display value.
 */
export function useEncounterTimer({
  activeEncounter,
  isSessionActive,
  nextEncounterAt,
}: UseEncounterTimerOptions) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Only run the timer if the session is active
    if (!isSessionActive) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isSessionActive]);

  // Priority 1: If there is an active encounter, show the catch window timer.
  if (activeEncounter) {
    const remainingMs = getRemainingMs(activeEncounter.expiresAt, now);

    return {
      label: "Catch window",
      remainingMs,
      displayValue: formatClock(remainingMs),
    };
  }

  // Priority 2: If the session is active but no encounter is present, show the cooldown timer.
  if (isSessionActive && nextEncounterAt) {
    const remainingMs = getRemainingMs(nextEncounterAt, now);

    return {
      label: "Next encounter",
      remainingMs,
      displayValue: formatClock(remainingMs),
    };
  }

  // Default: Fallback for idle or ended sessions.
  return {
    label: "Session timer",
    remainingMs: 0,
    displayValue: "00:00",
  };
}
