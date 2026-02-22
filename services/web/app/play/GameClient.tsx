"use client";

import { useEffect, useState } from "react";
import { GameThemeProvider } from "../game/shared/GameThemeProvider";
import { StageSwitcher } from "../game/StageSwitcher";
import type { SyncedGameState, QuestionnaireData, GameHistoryItem } from "../game/types";

const COLYSEUS_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_COLYSEUS_URL || "http://localhost:2567")
    : "http://localhost:2567";

type Role = "player1" | "player2" | "tv";

function parseState(s: Record<string, unknown>): SyncedGameState {
  return {
    currentStageIndex: (s.currentStageIndex as number) ?? (s.stage as number) ?? 0,
    stage: (s.stage as number) ?? (s.currentStageIndex as number) ?? 0,
    gameState: (s.gameState as SyncedGameState["gameState"]) ?? "WAITING_FOR_START",
    message: (s.message as string) ?? "",
    tvText: (s.tvText as string) ?? "",
    player1Text: (s.player1Text as string) ?? "",
    player2Text: (s.player2Text as string) ?? "",
    gameStarted: (s.gameStarted as boolean) ?? false,
    playerCount: (s.playerCount as number) ?? 0,
    questionnaireJson: (s.questionnaireJson as string) ?? "{}",
    stagePayloadJson: (s.stagePayloadJson as string) ?? "{}",
    gameHistoryJson: (s.gameHistoryJson as string) ?? "[]",
    readyForNextCount: (s.readyForNextCount as number) ?? 0,
    player1Submitted: (s.player1Submitted as boolean) ?? false,
    player2Submitted: (s.player2Submitted as boolean) ?? false,
  };
}

function parseQuestionnaire(json: string): QuestionnaireData {
  try {
    const o = JSON.parse(json);
    return {
      partner1Name: o.partner1Name ?? "",
      partner2Name: o.partner2Name ?? "",
      howLong: o.howLong ?? "",
      howMet: o.howMet ?? "",
      whereMet: o.whereMet ?? "",
    };
  } catch {
    return {
      partner1Name: "",
      partner2Name: "",
      howLong: "",
      howMet: "",
      whereMet: "",
    };
  }
}

function parseGameHistory(json: string): GameHistoryItem[] {
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export default function GameClient({
  sessionId,
  token,
  role,
  devStage,
}: {
  sessionId: string;
  token: string;
  role: Role;
  devStage?: number | null;
}) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const [state, setState] = useState<SyncedGameState | null>(null);
  const [room, setRoom] = useState<{ send: (type: string, data?: unknown) => void } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !sessionId || !token || !role) return;

    let cancelled = false;
    const connect = async () => {
      try {
        const { Client } = await import("@colyseus/sdk");
        const client = new Client(COLYSEUS_URL);
        let roomInstance: Awaited<ReturnType<typeof client.joinById>> | null = null;
        try {
          const reconnectionToken = sessionStorage.getItem(
            `colyseus_reconnect_${sessionId}`
          );
          if (reconnectionToken) {
            roomInstance = await client.reconnect(reconnectionToken);
          }
        } catch (_) {
          sessionStorage.removeItem(`colyseus_reconnect_${sessionId}`);
        }
        if (!roomInstance) {
          const res = await fetch(`${COLYSEUS_URL}/join`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, token, role }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "Invalid or expired link");
          }
          const { roomId } = await res.json();
          if (cancelled) return;
          const joinOptions: Record<string, unknown> = { sessionId, token, role };
          if (devStage != null) joinOptions.devStage = devStage;
          roomInstance = await client.joinById(roomId, joinOptions);
        }
        if (cancelled) {
          roomInstance.leave();
          return;
        }
        setRoom(() => roomInstance);
        if (roomInstance.reconnectionToken) {
          try {
            sessionStorage.setItem(
              `colyseus_reconnect_${sessionId}`,
              roomInstance.reconnectionToken
            );
          } catch (_) {}
        }

        const update = () => {
          const s = roomInstance!.state as Record<string, unknown>;
          if (s) setState(parseState(s));
        };
        update();
        roomInstance.onStateChange(update);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Could not connect to game server";
          const isNetworkError = msg === "Failed to fetch" || msg.includes("NetworkError") || msg.includes("Load failed");
          setError(
            isNetworkError
              ? "Cannot reach the game server. Start it from the project root: node server.js (port 2567)."
              : `${msg} Make sure the game server is running and your link is valid.`
          );
        }
      }
    };
    connect();
    return () => {
      cancelled = true;
    };
  }, [mounted, sessionId, token, role, devStage]);

  if (error) {
    return (
      <p style={{ maxWidth: 480 }}>
        {error}
      </p>
    );
  }

  if (!state || !room) return <p>Connecting to game…</p>;

  const questionnaire = parseQuestionnaire(state.questionnaireJson);
  const gameHistory = parseGameHistory(state.gameHistoryJson);

  return (
    <GameThemeProvider>
      <StageSwitcher
        state={state}
        room={room}
        role={role}
        questionnaire={questionnaire}
        gameHistory={gameHistory}
      />
    </GameThemeProvider>
  );
}
