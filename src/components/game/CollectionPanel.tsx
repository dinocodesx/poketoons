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
 * Displays a grid view of the trainer's Pokemon collection.
 * Shows a limited preview if many Pokemon are owned.
 */
export function CollectionPanel({
  entries,
  className = "",
}: CollectionPanelProps) {
  const minSlots = 6;
  const displayEntries = [...entries];
  const placeholderCount = Math.max(0, minSlots - entries.length);

  return (
    <SectionCard title="Collection" className={className}>
      <div className="collection-grid">
        {displayEntries.map((entry) => (
          <PokemonCollectionCard entry={entry} key={entry.instanceId} />
        ))}
        {Array.from({ length: placeholderCount }).map((_, index) => (
          <div
            key={`placeholder-${index}`}
            className="collection-card collection-card--empty"
          >
            {entries.length === 0 && index === 0 && (
              <span className="empty-slot-text">
                caught pokemons will be shown here
              </span>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
