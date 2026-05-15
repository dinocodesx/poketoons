import { CountdownTimer } from "../../../shared/ui/CountdownTimer";
import type { PokemonCatalogEntry } from "../../pokemon/types";
import type { ActiveEncounter } from "../types";

/**
 * Props for the EncounterCard component.
 */
interface EncounterCardProps {
  /** The currently active encounter data. */
  encounter: ActiveEncounter | null;
  /** The catalog entry for the Pokemon species in the encounter. */
  pokemon: PokemonCatalogEntry | null;
  /** The current state of the countdown timer. */
  timer: {
    label: string;
    displayValue: string;
  };
}

/**
 * Displays the current wild Pokemon encounter, including its artwork and the catch timer.
 */
export function EncounterCard({
  encounter,
  pokemon,
  timer,
}: EncounterCardProps) {
  if (!encounter || !pokemon) {
    return (
      <div className="encounter-empty">
        <p>No Pokemon is visible right now.</p>
        <small>Keep the session active and wait for the next cycle.</small>
      </div>
    );
  }

  return (
    <article className="encounter-card">
      <div className="encounter-card__media">
        <img alt="Pokemon to guess" src={pokemon.artworkUrl} />
      </div>
      <div className="encounter-card__details">
        <CountdownTimer label={timer.label} value={timer.displayValue} />
        {encounter.mistakes > 0 && (
          <p className="text-error text-[0.8rem] uppercase tracking-wider mt-2">
            Mistakes: {encounter.mistakes}/3
          </p>
        )}
      </div>
    </article>
  );
}
