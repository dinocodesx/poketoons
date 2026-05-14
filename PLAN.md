# Pokemon Catching Game

## Summary
- Rebuild the current Vite starter into a local-first Pokemon catching game using React + TypeScript with a small-file, feature-oriented structure.
- Use browser `localStorage` for all persistence, local JSON files for the first 251 Pokemon plus rarity rules, remote artwork URLs for display, and a dark monochrome UI with a loading screen.
- Keep logic modular with pure helpers, a reducer-driven game state, and small presentational components.

## Architecture
- `src/app/App.tsx` is the top-level shell.
- `src/components/` contains small UI pieces for loading, trainer setup, encounter flow, history, and collection rendering.
- `src/features/game/` contains the game types, reducer, hydration, selectors, storage, and hooks.
- `src/features/pokemon/` contains Pokemon data types, catalog loading, validation, and spawn selection.
- `src/data/` stores `pokemon-catalog.json` and `rarity-buckets.json`.
- `src/lib/` stores generic helpers for strings, time, random selection, and `localStorage`.
- `src/styles/` stores split CSS files for tokens, base rules, layout, and components.

## Game Rules
- The trainer creates one local profile and chooses exactly one starter: Bulbasaur, Charmander, or Squirtle.
- The starter is seeded into the trainer collection at level `5`.
- The trainer can own unlimited Pokemon, including duplicates from the same species or evolution family.
- Sessions are started manually.
- A Pokemon encounter lasts `60` seconds.
- Correct guesses catch the Pokemon.
- Wrong guesses do not end the encounter.
- If time expires, the encounter is marked missed.
- While the session stays active, the next encounter appears on the next cycle after the previous one resolves.
- Ending the session stops new encounters and disables catching.
- Each successful catch creates a new owned Pokemon instance.
- Each successful catch increases the level of the newest `30` owned Pokemon, including the newly caught one, by `+1`, capped at level `100`.
- Spawn progression is based on total successful catches and compared against each Pokemon's `minCatchLevel`.

## Data
- `pokemon-catalog.json` contains entries for Pokemon `1-251` with `id`, normalized `name`, `displayName`, `generation`, `rarity`, `group`, `minCatchLevel`, `evolutionFamily`, and `artworkUrl`.
- `rarity-buckets.json` defines `common`, `uncommon`, `rare`, `epic`, and `legendary` buckets with spawn weights and Pokemon id lists.
- Starters remain part of the normal spawn pool.
- Validation ensures the catalog only contains Pokemon `1-251` and that bucket references stay valid.

## UI
- Dark-mode-only interface with black backgrounds, white text, and grey accents.
- Loading screen on boot while data hydrates and timestamps are normalized.
- Main dashboard shows trainer details, session controls, encounter art, timer, guess form, recent results, and collection.
- Mobile-first layout that expands into columns on larger screens.

## Verification
- Confirm first-run setup, starter persistence, session start/end, catch resolution, missed encounters, duplicate catches, level-up rules, refresh recovery, and spawn filtering.
- Run `npm run build` and `npm run lint` after implementation.
