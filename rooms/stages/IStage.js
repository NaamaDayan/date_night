/**
 * Stage logic interface. Each stage module exports:
 * - stageIndex: number
 * - onEnter(room, state): called when stage becomes active; set state.tvText, player1Text, player2Text, stagePayloadJson as needed
 * - onMessage(room, client, type, data): handle message; return true if handled
 * - getInterimTitle(room): optional; title for "Get Ready" screen before this stage
 *
 * Room provides: room.state, room.questionnaire, room.gameHistory, room.roles (ROLES)
 */

/**
 * @typedef {import("../../schemas/GameState").GameState} GameState
 * @typedef {import("colyseus").Room} Room
 * @typedef {{ partner1Name: string; partner2Name: string; howLong: string; howMet: string; whereMet: string }} QuestionnaireData
 * @typedef {Array<{ stageIndex: number; payload: object }>} GameHistory
 */

/**
 * @param {Room} room
 * @param {GameState} state
 */
function setStageTexts(state, tvText, player1Text, player2Text) {
  state.tvText = tvText || "";
  state.player1Text = player1Text || "";
  state.player2Text = player2Text || "";
}

/**
 * @param {Room} room
 * @returns {QuestionnaireData}
 */
function getQuestionnaire(room) {
  return room.questionnaire || {
    partner1Name: "Partner 1",
    partner2Name: "Partner 2",
    howLong: "",
    howMet: "",
    whereMet: "",
  };
}

/**
 * @param {Room} room
 * @returns {GameHistory}
 */
function getGameHistory(room) {
  try {
    return room.gameHistory ? JSON.parse(JSON.stringify(room.gameHistory)) : [];
  } catch {
    return [];
  }
}

function parsePayload(state) {
  try {
    return state.stagePayloadJson ? JSON.parse(state.stagePayloadJson) : {};
  } catch {
    return {};
  }
}

function setPayload(state, payload) {
  state.stagePayloadJson = JSON.stringify(payload || {});
}

module.exports = {
  setStageTexts,
  getQuestionnaire,
  getGameHistory,
  parsePayload,
  setPayload,
};
