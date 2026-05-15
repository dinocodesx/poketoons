export interface Region {
  id: number;
  name: string;
  generation: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
}

export const REGIONS: Region[] = [
  { id: 1, name: "Kanto", generation: 1 },
  { id: 2, name: "Johto", generation: 2 },
  { id: 3, name: "Hoenn", generation: 3 },
  { id: 4, name: "Sinnoh", generation: 4 },
  { id: 5, name: "Unova", generation: 5 },
  { id: 6, name: "Kalos", generation: 6 },
  { id: 7, name: "Alola", generation: 7 },
  { id: 8, name: "Galar", generation: 8 },
  { id: 9, name: "Paldea", generation: 9 },
];

interface RegionStepProps {
  selectedRegion: Region | null;
  onSelect: (region: Region) => void;
}

export function RegionStep({ selectedRegion, onSelect }: RegionStepProps) {
  return (
    <div className="region-grid">
      {REGIONS.map((region) => (
        <button
          key={region.id}
          className={`region-option ${selectedRegion?.id === region.id ? "region-option--active" : ""}`}
          onClick={() => onSelect(region)}
        >
          <strong>{region.name}</strong>
          <span className="text-text-muted text-xs">Gen {region.generation}</span>
        </button>
      ))}
    </div>
  );
}
