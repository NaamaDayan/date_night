const express = require("express");
const path = require("path");
const { createServer } = require("http");
const { Server, matchMaker } = require("colyseus");
const { monitor } = require("@colyseus/monitor");
const gameRoom = require("./rooms/GameRoom.js");
const { validateToken } = require("./lib/session-validator.js");

const PORT = process.env.PORT || 2567;

// Use Colyseus's express app so /matchmake/* (joinById, etc.) is available. Our routes are mounted on it.
const httpServer = createServer();
const gameServer = new Server({
  server: httpServer,
  express: (app) => {
    app.use((req, res, next) => {
      const origin = req.headers.origin;
      if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      if (req.method === "OPTIONS") return res.sendStatus(204);
      next();
    });
    app.use(express.json());
    app.use(express.static(path.join(__dirname, "public")));

    app.get("/health", (req, res) => {
      res.json({ ok: true, message: "Game server running." });
    });

    app.post("/join", async (req, res) => {
      console.log("[join] Request received", { sessionId: req.body?.sessionId, role: req.body?.role });
      const { sessionId, token, role } = req.body || {};
      if (!sessionId || !token || !role) {
        return res.status(400).json({ error: "Missing sessionId, token, or role" });
      }
      const result = await validateToken(sessionId, token, role);
      if (!result.valid) {
        console.log("[join] Token invalid or web app unreachable");
        return res.status(401).json({ error: "Invalid or expired link" });
      }
      try {
        const rooms = await matchMaker.query({ name: "game" });
        const existing = rooms.find((r) => r.metadata?.sessionId === sessionId);
        if (existing) {
          return res.json({ roomId: existing.roomId });
        }
        const roomRef = await matchMaker.createRoom("game", {
          sessionId,
          questionnaire: result.questionnaire || {},
        });
        const roomId = roomRef.roomId;
        return res.json({ roomId });
      } catch (e) {
        console.error("[join]", e);
        return res.status(500).json({ error: "Could not create or find room" });
      }
    });

    app.use("/colyseus", monitor());
  },
});

gameServer.define("game", gameRoom);

gameServer.listen(PORT).then(() => {
  console.log(`Game server at http://localhost:${PORT}`);
});
