"use client";

import { useMemo } from "react";
import type { SyncedGameState, QuestionnaireData } from "../../types";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { parseStage2Payload } from "./types";
import { COPY } from "./copy";
import { DatePuzzleButtons } from "./DatePuzzleButtons";

interface Props {
  state: SyncedGameState;
}

export function TVView({ state }: Props) {
  const theme = useGameTheme();
  const payload = parseStage2Payload(state.stagePayloadJson);
  const buttons = payload.buttons ?? [];
  const isSolved = Boolean(payload.stageComplete || payload.status === "solved");

  const pressSequence = payload.pressSequence ?? [];
  const usedIndices = useMemo(() => new Set(pressSequence), [pressSequence]);

  const questionnaire: QuestionnaireData = useMemo(() => {
    try {
      return (JSON.parse(state.questionnaireJson || "{}") as QuestionnaireData) || {
        partner1Name: "Player 1",
        partner2Name: "Player 2",
        howLong: "",
        howMet: "",
        whereMet: "",
      };
    } catch {
      return {
        partner1Name: "Player 1",
        partner2Name: "Player 2",
        howLong: "",
        howMet: "",
        whereMet: "",
      };
    }
  }, [state.questionnaireJson]);

  const headline = `${COPY.stageName} — ${questionnaire.partner1Name} & ${questionnaire.partner2Name}`;

  return (
    <div
      dir="rtl"
      style={{
        width: "100%",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        margin: -theme.spacing.md,
        padding: theme.spacing.md,
      }}
    >
      <div style={{ maxWidth: "min(640px, 90vw)", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "clamp(24px, 4vw, 36px)",
            margin: 0,
            marginBottom: 8,
            color: theme.colors.text,
            fontWeight: 800,
          }}
        >
          {headline}
        </h1>
        {!isSolved && (
          <p
            style={{
              fontSize: "clamp(14px, 2.2vw, 18px)",
              margin: 0,
              marginBottom: 24,
              color: theme.colors.textMuted,
            }}
          >
            {COPY.tvSubtitle}
          </p>
        )}
        <div style={{ marginBottom: 24 }}>
          <DatePuzzleButtons
            buttons={buttons}
            usedIndices={usedIndices}
            interactive={false}
          />
        </div>
        {isSolved && (
          <p
            className="game-step-enter game-text-glow"
            style={{
              fontSize: "clamp(22px, 4vw, 32px)",
              fontWeight: 700,
              margin: 0,
              color: theme.colors.accent,
            }}
          >
            {COPY.tvSolved}
          </p>
        )}
      </div>
    </div>
  );
}
