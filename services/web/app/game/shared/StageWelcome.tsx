"use client";

import { useGameTheme } from "./GameThemeProvider";
import { Button } from "./Button";
import { TVLayout } from "./TVLayout";
import { PlayerLayout } from "./PlayerLayout";
import { shared } from "../copy/shared";

interface StageWelcomeProps {
  stageNumber: number;
  stageTitle: string;
  subtitle: string;
  instructions?: string;
  themeIcon?: string;
  hideStageNumber?: boolean;
  isTV: boolean;
  isReady?: boolean;
  partnerReady?: boolean;
  onReady?: () => void;
}

export function StageWelcome({
  stageNumber,
  stageTitle,
  subtitle,
  instructions,
  themeIcon,
  hideStageNumber,
  isTV,
  isReady = false,
  partnerReady = false,
  onReady,
}: StageWelcomeProps) {
  if (isTV) {
    return (
      <TVWelcome
        stageNumber={stageNumber}
        stageTitle={stageTitle}
        subtitle={subtitle}
        themeIcon={themeIcon}
        hideStageNumber={hideStageNumber}
      />
    );
  }

  return (
    <PlayerWelcome
      stageNumber={stageNumber}
      stageTitle={stageTitle}
      subtitle={subtitle}
      instructions={instructions}
      themeIcon={themeIcon}
      hideStageNumber={hideStageNumber}
      isReady={isReady}
      partnerReady={partnerReady}
      onReady={onReady}
    />
  );
}

function TVWelcome({
  stageNumber,
  stageTitle,
  subtitle,
  themeIcon,
  hideStageNumber,
}: {
  stageNumber: number;
  stageTitle: string;
  subtitle: string;
  themeIcon?: string;
  hideStageNumber?: boolean;
}) {
  const theme = useGameTheme();

  return (
    <TVLayout stageNumber={stageNumber}>
      <div
        className="game-welcome-enter"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        {themeIcon && (
          <span
            className="game-welcome-icon"
            style={{
              fontSize: "clamp(48px, 8vw, 80px)",
              display: "block",
            }}
          >
            {themeIcon}
          </span>
        )}

        <div
          className="game-welcome-enter game-welcome-enter-delay-1"
          style={{ textAlign: "center" }}
        >
          {!hideStageNumber && (
            <p
              style={{
                fontSize: "clamp(14px, 2vw, 18px)",
                fontWeight: 600,
                color: theme.colors.primary,
                margin: 0,
                marginBottom: 8,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Stage {stageNumber}
            </p>
          )}
          <h1
            className="game-text-glow"
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 800,
              color: theme.colors.text,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {stageTitle}
          </h1>
        </div>

        <p
          className="game-welcome-enter game-welcome-enter-delay-2"
          style={{
            fontSize: "clamp(16px, 2.5vw, 24px)",
            color: theme.colors.textMuted,
            margin: 0,
            marginTop: 8,
            maxWidth: "min(600px, 80vw)",
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>

        <div
          className="game-welcome-enter game-welcome-enter-delay-3 game-dots-loading"
          style={{
            marginTop: 24,
            fontSize: "clamp(16px, 2vw, 22px)",
            color: theme.colors.textMuted,
            opacity: 0.6,
          }}
        >
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      </div>
    </TVLayout>
  );
}

function PlayerWelcome({
  stageNumber,
  stageTitle,
  subtitle,
  instructions,
  themeIcon,
  hideStageNumber,
  isReady,
  partnerReady,
  onReady,
}: {
  stageNumber: number;
  stageTitle: string;
  subtitle: string;
  instructions?: string;
  themeIcon?: string;
  hideStageNumber?: boolean;
  isReady: boolean;
  partnerReady: boolean;
  onReady?: () => void;
}) {
  const theme = useGameTheme();

  const readyButton = !isReady ? (
    <Button
      onClick={onReady}
      style={{ width: "100%", minHeight: 56, fontSize: 18 }}
    >
      מוכנים!
    </Button>
  ) : (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        className="game-ready-check"
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: theme.colors.success,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          color: theme.colors.background,
        }}
      >
        ✓
      </div>
      <p
        style={{
          fontSize: 14,
          color: theme.colors.textMuted,
          margin: 0,
        }}
      >
        {partnerReady
          ? shared.bothReady
          : shared.waitingForPartnerEllipsis}
      </p>
    </div>
  );

  return (
    <PlayerLayout stickyBottom={readyButton}>
      <div
        className="game-welcome-enter"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60dvh",
          textAlign: "center",
          gap: 12,
        }}
      >
        {themeIcon && (
          <span
            className="game-welcome-icon"
            style={{ fontSize: 48, display: "block" }}
          >
            {themeIcon}
          </span>
        )}

        {!hideStageNumber && (
          <p
            className="game-welcome-enter game-welcome-enter-delay-1"
            style={{
              fontSize: "clamp(12px, 3.5vw, 14px)",
              fontWeight: 600,
              color: theme.colors.primary,
              margin: 0,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Stage {stageNumber}
          </p>
        )}

        <h1
          className="game-welcome-enter game-welcome-enter-delay-1"
          style={{
            fontSize: "clamp(24px, 6vw, 32px)",
            fontWeight: 800,
            color: theme.colors.text,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {stageTitle}
        </h1>

        <p
          className="game-welcome-enter game-welcome-enter-delay-2"
          style={{
            fontSize: "clamp(15px, 4vw, 18px)",
            color: theme.colors.textMuted,
            margin: 0,
            marginTop: 4,
            maxWidth: 320,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>

        {instructions && (
          <div
            className="game-welcome-enter game-welcome-enter-delay-3 game-card"
            style={{
              marginTop: 16,
              padding: "16px 20px",
              maxWidth: 340,
              width: "100%",
              textAlign: "right",
            }}
          >
            <p
              style={{
                fontSize: "clamp(13px, 3.5vw, 15px)",
                color: theme.colors.text,
                margin: 0,
                lineHeight: 1.6,
                opacity: 0.9,
              }}
            >
              {instructions}
            </p>
          </div>
        )}
      </div>
    </PlayerLayout>
  );
}
