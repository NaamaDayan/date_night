"use client";

import { BaseLayout } from "../../shared/BaseLayout";
import { Button } from "../../shared/Button";
import { Input } from "../../shared/Input";
import { useState } from "react";
import type { SyncedGameState } from "../../types";
import type { QuestionnaireData } from "../../types";

interface Props {
  state: SyncedGameState;
  room: { send: (type: string, data?: unknown) => void };
  questionnaire: QuestionnaireData;
}

export function Player2View({ state, room }: Props) {
  const [value, setValue] = useState("");
  return (
    <BaseLayout title="Stage 3">
      <p style={{ marginBottom: 16 }}>{state.player2Text}</p>
      <Input
        placeholder="Type the same word"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ marginRight: 8, marginBottom: 16 }}
      />
      <Button onClick={() => { room.send("submit", { text: value }); setValue(""); }}>
        Submit
      </Button>
    </BaseLayout>
  );
}
