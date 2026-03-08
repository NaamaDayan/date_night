/**
 * Stage 6 copy – from config/copy/stage6.json. directionToCopy helper in code.
 */
import stage6Json from "config/copy/stage6.json";

export const COPY = stage6Json as const;

export function directionToCopy(dir: string): string {
  const map: Record<string, string> = {
    LEFT: COPY.left,
    RIGHT: COPY.right,
    UP: COPY.up,
    DOWN: COPY.down,
  };
  return map[dir] || dir;
}
