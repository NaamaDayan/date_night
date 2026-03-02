/**
 * Stage 3 ("Vision Board") payload synced via stagePayloadJson.
 */

export type Stage3Status =
  | "intro"
  | "asking"
  | "reveal"
  | "generating"
  | "showResult"
  | "ended";

export interface Stage3Choice {
  id: string;
  label: string;
  assetKey: string;
}

export interface Stage3MutualPick {
  id: string;
  label: string;
  assetKey: string;
}

export interface Stage3Prompt {
  question: string;
  options: Stage3Choice[];
}

export interface Stage3Payload {
  stageId?: number;
  stageName?: string;
  status?: Stage3Status;
  currentPromptIndex?: number;
  currentPrompt?: Stage3Prompt;
  p1Choice?: string | null;
  p2Choice?: string | null;
  p1Answered?: boolean;
  p2Answered?: boolean;
  mutualPicks?: Stage3MutualPick[];
  mutualCount?: number;
  tvReaction?: string;
  finalVisionBoardImageUrl?: string | null;
  generationError?: string | null;
  stageComplete?: boolean;
}

export function parseStage3Payload(json: string): Stage3Payload {
  try {
    const o = JSON.parse(json || "{}");
    return (o as Stage3Payload) || {};
  } catch {
    return {};
  }
}
