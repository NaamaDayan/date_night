"use client";

import { useGameTheme } from "../../shared/GameThemeProvider";
import { COPY } from "./copy";

const ARROWS: Record<string, string> = {
  LEFT: "←",
  RIGHT: "→",
  UP: "↑",
  DOWN: "↓",
};

interface StepHistoryModalProps {
  steps: string[];
  onClose: () => void;
}

export function StepHistoryModal({ steps, onClose }: StepHistoryModalProps) {
  const theme = useGameTheme();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        padding: 24,
        boxSizing: "border-box",
      }}
      onClick={onClose}
    >
      <div
        dir="rtl"
        style={{
          background: theme.colors.surface,
          borderRadius: theme.radiusCard,
          padding: 24,
          maxWidth: 320,
          width: "100%",
          boxShadow: theme.shadows.cardElevated,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            margin: "0 0 16px",
            fontSize: theme.typography.phoneTitle,
            color: theme.colors.text,
          }}
        >
          {COPY.showMySteps}
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          {steps.map((dir, i) => (
            <span
              key={i}
              style={{
                fontSize: 32,
                lineHeight: 1,
                color: theme.colors.text,
              }}
            >
              {ARROWS[dir] ?? "•"}
            </span>
          ))}
        </div>
        <button
          type="button"
          className="game-btn-press"
          onClick={onClose}
          style={{
            marginTop: 20,
            width: "100%",
            padding: "12px 20px",
            fontSize: theme.typography.phoneBody,
            fontWeight: 700,
            color: theme.colors.background,
            background: theme.colors.primary,
            border: "none",
            borderRadius: theme.radius,
          }}
        >
          סגור
        </button>
      </div>
    </div>
  );
}
