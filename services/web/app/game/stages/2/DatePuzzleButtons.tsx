"use client";

import { useCallback } from "react";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { COPY } from "./copy";

const AUDIO_BASE = "/audio/date-bits";

function playDigitSound(digit: number) {
  try {
    const audio = new Audio(`${AUDIO_BASE}/${digit}.mp3`);
    audio.play().catch(() => {});
  } catch {
    // placeholder mp3s may fail
  }
}

interface DatePuzzleButtonsProps {
  buttons: number[];
  /** Indices already pressed in current attempt (dimmed, not clickable) */
  usedIndices: Set<number>;
  interactive: boolean;
  onPress?: (index: number, digit: number) => void;
}

export function DatePuzzleButtons({
  buttons,
  usedIndices,
  interactive,
  onPress,
}: DatePuzzleButtonsProps) {
  const theme = useGameTheme();
  const safeButtons = Array.isArray(buttons) && buttons.length === 8
    ? buttons
    : [0, 0, 0, 0, 0, 0, 0, 0];

  const handleClick = useCallback(
    (index: number, digit: number) => {
      playDigitSound(digit);
      if (interactive && onPress && !usedIndices.has(index)) {
        onPress(index, digit);
      }
    },
    [interactive, onPress, usedIndices]
  );

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {safeButtons.map((digit, index) => {
        const used = usedIndices.has(index);
        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(index, digit)}
            className="game-btn-press"
            style={{
              width: "clamp(48px, 11vw, 64px)",
              height: "clamp(48px, 11vw, 64px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 14,
              border: `2px solid ${theme.colors.border}`,
              background: theme.colors.surface,
              color: theme.colors.text,
              fontSize: "clamp(18px, 4.5vw, 24px)",
              cursor: interactive && !used ? "pointer" : "default",
              userSelect: "none",
              opacity: used ? 0.35 : 1,
              boxShadow: theme.shadows?.card,
              transition: "opacity 0.2s ease",
            }}
          >
            {COPY.buttonLabel}
          </button>
        );
      })}
    </div>
  );
}
