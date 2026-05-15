/**
 * Interface for items that can be selected using weighted randomness.
 */
export interface WeightedItem {
  /** The relative weight of the item. */
  weight: number;
}

/**
 * Selects a random element from an array.
 * 
 * @param items - The array of items.
 * @returns A random item from the array.
 */
export function randomFromArray<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Selects an item from an array using weighted randomness.
 * The probability of an item being selected is proportional to its weight.
 * 
 * @param items - The array of items with weights.
 * @returns The selected item, or null if the array is empty or weights are invalid.
 */
export function pickWeightedRandom<T extends WeightedItem>(items: T[]): T | null {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

  if (totalWeight <= 0) {
    return null;
  }

  let threshold = Math.random() * totalWeight;

  for (const item of items) {
    threshold -= item.weight;

    if (threshold <= 0) {
      return item;
    }
  }

  return items.at(-1) ?? null;
}
