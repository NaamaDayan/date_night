"use client";

import { useGameTheme } from "./shared/GameThemeProvider";
import { Button } from "./shared/Button";
import { TVLayout } from "./shared/TVLayout";
import { PlayerLayout } from "./shared/PlayerLayout";

export interface DummyStageViewProps {
  stageNumber: number;
  role: "player1" | "player2" | "tv";
  onBackToProgress: () => void;
}

/**
 * Dummy stage for testing the 9-stage flow (stages 5–9).
 * Renders a minimal screen with a single "Back to Progress" button.
 */
export function DummyStageView({
  stageNumber,
  role,
  onBackToProgress,
}: DummyStageViewProps) {
  const theme = useGameTheme();
  const isTV = role === "tv";

  const content = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        textAlign: "center",
        padding: theme.spacing.xl,
      }}
    >
      <span
        style={{
          fontSize: isTV ? "clamp(48px, 6vw, 72px)" : 40,
          opacity: 0.6,
        }}
      >
        🔒
      </span>
      <h2
        style={{
          margin: 0,
          fontSize: isTV ? "clamp(22px, 3vw, 32px)" : "clamp(18px, 4vw, 22px)",
          fontWeight: 700,
          color: theme.colors.text,
        }}
      >
        Stage {stageNumber}
      </h2>
      <p
        style={{
          margin: 0,
          fontSize: isTV ? "clamp(14px, 1.8vw, 18px)" : 14,
          color: theme.colors.textMuted,
        }}
      >
        Dummy stage for testing the progress screen flow.
      </p>
      <Button onClick={onBackToProgress} style={{ minWidth: 200 }}>
        Back to Progress
      </Button>
    </div>
  );

  if (isTV) {
    return <TVLayout>{content}</TVLayout>;
  }
  return (
    <PlayerLayout stickyBottom={null}>
      <div
        style={{
          minHeight: "60dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {content}
      </div>
    </PlayerLayout>
  );
}
