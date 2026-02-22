export type Role = "player1" | "player2" | "tv";

export interface QuestionnaireData {
  partner1Name: string;
  partner2Name: string;
  howLong: string;
  howMet: string;
  whereMet: string;
}

export interface GameHistoryItem {
  stageIndex: number;
  payload: Record<string, unknown>;
}

export type GameStatePhase =
  | "WAITING_FOR_START"
  | "IN_PROGRESS"
  | "INTERIM_SCREEN"
  | "ENDED";

export interface SyncedGameState {
  currentStageIndex: number;
  stage: number;
  gameState: GameStatePhase;
  message: string;
  tvText: string;
  player1Text: string;
  player2Text: string;
  gameStarted: boolean;
  playerCount: number;
  questionnaireJson: string;
  stagePayloadJson: string;
  gameHistoryJson: string;
  readyForNextCount: number;
  player1Submitted: boolean;
  player2Submitted: boolean;
}
