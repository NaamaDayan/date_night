"use client";

import { useGameTheme } from "./GameThemeProvider";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ style, ...props }: InputProps) {
  const theme = useGameTheme();
  return (
    <input
      style={{
        background: theme.colors.surface,
        color: theme.colors.text,
        border: `2px solid ${theme.colors.border}`,
        borderRadius: theme.radius,
        padding: `${theme.spacing.sm + 4}px ${theme.spacing.md}px`,
        fontFamily: theme.fontFamily,
        fontSize: 16,
        fontWeight: 500,
        minWidth: 200,
        minHeight: 48,
        boxSizing: "border-box",
        transition: `border-color ${theme.animation.durationNormal}, box-shadow ${theme.animation.durationNormal}, transform ${theme.animation.durationFast} ${theme.animation.easeOut}`,
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = theme.colors.primary;
        e.currentTarget.style.boxShadow = theme.shadows.primaryGlow;
        e.currentTarget.style.transform = "scale(1.02)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = theme.colors.border;
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "scale(1)";
      }}
      {...props}
    />
  );
}
