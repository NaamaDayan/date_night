/**
 * Stage 2: Player 1 answers a question about Player 2; Player 2 sees a placeholder.
 * When P1 submits, we store answer in history and go to interim for stage 3.
 */

const { setStageTexts, getQuestionnaire, setPayload, parsePayload } = require("./IStage.js");
const { ROLES } = require("../../shared/constants.js");

const STAGE_INDEX = 2;

function onEnter(room, state) {
  const q = getQuestionnaire(room);
  setStageTexts(
    state,
    "Stage 2: How well do you know each other?",
    `${q.partner1Name}, what is ${q.partner2Name}'s favorite thing about you?`,
    "Waiting for your partner to answer..."
  );
  setPayload(state, { player1Answer: "" });
}

function onMessage(room, client, type, data) {
  if (type !== "submit" && type !== "answer") return false;
  if (client.userData?.role !== ROLES.PLAYER1) return false;
  const text = (data && data.text) ? String(data.text).trim() : "";
  const payload = parsePayload(room.state);
  payload.player1Answer = text;
  room.state.stagePayloadJson = JSON.stringify(payload);
  room.addToHistory(2, payload);
  room.advanceToInterim(3);
  return true;
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
