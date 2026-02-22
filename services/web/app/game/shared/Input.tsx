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
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius,
        padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
        fontFamily: theme.fontFamily,
        fontSize: 16,
        minWidth: 200,
        ...style,
      }}
      {...props}
    />
  );
}
