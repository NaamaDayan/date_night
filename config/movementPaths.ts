/**
 * Physical movement paths for Stage 6.
 * Each TRUE answer reveals the next step; players draw the digit unknowingly.
 */
export const playerAPath = ["LEFT", "DOWN", "RIGHT", "DOWN", "LEFT"] as const;
export const playerBPath = ["RIGHT", "DOWN", "LEFT", "DOWN", "RIGHT"] as const;

export type Direction = "LEFT" | "RIGHT" | "UP" | "DOWN";
