/**
 * Stage 2: "Sound Date Puzzle" (soundDatePuzzle)
 *
 * Two client-side phases:
 *   1. Discover – press all 8 buttons to hear their digit sounds (client-only tracking).
 *   2. Order   – press buttons in the correct date sequence.
 *
 * Server tracks only the order phase:
 *   - pressSequence: indices pressed so far in current attempt.
 *   - When 8 presses collected, check if digit sequence matches target.
 *     Match → solved, advance. No match → nothing (user presses "איפוס" to retry).
 *   - No per-press feedback (no wrong message, no counter).
 */

const { setStageTexts, getQuestionnaire, setPayload, parsePayload } = require("./IStage.js");
const { ROLES } = require("../../shared/constants.js");

const STAGE_INDEX = 2;

const DEFAULT_MEETING_DATE_DIGITS = [2, 0, 0, 6, 2, 0, 1, 8];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildInitialPayload() {
  return {
    buttons: shuffleArray(DEFAULT_MEETING_DATE_DIGITS),
    targetDigits: DEFAULT_MEETING_DATE_DIGITS,
    pressSequence: [],
    stageComplete: false,
    status: "playing",
  };
}

function isSequenceCorrect(buttons, pressSequence, targetDigits) {
  if (pressSequence.length !== targetDigits.length) return false;
  return pressSequence.every((btnIdx, i) => buttons[btnIdx] === targetDigits[i]);
}

function applyTextsForPhase(room, state, payload) {
  const q = getQuestionnaire(room);
  const displayName = "Sound Date Puzzle";

  if (payload.status === "solved" || payload.stageComplete) {
    setStageTexts(
      state,
      `${displayName} — ${q.partner1Name} & ${q.partner2Name}`,
      "כל הכבוד! פתרתם את הפאזל.",
      "כל הכבוד! פתרתם את הפאזל."
    );
    return;
  }

  setStageTexts(
    state,
    `${displayName} — ${q.partner1Name} & ${q.partner2Name}`,
    "הקשיבו לכפתורים ולחצו בסדר הנכון.",
    "הקשיבו לכפתורים ולחצו בסדר הנכון."
  );
}

function onEnter(room, state) {
  const payload = buildInitialPayload();
  console.log("[stage2] onEnter payload.buttons =", JSON.stringify(payload.buttons));
  setPayload(state, payload);
  applyTextsForPhase(room, state, payload);
}

function onMessage(room, client, type, data) {
  const role = client.userData?.role;
  if (role !== ROLES.PLAYER1 && role !== ROLES.PLAYER2) return false;

  const payload = parsePayload(room.state);

  if (payload.stageComplete && type !== "continue") return false;

  if (type === "press") {
    const index = data && Number.isInteger(data.index) ? data.index : -1;
    if (index < 0 || index >= 8) return false;
    if (payload.pressSequence.includes(index)) return false;

    payload.pressSequence.push(index);

    if (payload.pressSequence.length >= 8) {
      if (isSequenceCorrect(payload.buttons, payload.pressSequence, payload.targetDigits)) {
        payload.status = "solved";
        payload.stageComplete = true;
      }
      // Wrong sequence: do nothing, user must press "reset" to try again
    }

    setPayload(room.state, payload);
    if (payload.stageComplete) applyTextsForPhase(room, room.state, payload);
    return true;
  }

  if (type === "reset" || type === "shuffle") {
    if (payload.stageComplete) return false;
    payload.pressSequence = [];
    setPayload(room.state, payload);
    return true;
  }

  if (type === "continue") {
    if (!payload.stageComplete) return false;
    room.addToHistory(STAGE_INDEX, { status: "solved" });
    room.advanceToInterim(3);
    return true;
  }

  return false;
}

function getInterimTitle() {
  return "Get ready for Stage 3!";
}

module.exports = {
  stageIndex: STAGE_INDEX,
  onEnter,
  onMessage,
  getInterimTitle,
};
