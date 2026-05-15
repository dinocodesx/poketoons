import { useState } from "react";
import type { GuessAttemptResult } from "../../features/game/gameTypes";

/**
 * Props for the GuessForm component.
 */
interface GuessFormProps {
  /** Whether the form should be disabled (e.g., no active encounter). */
  isDisabled: boolean;
  /** Callback function to process a guess. */
  onSubmitGuess: (guess: string) => GuessAttemptResult;
}

/**
 * A form component that allows players to guess the name of the encountered Pokemon.
 * Provides immediate feedback on whether the guess was correct.
 */
export function GuessForm({ isDisabled, onSubmitGuess }: GuessFormProps) {
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState<GuessAttemptResult | null>(null);

  /**
   * Handles form submission.
   */
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = onSubmitGuess(guess);

    setFeedback(result);

    if (result.correct) {
      setGuess("");
    }
  }

  return (
    <form className="guess-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Pokemon name</span>
        <div className="guess-form__row">
          <input
            autoCapitalize="off"
            autoComplete="off"
            className="text-input"
            disabled={isDisabled}
            onChange={(event) => setGuess(event.target.value)}
            placeholder={
              isDisabled ? "Start or wait for a session" : "Type the exact name"
            }
            value={guess}
          />
          <button
            className="primary-button"
            disabled={isDisabled}
            type="submit"
          >
            Catch
          </button>
        </div>
      </label>
      {feedback ? (
        <p
          className={`guess-feedback ${
            feedback.correct
              ? "guess-feedback--success"
              : "guess-feedback--error"
          }`}
          role="status"
        >
          {feedback.message}
        </p>
      ) : null}
    </form>
  );
}
