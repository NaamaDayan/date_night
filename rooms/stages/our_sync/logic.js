/**
 * Stage: Our Sync – 3 manual steps / 7 boost steps loop.
 *
 * - Directions from directions.txt; questions from questions.json.
 * - Manual phase: 8-direction movement. After every 3 manual steps → QUESTION.
 * - Question: TV shows question; phones show two options. Match → 7-step BOOST (golden); no match → "Not Synced", 2s then PLAYING.
 * - Boost: auto-execute 7 steps from directions with golden effect; then back to PLAYING.
 */

const fs = require("fs");
const path = require("path");
const { setStageTexts, parsePayload, setPayload } = require("../IStage.js");
const { ROLES } = require("../../../shared/constants.js");
const COPY = require("./copy.js");

const DIR_VECTORS = {
  north: { x: 0, y: -1 },
  south: { x: 0, y: 1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
  "north-east": { x: 1, y: -1 },
  "north-west": { x: -1, y: -1 },
  "south-east": { x: 1, y: 1 },
  "south-west": { x: -1, y: 1 },
};

const PLAYER_A_DIRECTIONS = ["east", "west", "north-west", "south-east"];
const PLAYER_B_DIRECTIONS = ["north", "south", "north-east", "south-west"];
const MANUAL_STEPS_BEFORE_QUESTION = 3;
const BOOST_STEP_COUNT = 7;
const BOOST_STEP_DELAY_MS = 133;
const DELAY_BEFORE_QUESTION_MS = 1200;
const QUESTION_MISMATCH_DELAY_MS = 2000;

function finalizeStage(room, payload, stageIndex) {
  payload.ourSyncActive = false;
  payload.stageComplete = true;
  clearInstructionInterval(room);
  setPayload(room.state, payload);
  room.addToHistory(stageIndex, { totalSteps: payload.totalSteps, stepsCompleted: payload.currentStepIndex });
  setStageTexts(room.state, COPY.successMessage || "מצוין, עוברים לשלב הבא", COPY.successMessage || "מצוין, עוברים לשלב הבא", COPY.successMessage || "מצוין, עוברים לשלב הבא");
  room.clock.setTimeout(() => room.advanceToInterim(stageIndex + 1), 5000);
}

function loadDirections() {
  try {
    const filePath = path.join(__dirname, "directions.txt");
    const raw = fs.readFileSync(filePath, "utf8");
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const directions = [];
    for (const line of lines) {
      const m = line.match(/^(\d+)\s+step[s]?\s+([a-z-]+)\s*$/i);
      if (!m) continue;
      const count = parseInt(m[1], 10);
      const dirKey = m[2].toLowerCase().trim();
      if (!DIR_VECTORS[dirKey]) continue;
      directions.push({ count, direction: dirKey });
    }
    return directions;
  } catch (e) {
    console.error("[our_sync] Failed to load directions.txt", e.message);
    return [];
  }
}

function loadQuestions() {
  try {
    const filePath = path.join(__dirname, "questions.json");
    const raw = fs.readFileSync(filePath, "utf8");
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.filter((q) => q && (q.q || q.question) && (q.a || q.optionA) != null && (q.b || q.optionB) != null) : [];
  } catch (e) {
    console.error("[our_sync] Failed to load questions.json", e.message);
    return [];
  }
}

/** Get question by index (order in file). Cycles when index >= length. */
function getQuestionByIndex(questions, index) {
  if (!questions.length) return { q: "", a: "", b: "" };
  const i = index % questions.length;
  const one = questions[i];
  return {
    q: one.q || one.question || "",
    a: one.a ?? one.optionA ?? "",
    b: one.b ?? one.optionB ?? "",
  };
}

function computeTotalSteps(directions) {
  return directions.reduce((sum, d) => sum + (d.count || 0), 0);
}

function getAllowedDirectionsForRole(role) {
  const isPlayerA = role === ROLES.PLAYER1;
  const isPlayerB = role === ROLES.PLAYER2;
  if (!isPlayerA && !isPlayerB) return [];
  return isPlayerA ? PLAYER_A_DIRECTIONS : PLAYER_B_DIRECTIONS;
}

function ensureInstructionInterval(room) {
  if (room.ourSyncInstructionInterval) return;
  room.ourSyncInstructionInterval = room.clock.setInterval(() => {
    const payload = parsePayload(room.state);
    if (!payload || !payload.ourSyncActive) return;
    if (payload.gameState !== "PLAYING") return;
    payload.instructionVisible = !payload.instructionVisible;
    setPayload(room.state, payload);
  }, 2000);
}

function clearInstructionInterval(room) {
  if (room.ourSyncInstructionInterval) {
    room.ourSyncInstructionInterval.clear();
    room.ourSyncInstructionInterval = null;
  }
}

function applyOneStep(payload, directions, dirKey) {
  const vec = DIR_VECTORS[dirKey];
  if (!vec) return false;
  payload.cursorX = (payload.cursorX || 0) + vec.x;
  payload.cursorY = (payload.cursorY || 0) + vec.y;
  payload.currentStepIndex = (payload.currentStepIndex || 0) + 1;
  payload.remainingSteps = Math.max(0, (payload.remainingSteps || 0) - 1);
  if (payload.remainingSteps === 0) {
    const nextInstrIndex = (payload.currentInstructionIndex || 0) + 1;
    payload.currentInstructionIndex = nextInstrIndex;
    const nextInstr = directions[nextInstrIndex];
    payload.remainingSteps = nextInstr ? nextInstr.count : 0;
    payload.currentDirection = nextInstr ? nextInstr.direction : null;
  }
  return true;
}

function runBoostSteps(room, stageIndex) {
  const directions = loadDirections();
  let stepsLeft = BOOST_STEP_COUNT;

  function runOne() {
    const payload = parsePayload(room.state);
    if (!payload || !payload.ourSyncActive || payload.gameState !== "BOOSTING" || stepsLeft <= 0) return;

    const instrIndex = payload.currentInstructionIndex || 0;
    const instr = directions[instrIndex];
    if (!instr) {
      finalizeStage(room, payload, stageIndex);
      return;
    }

    payload.isBoostStep = true;
    applyOneStep(payload, directions, instr.direction);
    setPayload(room.state, payload);
    stepsLeft -= 1;

    // If that step finished the full directions list, complete the stage immediately.
    if (payload.remainingSteps === 0 && !directions[payload.currentInstructionIndex]) {
      finalizeStage(room, payload, stageIndex);
      return;
    }

    if (stepsLeft <= 0) {
      payload.gameState = "PLAYING";
      payload.isBoostStep = false;
      payload.boostJustFinished = true;
      setPayload(room.state, payload);
      return;
    }

    const nextInstr = directions[payload.currentInstructionIndex];
    if (!nextInstr) {
      finalizeStage(room, payload, stageIndex);
      return;
    }

    room.clock.setTimeout(runOne, BOOST_STEP_DELAY_MS);
  }

  room.clock.setTimeout(runOne, BOOST_STEP_DELAY_MS);
}

function initIfNeeded(room, state) {
  const payload = parsePayload(state);
  if (payload && payload.ourSyncActive) {
    ensureInstructionInterval(room);
    return payload;
  }

  const directions = loadDirections();
  const totalSteps = computeTotalSteps(directions);
  const firstInstr = directions[0];

  const next = {
    ...payload,
    ourSyncActive: true,
    gameState: "PLAYING",
    manualStepsInCycle: 0,
    cursorX: 4,
    cursorY: 1,
    currentStepIndex: 0,
    remainingSteps: firstInstr ? firstInstr.count : 0,
    currentInstructionIndex: 0,
    currentDirection: firstInstr ? firstInstr.direction : null,
    totalSteps,
    instructionVisible: true,
    lastMoveAtP1: 0,
    lastMoveAtP2: 0,
    lastWrongFor: null,
    questionText: null,
    optionA: null,
    optionB: null,
    player1Answer: null,
    player2Answer: null,
    lastAnswerMismatch: false,
    isBoostStep: false,
    boostJustFinished: false,
    nextQuestionIndex: 0,
  };

  setPayload(state, next);
  setStageTexts(state, COPY.initTvTitle || "", COPY.initPlayerHint || "לחצו על החצים לפי ההוראות במסך", COPY.initPlayerHint || "לחצו על החצים לפי ההוראות במסך");
  ensureInstructionInterval(room);
  return next;
}

function transitionToQuestion(room, payload) {
  const questions = loadQuestions();
  const index = payload.nextQuestionIndex ?? 0;
  const { q, a, b } = getQuestionByIndex(questions, index);
  payload.gameState = "QUESTION";
  payload.manualStepsInCycle = 0;
  payload.questionText = q;
  payload.optionA = a;
  payload.optionB = b;
  payload.player1Answer = null;
  payload.player2Answer = null;
  payload.lastAnswerMismatch = false;
  payload.nextQuestionIndex = questions.length ? (index + 1) % questions.length : 0;
  setPayload(room.state, payload);
  setStageTexts(room.state, q || "?", a || "A", b || "B");
}

function handleMove(room, client, data, stageIndex) {
  const role = client.userData?.role;
  if (role !== ROLES.PLAYER1 && role !== ROLES.PLAYER2) return false;

  let payload = parsePayload(room.state);
  if (!payload || !payload.ourSyncActive) payload = initIfNeeded(room, room.state);

  if (payload.boostJustFinished) {
    payload.boostJustFinished = false;
    setPayload(room.state, payload);
  }

  if (payload.gameState !== "PLAYING") {
    setPayload(room.state, payload);
    return true;
  }

  const now = Date.now();
  const tsKey = role === ROLES.PLAYER1 ? "lastMoveAtP1" : "lastMoveAtP2";
  if (now - (payload[tsKey] || 0) < 150) return true;
  payload[tsKey] = now;

  const directions = loadDirections();
  const instrIndex = payload.currentInstructionIndex || 0;
  const instr = directions[instrIndex];
  if (!instr) {
    finalizeStage(room, payload, stageIndex);
    return true;
  }

  const allowed = getAllowedDirectionsForRole(role);
  const dir = String((data && data.direction) || "").toLowerCase();
  const isAllowed = allowed.includes(dir);
  const isCorrect = dir === instr.direction;
  const isLastStepOfPath =
    (payload.remainingSteps || 0) === 1 &&
    instrIndex === directions.length - 1;

  if (!isLastStepOfPath && isAllowed && !isCorrect) {
    payload.lastWrongFor = role === ROLES.PLAYER1 ? "player1" : "player2";
    setPayload(room.state, payload);
    return true;
  }
  if (!isLastStepOfPath && (!isAllowed || !isCorrect)) {
    payload.lastWrongFor = null;
    setPayload(room.state, payload);
    return true;
  }
  if (isLastStepOfPath && !isCorrect) {
    payload.lastWrongFor = null;
    setPayload(room.state, payload);
    return true;
  }

  payload.lastWrongFor = null;
  payload.isBoostStep = false;
  applyOneStep(payload, directions, dir);
  payload.manualStepsInCycle = (payload.manualStepsInCycle || 0) + 1;

  if (payload.remainingSteps === 0) {
    const nextInstr = directions[payload.currentInstructionIndex];
    if (!nextInstr) {
      finalizeStage(room, payload, stageIndex);
      return true;
    }
  }

  if (payload.manualStepsInCycle >= MANUAL_STEPS_BEFORE_QUESTION) {
    setPayload(room.state, payload);
    room.clock.setTimeout(() => {
      const p = parsePayload(room.state);
      if (!p || !p.ourSyncActive || p.gameState !== "PLAYING") return;
      transitionToQuestion(room, p);
    }, DELAY_BEFORE_QUESTION_MS);
    return true;
  }

  setPayload(room.state, payload);
  return true;
}

function handleAnswer(room, client, data) {
  const role = client.userData?.role;
  if (role !== ROLES.PLAYER1 && role !== ROLES.PLAYER2) return false;

  const payload = parsePayload(room.state);
  if (!payload || payload.gameState !== "QUESTION") return false;

  const option = (data && (data.option ?? data.choice)) === "B" || data?.option === "b" ? "B" : "A";
  if (role === ROLES.PLAYER1) payload.player1Answer = option;
  if (role === ROLES.PLAYER2) payload.player2Answer = option;
  setPayload(room.state, payload);

  const p1 = payload.player1Answer;
  const p2 = payload.player2Answer;
  if (p1 == null || p2 == null) return true;

  const match = p1 === p2;
  payload.player1Answer = null;
  payload.player2Answer = null;

  if (match) {
    payload.gameState = "BOOSTING";
    setPayload(room.state, payload);
    setStageTexts(room.state, COPY.syncBoost || "Sync Boost", COPY.syncBoost || "Sync Boost", COPY.syncBoost || "Sync Boost");
    runBoostSteps(room, room.state.currentStageIndex);
  } else {
    payload.lastAnswerMismatch = true;
    setPayload(room.state, payload);
    setStageTexts(room.state, COPY.notSyncedMessage || "Not synced this time :(", COPY.notSyncedMessage || "Not synced this time :(", COPY.notSyncedMessage || "Not synced this time :(");
    room.clock.setTimeout(() => {
      const p = parsePayload(room.state);
      if (!p || !p.ourSyncActive) return;
      p.gameState = "PLAYING";
      p.lastAnswerMismatch = false;
      setPayload(room.state, p);
      setStageTexts(room.state, "", COPY.afterMismatchHint || "לחצו על החצים", COPY.afterMismatchHint || "לחצו על החצים");
    }, QUESTION_MISMATCH_DELAY_MS);
  }
  return true;
}

function onEnter(room, state) {
  initIfNeeded(room, state);
}

function onMessage(room, client, type, data, stageIndex) {
  if (type === "MOVE" || type === "move") return handleMove(room, client, data, stageIndex);
  if (type === "answer" || type === "ANSWER") return handleAnswer(room, client, data);
  return false;
}

function getInterimTitle() {
  return COPY.interimTitle || "Our Sync – Get ready to move together";
}

module.exports = {
  onEnter,
  onMessage,
  getInterimTitle,
};
