"use client";

import { useEffect, useState } from "react";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { COPY } from "./copy";

const TOAST_DURATION_MS = 3000;

interface Props {
  showWrong: boolean;
  showCorrect: boolean;
  onDismissWrong: () => void;
}

export function GuessToast({ showWrong, showCorrect, onDismissWrong }: Props) {
  const theme = useGameTheme();
  const [visibleWrong, setVisibleWrong] = useState(false);
  const [visibleCorrect, setVisibleCorrect] = useState(false);

  useEffect(() => {
    if (showWrong) {
      setVisibleWrong(true);
      const t = setTimeout(() => {
        setVisibleWrong(false);
        onDismissWrong();
      }, TOAST_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [showWrong, onDismissWrong]);

  useEffect(() => {
    if (showCorrect) {
      setVisibleCorrect(true);
      const t = setTimeout(() => setVisibleCorrect(false), 2500);
      return () => clearTimeout(t);
    }
  }, [showCorrect]);

  if (!visibleWrong && !visibleCorrect) return null;

  const isCorrect = visibleCorrect;
  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        top: "max(16px, env(safe-area-inset-top))",
        left: "max(16px, env(safe-area-inset-left))",
        right: "max(16px, env(safe-area-inset-right))",
        margin: "0 auto",
        maxWidth: 320,
        padding: "14px 20px",
        borderRadius: theme.radius,
        background: isCorrect ? theme.colors.success : theme.colors.error,
        color: theme.colors.background,
        fontSize: 17,
        fontWeight: 600,
        textAlign: "center",
        zIndex: 999,
        boxShadow: theme.shadows?.card ?? "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {isCorrect ? COPY.guessCorrect : COPY.guessWrong}
    </div>
  );
}

