import React from "react";
import { BOX_COUNT } from "../../features/game/gameConstants";

interface BoxSidebarProps {
  currentBoxIndex: number;
  onBoxChange: (index: number) => void;
  onRelease: () => void;
  canRelease: boolean;
  selectedText: string;
  onClose: () => void;
}

export function BoxSidebar({
  currentBoxIndex,
  onBoxChange,
  onRelease,
  canRelease,
  selectedText,
  onClose,
}: BoxSidebarProps) {
  return (
    <div className="box-sidebar">
      <div className="flex flex-col items-center mb-2">
        <h2 className="text-xl">Storage</h2>
        <div className="w-full h-px bg-panel-border mt-2" />
      </div>
      
      <div className="flex-1 overflow-auto box-nav">
        {Array.from({ length: BOX_COUNT }).map((_, i) => (
          <button
            key={`box-nav-${i}`}
            className={`box-nav__item ${
              currentBoxIndex === i ? "box-nav__item--active" : ""
            }`}
            onClick={() => onBoxChange(i)}
          >
            Box {i + 1}
          </button>
        ))}
      </div>

      <div className="box-actions">
        <p className="text-xs text-text-muted text-center mb-2">{selectedText}</p>
        <button
          className="secondary-button w-full text-error border-error-border mb-2"
          disabled={!canRelease}
          onClick={onRelease}
        >
          Release Pokemon
        </button>
        <button className="primary-button w-full" onClick={onClose}>
          Close Storage
        </button>
      </div>
    </div>
  );
}
