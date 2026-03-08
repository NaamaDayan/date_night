"use client";

import { useState, useEffect } from "react";
import { TVLayout } from "./shared/TVLayout";
import { PlayerLayout } from "./shared/PlayerLayout";
import { Button } from "./shared/Button";
import { useGameTheme } from "./shared/GameThemeProvider";
import { shared } from "./copy/shared";
import type { SyncedGameState } from "./types";

interface Props {
  state: SyncedGameState;
  room: { send: (type: string, data?: unknown) => void };
  role: "player1" | "player2" | "tv";
}

export function NameEntryScreen({ state, room, role }: Props) {
  const theme = useGameTheme();
  const isTV = role === "tv";
  const isP1 = role === "player1";
  const currentName = isP1 ? (state.player1Name ?? "") : (state.player2Name ?? "");
  const [name, setName] = useState(currentName);
  useEffect(() => {
    setName(currentName);
  }, [currentName]);
  const p1Set = Boolean(state.player1Name?.trim());
  const p2Set = Boolean(state.player2Name?.trim());
  const bothSet = p1Set && p2Set;

  if (isTV) {
    return (
      <TVLayout>
        <div
          className="game-welcome-enter"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            padding: 24,
          }}
        >
          <span className="game-welcome-icon" style={{ fontSize: "clamp(40px, 6vw, 64px)" }}>
            ✏️
          </span>
          <h1
            style={{
              fontSize: "clamp(22px, 4vw, 36px)",
              fontWeight: 800,
              color: theme.colors.text,
              margin: 0,
              textAlign: "center",
            }}
          >
            {bothSet ? shared.bothReady : (state.tvText || shared.nameEntryWaiting)}
          </h1>
          {bothSet ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                fontSize: "clamp(18px, 2.5vw, 24px)",
                color: theme.colors.textMuted,
              }}
            >
              <span>{state.player1Name}</span>
              <span>{state.player2Name}</span>
            </div>
          ) : (
            <p style={{ fontSize: "clamp(14px, 2vw, 18px)", color: theme.colors.textMuted, margin: 0 }}>
              {shared.nameEntryWaiting}
            </p>
          )}
        </div>
      </TVLayout>
    );
  }

  return (
    <PlayerLayout>
      <div
        className="game-welcome-enter"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60dvh",
          textAlign: "center",
          gap: 20,
          padding: 24,
        }}
      >
        <span style={{ fontSize: 48 }}>✏️</span>
        <h1
          style={{
            fontSize: "clamp(20px, 5vw, 26px)",
            fontWeight: 800,
            color: theme.colors.text,
            margin: 0,
          }}
        >
          {state.message || shared.nameEntryPrompt}
        </h1>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={shared.nameEntryPlaceholder}
          maxLength={50}
          dir="auto"
          style={{
            width: "100%",
            maxWidth: 280,
            padding: "14px 18px",
            fontSize: 18,
            borderRadius: 12,
            border: `2px solid ${theme.colors.border}`,
            background: theme.colors.surface,
            color: theme.colors.text,
          }}
        />
        <Button
          onClick={() => {
            const trimmed = name.trim();
            if (trimmed) room.send("submitName", { name: trimmed });
          }}
          style={{ width: "100%", maxWidth: 280, minHeight: 52, fontSize: 18 }}
        >
          {shared.nameEntrySubmit}
        </Button>
      </div>
    </PlayerLayout>
  );
}
