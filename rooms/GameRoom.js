const { Room } = require("colyseus");
const { Schema, defineTypes } = require("@colyseus/schema");

// Define the room state schema: a single synchronizable property "message"
class GameState extends Schema {}
defineTypes(GameState, { message: "string" });

/**
 * Game room: one shared state with `message`.
 * - Initial message: "Waiting for players..."
 * - When any client sends "submit", set state.message to "You won the game!" for all clients.
 */
module.exports = class GameRoom extends Room {
  onCreate() {
    // Set initial room state (synced to all clients)
    this.state = new GameState();
    this.state.message = "Waiting for players...";

    // When any client sends a "submit" message, update the message for everyone
    this.onMessage("submit", (client, data) => {
      this.state.message = "You won the game!";
    });
  }
};
