"use client";

import { useGameTheme } from "./GameThemeProvider";

interface BaseLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function BaseLayout({ title, children }: BaseLayoutProps) {
  const theme = useGameTheme();
  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <h1
        style={{
          fontSize: 24,
          marginBottom: theme.spacing.lg,
          color: theme.colors.text,
          fontWeight: 700,
        }}
      >
        {title}
      </h1>
      {children}
    </div>
  );
}
