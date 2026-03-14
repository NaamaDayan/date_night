/**
 * Stage copy – from config/copy/stage_our_sync.json
 */
import stageOurSyncJson from "config/copy/stage_our_sync.json";

export const COPY = stageOurSyncJson as Record<string, string>;

/**
 * Arrow symbols for directions (used in compass rose and in guidelines).
 */
const DIRECTION_SYMBOLS: Record<string, string> = {
  north: "↑",
  south: "↓",
  east: "→",
  west: "←",
  "north-east": "↗",
  "north-west": "↖",
  "south-east": "↘",
  "south-west": "↙",
};

export function directionSymbol(directionKey: string | null | undefined): string {
  if (!directionKey) return "";
  return DIRECTION_SYMBOLS[directionKey] || directionKey;
}

/** For guidelines: show the direction as symbol (same as compass). */
export function directionDisplayLabel(directionKey: string | null | undefined): string {
  return directionSymbol(directionKey);
}
