"use client";

import { useState } from "react";
import { Button } from "../../shared/Button";
import { Input } from "../../shared/Input";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { COPY } from "./copy";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export function GuessModal({ open, onClose, onSubmit }: Props) {
  const theme = useGameTheme();
  const [value, setValue] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    const t = value.trim();
    if (t) {
      onSubmit(t);
      setValue("");
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: theme.spacing.md,
        paddingLeft: "max(16px, env(safe-area-inset-left))",
        paddingRight: "max(16px, env(safe-area-inset-right))",
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
        paddingTop: "max(16px, env(safe-area-inset-top))",
      }}
      onClick={onClose}
    >
      <div
        dir="rtl"
        className="game-step-enter"
        style={{
          background: theme.colors.surface,
          borderRadius: theme.radiusCard ?? theme.radius,
          padding: theme.spacing.lg,
          maxWidth: "min(320px, 100%)",
          width: "100%",
          border: `2px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.cardElevated ?? theme.shadows.card,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ marginBottom: 12, fontSize: 16 }}>{COPY.finalPromptTitle}</p>
        <Input
          placeholder={COPY.finalPromptSub}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          style={{ width: "100%", marginBottom: 16, minHeight: 44 }}
          autoFocus
        />
        <Button onClick={handleSubmit} style={{ width: "100%", minHeight: 48 }}>
          {COPY.finalPromptSubmit}
        </Button>
      </div>
    </div>
  );
}

