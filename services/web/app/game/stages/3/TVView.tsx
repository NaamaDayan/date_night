"use client";

import { useMemo } from "react";
import { parseStage3Payload } from "./types";
import { COPY } from "./copy";
import { useGameTheme } from "../../shared/GameThemeProvider";
import type { SyncedGameState } from "../../types";

interface Props {
  state: SyncedGameState;
}

const containerStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
  boxSizing: "border-box",
  padding: "clamp(16px, 3vw, 32px)",
  textAlign: "center",
};

export function TVView({ state }: Props) {
  const theme = useGameTheme();
  const payload = parseStage3Payload(state.stagePayloadJson);
  const status = payload.status || "intro";

  const headlineStyle = useMemo(
    () => ({
      fontSize: "clamp(22px, 4vw, 42px)",
      fontWeight: 800,
      color: theme.colors.text,
      margin: 0,
      marginBottom: 8,
      lineHeight: 1.3,
    }),
    [theme.colors.text]
  );

  const subtextStyle = useMemo(
    () => ({
      fontSize: "clamp(14px, 2.5vw, 20px)",
      color: theme.colors.textMuted,
      margin: 0,
      maxWidth: "min(480px, 90vw)",
    }),
    [theme.colors.textMuted]
  );

  // —— Asking (or intro → treated same): show current question ——
  if (status === "asking" || status === "intro") {
    const question = payload.currentPrompt?.question || "";
    return (
      <div dir="rtl" style={containerStyle}>
        <h1 style={headlineStyle}>🌟 {COPY.tvTitle}</h1>
        <p style={{ ...subtextStyle, marginTop: 16, fontWeight: 600, color: theme.colors.text }}>
          {question}
        </p>
        <p style={{ ...subtextStyle, marginTop: 8 }}>בחרו בתשובה בטלפון</p>
      </div>
    );
  }

  // —— Reveal: show TV reaction ——
  if (status === "reveal") {
    return (
      <div dir="rtl" style={containerStyle}>
        <p
          className="game-text-glow"
          style={{
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 700,
            color: theme.colors.accent,
            margin: 0,
          }}
        >
          {payload.tvReaction || COPY.tvRevealMatch}
        </p>
        <p style={{ ...subtextStyle, marginTop: 16 }}>
          {payload.mutualCount ?? 0} / 5 משותפים
        </p>
      </div>
    );
  }

  // —— Generating ——
  if (status === "generating") {
    return (
      <div dir="rtl" style={containerStyle}>
        <p
          className="game-text-glow"
          style={{
            fontSize: "clamp(22px, 3.5vw, 32px)",
            fontWeight: 700,
            color: theme.colors.accent,
            margin: 0,
          }}
        >
          {COPY.tvGenerating}
        </p>
      </div>
    );
  }

  // —— Show result: image or text fallback ——
  if (status === "showResult") {
    const imageUrl = payload.finalVisionBoardImageUrl;
    const error = payload.generationError;
    const mutualPicks = payload.mutualPicks || [];

    return (
      <div dir="rtl" style={{ ...containerStyle, justifyContent: "flex-start", paddingTop: 24 }}>
        <h1 style={headlineStyle}>🌟 {COPY.tvShowResultTitle}</h1>

        {imageUrl && !error ? (
          <div
            style={{
              width: "min(90vw, 960px)",
              maxWidth: "100%",
              marginTop: 16,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: theme.shadows?.card || "0 4px 24px rgba(0,0,0,0.15)",
            }}
          >
            <img
              src={
                typeof window !== "undefined" && process.env.NEXT_PUBLIC_COLYSEUS_URL
                  ? `${process.env.NEXT_PUBLIC_COLYSEUS_URL.replace(/\/$/, "")}${imageUrl}`
                  : imageUrl
              }
              alt="Your Vision Board"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                aspectRatio: "16/9",
                objectFit: "cover",
              }}
            />
          </div>
        ) : (
          <div
            style={{
              marginTop: 24,
              padding: 24,
              background: theme.colors.surface,
              borderRadius: 16,
              maxWidth: "min(480px, 90vw)",
            }}
          >
            <p style={{ ...subtextStyle, marginBottom: 12 }}>{COPY.tvFallbackNoImage}</p>
            <ul style={{ margin: 0, paddingRight: 20, textAlign: "right" }}>
              {mutualPicks.map((p) => (
                <li key={p.id} style={{ marginBottom: 4, color: theme.colors.text }}>
                  {p.label}
                </li>
              ))}
            </ul>
            {error && (
              <p style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 12 }}>{error}</p>
            )}
          </div>
        )}

        <p style={{ ...subtextStyle, marginTop: 24 }}>{COPY.tvShowResultContinue}</p>
      </div>
    );
  }

  return (
    <div dir="rtl" style={containerStyle}>
      <h1 style={headlineStyle}>🌟 {COPY.tvTitle}</h1>
    </div>
  );
}
