"use client";

import { useGameTheme } from "./GameThemeProvider";

interface PlayerLayoutProps {
  stageTitle?: string;
  subtitle?: string;
  stickyBottom?: React.ReactNode;
  children: React.ReactNode;
}

export function PlayerLayout({
  stageTitle,
  subtitle,
  stickyBottom,
  children,
}: PlayerLayoutProps) {
  const theme = useGameTheme();

  return (
    <div
      dir="rtl"
      style={{
        maxWidth: "min(420px, 100vw)",
        width: "100%",
        margin: "0 auto",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        paddingLeft: "max(16px, env(safe-area-inset-left))",
        paddingRight: "max(16px, env(safe-area-inset-right))",
        paddingTop: "max(16px, env(safe-area-inset-top))",
        paddingBottom: stickyBottom
          ? 100
          : "max(16px, env(safe-area-inset-bottom))",
        boxSizing: "border-box",
      }}
    >
      {(stageTitle || subtitle) && (
        <div
          className="game-step-enter"
          style={{
            marginBottom: theme.spacing.lg,
            textAlign: "center",
            paddingTop: theme.spacing.sm,
          }}
        >
          {stageTitle && (
            <p
              style={{
                fontSize: "clamp(18px, 4.5vw, 22px)",
                fontWeight: 700,
                margin: 0,
                marginBottom: 4,
                color: theme.colors.text,
              }}
            >
              {stageTitle}
            </p>
          )}
          {subtitle && (
            <p
              style={{
                fontSize: "clamp(13px, 3.5vw, 15px)",
                margin: 0,
                color: theme.colors.textMuted,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div style={{ flex: 1 }}>{children}</div>

      {stickyBottom && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            padding: `${theme.spacing.md}px`,
            paddingBottom: `max(${theme.spacing.md}px, env(safe-area-inset-bottom))`,
            background: `linear-gradient(transparent, ${theme.colors.background} 30%)`,
            zIndex: 10,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              maxWidth: "min(420px, 100vw)",
              width: "100%",
              padding: "0 max(4px, env(safe-area-inset-left))",
            }}
          >
            {stickyBottom}
          </div>
        </div>
      )}
    </div>
  );
}
