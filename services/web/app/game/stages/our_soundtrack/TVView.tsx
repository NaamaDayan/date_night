"use client";

import type { SyncedGameState } from "../../types";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { TVLayout } from "../../shared/TVLayout";
import { parseOurSoundtrackPayload } from "./types";
import { COPY } from "./copy";

interface Props {
  state: SyncedGameState;
}

export function TVView({ state }: Props) {
  const theme = useGameTheme();
  const payload = parseOurSoundtrackPayload(state.stagePayloadJson);
  const phase = payload.phase || "conveying";
  const correctGuesses = payload.correctGuesses ?? 0;
  const totalAttempts = payload.totalAttempts ?? 0;

  return (
    <TVLayout>
      <div style={{ maxWidth: "min(640px, 90vw)", textAlign: "center" }}>
        <h1
          style={{
            fontSize: theme.typography.tvTitle,
            margin: 0,
            marginBottom: 8,
            color: theme.colors.text,
            fontWeight: 800,
          }}
        >
          {phase === "stageComplete" ? COPY.movingToNextStage : COPY.tvTitle}
        </h1>
        {phase !== "stageComplete" && (
          <p
            style={{
              fontSize: theme.typography.tvBody,
              margin: 0,
              color: theme.colors.textMuted,
            }}
          >
            {COPY.correctGuessesLabel}: {correctGuesses} · {COPY.attemptsLabel}: {totalAttempts}
          </p>
        )}
      </div>
    </TVLayout>
  );
}
