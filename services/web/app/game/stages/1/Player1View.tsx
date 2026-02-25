"use client";

import { useMemo, useState } from "react";
import type { SyncedGameState, QuestionnaireData } from "../../types";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { Button } from "../../shared/Button";
import { Input } from "../../shared/Input";
import { COPY } from "./copy";
import { parseStage1Payload } from "./types";
import { GuessModal } from "./GuessModal";
import { GuessToast } from "./GuessToast";

interface Props {
  state: SyncedGameState;
  room: { send: (type: string, data?: unknown) => void };
  questionnaire: QuestionnaireData;
}

const phoneContainerStyle: React.CSSProperties = {
  maxWidth: "min(420px, 100vw)",
  width: "100%",
  margin: "0 auto",
  paddingBottom: 80,
  paddingLeft: "max(12px, env(safe-area-inset-left))",
  paddingRight: "max(12px, env(safe-area-inset-right))",
  paddingTop: "max(12px, env(safe-area-inset-top))",
  boxSizing: "border-box",
};

export function Player1View({ state, room, questionnaire }: Props) {
  const theme = useGameTheme();
  const payload = parseStage1Payload(state.stagePayloadJson);
  const phase = payload.phase || "questions";
  const isComplete = Boolean(payload.stageComplete);
  const [guessModalOpen, setGuessModalOpen] = useState(false);
  const [wrongToastDismissed, setWrongToastDismissed] = useState(false);
  const [finalValue, setFinalValue] = useState("");

  const showWrongToast = Boolean(payload.lastGuessWrong) && !wrongToastDismissed;
  const showCorrectToast = Boolean(payload.win && payload.stageComplete);

  const partnerName = useMemo(() => {
    // Player 1's partner is partner2
    return questionnaire?.partner2Name || "בן / בת הזוג";
  }, [questionnaire]);

  const questionText = payload.currentQuestion || "";
  const myAnswered = Boolean(payload.p1Answered);

  const handleAnswer = (choice: "me" | "partner") => {
    room.send("answer", { choice });
  };

  const handleGuessSubmit = (text: string) => {
    room.send("imageGuess", { text });
    setWrongToastDismissed(false);
  };

  const handleFinalSubmit = () => {
    const t = finalValue.trim();
    if (!t) return;
    room.send("imageGuess", { text: t });
    setFinalValue("");
    setWrongToastDismissed(false);
  };

  const matches = payload.totalMatches ?? 0;
  const asked = payload.questionsAsked ?? 0;
  const safeAsked = asked || 1;

  return (
    <div dir="rtl" style={phoneContainerStyle}>
      <div
        className="game-step-enter"
        style={{ marginBottom: 16, textAlign: "center" }}
      >
        <p
          style={{
            fontSize: 18,
            fontWeight: 700,
            margin: 0,
            marginBottom: 4,
            color: theme.colors.text,
          }}
        >
          {COPY.phoneStageTitle}
        </p>
        <p
          style={{
            fontSize: 14,
            margin: 0,
            color: theme.colors.textMuted,
          }}
        >
          {COPY.phoneQuestionIntro}
        </p>
      </div>

      {!isComplete && phase === "questions" && (
        <div key={payload.currentQuestionIndex ?? 0} className="game-step-enter" style={{ marginBottom: 24 }}>
          {payload.lastPairMatched !== null && payload.lastPairMatched !== undefined && (
            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 12,
                textAlign: "center",
                color: payload.lastPairMatched ? theme.colors.success : theme.colors.error,
              }}
            >
              {payload.lastPairMatched ? "תואם! התמונה נחשפת 💛" : "לא תואם… הטשטוש גדל"}
            </p>
          )}
          <p
            style={{
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 20,
              color: theme.colors.text,
              textAlign: "center",
            }}
          >
            {questionText}
          </p>
          {!myAnswered ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Button
                onClick={() => handleAnswer("me")}
                style={{ width: "100%", minHeight: 48 }}
              >
                {COPY.meOption}
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleAnswer("partner")}
                style={{ width: "100%", minHeight: 48 }}
              >
                {partnerName}
              </Button>
            </div>
          ) : (
            <p style={{ fontSize: 15, color: theme.colors.textMuted, textAlign: "center", marginTop: 8 }}>
              ממתינים לבן/בת הזוג…
            </p>
          )}
        </div>
      )}

      {!isComplete && phase === "finalPrompt" && (
        <div className="game-step-enter" style={{ marginTop: 12 }}>
          <p
            style={{
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 8,
              color: theme.colors.text,
              textAlign: "center",
            }}
          >
            {COPY.finalPromptTitle}
          </p>
          <p
            style={{
              fontSize: 14,
              marginBottom: 16,
              color: theme.colors.textMuted,
              textAlign: "center",
            }}
          >
            {COPY.finalPromptSub}
          </p>
          <Input
            placeholder={COPY.finalPromptPlaceholder}
            value={finalValue}
            onChange={(e) => setFinalValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFinalSubmit()}
            style={{ width: "100%", marginBottom: 16, minHeight: 44 }}
          />
          <Button
            onClick={handleFinalSubmit}
            style={{ width: "100%", minHeight: 48 }}
          >
            {COPY.finalPromptSubmit}
          </Button>
        </div>
      )}

      {isComplete && (
        <div className="game-step-enter" style={{ marginTop: 12 }}>
          <p
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 8,
              color: payload.win ? theme.colors.success : theme.colors.text,
              textAlign: "center",
            }}
          >
            {payload.win ? COPY.resultsTitleWin : COPY.resultsTitleLose}
          </p>
          <p
            style={{
              fontSize: 14,
              marginBottom: 16,
              color: theme.colors.textMuted,
              textAlign: "center",
            }}
          >
            {`${COPY.matchesLabel}: ${matches}/${safeAsked} · ${COPY.blurLabel}: ${payload.blurLevel ?? 0}`}
          </p>
          <p
            style={{
              fontSize: 14,
              marginBottom: 24,
              color: theme.colors.textMuted,
              textAlign: "center",
            }}
          >
            {payload.win && payload.winnerName
              ? COPY.resultsWhoGuessed(payload.winnerName)
              : COPY.resultsNoWinner}
          </p>
          <Button
            onClick={() => room.send("continue")}
            style={{ width: "100%", minHeight: 48 }}
          >
            {COPY.continueButton}
          </Button>
        </div>
      )}

      {/* Floating guess button – available at all times before completion */}
      {!isComplete && (
        <button
          type="button"
          onClick={() => {
            setGuessModalOpen(true);
            setWrongToastDismissed(false);
          }}
          className="game-btn-press"
          style={{
            position: "fixed",
            bottom: "max(16px, env(safe-area-inset-bottom))",
            right: "max(16px, env(safe-area-inset-right))",
            padding: "12px 18px",
            minHeight: 44,
            fontSize: "clamp(13px, 3.5vw, 15px)",
            borderRadius: 22,
            border: `2px solid ${theme.colors.border}`,
            background: theme.colors.surface,
            color: theme.colors.text,
            cursor: "pointer",
            boxShadow: theme.shadows?.card,
          }}
        >
          {COPY.guessButton}
        </button>
      )}

      <GuessToast
        showWrong={showWrongToast}
        showCorrect={showCorrectToast}
        onDismissWrong={() => setWrongToastDismissed(true)}
      />

      <GuessModal
        open={guessModalOpen}
        onClose={() => setGuessModalOpen(false)}
        onSubmit={handleGuessSubmit}
      />
    </div>
  );
}

