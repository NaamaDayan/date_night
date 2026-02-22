const { Schema, defineTypes } = require("@colyseus/schema");

/**
 * Synced game state for the modular stage system.
 * - currentStageIndex: 0 = lobby, 1..N = stages, N+1 = ended
 * - gameState: WAITING_FOR_START | IN_PROGRESS | INTERIM_SCREEN | ENDED
 * - questionnaireJson: JSON string of { partner1Name, partner2Name, howLong, howMet, whereMet }
 * - stagePayloadJson: current stage custom data (stage-specific)
 * - gameHistoryJson: JSON array of previous stage results for all stages
 */
class GameState extends Schema {}
defineTypes(GameState, {
  currentStageIndex: "number",
  gameState: "string",
  message: "string",
  tvText: "string",
  player1Text: "string",
  player2Text: "string",
  gameStarted: "boolean",
  playerCount: "number",
  questionnaireJson: "string",
  stagePayloadJson: "string",
  gameHistoryJson: "string",
  readyForNextCount: "number",
  player1Submitted: "boolean",
  player2Submitted: "boolean",
  // Legacy fields for backward compat (can be removed once client only uses new schema)
  stage: "number",
});

module.exports = { GameState };
