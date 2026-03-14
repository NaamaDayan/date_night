"use client";

import { parseOurSyncPayload, type OurSyncDirection } from "./types";
import { COPY, directionDisplayLabel } from "./copy";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { PlayerLayout } from "../../shared/PlayerLayout";
import { CompassRose } from "./CompassRose";
import type { SyncedGameState } from "../../types";
import type { QuestionnaireData } from "../../types";

const PLAYER_1_ALLOWED: OurSyncDirection[] = ["east", "west", "north-west", "south-east"];
const PLAYER_2_ALLOWED: OurSyncDirection[] = ["north", "south", "north-east", "south-west"];

interface Props {
  state: SyncedGameState;
  room: { send: (type: string, data?: unknown) => void };
  questionnaire: QuestionnaireData;
}

export function Player2View({ state, room }: Props) {
  const theme = useGameTheme();
  const payload = parseOurSyncPayload(state.stagePayloadJson);

  const gameState = payload.gameState || "PLAYING";
  const isSwapped = Boolean(payload.isSwapped);
  const instructionVisible = payload.instructionVisible !== false;
  const isLocked = Boolean(payload.isLocked);
  const stageComplete = Boolean(payload.stageComplete);
  const lastAnswerMismatch = Boolean(payload.lastAnswerMismatch);

  const myAllowed = isSwapped ? PLAYER_1_ALLOWED : PLAYER_2_ALLOWED;
  const successMessage = state.player2Text || COPY.successMessage;
  const currentNumber = payload.remainingSteps ?? 0;
  const currentDirectionLabel = directionDisplayLabel(payload.currentDirection);
  const infoValue = !isSwapped ? currentDirectionLabel : String(currentNumber);

  const optionA = payload.optionA ?? "";
  const optionB = payload.optionB ?? "";
  const questionText = payload.questionText ?? "";

  const infoBlock = instructionVisible ? (
    <div
      className="game-step-enter"
      style={{
        marginTop: 8,
        padding: 12,
        borderRadius: theme.radiusCard,
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: theme.typography.phoneCaption, color: theme.colors.textMuted, margin: 0, marginBottom: 4 }}>
        {COPY.nextStepLabel}
      </p>
      <p style={{ fontSize: theme.typography.phoneTitle, fontWeight: 800, margin: 0, color: theme.colors.accent }}>
        {infoValue || "—"}
      </p>
    </div>
  ) : null;

  if (stageComplete) {
    return (
      <PlayerLayout stageTitle={COPY.stageTitle}>
        <div dir="rtl" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
          <p className="game-step-enter game-text-glow" style={{ fontSize: theme.typography.phoneTitle, fontWeight: 800, margin: 0, color: theme.colors.accent }}>
            {successMessage}
          </p>
        </div>
      </PlayerLayout>
    );
  }

  if (gameState === "QUESTION") {
    return (
      <PlayerLayout stageTitle={COPY.stageTitle}>
        <div dir="rtl" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, gap: 24 }}>
          {lastAnswerMismatch && (
            <div
              className="game-shake"
              style={{
                padding: 12,
                borderRadius: theme.radiusCard,
                background: theme.colors.error + "22",
                border: `2px solid ${theme.colors.error}`,
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: theme.typography.phoneBody, fontWeight: 700, margin: 0, color: theme.colors.error }}>
                {COPY.notSyncedMessage}
              </p>
            </div>
          )}
          <p style={{ fontSize: theme.typography.phoneCaption, color: theme.colors.textMuted, margin: 0, textAlign: "center" }}>
            {COPY.questionInstruction}
          </p>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, width: "100%", maxWidth: 360 }}>
            <button
              type="button"
              className="game-btn-press game-option-btn"
              onClick={() => room.send("answer", { option: "A" })}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px 12px",
                minWidth: 80,
                flex: 1,
                maxWidth: 120,
                background: theme.colors.surface,
                border: `2px solid ${theme.colors.primary}`,
                borderRadius: theme.radiusCard,
                color: theme.colors.text,
                boxShadow: theme.shadows?.card ?? "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              <span style={{ fontSize: 28, marginBottom: 6, lineHeight: 1 }}>→</span>
              <span style={{ fontSize: theme.typography.phoneCaption, fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>
                {optionA}
              </span>
            </button>
            <p
              style={{
                flex: 1.2,
                fontSize: theme.typography.phoneBody,
                fontWeight: 700,
                margin: 0,
                color: theme.colors.text,
                textAlign: "center",
                lineHeight: 1.3,
                minWidth: 0,
              }}
            >
              {questionText}
            </p>
            <button
              type="button"
              className="game-btn-press game-option-btn"
              onClick={() => room.send("answer", { option: "B" })}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px 12px",
                minWidth: 80,
                flex: 1,
                maxWidth: 120,
                background: theme.colors.surface,
                border: `2px solid ${theme.colors.secondary}`,
                borderRadius: theme.radiusCard,
                color: theme.colors.text,
                boxShadow: theme.shadows?.card ?? "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              <span style={{ fontSize: 28, marginBottom: 6, lineHeight: 1 }}>←</span>
              <span style={{ fontSize: theme.typography.phoneCaption, fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>
                {optionB}
              </span>
            </button>
          </div>
        </div>
      </PlayerLayout>
    );
  }

  if (gameState === "BOOSTING") {
    return (
      <PlayerLayout stageTitle={COPY.stageTitle}>
        <div dir="rtl" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
          <p style={{ fontSize: theme.typography.phoneTitle, fontWeight: 800, margin: 0, color: theme.colors.accent }}>
            {COPY.syncBoost}
          </p>
        </div>
      </PlayerLayout>
    );
  }

  return (
    <PlayerLayout stageTitle={COPY.stageTitle} subtitle={COPY.stageSubtitle ?? ""}>
      <div dir="rtl" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 24, gap: 16 }}>
        <CompassRose
          allowedDirections={myAllowed}
          isLocked={isLocked}
          onMove={(dir) => room.send("move", { direction: dir })}
          lastWrongFor={payload.lastWrongFor ?? null}
          myRole="player2"
        />
        {infoBlock}
      </div>
    </PlayerLayout>
  );
}
