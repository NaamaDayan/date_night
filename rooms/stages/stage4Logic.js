/**
 * Stage 4: Zoom Map + Word Guessing
 * - 6 sub-rounds, turn-based: Describer answers 4 MC questions about a secret word; Guesser sees answers + 4 word options.
 * - Correct guess → zoom in on TV map; incorrect → zoom out.
 * - Either player can type a location guess at any time; correct (Eiffel Tower) → stage ends, advance.
 */

const path = require("path");
const fs = require("fs");
const { setStageTexts, getQuestionnaire, setPayload, parsePayload } = require("./IStage.js");
const { ROLES } = require("../../shared/constants.js");

const STAGE_INDEX = 4;
const MAX_SUB_ROUNDS = 6;
const ZOOM_MIN = 0;
const ZOOM_MAX = 6;
const TARGET_LOCATION = "eiffel tower";

let wordsCache = null;

function loadWords() {
  if (wordsCache) return wordsCache;
  try {
    const filePath = path.join(__dirname, "data", "words.json");
    const raw = fs.readFileSync(filePath, "utf8");
    wordsCache = JSON.parse(raw);
    return wordsCache;
  } catch (e) {
    console.error("[stage4] Failed to load words.json", e.message);
    return [];
  }
}

function pickRandomWord() {
  const words = loadWords();
  if (!words.length) return null;
  return words[Math.floor(Math.random() * words.length)];
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildWordOptions(wordEntry) {
  const { word, alternatives } = wordEntry;
  return shuffleArray([word, ...(alternatives || [])].slice(0, 4));
}

function normalizeLocationGuess(text) {
  return String(text || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function isLocationCorrect(text) {
  const n = normalizeLocationGuess(text);
  return n.includes("eiffel") || n === "tower" || n.includes("eiffel tower");
}

function getDescriberRole(subRoundIndex) {
  return subRoundIndex % 2 === 0 ? ROLES.PLAYER1 : ROLES.PLAYER2;
}

function applyTextsForPhase(room, state, payload) {
  const phase = payload.phase || "describe";
  const describerRole = payload.describerRole || ROLES.PLAYER1;
  const zoomLevel = payload.zoomLevel ?? 0;

  const describerInstruction = "Answer the 4 questions below (only you see the secret word).";
  const guesserInstruction = "Your partner answered 4 questions. Pick the word they're describing.";
  const resultInstruction = "Tap Next to continue to the next round.";

  if (phase === "describe") {
    setStageTexts(
      state,
      `Zoom Map · Round ${(payload.subRoundIndex ?? 0) + 1}/${MAX_SUB_ROUNDS} · Zoom ${zoomLevel}/${ZOOM_MAX}`,
      describerRole === ROLES.PLAYER1 ? describerInstruction : guesserInstruction,
      describerRole === ROLES.PLAYER2 ? describerInstruction : guesserInstruction
    );
    return;
  }
  if (phase === "guess") {
    setStageTexts(
      state,
      `Zoom Map · Round ${(payload.subRoundIndex ?? 0) + 1}/${MAX_SUB_ROUNDS} · Zoom ${zoomLevel}/${ZOOM_MAX}`,
      describerRole === ROLES.PLAYER1 ? "Waiting for your partner to guess..." : guesserInstruction,
      describerRole === ROLES.PLAYER2 ? "Waiting for your partner to guess..." : guesserInstruction
    );
    return;
  }
  if (phase === "result") {
    const msg = payload.result === "correct" ? "Correct! Zooming in." : "Wrong word. Zooming out.";
    setStageTexts(
      state,
      `Zoom Map · ${msg} (Zoom ${payload.zoomLevel}/${ZOOM_MAX})`,
      resultInstruction,
      resultInstruction
    );
  }
}

function startSubRound(room, state, payload) {
  const wordEntry = pickRandomWord();
  if (!wordEntry) {
    state.tvText = "Error: No words loaded.";
    return;
  }
  const wordOptions = buildWordOptions(wordEntry);
  payload.word = wordEntry.word;
  payload.questions = wordEntry.questions;
  payload.wordOptions = wordOptions;
  payload.describerAnswers = [];
  payload.describerAnswerTexts = [];
  payload.result = null;
  payload.phase = "describe";
  payload.describerRole = getDescriberRole(payload.subRoundIndex);
  setPayload(state, payload);
  applyTextsForPhase(room, state, payload);
}

function onEnter(room, state) {
  const payload = parsePayload(state);
  const hasState = payload.subRoundIndex !== undefined && payload.phase;

  if (!hasState) {
    payload.subRoundIndex = 0;
    payload.zoomLevel = ZOOM_MIN;
    payload.phase = "describe";
    payload.describerRole = ROLES.PLAYER1;
    payload.stageComplete = false;
    payload.locationCorrect = false;
    setPayload(state, payload);
    startSubRound(room, state, payload);
  } else {
    applyTextsForPhase(room, state, payload);
  }
}

function onMessage(room, client, type, data) {
  const role = client.userData?.role;
  if (role !== ROLES.PLAYER1 && role !== ROLES.PLAYER2) return false;

  const payload = parsePayload(room.state);
  if (payload.stageComplete || payload.locationCorrect) return false;

  // Location guess: allowed anytime
  if (type === "locationGuess" || type === "location") {
    payload.lastLocationGuessWrong = false;
    const text = (data && data.text !== undefined) ? data.text : (data && data.guess !== undefined) ? data.guess : "";
    if (isLocationCorrect(text)) {
      payload.stageComplete = true;
      payload.locationCorrect = true;
      setPayload(room.state, payload);
      setStageTexts(room.state, "You found it! Eiffel Tower!", "You found the location!", "You found the location!");
      room.addToHistory(STAGE_INDEX, { locationCorrect: true, zoomLevel: payload.zoomLevel });
      room.advanceToInterim(5);
      return true;
    }
    payload.lastLocationGuessWrong = true;
    setPayload(room.state, payload);
    return true;
  }

  if (payload.phase === "describe" && type === "describerSubmit") {
    if (role !== payload.describerRole) return false;
    const answers = Array.isArray(data && data.answers) ? data.answers : [];
    if (answers.length < 4) return false;
    const questions = payload.questions || [];
    const answerTexts = answers.slice(0, 4).map((idx, i) => {
      const q = questions[i];
      const opts = (q && q.options) || [];
      return opts[Number(idx)] != null ? opts[Number(idx)] : "";
    });
    payload.describerAnswers = answers.slice(0, 4);
    payload.describerAnswerTexts = answerTexts;
    payload.phase = "guess";
    setPayload(room.state, payload);
    applyTextsForPhase(room, room.state, payload);
    return true;
  }

  if (payload.phase === "guess" && type === "guesserSubmit") {
    if (role === payload.describerRole) return false;
    const wordIndex = data && data.wordIndex !== undefined ? Number(data.wordIndex) : -1;
    const wordOptions = payload.wordOptions || [];
    const correctWord = payload.word || "";
    const chosen = wordOptions[wordIndex];
    const correct = chosen === correctWord;
    payload.phase = "result";
    payload.result = correct ? "correct" : "incorrect";
    let zoom = payload.zoomLevel ?? 0;
    if (correct) zoom = Math.min(ZOOM_MAX, zoom + 1);
    else zoom = Math.max(ZOOM_MIN, zoom - 1);
    payload.zoomLevel = zoom;
    setPayload(room.state, payload);
    applyTextsForPhase(room, room.state, payload);
    return true;
  }

  if (payload.phase === "result" && (type === "next" || type === "continue")) {
    if (role !== ROLES.PLAYER1 && role !== ROLES.PLAYER2) return false;
    const nextSub = (payload.subRoundIndex ?? 0) + 1;
    if (nextSub >= MAX_SUB_ROUNDS) {
      room.addToHistory(STAGE_INDEX, { zoomLevel: payload.zoomLevel, subRounds: MAX_SUB_ROUNDS });
      room.advanceToInterim(5);
      return true;
    }
    payload.subRoundIndex = nextSub;
    payload.phase = "describe";
    payload.describerRole = getDescriberRole(nextSub);
    setPayload(room.state, payload);
    startSubRound(room, room.state, payload);
    return true;
  }

  return false;
}

function getInterimTitle() {
  return "Get ready for the next stage!";
}

module.exports = {
  stageIndex: STAGE_INDEX,
  onEnter,
  onMessage,
  getInterimTitle,
};
