"use client";

import { TVLayout } from "./shared/TVLayout";
import { PlayerLayout } from "./shared/PlayerLayout";
import { Button } from "./shared/Button";
import { useGameTheme } from "./shared/GameThemeProvider";
import type { SyncedGameState } from "./types";

interface Props {
  state: SyncedGameState;
  room: { send: (type: string, data?: unknown) => void };
  role: "player1" | "player2" | "tv";
}

export function InterimScreen({ state, room, role }: Props) {
  const theme = useGameTheme();
  const isTV = role === "tv";

  if (isTV) {
    return (
      <TVLayout>
        <div
          className="game-welcome-enter"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span
            className="game-welcome-icon"
            style={{ fontSize: "clamp(40px, 6vw, 64px)" }}
          >
            🎮
          </span>
          <h1
            style={{
              fontSize: "clamp(24px, 4vw, 40px)",
              fontWeight: 800,
              color: theme.colors.text,
              margin: 0,
              textAlign: "center",
            }}
          >
            {state.message || "Get ready!"}
          </h1>
          <div
            className="game-dots-loading"
            style={{
              marginTop: 12,
              fontSize: "clamp(16px, 2vw, 22px)",
              color: theme.colors.textMuted,
              opacity: 0.6,
            }}
          >
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>
        </div>
      </TVLayout>
    );
  }

  return (
    <PlayerLayout
      stickyBottom={
        <Button
          onClick={() => room.send("ready")}
          style={{ width: "100%", minHeight: 56, fontSize: 18 }}
        >
          מוכנים!
        </Button>
      }
    >
      <div
        className="game-welcome-enter"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60dvh",
          textAlign: "center",
          gap: 16,
        }}
      >
        <span style={{ fontSize: 48 }}>🎮</span>
        <h1
          style={{
            fontSize: "clamp(22px, 5.5vw, 28px)",
            fontWeight: 800,
            color: theme.colors.text,
            margin: 0,
          }}
        >
          {state.message || "Get ready!"}
        </h1>
        <p
          style={{
            fontSize: "clamp(14px, 3.5vw, 16px)",
            color: theme.colors.textMuted,
            margin: 0,
          }}
        >
          לחצו כשאתם מוכנים להתחיל
        </p>
      </div>
    </PlayerLayout>
  );
}
