export function normalizeGuess(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

export function formatPokemonName(value: string) {
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
