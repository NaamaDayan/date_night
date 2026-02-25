"use client";

import { useState, useEffect, useRef } from "react";
import { parseStage4Payload } from "./types";
import { COPY } from "./copy";
import { useGameTheme } from "../../shared/GameThemeProvider";
import type { SyncedGameState } from "../../types";

const ZOOM_MAX = 6;
const INTRO_DURATION_MS = 5000;
const DISCOVERY_DURATION_MS = 2800;
const ROLE_SWAP_DURATION_MS = 1500;

interface TVViewProps {
  state: SyncedGameState;
}

/**
 * TV tells the story: intro → discovery → play (zoom map) → feedback → role swap → final reveal.
 * No game logic changes; all flow is client-side + existing payload.
 */
export function TVView({ state }: TVViewProps) {
  const theme = useGameTheme();
  const payload = parseStage4Payload(state.stagePayloadJson);
  const zoomLevel = Math.max(0, Math.min(ZOOM_MAX, payload.zoomLevel ?? 0));
  const phase = payload.phase || "describe";
  const result = payload.result;
  const subRound = payload.subRoundIndex ?? 0;
  const isComplete = Boolean(payload.stageComplete || payload.locationCorrect);

  const [introDone, setIntroDone] = useState(false);
  const [discoveryDone, setDiscoveryDone] = useState(false);
  const [showRoleSwap, setShowRoleSwap] = useState(false);
  const prevSubRoundRef = useRef(subRound);
  const scale = 0.25 + (zoomLevel / ZOOM_MAX) * 0.75;
  const breakout = theme.spacing.md;

  // Intro: auto-advance (TV is view-only, no buttons)
  useEffect(() => {
    if (introDone) return;
    const t = setTimeout(() => setIntroDone(true), INTRO_DURATION_MS);
    return () => clearTimeout(t);
  }, [introDone]);

  // Discovery: auto-advance after delay
  useEffect(() => {
    if (!introDone || discoveryDone) return;
    const t = setTimeout(() => setDiscoveryDone(true), DISCOVERY_DURATION_MS);
    return () => clearTimeout(t);
  }, [introDone, discoveryDone]);

  // Role swap: show when subRound increases (new turn)
  useEffect(() => {
    if (subRound > prevSubRoundRef.current && phase === "describe") {
      setShowRoleSwap(true);
      const t = setTimeout(() => setShowRoleSwap(false), ROLE_SWAP_DURATION_MS);
      prevSubRoundRef.current = subRound;
      return () => clearTimeout(t);
    }
    prevSubRoundRef.current = subRound;
  }, [subRound, phase]);

  // —— Screen 0: Intro (view-only, auto-advances) ——
  if (!introDone) {
    return (
      <div dir="rtl" style={{ ...mapContainerStyle, margin: -breakout, width: `calc(100% + ${2 * breakout}px)`, minHeight: "100dvh" }}>
        <div className="game-bg-animated" style={{ ...mapBlurStyle(theme), filter: "blur(8px)", transform: "scale(0.4)", background: mapGradient(theme) }} />
        <div style={overlayContentStyle}>
          <h1 style={{ ...headlineStyle(theme) }}>{COPY.introHeadline}</h1>
          <p style={{ ...subtextStyle(theme) }}>{COPY.introSubtext}</p>
        </div>
      </div>
    );
  }

  // —— Screen 1: Discovery ——
  if (!discoveryDone) {
    return (
      <div dir="rtl" style={{ ...mapContainerStyle, margin: -breakout, width: `calc(100% + ${2 * breakout}px)`, minHeight: "100dvh" }}>
        <div className="game-bg-animated" style={{ ...mapBlurStyle(theme), filter: "blur(4px)", transform: "scale(0.5)", background: mapGradient(theme) }} />
        <div style={overlayContentStyle}>
          <span style={{ fontSize: 32, marginBottom: 12 }}>❤️ 🔍</span>
          <p style={{ ...subtextStyle(theme), fontSize: 20 }}>{COPY.discoveryHint}</p>
        </div>
      </div>
    );
  }

  // —— Final Reveal ——
  if (isComplete) {
    return (
      <div dir="rtl" style={{ ...mapContainerStyle, margin: -breakout, width: `calc(100% + ${2 * breakout}px)`, minHeight: "100dvh" }}>
        <div className="game-bg-animated" style={{ ...mapBlurStyle(theme), transform: `scale(${1})`, transition: "transform 0.8s ease", background: mapGradient(theme) }} />
        <div style={overlayContentStyle}>
          <p className="game-text-glow" style={{ ...headlineStyle(theme), color: theme.colors.accent, fontSize: 28 }}>{COPY.finalReveal}</p>
        </div>
      </div>
    );
  }

  // —— Screen 6: Role swap overlay ——
  if (showRoleSwap) {
    return (
      <div dir="rtl" style={{ ...mapContainerStyle, margin: -breakout, width: `calc(100% + ${2 * breakout}px)`, minHeight: "100dvh" }}>
        <div className="game-bg-animated" style={{ ...mapBlurStyle(theme), transform: `scale(${scale})`, transition: "transform 0.4s ease", background: mapGradient(theme) }} />
        <div style={overlayContentStyle}>
          <span style={{ fontSize: 28, marginBottom: 8 }}>↔</span>
          <p style={{ ...subtextStyle(theme), fontSize: 22 }}>{COPY.roleSwap}</p>
        </div>
      </div>
    );
  }

  // —— Screen 5: Feedback (result phase) ——
  if (phase === "result" && result) {
    const success = result === "correct";
    return (
      <div dir="rtl" style={{ ...mapContainerStyle, margin: -breakout, width: `calc(100% + ${2 * breakout}px)`, minHeight: "100dvh" }}>
        <div
          className="game-bg-animated"
          style={{
            ...mapBlurStyle(theme),
            transform: `scale(${scale})`,
            transition: "transform 0.5s ease",
            background: mapGradient(theme),
          }}
        />
        <div style={overlayContentStyle}>
          <p
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: success ? theme.colors.accent : theme.colors.error,
              textAlign: "center",
              maxWidth: 320,
            }}
          >
            {success ? COPY.feedbackSuccess : COPY.feedbackFail}
          </p>
        </div>
      </div>
    );
  }

  // —— Main play: map zoom (describe/guess) ——
  return (
    <div dir="rtl" style={{ ...mapContainerStyle, margin: -breakout, width: `calc(100% + ${2 * breakout}px)`, minHeight: "100dvh" }}>
      <div
        className="game-bg-animated"
        style={{
          ...mapBlurStyle(theme),
          transform: `scale(${scale})`,
          transition: "transform 0.4s ease",
          background: mapGradient(theme),
        }}
      >
        <div className="game-map-breathe" style={mapInnerStyle(theme)}>{zoomLevel >= ZOOM_MAX ? "📍" : "🗺️"}</div>
      </div>
    </div>
  );
}

const mapContainerStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "100dvh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
  boxSizing: "border-box",
};

/** Map area gradient – used with game-bg-animated for subtle motion */
function mapGradient(theme: { colors: { surface: string; background: string; border?: string } }) {
  return `linear-gradient(145deg, ${theme.colors.surface} 0%, ${theme.colors.background} 50%, ${theme.colors.background} 100%)`;
}

function mapBlurStyle(theme: { colors: { background: string; surface: string } }) {
  return {
    position: "absolute" as const,
    inset: -20,
    backgroundSize: "200% 200%",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  };
}

function mapInnerStyle(theme: { colors: { surface: string; border: string } }) {
  return {
    width: "min(20vw, 120px)",
    height: "min(20vw, 120px)",
    borderRadius: "50%",
    background: `radial-gradient(circle at 50% 50%, ${theme.colors.border} 0%, ${theme.colors.surface} 70%)`,
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    fontSize: "clamp(24px, 5vw, 48px)",
  };
}

const overlayContentStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  textAlign: "center",
  padding: "clamp(16px, 3vw, 32px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

function headlineStyle(theme: { colors: { text: string } }) {
  return {
    fontSize: "clamp(22px, 4vw, 42px)",
    fontWeight: 700,
    color: theme.colors.text,
    margin: 0,
    lineHeight: 1.3,
    maxWidth: "min(400px, 90vw)",
  };
}

function subtextStyle(theme: { colors: { textMuted: string } }) {
  return {
    fontSize: "clamp(14px, 2.5vw, 22px)",
    color: theme.colors.textMuted,
    margin: 0,
    marginTop: 8,
  };
}
