"use client";

import { BaseLayout } from "../../shared/BaseLayout";
import type { SyncedGameState } from "../../types";
import type { QuestionnaireData } from "../../types";

interface Props {
  state: SyncedGameState;
  room: { send: (type: string, data?: unknown) => void };
  questionnaire: QuestionnaireData;
}

export function Player2View({ state }: Props) {
  return (
    <BaseLayout title="Stage 2">
      <p style={{ marginBottom: 16 }}>{state.player2Text}</p>
    </BaseLayout>
  );
}
