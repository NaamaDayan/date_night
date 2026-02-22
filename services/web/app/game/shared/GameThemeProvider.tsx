"use client";

import React from "react";

const theme = {
  fontFamily: '"Segoe UI", system-ui, sans-serif',
  colors: {
    primary: "#6366f1",
    primaryHover: "#4f46e5",
    background: "#0f0f14",
    surface: "#1a1a24",
    text: "#e4e4e7",
    textMuted: "#a1a1aa",
    border: "#27272a",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: 8,
};

export const GameThemeContext = React.createContext(theme);

export function GameThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <GameThemeContext.Provider value={theme}>
      <div
        style={{
          fontFamily: theme.fontFamily,
          background: theme.colors.background,
          color: theme.colors.text,
          minHeight: "100vh",
          padding: theme.spacing.md,
        }}
      >
        {children}
      </div>
    </GameThemeContext.Provider>
  );
}

export function useGameTheme() {
  return React.useContext(GameThemeContext);
}
