import type { TrainerProfile, CatchHistoryEntry } from "../domains/trainer/types";
import type { OwnedPokemon } from "../domains/storage/types";
import type { GameSession, ActiveEncounter } from "../domains/encounter/types";

export interface PersistedGameState {
  version: number;
  trainer: TrainerProfile | null;
  party: (OwnedPokemon | null)[];
  boxes: (OwnedPokemon | null)[][];
  currentSession: GameSession | null;
  activeEncounter: ActiveEncounter | null;
  history: CatchHistoryEntry[];
}

export interface GameState extends PersistedGameState {
  isHydrating: boolean;
}
