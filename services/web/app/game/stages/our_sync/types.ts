export type OurSyncDirection =
  | "north"
  | "south"
  | "east"
  | "west"
  | "north-east"
  | "north-west"
  | "south-east"
  | "south-west";

export type OurSyncGameState = "PLAYING" | "QUESTION" | "BOOSTING";

export interface OurSyncPayload {
  ourSyncActive?: boolean;
  gameState?: OurSyncGameState;
  manualStepsInCycle?: number;
  cursorX?: number;
  cursorY?: number;
  currentStepIndex?: number;
  remainingSteps?: number;
  currentInstructionIndex?: number;
  totalSteps?: number;
  currentDirection?: string | null;
  isSwapped?: boolean;
  instructionVisible?: boolean;
  isLocked?: boolean;
  halfwayTriggered?: boolean;
  lastMoveAtP1?: number;
  lastMoveAtP2?: number;
  lastWrongFor?: "player1" | "player2" | null;
  stageComplete?: boolean;
  questionText?: string | null;
  optionA?: string | null;
  optionB?: string | null;
  player1Answer?: string | null;
  player2Answer?: string | null;
  lastAnswerMismatch?: boolean;
  isBoostStep?: boolean;
  boostJustFinished?: boolean;
}

export function parseOurSyncPayload(json: string): OurSyncPayload {
  try {
    const o = JSON.parse(json || "{}");
    return (o as OurSyncPayload) || {};
  } catch {
    return {};
  }
}

