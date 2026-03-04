"use client";

import { useState, useEffect } from "react";
import { parseStage4Payload } from "./types";
import type { SyncedGameState } from "../../types";
import type { QuestionnaireData } from "../../types";
import { COPY } from "./copy";
import { LocationGuessModal } from "./LocationGuessModal";
import { LocationGuessToast } from "./LocationGuessToast";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { PlayerLayout } from "../../shared/PlayerLayout";
import {
  RoleDescriber,
  RoleGuesser,
  AnsweringBlock,
  GuessingBlock,
  ResultBlockPhone,
} from "./PhoneBlocks";

interface Props {
  state: SyncedGameState;
  room: { send: (type: string, data?: unknown) => void };
  questionnaire: QuestionnaireData;
}

export function Player2View({ state, room }: Props) {
  const theme = useGameTheme();
  const payload = parseStage4Payload(state.stagePayloadJson);
  const isDescriber = payload.describerRole === "player2";
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [wrongToastDismissed, setWrongToastDismissed] = useState(false);
  const [answers, setAnswers] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    setAnswers([0, 0, 0, 0]);
  }, [payload.subRoundIndex, payload.phase]);

  const phase = payload.phase || "describe";
  const showWrongToast = Boolean(payload.lastLocationGuessWrong) && !wrongToastDismissed;
  const showCorrectToast = Boolean(payload.locationCorrect);

  const handleDescriberSubmit = () => room.send("describerSubmit", { answers });
  const handleGuesserSubmit = (wordIndex: number) => room.send("guesserSubmit", { wordIndex });
  const handleLocationSubmit = (text: string) => {
    room.send("locationGuess", { text });
  };

  return (
    <PlayerLayout stageTitle={COPY.introHeadline}>
      {phase === "describe" && (
        <>
          {isDescriber ? <RoleDescriber /> : <RoleGuesser />}
          {isDescriber && (
            <AnsweringBlock
              payload={payload}
              answers={answers}
              setAnswers={setAnswers}
              onSubmit={handleDescriberSubmit}
            />
          )}
          {!isDescriber && (
            <p
              style={{
                color: theme.colors.textMuted,
                fontSize: theme.typography.phoneCaption,
                textAlign: "center",
                marginTop: 16,
              }}
            >
              ממתינים לבן/בת הזוג...
            </p>
          )}
        </>
      )}

      {phase === "guess" && isDescriber && (
        <p
          style={{
            color: theme.colors.textMuted,
            fontSize: theme.typography.phoneCaption,
            textAlign: "center",
            padding: 24,
          }}
        >
          ממתינים לניחוש...
        </p>
      )}
      {phase === "guess" && !isDescriber && (
        <GuessingBlock payload={payload} onSubmit={handleGuesserSubmit} />
      )}

      {phase === "result" && (
        <ResultBlockPhone payload={payload} onNext={() => room.send("next")} />
      )}

      <LocationGuessToast
        showWrong={showWrongToast}
        showCorrect={showCorrectToast}
        onDismissWrong={() => setWrongToastDismissed(true)}
      />

      <button
        type="button"
        onClick={() => {
          setLocationModalOpen(true);
          setWrongToastDismissed(false);
        }}
        className="game-btn-press"
        style={{
          position: "fixed",
          bottom: "max(16px, env(safe-area-inset-bottom))",
          right: "max(16px, env(safe-area-inset-right))",
          padding: "12px 16px",
          minHeight: 48,
          fontSize: "clamp(13px, 3.5vw, 15px)",
          borderRadius: 22,
          border: `2px solid ${theme.colors.border}`,
          background: theme.colors.surface,
          color: theme.colors.text,
          cursor: "pointer",
          boxShadow: theme.shadows?.card,
        }}
      >
        {COPY.locationGuessButton}
      </button>

      <LocationGuessModal
        open={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSubmit={handleLocationSubmit}
      />
    </PlayerLayout>
  );
}
