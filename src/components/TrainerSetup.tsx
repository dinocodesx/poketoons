import { useState } from "react";
import type { PokemonCatalogEntry } from "../features/pokemon/pokemonTypes";
import { formatPokemonName } from "../lib/string";

interface TrainerSetupProps {
  starters: PokemonCatalogEntry[];
  onCreateTrainer: (name: string, starterPokemonId: number) => void;
}

export function TrainerSetup({ starters, onCreateTrainer }: TrainerSetupProps) {
  const [trainerName, setTrainerName] = useState("");
  const [starterPokemonId, setStarterPokemonId] = useState<number>(
    starters[0]?.id ?? 1,
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = trainerName.trim();

    if (!trimmedName) {
      return;
    }

    onCreateTrainer(trimmedName, starterPokemonId);
  }

  return (
    <main className="setup-shell">
      <section className="setup-panel">
        <p className="eyebrow">Trainer Setup</p>
        <h1>Choose your first partner</h1>
        <p className="setup-copy">
          Build a browser-local collection, start timed catch sessions, and grow
          your newest Pokemon with every successful catch.
        </p>

        <form className="setup-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Trainer name</span>
            <input
              autoComplete="off"
              className="text-input"
              maxLength={24}
              name="trainer-name"
              onChange={(event) => setTrainerName(event.target.value)}
              placeholder="Enter a trainer name"
              value={trainerName}
            />
          </label>

          <fieldset className="starter-grid">
            <legend>Starter Pokemon</legend>
            {starters.map((starter) => (
              <label
                className={`starter-option ${
                  starterPokemonId === starter.id
                    ? "starter-option--active"
                    : ""
                }`}
                key={starter.id}
              >
                <input
                  checked={starterPokemonId === starter.id}
                  name="starter-pokemon"
                  onChange={() => setStarterPokemonId(starter.id)}
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

          <button className="primary-button" type="submit">
            Create trainer
          </button>
        </form>
      </section>
    </main>
  );
}
