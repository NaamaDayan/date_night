"use client";

import { useEffect, useState } from "react";

const COLYSEUS_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_COLYSEUS_URL || "http://localhost:2567")
    : "http://localhost:2567";

type Role = "player1" | "player2" | "tv";

export default function GameClient({
  sessionId,
  token,
  role,
}: {
  sessionId: string;
  token: string;
  role: Role;
}) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const [state, setState] = useState<{
    message: string;
    tvText: string;
    player1Text: string;
    player2Text: string;
    gameStarted: boolean;
    stage: number;
  } | null>(null);
  const [input, setInput] = useState("");
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
        let room: Awaited<ReturnType<typeof client.joinById>> | null = null;
        try {
          const reconnectionToken = sessionStorage.getItem(
            `colyseus_reconnect_${sessionId}`
          );
          if (reconnectionToken) {
            room = await client.reconnect(reconnectionToken);
          }
        } catch (_) {
          sessionStorage.removeItem(`colyseus_reconnect_${sessionId}`);
        }
        if (!room) {
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
          room = await client.joinById(roomId, { sessionId, token, role });
        }
        if (cancelled) {
          room.leave();
          return;
        }
        setRoom(() => room);
        if (room.reconnectionToken) {
          try {
            sessionStorage.setItem(
              `colyseus_reconnect_${sessionId}`,
              room.reconnectionToken
            );
          } catch (_) {}
        }

        const update = () => {
          const s = room.state as Record<string, unknown>;
          if (s) {
            setState({
              message: (s.message as string) ?? "",
              tvText: (s.tvText as string) ?? "",
              player1Text: (s.player1Text as string) ?? "",
              player2Text: (s.player2Text as string) ?? "",
              gameStarted: (s.gameStarted as boolean) ?? false,
              stage: (s.stage as number) ?? 0,
            });
          }
        };
        update();
        room.onStateChange(update);
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
  }, [mounted, sessionId, token, role]);

  if (error) {
    return (
      <p style={{ maxWidth: 480 }}>
        {error}
      </p>
    );
  }

  if (!state) return <p>Connecting to game…</p>;

  const isTV = role === "tv";

  return (
    <div>
      <h1>
        {isTV ? "TV / Big screen" : role === "player1" ? "Player 1" : "Player 2"}
      </h1>
      {state.message && <p id="message">{state.message}</p>}
      {isTV ? (
        <p id="tv-text" style={{ fontSize: "1.5rem" }}>
          {state.tvText}
        </p>
      ) : (
        <>
          <p id="player-text" style={{ fontSize: "1.25rem" }}>
            {role === "player1" ? state.player1Text : state.player2Text}
          </p>
          <div style={{ marginTop: "1rem" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Your answer"
              style={{ padding: "0.5rem", marginRight: "0.5rem" }}
            />
            <button
              type="button"
              onClick={() => {
                room?.send("submit", { text: input });
                setInput("");
              }}
              style={{ padding: "0.5rem 1rem" }}
            >
              Submit
            </button>
          </div>
        </>
      )}
    </div>
  );
}
