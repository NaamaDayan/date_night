/**
 * Session shape contract used by Service 1 (web) and Service 2 (game).
 * Session is created after questionnaire; game server validates token and reads questionnaire.
 */

/**
 * @typedef {Object} Questionnaire
 * @property {string} partner1Name
 * @property {string} partner2Name
 * @property {string} howLong
 * @property {string} howMet
 * @property {string} whereMet
 */

/**
 * @typedef {Object} Session
 * @property {string} sessionId
 * @property {string} player1Token
 * @property {string} player2Token
 * @property {string} tvToken
 * @property {Questionnaire} questionnaire
 * @property {number} createdAt
 * @property {boolean} used
 * @property {boolean} [emailSent]
 */

/**
 * Validates that an object has the minimal session shape (for creation).
 * @param {unknown} o
 * @returns {o is import('./constants').Session}
 */
function isSessionShape(o) {
  return (
    o &&
    typeof o === "object" &&
    typeof o.sessionId === "string" &&
    typeof o.player1Token === "string" &&
    typeof o.player2Token === "string" &&
    typeof o.tvToken === "string" &&
    o.questionnaire &&
    typeof o.questionnaire === "object" &&
    typeof o.used === "boolean"
  );
}

module.exports = {
  isSessionShape,
};
