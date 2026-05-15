/**
 * Formats a duration in milliseconds into a MM:SS clock format.
 * 
 * @param remainingMs - The remaining duration in milliseconds.
 * @returns A string in MM:SS format.
 */
export function formatClock(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Calculates the remaining milliseconds between a target timestamp and now.
 * 
 * @param targetTimestamp - The target end time.
 * @param now - The current timestamp (defaults to Date.now()).
 * @returns The difference in milliseconds, clamped to 0.
 */
export function getRemainingMs(targetTimestamp: number, now = Date.now()): number {
  return Math.max(0, targetTimestamp - now);
}
