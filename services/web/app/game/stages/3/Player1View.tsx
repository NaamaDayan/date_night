"use client";

import type { SyncedGameState, QuestionnaireData } from "../../types";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { Button } from "../../shared/Button";
import { parseStage3Payload } from "./types";
import { COPY } from "./copy";

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

interface Props {
  state: SyncedGameState;
  room: { send: (type: string, data?: unknown) => void };
  questionnaire: QuestionnaireData;
}

export function Player1View({ state, room, questionnaire }: Props) {
  const theme = useGameTheme();
  const payload = parseStage3Payload(state.stagePayloadJson);
  const status = payload.status || "intro";
  const myAnswered = Boolean(payload.p1Answered);
  const currentPrompt = payload.currentPrompt;
  const options = currentPrompt?.options || [];
  const mutualCount = payload.mutualCount ?? 0;

  const handleChoice = (choiceId: string) => {
    room.send("answer", { choiceId });
  };

  const handleNext = () => {
    room.send("next");
  };

  const handleContinue = () => {
    room.send("continue");
  };

  // —— Asking (or intro → treated same as asking): show question + 2 options ——
  if (status === "asking" || status === "intro") {
    return (
      <div dir="rtl" style={phoneContainerStyle}>
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: theme.colors.textMuted, margin: 0 }}>
            {COPY.phoneQuestionIntro} ({mutualCount}/5 משותפים)
          </p>
          <p style={{ fontSize: 18, fontWeight: 700, margin: 8, color: theme.colors.text }}>
            {currentPrompt?.question || ""}
          </p>
        </div>

        {!myAnswered ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {options.map((opt) => (
              <Button
                key={opt.id}
                onClick={() => handleChoice(opt.id)}
                style={{ width: "100%", minHeight: 48 }}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 15, color: theme.colors.textMuted, textAlign: "center", marginTop: 16 }}>
            {COPY.phoneWaiting}
          </p>
        )}
      </div>
    );
  }

  // —— Reveal: show reaction + Next ——
  if (status === "reveal") {
    return (
      <div dir="rtl" style={phoneContainerStyle}>
        <p
          style={{
            fontSize: 18,
            fontWeight: 700,
            textAlign: "center",
            marginBottom: 16,
            color: theme.colors.accent,
          }}
        >
          {payload.tvReaction || COPY.tvRevealMatch}
        </p>
        <p style={{ fontSize: 14, color: theme.colors.textMuted, textAlign: "center", marginBottom: 24 }}>
          {mutualCount} / 5 משותפים
        </p>
        <Button onClick={handleNext} style={{ width: "100%", minHeight: 48 }}>
          {COPY.phoneNext}
        </Button>
      </div>
    );
  }

  // —— Generating: wait ——
  if (status === "generating") {
    return (
      <div dir="rtl" style={phoneContainerStyle}>
        <p style={{ fontSize: 18, fontWeight: 600, textAlign: "center", color: theme.colors.text }}>
          {COPY.tvGenerating}
        </p>
      </div>
    );
  }

  // —— Show result: Continue ——
  if (status === "showResult") {
    return (
      <div dir="rtl" style={phoneContainerStyle}>
        <p style={{ fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 16, color: theme.colors.text }}>
          {COPY.phoneResultTitle}
        </p>
        <Button onClick={handleContinue} style={{ width: "100%", minHeight: 48 }}>
          {COPY.phoneContinue}
        </Button>
      </div>
    );
  }

  return (
    <div dir="rtl" style={phoneContainerStyle}>
      <p style={{ color: theme.colors.textMuted }}>{state.player1Text || COPY.phoneIntroTitle}</p>
    </div>
  );
}
