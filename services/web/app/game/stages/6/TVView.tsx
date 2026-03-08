"use client";

import { useState, useEffect, useRef } from "react";
import { parseStage6Payload } from "./types";
import { COPY } from "./copy";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { TVLayout } from "../../shared/TVLayout";
import type { SyncedGameState } from "../../types";

const TRUE_ANIMATION_MS = 2500;
const SUCCESS_ANIMATION_MS = 4000;
const COUNTDOWN_SECONDS = 25;
const END_IMAGE_PATH = "/images/couple-placeholder.jpg";

interface TVViewProps {
  state: SyncedGameState;
  room: { send: (type: string, data?: unknown) => void };
}

export function TVView({ state, room }: TVViewProps) {
  const theme = useGameTheme();
  const payload = parseStage6Payload(state.stagePayloadJson);
  const [showTrueAnimation, setShowTrueAnimation] = useState(false);
  const [successPhase, setSuccessPhase] = useState<"collide" | "headline">("collide");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showEndImage, setShowEndImage] = useState(false);
  const lastTrueUntilRef = useRef(0);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phase = payload.phase || "question";
  const currentIndex = payload.currentQuestionIndex ?? 0;
  const trueCount = payload.trueAnswersCount ?? 0;
  const statement = state.tvText || "";
  const showFallback = Boolean(payload.fallbackRevealed);
  const lastTrueUntil = payload.lastTrueAnimationUntil ?? 0;

  // Show "נכון! המשיכו לזוז" for a few seconds then next question
  useEffect(() => {
    if (lastTrueUntil > Date.now() && lastTrueUntil !== lastTrueUntilRef.current) {
      lastTrueUntilRef.current = lastTrueUntil;
      setShowTrueAnimation(true);
      const t = setTimeout(() => {
        setShowTrueAnimation(false);
      }, TRUE_ANIMATION_MS);
      return () => clearTimeout(t);
    }
  }, [lastTrueUntil, payload.stagePayloadJson]);

  // Success: numbers animation then headline
  useEffect(() => {
    if (phase !== "success") return;
    setSuccessPhase("collide");
    const t = setTimeout(() => setSuccessPhase("headline"), SUCCESS_ANIMATION_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // Fun fact: 25s countdown (server sets phase to funFact after 6s from success)
  useEffect(() => {
    if (phase !== "funFact") {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setCountdown(null);
      return;
    }
    setCountdown(COUNTDOWN_SECONDS);
    let elapsed = 0;
    countdownIntervalRef.current = setInterval(() => {
      elapsed += 1;
      setCountdown(COUNTDOWN_SECONDS - elapsed);
      if (elapsed >= COUNTDOWN_SECONDS) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        room.send("funFactEnd");
      }
    }, 1000);
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [phase, room]);

  // End game: show image + confetti after countdown
  useEffect(() => {
    if (phase === "endGame") setShowEndImage(true);
  }, [phase]);

  // ---- End game screen ----
  if (phase === "endGame" && showEndImage) {
    const confettiColors = [theme.colors.primary, theme.colors.accent, theme.colors.success, theme.colors.secondary];
    return (
      <TVLayout stageNumber={6}>
        {/* Confetti overlay */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="game-confetti-piece"
              style={{
                left: `${(i * 7) % 100}%`,
                top: -10,
                background: confettiColors[i % confettiColors.length],
                borderRadius: i % 2 === 0 ? "50%" : 2,
                animationDelay: `${(i % 10) * 0.15}s`,
                animationDuration: `${2.5 + (i % 3) * 0.5}s`,
              }}
            />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: theme.colors.background,
            padding: 24,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "min(90vw, 500px)",
              borderRadius: theme.radiusCard,
              overflow: "hidden",
              boxShadow: theme.shadows.cardElevated,
            }}
          >
            <img
              src={END_IMAGE_PATH}
              alt=""
              style={{ width: "100%", height: "auto", display: "block" }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                padding: 24,
              }}
            >
              <p className="game-text-glow" style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: theme.colors.accent, margin: "0 0 8px" }}>
                {COPY.congrats}
              </p>
              <p style={{ fontSize: "clamp(18px, 2.5vw, 24px)", color: theme.colors.text, margin: "0 0 32px" }}>
                {COPY.gameComplete}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 280 }}>
                <button type="button" className="game-btn-press" style={{ padding: "14px 24px", fontSize: 18, fontWeight: 700, color: theme.colors.background, background: theme.colors.primary, border: "none", borderRadius: theme.radius }}>
                  {COPY.share}
                </button>
                <button type="button" className="game-btn-press" style={{ padding: "14px 24px", fontSize: 18, fontWeight: 700, color: theme.colors.text, background: theme.colors.surface, border: `2px solid ${theme.colors.border}`, borderRadius: theme.radius }}>
                  {COPY.rate}
                </button>
                <button
                  type="button"
                  className="game-btn-press"
                  onClick={() => room.send("gameComplete")}
                  style={{ padding: "14px 24px", fontSize: 18, fontWeight: 700, color: theme.colors.background, background: theme.colors.secondary, border: "none", borderRadius: theme.radius }}
                >
                  {COPY.thanks}
                </button>
              </div>
            </div>
          </div>
        </div>
      </TVLayout>
    );
  }

  // ---- Fun fact + countdown ----
  if (phase === "funFact") {
    return (
      <TVLayout stageNumber={6}>
        <div
          dir="rtl"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            background: `linear-gradient(145deg, ${theme.colors.surface} 0%, ${theme.colors.background} 100%)`,
          }}
        >
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: theme.colors.accent, margin: "0 0 24px" }}>
            {COPY.funFactTitle}
          </h2>
          <p style={{ fontSize: "clamp(18px, 2.5vw, 24px)", color: theme.colors.text, textAlign: "center", whiteSpace: "pre-line", margin: "0 0 32px", lineHeight: 1.6 }}>
            {COPY.funFactBody}
          </p>
          <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: theme.colors.textMuted, margin: "0 0 16px" }}>
            {COPY.funFactCta}
          </p>
          {countdown != null && (
            <p className="game-text-glow" style={{ fontSize: "clamp(64px, 12vw, 120px)", fontWeight: 800, color: theme.colors.primary, margin: 0 }}>
              {countdown}
            </p>
          )}
        </div>
      </TVLayout>
    );
  }

  // ---- Success: numbers fly + headline ----
  if (phase === "success") {
    return (
      <TVLayout stageNumber={6}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(145deg, ${theme.colors.surface} 0%, ${theme.colors.background} 100%)`,
          }}
        >
          {successPhase === "collide" && (
            <div
              dir="ltr"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "clamp(40px, 8vw, 80px)",
                fontSize: "clamp(72px, 15vw, 140px)",
                fontWeight: 800,
                color: theme.colors.accent,
              }}
            >
              <span className="game-step-enter" style={{ animationDelay: "0.2s" }}>2</span>
              <span className="game-step-enter" style={{ animationDelay: "0.4s" }}>5</span>
            </div>
          )}
          {successPhase === "headline" && (
            <p className="game-text-glow" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: theme.colors.accent, margin: 0, textAlign: "center" }}>
              {COPY.successHeadline}
            </p>
          )}
        </div>
      </TVLayout>
    );
  }

  // ---- Question phase: statement or "נכון!" or fallback ----
  const showCorrect = showTrueAnimation;
  const questionList = payload.questionList || [];
  const showFallbackMsg = showFallback && (currentIndex >= questionList.length || !statement);

  return (
    <TVLayout stageNumber={6}>
      <div
        dir="rtl"
        className="game-bg-animated"
        style={{
          position: "absolute",
          inset: -20,
          background: `linear-gradient(145deg, ${theme.colors.surface} 0%, ${theme.colors.background} 100%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(24px, 4vw, 48px)",
        }}
      >
        {showCorrect && (
          <p className="game-step-enter game-text-glow" style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, color: theme.colors.success, margin: 0 }}>
            {COPY.correctKeepGoing}
          </p>
        )}
        {!showCorrect && showFallbackMsg && (
          <p className="game-step-enter" style={{ fontSize: "clamp(20px, 3vw, 28px)", color: theme.colors.text, textAlign: "center", whiteSpace: "pre-line", margin: 0 }}>
            {COPY.fallbackMessage}
          </p>
        )}
        {!showCorrect && !showFallbackMsg && statement && (
          <>
            <h1
              className="game-step-enter"
              style={{
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 700,
                color: theme.colors.text,
                margin: "0 0 8px",
                textAlign: "center",
                maxWidth: "min(500px, 90vw)",
              }}
            >
              {statement}
            </h1>
            <p style={{ fontSize: "clamp(12px, 1.8vw, 16px)", color: theme.colors.textMuted, margin: "0 0 24px", opacity: 0.9 }}>
              {COPY.oneAnswersHint}
            </p>
            <p style={{ fontSize: "clamp(18px, 2.5vw, 24px)", color: theme.colors.textMuted, margin: 0 }}>
              {COPY.trueFalse}
            </p>
          </>
        )}
        <p
          style={{
            position: "absolute",
            bottom: "clamp(24px, 4vw, 48px)",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: theme.typography.tvCaption,
            color: theme.colors.textMuted,
            margin: 0,
          }}
        >
          {trueCount} / {5}
        </p>
      </div>
    </TVLayout>
  );
}
