import { useState } from "react";
import type { GuessAttemptResult } from "../features/game/gameTypes";

interface GuessFormProps {
  isDisabled: boolean;
  onSubmitGuess: (guess: string) => GuessAttemptResult;
}

export function GuessForm({ isDisabled, onSubmitGuess }: GuessFormProps) {
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState<GuessAttemptResult | null>(null);

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
