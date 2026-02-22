/**
 * Stage 1: Simple text display from questionnaire + "Next" button.
 * TV shows welcome with partner names; players see intro text; either clicks Next to advance.
 */

const { setStageTexts, getQuestionnaire, setPayload } = require("./IStage.js");

const STAGE_INDEX = 1;

function onEnter(room, state) {
  const q = getQuestionnaire(room);
  setStageTexts(
    state,
    `Welcome, ${q.partner1Name} & ${q.partner2Name}!`,
    `Hi ${q.partner1Name}, tap Next when you're ready.`,
    `Hi ${q.partner2Name}, tap Next when you're ready.`
  );
  setPayload(state, {});
}

function onMessage(room, client, type, data) {
  if (type !== "next" && type !== "submit") return false;
  const role = client.userData?.role;
  if (role !== "player1" && role !== "player2") return false;
  room.advanceToInterim(2);
  return true;
}

function getInterimTitle() {
  return "Get ready for Stage 2!";
}

module.exports = {
  stageIndex: STAGE_INDEX,
  onEnter,
  onMessage,
  getInterimTitle,
};
