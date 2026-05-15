import { PokemonCollectionCard } from "./PokemonCollectionCard";
import { SectionCard } from "../ui/SectionCard";
import type { CollectionEntry } from "../../features/game/gameTypes";

/**
 * Props for the CollectionPanel component.
 */
interface CollectionPanelProps {
  /** Array of owned Pokemon entries from the collection. */
  entries: CollectionEntry[];
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Displays a list view of the trainer's Pokemon party.
 */
export function CollectionPanel({
  entries,
  className = "",
}: CollectionPanelProps) {
  return (
    <SectionCard title="Party" className={className}>
      <div className="collection-grid">
        {entries.map((entry, index) => (
          entry ? (
            <PokemonCollectionCard entry={entry} key={entry.instanceId} />
          ) : (
            <div
              key={`placeholder-${index}`}
              className="collection-card collection-card--empty"
            >
              {index === 0 && (
                <span className="empty-slot-text">
                  Empty slot
                </span>
              )}
            </div>
          )
        ))}
      </div>
    </SectionCard>
  );
}
