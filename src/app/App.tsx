import { useState } from "react";
import { CatchHistoryPanel } from "../components/game/CatchHistoryPanel";
import { CollectionPanel } from "../components/game/CollectionPanel";
import { EncounterCard } from "../components/game/EncounterCard";
import { GuessForm } from "../components/game/GuessForm";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { SectionCard } from "../components/ui/SectionCard";
import { SessionPanel } from "../components/game/SessionPanel";
import { TrainerSetup } from "../components/game/TrainerSetup";
import { BoxManagement } from "../components/game/BoxManagement";
import { useGameSession } from "../features/game/useGameSession";
import { useEncounterTimer } from "../features/game/useEncounterTimer";
import {
  selectBoxEntries,
  selectCurrentEncounterPokemon,
  selectPartyEntries,
  selectRecentHistoryEntries,
  selectSessionActive,
  selectStarterPokemon,
  selectTotalCaught,
} from "../features/game/gameSelectors";

function App() {
  const game = useGameSession();
  const [isBoxOpen, setIsBoxOpen] = useState(false);

  const sessionActive = selectSessionActive(game.state);
  const currentEncounterPokemon = selectCurrentEncounterPokemon(game.state);
  const starterPokemon = selectStarterPokemon(game.state);
  const partyEntries = selectPartyEntries(game.state);
  const recentHistory = selectRecentHistoryEntries(game.state);
  
  const timer = useEncounterTimer({
    activeEncounter: game.state.activeEncounter,
    isSessionActive: sessionActive,
    nextEncounterAt:
      sessionActive && !game.state.activeEncounter
        ? (game.state.currentSession?.nextEncounterAt ?? null)
        : null,
  });

  // State loading & Onboarding
  if (game.state.isHydrating) {
    return <LoadingScreen />;
  }

  if (!game.state.trainer || !starterPokemon) {
    return (
      <TrainerSetup
        starters={game.starterChoices}
        onCreateTrainer={game.createTrainer}
      />
    );
  }

  return (
    <main className="app-shell">
      <section className="dashboard-grid">
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
              key={
                game.state.activeEncounter?.encounterId ??
                (sessionActive ? "waiting" : "idle")
              }
              isDisabled={!sessionActive || !game.state.activeEncounter}
              onSubmitGuess={game.submitGuess}
            />
          </SectionCard>
        </div>

        <div className="dashboard-side">
          <SectionCard className="h-22">
            <div className="flex justify-between items-center h-full">
              <span className="meta-label">Caught</span>
              <strong>{selectTotalCaught(game.state)}</strong>
            </div>
          </SectionCard>
          <CatchHistoryPanel history={recentHistory} className="flex-1" />
        </div>

        <div className="dashboard-side">
          <SectionCard className="h-22">
            <div className="flex justify-between items-center h-full">
              <span className="meta-label">Trainer</span>
              <strong>{game.state.trainer.name}</strong>
            </div>
          </SectionCard>

          <CollectionPanel
            entries={partyEntries}
            className="flex-1"
          />

          <button 
            className="primary-button" 
            style={{ marginTop: "auto" }}
            onClick={() => setIsBoxOpen(true)}
          >
            Manage Storage
          </button>
        </div>
      </section>

      {isBoxOpen && (
        <BoxManagement
          party={partyEntries}
          getBoxEntries={(boxIndex) => selectBoxEntries(game.state, boxIndex)}
          onMove={game.movePokemon}
          onRelease={game.releasePokemon}
          onClose={() => setIsBoxOpen(false)}
        />
      )}
    </main>
  );
}

export default App;
