import { CatchHistoryPanel } from "../components/CatchHistoryPanel";
import { CollectionPanel } from "../components/CollectionPanel";
import { EncounterCard } from "../components/EncounterCard";
import { GuessForm } from "../components/GuessForm";
import { LoadingScreen } from "../components/LoadingScreen";
import { SectionCard } from "../components/SectionCard";
import { SessionPanel } from "../components/SessionPanel";
import { TrainerSetup } from "../components/TrainerSetup";
import { useGameSession } from "../features/game/useGameSession";
import { useEncounterTimer } from "../features/game/useEncounterTimer";
import {
  selectCollectionEntries,
  selectCurrentEncounterPokemon,
  selectRecentHistoryEntries,
  selectSessionActive,
  selectStarterPokemon,
  selectTotalCaught,
} from "../features/game/gameSelectors";

function App() {
  const game = useGameSession();
  const sessionActive = selectSessionActive(game.state);
  const currentEncounterPokemon = selectCurrentEncounterPokemon(game.state);
  const starterPokemon = selectStarterPokemon(game.state);
  const collectionEntries = selectCollectionEntries(game.state);
  const recentHistory = selectRecentHistoryEntries(game.state);
  const timer = useEncounterTimer({
    activeEncounter: game.state.activeEncounter,
    isSessionActive: sessionActive,
    nextEncounterAt:
      sessionActive && !game.state.activeEncounter
        ? (game.state.currentSession?.nextEncounterAt ?? null)
        : null,
  });

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
            className="h-1/4"
          />

          <SectionCard
            title="Active Encounter"
            description="Study the artwork and type the exact Pokemon name before the clock runs out."
            className="h-3/4"
          >
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
          <SectionCard className="h-[88px]">
            <div className="flex justify-between items-center h-full">
              <span className="meta-label">Username</span>
              <strong>{game.state.trainer.name}</strong>
            </div>
          </SectionCard>

          <CollectionPanel
            entries={collectionEntries.slice(0, 6)}
            className="flex-1"
          />

          <button className="primary-button" style={{ marginTop: "auto" }}>
            Box
          </button>
        </div>
      </section>
    </main>
  );
}

export default App;
