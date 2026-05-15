interface NameStepProps {
  trainerName: string;
  onChange: (name: string) => void;
  onNext: () => void;
}

export function NameStep({ trainerName, onChange, onNext }: NameStepProps) {
  return (
    <label className="field">
      <span>Trainer name</span>
      <input
        autoComplete="off"
        className="text-input"
        maxLength={24}
        name="trainer-name"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Enter a trainer name"
        value={trainerName}
        onKeyDown={(e) => e.key === "Enter" && onNext()}
      />
    </label>
  );
}
