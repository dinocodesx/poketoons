import { SectionCard } from "./SectionCard";
import type { HistoryEntry } from "../features/game/gameTypes";
import { formatPokemonName } from "../lib/string";

interface CatchHistoryPanelProps {
  history: HistoryEntry[];
}

export function CatchHistoryPanel({ history }: CatchHistoryPanelProps) {
  return (
    <SectionCard
      title="Recent Results"
      description="Keep an eye on the latest catches and misses from your local save."
    >
      {history.length === 0 ? (
        <p className="empty-state">No encounters resolved yet.</p>
      ) : (
        <ul className="history-list">
          {history.map((entry) => (
            <li className="history-item" key={entry.encounterId}>
              <div>
                <strong>{formatPokemonName(entry.pokemon.name)}</strong>
                <p>{new Date(entry.resolvedAt).toLocaleString()}</p>
              </div>
              <span
                className={`history-badge ${
                  entry.result === "caught"
                    ? "history-badge--caught"
                    : "history-badge--missed"
                }`}
              >
                {entry.result}
              </span>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
