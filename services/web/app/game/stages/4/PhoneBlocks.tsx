"use client";

import { Button } from "../../shared/Button";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { COPY } from "./copy";
import type { Stage4Payload } from "./types";

const responsive = {
  icon: "clamp(24px, 6vw, 32px)",
  title: "clamp(17px, 4.5vw, 22px)",
  sub: "clamp(14px, 3.5vw, 16px)",
  body: "clamp(14px, 3.5vw, 17px)",
};

/** Role card with game-like typography hierarchy */
export function RoleDescriber() {
  const theme = useGameTheme();
  return (
    <div dir="rtl" className="game-step-enter" style={{ textAlign: "center", padding: "clamp(16px, 4vw, 24px) 0" }}>
      <span style={{ fontSize: responsive.icon, display: "block", marginBottom: 12 }}>👀</span>
      <p style={{ fontSize: responsive.title, fontWeight: 700, margin: 0, color: theme.colors.text }}>{COPY.roleDescriberTitle}</p>
      <p style={{ fontSize: responsive.sub, color: theme.colors.textMuted, marginTop: 8 }}>{COPY.roleDescriberSub}</p>
    </div>
  );
}

export function RoleGuesser() {
  const theme = useGameTheme();
  return (
    <div dir="rtl" className="game-step-enter" style={{ textAlign: "center", padding: "clamp(16px, 4vw, 24px) 0" }}>
      <span style={{ fontSize: responsive.icon, display: "block", marginBottom: 12 }}>🤔</span>
      <p style={{ fontSize: responsive.title, fontWeight: 700, margin: 0, color: theme.colors.text }}>{COPY.roleGuesserTitle}</p>
    </div>
  );
}

/**
 * Answering block: each question is a "level" card with step indicator.
 * Options use game-option-btn for hover lift; selected option gets selection pulse.
 */
export function AnsweringBlock({
  payload,
  answers,
  setAnswers,
  onSubmit,
}: {
  payload: Stage4Payload;
  answers: number[];
  setAnswers: (a: number[]) => void;
  onSubmit: () => void;
}) {
  const theme = useGameTheme();
  const questions = payload.questions || [];
  const word = payload.word || "";

  return (
    <div dir="rtl">
      {/* Secret word – emphasized like a game objective */}
      <p
        className="game-step-enter"
        style={{
          fontSize: responsive.title,
          fontWeight: 800,
          marginBottom: 20,
          color: theme.colors.secondary,
          textAlign: "center",
          textShadow: `0 0 20px ${theme.colors.primaryGlow}`,
        }}
      >
        {word}
      </p>
      {questions.slice(0, 4).map((q, i) => {
        const selectedIndex = answers[i];
        return (
          <div
            key={i}
            className={`game-step-enter game-step-enter-delay-${(i % 4) + 1}`}
            style={{
              marginBottom: 20,
              padding: theme.spacing.md,
              borderRadius: theme.radiusCard ?? 16,
              background: theme.colors.surface,
              boxShadow: theme.shadows.card,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            {/* Step indicator – game-like "Level 1/4" */}
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: theme.colors.textMuted,
                marginBottom: 8,
                letterSpacing: "0.05em",
              }}
            >
              {i + 1} / 4
            </p>
            <p style={{ fontSize: responsive.sub, marginBottom: 10, color: theme.colors.text, fontWeight: 600 }}>
              {q.question}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(q.options || []).map((opt, j) => {
                const selected = selectedIndex === j;
                return (
                  <button
                    key={j}
                    type="button"
                    className={`game-option-btn ${selected ? "game-selection-pulse" : ""}`}
                    onClick={() => {
                      const next = [...answers];
                      next[i] = j;
                      setAnswers(next);
                    }}
                    style={{
                      padding: "14px 16px",
                      minHeight: 48,
                      borderRadius: theme.radius,
                      border: `2px solid ${selected ? theme.colors.primary : theme.colors.border}`,
                      background: selected
                        ? `linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(236, 72, 153, 0.1) 100%)`
                        : theme.colors.surfaceElevated ?? theme.colors.surface,
                      color: theme.colors.text,
                      fontSize: responsive.body,
                      textAlign: "left",
                      cursor: "pointer",
                      fontFamily: theme.fontFamily,
                      fontWeight: 500,
                      boxShadow: selected ? theme.shadows.primaryGlow : "0 2px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="game-step-enter game-step-enter-delay-4" style={{ marginTop: 24 }}>
        <Button onClick={onSubmit} style={{ width: "100%", padding: "16px", minHeight: 52 }}>
          {COPY.answeringDone}
        </Button>
      </div>
    </div>
  );
}

/**
 * Guessing block: partner answers as chips; word options as game-style choice buttons.
 */
export function GuessingBlock({
  payload,
  onSubmit,
}: {
  payload: Stage4Payload;
  onSubmit: (wordIndex: number) => void;
}) {
  const theme = useGameTheme();
  const texts = payload.describerAnswerTexts || [];
  const options = payload.wordOptions || [];

  return (
    <div dir="rtl">
      <p
        className="game-step-enter"
        style={{ fontSize: responsive.sub, marginBottom: 12, color: theme.colors.textMuted, fontWeight: 600 }}
      >
        {COPY.guessingTitle}
      </p>
      <div
        className="game-step-enter game-step-enter-delay-1"
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}
      >
        {texts.map((t, i) => (
          <span
            key={i}
            style={{
              padding: "10px 16px",
              borderRadius: 20,
              background: `linear-gradient(135deg, ${theme.colors.surfaceElevated ?? theme.colors.surface} 0%, ${theme.colors.surface} 100%)`,
              border: `1px solid ${theme.colors.border}`,
              fontSize: responsive.sub,
              color: theme.colors.text,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {t || "—"}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((opt, i) => (
          <Button
            key={i}
            variant="secondary"
            className="game-btn-press game-option-btn"
            onClick={() => onSubmit(i)}
            style={{
              width: "100%",
              padding: "16px",
              minHeight: 52,
              fontSize: responsive.body,
              fontWeight: 600,
            }}
          >
            {opt}
          </Button>
        ))}
      </div>
    </div>
  );
}

/** Result block: success/error with clear game-like feedback */
export function ResultBlockPhone({ payload, onNext }: { payload: Stage4Payload; onNext: () => void }) {
  const theme = useGameTheme();
  const correct = payload.result === "correct";
  return (
    <div dir="rtl" className="game-step-enter" style={{ textAlign: "center", padding: "clamp(16px, 4vw, 24px) 0" }}>
      <p
        style={{
          fontSize: responsive.title,
          fontWeight: 700,
          marginBottom: 24,
          color: correct ? theme.colors.success : theme.colors.error,
          textShadow: correct ? `0 0 20px ${theme.colors.successGlow}` : "0 0 12px rgba(252, 165, 165, 0.3)",
        }}
      >
        {correct ? COPY.feedbackSuccess : COPY.feedbackFail}
      </p>
      <Button onClick={onNext} style={{ minHeight: 52 }}>
        {COPY.nextTurn}
      </Button>
    </div>
  );
}
