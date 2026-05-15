import { MAX_BOX_COUNT } from "../constants";

interface BoxSidebarProps {
  currentBoxIndex: number;
  onBoxChange: (index: number) => void;
  boxCount: number;
  onAddBox: () => void;
}

export function BoxSidebar({
  currentBoxIndex,
  onBoxChange,
  boxCount,
  onAddBox,
}: BoxSidebarProps) {
  const canAddBox = boxCount < MAX_BOX_COUNT;

  return (
    <div className="box-sidebar">
      <div className="box-sidebar__header">
        <h2 className="text-xl">Storage</h2>
        <div className="w-full h-px bg-panel-border mt-2" />
      </div>
      
      <div className="box-nav">
        {Array.from({ length: boxCount }).map((_, i) => (
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
        {canAddBox && (
          <button
            className="box-nav__item box-nav__item--add"
            onClick={onAddBox}
            title="Add New Box"
          >
            + Add Box
          </button>
        )}
      </div>
    </div>
  );
}
