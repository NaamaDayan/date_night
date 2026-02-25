"use client";

import { useGameTheme } from "./GameThemeProvider";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

/**
 * Game-style button: glow on primary, smooth hover/active transitions, press feedback.
 */
export function Button({ variant = "primary", children, style, className = "", ...props }: ButtonProps) {
  const theme = useGameTheme();
  const isPrimary = variant === "primary";
  const pressClass = "game-btn-press";

  return (
    <button
      type="button"
      className={`${pressClass} ${className}`.trim()}
      style={{
        background: isPrimary
          ? `linear-gradient(180deg, ${theme.colors.primary} 0%, ${theme.colors.primaryHover} 100%)`
          : theme.colors.surface,
        color: isPrimary ? "#fff" : theme.colors.text,
        border: `2px solid ${isPrimary ? "transparent" : theme.colors.border}`,
        borderRadius: theme.radius,
        padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
        fontFamily: theme.fontFamily,
        fontSize: 16,
        fontWeight: 700,
        cursor: "pointer",
        boxShadow: isPrimary ? theme.shadows.primaryGlow : "0 4px 16px rgba(0,0,0,0.2)",
        transition: `background ${theme.animation.durationNormal} ${theme.animation.easeOut}, transform ${theme.animation.durationFast} ${theme.animation.easeOut}, box-shadow ${theme.animation.durationNormal} ease`,
        ...style,
      }}
      onMouseOver={(e) => {
        if (isPrimary) {
          e.currentTarget.style.boxShadow = theme.shadows.primaryGlowStrong;
          e.currentTarget.style.transform = "translateY(-2px)";
        } else {
          e.currentTarget.style.background = theme.colors.surfaceElevated;
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = theme.shadows.card;
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        if (isPrimary) {
          e.currentTarget.style.boxShadow = theme.shadows.primaryGlow;
        } else {
          e.currentTarget.style.background = theme.colors.surface;
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
}
