import type { CollectionEntry } from "../../features/game/gameTypes";
import { formatPokemonName } from "../../lib/string";

/**
 * Props for the PokemonCollectionCard component.
 */
interface PokemonCollectionCardProps {
  /** The collection entry data to display. */
  entry: CollectionEntry;
}

/**
 * A compact card representing a single Pokemon in the trainer's collection.
 */
export function PokemonCollectionCard({ entry }: PokemonCollectionCardProps) {
  return (
    <div className="collection-card">
      <img
        alt={formatPokemonName(entry.pokemon.name)}
        className="collection-card__image"
        loading="lazy"
        src={entry.pokemon.artworkUrl}
      />
      <div className="collection-card__meta">
        <strong>Lvl {entry.level}</strong>
        <p>{formatPokemonName(entry.pokemon.name)}</p>
      </div>
    </div>
  );
}
