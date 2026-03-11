"use client";

import { useState, useEffect, useCallback } from "react";
import type { SyncedGameState, QuestionnaireData } from "../../types";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { PlayerLayout } from "../../shared/PlayerLayout";
import { Button } from "../../shared/Button";
import { parseOurSoundtrackPayload } from "./types";
import { COPY } from "./copy";

const TURN_SECONDS = 30;

interface Props {
  state: SyncedGameState;
  room: { send: (type: string, data?: unknown) => void };
  questionnaire: QuestionnaireData;
}

export function Player1View({ state, room }: Props) {
  const theme = useGameTheme();
  const payload = parseOurSoundtrackPayload(state.stagePayloadJson);
  const phase = payload.phase || "conveying";
  const currentTurn = payload.currentTurn ?? 1;
  const currentSong = payload.currentSong;
  const timeUp = Boolean(payload.timeUp);
  const timerEndAt = payload.timerEndAt ?? 0;
  const lastGuessResult = payload.lastGuessResult;

  const [guess, setGuess] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(TURN_SECONDS);

  useEffect(() => {
    if (phase !== "conveying" && phase !== "betweenTurns") return;
    const end = timerEndAt;
    if (!end) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setSecondsLeft(left);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [phase, timerEndAt]);

  const isConveying = currentTurn === 1;
  const isGuessing = currentTurn === 2;
  const canGuess = isGuessing && phase === "conveying" && !timeUp;
  const showBetweenTurns = phase === "betweenTurns";
  const iAmGuesserThisRound = currentTurn === 2;

  const handleSubmitGuess = useCallback(() => {
    const g = guess.trim();
    if (!g || !canGuess) return;
    room.send("submitGuess", { guess: g });
    setGuess("");
  }, [guess, canGuess, room]);

  return (
    <PlayerLayout stageTitle={COPY.tvTitle}>
      {isConveying && currentSong && (
        <div
          style={{
            padding: 16,
            background: theme.colors.surface,
            borderRadius: 12,
            marginBottom: 16,
            border: `2px solid ${theme.colors.border}`,
          }}
        >
          <p style={{ margin: 0, fontSize: 14, color: theme.colors.textMuted, marginBottom: 4 }}>
            {COPY.conveyingInstruction}
          </p>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>{currentSong.songName}</p>
          <p style={{ margin: "4px 0 0", fontSize: 14 }}>{currentSong.artist} · {currentSong.genre}</p>
        </div>
      )}

      {phase === "conveying" && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            textAlign: "center",
            background: secondsLeft <= 5 ? "var(--error, #fca5a5)" : theme.colors.surface,
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 24,
          }}
        >
          {COPY.timerLabel}: {secondsLeft}s
        </div>
      )}

      {isConveying && phase === "conveying" && (
        <Button
          variant="secondary"
          onClick={() => room.send("skipSong")}
          style={{ width: "100%", marginBottom: 16 }}
        >
          {COPY.skipSong}
        </Button>
      )}

      {isGuessing && (
        <>
          {phase === "conveying" && lastGuessResult === "wrong" && (
            <p style={{ marginBottom: 12, color: "var(--error, #fca5a5)", fontSize: 16, fontWeight: 600 }}>
              {COPY.wrongGuessMessage}
            </p>
          )}
          <p style={{ marginBottom: 8, color: theme.colors.textMuted, fontSize: 14 }}>
            {COPY.guessingInstruction}
          </p>
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder={COPY.guessPlaceholder}
            disabled={!canGuess}
            onKeyDown={(e) => e.key === "Enter" && handleSubmitGuess()}
            style={{
              width: "100%",
              padding: 14,
              fontSize: 16,
              borderRadius: 12,
              border: `2px solid ${theme.colors.border}`,
              background: theme.colors.surface,
              color: theme.colors.text,
              marginBottom: 12,
              opacity: canGuess ? 1 : 0.7,
            }}
          />
          <Button
            onClick={handleSubmitGuess}
            disabled={!canGuess || !guess.trim()}
            style={{ width: "100%", marginBottom: 16 }}
          >
            {COPY.submitGuess}
          </Button>
        </>
      )}

      {showBetweenTurns && (
        <>
          {timeUp && (
            <p style={{ marginBottom: 12, fontSize: 18, fontWeight: 700, color: theme.colors.text }}>
              {COPY.timeUpMessage}
            </p>
          )}
          {iAmGuesserThisRound && lastGuessResult === "correct" && (
            <p style={{ marginBottom: 12, fontSize: 18, fontWeight: 700, color: theme.colors.success }}>
              {COPY.correctMessage}
            </p>
          )}
          <Button onClick={() => room.send("nextGuess")} style={{ width: "100%" }}>
            {COPY.nextGuess}
          </Button>
        </>
      )}

      {phase === "stageComplete" && (
        <p style={{ fontSize: 18, fontWeight: 700, color: theme.colors.success, textAlign: "center" }}>
          {COPY.movingToNextStage}
        </p>
      )}
    </PlayerLayout>
  );
}
