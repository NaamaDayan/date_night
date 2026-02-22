"use client";

import { BaseLayout } from "../../shared/BaseLayout";
import type { SyncedGameState } from "../../types";

interface Props {
  state: SyncedGameState;
}

export function TVView({ state }: Props) {
  return (
    <BaseLayout title="Stage 1">
      <p style={{ fontSize: "1.5rem" }}>{state.tvText}</p>
    </BaseLayout>
  );
}
