"use client";

import { useMemo } from "react";
import type { SyncedGameState, QuestionnaireData } from "../../types";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { TVLayout } from "../../shared/TVLayout";
import { TVText } from "./HighlightedText";

interface Props {
  state: SyncedGameState;
}

const STAGE_TITLE = "שנת ההיכרות";

export function TVView({ state }: Props) {
  const theme = useGameTheme();
  const questionnaire: QuestionnaireData = useMemo(() => {
    try {
      return (JSON.parse(state.questionnaireJson || "{}") as QuestionnaireData) || {
        partner1Name: "Player 1",
        partner2Name: "Player 2",
        howLong: "",
        howMet: "",
        whereMet: "",
      };
    } catch {
      return {
        partner1Name: "Player 1",
        partner2Name: "Player 2",
        howLong: "",
        howMet: "",
        whereMet: "",
      };
    }
  }, [state.questionnaireJson]);

  const headline = `${STAGE_TITLE} — ${questionnaire.partner1Name} & ${questionnaire.partner2Name}`;

  return (
    <TVLayout stageNumber={2}>
      <div style={{ maxWidth: "min(640px, 90vw)", textAlign: "center" }}>
        <h1
          style={{
            fontSize: theme.typography.tvTitle,
            margin: 0,
            marginBottom: 24,
            color: theme.colors.text,
            fontWeight: 800,
          }}
        >
          {headline}
        </h1>
        <p
          style={{
            fontSize: theme.typography.tvBody,
            margin: 0,
            lineHeight: 1.8,
            color: theme.colors.text,
          }}
        >
          <TVText />
        </p>
      </div>
    </TVLayout>
  );
}
