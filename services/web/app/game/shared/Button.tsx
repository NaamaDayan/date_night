"use client";

import { useGameTheme } from "./GameThemeProvider";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  loading = false,
  children,
  style,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const theme = useGameTheme();
  const isPrimary = variant === "primary";
  const isDisabled = disabled || loading;
  const pressClass = "game-btn-press";

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={`${pressClass} ${className}`.trim()}
      style={{
        background: isPrimary
          ? `linear-gradient(180deg, ${theme.colors.primary} 0%, ${theme.colors.primaryHover} 100%)`
          : theme.colors.surface,
        color: isPrimary ? "#fff" : theme.colors.text,
        border: `2px solid ${isPrimary ? "transparent" : theme.colors.border}`,
        borderRadius: theme.radius,
        padding: `${theme.spacing.sm + 4}px ${theme.spacing.md}px`,
        fontFamily: theme.fontFamily,
        fontSize: 16,
        fontWeight: 700,
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.55 : 1,
        boxShadow: isPrimary
          ? theme.shadows.primaryGlow
          : "0 4px 16px rgba(0,0,0,0.2)",
        transition: `background ${theme.animation.durationNormal} ${theme.animation.easeOut}, transform ${theme.animation.durationFast} ${theme.animation.easeOut}, box-shadow ${theme.animation.durationNormal} ease, opacity ${theme.animation.durationNormal} ease`,
        minHeight: 48,
        ...style,
      }}
      onMouseOver={
        !isDisabled
          ? (e) => {
              if (isPrimary) {
                e.currentTarget.style.boxShadow =
                  theme.shadows.primaryGlowStrong;
                e.currentTarget.style.transform = "translateY(-2px)";
              } else {
                e.currentTarget.style.background =
                  theme.colors.surfaceElevated;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = theme.shadows.card;
              }
            }
          : undefined
      }
      onMouseOut={
        !isDisabled
          ? (e) => {
              e.currentTarget.style.transform = "translateY(0)";
              if (isPrimary) {
                e.currentTarget.style.boxShadow = theme.shadows.primaryGlow;
              } else {
                e.currentTarget.style.background = theme.colors.surface;
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(0,0,0,0.2)";
              }
            }
          : undefined
      }
      {...props}
    >
      {loading ? (
        <span className="game-dots-loading">
          <span>·</span>
          <span>·</span>
          <span>·</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
