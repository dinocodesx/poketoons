/**
 * Props for the CountdownTimer component.
 */
interface CountdownTimerProps {
  /** The descriptive label for the timer (e.g., "Catch window"). */
  label: string;
  /** The formatted string value to display (e.g., "00:45"). */
  value: string;
}

/**
 * A reusable UI component to display a labeled countdown timer.
 */
export function CountdownTimer({ label, value }: CountdownTimerProps) {
  return (
    <div className="timer-chip" aria-live="polite">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
