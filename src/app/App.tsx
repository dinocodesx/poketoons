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
import { formatPokemonName } from "../lib/string";
import {
  selectCollectionEntries,
  selectCurrentEncounterPokemon,
  selectRecentHistoryEntries,
  selectSessionActive,
  selectStarterPokemon,
  selectTotalCaught,
  selectTotalOwned,
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
      <header className="app-header">
        <div>
          <p className="eyebrow">Pokemon Catch Session</p>
          <h1>Poketoons</h1>
        </div>
        <div className="header-meta">
          <div>
            <span className="meta-label">Trainer</span>
            <strong>{game.state.trainer.name}</strong>
          </div>
          <div>
            <span className="meta-label">Starter</span>
            <strong>{formatPokemonName(starterPokemon.name)}</strong>
          </div>
          <div>
            <span className="meta-label">Caught</span>
            <strong>{selectTotalCaught(game.state)}</strong>
          </div>
          <div>
            <span className="meta-label">Owned</span>
            <strong>{selectTotalOwned(game.state)}</strong>
          </div>
        </div>
      </header>

      <section className="dashboard-grid">
        <div className="dashboard-main">
          <SessionPanel
            canStart={!sessionActive}
            isActive={sessionActive}
            onEndSession={game.endSession}
            onStartSession={game.startSession}
            timer={timer}
          />

          <SectionCard
            title="Active Encounter"
            description="Study the artwork and type the exact Pokemon name before the clock runs out."
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
          <CatchHistoryPanel history={recentHistory} />
          <CollectionPanel entries={collectionEntries} />
          <SectionCard
            title="Rules Snapshot"
            description="Local-only progression and rarity-based spawns."
          >
            <ul className="rule-list">
              <li>One-minute catch windows</li>
              <li>Only Pokemon 1-251 can appear</li>
              <li>Duplicates are always allowed</li>
              <li>Each catch levels the newest 30 Pokemon by +1</li>
              <li>No backend, all progress stays in your browser</li>
            </ul>
          </SectionCard>
        </div>
      </section>
    </main>
  );
}

export default App;
