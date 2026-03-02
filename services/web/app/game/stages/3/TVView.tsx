"use client";

import { parseStage3Payload } from "./types";
import { COPY } from "./copy";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { TVLayout } from "../../shared/TVLayout";
import type { SyncedGameState } from "../../types";

interface Props {
  state: SyncedGameState;
}

export function TVView({ state }: Props) {
  const theme = useGameTheme();
  const payload = parseStage3Payload(state.stagePayloadJson);
  const status = payload.status || "intro";

  const headlineStyle = {
    fontSize: theme.typography.tvTitle,
    fontWeight: 800 as const,
    color: theme.colors.text,
    margin: 0,
    marginBottom: 8,
    lineHeight: 1.3,
  };

  const subtextStyle = {
    fontSize: theme.typography.tvBody,
    color: theme.colors.textMuted,
    margin: 0,
    maxWidth: "min(480px, 90vw)",
  };

  if (status === "showResult") {
    const imageUrl = payload.finalVisionBoardImageUrl;
    const error = payload.generationError;
    const mutualPicks = payload.mutualPicks || [];

    return (
      <TVLayout stageNumber={3}>
        <div
          dir="rtl"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <h1 style={headlineStyle}>{COPY.tvShowResultTitle}</h1>

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
              className="game-card"
              style={{
                marginTop: 24,
                padding: 24,
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
      </TVLayout>
    );
  }

  return (
    <TVLayout stageNumber={3}>
      <div dir="rtl" style={{ textAlign: "center" }}>
        {(status === "asking" || status === "intro") && (
          <>
            <h1 style={headlineStyle}>{COPY.tvTitle}</h1>
            <p style={{ ...subtextStyle, marginTop: 16, fontWeight: 600, color: theme.colors.text }}>
              {payload.currentPrompt?.question || ""}
            </p>
            <p style={{ ...subtextStyle, marginTop: 8 }}>בחרו בתשובה בטלפון</p>
          </>
        )}

        {status === "reveal" && (
          <>
            <p
              className="game-text-glow"
              style={{
                fontSize: "clamp(24px, 4vw, 40px)",
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
          </>
        )}

        {status === "generating" && (
          <p
            className="game-text-glow"
            style={{
              fontSize: "clamp(22px, 3.5vw, 36px)",
              fontWeight: 700,
              color: theme.colors.accent,
              margin: 0,
            }}
          >
            {COPY.tvGenerating}
          </p>
        )}

        {!["asking", "intro", "reveal", "generating", "showResult"].includes(status) && (
          <h1 style={headlineStyle}>{COPY.tvTitle}</h1>
        )}
      </div>
    </TVLayout>
  );
}
