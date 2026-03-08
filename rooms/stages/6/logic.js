/**
 * Stage 6: Final Stage – Physical movement puzzle.
 * TV shows True/False statements with player names (from name entry). Both players answer;
 * when both have answered, if answers match → both get next movement step; else stay in place.
 * Player A path = 5, Player B path = 2. Stage ends when both correctly identify their digit.
 */

const { setStageTexts, setPayload, parsePayload, addWelcomeState, handleWelcomeReady } = require("../IStage.js");
const { ROLES } = require("../../../shared/constants.js");
const { applyTemplate, SHARED } = require("../sharedCopy.js");
const COPY = require("./copy.js");
const coupleStatements = require("./data/coupleStatements.js");
const { playerAPath, playerBPath } = require("./data/movementPaths.js");

const STAGE_INDEX = 6;
const STEPS_NEEDED = 5;
const TOTAL_QUESTIONS = 14;
const PLAYER_A_CORRECT_NUMBER = 5;
const PLAYER_B_CORRECT_NUMBER = 2;
const FALLBACK_PLAYER_A = "שחקן א";
const FALLBACK_PLAYER_B = "שחקן ב";

const DIRECTION_COPY = {
  LEFT: COPY.directionLeft,
  RIGHT: COPY.directionRight,
  UP: COPY.directionUp,
  DOWN: COPY.directionDown,
};

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function directionLabel(dir) {
  return DIRECTION_COPY[dir] || dir;
}

function startPlaying(room, state, payload) {
  payload.welcomeStatus = "playing";
  payload.phase = "question";
  payload.trueAnswersCount = 0;
  payload.questionsUsed = 0;
  payload.questionList = coupleStatements;
  payload.questionOrder = shuffleArray(coupleStatements.map((_, i) => i));
  payload.currentQuestionIndex = 0;
  payload.player1AnswerCurrent = null;
  payload.player2AnswerCurrent = null;
  payload.playerAStepHistory = [];
  payload.playerBStepHistory = [];
  payload.playerASubmittedNumber = null;
  payload.playerBSubmittedNumber = null;
  payload.stageCompleted = false;
  payload.fallbackRevealed = false;
  payload.funFactStartTime = null;
  payload.countdownEndTime = null;
  payload.endGameScreen = false;
  payload.lastTrueAnimationUntil = 0;
  setPayload(state, payload);
  applyQuestion(room.state, payload);
  applyPhoneTexts(room.state, payload);
}

function applyQuestion(state, payload) {
  const idx = payload.currentQuestionIndex;
  const order = payload.questionOrder || [];
  const questionIndex = order[idx];
  const template = questionIndex != null && coupleStatements[questionIndex]
    ? coupleStatements[questionIndex]
    : "";
  const playerA = (state.player1Name && state.player1Name.trim()) || FALLBACK_PLAYER_A;
  const playerB = (state.player2Name && state.player2Name.trim()) || FALLBACK_PLAYER_B;
  const statement = applyTemplate(template, { playerA, playerB });
  state.tvText = statement || COPY.emptyStatement;
}

function applyPhoneTexts(state, payload) {
  const aSteps = payload.playerAStepHistory || [];
  const bSteps = payload.playerBStepHistory || [];
  const stepA = aSteps.length;
  const stepB = bSteps.length;
  const nextA = playerAPath[stepA];
  const nextB = playerBPath[stepB];
  const labelA = nextA ? directionLabel(nextA) : "";
  const labelB = nextB ? directionLabel(nextB) : "";
  const p1Answered = payload.player1AnswerCurrent != null;
  const p2Answered = payload.player2AnswerCurrent != null;
  const waitingForPartner = COPY.waitingForPartnerAnswer || "מחכים לבן/בת הזוג לענות";

  if (p1Answered && !p2Answered) {
    state.player1Text = waitingForPartner;
    state.player2Text = stepB < STEPS_NEEDED && labelB
      ? applyTemplate(COPY.moveInstructionTemplate, { direction: labelB })
      : stepB >= STEPS_NEEDED
        ? COPY.stepsComplete
        : COPY.waitingForTrue;
  } else if (p2Answered && !p1Answered) {
    state.player1Text = stepA < STEPS_NEEDED && labelA
      ? applyTemplate(COPY.moveInstructionTemplate, { direction: labelA })
      : stepA >= STEPS_NEEDED
        ? COPY.stepsComplete
        : COPY.waitingForTrue;
    state.player2Text = waitingForPartner;
  } else if (payload.lastAnswerFalse) {
    state.player1Text = COPY.stayInPlace;
    state.player2Text = COPY.stayInPlace;
  } else {
    state.player1Text = stepA < STEPS_NEEDED && labelA
      ? applyTemplate(COPY.moveInstructionTemplate, { direction: labelA })
      : stepA >= STEPS_NEEDED
        ? COPY.stepsComplete
        : COPY.waitingForTrue;
    state.player2Text = stepB < STEPS_NEEDED && labelB
      ? applyTemplate(COPY.moveInstructionTemplate, { direction: labelB })
      : stepB >= STEPS_NEEDED
        ? COPY.stepsComplete
        : COPY.waitingForTrue;
  }
}

function giveNextSteps(room, state, payload) {
  const trueCount = payload.trueAnswersCount ?? 0;
  const aSteps = payload.playerAStepHistory || [];
  const bSteps = payload.playerBStepHistory || [];
  if (trueCount > aSteps.length && aSteps.length < STEPS_NEEDED) {
    const next = playerAPath[aSteps.length];
    if (next) payload.playerAStepHistory = [...aSteps, next];
  }
  if (trueCount > bSteps.length && bSteps.length < STEPS_NEEDED) {
    const next = playerBPath[bSteps.length];
    if (next) payload.playerBStepHistory = [...payload.playerBStepHistory || [], next];
  }
}

function onEnter(room, state) {
  const payload = parsePayload(state);
  const hasState = payload.phase && payload.welcomeStatus !== "welcome";

  if (!hasState) {
    const welcomePayload = addWelcomeState({});
    welcomePayload.phase = undefined;
    setPayload(state, welcomePayload);
  } else {
    applyQuestion(state, payload);
    applyPhoneTexts(state, payload);
  }
}

function onMessage(room, client, type, data) {
  const role = client.userData?.role;
  if (type === "playerReady") {
    return handleWelcomeReady(room, client, startPlaying);
  }

  const payload = parsePayload(room.state);
  if (payload.welcomeStatus === "welcome") return false;

  if (role !== ROLES.PLAYER1 && role !== ROLES.PLAYER2) return false;

  if (payload.phase === "question" && (type === "answerTrue" || type === "answerFalse")) {
    const isTrue = type === "answerTrue";
    if (role === ROLES.PLAYER1) payload.player1AnswerCurrent = isTrue;
    if (role === ROLES.PLAYER2) payload.player2AnswerCurrent = isTrue;
    setPayload(room.state, payload);
    applyPhoneTexts(room.state, payload);

    const p1 = payload.player1AnswerCurrent;
    const p2 = payload.player2AnswerCurrent;
    if (p1 == null || p2 == null) return true;

    const match = p1 === p2;
    payload.questionsUsed = (payload.questionsUsed || 0) + 1;
    payload.lastAnswerFalse = !match;
    if (match) {
      payload.lastTrueAnimationUntil = Date.now() + 2500;
      payload.trueAnswersCount = (payload.trueAnswersCount || 0) + 1;
      giveNextSteps(room, room.state, payload);
      room.state.tvText = COPY.correctKeepGoing;
    }
    payload.player1AnswerCurrent = null;
    payload.player2AnswerCurrent = null;
    payload.currentQuestionIndex = (payload.currentQuestionIndex || 0) + 1;
    setPayload(room.state, payload);

    if (payload.questionsUsed >= TOTAL_QUESTIONS && (payload.trueAnswersCount || 0) < STEPS_NEEDED) {
      payload.fallbackRevealed = true;
      while ((payload.playerAStepHistory || []).length < STEPS_NEEDED) {
        const next = playerAPath[payload.playerAStepHistory.length];
        if (next) payload.playerAStepHistory = [...(payload.playerAStepHistory || []), next];
        else break;
      }
      while ((payload.playerBStepHistory || []).length < STEPS_NEEDED) {
        const next = playerBPath[payload.playerBStepHistory.length];
        if (next) payload.playerBStepHistory = [...(payload.playerBStepHistory || []), next];
        else break;
      }
      payload.phase = "readyToGuess";
      setPayload(room.state, payload);
      setStageTexts(room.state, COPY.stepsComplete, COPY.stepsComplete, COPY.stepsComplete);
      return true;
    }

    if ((payload.trueAnswersCount || 0) >= STEPS_NEEDED) {
      const aDone = (payload.playerAStepHistory || []).length >= STEPS_NEEDED;
      const bDone = (payload.playerBStepHistory || []).length >= STEPS_NEEDED;
      if (aDone && bDone) {
        payload.phase = "readyToGuess";
        setPayload(room.state, payload);
        setStageTexts(room.state, COPY.stepsComplete, COPY.stepsComplete, COPY.stepsComplete);
        return true;
      }
    }

    applyQuestion(room.state, payload);
    applyPhoneTexts(room.state, payload);
    return true;
  }

  if (type === "funFactStart" && payload.phase === "success") {
    payload.phase = "funFact";
    payload.funFactStartTime = Date.now();
    setPayload(room.state, payload);
    return true;
  }
  if (type === "funFactEnd" && payload.phase === "funFact") {
    payload.phase = "endGame";
    setPayload(room.state, payload);
    return true;
  }
  if (type === "gameComplete" && payload.phase === "endGame") {
    if (role === ROLES.PLAYER1) payload.player1GameComplete = true;
    if (role === ROLES.PLAYER2) payload.player2GameComplete = true;
    setPayload(room.state, payload);
    if (payload.player1GameComplete && payload.player2GameComplete) {
      room.advanceToInterim(7);
    }
    return true;
  }

  if ((payload.phase === "guessNumber" || payload.phase === "readyToGuess") && type === "submitNumber") {
    const num = data?.number ?? data?.value ?? data;
    const n = Number(num);
    if (!Number.isInteger(n) || n < 0 || n > 9) return true;

    if (role === ROLES.PLAYER1) {
      if (n === PLAYER_A_CORRECT_NUMBER) {
        payload.playerACorrect = true;
        payload.playerASubmittedNumber = n;
        room.state.player1Text = SHARED.greatWaitPartner;
      } else {
        room.state.player1Text = COPY.tryAgain;
      }
    }
    if (role === ROLES.PLAYER2) {
      if (n === PLAYER_B_CORRECT_NUMBER) {
        payload.playerBCorrect = true;
        payload.playerBSubmittedNumber = n;
        room.state.player2Text = SHARED.greatWaitPartner;
      } else {
        room.state.player2Text = COPY.tryAgain;
      }
    }
    setPayload(room.state, payload);

    if (payload.playerACorrect && payload.playerBCorrect) {
      payload.stageCompleted = true;
      payload.phase = "success";
      setPayload(room.state, payload);
      setStageTexts(room.state, COPY.successHeadline, COPY.successShort, COPY.successShort);
      room.clock.setTimeout(() => {
        const p = parsePayload(room.state);
        if (p.phase === "success") {
          p.phase = "funFact";
          p.funFactStartTime = Date.now();
          setPayload(room.state, p);
        }
      }, 6000);
    }
    return true;
  }

  return false;
}

function getInterimTitle() {
  return COPY.interimTitle;
}

module.exports = {
  stageIndex: STAGE_INDEX,
  onEnter,
  onMessage,
  getInterimTitle,
};
