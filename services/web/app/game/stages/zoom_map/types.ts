/**
 * Stage 4 (Zoom Map + Word Guessing) payload synced via stagePayloadJson.
 */

export interface Stage4Question {
  question: string;
  options: string[];
}

export interface Stage4Payload {
  subRoundIndex?: number;
  zoomLevel?: number;
  phase?: "describe" | "guess" | "result";
  describerRole?: "player1" | "player2";
  word?: string;
  questions?: Stage4Question[];
  describerAnswers?: number[];
  describerAnswerTexts?: string[];
  wordOptions?: string[];
  result?: "correct" | "incorrect" | null;
  stageComplete?: boolean;
  locationCorrect?: boolean;
  lastLocationGuessWrong?: boolean;
}

export function parseStage4Payload(json: string): Stage4Payload {
  try {
    const o = JSON.parse(json || "{}");
    return (o as Stage4Payload) || {};
  } catch {
    return {};
  }
}
