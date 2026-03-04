"use client";

import type { SyncedGameState, QuestionnaireData } from "../../types";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { PlayerLayout } from "../../shared/PlayerLayout";
import { Button } from "../../shared/Button";
import { parseStage3Payload } from "./types";
import { COPY } from "./copy";

interface Props {
  state: SyncedGameState;
  room: { send: (type: string, data?: unknown) => void };
  questionnaire: QuestionnaireData;
}

export function Player2View({ state, room }: Props) {
  const theme = useGameTheme();
  const payload = parseStage3Payload(state.stagePayloadJson);
  const status = payload.status || "intro";
  const myAnswered = Boolean(payload.p2Answered);
  const currentPrompt = payload.currentPrompt;
  const options = currentPrompt?.options || [];
  const mutualCount = payload.mutualCount ?? 0;

  const handleChoice = (choiceId: string) => {
    room.send("answer", { choiceId });
  };

  return (
    <PlayerLayout
      stageTitle={COPY.phoneIntroTitle}
      subtitle={
        status === "asking" || status === "intro"
          ? `${COPY.phoneQuestionIntro} (${mutualCount}/5 משותפים)`
          : undefined
      }
    >
      {(status === "asking" || status === "intro") && (
        <div className="game-step-enter">
          <p
            style={{
              fontSize: theme.typography.phoneTitle,
              fontWeight: 700,
              margin: "8px 0 20px",
              color: theme.colors.text,
              textAlign: "center",
            }}
          >
            {currentPrompt?.question || ""}
          </p>

          {!myAnswered ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {options.map((opt) => (
                <Button
                  key={opt.id}
                  onClick={() => handleChoice(opt.id)}
                  style={{ width: "100%", minHeight: 52 }}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          ) : (
            <p
              style={{
                fontSize: theme.typography.phoneCaption,
                color: theme.colors.textMuted,
                textAlign: "center",
                marginTop: 16,
              }}
            >
              {COPY.phoneWaiting}
            </p>
          )}
        </div>
      )}

      {status === "reveal" && (
        <div className="game-step-enter" style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: theme.typography.phoneTitle,
              fontWeight: 700,
              marginBottom: 16,
              color: theme.colors.accent,
            }}
          >
            {payload.tvReaction || COPY.tvRevealMatch}
          </p>
          <p
            style={{
              fontSize: theme.typography.phoneCaption,
              color: theme.colors.textMuted,
              marginBottom: 24,
            }}
          >
            {mutualCount} / 5 משותפים
          </p>
          <Button
            onClick={() => room.send("next")}
            style={{ width: "100%", minHeight: 52 }}
          >
            {COPY.phoneNext}
          </Button>
        </div>
      )}

      {status === "generating" && (
        <div
          className="game-step-enter"
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "40dvh",
          }}
        >
          <p
            style={{
              fontSize: theme.typography.phoneTitle,
              fontWeight: 600,
              color: theme.colors.text,
            }}
          >
            {COPY.tvGenerating}
          </p>
          <div
            className="game-dots-loading"
            style={{ marginTop: 16, fontSize: 18, color: theme.colors.textMuted }}
          >
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>
        </div>
      )}

      {status === "showResult" && (
        <div className="game-step-enter" style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "clamp(18px, 5vw, 22px)",
              fontWeight: 700,
              marginBottom: 16,
              color: theme.colors.text,
            }}
          >
            {COPY.phoneResultTitle}
          </p>
          <Button
            onClick={() => room.send("continue")}
            style={{ width: "100%", minHeight: 52 }}
          >
            {COPY.phoneContinue}
          </Button>
        </div>
      )}

      {!["asking", "intro", "reveal", "generating", "showResult"].includes(status) && (
        <p style={{ color: theme.colors.textMuted }}>
          {state.player2Text || COPY.phoneIntroTitle}
        </p>
      )}
    </PlayerLayout>
  );
}
