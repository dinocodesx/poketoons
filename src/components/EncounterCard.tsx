import { CountdownTimer } from "./CountdownTimer";
import type { PokemonCatalogEntry } from "../features/pokemon/pokemonTypes";
import type { ActiveEncounter } from "../features/game/gameTypes";
import { formatPokemonName } from "../lib/string";

interface EncounterCardProps {
  encounter: ActiveEncounter | null;
  pokemon: PokemonCatalogEntry | null;
  timer: {
    label: string;
    displayValue: string;
  };
}

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
        <p className="eyebrow">Wild encounter</p>
        <h3>Name this Pokemon before time expires</h3>
        <div className="encounter-meta">
          <div>
            <span>Rarity</span>
            <strong>{formatPokemonName(pokemon.rarity)}</strong>
          </div>
          <div>
            <span>Unlock</span>
            <strong>{pokemon.minCatchLevel} catches</strong>
          </div>
          <div>
            <span>Group</span>
            <strong>{pokemon.group}</strong>
          </div>
        </div>
        <CountdownTimer label={timer.label} value={timer.displayValue} />
      </div>
    </article>
  );
}
