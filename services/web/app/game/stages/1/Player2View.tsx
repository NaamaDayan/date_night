"use client";

import { BaseLayout } from "../../shared/BaseLayout";
import { Button } from "../../shared/Button";
import type { SyncedGameState } from "../../types";
import type { QuestionnaireData } from "../../types";

interface Props {
  state: SyncedGameState;
  room: { send: (type: string, data?: unknown) => void };
  questionnaire: QuestionnaireData;
}

export function Player2View({ state, room }: Props) {
  return (
    <BaseLayout title="Stage 1">
      <p style={{ marginBottom: 16 }}>{state.player2Text}</p>
      <Button onClick={() => room.send("next")}>Next</Button>
    </BaseLayout>
  );
}
