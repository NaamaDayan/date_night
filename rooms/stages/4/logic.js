/**
 * Stage 4: Vision Board
 *
 * Players answer either/or closed questions. When both choose the same option,
 * it's saved as a mutual vision. At 5 mutual picks, generate a Vision Board image
 * via OpenAI and display on TV, then advance to Stage 5.
 */

const { setStageTexts, getQuestionnaire, setPayload, parsePayload, addWelcomeState, handleWelcomeReady } = require("../IStage.js");
const { ROLES } = require("../../../shared/constants.js");
const { SHARED } = require("../sharedCopy.js");
const { PROMPTS, shuffleArray, getTvReaction } = require("./promptBank.js");
const { generateVisionBoardImage } = require("./generateImage.js");
const COPY = require("./copy.js");

const STAGE_INDEX = 4;
const STAGE_NAME = COPY.stageName;
const MUTUAL_PICKS_TARGET = 5;

function getPrompts(room) {
  if (!room._stage4Prompts || !room._stage4Prompts.length) {
    room._stage4Prompts = shuffleArray(PROMPTS);
  }
  return room._stage4Prompts;
}

function getPromptAt(room, index) {
  const prompts = getPrompts(room);
  return prompts[index % prompts.length] || { question: "", options: [] };
}

function buildPayload(room) {
  const prompt = getPromptAt(room, 0);
  return {
    stageId: STAGE_INDEX,
    stageName: STAGE_NAME,
    status: "asking",
    currentPromptIndex: 0,
    currentPrompt: prompt,
    p1Choice: null,
    p2Choice: null,
    p1Answered: false,
    p2Answered: false,
    mutualPicks: [],
    mutualCount: 0,
    tvReaction: "",
    finalVisionBoardImageUrl: null,
    generationError: null,
    stageComplete: false,
  };
}

function applyTextsForPhase(room, state, payload) {
  const status = payload.status || "asking";

  if (status === "asking") {
    setStageTexts(
      state,
      COPY.tvTitle,
      COPY.chooseAnswer,
      COPY.chooseAnswer
    );
    return;
  }

  if (status === "reveal") {
    setStageTexts(state, payload.tvReaction || COPY.reveal, payload.tvReaction || "", payload.tvReaction || "");
    return;
  }

  if (status === "generating") {
    setStageTexts(
      state,
      payload.tvReaction || COPY.creatingBoard,
      COPY.creatingBoardPhone,
      COPY.creatingBoardPhone
    );
    return;
  }

  if (status === "showResult") {
    setStageTexts(
      state,
      COPY.tvTitle,
      COPY.tapContinue,
      COPY.tapContinue
    );
    return;
  }

  setStageTexts(state, STAGE_NAME, "", "");
}

function moveToAsking(room, state, payload) {
  payload.status = "asking";
  payload.tvReaction = "";
  const idx = payload.currentPromptIndex ?? 0;
  payload.currentPrompt = getPromptAt(room, idx);
  payload.p1Choice = null;
  payload.p2Choice = null;
  payload.p1Answered = false;
  payload.p2Answered = false;
  setPayload(state, payload);
  applyTextsForPhase(room, state, payload);
}

function startPlaying(room, state, payload) {
  setPayload(state, payload);
  applyTextsForPhase(room, state, payload);
}

function onEnter(room, state) {
  room._stage4Prompts = shuffleArray(PROMPTS);
  const payload = addWelcomeState(buildPayload(room));
  setPayload(state, payload);
}

function handleAnswer(room, client, payload, data) {
  if (payload.status !== "asking" || payload.stageComplete) return false;
  const role = client.userData?.role;
  if (role !== ROLES.PLAYER1 && role !== ROLES.PLAYER2) return false;

  if (role === ROLES.PLAYER1 && payload.p1Answered) return true;
  if (role === ROLES.PLAYER2 && payload.p2Answered) return true;

  const choiceId = data && typeof data.choiceId === "string" ? data.choiceId : null;
  const options = (payload.currentPrompt && payload.currentPrompt.options) || [];
  const valid = options.some((o) => o.id === choiceId);
  if (!valid || !choiceId) return false;

  if (role === ROLES.PLAYER1) {
    payload.p1Choice = choiceId;
    payload.p1Answered = true;
  } else {
    payload.p2Choice = choiceId;
    payload.p2Answered = true;
  }

  if (!payload.p1Answered || !payload.p2Answered) {
    setPayload(room.state, payload);
    return true;
  }

  const match = payload.p1Choice === payload.p2Choice;
  const chosenOption = options.find((o) => o.id === payload.p1Choice) || { id: "", label: "", assetKey: "" };

  if (match) {
    const alreadyHave = (payload.mutualPicks || []).some((p) => p.id === chosenOption.id);
    if (!alreadyHave) {
      payload.mutualPicks = payload.mutualPicks || [];
      payload.mutualPicks.push({
        id: chosenOption.id,
        label: chosenOption.label,
        assetKey: chosenOption.assetKey,
      });
      payload.mutualCount = payload.mutualPicks.length;
    }
  }

  payload.tvReaction = getTvReaction(match, chosenOption.assetKey || undefined);
  payload.status = "reveal";
  setPayload(room.state, payload);
  applyTextsForPhase(room, room.state, payload);
  return true;
}

function handleNext(room, state, payload) {
  if (payload.status !== "reveal") return false;

  if ((payload.mutualPicks || []).length >= MUTUAL_PICKS_TARGET) {
    payload.status = "generating";
    payload.tvReaction = COPY.creatingBoard;
    setPayload(state, payload);
    setStageTexts(state, payload.tvReaction, COPY.creatingBoardPhone, COPY.creatingBoardPhone);

    const q = getQuestionnaire(room);
    generateVisionBoardImage({
      partner1Name: q.partner1Name || SHARED.defaultPartner1,
      partner2Name: q.partner2Name || SHARED.defaultPartner2,
      mutualPicks: payload.mutualPicks || [],
    })
      .then(({ url, error }) => {
        if (!room.state || room.state.stagePayloadJson === undefined) return;
        const p = parsePayload(room.state);
        p.finalVisionBoardImageUrl = url;
        p.generationError = error;
        p.status = "showResult";
        p.stageComplete = true;
        setPayload(room.state, p);
        applyTextsForPhase(room, room.state, p);
      })
      .catch((err) => {
        if (!room.state || room.state.stagePayloadJson === undefined) return;
        const p = parsePayload(room.state);
        p.generationError = err?.message || String(err);
        p.finalVisionBoardImageUrl = null;
        p.status = "showResult";
        p.stageComplete = true;
        setPayload(room.state, p);
        applyTextsForPhase(room, room.state, p);
      });
    return true;
  }

  payload.currentPromptIndex = (payload.currentPromptIndex ?? 0) + 1;
  payload.currentPrompt = getPromptAt(room, payload.currentPromptIndex);
  moveToAsking(room, state, payload);
  return true;
}

function onMessage(room, client, type, data) {
  const role = client.userData?.role;
  if (role !== ROLES.PLAYER1 && role !== ROLES.PLAYER2) return false;

  if (type === "playerReady") {
    return handleWelcomeReady(room, client, startPlaying);
  }

  const payload = parsePayload(room.state);

  if (payload.welcomeStatus === "welcome") return false;

  if (payload.stageComplete && type !== "continue") return false;

  if (type === "answer" || type === "choice") {
    return handleAnswer(room, client, payload, data);
  }

  if (type === "next" || type === "revealNext") {
    return handleNext(room, room.state, payload);
  }

  if (type === "continue") {
    if (payload.status !== "showResult" || !payload.stageComplete) return false;
    const summary = {
      mutualPicks: payload.mutualPicks || [],
      mutualCount: payload.mutualCount || 0,
      finalVisionBoardImageUrl: payload.finalVisionBoardImageUrl || null,
      generationError: payload.generationError || null,
    };
    room.addToHistory(STAGE_INDEX, summary);
    room.advanceToInterim(5);
    return true;
  }

  return false;
}

function getInterimTitle() {
  return COPY.getReadyStage5;
}

module.exports = {
  stageIndex: STAGE_INDEX,
  onEnter,
  onMessage,
  getInterimTitle,
};
