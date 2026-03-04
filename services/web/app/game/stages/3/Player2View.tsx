"use client";

import { useCallback, useState, useMemo } from "react";
import type { SyncedGameState, QuestionnaireData } from "../../types";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { PlayerLayout } from "../../shared/PlayerLayout";
import { Button } from "../../shared/Button";
import { parseStage3Payload } from "./types";
import { COPY } from "./copy";
import { DatePuzzleButtons } from "./DatePuzzleButtons";

interface Props {
  state: SyncedGameState;
  room: { send: (type: string, data?: unknown) => void };
  questionnaire: QuestionnaireData;
}

export function Player2View({ state, room }: Props) {
  const theme = useGameTheme();
  const payload = parseStage3Payload(state.stagePayloadJson);
  const buttons = payload.buttons ?? [];
  const isSolved = Boolean(payload.stageComplete || payload.status === "solved");

  const [heardSet, setHeardSet] = useState<Set<number>>(new Set());
  const discoveryDone = heardSet.size >= 8;

  const pressSequence = payload.pressSequence ?? [];
  const usedIndices = useMemo(() => new Set(pressSequence), [pressSequence]);

  const handlePress = useCallback(
    (index: number) => {
      if (!discoveryDone) {
        setHeardSet((prev) => new Set(prev).add(index));
        return;
      }
      room.send("press", { index });
    },
    [discoveryDone, room]
  );

  const handleReset = useCallback(() => {
    room.send("reset");
  }, [room]);

  return (
    <PlayerLayout
      stageTitle={COPY.phoneTitle}
      subtitle={!isSolved ? (discoveryDone ? COPY.orderIntro : COPY.discoverIntro) : undefined}
    >
      <div style={{ marginBottom: 20 }}>
        <DatePuzzleButtons
          buttons={buttons}
          usedIndices={discoveryDone ? usedIndices : new Set()}
          interactive={!isSolved}
          onPress={handlePress}
        />
      </div>

      {discoveryDone && !isSolved && (
        <Button
          variant="secondary"
          onClick={handleReset}
          style={{ width: "100%", marginBottom: 16, minHeight: 48 }}
        >
          {COPY.resetButton}
        </Button>
      )}

      {isSolved && (
        <div className="game-step-enter" style={{ marginTop: 16 }}>
          <p
            style={{
              fontSize: "clamp(18px, 5vw, 22px)",
              fontWeight: 700,
              marginBottom: 8,
              color: theme.colors.success,
              textAlign: "center",
            }}
          >
            {COPY.resultsTitle}
          </p>
          <p
            style={{
              fontSize: theme.typography.phoneCaption,
              marginBottom: 24,
              color: theme.colors.textMuted,
              textAlign: "center",
            }}
          >
            {COPY.resultsSub}
          </p>
          <Button
            onClick={() => room.send("continue")}
            style={{ width: "100%", minHeight: 52 }}
          >
            {COPY.continueButton}
          </Button>
        </div>
      )}
    </PlayerLayout>
  );
}
