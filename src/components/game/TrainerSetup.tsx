import { useState } from "react";
import type { PokemonCatalogEntry } from "../../features/pokemon/pokemonTypes";
import { formatPokemonName } from "../../lib/string";

/**
 * Props for the TrainerSetup component.
 */
interface TrainerSetupProps {
  /** The list of starter Pokemon species to choose from. */
  starters: PokemonCatalogEntry[];
  /** Callback to create the trainer profile. */
  onCreateTrainer: (name: string, starterPokemonId: number) => void;
}

/**
 * The initial onboarding screen where players choose their name and first Pokemon.
 */
export function TrainerSetup({ starters, onCreateTrainer }: TrainerSetupProps) {
  const [trainerName, setTrainerName] = useState("");
  const [starterPokemonId, setStarterPokemonId] = useState<number>(
    starters[0]?.id ?? 1,
  );
  const [error, setError] = useState("");

  /**
   * Handles form submission for trainer creation.
   */
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = trainerName.trim();

    if (!trimmedName) {
      setError("Please enter a trainer name.");
      return;
    }

    if (!starterPokemonId) {
      setError("Please select a starter Pokemon.");
      return;
    }

    setError("");
    onCreateTrainer(trimmedName, starterPokemonId);
  }

  return (
    <main className="setup-shell">
      <section className="setup-panel">
        <p className="eyebrow">Trainer Setup</p>
        <h1 style={{ fontSize: "2rem", marginBottom: "16px" }}>
          Choose your first partner
        </h1>
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
            <legend style={{ marginBottom: "16px" }}>Starter Pokemon</legend>
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

          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                background: "var(--error)",
                color: "var(--error-border)",
                borderRadius: 0,
                border: "1px solid var(--error-border)",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {error}
            </div>
          )}
        </form>
      </section>

      <details
        className="setup-rules-dropdown"
        style={{
          marginTop: "24px",
          width: "min(760px, 100%)",
          background: "var(--panel-bg)",
          border: "1px solid var(--panel-border)",
          borderRadius: 0,
          padding: "16px",
        }}
      >
        <summary
          style={{ cursor: "pointer", fontWeight: "bold", outline: "none" }}
        >
          Game Rules Snapshot
        </summary>
        <ul className="rule-list" style={{ marginTop: "16px" }}>
          <li>One-minute catch windows</li>
          <li>Only Pokemon 1-251 can appear</li>
          <li>Duplicates are always allowed</li>
          <li>Each catch levels the newest 30 Pokemon by +1</li>
          <li>No backend, all progress stays in your browser</li>
        </ul>
      </details>
    </main>
  );
}
