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
 * Steps for the onboarding flow.
 */
type SetupStep = "name" | "region" | "starter";

/**
 * Regions available for selection.
 */
interface Region {
  id: number;
  name: string;
  generation: 1 | 2 | 3 | 4;
}

const REGIONS: Region[] = [
  { id: 1, name: "Kanto", generation: 1 },
  { id: 2, name: "Johto", generation: 2 },
  { id: 3, name: "Hoenn", generation: 3 },
  { id: 4, name: "Sinnoh", generation: 4 },
];

/**
 * The initial onboarding screen where players choose their name, region, and first Pokemon.
 */
export function TrainerSetup({ starters, onCreateTrainer }: TrainerSetupProps) {
  const [step, setStep] = useState<SetupStep>("name");
  const [trainerName, setTrainerName] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [starterPokemonId, setStarterPokemonId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const filteredStarters = selectedRegion
    ? starters.filter((s) => s.generation === selectedRegion.generation)
    : [];

  /**
   * Transitions to the next step.
   */
  function nextStep() {
    if (step === "name") {
      if (!trainerName.trim()) {
        setError("Please enter a trainer name.");
        return;
      }
      setStep("region");
    } else if (step === "region") {
      if (!selectedRegion) {
        setError("Please select a region.");
        return;
      }
      setStep("starter");
    }
    setError("");
  }

  /**
   * Transitions back to the previous step.
   */
  function prevStep() {
    if (step === "region") setStep("name");
    if (step === "starter") setStep("region");
    setError("");
  }

  /**
   * Handles form submission for trainer creation.
   */
  function handleSubmit(event?: React.FormEvent | React.MouseEvent) {
    event?.preventDefault();

    if (!trainerName.trim() || !starterPokemonId) {
      setError("Please complete all steps.");
      return;
    }

    onCreateTrainer(trainerName.trim(), starterPokemonId);
  }

  return (
    <main className="setup-shell">
      <section className="setup-panel">
        <p className="eyebrow">Trainer Setup — Step {step === "name" ? "1" : step === "region" ? "2" : "3"} of 3</p>
        <h1 style={{ fontSize: "2rem", marginBottom: "16px" }}>
          {step === "name" && "Who are you?"}
          {step === "region" && "Where are you from?"}
          {step === "starter" && "Choose your partner"}
        </h1>

        <div className="setup-form">
          {step === "name" && (
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
                onKeyDown={(e) => e.key === "Enter" && nextStep()}
              />
            </label>
          )}

          {step === "region" && (
            <div className="region-grid">
              {REGIONS.map((region) => (
                <button
                  key={region.id}
                  className={`region-option ${selectedRegion?.id === region.id ? "region-option--active" : ""}`}
                  onClick={() => {
                    setSelectedRegion(region);
                    setError("");
                  }}
                >
                  <strong>{region.name}</strong>
                  <span className="text-text-muted text-xs">Gen {region.generation}</span>
                </button>
              ))}
            </div>
          )}

          {step === "starter" && (
            <fieldset className="starter-grid">
              <legend style={{ marginBottom: "16px" }}>
                Starters from {selectedRegion?.name}
              </legend>
              {filteredStarters.map((starter) => (
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
          )}

          <div className="setup-actions">
            {step !== "name" && (
              <button className="secondary-button" onClick={prevStep}>
                Back
              </button>
            )}
            {step !== "starter" ? (
              <button className="primary-button" onClick={nextStep}>
                Continue
              </button>
            ) : (
              <button className="primary-button" onClick={handleSubmit}>
                Start Journey
              </button>
            )}
          </div>

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
        </div>
      </section>

      {step === "name" && (
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
            <li>Only Pokemon 1-493 can appear</li>
            <li>6 Pokemon party and 12 storage boxes</li>
            <li>Only party members level up when a Pokemon is caught</li>
            <li>No backend, all progress stays in your browser</li>
          </ul>
        </details>
      )}
    </main>
  );
}
