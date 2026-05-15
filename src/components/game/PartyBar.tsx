import { StorageSlot } from "./StorageSlot";
import type {
  CollectionEntry,
  StorageLocation,
} from "../../features/game/gameTypes";

interface PartyBarProps {
  party: (CollectionEntry | null)[];
  selectedLocation: StorageLocation | null;
  onSlotClick: (location: StorageLocation) => void;
}

export function PartyBar({
  party,
  selectedLocation,
  onSlotClick,
}: PartyBarProps) {
  const isSelected = (index: number) =>
    selectedLocation?.type === "party" && selectedLocation.slotIndex === index;

  return (
    <div className="party-bar">
      <span className="meta-label">Party</span>
      <div className="party-bar__slots">
        {party.map((pokemon, index) => (
          <StorageSlot
            key={`party-${index}`}
            pokemon={pokemon}
            location={{ type: "party", slotIndex: index }}
            isSelected={isSelected(index)}
            onClick={onSlotClick}
          />
        ))}
      </div>
    </div>
  );
}
