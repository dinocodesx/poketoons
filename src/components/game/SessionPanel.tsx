import { CountdownTimer } from "../ui/CountdownTimer";

/**
 * Props for the SessionPanel component.
 */
interface SessionPanelProps {
  /** Whether the user is eligible to start a new session. */
  canStart: boolean;
  /** Whether a session is currently active. */
  isActive: boolean;
  /** Callback to end the session. */
  onEndSession: () => void;
  /** Callback to start a session. */
  onStartSession: () => void;
  /** The current state of the countdown timer. */
  timer: {
    label: string;
    displayValue: string;
  };
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Provides controls for starting and ending a manual catching session.
 * Displays the current session cycle timer.
 */
export function SessionPanel({
  canStart,
  isActive,
  onEndSession,
  onStartSession,
  timer,
  className = "",
}: SessionPanelProps) {
  return (
    <section className={`section-card session-panel ${className}`.trim()}>
      <header className="section-card__header">
        <div>
          <h2>Session Control</h2>
        </div>
        <CountdownTimer label={timer.label} value={timer.displayValue} />
      </header>

      <div className="section-card__content session-panel__content">
        <div className="action-row w-full">
          <button
            className="primary-button flex-1"
            disabled={!canStart}
            onClick={onStartSession}
            type="button"
          >
            Start session
          </button>
          <button
            className="secondary-button flex-1"
            disabled={!isActive}
            onClick={onEndSession}
            type="button"
          >
            End session
          </button>
        </div>
      </div>
    </section>
  );
}
