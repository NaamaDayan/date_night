/**
 * Stage 4 Vision Board – closed question bank (server source of truth).
 * Prompts and reactions come from copy.js.
 */

const COPY = require("./copy.js");

const PROMPTS = COPY.prompts;

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function getTvReaction(match, assetKey) {
  const matchReactions = COPY.matchReactions;
  const mismatchReactions = COPY.mismatchReactions;
  const contextReactions = COPY.contextReactions;

  if (match && assetKey && contextReactions[assetKey]) {
    return contextReactions[assetKey];
  }
  if (match) {
    const i = hash(String(match) + (assetKey || "")) % matchReactions.length;
    return matchReactions[i];
  }
  const i = hash("mismatch" + (assetKey || "")) % mismatchReactions.length;
  return mismatchReactions[i];
}

module.exports = {
  PROMPTS,
  shuffleArray,
  getTvReaction,
};
