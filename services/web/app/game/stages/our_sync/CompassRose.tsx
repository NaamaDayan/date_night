"use client";

import { useEffect, useState } from "react";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { directionSymbol } from "./copy";
import type { OurSyncDirection } from "./types";

/** Compass rose: N top, S bottom; E left / W right; NE top-left, NW top-right, SE bottom-left, SW bottom-right. */
const COMPASS_ROSE: (OurSyncDirection | null)[][] = [
  ["north-east", "north", "north-west"],
  ["east", null, "west"],
  ["south-east", "south", "south-west"],
];

interface CompassRoseProps {
  allowedDirections: OurSyncDirection[];
  isLocked: boolean;
  onMove: (direction: OurSyncDirection) => void;
  lastWrongFor: "player1" | "player2" | null;
  myRole: "player1" | "player2";
}

export function CompassRose({
  allowedDirections,
  isLocked,
  onMove,
  lastWrongFor,
  myRole,
}: CompassRoseProps) {
  const theme = useGameTheme();
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (lastWrongFor === myRole) {
      setShake(true);
      if (typeof window !== "undefined" && "vibrate" in window.navigator) {
        try {
          window.navigator.vibrate(50);
        } catch {
          // ignore
        }
      }
      const t = setTimeout(() => setShake(false), 300);
      return () => clearTimeout(t);
    }
  }, [lastWrongFor, myRole]);

  return (
    <div
      style={{
        width: "min(80vw, 280px)",
        aspectRatio: "1 / 1",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr 1fr",
        gap: 10,
        alignContent: "stretch",
        justifyItems: "stretch",
      }}
    >
      {COMPASS_ROSE.flat().map((dir, idx) => {
        if (dir === null) {
          return <div key="center" style={{ minHeight: 0 }} />;
        }
        const allowed = allowedDirections.includes(dir);
        const disabled = !allowed || isLocked;
        return (
          <button
            key={dir}
            type="button"
            className={`game-btn-press game-option-btn${shake && allowed ? " game-shake" : ""}`}
            disabled={disabled}
            onClick={() => {
              if (disabled) return;
              onMove(dir);
            }}
            style={{
              opacity: allowed ? 1 : 0.3,
              pointerEvents: allowed && !isLocked ? "auto" : "none",
              borderRadius: 999,
              border: `2px solid ${theme.colors.border}`,
              background: theme.colors.surface,
              color: theme.colors.text,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 700,
              minHeight: 0,
            }}
          >
            {directionSymbol(dir)}
          </button>
        );
      })}
    </div>
  );
}
