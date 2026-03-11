/**
 * Stage 6 (Final Stage) payload synced via stagePayloadJson.
 */
export type Stage6Phase =
  | "question"
  | "readyToGuess"
  | "guessNumber"
  | "success"
  | "funFact"
  | "endGame";

export interface Stage6Payload {
  welcomeStatus?: string;
  phase?: Stage6Phase;
  trueAnswersCount?: number;
  questionsUsed?: number;
  questionList?: string[];
  questionOrder?: number[];
  currentQuestionIndex?: number;
  playerAStepHistory?: string[];
  playerBStepHistory?: string[];
  playerASubmittedNumber?: number | null;
  playerBSubmittedNumber?: number | null;
  playerACorrect?: boolean;
  playerBCorrect?: boolean;
  stageCompleted?: boolean;
  fallbackRevealed?: boolean;
  lastTrueAnimationUntil?: number;
  funFactStartTime?: number | null;
  countdownEndTime?: number | null;
  endGameScreen?: boolean;
  player1GameComplete?: boolean;
  player2GameComplete?: boolean;
  lastAnswerFalse?: boolean;
  player1AnswerCurrent?: boolean | null;
  player2AnswerCurrent?: boolean | null;
}

export function parseStage6Payload(json: string): Stage6Payload {
  try {
    const o = JSON.parse(json || "{}");
    return (o as Stage6Payload) || {};
  } catch {
    return {};
  }
}
