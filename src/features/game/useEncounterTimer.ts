import { useEffect, useState } from "react";
import { formatClock, getRemainingMs } from "../../lib/time";
import type { ActiveEncounter } from "./gameTypes";

interface UseEncounterTimerOptions {
  activeEncounter: ActiveEncounter | null;
  isSessionActive: boolean;
  nextEncounterAt: number | null;
}

export function useEncounterTimer({
  activeEncounter,
  isSessionActive,
  nextEncounterAt,
}: UseEncounterTimerOptions) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isSessionActive) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isSessionActive, activeEncounter?.expiresAt, nextEncounterAt]);

  if (activeEncounter) {
    const remainingMs = getRemainingMs(activeEncounter.expiresAt, now);

    return {
      label: "Catch window",
      remainingMs,
      displayValue: formatClock(remainingMs),
    };
  }

  if (isSessionActive && nextEncounterAt) {
    const remainingMs = getRemainingMs(nextEncounterAt, now);

    return {
      label: "Next encounter",
      remainingMs,
      displayValue: formatClock(remainingMs),
    };
  }

  return {
    label: "Session timer",
    remainingMs: 0,
    displayValue: "00:00",
  };
}
