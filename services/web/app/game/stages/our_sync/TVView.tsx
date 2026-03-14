"use client";

import { useEffect, useRef } from "react";
import { parseOurSyncPayload } from "./types";
import { MATRIX_OVERLAY } from "./matrixOverlay";
import { COPY } from "./copy";
import { useGameTheme } from "../../shared/GameThemeProvider";
import { TVLayout } from "../../shared/TVLayout";
import type { SyncedGameState } from "../../types";

const GRID_COLS = 25;
const GRID_ROWS = 25;
const START_X = 4;
const START_Y = 1;
const BOOST_COLOR = "#fbbf24";
const BOOST_GLOW = "rgba(251, 191, 36, 0.6)";
const NORMAL_LINE_COLOR = "#ffffff";

interface Segment {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isBoost: boolean;
}

interface TVViewProps {
  state: SyncedGameState;
  room: { send: (type: string, data?: unknown) => void };
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, borderColor: string) {
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 0.5;
  for (let c = 0; c <= GRID_COLS; c++) {
    const x = (c / GRID_COLS) * width + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let r = 0; r <= GRID_ROWS; r++) {
    const y = (r / GRID_ROWS) * height + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawStep(
  ctx: CanvasRenderingContext2D,
  segment: Segment,
  cellW: number,
  cellH: number,
  lineWidth: number,
  textColor: string,
  isBoost: boolean
) {
  const fromX = (segment.from.x + 0.5) * cellW;
  const fromY = (segment.from.y + 0.5) * cellH;
  const toX = (segment.to.x + 0.5) * cellW;
  const toY = (segment.to.y + 0.5) * cellH;
  ctx.strokeStyle = isBoost ? BOOST_COLOR : textColor;
  ctx.lineWidth = isBoost ? lineWidth * 1.4 : lineWidth;
  ctx.lineCap = "round";
  if (isBoost) {
    ctx.shadowColor = BOOST_GLOW;
    ctx.shadowBlur = 12;
  }
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

export function TVView({ state }: TVViewProps) {
  const theme = useGameTheme();
  const payload = parseOurSyncPayload(state.stagePayloadJson);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const segmentsRef = useRef<Segment[]>([]);
  const lastCursorRef = useRef({ x: START_X, y: START_Y });
  const initializedRef = useRef(false);
  const finalizedBoostRef = useRef(false);

  const cursorX = payload.cursorX ?? START_X;
  const cursorY = payload.cursorY ?? START_Y;
  const isBoostStep = Boolean(payload.isBoostStep);
  const boostJustFinished = Boolean(payload.boostJustFinished);
  const gameState = payload.gameState || "PLAYING";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellW = width / GRID_COLS;
    const cellH = height / GRID_ROWS;
    const lineWidth = Math.max(2, Math.min(cellW, cellH) * 0.2);

    if (!initializedRef.current || (payload.currentStepIndex ?? 0) === 0) {
      initializedRef.current = true;
      finalizedBoostRef.current = false;
      segmentsRef.current = [];
      lastCursorRef.current = { x: START_X, y: START_Y };
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = theme.colors.background;
      ctx.fillRect(0, 0, width, height);
      drawGrid(ctx, width, height, theme.colors.border);
    }

    const last = lastCursorRef.current;
    const moved = last.x !== cursorX || last.y !== cursorY;
    if (moved) {
      if (isBoostStep) finalizedBoostRef.current = false;
      segmentsRef.current.push({
        from: { x: last.x, y: last.y },
        to: { x: cursorX, y: cursorY },
        isBoost: isBoostStep,
      });
      lastCursorRef.current = { x: cursorX, y: cursorY };
    }

    if (boostJustFinished && !finalizedBoostRef.current) {
      finalizedBoostRef.current = true;
      const segs = segmentsRef.current;
      const boostCount = 7;
      const start = Math.max(0, segs.length - boostCount);
      segmentsRef.current = segs.map((seg, i) =>
        i >= start ? { ...seg, isBoost: false } : seg
      );
    }

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(0, 0, width, height);
    drawGrid(ctx, width, height, theme.colors.border);

    const normalColor = NORMAL_LINE_COLOR;
    segmentsRef.current.forEach((seg) => {
      drawStep(ctx, seg, cellW, cellH, lineWidth, normalColor, seg.isBoost);
    });
  }, [cursorX, cursorY, isBoostStep, boostJustFinished, payload.currentStepIndex, theme.colors.background, theme.colors.border, theme.colors.text]);

  useEffect(() => {
    if (!payload.stageComplete || MATRIX_OVERLAY.length === 0) return;
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;
    const width = overlay.width;
    const height = overlay.height;
    const cellW = width / GRID_COLS;
    const cellH = height / GRID_ROWS;
    const rows = Math.min(MATRIX_OVERLAY.length, GRID_ROWS);
    const cols = Math.min(MATRIX_OVERLAY[0]?.length ?? 0, GRID_COLS);
    // Fill entire overlay with background so it fully covers grid and path
    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(0, 0, width, height);
    // Then draw white only where matrix is 1
    ctx.fillStyle = NORMAL_LINE_COLOR;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (MATRIX_OVERLAY[r][c] === 1) {
          ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
        }
      }
    }
  }, [payload.stageComplete, theme.colors.background]);

  const stageComplete = Boolean(payload.stageComplete);
  const successMessage = state.tvText || COPY.successMessage;

  return (
    <TVLayout stageNumber={7}>
      <div
        className="game-bg-animated"
        style={{
          position: "absolute",
          inset: -20,
          background: `linear-gradient(145deg, ${theme.colors.surface} 0%, ${theme.colors.background} 50%, ${theme.colors.background} 100%)`,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(16px, 3vw, 32px)",
          gap: 16,
        }}
      >
        {gameState === "BOOSTING" && (
          <p className="game-text-glow" style={{ fontSize: theme.typography.tvBody, fontWeight: 700, margin: 0, color: BOOST_COLOR }}>
            {COPY.syncBoost}
          </p>
        )}
        <div
          style={{
            width: "min(90vw, 600px)",
            aspectRatio: "1 / 1",
            background: theme.colors.background,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: theme.shadows.cardElevated,
            border: `2px solid ${theme.colors.border}`,
            position: "relative",
          }}
        >
          <canvas ref={canvasRef} width={600} height={600} style={{ width: "100%", height: "100%", display: "block" }} />
          {stageComplete && (
            <canvas
              ref={overlayCanvasRef}
              width={600}
              height={600}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "block",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />
          )}
        </div>
        {stageComplete && (
          <p
            dir="rtl"
            className="game-text-glow game-welcome-enter"
            style={{
              fontSize: theme.typography.tvTitle,
              fontWeight: 800,
              margin: 0,
              color: theme.colors.accent,
              textAlign: "center",
            }}
          >
            {successMessage}
          </p>
        )}
      </div>
    </TVLayout>
  );
}
