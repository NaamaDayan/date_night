"use client";

import { useState, useEffect, useRef } from "react";
import { parseStage4Payload } from "./types";
import { COPY } from "./copy";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { TVLayout } from "../../shared/TVLayout";
import type { SyncedGameState } from "../../types";

const ZOOM_MAX = 6;
const INTRO_DURATION_MS = 5000;
const DISCOVERY_DURATION_MS = 2800;
const ROLE_SWAP_DURATION_MS = 1500;

interface TVViewProps {
  state: SyncedGameState;
}

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

  useEffect(() => {
    if (introDone) return;
    const t = setTimeout(() => setIntroDone(true), INTRO_DURATION_MS);
    return () => clearTimeout(t);
  }, [introDone]);

  useEffect(() => {
    if (!introDone || discoveryDone) return;
    const t = setTimeout(() => setDiscoveryDone(true), DISCOVERY_DURATION_MS);
    return () => clearTimeout(t);
  }, [introDone, discoveryDone]);

  useEffect(() => {
    if (subRound > prevSubRoundRef.current && phase === "describe") {
      setShowRoleSwap(true);
      const t = setTimeout(() => setShowRoleSwap(false), ROLE_SWAP_DURATION_MS);
      prevSubRoundRef.current = subRound;
      return () => clearTimeout(t);
    }
    prevSubRoundRef.current = subRound;
  }, [subRound, phase]);

  const mapBg = (
    <div
      className="game-bg-animated"
      style={{
        position: "absolute",
        inset: -20,
        backgroundSize: "200% 200%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(145deg, ${theme.colors.surface} 0%, ${theme.colors.background} 50%, ${theme.colors.background} 100%)`,
      }}
    />
  );

  const overlayStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    padding: "clamp(16px, 3vw, 32px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  if (!introDone) {
    return (
      <TVLayout stageNumber={5}>
        {mapBg}
        <div style={overlayStyle}>
          <h1
            style={{
              fontSize: theme.typography.tvTitle,
              fontWeight: 700,
              color: theme.colors.text,
              margin: 0,
              lineHeight: 1.3,
              maxWidth: "min(400px, 90vw)",
            }}
          >
            {COPY.introHeadline}
          </h1>
          <p
            style={{
              fontSize: theme.typography.tvBody,
              color: theme.colors.textMuted,
              margin: 0,
              marginTop: 8,
            }}
          >
            {COPY.introSubtext}
          </p>
        </div>
      </TVLayout>
    );
  }

  if (!discoveryDone) {
    return (
      <TVLayout stageNumber={5}>
        {mapBg}
        <div style={overlayStyle}>
          <span style={{ fontSize: 32, marginBottom: 12 }}>🔍</span>
          <p
            style={{
              fontSize: "clamp(18px, 2.5vw, 24px)",
              color: theme.colors.textMuted,
              margin: 0,
            }}
          >
            {COPY.discoveryHint}
          </p>
        </div>
      </TVLayout>
    );
  }

  if (isComplete) {
    return (
      <TVLayout stageNumber={5}>
        <div
          className="game-bg-animated"
          style={{
            position: "absolute",
            inset: -20,
            backgroundSize: "200% 200%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(145deg, ${theme.colors.surface} 0%, ${theme.colors.background} 50%, ${theme.colors.background} 100%)`,
            transform: "scale(1)",
            transition: "transform 0.8s ease",
          }}
        />
        <div style={overlayStyle}>
          <p
            className="game-text-glow"
            style={{
              fontSize: "clamp(24px, 4vw, 40px)",
              fontWeight: 800,
              margin: 0,
              color: theme.colors.accent,
            }}
          >
            {COPY.finalReveal}
          </p>
        </div>
      </TVLayout>
    );
  }

  if (showRoleSwap) {
    return (
      <TVLayout stageNumber={5}>
        {mapBg}
        <div style={overlayStyle}>
          <span style={{ fontSize: 28, marginBottom: 8 }}>↔</span>
          <p
            style={{
              fontSize: "clamp(18px, 2.5vw, 24px)",
              color: theme.colors.textMuted,
              margin: 0,
            }}
          >
            {COPY.roleSwap}
          </p>
        </div>
      </TVLayout>
    );
  }

  if (phase === "result" && result) {
    const success = result === "correct";
    return (
      <TVLayout stageNumber={5}>
        <div
          className="game-bg-animated"
          style={{
            position: "absolute",
            inset: -20,
            backgroundSize: "200% 200%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(145deg, ${theme.colors.surface} 0%, ${theme.colors.background} 50%, ${theme.colors.background} 100%)`,
            transform: `scale(${scale})`,
            transition: "transform 0.5s ease",
          }}
        />
        <div style={overlayStyle}>
          <p
            style={{
              fontSize: "clamp(22px, 3.5vw, 30px)",
              fontWeight: 600,
              color: success ? theme.colors.accent : theme.colors.error,
              textAlign: "center",
              maxWidth: 320,
            }}
          >
            {success ? COPY.feedbackSuccess : COPY.feedbackFail}
          </p>
        </div>
      </TVLayout>
    );
  }

  return (
    <TVLayout stageNumber={5}>
      <div
        className="game-bg-animated"
        style={{
          position: "absolute",
          inset: -20,
          backgroundSize: "200% 200%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(145deg, ${theme.colors.surface} 0%, ${theme.colors.background} 50%, ${theme.colors.background} 100%)`,
          transform: `scale(${scale})`,
          transition: "transform 0.4s ease",
        }}
      >
        <div
          className="game-map-breathe"
          style={{
            width: "min(20vw, 120px)",
            height: "min(20vw, 120px)",
            borderRadius: "50%",
            background: `radial-gradient(circle at 50% 50%, ${theme.colors.border} 0%, ${theme.colors.surface} 70%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "clamp(24px, 5vw, 48px)",
          }}
        >
          {zoomLevel >= ZOOM_MAX ? "📍" : "🗺️"}
        </div>
      </div>
    </TVLayout>
  );
}
