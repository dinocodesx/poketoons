export type EncounterStatus = "active" | "caught" | "missed" | "fled";
export type SessionStatus = "idle" | "active" | "ended";

export interface ActiveEncounter {
  encounterId: string;
  pokemonId: number;
  startedAt: number;
  expiresAt: number;
  status: EncounterStatus;
  mistakes: number;
}

export interface GameSession {
  sessionId: string;
  startedAt: number;
  endedAt: number | null;
  status: SessionStatus;
  cycleDurationMs: number;
  activeEncounterId: string | null;
  nextEncounterAt: number | null;
}

export interface GuessAttemptResult {
  accepted: boolean;
  correct: boolean;
  message: string;
}
