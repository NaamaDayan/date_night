const { Room } = require("colyseus");
const { GameState } = require("./schemas/GameState.js");
const { validateToken, setSessionUsed } = require("../lib/session-validator.js");
const { ROLES, MAX_CLIENTS_PER_ROOM } = require("../shared/constants.js");
const { getStage, getStageCount, GAME_STATE } = require("./stages/index.js");

const STAGE_LOBBY = 0;
const STAGE_ENDED_OFFSET = 1000;

module.exports = class GameRoom extends Room {
  constructor() {
    super();
    this.sessionId = null;
    this.questionnaire = null;
    this.gameHistory = [];
    this.maxClients = MAX_CLIENTS_PER_ROOM;
    this.devStage = null;
  }

  async onAuth(client, options = {}) {
    const { sessionId, token, role, devStage } = options;
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
    if (devStage != null && Number.isInteger(Number(devStage))) {
      this.devStage = Math.max(1, Math.min(Number(devStage), getStageCount()));
    }
    return { role };
  }

  onCreate(options = {}) {
    this.sessionId = options.sessionId || null;
    this.questionnaire = options.questionnaire || null;
    if (this.devStage != null && (!this.questionnaire || !this.questionnaire.partner1Name)) {
      this.questionnaire = {
        partner1Name: "Dev Partner 1",
        partner2Name: "Dev Partner 2",
        howLong: "1 year",
        howMet: "Online",
        whereMet: "At home",
      };
    }
    this.metadata = { sessionId: this.sessionId };
    this.gameHistory = [];

    const state = new GameState();
    state.currentStageIndex = this.devStage != null ? this.devStage : STAGE_LOBBY;
    state.stage = state.currentStageIndex;
    state.gameState = this.devStage != null ? GAME_STATE.IN_PROGRESS : GAME_STATE.WAITING_FOR_START;
    state.message = "Waiting for players...";
    state.tvText = "";
    state.player1Text = "";
    state.player2Text = "";
    state.gameStarted = false;
    state.playerCount = 0;
    state.questionnaireJson = JSON.stringify(this.questionnaire || {});
    state.stagePayloadJson = "{}";
    state.gameHistoryJson = "[]";
    state.readyForNextCount = 0;
    state.player1Submitted = false;
    state.player2Submitted = false;
    this.state = state;

    this.onMessage("*", (client, type, data) => {
      if (state.gameState === GAME_STATE.INTERIM_SCREEN) {
        if (type === "ready" || type === "startNext") {
          this.handleReadyForNext(client);
        }
        return;
      }
      if (state.gameState === GAME_STATE.IN_PROGRESS && state.currentStageIndex >= 1 && state.currentStageIndex <= getStageCount()) {
        const stageLogic = getStage(state.currentStageIndex);
        if (stageLogic && stageLogic.onMessage(this, client, type, data)) {
          return;
        }
      }
    });

  }

  onJoin(client, options) {
    this.state.playerCount = this.clients.length;
    const playerCount = this.clients.filter((c) => c.userData?.role !== ROLES.TV).length;
    if (this.devStage != null && this.state.gameState === GAME_STATE.WAITING_FOR_START) {
      if (!this.questionnaire || !this.questionnaire.partner1Name) {
        this.questionnaire = {
          partner1Name: "Dev Partner 1",
          partner2Name: "Dev Partner 2",
          howLong: "1 year",
          howMet: "Online",
          whereMet: "At home",
        };
        this.state.questionnaireJson = JSON.stringify(this.questionnaire);
      } else {
        this.state.questionnaireJson = JSON.stringify(this.questionnaire);
      }
      this.state.gameStarted = true;
      this.state.message = "";
      this.enterStage(this.devStage);
      return;
    }
    if (this.state.gameState === GAME_STATE.WAITING_FOR_START && playerCount === 2) {
      this.state.gameStarted = true;
      this.state.gameState = GAME_STATE.INTERIM_SCREEN;
      this.state.message = "Get ready for Stage 1!";
      this.state.currentStageIndex = 1;
      this.state.stage = 1;
      this.state.readyForNextCount = 0;
    }
  }

  onLeave(client, consented) {
    this.state.playerCount = this.clients.length;
    if (!consented) {
      this.allowReconnection(client, 60);
    }
  }

  addToHistory(stageIndex, payload) {
    this.gameHistory.push({ stageIndex, payload });
    this.state.gameHistoryJson = JSON.stringify(this.gameHistory);
  }

  enterStage(stageIndex) {
    const stageLogic = getStage(stageIndex);
    if (!stageLogic) return;
    this.state.currentStageIndex = stageIndex;
    this.state.stage = stageIndex;
    this.state.gameState = GAME_STATE.IN_PROGRESS;
    this.state.message = "";
    this.state.readyForNextCount = 0;
    this.state.player1Submitted = false;
    this.state.player2Submitted = false;
    this.state.questionnaireJson = JSON.stringify(this.questionnaire || {});
    this.state.gameHistoryJson = JSON.stringify(this.gameHistory);
    stageLogic.onEnter(this, this.state);
  }

  advanceToInterim(nextStageIndex) {
    this.clients.forEach((c) => {
      if (c.userData?.role === ROLES.PLAYER1) delete c.userData.ready_player1;
      if (c.userData?.role === ROLES.PLAYER2) delete c.userData.ready_player2;
    });
    this.state.gameState = GAME_STATE.INTERIM_SCREEN;
    const nextStage = getStage(nextStageIndex);
    this.state.message = nextStage && nextStage.getInterimTitle ? nextStage.getInterimTitle() : "Get ready for the next stage!";
    this.state.tvText = this.state.message;
    this.state.player1Text = "Tap 'Start Next Stage' when ready.";
    this.state.player2Text = "Tap 'Start Next Stage' when ready.";
    this.state.readyForNextCount = 0;
    this.state.currentStageIndex = nextStageIndex;
    this.state.stage = nextStageIndex;
  }

  handleReadyForNext(client) {
    const role = client.userData?.role;
    if (role !== ROLES.PLAYER1 && role !== ROLES.PLAYER2) return;
    const key = `ready_${role}`;
    if (client.userData[key]) return;
    client.userData[key] = true;
    this.state.readyForNextCount = (this.state.readyForNextCount || 0) + 1;
    const playerCount = this.clients.filter((c) => c.userData?.role === ROLES.PLAYER1 || c.userData?.role === ROLES.PLAYER2).length;
    if (this.state.readyForNextCount >= Math.min(2, playerCount)) {
      this.clients.forEach((c) => {
        if (c.userData?.role === ROLES.PLAYER1) delete c.userData.ready_player1;
        if (c.userData?.role === ROLES.PLAYER2) delete c.userData.ready_player2;
      });
      const next = this.state.currentStageIndex;
      if (next > getStageCount()) {
        this.advanceToEnd();
      } else {
        this.enterStage(next);
      }
    }
  }

  advanceToEnd() {
    this.state.gameState = GAME_STATE.ENDED;
    this.state.currentStageIndex = STAGE_ENDED_OFFSET;
    this.state.stage = STAGE_ENDED_OFFSET;
    this.state.message = "You won the game!";
    this.state.tvText = this.state.message;
    this.state.player1Text = this.state.message;
    this.state.player2Text = this.state.message;
    if (this.sessionId) {
      setSessionUsed(this.sessionId);
    }
    this.clock.setTimeout(() => {
      this.disconnect();
    }, 5000);
  }
};
