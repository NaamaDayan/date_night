"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { InterimScreen } from "./InterimScreen";
import { NameEntryScreen } from "./NameEntryScreen";
import { StageWelcome } from "./shared/StageWelcome";
import { TVLayout } from "./shared/TVLayout";
import { PlayerLayout } from "./shared/PlayerLayout";
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
const Stage5 = dynamic(() => import("./stages/5").then((m) => ({ default: m.Player1View })), { ssr: false });
const Stage5P2 = dynamic(() => import("./stages/5").then((m) => ({ default: m.Player2View })), { ssr: false });
const Stage5TV = dynamic(() => import("./stages/5").then((m) => ({ default: m.TVView })), { ssr: false });
const Stage6 = dynamic(() => import("./stages/6").then((m) => ({ default: m.Player1View })), { ssr: false });
const Stage6P2 = dynamic(() => import("./stages/6").then((m) => ({ default: m.Player2View })), { ssr: false });
const Stage6TV = dynamic(() => import("./stages/6").then((m) => ({ default: m.TVView })), { ssr: false });

const STAGE_WELCOME_CONFIG: Record<
  number,
  { title: string; subtitle: string; instructions?: string; icon: string; hideStageNumber?: boolean }
> = {
  1: {
    title: "He Said · She Said",
    subtitle: "ענו יחד על שאלות כדי לחשוף את התמונה הנסתרת",
    instructions:
      "כל תשובה תואמת חושפת עוד חלק מהתמונה. נסו לנחש מה מסתתר!",
    icon: "💬",
  },
  2: {
    title: "שנת ההיכרות",
    subtitle: "מצאו את המשפט המוסתר והזינו את המספר",
    instructions:
      "כל אחד רואה אותיות מסומנות שונות. חברו את המשפט והזינו את המספר הנכון.",
    icon: "📅",
  },
  3: {
    title: "Sound Date Puzzle",
    subtitle: "הקשיבו, זכרו וסדרו את התאריך המיוחד",
    instructions:
      "לחצו על הכפתורים כדי לשמוע ספרות, ואז סדרו אותן בסדר הנכון.",
    icon: "🔊",
  },
  4: {
    title: "Our Vision Board",
    subtitle: "בנו את החזון המשותף שלכם",
    instructions:
      "בחרו בין אפשרויות. כשאתם בוחרים אותו דבר — זה נכנס ל-Vision Board!",
    icon: "🌟",
  },
  5: {
    title: "Zoom Map",
    subtitle: "תארו, נחשו וגלו את המיקום הסודי",
    instructions:
      "התחלפו בין תיאור וניחוש מילים. כל ניחוש נכון מקרב אתכם ליעד!",
    icon: "🗺️",
  },
  6: {
    title: "Our experiences",
    subtitle: "קומו מהספה, הגיע הזמן לזוז קצת",
    instructions: undefined,
    icon: "🎯",
    hideStageNumber: true,
  },
};

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

  const welcomePayload = useMemo(() => {
    try {
      const p = JSON.parse(state.stagePayloadJson || "{}");
      return {
        welcomeStatus: p.welcomeStatus as string | undefined,
        welcomeP1Ready: Boolean(p.welcomeP1Ready),
        welcomeP2Ready: Boolean(p.welcomeP2Ready),
      };
    } catch {
      return { welcomeStatus: undefined, welcomeP1Ready: false, welcomeP2Ready: false };
    }
  }, [state.stagePayloadJson]);

  if (phase === "NAME_ENTRY") {
    return <NameEntryScreen state={state} room={room} role={role === "tv" ? "tv" : role} />;
  }

  if (phase === "INTERIM_SCREEN") {
    return <InterimScreen state={state} room={room} role={role === "tv" ? "tv" : role} />;
  }

  if (phase === "ENDED" || stageIndex >= STAGE_ENDED) {
    const isTV = role === "tv";
    if (isTV) {
      return (
        <TVLayout>
          <div className="game-welcome-enter" style={{ textAlign: "center" }}>
            <span className="game-welcome-icon" style={{ fontSize: "clamp(48px, 8vw, 80px)", display: "block", marginBottom: 16 }}>🎉</span>
            <h2 className="game-text-glow" style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 800, margin: 0 }}>
              {state.message || "You won the game!"}
            </h2>
          </div>
        </TVLayout>
      );
    }
    return (
      <PlayerLayout>
        <div className="game-welcome-enter" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60dvh", gap: 16 }}>
          <span style={{ fontSize: 48 }}>🎉</span>
          <h2 style={{ fontSize: "clamp(22px, 5.5vw, 28px)", fontWeight: 800, margin: 0 }}>
            {state.message || "You won the game!"}
          </h2>
        </div>
      </PlayerLayout>
    );
  }

  if (
    phase === "IN_PROGRESS" &&
    welcomePayload.welcomeStatus === "welcome" &&
    STAGE_WELCOME_CONFIG[stageIndex]
  ) {
    const config = STAGE_WELCOME_CONFIG[stageIndex];
    const isTV = role === "tv";
    const isP1 = role === "player1";
    const myReady = isP1 ? welcomePayload.welcomeP1Ready : welcomePayload.welcomeP2Ready;
    const partnerReady = isP1 ? welcomePayload.welcomeP2Ready : welcomePayload.welcomeP1Ready;

    return (
      <StageWelcome
        stageNumber={stageIndex}
        stageTitle={config.title}
        subtitle={config.subtitle}
        instructions={config.instructions}
        themeIcon={config.icon}
        hideStageNumber={config.hideStageNumber}
        isTV={isTV}
        isReady={myReady}
        partnerReady={partnerReady}
        onReady={() => room.send("playerReady")}
      />
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
  if (stageIndex === 5) {
    if (isTV) return <Stage5TV state={state} />;
    return isP1 ? <Stage5 state={state} room={room} questionnaire={questionnaire} /> : <Stage5P2 state={state} room={room} questionnaire={questionnaire} />;
  }
  if (stageIndex === 6) {
    if (isTV) return <Stage6TV state={state} room={room} />;
    return isP1 ? <Stage6 state={state} room={room} questionnaire={questionnaire} /> : <Stage6P2 state={state} room={room} questionnaire={questionnaire} />;
  }

  return (
    <PlayerLayout>
      <div
        className="game-welcome-enter"
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60dvh",
          gap: 16,
        }}
      >
        <div
          className="game-dots-loading"
          style={{ fontSize: 24, color: "inherit" }}
        >
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
        <p style={{ fontSize: "clamp(16px, 4vw, 20px)", margin: 0, opacity: 0.7 }}>
          {state.message || "Waiting for players..."}
        </p>
      </div>
    </PlayerLayout>
  );
}
