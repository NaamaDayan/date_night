"use client";

import { useGameTheme } from "./GameThemeProvider";

interface TVLayoutProps {
  stageNumber?: number;
  totalStages?: number;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function TVLayout({
  stageNumber,
  totalStages = 4,
  footer,
  children,
}: TVLayoutProps) {
  const theme = useGameTheme();

  return (
    <div
      dir="rtl"
      style={{
        width: "100%",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        margin: -theme.spacing.md,
        padding: 0,
      }}
    >
      {stageNumber != null && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: `${theme.spacing.md}px ${theme.spacing.xl}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: theme.spacing.sm,
            zIndex: 5,
          }}
        >
          {Array.from({ length: totalStages }, (_, i) => (
            <div
              key={i}
              style={{
                width: "clamp(32px, 5vw, 56px)",
                height: 5,
                borderRadius: 3,
                background:
                  i + 1 <= stageNumber
                    ? theme.colors.primary
                    : `${theme.colors.border}80`,
                transition: "background 0.4s ease",
              }}
            />
          ))}
        </div>
      )}

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 2,
          padding: `${theme.spacing.xl + 16}px ${theme.spacing.xl}px ${footer ? theme.spacing.xl + 32 : theme.spacing.xl}px`,
          maxWidth: 1400,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>

      {footer && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: `${theme.spacing.md}px ${theme.spacing.xl}px`,
            textAlign: "center",
            zIndex: 5,
          }}
        >
          {typeof footer === "string" ? (
            <p
              style={{
                fontSize: "clamp(12px, 1.4vw, 16px)",
                color: theme.colors.textMuted,
                margin: 0,
                opacity: 0.7,
              }}
            >
              {footer}
            </p>
          ) : (
            footer
          )}
        </div>
      )}
    </div>
  );
}
