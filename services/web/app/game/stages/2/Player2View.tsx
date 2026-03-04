"use client";

import { useState, useCallback } from "react";
import type { SyncedGameState, QuestionnaireData } from "../../types";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { PlayerLayout } from "../../shared/PlayerLayout";
import { Button } from "../../shared/Button";
import { Input } from "../../shared/Input";
import { Player2Text } from "./HighlightedText";

interface Props {
  state: SyncedGameState;
  room: { send: (type: string, data?: unknown) => void };
  questionnaire: QuestionnaireData;
}

const STAGE_TITLE = "שנת ההיכרות";
const SUBTITLE = "מצאו את המשפט המוסתר והזינו את המספר.";
const SUBMIT_LABEL = "שלח";

export function Player2View({ state, room, questionnaire }: Props) {
  const theme = useGameTheme();
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(() => {
    const num = value.trim() ? Number(value.trim()) : NaN;
    if (!Number.isInteger(num)) return;
    room.send("submit", { number: num });
  }, [value, room]);

  const headline = `${STAGE_TITLE} — ${questionnaire.partner1Name} & ${questionnaire.partner2Name}`;

  return (
    <PlayerLayout stageTitle={headline} subtitle={SUBTITLE}>
      <p
        style={{
          fontSize: theme.typography.phoneBody || 18,
          lineHeight: 1.8,
          marginBottom: 24,
          color: theme.colors.text,
        }}
      >
        <Player2Text />
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input
          type="number"
          placeholder="הזן מספר"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          min={0}
          max={9999}
        />
        <Button onClick={handleSubmit} style={{ width: "100%", minHeight: 48 }}>
          {SUBMIT_LABEL}
        </Button>
      </div>
    </PlayerLayout>
  );
}
