const { Room } = require("colyseus");
const { GameState } = require("./schemas/GameState.js");
const { validateToken, setSessionUsed } = require("../lib/session-validator.js");
const { ROLES, MAX_CLIENTS_PER_ROOM } = require("../shared/constants.js");

const STAGE_LOBBY = 0;
const STAGE_1 = 1;
const STAGE_2 = 2;
const STAGE_END = 3;

const STAGE_1_TEXTS = {
  tv: "Text 1",
  player1: "Text 2",
  player2: "Text 3",
};
const STAGE_2_TEXTS = {
  tv: "Text A",
  player1: "Text B",
  player2: "Text C",
};

module.exports = class GameRoom extends Room {
  constructor() {
    super();
    this.sessionId = null;
    this.questionnaire = null;
    this.maxClients = MAX_CLIENTS_PER_ROOM;
  }

  async onAuth(client, options = {}) {
    const { sessionId, token, role } = options;
    if (!sessionId || !token || !role) {
      throw new Error("Missing sessionId, token, or role");
    }
    const result = await validateToken(sessionId, token, role);
    if (!result.valid) {
      throw new Error("Invalid or expired link");
    }
    const validRoles = [ROLES.PLAYER1, ROLES.PLAYER2, ROLES.TV];
    if (!validRoles.includes(role)) {
      throw new Error("Invalid role");
    }
    client.userData = { role };
    return { role };
  }

  onCreate(options = {}) {
    this.sessionId = options.sessionId || null;
    this.questionnaire = options.questionnaire || null;
    this.metadata = { sessionId: this.sessionId };

    this.state = new GameState();
    this.state.stage = STAGE_LOBBY;
    this.state.message = "Waiting for players...";
    this.state.tvText = "";
    this.state.player1Text = "";
    this.state.player2Text = "";
    this.state.player1Submitted = false;
    this.state.player2Submitted = false;
    this.state.gameStarted = false;
    this.state.playerCount = 0;

    this.onMessage("submit", (client, data) => {
      const role = client.userData?.role;
      if (role !== ROLES.PLAYER1 && role !== ROLES.PLAYER2) return;
      if (this.state.stage === STAGE_1) {
        if (role === ROLES.PLAYER1) this.state.player1Submitted = true;
        else this.state.player2Submitted = true;
        this.advanceToStage2();
      } else if (this.state.stage === STAGE_2) {
        if (role === ROLES.PLAYER1) this.state.player1Submitted = true;
        else this.state.player2Submitted = true;
        this.advanceToEnd();
      }
    });
  }

  onJoin(client, options) {
    this.state.playerCount = this.clients.length;
    const playerCount = this.clients.filter(
      (c) => c.userData?.role !== ROLES.TV
    ).length;
    if (this.state.stage === STAGE_LOBBY && playerCount === 2) {
      this.state.gameStarted = true;
      this.state.stage = STAGE_1;
      this.state.message = "";
      this.state.tvText = STAGE_1_TEXTS.tv;
      this.state.player1Text = STAGE_1_TEXTS.player1;
      this.state.player2Text = STAGE_1_TEXTS.player2;
    }
  }

  onLeave(client, consented) {
    this.state.playerCount = this.clients.length;
    if (!consented) {
      this.allowReconnection(client, 60);
    }
  }

  advanceToStage2() {
    this.state.stage = STAGE_2;
    this.state.player1Submitted = false;
    this.state.player2Submitted = false;
    this.state.tvText = STAGE_2_TEXTS.tv;
    this.state.player1Text = STAGE_2_TEXTS.player1;
    this.state.player2Text = STAGE_2_TEXTS.player2;
  }

  advanceToEnd() {
    this.state.stage = STAGE_END;
    this.state.message = "You won the game!";
    if (this.sessionId) {
      setSessionUsed(this.sessionId);
    }
    this.clock.setTimeout(() => {
      this.disconnect();
    }, 3000);
  }
};
