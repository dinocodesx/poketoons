/**
 * The key used to persist the game state in browser localStorage.
 */
export const GAME_STORAGE_KEY = "poketoons.game-state";

/**
 * The current version of the game state schema.
 * Used for future-proofing and potential migrations.
 */
export const GAME_STATE_VERSION = 1;

/**
 * The duration of a single session cycle (encounter + wait period) in milliseconds.
 * Currently set to 30 seconds.
 */
export const SESSION_CYCLE_MS = 30_000;

/**
 * The maximum level a Pokemon can reach.
 */
export const MAX_POKEMON_LEVEL = 100;

/**
 * The starting level for a trainer's first Pokemon.
 */
export const STARTER_LEVEL = 5;

/**
 * The default starting level for wild-caught Pokemon.
 */
export const WILD_POKEMON_BASE_LEVEL = 1;

/**
 * The number of recently caught Pokemon that gain a level after each successful catch.
 */
export const RECENT_LEVEL_UP_COUNT = 30;
