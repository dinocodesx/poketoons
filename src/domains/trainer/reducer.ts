import type { CatchHistoryEntry } from "./types";

export function buildHistoryEntry(
  encounterId: string,
  pokemonId: number,
  result: CatchHistoryEntry["result"],
  resolvedAt: number,
  sessionId: string | null,
): CatchHistoryEntry {
  return { encounterId, pokemonId, result, resolvedAt, sessionId };
}
