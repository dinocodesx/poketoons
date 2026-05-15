import type { ActiveEncounter, GameSession } from "./types";

export function handleStartSession(
  payload: {
    sessionId: string;
    encounterId: string;
    pokemonId: number;
    startedAt: number;
    expiresAt: number;
    nextEncounterAt: number;
    cycleDurationMs: number;
  }
): { currentSession: GameSession; activeEncounter: ActiveEncounter } {
  return {
    currentSession: {
      sessionId: payload.sessionId,
      startedAt: payload.startedAt,
      endedAt: null,
      status: "active",
      cycleDurationMs: payload.cycleDurationMs,
      activeEncounterId: payload.encounterId,
      nextEncounterAt: payload.nextEncounterAt,
    },
    activeEncounter: {
      encounterId: payload.encounterId,
      pokemonId: payload.pokemonId,
      startedAt: payload.startedAt,
      expiresAt: payload.expiresAt,
      status: "active",
      mistakes: 0,
    },
  };
}

export function handleEndSession(
  currentSession: GameSession | null,
  endedAt: number,
): { currentSession: GameSession | null; activeEncounter: null } {
  return {
    currentSession: currentSession
      ? {
          ...currentSession,
          status: "ended",
          endedAt,
          activeEncounterId: null,
          nextEncounterAt: null,
        }
      : null,
    activeEncounter: null,
  };
}

export function handleSpawnEncounter(
  currentSession: GameSession | null,
  payload: {
    encounterId: string;
    pokemonId: number;
    startedAt: number;
    expiresAt: number;
    nextEncounterAt: number;
  }
): { currentSession: GameSession | null; activeEncounter: ActiveEncounter } {
  return {
    currentSession: currentSession
      ? {
          ...currentSession,
          activeEncounterId: payload.encounterId,
          nextEncounterAt: payload.nextEncounterAt,
        }
      : null,
    activeEncounter: {
      encounterId: payload.encounterId,
      pokemonId: payload.pokemonId,
      startedAt: payload.startedAt,
      expiresAt: payload.expiresAt,
      status: "active",
      mistakes: 0,
    },
  };
}
