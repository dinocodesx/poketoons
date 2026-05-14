import type { CollectionEntry } from "../features/game/gameTypes";
import { formatPokemonName } from "../lib/string";

interface PokemonCollectionCardProps {
  entry: CollectionEntry;
}

export function PokemonCollectionCard({ entry }: PokemonCollectionCardProps) {
  return (
    <article className="collection-card">
      <img
        alt={formatPokemonName(entry.pokemon.name)}
        loading="lazy"
        src={entry.pokemon.artworkUrl}
      />
      <div className="collection-card__body">
        <div className="collection-card__header">
          <h3>{formatPokemonName(entry.pokemon.name)}</h3>
          <span>Lv. {entry.level}</span>
        </div>
        <p>{new Date(entry.caughtAt).toLocaleString()}</p>
      </div>
    </article>
  );
}
