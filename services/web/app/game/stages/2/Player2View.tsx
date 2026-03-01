"use client";

import { useCallback, useState, useMemo } from "react";
import type { SyncedGameState, QuestionnaireData } from "../../types";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { Button } from "../../shared/Button";
import { parseStage2Payload } from "./types";
import { COPY } from "./copy";
import { DatePuzzleButtons } from "./DatePuzzleButtons";

const phoneContainerStyle: React.CSSProperties = {
  maxWidth: "min(420px, 100vw)",
  width: "100%",
  margin: "0 auto",
  paddingBottom: 80,
  paddingLeft: "max(12px, env(safe-area-inset-left))",
  paddingRight: "max(12px, env(safe-area-inset-right))",
  paddingTop: "max(12px, env(safe-area-inset-top))",
  boxSizing: "border-box",
};

interface Props {
  state: SyncedGameState;
  room: { send: (type: string, data?: unknown) => void };
  questionnaire: QuestionnaireData;
}

export function Player2View({ state, room }: Props) {
  const theme = useGameTheme();
  const payload = parseStage2Payload(state.stagePayloadJson);
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
    <div dir="rtl" style={phoneContainerStyle}>
      <div className="game-step-enter" style={{ marginBottom: 16, textAlign: "center" }}>
        <p
          style={{
            fontSize: 18,
            fontWeight: 700,
            margin: 0,
            marginBottom: 4,
            color: theme.colors.text,
          }}
        >
          {COPY.phoneTitle}
        </p>
        <p
          style={{
            fontSize: 14,
            margin: 0,
            color: theme.colors.textMuted,
          }}
        >
          {!isSolved && (discoveryDone ? COPY.orderIntro : COPY.discoverIntro)}
        </p>
      </div>

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
          style={{ width: "100%", marginBottom: 16, minHeight: 44 }}
        >
          {COPY.resetButton}
        </Button>
      )}

      {isSolved && (
        <div className="game-step-enter" style={{ marginTop: 16 }}>
          <p
            style={{
              fontSize: 20,
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
              fontSize: 14,
              marginBottom: 24,
              color: theme.colors.textMuted,
              textAlign: "center",
            }}
          >
            {COPY.resultsSub}
          </p>
          <Button
            onClick={() => room.send("continue")}
            style={{ width: "100%", minHeight: 48 }}
          >
            {COPY.continueButton}
          </Button>
        </div>
      )}
    </div>
  );
}
