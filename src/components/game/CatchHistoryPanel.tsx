import { SectionCard } from "../ui/SectionCard";
import type { HistoryEntry } from "../../features/game/gameTypes";
import { formatPokemonName } from "../../lib/string";

/**
 * Props for the CatchHistoryPanel component.
 */
interface CatchHistoryPanelProps {
  /** Array of recent encounter history entries. */
  history: HistoryEntry[];
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Displays a list of the most recent Pokemon encounters and their results.
 */
export function CatchHistoryPanel({
  history,
  className = "",
}: CatchHistoryPanelProps) {
  const maxEntries = 10;
  const displayHistory = history.slice(0, maxEntries);
  const placeholderCount = Math.max(0, maxEntries - displayHistory.length);

  return (
    <SectionCard title="Recent Captures" className={className}>
      <ul className="history-list">
        {displayHistory.map((entry) => (
          <li className="history-item" key={entry.encounterId}>
            <div>
              <strong>{formatPokemonName(entry.pokemon.name)}</strong>
              <p>{new Date(entry.resolvedAt).toLocaleString()}</p>
            </div>
            <span
              className={`history-badge ${
                entry.result === "caught"
                  ? "history-badge--caught"
                  : entry.result === "missed"
                    ? "history-badge--missed"
                    : "history-badge--fled"
              }`}
            >
              {entry.result}
            </span>
          </li>
        ))}
        {Array.from({ length: placeholderCount }).map((_, index) => (
          <li
            key={`placeholder-${index}`}
            className="history-item history-item--empty"
          >
            {history.length === 0 && index === 0 && (
              <span className="empty-slot-text">
                Recent Captures will be shown here
              </span>
            )}
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
