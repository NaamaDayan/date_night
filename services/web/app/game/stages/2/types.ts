/**
 * Stage 2 ("Sound Date Puzzle") payload synced via stagePayloadJson.
 */

export type Stage2Status = "playing" | "solved";

export interface Stage2Payload {
  buttons?: number[];
  targetDigits?: number[];
  pressSequence?: number[];
  stageComplete?: boolean;
  status?: Stage2Status;
}

export function parseStage2Payload(json: string): Stage2Payload {
  try {
    const o = JSON.parse(json || "{}");
    return (o as Stage2Payload) || {};
  } catch {
    return {};
  }
}
