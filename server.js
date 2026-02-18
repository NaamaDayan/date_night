const express = require("express");
const path = require("path");
const { Server } = require("colyseus");
const { monitor } = require("@colyseus/monitor");
const gameRoom = require("./rooms/GameRoom.js");

const PORT = 2567;

// Create Colyseus server. Do NOT pass a custom HTTP server – let Colyseus create one
// so it can register matchmaking routes (/matchmake/joinOrCreate/game, etc.).
// Use the express callback to add our static files and monitor to the transport's app.
const gameServer = new Server({
  express: (app) => {
    // Serve static files (tv.html, player1.html, player2.html)
    app.use(express.static(path.join(__dirname, "public")));
    // Optional: Colyseus monitor at /colyseus
    app.use("/colyseus", monitor());
  },
});

// Define the "game" room
gameServer.define("game", gameRoom);

// Start the server with Colyseus listen() so matchmaking and WebSocket are bound
gameServer.listen(PORT).then(() => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log("Open in browser: tv.html, player1.html, player2.html");
});
