import { PokemonCollectionCard } from "./PokemonCollectionCard";
import { SectionCard } from "./SectionCard";
import type { CollectionEntry } from "../features/game/gameTypes";

interface CollectionPanelProps {
  entries: CollectionEntry[];
}

export function CollectionPanel({ entries }: CollectionPanelProps) {
  return (
    <SectionCard
      title="Collection"
      description="Every catch is stored as its own Pokemon copy, even if you already own the species."
    >
      {entries.length === 0 ? (
        <p className="empty-state">Your collection is empty.</p>
      ) : (
        <div className="collection-grid">
          {entries.map((entry) => (
            <PokemonCollectionCard entry={entry} key={entry.instanceId} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}
