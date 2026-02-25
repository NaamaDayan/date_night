/**
 * Stage 1: "He Said She Said"
 *
 * - TV shows blurred image + title with both partner names.
 * - Server owns a local list of ~20 questions.
 * - For each question, both players answer privately: "Me" or partner's name.
 * - If answers match → image becomes less blurry.
 * - If answers don't match → image becomes more blurry.
 * - At any time, players can send a text guess ("what's in the image?").
 *   - Correct guess → stage ends immediately in WIN state.
 * - If image becomes perfectly clear before a correct guess:
 *   - Pause questions, ask both to write what is in the image.
 *   - First correct (or both answered with no correct) → stage ends.
 * - After stage ends, TV and phones show a results screen.
 *   - When any player taps "Continue", we advance to Stage 2.
 */

const { setStageTexts, getQuestionnaire, setPayload, parsePayload } = require("./IStage.js");
const { ROLES } = require("../../shared/constants.js");

const STAGE_INDEX = 1;
const BLUR_MIN = 0; // perfectly clear
const BLUR_MAX = 6; // maximum blur

// Closed-source question list lives only on the server.
// Questions are phrased so answers "Me" / partner-name make sense.
const QUESTIONS = [
  "Who drinks more coffee?",
  "Who is more likely to be late?",
  "Who sends more memes during the day?",
  "Who falls asleep faster on the couch?",
  "Who is more of a morning person?",
  "Who takes longer to get ready to go out?",
  "Who usually starts the arguments?",
  "Who apologizes first after a fight?",
  "Who plans the date nights more often?",
  "Who remembers important dates better?",
  "Who is more stubborn?",
  "Who is more likely to suggest ordering takeout?",
  "Who gets hangry more quickly?",
  "Who is more romantic on a daily basis?",
  "Who scrolls on their phone more in bed?",
  "Who is more adventurous with new foods?",
  "Who talks more during a movie?",
  "Who is more likely to forget where they parked?",
  "Who sings louder in the car?",
  "Who is more likely to plan a surprise?",
];

const TARGET_IMAGE_ANSWER = "eiffel tower"; // hidden phrase; server-side only

function normalizeGuess(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function isGuessCorrect(text) {
  const n = normalizeGuess(text);
  // loosely accept variations around the target phrase
  if (!n) return false;
  if (n === "eiffel" || n === "tower") return true;
  if (n.includes("eiffel") || n.includes("tower")) return true;
  if (n === TARGET_IMAGE_ANSWER) return true;
  return false;
}

function clampBlur(value) {
  const v = Number.isFinite(value) ? value : BLUR_MAX;
  if (v < BLUR_MIN) return BLUR_MIN;
  if (v > BLUR_MAX) return BLUR_MAX;
  return v;
}

function mapChoiceToPerson(role, choice) {
  // "me" = myself, "partner" = the other player
  if (choice !== "me" && choice !== "partner") return null;
  if (role === ROLES.PLAYER1) {
    return choice === "me" ? ROLES.PLAYER1 : ROLES.PLAYER2;
  }
  if (role === ROLES.PLAYER2) {
    return choice === "me" ? ROLES.PLAYER2 : ROLES.PLAYER1;
  }
  return null;
}

function pickNextQuestionIndex(currentIndex) {
  if (!Number.isInteger(currentIndex) || currentIndex < 0) return 0;
  return (currentIndex + 1) % QUESTIONS.length;
}

function buildInitialPayload() {
  return {
    phase: "questions",
    blurLevel: BLUR_MAX,
    currentQuestionIndex: 0,
    currentQuestion: QUESTIONS[0] || "",
    questionsAsked: 0,
    totalMatches: 0,
    totalMismatches: 0,
    lastPairMatched: null,
    stageComplete: false,
    win: false,
    winBy: null,
    winnerRole: null,
    winnerName: null,
    lastGuessText: "",
    lastGuessWrong: false,
    awaitingFinalAnswers: false,
    finalAnswerPlayer1: "",
    finalAnswerPlayer2: "",
    p1Choice: null,
    p2Choice: null,
    p1Answered: false,
    p2Answered: false,
  };
}

function applyTextsForPhase(room, state, payload) {
  const q = getQuestionnaire(room);
  const blurLevel = clampBlur(payload.blurLevel);
  const matches = payload.totalMatches || 0;
  const asked = payload.questionsAsked || 0;

  if (payload.phase === "finalPrompt") {
    setStageTexts(
      state,
      `He Said · She Said — ${q.partner1Name} & ${q.partner2Name}`,
      "התמונה כמעט ברורה. כתבו מה לדעתכם מופיע בה.",
      "התמונה כמעט ברורה. כתבו מה לדעתכם מופיע בה."
    );
    return;
  }

  if (payload.phase === "results") {
    const baseTitle = `He Said · She Said — ${q.partner1Name} & ${q.partner2Name}`;
    const stats = `Matches: ${matches}/${asked || 1} · Blur: ${blurLevel}/${BLUR_MAX}`;
    setStageTexts(
      state,
      `${baseTitle}`,
      stats,
      stats
    );
    return;
  }

  // Default: question phase
  setStageTexts(
    state,
    `He Said · She Said — ${q.partner1Name} & ${q.partner2Name}`,
    "ענו על השאלה בטלפון: \"אני\" או שם בן/בת הזוג.",
    "ענו על השאלה בטלפון: \"אני\" או שם בן/בת הזוג."
  );
}

function onEnter(room, state) {
  const payload = buildInitialPayload();
  setPayload(state, payload);
  applyTextsForPhase(room, state, payload);
}

function handleAnswer(room, client, payload, data) {
  if (payload.phase !== "questions" || payload.stageComplete) return false;
  const role = client.userData?.role;
  if (role !== ROLES.PLAYER1 && role !== ROLES.PLAYER2) return false;

  // Prevent double-answering the same question
  if (role === ROLES.PLAYER1 && payload.p1Answered) return true;
  if (role === ROLES.PLAYER2 && payload.p2Answered) return true;

  const rawChoice = data && typeof data.choice === "string" ? data.choice.toLowerCase() : "";
  const choice = rawChoice === "partner" ? "partner" : "me";

  if (role === ROLES.PLAYER1) {
    payload.p1Choice = choice;
    payload.p1Answered = true;
  } else if (role === ROLES.PLAYER2) {
    payload.p2Choice = choice;
    payload.p2Answered = true;
  }

  // Wait until both have answered this question
  if (!payload.p1Answered || !payload.p2Answered) {
    setPayload(room.state, payload);
    return true;
  }

  const p1Person = mapChoiceToPerson(ROLES.PLAYER1, payload.p1Choice);
  const p2Person = mapChoiceToPerson(ROLES.PLAYER2, payload.p2Choice);
  const match = p1Person && p2Person && p1Person === p2Person;

  const currentBlur = clampBlur(payload.blurLevel);
  let blurLevel = currentBlur;
  if (match) {
    payload.totalMatches = (payload.totalMatches || 0) + 1;
    blurLevel = clampBlur(currentBlur - 1);
  } else {
    payload.totalMismatches = (payload.totalMismatches || 0) + 1;
    blurLevel = clampBlur(currentBlur + 1);
  }

  payload.blurLevel = blurLevel;
  payload.questionsAsked = (payload.questionsAsked || 0) + 1;
  payload.lastPairMatched = !!match;

  // Reset per-question state for the next question
  payload.p1Choice = null;
  payload.p2Choice = null;
  payload.p1Answered = false;
  payload.p2Answered = false;

  if (blurLevel === BLUR_MIN) {
    payload.phase = "finalPrompt";
    payload.awaitingFinalAnswers = true;
  } else {
    const nextIndex = pickNextQuestionIndex(payload.currentQuestionIndex);
    payload.currentQuestionIndex = nextIndex;
    payload.currentQuestion = QUESTIONS[nextIndex] || "";
  }

  setPayload(room.state, payload);
  applyTextsForPhase(room, room.state, payload);
  return true;
}

function handleLiveGuess(room, client, payload, data) {
  if (payload.stageComplete) return false;
  const role = client.userData?.role;
  if (role !== ROLES.PLAYER1 && role !== ROLES.PLAYER2) return false;
  const text =
    data && data.text !== undefined
      ? data.text
      : data && data.guess !== undefined
      ? data.guess
      : "";

  payload.lastGuessWrong = false;

  if (!text || !String(text).trim()) {
    setPayload(room.state, payload);
    return true;
  }

  const q = getQuestionnaire(room);
  const correct = isGuessCorrect(text);

  if (payload.phase === "finalPrompt") {
    // Treat as final answers phase
    if (role === ROLES.PLAYER1 && !payload.finalAnswerPlayer1) {
      payload.finalAnswerPlayer1 = String(text);
    }
    if (role === ROLES.PLAYER2 && !payload.finalAnswerPlayer2) {
      payload.finalAnswerPlayer2 = String(text);
    }

    if (correct && !payload.stageComplete) {
      payload.stageComplete = true;
      payload.win = true;
      payload.winBy = "finalPrompt";
      payload.winnerRole = role;
      payload.winnerName = role === ROLES.PLAYER1 ? q.partner1Name : q.partner2Name;
      payload.lastGuessText = String(text);
      payload.phase = "results";
      payload.awaitingFinalAnswers = false;
    } else if (
      !correct &&
      !payload.stageComplete &&
      payload.finalAnswerPlayer1 &&
      payload.finalAnswerPlayer2
    ) {
      // Both answered, no correct guess → end without a winner
      payload.stageComplete = true;
      payload.win = false;
      payload.winBy = "finalPrompt";
      payload.phase = "results";
      payload.awaitingFinalAnswers = false;
    } else if (!correct) {
      payload.lastGuessWrong = true;
    }

    setPayload(room.state, payload);
    applyTextsForPhase(room, room.state, payload);
    return true;
  }

  // Live guess during question phase
  if (correct) {
    payload.stageComplete = true;
    payload.win = true;
    payload.winBy = "liveGuess";
    payload.winnerRole = role;
    payload.winnerName = role === ROLES.PLAYER1 ? q.partner1Name : q.partner2Name;
    payload.lastGuessText = String(text);
    payload.phase = "results";
    payload.awaitingFinalAnswers = false;
  } else {
    payload.lastGuessWrong = true;
  }

  setPayload(room.state, payload);
  applyTextsForPhase(room, room.state, payload);
  return true;
}

function onMessage(room, client, type, data) {
  const role = client.userData?.role;
  if (role !== ROLES.PLAYER1 && role !== ROLES.PLAYER2) return false;

  const payload = parsePayload(room.state);

  if (payload.stageComplete && type !== "continue") {
    return false;
  }

  if (type === "answer") {
    return handleAnswer(room, client, payload, data);
  }

  if (type === "imageGuess") {
    return handleLiveGuess(room, client, payload, data);
  }

  if (type === "continue") {
    // Results screen "Continue" – add to history and move to Stage 2
    const summary = {
      blurLevel: clampBlur(payload.blurLevel),
      totalMatches: payload.totalMatches || 0,
      totalMismatches: payload.totalMismatches || 0,
      questionsAsked: payload.questionsAsked || 0,
      win: !!payload.win,
      winBy: payload.winBy || null,
      winnerRole: payload.winnerRole || null,
      winnerName: payload.winnerName || null,
      lastGuessText: payload.lastGuessText || "",
      finalAnswerPlayer1: payload.finalAnswerPlayer1 || "",
      finalAnswerPlayer2: payload.finalAnswerPlayer2 || "",
    };
    room.addToHistory(STAGE_INDEX, summary);
    room.advanceToInterim(2);
    return true;
  }

  return false;
}

function getInterimTitle() {
  return "Get ready for Stage 2!";
}

module.exports = {
  stageIndex: STAGE_INDEX,
  onEnter,
  onMessage,
  getInterimTitle,
};
