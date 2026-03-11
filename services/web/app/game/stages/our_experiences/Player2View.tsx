"use client";

import { useState } from "react";
import { parseStage6Payload } from "./types";
import { COPY, directionToCopy } from "./copy";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { PlayerLayout } from "../../shared/PlayerLayout";
import { MovementArrow } from "./MovementArrow";
import { StepHistoryModal } from "./StepHistoryModal";
import { FunFactCountdownView } from "./Player1View";
import type { SyncedGameState } from "../../types";
import type { QuestionnaireData } from "../../types";

const STEPS_NEEDED = 5;
const PLAYER_B_PATH = ["RIGHT", "DOWN", "LEFT", "DOWN", "RIGHT"];

interface Props {
  state: SyncedGameState;
  room: { send: (type: string, data?: unknown) => void };
  questionnaire: QuestionnaireData;
}

export function Player2View({ state, room, questionnaire }: Props) {
  const theme = useGameTheme();
  const payload = parseStage6Payload(state.stagePayloadJson);
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [showDigitScreenLocal, setShowDigitScreenLocal] = useState(false);

  const phase = payload.phase || "question";
  const steps = payload.playerBStepHistory || [];
  const currentStepIndex = steps.length;
  const currentDirection = steps.length >= 1 ? steps[steps.length - 1] : null;
  const completedSteps = currentStepIndex >= STEPS_NEEDED;
  const label = currentDirection ? directionToCopy(currentDirection) : "";
  const lastAnswerFalse = payload.lastAnswerFalse === true;
  const iAnswered = payload.player2AnswerCurrent != null;
  const partnerAnswered = payload.player1AnswerCurrent != null;
  const waitingForPartner = iAnswered && !partnerAnswered;
  const trueCount = payload.trueAnswersCount ?? 0;
  const showStepsButton = trueCount >= 1;

  if (phase === "guessNumber" || (phase === "readyToGuess" && showDigitScreenLocal)) {
    const feedback = state.player2Text || "";
    const isCorrect = payload.playerBCorrect === true;
    const showFeedback = feedback && (feedback === COPY.tryAgain || feedback.includes("מעולה"));
    return (
      <PlayerLayout stageTitle={COPY.title} subtitle={COPY.playerSubtitle}>
        <div dir="rtl" style={{ textAlign: "center", padding: "24px 0" }}>
          {phase === "readyToGuess" && (
            <button
              type="button"
              className="game-btn-press"
              onClick={() => setShowDigitScreenLocal(false)}
              style={{ marginBottom: 16, padding: "8px 16px", fontSize: theme.typography.phoneCaption, color: theme.colors.textMuted, background: "transparent", border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius }}
            >
              {COPY.back}
            </button>
          )}
          <p style={{ fontSize: theme.typography.phoneBody, color: theme.colors.textMuted, marginBottom: 16 }}>
            {COPY.guessPrompt}
          </p>
          {showFeedback && (
            <p
              style={{
                fontSize: theme.typography.phoneTitle,
                fontWeight: 700,
                color: isCorrect ? theme.colors.success : theme.colors.error,
                marginBottom: 20,
              }}
            >
              {feedback}
            </p>
          )}
          {!isCorrect && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, maxWidth: 240, margin: "0 auto 16px" }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="game-btn-press"
                    onClick={() => setSelectedNumber(n)}
                    style={{
                      padding: "16px",
                      fontSize: 24,
                      fontWeight: 700,
                      color: selectedNumber === n ? theme.colors.background : theme.colors.text,
                      background: selectedNumber === n ? theme.colors.primary : theme.colors.surface,
                      border: `2px solid ${theme.colors.border}`,
                      borderRadius: theme.radius,
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, maxWidth: 240, margin: "0 auto 24px" }}>
                <div />
                <button
                  type="button"
                  className="game-btn-press"
                  onClick={() => setSelectedNumber(0)}
                  style={{
                    padding: "16px",
                    fontSize: 24,
                    fontWeight: 700,
                    color: selectedNumber === 0 ? theme.colors.background : theme.colors.text,
                    background: selectedNumber === 0 ? theme.colors.primary : theme.colors.surface,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: theme.radius,
                  }}
                >
                  0
                </button>
                <div />
              </div>
              <button
                type="button"
                className="game-btn-press"
                disabled={selectedNumber === null}
                onClick={() => selectedNumber !== null && room.send("submitNumber", { number: selectedNumber })}
                style={{
                  padding: "14px 32px",
                  fontSize: theme.typography.phoneBody,
                  fontWeight: 700,
                  color: theme.colors.background,
                  background: theme.colors.primary,
                  border: "none",
                  borderRadius: theme.radius,
                  opacity: selectedNumber === null ? 0.6 : 1,
                }}
              >
                אשר
              </button>
            </>
          )}
        </div>
      </PlayerLayout>
    );
  }

  if (phase === "success") {
    return (
      <PlayerLayout>
        <div dir="rtl" style={{ textAlign: "center", padding: 24 }}>
          <p style={{ fontSize: theme.typography.phoneTitle, fontWeight: 700, color: theme.colors.accent }}>
            {COPY.successHeadline}
          </p>
        </div>
      </PlayerLayout>
    );
  }
  if (phase === "funFact") {
    return (
      <PlayerLayout>
        <FunFactCountdownView room={room} />
      </PlayerLayout>
    );
  }
  if (phase === "endGame") {
    return (
      <PlayerLayout>
        <div dir="rtl" style={{ textAlign: "center", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ borderRadius: theme.radiusCard, overflow: "hidden", marginBottom: 8 }}>
            <img src="/images/couple-placeholder.jpg" alt="" style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
          <p style={{ fontSize: theme.typography.phoneTitle, fontWeight: 700, color: theme.colors.accent, margin: "0 0 8px" }}>
            {COPY.congrats}
          </p>
          <p style={{ fontSize: theme.typography.phoneBody, color: theme.colors.text, margin: "0 0 24px" }}>
            {COPY.gameComplete}
          </p>
          <button type="button" className="game-btn-press" style={{ padding: "14px 24px", fontSize: 16, fontWeight: 700, color: theme.colors.background, background: theme.colors.primary, border: "none", borderRadius: theme.radius }}>
            {COPY.share}
          </button>
          <button type="button" className="game-btn-press" style={{ padding: "14px 24px", fontSize: 16, fontWeight: 700, color: theme.colors.text, background: theme.colors.surface, border: `2px solid ${theme.colors.border}`, borderRadius: theme.radius }}>
            {COPY.rate}
          </button>
          <button type="button" className="game-btn-press" onClick={() => room.send("gameComplete")} style={{ padding: "14px 24px", fontSize: 16, fontWeight: 700, color: theme.colors.background, background: theme.colors.secondary, border: "none", borderRadius: theme.radius }}>
            {COPY.thanks}
          </button>
        </div>
      </PlayerLayout>
    );
  }

  return (
    <PlayerLayout stageTitle={COPY.title} subtitle={COPY.playerSubtitle}>
      <div dir="rtl" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 24 }}>
        {steps.length === 0 && (
          <p style={{ fontSize: theme.typography.phoneBody, color: theme.colors.textMuted, marginBottom: 24, textAlign: "center" }}>
            {COPY.answerQuestionOnTV}
          </p>
        )}
        {!completedSteps && steps.length >= 1 && !lastAnswerFalse && currentDirection && (
          <MovementArrow
            direction={currentDirection}
            label={`צעד ${label}`}
            style={{ marginBottom: 24 }}
          />
        )}
        {!completedSteps && lastAnswerFalse && (
          <p style={{ fontSize: theme.typography.phoneTitle, fontWeight: 700, color: theme.colors.textMuted, marginBottom: 24 }}>
            {COPY.stayInPlace}
          </p>
        )}
        {completedSteps && (
          <p style={{ fontSize: theme.typography.phoneTitle, fontWeight: 700, color: theme.colors.success, marginBottom: 24 }}>
            {COPY.youCompletedSteps}
          </p>
        )}
        <div style={{ marginBottom: 24, width: "100%", maxWidth: 280 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            {Array.from({ length: STEPS_NEEDED }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 12,
                  borderRadius: 6,
                  background: i < currentStepIndex ? theme.colors.primary : theme.colors.border,
                }}
              />
            ))}
          </div>
          <p style={{ fontSize: theme.typography.phoneCaption, color: theme.colors.textMuted, margin: 0, textAlign: "center" }}>
            {currentStepIndex} / {STEPS_NEEDED} {COPY.stepsLabel}
          </p>
        </div>
        {phase === "question" && (
          <>
            {waitingForPartner ? (
              <p style={{ fontSize: theme.typography.phoneBody, color: theme.colors.textMuted, marginBottom: 16 }}>
                {COPY.waitingForPartnerAnswer}
              </p>
            ) : (
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <button
                  type="button"
                  className="game-btn-press"
                  onClick={() => room.send("answerTrue")}
                  style={{
                    flex: 1,
                    padding: "14px 20px",
                    fontSize: theme.typography.phoneBody,
                    fontWeight: 700,
                    color: theme.colors.background,
                    background: theme.colors.success,
                    border: "none",
                    borderRadius: theme.radius,
                  }}
                >
                  נכון
                </button>
                <button
                  type="button"
                  className="game-btn-press"
                  onClick={() => room.send("answerFalse")}
                  style={{
                    flex: 1,
                    padding: "14px 20px",
                    fontSize: theme.typography.phoneBody,
                    fontWeight: 700,
                    color: theme.colors.text,
                    background: theme.colors.surface,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: theme.radius,
                  }}
                >
                  לא נכון
                </button>
              </div>
            )}
          </>
        )}
        {showStepsButton && (
          <button
            type="button"
            className="game-btn-press"
            onClick={() => setShowStepsModal(true)}
            style={{
              marginTop: "auto",
              padding: "12px 24px",
              fontSize: theme.typography.phoneCaption,
              color: theme.colors.textMuted,
              background: "transparent",
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius,
            }}
          >
            {COPY.showMySteps}
          </button>
        )}
        {phase === "readyToGuess" && (
          <button
            type="button"
            className="game-btn-press"
            onClick={() => setShowDigitScreenLocal(true)}
            style={{
              marginTop: 12,
              padding: "14px 24px",
              fontSize: theme.typography.phoneBody,
              fontWeight: 700,
              color: theme.colors.background,
              background: theme.colors.primary,
              border: "none",
              borderRadius: theme.radius,
            }}
          >
            {COPY.readyToGuess}
          </button>
        )}
      </div>
      {showStepsModal && (
        <StepHistoryModal steps={steps} onClose={() => setShowStepsModal(false)} />
      )}
    </PlayerLayout>
  );
}
