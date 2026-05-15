/**
 * Normalizes a user's guess by trimming, lowercasing, and collapsing whitespace.
 * 
 * @param value - The raw input string.
 * @returns The normalized string.
 */
export function normalizeGuess(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Formats a Pokemon name for display (e.g., "mr mime" -> "Mr Mime").
 * 
 * @param value - The raw Pokemon name.
 * @returns The title-cased name.
 */
export function formatPokemonName(value: string): string {
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
