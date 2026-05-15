/**
 * Loads a value from browser localStorage.
 * 
 * @param key - The storage key.
 * @returns The parsed value, or null if not found or invalid.
 */
export function loadFromLocalStorage<T>(key: string): T | null {
  try {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
}

/**
 * Saves a value to browser localStorage.
 * 
 * @param key - The storage key.
 * @param value - The value to store.
 */
export function saveToLocalStorage<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write failures and keep the app usable.
  }
}
