import { useState, useCallback } from "react";
import { PartyBar } from "./PartyBar";
import { BoxGrid } from "./BoxGrid";
import { BoxSidebar } from "./BoxSidebar";
import type {
  CollectionEntry,
  StorageLocation,
} from "../types";

/**
 * Props for the BoxManagement container.
 */
interface BoxManagementProps {
  /** The trainer's current active party. */
  party: (CollectionEntry | null)[];
  /** Strategy function to retrieve entries for a specific box. */
  getBoxEntries: (boxIndex: number) => (CollectionEntry | null)[];
  /** The total number of boxes owned by the trainer. */
  boxCount: number;
  /** Callback to trigger a move/swap between storage locations. */
  onMove: (source: StorageLocation, destination: StorageLocation) => void;
  /** Callback to release a Pokemon back into the wild. */
  onRelease: (location: StorageLocation) => void;
  /** Callback to add a new storage box. */
  onAddBox: () => void;
  /** Callback to close the management interface. */
  onClose: () => void;
}

/**
 * Full-screen interface for managing Pokemon storage and party organization.
 * 
 * DESIGN PATTERN: State-Driven Interaction
 * Implements a "select-and-move" workflow:
 * 1. User clicks a non-empty slot to 'select' a Pokemon.
 * 2. User clicks another slot (empty or not) to 'move' or 'swap'.
 */
export function BoxManagement({
  party,
  getBoxEntries,
  boxCount,
  onMove,
  onRelease,
  onAddBox,
  onClose,
}: BoxManagementProps) {
  // Track which box is currently visible (0 to BOX_COUNT-1)
  const [currentBoxIndex, setCurrentBoxIndex] = useState(0);
  
  // Track the source location for the pending move operation
  const [selectedLocation, setSelectedLocation] =
    useState<StorageLocation | null>(null);

  // Derive current box data from the strategy function
  const currentBox = getBoxEntries(currentBoxIndex);

  /**
   * Universal handler for slot interactions.
   * Handles both selection and execution of move commands.
   */
  const handleSlotClick = useCallback((location: StorageLocation) => {
    if (!selectedLocation) {
      // PHASE 1: Selection
      // Only allow selection if the clicked slot contains a Pokemon
      const pokemon =
        location.type === "party"
          ? party[location.slotIndex]
          : currentBox[location.slotIndex];

      if (pokemon) {
        setSelectedLocation(location);
      }
    } else {
      // PHASE 2: Execution
      // Execute the move through the parent-provided callback
      onMove(selectedLocation, location);
      setSelectedLocation(null);
    }
  }, [selectedLocation, party, currentBox, onMove]);

  /**
   * Triggers a permanent deletion of the selected Pokemon.
   * Requires explicit user confirmation via native browser dialog.
   */
  const handleRelease = useCallback(() => {
    if (!selectedLocation) return;
    
    const isConfirmed = window.confirm(
      "Are you sure you want to release this Pokemon? This action is permanent."
    );

    if (isConfirmed) {
      onRelease(selectedLocation);
      setSelectedLocation(null);
    }
  }, [selectedLocation, onRelease]);

  // Derived label text for the sidebar status
  const selectedText = selectedLocation
    ? "Select another slot to move/swap"
    : "Select a Pokemon to move or release";

  return (
    <div className="box-management" role="dialog" aria-modal="true">
      <PartyBar
        party={party}
        selectedLocation={selectedLocation}
        onSlotClick={handleSlotClick}
      />

      <div className="box-management__main">
        <div className="box-management__content">
          <BoxSidebar
            currentBoxIndex={currentBoxIndex}
            onBoxChange={setCurrentBoxIndex}
            boxCount={boxCount}
            onAddBox={onAddBox}
          />

          <BoxGrid
            boxIndex={currentBoxIndex}
            entries={currentBox}
            selectedLocation={selectedLocation}
            onSlotClick={handleSlotClick}
          />
        </div>

        <div className="box-actions">
          <p className="text-xs text-text-muted text-center mb-2">{selectedText}</p>
          <div className="box-actions__buttons">
            <button
              className="secondary-button text-error border-error-border"
              disabled={!!!selectedLocation}
              onClick={handleRelease}
            >
              Release Pokemon
            </button>
            <button className="primary-button" onClick={onClose}>
              Close Storage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
