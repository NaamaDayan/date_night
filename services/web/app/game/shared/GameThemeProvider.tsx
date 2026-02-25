"use client";

import React from "react";
import "../GameStyles.css";

/**
 * Design tokens for game-like feel: animations, easing, neon glows.
 * Keeps a vibrant, modern casual-game vibe (mobile/indie style) without changing logic.
 */
const theme = {
  fontFamily: '"Nunito", "Segoe UI", system-ui, sans-serif',
  colors: {
    background: "#12101a",
    backgroundGradientStart: "#1a1625",
    backgroundGradientEnd: "#0f0d14",
    surface: "#1e1a2a",
    surfaceElevated: "#2a2438",
    primary: "#ec4899",
    primaryHover: "#f472b6",
    primaryGlow: "rgba(236, 72, 153, 0.5)",
    secondary: "#c4b5fd",
    accent: "#fcd34d",
    accentGlow: "rgba(252, 211, 77, 0.45)",
    text: "#fef3c7",
    textMuted: "#a78bfa",
    border: "#3d3550",
    success: "#6ee7b7",
    successGlow: "rgba(110, 231, 183, 0.35)",
    error: "#fca5a5",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: 14,
  radiusCard: 16,
  shadows: {
    primaryGlow: "0 0 24px rgba(236, 72, 153, 0.4)",
    primaryGlowStrong: "0 0 32px rgba(236, 72, 153, 0.5)",
    accentGlow: "0 0 20px rgba(252, 211, 77, 0.35)",
    card: "0 8px 32px rgba(0, 0, 0, 0.35)",
    cardElevated: "0 12px 40px rgba(0, 0, 0, 0.4)",
  },
  animation: {
    durationFast: "0.2s",
    durationNormal: "0.35s",
    durationSlow: "0.5s",
    easeOut: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  },
};

export const GameThemeContext = React.createContext(theme);

export function GameThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <GameThemeContext.Provider value={theme}>
      <div
        className="game-root"
        style={{
          fontFamily: theme.fontFamily,
          background: theme.colors.background,
          color: theme.colors.text,
          minHeight: "100vh",
          padding: theme.spacing.md,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated gradient background – rich, dynamic dark (no flat) */}
        <div
          className="game-bg-animated"
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, ${theme.colors.backgroundGradientStart} 0%, ${theme.colors.background} 40%, ${theme.colors.backgroundGradientEnd} 100%)`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        {/* Floating orbs – subtle parallax-style motion */}
        <div
          className="game-float-orb"
          aria-hidden
          style={{
            width: 280,
            height: 280,
            left: "10%",
            top: "20%",
            background: `radial-gradient(circle, ${theme.colors.primaryGlow} 0%, transparent 70%)`,
            zIndex: 0,
          }}
        />
        <div
          className="game-float-orb"
          aria-hidden
          style={{
            width: 200,
            height: 200,
            right: "15%",
            bottom: "25%",
            background: `radial-gradient(circle, ${theme.colors.accentGlow} 0%, transparent 70%)`,
            animationDelay: "-3s",
            zIndex: 0,
          }}
        />
        <div
          className="game-float-orb"
          aria-hidden
          style={{
            width: 160,
            height: 160,
            left: "50%",
            bottom: "10%",
            background: `radial-gradient(circle, rgba(196, 181, 253, 0.25) 0%, transparent 70%)`,
            animationDelay: "-5s",
            zIndex: 0,
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      </div>
    </GameThemeContext.Provider>
  );
}

export function useGameTheme() {
  return React.useContext(GameThemeContext);
}
