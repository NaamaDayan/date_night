"use client";

import { useGameTheme } from "./GameThemeProvider";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export function Button({ variant = "primary", children, style, ...props }: ButtonProps) {
  const theme = useGameTheme();
  return (
    <button
      type="button"
      style={{
        background: variant === "primary" ? theme.colors.primary : theme.colors.surface,
        color: theme.colors.text,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius,
        padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
        fontFamily: theme.fontFamily,
        fontSize: 16,
        cursor: "pointer",
        ...style,
      }}
      onMouseOver={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.background = theme.colors.primaryHover;
        }
      }}
      onMouseOut={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.background = theme.colors.primary;
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
}
