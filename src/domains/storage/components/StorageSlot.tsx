import type {
  CollectionEntry,
  StorageLocation,
} from "../types";
import { formatPokemonName } from "../../../shared/lib/string";

interface StorageSlotProps {
  pokemon: CollectionEntry | null;
  location: StorageLocation;
  isSelected: boolean;
  onClick: (location: StorageLocation) => void;
  className?: string;
}

export function StorageSlot({
  pokemon,
  location,
  isSelected,
  onClick,
  className = "",
}: StorageSlotProps) {
  const isParty = location.type === "party";
  const baseClass = isParty ? "party-slot" : "box-slot";
  const emptyClass = !pokemon ? `${baseClass}--empty` : "";
  const selectedClass = isSelected ? `${baseClass}--selected` : "";

  return (
    <div
      className={`${baseClass} ${emptyClass} ${selectedClass} ${className}`}
      onClick={() => onClick(location)}
    >
      {pokemon ? (
        <>
          <span className={`${baseClass}__level`}>Lv {pokemon.level}</span>
          <img
            src={pokemon.pokemon.artworkUrl}
            alt={pokemon.pokemon.name}
            title={formatPokemonName(pokemon.pokemon.name)}
          />
        </>
      ) : isParty ? (
        <span className="text-text-muted text-xs">Empty</span>
      ) : null}
    </div>
  );
}
