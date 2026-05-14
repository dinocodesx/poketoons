interface CountdownTimerProps {
  label: string;
  value: string;
}

export function CountdownTimer({ label, value }: CountdownTimerProps) {
  return (
    <div className="timer-chip" aria-live="polite">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
