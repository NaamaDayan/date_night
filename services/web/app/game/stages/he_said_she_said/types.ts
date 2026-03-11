/**
 * Stage 1 ("He Said She Said") payload, synced via stagePayloadJson.
 */

export type Stage1Phase = "questions" | "finalPrompt" | "results";

export interface Stage1Payload {
  phase?: Stage1Phase;
  blurLevel?: number;
  currentQuestionIndex?: number;
  currentQuestion?: string;
  questionsAsked?: number;
  totalMatches?: number;
  totalMismatches?: number;
  lastPairMatched?: boolean | null;
  stageComplete?: boolean;
  win?: boolean;
  winBy?: "liveGuess" | "finalPrompt" | null;
  winnerRole?: "player1" | "player2" | null;
  winnerName?: string | null;
  lastGuessText?: string | null;
  lastGuessWrong?: boolean;
  awaitingFinalAnswers?: boolean;
  finalAnswerPlayer1?: string | null;
  finalAnswerPlayer2?: string | null;
  p1Answered?: boolean;
  p2Answered?: boolean;
}

export function parseStage1Payload(json: string): Stage1Payload {
  try {
    const o = JSON.parse(json || "{}");
    return (o as Stage1Payload) || {};
  } catch {
    return {};
  }
}

