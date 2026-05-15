import { useState } from "react";
import { CatchHistoryPanel } from "../domains/encounter/components/CatchHistoryPanel";
import { CollectionPanel } from "../domains/storage/components/CollectionPanel";
import { EncounterCard } from "../domains/encounter/components/EncounterCard";
import { GuessForm } from "../domains/encounter/components/GuessForm";
import { LoadingScreen } from "../shared/ui/LoadingScreen";
import { SectionCard } from "../shared/ui/SectionCard";
import { SessionPanel } from "../domains/encounter/components/SessionPanel";
import { TrainerSetup } from "../domains/trainer/components/TrainerSetup";
import { BoxManagement } from "../domains/storage/components/BoxManagement";
import { useGameSession } from "./hooks/useGameSession";
import { useEncounterTimer } from "../domains/encounter/hooks/useEncounterTimer";
import {
  selectBoxEntries,
  selectCurrentEncounterPokemon,
  selectPartyEntries,
  selectRecentHistoryEntries,
  selectSessionActive,
  selectStarterPokemon,
  selectTotalCaught,
} from "./selectors";

/**
 * The root Application component for Poketoons.
 * Responsible for:
 * 1. Orchestrating the primary 'app shell' layout.
 * 2. Handling top-level branching (Loading -> Onboarding -> Game).
 * 3. Connecting state selectors to the UI components.
 */
function App() {
  // Primary custom hook providing the game API and state
  const game = useGameSession();

  // Local UI state for storage management modal
  const [isBoxOpen, setIsBoxOpen] = useState(false);

  // Derived state (memoized via selectors where possible)
  const sessionActive = selectSessionActive(game.state);
  const currentEncounterPokemon = selectCurrentEncounterPokemon(game.state);
  const starterPokemon = selectStarterPokemon(game.state);
  const partyEntries = selectPartyEntries(game.state);
  const recentHistory = selectRecentHistoryEntries(game.state);

  // Encapsulated timer logic for spawns and encounter expiration
  const timer = useEncounterTimer({
    activeEncounter: game.state.activeEncounter,
    isSessionActive: sessionActive,
    nextEncounterAt:
      sessionActive && !game.state.activeEncounter
        ? (game.state.currentSession?.nextEncounterAt ?? null)
        : null,
  });

  // BRANCH 1: INITIAL HYDRATION
  // Show loading screen while reading from localStorage
  if (game.state.isHydrating) {
    return <LoadingScreen />;
  }

  // BRANCH 2: ONBOARDING
  // If no trainer profile exists, force the setup flow
  if (!game.state.trainer || !starterPokemon) {
    return (
      <TrainerSetup
        starters={game.starterChoices}
        onCreateTrainer={game.createTrainer}
      />
    );
  }

  // BRANCH 3: MAIN GAMEPLAY
  return (
    <main className="app-shell">
      <section className="dashboard-grid">
        {/* COLUMN 1: ACTIVE GAMEPLAY */}
        <div className="dashboard-main">
          <SessionPanel
            canStart={!sessionActive}
            isActive={sessionActive}
            onEndSession={game.endSession}
            onStartSession={game.startSession}
            timer={timer}
            className="shrink-0"
          />

          <SectionCard title="Active Encounter" className="flex-1 min-h-0">
            <EncounterCard
              encounter={game.state.activeEncounter}
              pokemon={currentEncounterPokemon}
              timer={timer}
            />
            <GuessForm
              // Use encounterId as key to reset internal form state (feedback/input) for each new Pokemon
              key={
                game.state.activeEncounter?.encounterId ??
                (sessionActive ? "waiting" : "idle")
              }
              isDisabled={!sessionActive || !game.state.activeEncounter}
              onSubmitGuess={game.submitGuess}
            />
          </SectionCard>
        </div>

        {/* COLUMN 2: CATCH HISTORY */}
        <div className="dashboard-side">
          <SectionCard className="h-22">
            <div className="flex justify-between items-center h-full">
              <span className="meta-label">Caught</span>
              <strong className="text-xl">
                {selectTotalCaught(game.state)}
              </strong>
            </div>
          </SectionCard>
          <CatchHistoryPanel history={recentHistory} className="flex-1" />
        </div>

        {/* COLUMN 3: TRAINER & PARTY */}
        <div className="dashboard-side">
          <SectionCard className="h-22">
            <div className="flex justify-between items-center h-full">
              <span className="meta-label">Trainer</span>
              <strong className="truncate max-w-30">
                {game.state.trainer.name}
              </strong>
            </div>
          </SectionCard>

          <CollectionPanel entries={partyEntries} className="flex-1" />

          <button
            className="primary-button"
            style={{ marginTop: "auto" }}
            onClick={() => setIsBoxOpen(true)}
            aria-label="Manage Pokemon Storage"
          >
            Manage Storage
          </button>
        </div>
      </section>

      {/* STORAGE MODAL OVERLAY */}
      {isBoxOpen && (
        <BoxManagement
          party={partyEntries}
          // Selector-currying to keep BoxManagement focused on its own logic
          getBoxEntries={(boxIndex) => selectBoxEntries(game.state, boxIndex)}
          boxCount={game.state.boxes.length}
          onMove={game.movePokemon}
          onRelease={game.releasePokemon}
          onAddBox={game.addBox}
          onClose={() => setIsBoxOpen(false)}
        />
      )}
    </main>
  );
}

export default App;
