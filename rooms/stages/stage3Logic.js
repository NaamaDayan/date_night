/**
 * Stage 3: Both must type the same word to "win" the stage.
 * When both have submitted and words match (case-insensitive), advance to stage 4.
 */

const { setStageTexts, getQuestionnaire, setPayload, parsePayload } = require("./IStage.js");
const { ROLES } = require("../../shared/constants.js");

const STAGE_INDEX = 3;

function onEnter(room, state) {
  setStageTexts(
    state,
    "Stage 3: Type the same word!",
    "Type a word and submit. You must both choose the same word.",
    "Type a word and submit. You must both choose the same word."
  );
  setPayload(state, { player1Word: "", player2Word: "" });
}

function onMessage(room, client, type, data) {
  if (type !== "submit" && type !== "word") return false;
  const role = client.userData?.role;
  if (role !== ROLES.PLAYER1 && role !== ROLES.PLAYER2) return false;
  const word = (data && data.text !== undefined) ? String(data.text).trim() : (data && data.word) ? String(data.word).trim() : "";
  const payload = parsePayload(room.state);
  if (role === ROLES.PLAYER1) payload.player1Word = word;
  else payload.player2Word = word;
  room.state.stagePayloadJson = JSON.stringify(payload);
  if (role === ROLES.PLAYER1) room.state.player1Submitted = true;
  else room.state.player2Submitted = true;

  if (payload.player1Word && payload.player2Word) {
    const match = payload.player1Word.toLowerCase() === payload.player2Word.toLowerCase();
    if (match) {
      room.addToHistory(3, payload);
      room.advanceToInterim(4);
    }
  }
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
