"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useGameTheme } from "./shared/GameThemeProvider";
import type { GameHistoryItem } from "./types";

const TOTAL_LOCKS = 9;
const LOCK_LABEL = "Our Vision";

// Placeholder image – replace with real couple/relationship asset
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1200&q=80";

export interface MainProgressScreenProps {
  /** Synced lock states: true = open. Can be derived from gameHistory or Colyseus. */
  lockStates: boolean[];
  /** Current stage index (1–9). Used to know which lock is "next" to play. */
  currentStageIndex: number;
  /** Callback when user chooses to play a stage. Use to send room message e.g. room.send("ready") or room.send("requestStage", index). */
  onNavigateToStage: (stageIndex: number) => void;
  /** Optional: Colyseus room for sending messages. */
  room?: { send: (type: string, data?: unknown) => void };
  /** Role for layout (tv vs phone). */
  role: "player1" | "player2" | "tv";
}

/**
 * Derive lock states from game history.
 * Use this when Colyseus does not sync lockStates directly.
 */
export function deriveLockStatesFromHistory(
  gameHistory: GameHistoryItem[],
  totalLocks: number = TOTAL_LOCKS
): boolean[] {
  const opened = new Set(
    gameHistory.map((h) => h.stageIndex).filter((i) => i >= 1 && i <= totalLocks)
  );
  return Array.from({ length: totalLocks }, (_, i) => opened.has(i + 1));
}

export function MainProgressScreen({
  lockStates: controlledLockStates,
  currentStageIndex,
  onNavigateToStage,
  room,
  role,
}: MainProgressScreenProps) {
  const theme = useGameTheme();
  const [lockStates, setLockStates] = useState<boolean[]>(() =>
    controlledLockStates.length === TOTAL_LOCKS
      ? controlledLockStates
      : Array(TOTAL_LOCKS).fill(false)
  );
  const [justOpenedIndex, setJustOpenedIndex] = useState<number | null>(null);

  // Sync from parent when controlledLockStates change (e.g. from Colyseus state).
  // Colyseus placeholder: room.onMessage("stageComplete", (payload) => { const idx = payload.stageIndex - 1; setLockStates(prev => { const next = [...prev]; next[idx] = true; return next; }); setJustOpenedIndex(idx); });
  useEffect(() => {
    if (
      Array.isArray(controlledLockStates) &&
      controlledLockStates.length === TOTAL_LOCKS
    ) {
      setLockStates((prev) => {
        const next = controlledLockStates.slice();
        const changed = next.findIndex((open, i) => open !== prev[i]);
        if (changed !== -1) setJustOpenedIndex(changed);
        return next;
      });
    }
  }, [controlledLockStates]);

  useEffect(() => {
    if (justOpenedIndex === null) return;
    // Optional: play unlock sound or particle effect here, e.g. playUnlockSFX?.()
    const t = setTimeout(() => setJustOpenedIndex(null), 1200);
    return () => clearTimeout(t);
  }, [justOpenedIndex]);

  const openCount = useMemo(
    () => lockStates.filter(Boolean).length,
    [lockStates]
  );
  const allOpen = openCount >= TOTAL_LOCKS;
  const imageBlur = allOpen ? 0 : Math.max(0, 14 - openCount * 1.4);
  const imageOpacity = allOpen ? 1 : 0.35 + (openCount / TOTAL_LOCKS) * 0.55;

  const handleLockClick = useCallback(
    (index: number) => {
      const oneBased = index + 1;
      const isOpen = lockStates[index];
      const isNext = currentStageIndex === oneBased;
      if (isOpen) {
        // Replay or view: navigate to that stage
        onNavigateToStage(oneBased);
        return;
      }
      if (isNext) {
        // Start this stage
        onNavigateToStage(oneBased);
        if (room) room.send("ready");
      }
    },
    [lockStates, currentStageIndex, onNavigateToStage, room]
  );

  const isTV = role === "tv";

  return (
    <div
      className="main-progress-screen"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isTV ? theme.spacing.xl : theme.spacing.md,
        boxSizing: "border-box",
      }}
    >
      {/* Background image: blurred until all locks open, then warm glow */}
      <div
        className="main-progress-bg"
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${PLACEHOLDER_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: `blur(${imageBlur}px) brightness(0.5)`,
          opacity: imageOpacity,
          transition:
            "filter 1.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 1.5s ease",
        }}
      />
      {allOpen && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at center, rgba(252,211,77,0.12) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Vignette when nearing full completion (8–9 locks) */}
      {openCount >= 8 && (
        <div
          aria-hidden
          className="main-progress-vignette"
          style={{
            position: "absolute",
            inset: 0,
            boxShadow: "inset 0 0 120px 40px rgba(0,0,0,0.4)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* 3x3 lock grid */}
      <div
        className="main-progress-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: isTV ? 24 : 16,
          maxWidth: isTV ? 520 : 320,
          width: "100%",
          position: "relative",
          zIndex: 2,
        }}
      >
        {Array.from({ length: TOTAL_LOCKS }, (_, i) => (
          <LockCell
            key={i}
            index={i}
            label={LOCK_LABEL}
            isOpen={lockStates[i]}
            isNext={currentStageIndex === i + 1}
            justOpened={justOpenedIndex === i}
            onClick={() => handleLockClick(i)}
          />
        ))}
      </div>

      {/* Progress indicator */}
      <div
        className="main-progress-footer"
        style={{
          position: "absolute",
          bottom: isTV ? 48 : 32,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 2,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: isTV ? "clamp(14px, 1.8vw, 20px)" : "clamp(13px, 3.5vw, 16px)",
            color: theme.colors.textMuted,
            opacity: 0.9,
          }}
        >
          {openCount}/{TOTAL_LOCKS} Memories Unlocked
        </p>
        <div
          style={{
            marginTop: 8,
            height: 4,
            maxWidth: 200,
            marginLeft: "auto",
            marginRight: "auto",
            borderRadius: 2,
            background: "rgba(255,255,255,0.1)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(openCount / TOTAL_LOCKS) * 100}%`,
              background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              borderRadius: 2,
              boxShadow: `0 0 12px ${theme.colors.primaryGlow}`,
              transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface LockCellProps {
  index: number;
  label: string;
  isOpen: boolean;
  isNext: boolean;
  justOpened: boolean;
  onClick: () => void;
}

function LockCell({ index, label, isOpen, isNext, justOpened, onClick }: LockCellProps) {
  const theme = useGameTheme();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`main-progress-lock ${isOpen ? "main-progress-lock--open" : ""} ${justOpened ? "main-progress-lock--just-opened" : ""} ${isNext ? "main-progress-lock--next" : ""}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "12px 8px",
        background: "transparent",
        border: "none",
        cursor: isOpen || isNext ? "pointer" : "default",
        opacity: isOpen || isNext ? 1 : 0.85,
      }}
    >
      <span
        style={{
          fontSize: "clamp(10px, 1.2vw, 12px)",
          color: "rgba(255,255,255,0.7)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
      <div
        className="main-progress-lock-icon"
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isOpen
            ? `0 0 20px rgba(252,211,77,0.4), 0 4px 16px rgba(0,0,0,0.3)`
            : "0 6px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
          background: isOpen
            ? "linear-gradient(145deg, #d4a84b 0%, #b8860b 50%, #8b6914 100%)"
            : "linear-gradient(145deg, #3d3d3d 0%, #2a2a2a 50%, #1a1a1a 100%)",
          border: isOpen
            ? "1px solid rgba(252,211,77,0.5)"
            : "1px solid rgba(0,0,0,0.4)",
          transition:
            "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.5s ease, background 0.4s ease",
        }}
      >
        {isOpen ? (
          <UnlockedIcon />
        ) : (
          <LockedIcon />
        )}
      </div>
    </button>
  );
}

function LockedIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255,255,255,0.5)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function UnlockedIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(252,211,77,0.95)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}
