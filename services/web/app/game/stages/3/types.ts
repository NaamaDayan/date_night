/**
 * Stage 3 ("Sound Date Puzzle") payload synced via stagePayloadJson.
 */

export type Stage3Status = "playing" | "solved";

export interface Stage3Payload {
  buttons?: number[];
  targetDigits?: number[];
  pressSequence?: number[];
  stageComplete?: boolean;
  status?: Stage3Status;
}

export function parseStage3Payload(json: string): Stage3Payload {
  try {
    const o = JSON.parse(json || "{}");
    return (o as Stage3Payload) || {};
  } catch {
    return {};
  }
}
