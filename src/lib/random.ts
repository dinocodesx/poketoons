export interface WeightedItem {
  weight: number;
}

export function randomFromArray<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function pickWeightedItem<T extends WeightedItem>(items: T[]): T | null {
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
