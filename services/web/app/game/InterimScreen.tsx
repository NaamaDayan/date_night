"use client";

import { BaseLayout } from "./shared/BaseLayout";
import { Button } from "./shared/Button";
import type { SyncedGameState } from "./types";

interface Props {
  state: SyncedGameState;
  room: { send: (type: string, data?: unknown) => void };
  role: "player1" | "player2" | "tv";
}

export function InterimScreen({ state, room, role }: Props) {
  const isTV = role === "tv";
  return (
    <BaseLayout title="Get ready">
      <p style={{ fontSize: "1.25rem", marginBottom: 24 }}>{state.message}</p>
      {!isTV && (
        <Button onClick={() => room.send("ready")}>Start Next Stage</Button>
      )}
    </BaseLayout>
  );
}
