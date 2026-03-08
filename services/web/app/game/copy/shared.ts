/**
 * Shared copy – from config/copy/shared.json. Single source for strings
 * like "ממתינים לבן / בת הזוג" used in StageWelcome and elsewhere.
 */
import sharedJson from "config/copy/shared.json";

export type SharedCopy = typeof sharedJson;
export const shared: SharedCopy = sharedJson;
