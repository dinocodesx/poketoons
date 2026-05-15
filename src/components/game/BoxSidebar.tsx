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
}: Pick<BoxSidebarProps, "currentBoxIndex" | "onBoxChange">) {
  return (
    <div className="box-sidebar">
      <div className="box-sidebar__header">
        <h2 className="text-xl">Storage</h2>
        <div className="w-full h-px bg-panel-border mt-2" />
      </div>
      
      <div className="box-nav">
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
    </div>
  );
}
