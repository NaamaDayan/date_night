"use client";

const arrows: Record<string, string> = {
  LEFT: "←",
  RIGHT: "→",
  UP: "↑",
  DOWN: "↓",
};

interface MovementArrowProps {
  direction: string;
  label: string;
  style?: React.CSSProperties;
}

export function MovementArrow({ direction, label, style }: MovementArrowProps) {
  const arrow = arrows[direction] ?? "•";
  return (
    <div
      dir="rtl"
      className="game-step-enter"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        ...style,
      }}
    >
      <span
        className="game-arrow-bounce"
        style={{
          fontSize: "clamp(48px, 12vw, 72px)",
          lineHeight: 1,
        }}
      >
        {arrow}
      </span>
      <span style={{ fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 700 }}>
        {label}
      </span>
    </div>
  );
}
