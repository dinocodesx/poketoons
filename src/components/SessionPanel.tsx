import { CountdownTimer } from "./CountdownTimer";

interface SessionPanelProps {
  canStart: boolean;
  isActive: boolean;
  onEndSession: () => void;
  onStartSession: () => void;
  timer: {
    label: string;
    displayValue: string;
  };
}

export function SessionPanel({
  canStart,
  isActive,
  onEndSession,
  onStartSession,
  timer,
}: SessionPanelProps) {
  return (
    <section className="section-card session-panel">
      <header className="section-card__header">
        <div>
          <h2>Session Control</h2>
          <p>
            Start a timed catch run when you are ready. End the session to stop
            new encounters from appearing.
          </p>
        </div>
        <CountdownTimer label={timer.label} value={timer.displayValue} />
      </header>

      <div className="section-card__content session-panel__content">
        <div className="status-pill">
          <span
            className={isActive ? "status-dot status-dot--live" : "status-dot"}
          />
          <strong>{isActive ? "Session active" : "Session idle"}</strong>
        </div>

        <div className="action-row">
          <button
            className="primary-button"
            disabled={!canStart}
            onClick={onStartSession}
            type="button"
          >
            Start session
          </button>
          <button
            className="secondary-button"
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
