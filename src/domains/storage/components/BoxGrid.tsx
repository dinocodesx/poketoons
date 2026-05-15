import { StorageSlot } from "./StorageSlot";
import type { CollectionEntry, StorageLocation } from "../types";

interface BoxGridProps {
  boxIndex: number;
  entries: (CollectionEntry | null)[];
  selectedLocation: StorageLocation | null;
  onSlotClick: (location: StorageLocation) => void;
}

export function BoxGrid({
  boxIndex,
  entries,
  selectedLocation,
  onSlotClick,
}: BoxGridProps) {
  const isSelected = (index: number) =>
    selectedLocation?.type === "box" &&
    selectedLocation.boxIndex === boxIndex &&
    selectedLocation.slotIndex === index;

  // Force exactly 30 slots (6x5)
  const displayEntries = entries.slice(0, 30);

  return (
    <div className="box-grid-container">
      <div className="box-grid">
        {displayEntries.map((pokemon, index) => (
          <StorageSlot
            key={`box-${boxIndex}-slot-${index}`}
            pokemon={pokemon}
            location={{ type: "box", boxIndex, slotIndex: index }}
            isSelected={isSelected(index)}
            onClick={onSlotClick}
          />
        ))}
      </div>
    </div>
  );
}
