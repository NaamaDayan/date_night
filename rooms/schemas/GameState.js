const { Schema, defineTypes } = require("@colyseus/schema");

class GameState extends Schema {}
defineTypes(GameState, {
  stage: "number",
  message: "string",
  tvText: "string",
  player1Text: "string",
  player2Text: "string",
  player1Submitted: "boolean",
  player2Submitted: "boolean",
  gameStarted: "boolean",
  playerCount: "number",
});

module.exports = { GameState };
