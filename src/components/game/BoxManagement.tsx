import { useState } from "react";
import { PartyBar } from "./PartyBar";
import { BoxGrid } from "./BoxGrid";
import { BoxSidebar } from "./BoxSidebar";
import type {
  CollectionEntry,
  StorageLocation,
} from "../../features/game/gameTypes";

interface BoxManagementProps {
  party: (CollectionEntry | null)[];
  getBoxEntries: (boxIndex: number) => (CollectionEntry | null)[];
  onMove: (source: StorageLocation, destination: StorageLocation) => void;
  onRelease: (location: StorageLocation) => void;
  onClose: () => void;
}

/**
 * Full-screen interface for managing Pokemon in the party and boxes.
 * Orchestrates the sub-components for Party, Box grid, and Sidebar navigation.
 */
export function BoxManagement({
  party,
  getBoxEntries,
  onMove,
  onRelease,
  onClose,
}: BoxManagementProps) {
  const [currentBoxIndex, setCurrentBoxIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] =
    useState<StorageLocation | null>(null);

  const currentBox = getBoxEntries(currentBoxIndex);

  /**
   * Handles interaction with any storage slot.
   * On first click, selects a Pokemon. On second click, moves/swaps to the target slot.
   */
  const handleSlotClick = (location: StorageLocation) => {
    if (!selectedLocation) {
      const pokemon =
        location.type === "party"
          ? party[location.slotIndex]
          : currentBox[location.slotIndex];

      if (pokemon) {
        setSelectedLocation(location);
      }
    } else {
      onMove(selectedLocation, location);
      setSelectedLocation(null);
    }
  };

  /**
   * Confirms and triggers the release of the currently selected Pokemon.
   */
  const handleRelease = () => {
    if (selectedLocation) {
      if (window.confirm("Are you sure you want to release this Pokemon?")) {
        onRelease(selectedLocation);
        setSelectedLocation(null);
      }
    }
  };

  const selectedText = selectedLocation
    ? "Select another slot to move/swap"
    : "Select a Pokemon to move or release";

  return (
    <div className="box-management">
      <PartyBar
        party={party}
        selectedLocation={selectedLocation}
        onSlotClick={handleSlotClick}
      />

      <div className="box-management__content">
        <BoxGrid
          boxIndex={currentBoxIndex}
          entries={currentBox}
          selectedLocation={selectedLocation}
          onSlotClick={handleSlotClick}
        />

        <BoxSidebar
          currentBoxIndex={currentBoxIndex}
          onBoxChange={setCurrentBoxIndex}
          onRelease={handleRelease}
          canRelease={!!selectedLocation}
          selectedText={selectedText}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
