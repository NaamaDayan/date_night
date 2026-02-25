"use client";

import dynamic from "next/dynamic";
import { InterimScreen } from "./InterimScreen";
import type { SyncedGameState } from "./types";
import type { QuestionnaireData } from "./types";
import type { GameHistoryItem } from "./types";
import type { Role } from "./types";

const Stage1 = dynamic(() => import("./stages/1").then((m) => ({ default: m.Player1View })), { ssr: false });
const Stage1P2 = dynamic(() => import("./stages/1").then((m) => ({ default: m.Player2View })), { ssr: false });
const Stage1TV = dynamic(() => import("./stages/1").then((m) => ({ default: m.TVView })), { ssr: false });
const Stage2 = dynamic(() => import("./stages/2").then((m) => ({ default: m.Player1View })), { ssr: false });
const Stage2P2 = dynamic(() => import("./stages/2").then((m) => ({ default: m.Player2View })), { ssr: false });
const Stage2TV = dynamic(() => import("./stages/2").then((m) => ({ default: m.TVView })), { ssr: false });
const Stage3 = dynamic(() => import("./stages/3").then((m) => ({ default: m.Player1View })), { ssr: false });
const Stage3P2 = dynamic(() => import("./stages/3").then((m) => ({ default: m.Player2View })), { ssr: false });
const Stage3TV = dynamic(() => import("./stages/3").then((m) => ({ default: m.TVView })), { ssr: false });
const Stage4 = dynamic(() => import("./stages/4").then((m) => ({ default: m.Player1View })), { ssr: false });
const Stage4P2 = dynamic(() => import("./stages/4").then((m) => ({ default: m.Player2View })), { ssr: false });
const Stage4TV = dynamic(() => import("./stages/4").then((m) => ({ default: m.TVView })), { ssr: false });

interface Props {
  state: SyncedGameState;
  room: { send: (type: string, data?: unknown) => void };
  role: Role;
  questionnaire: QuestionnaireData;
  gameHistory: GameHistoryItem[];
}

const STAGE_ENDED = 1000;

export function StageSwitcher({ state, room, role, questionnaire, gameHistory }: Props) {
  const phase = state.gameState || "WAITING_FOR_START";
  const stageIndex = state.currentStageIndex ?? state.stage ?? 0;

  if (phase === "INTERIM_SCREEN") {
    return <InterimScreen state={state} room={room} role={role === "tv" ? "tv" : role} />;
  }

  if (phase === "ENDED" || stageIndex >= STAGE_ENDED) {
    return (
      <div style={{ textAlign: "center", padding: 24 }}>
        <h2>{state.message || "You won the game!"}</h2>
      </div>
    );
  }

  const isTV = role === "tv";
  const isP1 = role === "player1";

  if (stageIndex === 1) {
    if (isTV) return <Stage1TV state={state} />;
    return isP1 ? <Stage1 state={state} room={room} questionnaire={questionnaire} /> : <Stage1P2 state={state} room={room} questionnaire={questionnaire} />;
  }
  if (stageIndex === 2) {
    if (isTV) return <Stage2TV state={state} />;
    return isP1 ? <Stage2 state={state} room={room} questionnaire={questionnaire} /> : <Stage2P2 state={state} room={room} questionnaire={questionnaire} />;
  }
  if (stageIndex === 3) {
    if (isTV) return <Stage3TV state={state} />;
    return isP1 ? <Stage3 state={state} room={room} questionnaire={questionnaire} /> : <Stage3P2 state={state} room={room} questionnaire={questionnaire} />;
  }
  if (stageIndex === 4) {
    if (isTV) return <Stage4TV state={state} />;
    return isP1 ? <Stage4 state={state} room={room} questionnaire={questionnaire} /> : <Stage4P2 state={state} room={room} questionnaire={questionnaire} />;
  }

  return (
    <div style={{ padding: 24 }}>
      <p>{state.message || "Waiting for players..."}</p>
    </div>
  );
}
