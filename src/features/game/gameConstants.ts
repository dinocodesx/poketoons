/**
 * The key used to persist the game state in browser localStorage.
 */
export const GAME_STORAGE_KEY = "poketoons.game-state";

/**
 * The current version of the game state schema.
 * Used for future-proofing and potential migrations.
 */
export const GAME_STATE_VERSION = 4;

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
 * The number of Pokemon that can be in a trainer's party at once.
 */
export const PARTY_SIZE = 6;

/**
 * The number of storage boxes available to the trainer.
 */
export const BOX_COUNT = 12;

/**
 * The number of rows in each storage box.
 */
export const BOX_ROWS = 5;

/**
 * The number of columns in each storage box.
 */
export const BOX_COLS = 6;

/**
 * The total number of slots in a single storage box.
 */
export const BOX_SLOT_COUNT = BOX_ROWS * BOX_COLS;
