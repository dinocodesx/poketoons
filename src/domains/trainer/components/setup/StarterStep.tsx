import type { PokemonCatalogEntry } from "../../../pokemon/types";
import { formatPokemonName } from "../../../../shared/lib/string";

interface StarterStepProps {
  starters: PokemonCatalogEntry[];
  selectedStarterId: number | null;
  onSelect: (id: number) => void;
  regionName: string;
}

export function StarterStep({ starters, selectedStarterId, onSelect, regionName }: StarterStepProps) {
  return (
    <fieldset className="starter-grid">
      <legend style={{ marginBottom: "16px" }}>
        Starters from {regionName}
      </legend>
      {starters.map((starter) => (
        <label
          className={`starter-option ${
            selectedStarterId === starter.id
              ? "starter-option--active"
              : ""
          }`}
          key={starter.id}
        >
          <input
            checked={selectedStarterId === starter.id}
            name="starter-pokemon"
            onChange={() => onSelect(starter.id)}
            type="radio"
            value={starter.id}
          />
          <img
            alt={formatPokemonName(starter.name)}
            loading="lazy"
            src={starter.artworkUrl}
          />
          <strong>{formatPokemonName(starter.name)}</strong>
        </label>
      ))}
    </fieldset>
  );
}
