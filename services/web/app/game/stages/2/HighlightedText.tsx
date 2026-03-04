"use client";

import React from "react";
import { baseText, player1HighlightIndexes, player2HighlightIndexes } from "../../gameContent/stage2Config";

const highlightSet = (indexes: number[]) => new Set(indexes);

function renderTextWithHighlights(text: string, indexes: number[]) {
  const set = highlightSet(indexes);
  return text.split("").map((char, i) =>
    set.has(i) ? (
      <span key={i} className="highlight">
        {char}
      </span>
    ) : (
      <React.Fragment key={i}>{char}</React.Fragment>
    )
  );
}

export function TVText() {
  return <>{baseText}</>;
}

export function Player1Text() {
  return <>{renderTextWithHighlights(baseText, player1HighlightIndexes)}</>;
}

export function Player2Text() {
  return <>{renderTextWithHighlights(baseText, player2HighlightIndexes)}</>;
}
