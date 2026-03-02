"use client";

import { useMemo } from "react";
import type { SyncedGameState, QuestionnaireData } from "../../types";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { TVLayout } from "../../shared/TVLayout";
import { parseStage1Payload } from "./types";
import { COPY } from "./copy";

interface Props {
  state: SyncedGameState;
}

const BLUR_MAX = 6;

export function TVView({ state }: Props) {
  const theme = useGameTheme();
  const payload = parseStage1Payload(state.stagePayloadJson);
  const blurLevelRaw = typeof payload.blurLevel === "number" ? payload.blurLevel : BLUR_MAX;
  const blurLevel = Math.max(0, Math.min(BLUR_MAX, blurLevelRaw));
  const phase = (payload.phase || "questions") as typeof payload.phase;
  const isComplete = Boolean(payload.stageComplete);

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

  const headline = `${COPY.tvTitle} · ${questionnaire.partner1Name} & ${questionnaire.partner2Name}`;
  const questionText = payload.currentQuestion || "";
  const blurPx = 4 + (blurLevel / BLUR_MAX) * 18;
  const scale = 0.9 + (1 - blurLevel / BLUR_MAX) * 0.2;

  const statsText = useMemo(() => {
    const asked = payload.questionsAsked ?? 0;
    const matches = payload.totalMatches ?? 0;
    const safeAsked = asked || 1;
    return `${COPY.statsLabel}: ${matches}/${safeAsked} · ${COPY.blurLabel}: ${blurLevel}/${BLUR_MAX}`;
  }, [payload.questionsAsked, payload.totalMatches, blurLevel]);

  return (
    <TVLayout stageNumber={1} footer={!isComplete ? statsText : undefined}>
      {/* Blurred image background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 0,
        }}
      >
        <div
          className="game-map-breathe"
          style={{
            width: "min(50vw, 380px)",
            height: "min(50vw, 380px)",
            borderRadius: 24,
            overflow: "hidden",
            filter: `blur(${blurPx}px)`,
            transform: `scale(${scale})`,
            transition: "filter 0.6s ease, transform 0.6s ease",
            boxShadow: theme.shadows.card,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/stage1/he_said_she_said.png"
            alt=""
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      </div>

      {/* Content overlay */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "min(640px, 90vw)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: theme.typography.tvTitle,
            margin: 0,
            marginBottom: 8,
            color: theme.colors.text,
            fontWeight: 800,
          }}
        >
          {headline}
        </h1>
        {!isComplete && (
          <p
            style={{
              fontSize: theme.typography.tvBody,
              margin: 0,
              marginBottom: 16,
              color: theme.colors.textMuted,
            }}
          >
            {COPY.tvSubtitle}
          </p>
        )}

        {!isComplete && phase === "questions" && questionText && (
          <p
            className="game-step-enter"
            style={{
              fontSize: "clamp(20px, 3vw, 28px)",
              fontWeight: 700,
              marginTop: 8,
              color: theme.colors.text,
            }}
          >
            {questionText}
          </p>
        )}

        {!isComplete && phase === "finalPrompt" && (
          <p
            className="game-step-enter"
            style={{
              fontSize: theme.typography.tvBody,
              fontWeight: 600,
              marginTop: 12,
              color: theme.colors.text,
            }}
          >
            {COPY.tvFinalPrompt}
          </p>
        )}

        {isComplete && (
          <div className="game-step-enter" style={{ marginTop: 16 }}>
            <p
              className="game-text-glow"
              style={{
                fontSize: "clamp(32px, 5vw, 48px)",
                fontWeight: 800,
                margin: 0,
                marginBottom: 8,
                color: payload.win ? theme.colors.accent : theme.colors.text,
              }}
            >
              {payload.win ? COPY.tvResultsWin : COPY.tvResultsLose}
            </p>
            <p
              style={{
                fontSize: theme.typography.tvBody,
                margin: 0,
                color: theme.colors.textMuted,
              }}
            >
              {statsText}
            </p>
          </div>
        )}
      </div>
    </TVLayout>
  );
}
